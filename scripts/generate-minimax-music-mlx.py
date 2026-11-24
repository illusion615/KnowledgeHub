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
from minimax_music_mlx.prompt_lint import audit_song_blueprint


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--prompt', '--caption', dest='prompt', required=True, help='Music style, vocals, BPM, and arrangement prompt')
    lyrics_group = parser.add_mutually_exclusive_group()
    lyrics_group.add_argument('--lyrics', default='[instrumental]', help='Structured lyrics or [instrumental]')
    lyrics_group.add_argument('--lyrics-file', type=Path, help='UTF-8 file containing structured lyrics')
    parser.add_argument('--duration', type=float, default=30.0, help='Target audio duration in seconds (1..360)')
    parser.add_argument('--steps', type=int, default=30, help='Flow-matching inference steps (1..100)')
    parser.add_argument('--seed', type=int, default=0, help='Deterministic random seed')
    parser.add_argument('--temperature', type=float, default=1.0, help='AR & RVQ sampling temperature (0.1..2.0, default 1.0)')
    parser.add_argument('--ar-cfg-scale', type=float, default=1.5, help='AR classifier-free guidance scale (1.0..5.0, default 1.5)')
    parser.add_argument('--ar-top-k', type=int, default=50, help='AR top-k candidate mask width (1..250, default 50)')
    parser.add_argument('--dit-cfg-scale', type=float, default=1.7, help='Flow-matching DiT guidance scale (1.0..5.0, default 1.7)')
    parser.add_argument('--output', type=Path, default=Path('minimax_music3_output.wav'), help='Destination .wav file path')
    parser.add_argument('--model', default=DEFAULT_MODEL_ID, help='Cached HF repo ID or local snapshot directory')
    parser.add_argument('--cache-root', type=Path, default=DEFAULT_CACHE_ROOT, help='Hugging Face hub cache root')
    parser.add_argument('--progress', action='store_true', help='Print periodic progress logs to stderr')
    parser.add_argument('--lint-only', action='store_true', help='Audit prompt structure and lyric prosody without loading model weights')
    parser.add_argument('--json', action='store_true', help='Print structured JSON summary only')
    return parser


def main(argv: list[str] | None = None, *, engine_factory=MiniMaxMusicEngine) -> int:
    args = build_parser().parse_args(argv)
    lyrics = args.lyrics_file.read_text(encoding='utf-8') if args.lyrics_file else args.lyrics
    if args.lint_only:
        report = audit_song_blueprint(args.prompt, lyrics)
        if args.json:
            print(json.dumps(report, ensure_ascii=False), flush=True)
        else:
            status = 'OK' if report['ok'] else 'ERROR'
            print(
                f"[{status}] sections={report['section_count']} lines={report['lyric_line_count']} "
                f"avg_syllables={report['avg_syllables_per_line']} warnings={len(report['warnings'])}",
                flush=True,
            )
            for item in report['warnings']:
                print(f"  - [{item['severity']}] {item['code']}: {item['message']}", flush=True)
        return 0 if report['ok'] else 2
    if engine_factory is MiniMaxMusicEngine:
        ensure_mlx_runtime()
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
        'temperature': args.temperature,
        'ar_cfg_scale': args.ar_cfg_scale,
        'ar_top_k': args.ar_top_k,
        'dit_cfg_scale': args.dit_cfg_scale,
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
