"""Native Apple Silicon MLX runtime wrapper for mlx-community/MiniMax-Music3-mxfp8."""
from .engine import (
    DEFAULT_CACHE_ROOT,
    DEFAULT_MODEL_ID,
    DEFAULT_RUNTIME_PYTHON,
    MiniMaxMusicEngine,
    ensure_mlx_runtime,
    parse_json,
    resolve_cached_snapshot,
    validate_generation_request,
)
from .mastering import (
    MASTERING_FILTER_CHAIN,
    analyze_song_acoustics,
    master_wav_and_encode_m4a,
)
from .prompt_lint import (
    audit_song_blueprint,
    clean_caption,
    estimate_line_syllables,
    normalize_lyrics,
)
from .sampling_pipeline import (
    run_custom_generation,
    step_one_frame,
)

__all__ = [
    'DEFAULT_CACHE_ROOT',
    'DEFAULT_MODEL_ID',
    'DEFAULT_RUNTIME_PYTHON',
    'MASTERING_FILTER_CHAIN',
    'MiniMaxMusicEngine',
    'analyze_song_acoustics',
    'audit_song_blueprint',
    'clean_caption',
    'ensure_mlx_runtime',
    'estimate_line_syllables',
    'master_wav_and_encode_m4a',
    'normalize_lyrics',
    'parse_json',
    'resolve_cached_snapshot',
    'run_custom_generation',
    'step_one_frame',
    'validate_generation_request',
]
