"""Pinned, local-only Laya adapter. No oMLX changes or silent truncation."""
import hashlib
import importlib.metadata
import math
from pathlib import Path
import time
from nanojev_mlx.contract import parse_json, validate_request, MAX_TOTAL_TOKENS

PROFILES = {
    'multilingual': {'model': 'aac6fef/laya-multilingual-mlx', 'sha': '7fc5834af4d8fdfb268d272a9d1a66e5819a0daac98241651c4c888cc43adff1', 'manifest': 'deb2de8ec6b1520b74866249bda632f40501440cdac29fdd90af80a3c422c778'},
    'typed-decisions': {'model': 'aac6fef/laya-typed-decisions-mlx', 'sha': '804ef8802b4cac7a67913b0cfb8448659e934a50284aaa867b98d7d9a6e7d1e0', 'manifest': '393f58c941c55ce29717f7550a75df78e0e8a412fc785cd9637f2728b72090f3'},
}

def digest(file):
    h = hashlib.sha256()
    with file.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''): h.update(chunk)
    return h.hexdigest()

def verify_files(directory, profile):
    root = Path(directory).expanduser().resolve()
    if digest(root / 'manifest.json') != profile['manifest']: raise ValueError('manifest_mismatch')
    manifest = parse_json((root / 'manifest.json').read_text())
    if manifest['repository'] != profile['model']: raise ValueError('model_mismatch')
    for rel, item in manifest['files'].items():
        f = root / rel
        if not f.resolve().is_relative_to(root) or not f.is_file() or f.stat().st_size != item['bytes'] or digest(f) != item['sha256']: raise ValueError('file_mismatch')
    if manifest['files']['model.safetensors']['sha256'] != profile['sha']: raise ValueError('weights_mismatch')
    return root

def prepare_payload(agent, payload, render_options, serialize_state):
    """Check all states before any forward pass; upstream truncation is forbidden."""
    rows = validate_request(payload)
    plans, total = [], 0
    for row in rows:
        questions = {}
        expected = []
        for qid, original in row['questions'].items():
            q = dict(original)
            if q['type'] == 'boolean': q['type'] = 'noul'
            if q['type'] == 'choice' and len(q['criteria']) > 20: raise ValueError('choice_limit')
            internal = agent._to_internal(q)
            options = render_options(internal)
            state = serialize_state(row['state'])
            if any(agent.tok.mask_token in x for x in [state, internal['ins'], *options]): raise ValueError('reserved_token')
            encode = lambda s: agent.tok(s, add_special_tokens=False)['input_ids']
            option_ids = [encode(' ' + text) for text in options]
            if any(len(x) > 48 for x in option_ids): raise ValueError('option_would_truncate')
            budget = agent.cfg['head_max_len'] - sum(1 + len(x) for x in option_ids)
            head = encode(internal['t'] + ' question: ' + internal['ins'])
            if budget < 16 or len(head) > max(8, budget): raise ValueError('question_would_truncate')
            ids = [agent.tok.cls_token_id] + head + [agent.tok.sep_token_id]
            for option in option_ids: ids += [agent.tok.mask_token_id] + option
            ids += [agent.tok.sep_token_id] + encode(state) + [agent.tok.sep_token_id]
            if len(ids) > agent.cfg['max_len']: raise ValueError('state_would_truncate')
            expected.append(ids)
            questions[qid] = q
        items, _ = agent.prepare(row['state'], questions)
        if [x['ids'] for x in items] != expected: raise ValueError('encoding_mismatch')
        tokens = sum(map(len, expected));total += tokens
        plans.append((row, questions, tokens))
    if total > MAX_TOTAL_TOKENS: raise ValueError('request_token_limit')
    return plans, total

class LayaEngine:
    def __init__(self, directory, variant):
        self.profile = PROFILES[variant]
        self.directory = verify_files(directory, self.profile)
        self.versions = {k: importlib.metadata.version(k) for k in ['laya-mlx','mlx','tokenizers']}
        if self.versions['laya-mlx'] != '0.2.0' or self.versions['mlx'] != '0.32.2': raise ValueError('runtime_version_mismatch')
        import mlx.core as mx
        import laya_mlx
        from laya_mlx.common import render_options, serialize_state
        self.mx, self.render_options, self.serialize_state = mx, render_options, serialize_state
        mx.set_cache_limit(256 * 1024**2)
        self.agent = laya_mlx.load(str(self.directory), device='gpu', dtype='float16', batch_size=16)
        self.calls = 0
        self.memory = int(mx.get_active_memory())
    def health(self):
        return {'backend':'study-room-laya-mlx-v1','ready':True,'model_loaded':True,'model':self.profile['model'],'weights_sha256':self.profile['sha'],'manifest_sha256':self.profile['manifest'],'device':'mlx-metal-gpu','activation_dtype':'float16','max_length':self.agent.cfg['max_len'],'head_max_length':self.agent.cfg['head_max_len'],'max_choice_options':20,'model_memory_bytes':self.memory,'network_model_calls':0,'runtime_versions':self.versions,'truncation_policy':'reject_before_inference'}
    def predict(self, payload):
        began=time.perf_counter()
        plans, tokens = prepare_payload(self.agent,payload,self.render_options,self.serialize_state)
        states=[];forwards=0
        for row, questions, count in plans:
            result=self.agent.predict(row['state'],questions)
            if result['usage'] != {'input_tokens':count,'output_tokens':0}: raise ValueError('usage_mismatch')
            states.append({'id':row['id'],'answers':result['answers']})
            forwards += math.ceil(len(questions)/self.agent.batch_size)
        self.calls += 1
        return {'schema_version':'study-room-laya-mlx-v1','model':self.profile['model'],'checkpoint':{'weights_sha256':self.profile['sha'],'manifest_sha256':self.profile['manifest'],'strict_loading':True},'states':states,'usage':{'input_tokens':tokens,'output_tokens':0},'rounding':{'probabilityDecimals':4,'scoreDecimals':4},'execution':{'runtime':'laya-mlx','device':'metal-gpu','activation_dtype':'float16','network_model_calls':0,'autoregressive_decode_steps':0,'states':len(states),'questions':sum(len(q) for _,q,_ in plans),'forward_passes':forwards,'inference_call_index':self.calls,'input_tokens':tokens,'max_length':self.agent.cfg['max_len'],'truncation_applied':False,'token_count_scope':'Per-question encoder sequences including repeated state; not NanoJev candidate-path tokens or cloud billing','runtime_versions':self.versions,'evaluation_ms':(time.perf_counter()-began)*1000},'calibration':{'temperature_raw':self.agent.temperature_raw,'temperature_used':self.agent.temperature,'by_options_raw':self.agent.temperature_by_options_raw,'by_options_used':self.agent.temperature_by_options,'scope':'Checkpoint temperatures and runtime clamping, not business correctness probabilities'}}
