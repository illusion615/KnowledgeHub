"""NanoJev's full decision graph in MLX, not a chat-generating Qwen wrapper.

Decision-head computation follows the MIT upstream DecisionModel at
71a513bb0163b5634467842b523ee0c0ed6fb1c7; see NOTICE.md.
"""
import math
import mlx.core as mx
import mlx.nn as nn
from mlx_lm.models.qwen3 import ModelArgs, Qwen3Model


def backbone_args(config):
    config = dict(config)
    rope = config.get('rope_parameters', {})
    if 'rope_theta' not in config:
        if rope.get('rope_type', 'default') != 'default':
            raise ValueError('Only the audited default RoPE is supported')
        config['rope_theta'] = rope.get('rope_theta', 1000000)
    if config.get('model_type') != 'qwen3' or config.get('attention_bias', False):
        raise ValueError('Expected the audited Qwen3 backbone')
    return ModelArgs.from_dict(config)


class TorchCompatibleSetAttention(nn.Module):
    """PyTorch packed QKV parameter names; no heads are discarded or synthesized."""
    def __init__(self, width=128, heads=4):
        super().__init__()
        self.in_proj_weight = mx.zeros((3 * width, width))
        self.in_proj_bias = mx.zeros((3 * width,))
        self.out_proj = nn.Linear(width, width)
        self._heads = heads
        self._width = width

    def __call__(self, values, valid):
        batch, length, _ = values.shape
        projected = values @ self.in_proj_weight.T + self.in_proj_bias
        q, k, v = mx.split(projected, 3, axis=-1)
        q, k, v = [x.reshape(batch, length, self._heads, self._width // self._heads).transpose(0, 2, 1, 3) for x in (q, k, v)]
        mask = mx.where(valid[:, None, None, :], mx.array(0, dtype=q.dtype), mx.array(-float('inf'), dtype=q.dtype))
        mixed = mx.fast.scaled_dot_product_attention(q, k, v, scale=(self._width // self._heads) ** -0.5, mask=mask)
        mixed = mixed.transpose(0, 2, 1, 3).reshape(batch, length, self._width)
        return self.out_proj(mixed)


class NanoJevMLX(nn.Module):
    def __init__(self, args, set_head='attention'):
        super().__init__()
        if set_head not in ('none', 'attention'):
            raise ValueError('Unsupported decision-head configuration')
        self.backbone = Qwen3Model(args)
        self.norm = nn.LayerNorm(args.hidden_size, eps=1e-5)
        self.scalar = nn.Linear(args.hidden_size, 1)
        self._set_head = set_head
        if set_head == 'attention':
            self.set_project = nn.Linear(args.hidden_size + 1, 128)
            self.set_attention = TorchCompatibleSetAttention()
            self.set_output = nn.Linear(128, 1)

    def encode_paths(self, paths, pad_token, path_batch_size=16):
        """Right pad only; valid causal positions cannot attend to future padding.

        Pool the final REAL EOS rather than the last padded position. This
        matches upstream's causal+key-padding semantics for the selected states.
        No KV cache, chat template, vocabulary head, or decode loop is used.
        """
        pooled = []
        for start in range(0, len(paths), path_batch_size):
            group = paths[start:start + path_batch_size]
            lengths = [len(ids) for ids in group]
            width = max(lengths)
            tokens = mx.array([ids + [pad_token] * (width - len(ids)) for ids in group], dtype=mx.int32)
            hidden = self.backbone(tokens)
            leaves = hidden[mx.arange(len(group)), mx.array(lengths) - 1]
            mx.eval(leaves)
            pooled.append(leaves)
        return mx.concatenate(pooled, axis=0)

    def read_heads(self, leaves, examples):
        kmax = max(len(ex['candidate_ids']) for ex in examples)
        rows, masks, offset = [], [], 0
        for ex in examples:
            count = len(ex['leaf_tokens'])
            row = leaves[offset:offset + count]
            rows.append(mx.pad(row, ((0, kmax - count), (0, 0))))
            masks.append([i < len(ex['candidate_ids']) for i in range(kmax)])
            offset += count
        h = self.norm(mx.stack(rows))
        valid = mx.array(masks)
        z = self.scalar(h).squeeze(-1).astype(mx.float32)
        choices = [i for i, ex in enumerate(examples) if ex['type'] == 'choice']
        if self._set_head == 'attention' and choices:
            indices = mx.array(choices)
            subset = h[indices]
            log_k = mx.log(valid[indices].sum(-1).astype(mx.float32))[:, None, None]
            log_k = mx.broadcast_to(log_k, (len(choices), kmax, 1)).astype(h.dtype)
            u = self.set_project(mx.concatenate([subset, log_k], axis=-1))
            mixed = self.set_attention(u, valid[indices])
            delta = self.set_output(mx.tanh(u + mixed)).squeeze(-1).astype(mx.float32)
            z = z.at[indices].add(delta)
        output = []
        for i, ex in enumerate(examples):
            if ex['type'] == 'boolean':
                output.append(mx.stack([z[i, 0] * 0, z[i, 0]]))
            else:
                output.append(z[i, :len(ex['candidate_ids'])])
        return output

    def __call__(self, examples, pad_token, path_batch_size=16):
        paths = [ids for ex in examples for ids in ex['leaf_tokens']]
        return self.read_heads(self.encode_paths(paths, pad_token, path_batch_size), examples)


def map_quantized_weights(weights):
    mapped = {}
    for name, value in weights.items():
        if name.endswith('.weight.scales'):
            name = name[:-len('.weight.scales')] + '.scales'
        elif name.endswith('.weight.biases'):
            name = name[:-len('.weight.biases')] + '.biases'
        if name in mapped:
            raise ValueError('Duplicate key after quantization mapping')
        mapped[name] = value
    return mapped


def install_weights(model, weights, dtype=mx.float32, dequantize=False):
    """Strict load of every tensor. Optional dequantization is for validation only."""
    quantized = any(name.endswith('.weight.scales') for name in weights)
    if quantized and dequantize:
        restored = {}
        for name, value in weights.items():
            if name.endswith(('.weight.scales', '.weight.biases')):
                continue
            if name + '.scales' in weights:
                value = mx.dequantize(value, scales=weights[name + '.scales'].astype(mx.float32), biases=weights[name + '.biases'].astype(mx.float32), group_size=64, bits=4, mode='affine')
            restored[name] = value.astype(mx.float32) if mx.issubdtype(value.dtype, mx.floating) else value
        mapped = restored
    elif quantized:
        def predicate(name, module):
            return isinstance(module, (nn.Linear, nn.Embedding)) and name + '.weight.scales' in weights
        nn.quantize(model, group_size=64, bits=4, mode='affine', class_predicate=predicate)
        mapped = map_quantized_weights(weights)
    else:
        mapped = weights
    model.load_weights(list(mapped.items()), strict=True)
    model.set_dtype(dtype)  # Only floating parameters; packed uint32 weights stay packed.
    model.eval()
    mx.eval(model.parameters())
    return {'quantized': quantized, 'dequantized_reference': bool(quantized and dequantize), 'strict_loading': True, 'loaded_tensor_count': len(mapped)}
