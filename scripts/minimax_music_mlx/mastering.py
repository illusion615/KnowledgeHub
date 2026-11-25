"""FFmpeg-compatible mastering chain, acoustic diagnostics, and M4A encoding for MiniMax-Music3."""
from __future__ import annotations

import math
from pathlib import Path
import shutil
import subprocess
from typing import Any
import wave

MASTERING_FILTER_CHAIN = (
    'highpass=f=32,'
    'equalizer=f=68:t=q:w=1.2:g=2.5,'
    'equalizer=f=240:t=q:w=1.6:g=-3.2,'
    'equalizer=f=3600:t=q:w=1.4:g=2.0,'
    'highshelf=f=9500:g=1.8,'
    'acompressor=threshold=-16dB:ratio=2.5:attack=18:release=140:makeup=2dB,'
    'stereowiden=delay=14:feedback=0.2:crossfeed=0.15:drymix=0.85,'
    'loudnorm=I=-14:TP=-1.0:LRA=9'
)


def _peaking_biquad(f0: float, q: float, gain_db: float, fs: float):
    amp = 10.0 ** (gain_db / 40.0)
    w0 = 2.0 * math.pi * f0 / fs
    alpha = math.sin(w0) / (2.0 * q)
    cosw = math.cos(w0)
    b0, b1, b2 = 1.0 + alpha * amp, -2.0 * cosw, 1.0 - alpha * amp
    a0, a1, a2 = 1.0 + alpha / amp, -2.0 * cosw, 1.0 - alpha / amp
    return [b0 / a0, b1 / a0, b2 / a0], [1.0, a1 / a0, a2 / a0]


def _highshelf_biquad(f0: float, gain_db: float, fs: float, q: float = 0.7071):
    amp = 10.0 ** (gain_db / 40.0)
    w0 = 2.0 * math.pi * f0 / fs
    alpha = math.sin(w0) / (2.0 * q)
    cosw = math.cos(w0)
    sq = 2.0 * math.sqrt(amp) * alpha
    b0 = amp * ((amp + 1.0) + (amp - 1.0) * cosw + sq)
    b1 = -2.0 * amp * ((amp - 1.0) + (amp + 1.0) * cosw)
    b2 = amp * ((amp + 1.0) + (amp - 1.0) * cosw - sq)
    a0 = (amp + 1.0) - (amp - 1.0) * cosw + sq
    a1 = 2.0 * ((amp - 1.0) - (amp + 1.0) * cosw)
    a2 = (amp + 1.0) - (amp - 1.0) * cosw - sq
    return [b0 / a0, b1 / a0, b2 / a0], [1.0, a1 / a0, a2 / a0]


def _highpass_biquad(f0: float, fs: float, q: float = 0.7071):
    w0 = 2.0 * math.pi * f0 / fs
    alpha = math.sin(w0) / (2.0 * q)
    cosw = math.cos(w0)
    b0, b1, b2 = (1.0 + cosw) / 2.0, -(1.0 + cosw), (1.0 + cosw) / 2.0
    a0, a1, a2 = 1.0 + alpha, -2.0 * cosw, 1.0 - alpha
    return [b0 / a0, b1 / a0, b2 / a0], [1.0, a1 / a0, a2 / a0]


def _read_wav_float(path: Path):
    import numpy as np

    with wave.open(str(path), 'rb') as wf:
        sr = wf.getframerate()
        ch = wf.getnchannels()
        frames = wf.getnframes()
        raw = wf.readframes(frames)
    arr = np.frombuffer(raw, dtype='<i2').astype(np.float64) / 32768.0
    arr = arr.reshape(-1, ch)
    if ch == 1:
        arr = np.repeat(arr, 2, axis=1)
    return arr, sr


def _write_wav_float(path: Path, arr, sr: int) -> None:
    import numpy as np

    clipped = np.clip(arr, -1.0, 1.0)
    pcm = np.round(clipped * 32767.0).astype('<i2')
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), 'wb') as wf:
        wf.setnchannels(int(pcm.shape[1]))
        wf.setsampwidth(2)
        wf.setframerate(int(sr))
        wf.writeframes(pcm.tobytes())


def _measure_integrated_lufs(stereo, sr: int) -> float:
    import numpy as np
    from scipy.signal import lfilter

    b_hs, a_hs = _highshelf_biquad(1681.97, 4.0, sr, q=0.7071)
    b_hp, a_hp = _highpass_biquad(38.13, sr, q=0.5003)
    weighted = lfilter(b_hp, a_hp, lfilter(b_hs, a_hs, stereo, axis=0), axis=0)
    block = max(1, int(0.4 * sr))
    hop = max(1, int(0.1 * sr))
    if weighted.shape[0] < block:
        energy = float(np.mean(np.sum(np.square(weighted), axis=1)))
        return -0.691 + 10.0 * math.log10(max(energy, 1e-12))
    energies = [
        float(np.mean(np.sum(np.square(weighted[pos:pos + block]), axis=1)))
        for pos in range(0, weighted.shape[0] - block + 1, hop)
    ]
    abs_gated = [e for e in energies if -0.691 + 10.0 * math.log10(max(e, 1e-12)) > -70.0]
    if not abs_gated:
        return -70.0
    rel_thresh = (sum(abs_gated) / len(abs_gated)) * (10.0 ** (-1.0))
    final_blocks = [e for e in abs_gated if e >= rel_thresh] or abs_gated
    return -0.691 + 10.0 * math.log10(max(sum(final_blocks) / len(final_blocks), 1e-12))


def _apply_dsp_mastering(stereo, sr: int, *, target_lufs: float = -14.0, ceiling_dbfs: float = -1.0):
    import numpy as np
    from scipy.signal import lfilter

    stages = [
        _highpass_biquad(32.0, sr),
        _peaking_biquad(68.0, 1.2, 2.5, sr),
        _peaking_biquad(240.0, 1.6, -3.2, sr),
        _peaking_biquad(3600.0, 1.4, 2.0, sr),
        _highshelf_biquad(9500.0, 1.8, sr),
    ]
    y = stereo.copy()
    for b_coef, a_coef in stages:
        y = lfilter(b_coef, a_coef, y, axis=0)

    # Block envelope compressor preserving 18ms drum attack transients
    hop = max(1, int(0.005 * sr))
    atk = math.exp(-hop / max(1.0, 0.018 * sr))
    rel = math.exp(-hop / max(1.0, 0.140 * sr))
    env = -60.0
    gains = np.ones(y.shape[0], dtype=np.float64)
    makeup = 10.0 ** (2.0 / 20.0)
    for start in range(0, y.shape[0], hop):
        end = min(y.shape[0], start + hop)
        rms = float(np.sqrt(np.mean(np.square(y[start:end])) + 1e-12))
        lvl_db = 20.0 * math.log10(rms)
        coeff = atk if lvl_db > env else rel
        env = coeff * env + (1.0 - coeff) * lvl_db
        gr_db = (1.0 / 2.5 - 1.0) * (env - (-16.0)) if env > -16.0 else 0.0
        gains[start:end] = (10.0 ** (gr_db / 20.0)) * makeup
    y *= gains[:, None]

    # Haas stereo widener (14ms side delay + subtle crossfeed)
    delay = max(1, int(0.014 * sr))
    if y.shape[0] > delay + 1:
        mid = 0.5 * (y[:, 0] + y[:, 1])
        side = 0.5 * (y[:, 0] - y[:, 1])
        delayed_side = np.zeros_like(side)
        delayed_side[delay:] = side[:-delay]
        widened_side = side + 0.22 * delayed_side
        wet_l = mid + 1.18 * widened_side - 0.12 * delayed_side
        wet_r = mid - 1.18 * widened_side + 0.12 * delayed_side
        y = 0.85 * y + 0.15 * np.stack([wet_l, wet_r], axis=1)

    # Smooth 2.8s cosine fade-out if track reached max duration cap without silence tail
    tail_Check = int(0.8 * sr)
    if y.shape[0] > int(6.0 * sr):
        tail_rms = float(np.sqrt(np.mean(np.square(y[-tail_Check:])) + 1e-12))
        if 20.0 * math.log10(tail_rms) > -26.0:
            fade_len = min(int(2.8 * sr), y.shape[0] // 8)
            curve = 0.5 * (1.0 + np.cos(np.linspace(0.0, math.pi, fade_len)))
            y[-fade_len:] *= curve[:, None]

    # Integrated loudness calibration (-14 LUFS) + smooth ceiling limiter (-1.0 dBTP)
    current_lufs = _measure_integrated_lufs(y, sr)
    gain_db = max(-12.0, min(14.0, target_lufs - current_lufs))
    y *= 10.0 ** (gain_db / 20.0)
    ceiling = 10.0 ** (ceiling_dbfs / 20.0)
    peak = float(np.max(np.abs(y))) if y.size else 0.0
    if peak > ceiling:
        knee = ceiling * 0.82
        mag = np.abs(y)
        over = mag > knee
        compressed = knee + (ceiling - knee) * np.tanh((mag[over] - knee) / max(ceiling - knee, 1e-6))
        y[over] = np.sign(y[over]) * compressed
    return y


def master_wav_and_encode_m4a(
    raw_wav: Path,
    mastered_wav: Path,
    m4a_out: Path | None = None,
    *,
    bitrate_bps: int = 256000,
) -> dict[str, Any]:
    """Master raw WAV via FFmpeg filter chain (or native DSP fallback) and export 256kbps M4A."""
    ffmpeg = shutil.which('ffmpeg')
    backend = 'scipy-dsp-biquad-loudnorm'
    if ffmpeg:
        proc = subprocess.run(
            [ffmpeg, '-y', '-i', str(raw_wav), '-af', MASTERING_FILTER_CHAIN, str(mastered_wav)],
            capture_output=True,
            text=True,
            check=False,
        )
        if proc.returncode == 0 and mastered_wav.is_file():
            backend = 'ffmpeg-loudnorm'
    if backend != 'ffmpeg-loudnorm':
        stereo, sr = _read_wav_float(raw_wav)
        mastered = _apply_dsp_mastering(stereo, sr)
        _write_wav_float(mastered_wav, mastered, sr)

    m4a_bytes = None
    if m4a_out is not None:
        m4a_out.parent.mkdir(parents=True, exist_ok=True)
        afconvert = shutil.which('afconvert')
        if ffmpeg:
            subprocess.run(
                [ffmpeg, '-y', '-i', str(mastered_wav), '-c:a', 'aac', '-b:a', f'{bitrate_bps // 1000}k', str(m4a_out)],
                capture_output=True,
                check=True,
            )
        elif afconvert:
            subprocess.run(
                [afconvert, '-f', 'm4af', '-d', 'aac', '-b', str(bitrate_bps), str(mastered_wav), str(m4a_out)],
                capture_output=True,
                check=True,
            )
        if m4a_out.is_file():
            m4a_bytes = m4a_out.stat().st_size
    return {'mastering_backend': backend, 'wav_bytes': mastered_wav.stat().st_size, 'm4a_bytes': m4a_bytes}


def analyze_song_acoustics(wav_path: Path, sections: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    """Compute duration, LUFS, RMS/Peak dBFS, Verse-vs-Chorus dynamic lift, stereo width, and F0 span."""
    import numpy as np

    stereo, sr = _read_wav_float(wav_path)
    total_frames = stereo.shape[0]
    dur = total_frames / max(sr, 1)
    rms = float(np.sqrt(np.mean(np.square(stereo)) + 1e-12))
    peak = float(np.max(np.abs(stereo)) + 1e-12)
    lufs = _measure_integrated_lufs(stereo, sr)

    mid = 0.5 * (stereo[:, 0] + stereo[:, 1])
    side = 0.5 * (stereo[:, 0] - stereo[:, 1])
    side_mid_ratio = float(np.sqrt(np.mean(side ** 2) + 1e-12) / np.sqrt(np.mean(mid ** 2) + 1e-12))

    # 1s sliding window macro dynamic range (P95 - P10)
    win = max(1, sr)
    win_db = [
        20.0 * math.log10(float(np.sqrt(np.mean(np.square(stereo[i:i + win])) + 1e-12)))
        for i in range(0, max(1, total_frames - win + 1), max(1, sr // 2))
    ]
    active_db = [v for v in win_db if v > -42.0] or win_db
    macro_range_db = float(np.percentile(active_db, 95) - np.percentile(active_db, 10)) if active_db else 0.0

    # Autocorrelation pitch span (P90 - P10 in semitones) on voiced 46ms frames
    mono = mid
    f_len = int(0.046 * sr)
    f_hop = int(0.025 * sr)
    min_lag, max_lag = max(1, int(sr / 520.0)), max(2, int(sr / 85.0))
    f0_hz: list[float] = []
    for pos in range(0, max(0, total_frames - f_len), max(1, f_hop)):
        seg = mono[pos:pos + f_len]
        if float(np.sqrt(np.mean(seg * seg))) < 0.025:
            continue
        seg = (seg - np.mean(seg)) * np.hanning(len(seg))
        spec = np.fft.rfft(seg, n=f_len * 2)
        acf = np.fft.irfft(spec * np.conj(spec))[:max_lag + 1]
        if acf[0] <= 1e-9:
            continue
        sub = acf[min_lag:max_lag + 1]
        best_idx = int(np.argmax(sub)) + min_lag
        if acf[best_idx] / acf[0] >= 0.32:
            f0_hz.append(sr / best_idx)
    if len(f0_hz) >= 4:
        p10, p50, p90 = np.percentile(f0_hz, [10, 50, 90])
        pitch_span_st = round(12.0 * math.log2(max(p90, 1.0) / max(p10, 1.0)), 2)
        median_f0 = round(float(p50), 1)
    else:
        pitch_span_st, median_f0 = 0.0, 0.0

    chorus_lift_db = None
    if sections:
        total_w = sum(float(sec.get('weight') or max(1, len(sec.get('lines', [])))) for sec in sections) or 1.0
        acc = 0.0
        verse_dbs, chorus_dbs = [], []
        for sec in sections:
            w = float(sec.get('weight') or max(1, len(sec.get('lines', []))))
            s_idx = int(total_frames * (acc / total_w))
            acc += w
            e_idx = int(total_frames * (acc / total_w))
            if e_idx > s_idx + 256:
                seg_rms = float(np.sqrt(np.mean(np.square(stereo[s_idx:e_idx])) + 1e-12))
                seg_db = 20.0 * math.log10(seg_rms)
                tag = str(sec.get('tag', '')).lower()
                if 'verse' in tag:
                    verse_dbs.append(seg_db)
                elif 'chorus' in tag and 'pre' not in tag:
                    chorus_dbs.append(seg_db)
        if verse_dbs and chorus_dbs:
            chorus_lift_db = round((sum(chorus_dbs) / len(chorus_dbs)) - (sum(verse_dbs) / len(verse_dbs)), 2)

    return {
        'duration_seconds': round(dur, 3),
        'sample_rate': sr,
        'channels': int(stereo.shape[1]),
        'integrated_lufs': round(lufs, 2),
        'rms_dbfs': round(20.0 * math.log10(rms), 2),
        'peak_dbfs': round(20.0 * math.log10(peak), 2),
        'macro_dynamic_range_db': round(macro_range_db, 2),
        'chorus_vs_verse_db': chorus_lift_db,
        'stereo_side_mid_ratio': round(side_mid_ratio, 3),
        'f0_median_hz': median_f0,
        'pitch_span_semitones': pitch_span_st,
    }
