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
    allowed = {'prompt', 'caption', 'lyrics', 'duration', 'steps', 'seed', 'output_path', 'return_audio_base64'}
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
        'steps': _require_bounded_int(payload.get('steps', 30), 1, 30, 'steps must be an integer between 1 and 30'),
        'seed': _require_bounded_int(payload.get('seed', 0), 0, 2**31 - 1, 'seed must be a non-negative 32-bit integer'),
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
        raw_rows = samples.tolist() if hasattr(samples, 'tolist') else list(samples)
        if not raw_rows:
            frames, channels, flat = 0, 1, []
        elif isinstance(raw_rows[0], (list, tuple)):
            frames, channels = len(raw_rows), len(raw_rows[0])
            flat = [float(v) for row in raw_rows for v in row]
        else:
            frames, channels = len(raw_rows), 1
            flat = [float(v) for v in raw_rows]
        if any(not math.isfinite(v) for v in flat):
            raise RuntimeError('Generated waveform contains non-finite values')
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

    def _generate_with_progress(self, model: Any, req: dict[str, Any], progress_cb: Any) -> tuple[Any, int]:
        import mlx.core as mx
        import numpy as np
        from mlx_audio.music.models.minimax_music3.ar import ar_one_frame, qwen3_hidden
        from mlx_audio.music.models.minimax_music3.config import (
            CHUNK_FRAMES,
            DIT_CFG_SCALE,
            OVERLAP_LATENT_LENGTH,
        )
        from mlx_audio.music.models.minimax_music3.euler import denoise_chunk
        from mlx_audio.music.models.minimax_music3.minimax_music3 import _chunk_starts, _crop_waveform

        max_frames = max(1, int(req['duration'] * model.config.frame_rate))
        text_ids = model._text_ids(req['prompt'], req['lyrics'])
        mx.random.seed(req['seed'])
        key = mx.random.key(req['seed'])
        embeddings = model.language_model.model.embed_tokens(text_ids)
        hidden, cache = qwen3_hidden(model.language_model, embeddings)
        last_hidden = hidden[:, -1]
        frames_list = []
        ar_start = time.perf_counter()
        progress_cb({'stage': 'ar_start', 'max_frames': max_frames, 'max_seconds': req['duration']})
        ended_by_eos = False
        for frame_index in range(max_frames + 1):
            key, subkey = mx.random.split(key)
            res = ar_one_frame(
                model.language_model,
                model.rvq_depth_decoder,
                model.config,
                last_hidden,
                cache,
                subkey,
                emit_frame=frame_index > 0,
            )
            last_hidden, cache = res.last_hidden, res.cache
            if res.ended:
                ended_by_eos = True
                break
            if frame_index > 0:
                frames_list.append(res.frame_hidden)
                if len(frames_list) % 125 == 0:
                    mx.eval(res.frame_hidden)
                    progress_cb({
                        'stage': 'ar_progress',
                        'frames': len(frames_list),
                        'max_frames': max_frames,
                        'audio_seconds': round(len(frames_list) / model.config.frame_rate, 1),
                        'elapsed_seconds': round(time.perf_counter() - ar_start, 1),
                    })
                if len(frames_list) >= max_frames:
                    break
        if not frames_list:
            raise RuntimeError('MiniMax-Music3 generated zero audio frames')
        frame_hiddens = mx.stack(frames_list, axis=1)
        mx.eval(frame_hiddens)
        total_ar_frames = int(frame_hiddens.shape[1])
        progress_cb({
            'stage': 'ar_done',
            'frames': total_ar_frames,
            'audio_seconds': round(total_ar_frames / model.config.frame_rate, 2),
            'ended_by_eos': ended_by_eos,
            'elapsed_seconds': round(time.perf_counter() - ar_start, 1),
        })
        starts = _chunk_starts(total_ar_frames)
        waves = []
        previous_latent = None
        previous_condition = None
        mx.random.seed(req['seed'] + 7)
        flow_start = time.perf_counter()
        for chunk_idx, start_f in enumerate(starts):
            end_f = min(start_f + CHUNK_FRAMES, total_ar_frames)
            condition = model.condition_encoder(frame_hiddens[:, start_f:end_f])
            noise = mx.random.normal((1, model.config.dit_in_channels, condition.shape[1])).astype(condition.dtype)
            latents, condition = denoise_chunk(
                model.transformer,
                noise,
                condition,
                num_inference_steps=req['steps'],
                guidance_scale=DIT_CFG_SCALE,
                previous_latent=previous_latent,
                previous_condition=previous_condition,
            )
            carry_start = max(0, latents.shape[-1] - 2 * OVERLAP_LATENT_LENGTH)
            carry_end = max(carry_start, latents.shape[-1] - OVERLAP_LATENT_LENGTH)
            previous_latent = latents[..., carry_start:carry_end]
            previous_condition = condition[:, carry_start:carry_end]
            waves.append(model.vocoder(latents))
            mx.eval(waves[-1])
            progress_cb({
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
        if callable(progress_cb) and hasattr(model, '_text_ids') and hasattr(model, '_run_flow'):
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
            'inference_call_index': self.inference_count,
        }
        if req['return_audio_base64']:
            response['audio_base64'] = base64.b64encode(audio_bytes).decode('ascii')
        return response
