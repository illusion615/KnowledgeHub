"""Custom AR + Flow-Matching sampling pipeline for MiniMax-Music3 MLX."""
from __future__ import annotations

import time
from typing import Any, Callable


def step_one_frame(
    model: Any,
    last_hidden: Any,
    cache: Any,
    rng_key: Any,
    *,
    emit_frame: bool,
    ar_cfg: float,
    ar_top_k: int,
    temperature: float,
) -> Any:
    """Decode one 25 Hz semantic + 7-layer RVQ audio frame with custom CFG, Top-K, and temperature."""
    import mlx.core as mx
    from mlx_audio.music.models.minimax_music3.ar import (
        ARFrame,
        _embed_audio_frame,
        lm_logits,
        qwen3_hidden,
    )
    from mlx_audio.music.models.minimax_music3.fusion import fuse_frame_hiddens
    from mlx_audio.music.models.minimax_music3.sampling import sample_top_k

    cfg = model.config
    logits = lm_logits(model.language_model, last_hidden).astype(mx.float32)
    token_ids = mx.arange(logits.shape[-1])
    allowed = mx.logical_or(
        mx.logical_and(
            token_ids >= cfg.audio_code_offset,
            token_ids < cfg.audio_code_offset + cfg.semantic_vocab_size,
        ),
        token_ids == cfg.audio_end_token_id,
    )
    logits = mx.where(allowed[None, :], logits, -1e9)
    conditional, unconditional = logits[:1], logits[1:2]
    guided = unconditional + (conditional - unconditional) * ar_cfg
    k_mask = min(ar_top_k, conditional.shape[-1])
    threshold = mx.min(mx.topk(conditional, k_mask, axis=-1), axis=-1, keepdims=True)
    guided = mx.where(conditional < threshold, -1e9, guided)
    guided = mx.where(allowed[None, :], guided / temperature, -1e9)
    sampled, next_key = sample_top_k(guided, rng_key, ar_top_k)

    if int(sampled.item()) == cfg.audio_end_token_id:
        return ARFrame(
            semantic_code=sampled,
            residual_codes=mx.zeros((2, cfg.residual_codebooks), dtype=mx.int32),
            frame_hidden=mx.zeros((1, cfg.num_codebooks * cfg.hidden_size)),
            last_hidden=last_hidden,
            cache=cache,
            ended=True,
        )

    semantic_code = mx.concatenate([sampled, sampled], axis=0) - cfg.audio_code_offset
    frame_codes, depth_hidden = _decode_residual_codebooks(
        model,
        last_hidden,
        semantic_code,
        next_key,
        ar_cfg=ar_cfg,
        ar_top_k=ar_top_k,
        temperature=temperature,
    )
    frame_hidden = (
        fuse_frame_hiddens(last_hidden[:1], depth_hidden)
        if emit_frame
        else mx.zeros((1, cfg.num_codebooks * cfg.hidden_size))
    )
    feedback = _embed_audio_frame(model.language_model, model.rvq_depth_decoder, cfg, frame_codes)
    hid_next, cache = qwen3_hidden(model.language_model, feedback, cache)
    return ARFrame(
        semantic_code=semantic_code,
        residual_codes=frame_codes[:, 1:],
        frame_hidden=frame_hidden,
        last_hidden=hid_next[:, -1],
        cache=cache,
        ended=False,
    )


def _decode_residual_codebooks(
    model: Any,
    last_hidden: Any,
    semantic_code: Any,
    rng_key: Any,
    *,
    ar_cfg: float,
    ar_top_k: int,
    temperature: float,
) -> tuple[Any, Any]:
    import mlx.core as mx
    from mlx_audio.music.models.minimax_music3.sampling import sample_top_k

    cfg = model.config
    depth_dec = model.rvq_depth_decoder
    seq = [
        depth_dec.projection(last_hidden)[:, None, :],
        depth_dec.projection(
            model.language_model.model.embed_tokens(semantic_code + cfg.audio_code_offset)
        )[:, None, :],
    ]
    codes = [semantic_code]
    hidden_parts = []
    next_key = rng_key

    for idx in range(1, cfg.num_codebooks):
        d_hid = depth_dec(mx.concatenate(seq, axis=1))[:, -1]
        hidden_parts.append(d_hid[:1])
        d_logits = depth_dec.audio_heads[idx - 1](d_hid).astype(mx.float32)
        d_guided = (d_logits[1:2] + (d_logits[:1] - d_logits[1:2]) * ar_cfg) / temperature
        d_sampled, next_key = sample_top_k(d_guided, next_key, ar_top_k)
        code = mx.concatenate([d_sampled, d_sampled], axis=0)
        codes.append(code)
        if idx < cfg.num_codebooks - 1:
            emb = depth_dec.audio_embeddings(code + (idx - 1) * cfg.audio_vocab_size)
            seq.append(depth_dec.projection(emb)[:, None, :])

    return mx.stack(codes, axis=1), mx.concatenate(hidden_parts, axis=-1)


def _rollout_ar_frames(
    model: Any,
    req: dict[str, Any],
    cb: Callable[[dict[str, Any]], None],
) -> Any:
    import mlx.core as mx
    from mlx_audio.music.models.minimax_music3.ar import qwen3_hidden

    cfg = model.config
    max_frames = max(1, int(req['duration'] * cfg.frame_rate))
    text_ids = model._text_ids(req['prompt'], req['lyrics'])
    mx.random.seed(req['seed'])
    key = mx.random.key(req['seed'])
    embeddings = model.language_model.model.embed_tokens(text_ids)
    hidden, cache = qwen3_hidden(model.language_model, embeddings)
    last_hidden = hidden[:, -1]

    frames_list = []
    ar_start = time.perf_counter()
    cb({'stage': 'ar_start', 'max_frames': max_frames, 'max_seconds': req['duration']})
    ended_by_eos = False

    for frame_index in range(max_frames + 1):
        key, subkey = mx.random.split(key)
        res = step_one_frame(
            model,
            last_hidden,
            cache,
            subkey,
            emit_frame=frame_index > 0,
            ar_cfg=float(req['ar_cfg_scale']),
            ar_top_k=int(req['ar_top_k']),
            temperature=float(req['temperature']),
        )
        last_hidden, cache = res.last_hidden, res.cache
        if res.ended:
            ended_by_eos = True
            break
        if frame_index > 0:
            frames_list.append(res.frame_hidden)
            if len(frames_list) % 125 == 0:
                mx.eval(res.frame_hidden)
                cb({
                    'stage': 'ar_progress',
                    'frames': len(frames_list),
                    'max_frames': max_frames,
                    'audio_seconds': round(len(frames_list) / cfg.frame_rate, 1),
                    'elapsed_seconds': round(time.perf_counter() - ar_start, 1),
                })
            if len(frames_list) >= max_frames:
                break

    if not frames_list:
        raise RuntimeError('MiniMax-Music3 generated zero audio frames')
    frame_hiddens = mx.stack(frames_list, axis=1)
    mx.eval(frame_hiddens)
    total_ar_frames = int(frame_hiddens.shape[1])
    cb({
        'stage': 'ar_done',
        'frames': total_ar_frames,
        'audio_seconds': round(total_ar_frames / cfg.frame_rate, 2),
        'ended_by_eos': ended_by_eos,
        'elapsed_seconds': round(time.perf_counter() - ar_start, 1),
    })
    return frame_hiddens


def run_custom_generation(
    model: Any,
    req: dict[str, Any],
    progress_cb: Callable[[dict[str, Any]], None] | None = None,
) -> tuple[Any, int]:
    """Execute AR rollout + overlapped DiT flow-matching chunks with custom hyperparameters."""
    import mlx.core as mx
    import numpy as np
    from mlx_audio.music.models.minimax_music3.config import (
        CHUNK_FRAMES,
        OVERLAP_LATENT_LENGTH,
    )
    from mlx_audio.music.models.minimax_music3.euler import denoise_chunk
    from mlx_audio.music.models.minimax_music3.minimax_music3 import _chunk_starts, _crop_waveform

    cb = progress_cb if callable(progress_cb) else (lambda _evt: None)
    cfg = model.config
    dit_cfg = float(req['dit_cfg_scale'])
    frame_hiddens = _rollout_ar_frames(model, req, cb)
    total_ar_frames = int(frame_hiddens.shape[1])

    starts = _chunk_starts(total_ar_frames)
    waves = []
    previous_latent = None
    previous_condition = None
    mx.random.seed(req['seed'] + 7)
    flow_start = time.perf_counter()

    for chunk_idx, start_f in enumerate(starts):
        end_f = min(start_f + CHUNK_FRAMES, total_ar_frames)
        condition = model.condition_encoder(frame_hiddens[:, start_f:end_f])
        noise = mx.random.normal((1, cfg.dit_in_channels, condition.shape[1])).astype(condition.dtype)
        latents, condition = denoise_chunk(
            model.transformer,
            noise,
            condition,
            num_inference_steps=req['steps'],
            guidance_scale=dit_cfg,
            previous_latent=previous_latent,
            previous_condition=previous_condition,
        )
        carry_start = max(0, latents.shape[-1] - 2 * OVERLAP_LATENT_LENGTH)
        carry_end = max(carry_start, latents.shape[-1] - OVERLAP_LATENT_LENGTH)
        previous_latent = latents[..., carry_start:carry_end]
        previous_condition = condition[:, carry_start:carry_end]
        waves.append(model.vocoder(latents))
        mx.eval(waves[-1])
        cb({
            'stage': 'dit_chunk',
            'chunk': chunk_idx + 1,
            'total_chunks': len(starts),
            'elapsed_seconds': round(time.perf_counter() - flow_start, 1),
        })

    audio = mx.concatenate(
        [_crop_waveform(wave, idx, len(waves)) for idx, wave in enumerate(waves)],
        axis=-1,
    )
    mx.eval(audio)
    waveform = mx.clip(audio[0].transpose(1, 0).astype(mx.float32), -1.0, 1.0)
    if not np.isfinite(np.asarray(waveform)).all():
        raise RuntimeError('MiniMax-Music3 produced non-finite audio')
    return waveform, int(model.sample_rate)
