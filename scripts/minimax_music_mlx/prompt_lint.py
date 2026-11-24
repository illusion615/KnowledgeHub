"""Prompt, lyric prosody, and normalization lint utilities for MiniMax-Music3."""
from __future__ import annotations

import re
from typing import Any

_SPECIAL_TAG_RE = re.compile(r'<\|([^|]*)\|>')
_LEADING_TAGS_RE = re.compile(r'^[ \t]*((?:\[[^\]]+\][ \t]*)+)')
_CJK_RE = re.compile(r'[\u4e00-\u9fff]')
_ASCII_WORD_RE = re.compile(r"[A-Za-z0-9]+(?:'[A-Za-z]+)?")
_ACRONYM_RE = re.compile(r'\b[A-Z]{2,}[0-9]*\b')
_TRAILING_ADLIB_RE = re.compile(r'\([^()\n]*\)')

STRUCTURED_SECTIONS = ('global metadata', 'vocal details', 'arrangement')
TIMELINE_CUES = ('intro', 'verse', 'pre-chorus', 'chorus', 'bridge', 'outro')


def clean_caption(caption: str) -> str:
    """Mirror MiniMax-Music3's internal caption sanitizer."""
    def rewrite_tag(match: re.Match) -> str:
        parts = match.group(1).strip().split(None, 1)
        return f'{parts[0]} is {parts[1]}' if len(parts) == 2 else parts[0]

    text = _SPECIAL_TAG_RE.sub(rewrite_tag, caption)
    lines = []
    for line in text.splitlines():
        line = re.sub(r'^\s{0,3}#{1,6}\s+', '', line)
        line = re.sub(r'^\s*[*+-]\s+', '', line)
        line = re.sub(r'\*\*([^*]+)\*\*', r'\1', line)
        line = re.sub(r'(?<!\*)\*([^*\n]+)\*(?!\*)', r'\1', line)
        lines.append(line.rstrip())
    text = '\n'.join(lines).replace('• ', '').replace('    ', '')
    text = re.sub(r'^\s*[-*_]{3,}\s*$', '', text, flags=re.MULTILINE)
    return re.sub(r'\n{2,}', '\n', text)


def normalize_lyrics(lyrics: str) -> str:
    """Mirror MiniMax-Music3's internal lyric normalizer (including same-line truncation)."""
    output = []
    for line in lyrics.splitlines():
        match = _LEADING_TAGS_RE.match(line)
        output.append(match.group(1).strip() if match else line)
    text = '\n'.join(output)
    text = text.replace('] ', ']\n').replace(' [', '\n[').replace(' ^ ', '\n')
    text = re.sub(r'\[([^\]]+)\]', lambda m: f'[{m.group(1).lower()}]', text)
    return f'[start]\n{text}'


def estimate_line_syllables(line: str, *, include_adlibs: bool = True) -> int:
    """Estimate sung/rapped syllable load for mixed Mandarin-English lyric lines."""
    target = line if include_adlibs else _TRAILING_ADLIB_RE.sub(' ', line)
    cjk_count = len(_CJK_RE.findall(target))
    eng_syllables = 0
    for word in _ASCII_WORD_RE.findall(target):
        if word.isupper() and len(word) <= 5:
            eng_syllables += len(word)
        else:
            eng_syllables += max(1, len(re.findall(r'[aeiouyAEIOUY]+', word)))
    return cjk_count + eng_syllables


def _parse_lyric_sections(lyrics: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Split tagged lyric blocks and detect same-line [Tag] silent truncation."""
    dropped_lines: list[dict[str, Any]] = []
    sections: list[dict[str, Any]] = []
    current_tag = '[untagged]'
    current_lines: list[str] = []

    for lineno, raw_line in enumerate(lyrics.splitlines(), start=1):
        stripped = raw_line.strip()
        if not stripped:
            continue
        match = _LEADING_TAGS_RE.match(raw_line)
        if not match:
            current_lines.append(stripped)
            continue
        tag_prefix = match.group(1).strip()
        remainder = raw_line[match.end():].strip()
        if remainder:
            dropped_lines.append({'line': lineno, 'tag': tag_prefix, 'dropped_text': remainder})
        if current_lines:
            sections.append({'tag': current_tag, 'lines': current_lines})
            current_lines = []
        current_tag = tag_prefix

    if current_lines:
        sections.append({'tag': current_tag, 'lines': current_lines})
    return sections, dropped_lines


def _audit_caption_structure(prompt_lower: str) -> list[dict[str, Any]]:
    """Check 3-part caption coverage and section-level arrangement timeline cues."""
    warnings: list[dict[str, Any]] = []
    present_headings = [heading for heading in STRUCTURED_SECTIONS if heading in prompt_lower]
    if len(present_headings) < 3:
        warnings.append({
            'code': 'unstructured_flat_caption',
            'severity': 'warning',
            'message': (
                'Caption lacks the official 3-section structure (Global Metadata / Vocal Details / Arrangement); '
                'single-paragraph tag lists often lock all 53 DiT chunks into a static instrumental loop.'
            ),
            'present_sections': present_headings,
        })

    timeline_cues = sum(1 for cue in TIMELINE_CUES if cue in prompt_lower)
    if timeline_cues < 3:
        warnings.append({
            'code': 'missing_section_timeline',
            'severity': 'warning',
            'message': 'Caption mentions fewer than 3 song sections; specify instrument entrances/dropouts across Verse, Chorus, and Bridge.',
        })
    return warnings


def _collect_section_syllables(sections: list[dict[str, Any]], predicate) -> list[int]:
    return [
        estimate_line_syllables(line)
        for sec in sections
        if predicate(sec['tag'].lower())
        for line in sec['lines']
        if not line.startswith('(')
    ]


def _audit_prosody_and_flow(
    sections: list[dict[str, Any]],
    all_lyric_lines: list[str],
    syllable_counts: list[int],
    verse_syl: list[int],
    chorus_syl: list[int],
) -> list[dict[str, Any]]:
    """Check syllable crowding, Verse-vs-Chorus contrast, acronyms, and consecutive verses."""
    warnings: list[dict[str, Any]] = []
    dense_count = sum(1 for syl in syllable_counts if syl >= 17)
    if dense_count and dense_count >= max(3, len(all_lyric_lines) // 4):
        warnings.append({
            'code': 'overcrowded_syllable_grid',
            'severity': 'warning',
            'message': f'{dense_count}/{len(all_lyric_lines)} lines pack >=17 syllables, leaving little room for syncopation or breath.',
        })

    if verse_syl and chorus_syl:
        v_mean = sum(verse_syl) / len(verse_syl)
        c_mean = sum(chorus_syl) / len(chorus_syl)
        if c_mean >= v_mean * 0.9:
            warnings.append({
                'code': 'weak_verse_chorus_contrast',
                'severity': 'warning',
                'message': (
                    f'Chorus average syllable load ({c_mean:.1f}) is not noticeably shorter/punchier than Verse ({v_mean:.1f}); '
                    'hooks risk sounding like another spoken verse.'
                ),
            })

    acronyms = _ACRONYM_RE.findall('\n'.join(all_lyric_lines))
    if len(acronyms) >= 8:
        sample = ', '.join(sorted(set(acronyms))[:6])
        warnings.append({
            'code': 'excessive_raw_acronyms',
            'severity': 'info',
            'message': f'Found {len(acronyms)} uppercase technical acronyms in lyrics ({sample}); spell out letter-by-letter cues or concentrate jargon in verses only.',
        })

    if _has_consecutive_verses(sections):
        warnings.append({
            'code': 'back_to_back_verses',
            'severity': 'warning',
            'message': 'Consecutive [Verse] sections detected without a [Chorus], [Pre-Chorus], or [Instrumental] breather in between.',
        })
    return warnings


def _has_consecutive_verses(sections: list[dict[str, Any]]) -> bool:
    streak = 0
    for sec in sections:
        streak = streak + 1 if 'verse' in sec['tag'].lower() else 0
        if streak >= 2:
            return True
    return False


def audit_song_blueprint(prompt: str, lyrics: str) -> dict[str, Any]:
    """Diagnose arrangement flatness risks and silent truncation traps before rendering."""
    sections, dropped_lines = _parse_lyric_sections(lyrics)
    warnings: list[dict[str, Any]] = []

    if dropped_lines:
        warnings.append({
            'code': 'inline_tag_truncation',
            'severity': 'error',
            'message': f'{len(dropped_lines)} line(s) place lyrics after a leading [Tag] and will be silently discarded by normalize_lyrics.',
            'details': dropped_lines,
        })

    warnings.extend(_audit_caption_structure(prompt.lower()))

    all_lyric_lines = [line for sec in sections for line in sec['lines'] if not line.startswith('(')]
    syllable_counts = [estimate_line_syllables(line) for line in all_lyric_lines]
    verse_syl = _collect_section_syllables(sections, lambda tag: 'verse' in tag)
    chorus_syl = _collect_section_syllables(sections, lambda tag: 'chorus' in tag and 'pre' not in tag)
    warnings.extend(_audit_prosody_and_flow(sections, all_lyric_lines, syllable_counts, verse_syl, chorus_syl))

    return {
        'ok': not any(w['severity'] == 'error' for w in warnings),
        'section_count': len(sections),
        'lyric_line_count': len(all_lyric_lines),
        'avg_syllables_per_line': round(sum(syllable_counts) / len(syllable_counts), 2) if syllable_counts else 0.0,
        'verse_avg_syllables': round(sum(verse_syl) / len(verse_syl), 2) if verse_syl else None,
        'chorus_avg_syllables': round(sum(chorus_syl) / len(chorus_syl), 2) if chorus_syl else None,
        'dropped_inline_tag_lines': dropped_lines,
        'warnings': warnings,
        'cleaned_caption_preview': clean_caption(prompt),
        'normalized_lyrics_preview': normalize_lyrics(lyrics),
    }
