#!/usr/bin/env python3
"""One-shot CLI wrapper for local MiniMax-Music3-mxfp8 MLX song generation."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from minimax_music_mlx.engine import (
    DEFAULT_CACHE_ROOT,
    DEFAULT_MODEL_ID,
    MiniMaxMusicEngine,
    ensure_mlx_runtime,
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--prompt', '--caption', dest='prompt', required=True, help='Music style, vocals, BPM, and arrangement prompt')
    lyrics_group = parser.add_mutually_exclusive_group()
    lyrics_group.add_argument('--lyrics', default='[instrumental]', help='Structured lyrics or [instrumental]')
    lyrics_group.add_argument('--lyrics-file', type=Path, help='UTF-8 file containing structured lyrics')
    parser.add_argument('--duration', type=float, default=30.0, help='Target audio duration in seconds (1..360)')
    parser.add_argument('--steps', type=int, default=30, help='Flow-matching inference steps (1..30)')
    parser.add_argument('--seed', type=int, default=0, help='Deterministic random seed')
    parser.add_argument('--output', type=Path, default=Path('minimax_music3_output.wav'), help='Destination .wav file path')
    parser.add_argument('--model', default=DEFAULT_MODEL_ID, help='Cached HF repo ID or local snapshot directory')
    parser.add_argument('--cache-root', type=Path, default=DEFAULT_CACHE_ROOT, help='Hugging Face hub cache root')
    parser.add_argument('--progress', action='store_true', help='Print periodic progress logs to stderr')
    parser.add_argument('--json', action='store_true', help='Print structured JSON summary only')
    return parser


def main(argv: list[str] | None = None, *, engine_factory=MiniMaxMusicEngine) -> int:
    args = build_parser().parse_args(argv)
    if engine_factory is MiniMaxMusicEngine:
        ensure_mlx_runtime()
    lyrics = args.lyrics_file.read_text(encoding='utf-8') if args.lyrics_file else args.lyrics
    output_path = args.output.expanduser()
    if output_path.suffix.lower() != '.wav':
        raise SystemExit('--output must end with .wav')
    engine = engine_factory(args.model, cache_root=args.cache_root, output_dir=output_path.resolve(strict=False).parent, lazy_load=True)
    payload: dict[str, object] = {
        'prompt': args.prompt,
        'lyrics': lyrics,
        'duration': args.duration,
        'steps': args.steps,
        'seed': args.seed,
        'output_path': str(output_path),
    }
    if args.progress:
        import sys
        payload['_progress_cb'] = lambda evt: print(f"[minimax-progress] {json.dumps(evt, ensure_ascii=False)}", file=sys.stderr, flush=True)
    result = engine.generate(
        payload,
        allow_any_output_path=True,
    )
    if args.json:
        print(json.dumps(result, ensure_ascii=False), flush=True)
    else:
        print(
            f"Saved {result['output_path']} ({result['duration_seconds']}s @ {result['sample_rate']}Hz, "
            f"RMS={result['rms_amplitude']}, elapsed={result['elapsed_seconds']}s)",
            flush=True,
        )
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
