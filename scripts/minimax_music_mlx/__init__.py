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

__all__ = [
    'DEFAULT_CACHE_ROOT',
    'DEFAULT_MODEL_ID',
    'DEFAULT_RUNTIME_PYTHON',
    'MiniMaxMusicEngine',
    'ensure_mlx_runtime',
    'parse_json',
    'resolve_cached_snapshot',
    'validate_generation_request',
]
