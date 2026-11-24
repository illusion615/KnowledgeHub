"""Local offline MLX wrapper for mlx-community/MiniMax-Music3-mxfp8."""
from __future__ import annotations

import base64
import hashlib
import json
import math
import os
from pathlib import Path
import sys
import time
from typing import Any
import uuid
import wave

DEFAULT_MODEL_ID = 'mlx-community/MiniMax-Music3-mxfp8'
DEFAULT_RUNTIME_PYTHON = Path.home() / '.local/share/local-generation/minimax-music3-mlx/bin/python'
DEFAULT_CACHE_ROOT = Path.home() / '.cache/huggingface/hub'
DEFAULT_OUTPUT_DIR = Path.home() / '.cache/study-room/minimax-music3-mlx/outputs'
REQUIRED_SHARDS = (
    'model-00001-of-00003.safetensors',
    'model-00002-of-00003.safetensors',
    'model-00003-of-00003.safetensors',
)
MAX_PROMPT_CHARS = 4096
MAX_LYRICS_CHARS = 8192
DEFAULT_TEMPERATURE = 1.0
DEFAULT_AR_CFG_SCALE = 1.5
DEFAULT_AR_TOP_K = 50
DEFAULT_DIT_CFG_SCALE = 1.7


def _unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('Duplicate JSON key')
        result[key] = value
    return result


def _reject_nonfinite(_value):
    raise ValueError('Non-finite JSON number')


def parse_json(text: str) -> Any:
    return json.loads(text, object_pairs_hook=_unique_object, parse_constant=_reject_nonfinite)


def ensure_mlx_runtime(argv: list[str] | None = None) -> None:
    if os.environ.get('MINIMAX_MUSIC_NO_REEXEC') == '1':
        return
    try:
        import mlx_audio.music.utils  # noqa: F401
        return
    except ImportError:
        pass
    runtime_py = Path(os.environ.get('MINIMAX_MUSIC_PYTHON', str(DEFAULT_RUNTIME_PYTHON))).expanduser()
    if runtime_py.is_file() and Path(sys.executable).resolve() != runtime_py.resolve():
        env = dict(os.environ)
        env['MINIMAX_MUSIC_NO_REEXEC'] = '1'
        args = sys.argv if argv is None else argv
        os.execve(str(runtime_py), [str(runtime_py), *args], env)


def resolve_cached_snapshot(model_id: str = DEFAULT_MODEL_ID, cache_root: Path = DEFAULT_CACHE_ROOT) -> Path:
    candidate = Path(model_id).expanduser()
    if candidate.is_dir():
        snapshot = candidate.resolve(strict=True)
    else:
        repo_dir = Path(cache_root).expanduser() / f"models--{model_id.replace('/', '--')}"
        ref_file = repo_dir / 'refs' / 'main'
        if ref_file.is_file():
            revision = ref_file.read_text(encoding='utf-8').strip()
            snapshot = (repo_dir / 'snapshots' / revision).resolve(strict=True)
        else:
            snaps = sorted((repo_dir / 'snapshots').glob('*')) if (repo_dir / 'snapshots').is_dir() else []
            if not snaps:
                raise FileNotFoundError(f'Cached snapshot not found for {model_id} under {repo_dir}')
            snapshot = snaps[-1].resolve(strict=True)
    missing = [name for name in ('config.json', 'model.safetensors.index.json', *REQUIRED_SHARDS) if not (snapshot / name).is_file()]
    if missing:
        raise FileNotFoundError(f"Snapshot {snapshot} missing required artifacts: {', '.join(missing)}")
    return snapshot


def _require_bounded_text(value: Any, max_chars: int, message: str) -> str:
    if not isinstance(value, str) or not value.strip() or len(value) > max_chars:
        raise ValueError(message)
    return value.strip()


def _require_bounded_int(value: Any, low: int, high: int, message: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or not low <= value <= high:
        raise ValueError(message)
    return value


def _require_bounded_float(value: Any, low: float, high: float, message: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not low <= float(value) <= high:
        raise ValueError(message)
    return float(value)


def _resolve_safe_output_path(raw_out: Any, output_dir: Path) -> Path:
    if raw_out is None:
        return Path(output_dir).expanduser() / f'minimax-music3-{int(time.time())}-{uuid.uuid4().hex[:8]}.wav'
    if not isinstance(raw_out, str) or not raw_out.strip():
        raise ValueError('output_path must be a non-empty path string')
    out_path = Path(raw_out).expanduser()
    if out_path.suffix.lower() != '.wav':
        raise ValueError('output_path must end with .wav')
    root = Path(output_dir).expanduser().resolve()
    resolved_parent = out_path.resolve(strict=False).parent
    if not (resolved_parent == root or resolved_parent.is_relative_to(root)):
        raise ValueError('output_path must reside inside the configured output directory')
    return out_path


def validate_generation_request(payload: Any, *, output_dir: Path = DEFAULT_OUTPUT_DIR) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise ValueError('Payload must be a JSON object')
    allowed = {
        'prompt', 'caption', 'lyrics', 'duration', 'steps', 'seed',
        'temperature', 'ar_cfg_scale', 'ar_top_k', 'dit_cfg_scale',
        'output_path', 'return_audio_base64',
    }
    if set(payload) - allowed:
        raise ValueError('Unsupported request fields')
    raw_prompt = payload.get('prompt') if payload.get('prompt') is not None else payload.get('caption')
    return_b64 = payload.get('return_audio_base64', False)
    if not isinstance(return_b64, bool):
        raise ValueError('return_audio_base64 must be a boolean')
    return {
        'prompt': _require_bounded_text(raw_prompt, MAX_PROMPT_CHARS, 'A non-empty prompt/caption (<=4096 chars) is required'),
        'lyrics': _require_bounded_text(
            payload.get('lyrics', '[instrumental]'),
            MAX_LYRICS_CHARS,
            'Lyrics must be a non-empty string (<=8192 chars); pass [instrumental] for instrumental tracks',
        ),
        'duration': _require_bounded_float(payload.get('duration', 30.0), 1.0, 360.0, 'duration must be between 1 and 360 seconds'),
        'steps': _require_bounded_int(payload.get('steps', 30), 1, 100, 'steps must be an integer between 1 and 100'),
        'seed': _require_bounded_int(payload.get('seed', 0), 0, 2**31 - 1, 'seed must be a non-negative 32-bit integer'),
        'temperature': _require_bounded_float(payload.get('temperature', DEFAULT_TEMPERATURE), 0.1, 2.0, 'temperature must be between 0.1 and 2.0'),
        'ar_cfg_scale': _require_bounded_float(payload.get('ar_cfg_scale', DEFAULT_AR_CFG_SCALE), 1.0, 5.0, 'ar_cfg_scale must be between 1.0 and 5.0'),
        'ar_top_k': _require_bounded_int(payload.get('ar_top_k', DEFAULT_AR_TOP_K), 1, 250, 'ar_top_k must be an integer between 1 and 250'),
        'dit_cfg_scale': _require_bounded_float(payload.get('dit_cfg_scale', DEFAULT_DIT_CFG_SCALE), 1.0, 5.0, 'dit_cfg_scale must be between 1.0 and 5.0'),
        'output_path': _resolve_safe_output_path(payload.get('output_path'), output_dir),
        'return_audio_base64': return_b64,
    }


def _write_pcm16_wav(destination: Path, samples, sample_rate: int) -> tuple[int, int, float]:
    try:
        import numpy as np
        arr = np.asarray(samples, dtype=np.float32)
        if not np.isfinite(arr).all():
            raise RuntimeError('Generated waveform contains non-finite values')
        arr = np.clip(arr, -1.0, 1.0)
        if arr.ndim == 1:
            arr = arr[:, None]
        frames, channels = int(arr.shape[0]), int(arr.shape[1])
        rms = float(np.sqrt(np.mean(np.square(arr)))) if frames > 0 else 0.0
        pcm_bytes = (arr * 32767.0).astype('<i2').tobytes()
    except ImportError:
        import array
        rows = samples.tolist() if hasattr(samples, 'tolist') else list(samples)
        frames = len(rows)
        channels = len(rows[0]) if frames and isinstance(rows[0], (list, tuple)) else 1
        flat = [float(v) for row in rows for v in (row if channels > 1 else (row,))]
        if any(not math.isfinite(v) for v in flat):
            raise RuntimeError('Generated waveform contains non-finite values') from None
        clipped = [max(-1.0, min(1.0, v)) for v in flat]
        rms = math.sqrt(sum(v * v for v in clipped) / len(clipped)) if clipped else 0.0
        pcm = array.array('h', (int(round(v * 32767.0)) for v in clipped))
        if sys.byteorder != 'little':
            pcm.byteswap()
        pcm_bytes = pcm.tobytes()
    destination.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(destination), 'wb') as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(2)
        wf.setframerate(int(sample_rate))
        wf.writeframes(pcm_bytes)
    return frames, channels, rms


class MiniMaxMusicEngine:
    def __init__(
        self,
        model_id: str = DEFAULT_MODEL_ID,
        *,
        cache_root: Path = DEFAULT_CACHE_ROOT,
        output_dir: Path = DEFAULT_OUTPUT_DIR,
        lazy_load: bool = True,
        loader=None,
    ):
        os.environ.setdefault('HF_HUB_OFFLINE', '1')
        os.environ.setdefault('TRANSFORMERS_OFFLINE', '1')
        os.environ.setdefault('HF_HUB_DISABLE_TELEMETRY', '1')
        self.model_id = model_id
        self.cache_root = Path(cache_root).expanduser()
        self.output_dir = Path(output_dir).expanduser().resolve()
        self.snapshot_dir = resolve_cached_snapshot(model_id, self.cache_root)
        self._loader = loader
        self._model = None
        self.load_seconds: float | None = None
        self.inference_count = 0
        self.runtime_id = uuid.uuid4().hex
        if not lazy_load:
            self.ensure_loaded()

    def ensure_loaded(self):
        if self._model is not None:
            return self._model
        started = time.perf_counter()
        if self._loader is not None:
            self._model = self._loader(self.snapshot_dir)
        else:
            import mlx.core as mx
            if not mx.metal.is_available():
                raise RuntimeError('Apple Silicon Metal GPU is required for MiniMax-Music3 MLX')
            from mlx_audio.music.utils import load_model
            self._model = load_model(self.snapshot_dir)
        self.load_seconds = round(time.perf_counter() - started, 3)
        return self._model

    def health(self) -> dict[str, Any]:
        return {
            'backend': 'study-room-minimax-music3-mlx-v1',
            'ready': True,
            'model_loaded': self._model is not None,
            'model': self.model_id,
            'snapshot_dir': str(self.snapshot_dir),
            'runtime_python': str(DEFAULT_RUNTIME_PYTHON),
            'runtime_python_exists': DEFAULT_RUNTIME_PYTHON.is_file(),
            'device': 'mlx-metal-gpu',
            'quantization': 'mxfp8',
            'load_seconds': self.load_seconds,
            'inference_count': self.inference_count,
            'runtime_id': self.runtime_id,
            'network_model_calls': 0,
        }

    @staticmethod
    def _has_custom_sampling(req: dict[str, Any]) -> bool:
        return (
            req['temperature'] != DEFAULT_TEMPERATURE
            or req['ar_cfg_scale'] != DEFAULT_AR_CFG_SCALE
            or req['ar_top_k'] != DEFAULT_AR_TOP_K
            or req['dit_cfg_scale'] != DEFAULT_DIT_CFG_SCALE
            or req['steps'] > 30
        )

    def _generate_with_progress(self, model: Any, req: dict[str, Any], progress_cb: Any | None = None) -> tuple[Any, int]:
        from .sampling_pipeline import run_custom_generation

        return run_custom_generation(model, req, progress_cb)

    def generate(self, payload: dict[str, Any], *, allow_any_output_path: bool = False) -> dict[str, Any]:
        progress_cb = payload.get('_progress_cb') if isinstance(payload, dict) else None
        clean_payload = {k: v for k, v in payload.items() if k != '_progress_cb'} if isinstance(payload, dict) else payload
        if allow_any_output_path and isinstance(clean_payload, dict) and clean_payload.get('output_path'):
            custom_out = Path(str(clean_payload['output_path'])).expanduser()
            sanitized = {k: v for k, v in clean_payload.items() if k != 'output_path'}
            req = validate_generation_request(sanitized, output_dir=self.output_dir)
            req['output_path'] = custom_out
        else:
            req = validate_generation_request(clean_payload, output_dir=self.output_dir)
        model = self.ensure_loaded()
        started = time.perf_counter()
        use_direct = (
            (callable(progress_cb) or self._has_custom_sampling(req))
            and hasattr(model, '_text_ids')
            and hasattr(model, '_run_flow')
        )
        if use_direct:
            waveform, sample_rate = self._generate_with_progress(model, req, progress_cb)
        else:
            results = list(
                model.generate(
                    text=req['prompt'],
                    lyrics=req['lyrics'],
                    duration=req['duration'],
                    steps=req['steps'],
                    seed=req['seed'],
                )
            )
            if not results:
                raise RuntimeError('MiniMax-Music3 returned no audio segments')
            sample_rate = int(results[0].sample_rate)
            if len(results) == 1:
                waveform = results[0].audio
            else:
                import numpy as np
                waveform = np.concatenate([ r.audio for r in results ], axis=0)
        out_path = req['output_path']
        frames, channels, rms = _write_pcm16_wav(out_path, waveform, sample_rate)
        elapsed = time.perf_counter() - started
        audio_bytes = out_path.read_bytes()
        sha = hashlib.sha256(audio_bytes).hexdigest()
        self.inference_count += 1
        response = {
            'schema_version': 'study-room-minimax-music3-mlx-v1',
            'model': self.model_id,
            'output_path': str(out_path.resolve()),
            'sample_rate': sample_rate,
            'channels': channels,
            'samples': frames,
            'duration_seconds': round(frames / max(sample_rate, 1), 3),
            'rms_amplitude': round(rms, 6),
            'sha256': sha,
            'bytes': len(audio_bytes),
            'elapsed_seconds': round(elapsed, 3),
            'steps': req['steps'],
            'seed': req['seed'],
            'temperature': req['temperature'],
            'ar_cfg_scale': req['ar_cfg_scale'],
            'ar_top_k': req['ar_top_k'],
            'dit_cfg_scale': req['dit_cfg_scale'],
            'inference_call_index': self.inference_count,
        }
        if req['return_audio_base64']:
            response['audio_base64'] = base64.b64encode(audio_bytes).decode('ascii')
        return response
