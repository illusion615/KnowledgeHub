#!/usr/bin/env python3
"""Wrap each reference sub-block inside task-references with a <details class="task-collapsible"> for progressive disclosure."""
import re
from pathlib import Path

P = Path('posts/power-platform-governance/index.html')
src = P.read_text()
lines = src.splitlines(keepends=True)

# Helper: find matching </div> for a <div> opened at line idx (0-based), given indent of opener
def find_div_close(start_idx, opener_indent):
    depth = 1
    i = start_idx + 1
    while i < len(lines):
        ln = lines[i]
        # Count opens & closes on the line (rough but works for our well-formed file)
        opens = len(re.findall(r'<div\b', ln))
        closes = len(re.findall(r'</div\s*>', ln))
        depth += opens - closes
        if depth == 0:
            return i
        i += 1
    raise RuntimeError(f'no matching </div> from line {start_idx+1}')

# Each entry: (line-1-based of opener, summary_zh, summary_en, step_label, step_title_en)
# Line numbers must be found dynamically because earlier wraps shift them — operate in REVERSE order.
BLOCKS = [
    # Task 10
    {
        'marker': r'^          <div id="governance" class="task-reference-block">',
        'sum_zh': '治理控制 · DLP 策略与监控工具链全栈',
        'sum_en': 'Governance Controls · DLP Policies & Monitoring Toolchain',
        'label': '04 / Design &amp; Approve',
        'title': 'Task 10 Reference · Governance Controls',
        'hint_zh': '需要查看 DLP 三层分类规则、Managed Environments 特性或 CoE 监控清单时再展开。',
        'hint_en': 'Expand for the three-tier DLP classification, Managed Environments features, or the CoE monitoring checklist.',
    },
    # Task 8 (reverse: environments, capacity, D, B)
    {
        'marker': r'^          <div id="environments" class="task-reference-block">',
        'sum_zh': '环境策略 · Default / Sandbox / Production 怎么选',
        'sum_en': 'Environment Strategy · Default vs Sandbox vs Production',
        'label': '04 / Design &amp; Approve',
        'title': 'Task 8 Reference · Environment Strategy',
        'hint_zh': '需要确认环境类型差异、创建前置条件或推荐划分模式时展开。',
        'hint_en': 'Expand to confirm environment type differences, creation prerequisites, or recommended segmentation patterns.',
    },
    {
        'marker': r'^          <div id="capacity" class="task-reference-block">',
        'sum_zh': '容量分配 · Dataverse 存储如何按环境预算',
        'sum_en': 'Capacity Allocation · How to Budget Dataverse Storage',
        'label': '04 / Design &amp; Approve',
        'title': 'Task 8 Reference · Capacity Allocation',
        'hint_zh': '需要查询存储类型、容量来源或超额阈值时展开。',
        'hint_en': 'Expand to look up storage types, capacity sources, or overage thresholds.',
    },
    {
        'marker': r'^          <!-- D\. Admin Centers -->',
        'opener_offset': 1,
        'sum_zh': 'D · 两个管理中心 — 你实际在哪里点击',
        'sum_en': 'D · Two Admin Centers — Where You Actually Click',
        'label': '04 / Design &amp; Approve',
        'title': 'Task 8 Reference · Admin Centers',
        'hint_zh': '弄清楚每项设置归 M365 还是 Power Platform 管理中心管。',
        'hint_en': 'Clarify which setting belongs to M365 Admin Center vs Power Platform Admin Center.',
    },
    {
        'marker': r'^          <!-- B\. Management Surface -->',
        'opener_offset': 1,
        'sum_zh': 'B · 管理面 — 每一层可配置什么、由谁配置',
        'sum_en': 'B · Management Surface — What You Configure at Each Level',
        'label': '04 / Design &amp; Approve',
        'title': 'Task 8 Reference · Management Surface',
        'hint_zh': '回答 &quot;要改 X 应该去哪里&quot; 时打开。',
        'hint_en': 'Open when you need to answer &quot;where do I go to change X?&quot;.',
    },
]

def find_marker_line(pattern):
    for i, ln in enumerate(lines):
        if re.match(pattern, ln):
            return i
    raise RuntimeError(f'marker not found: {pattern}')

def wrap_block(block):
    marker_idx = find_marker_line(block['marker'])
    opener_idx = marker_idx + block.get('opener_offset', 0)
    opener_line = lines[opener_idx]
    indent_match = re.match(r'^(\s*)', opener_line)
    indent = indent_match.group(1)
    close_idx = find_div_close(opener_idx, indent)

    # Build details wrapper
    summary_html = (
        f'{indent}<details class="task-collapsible" data-present-step '
        f'data-step-label="{block["label"]}" data-step-title="{block["title"]}">\n'
        f'{indent}  <summary data-zh="{block["sum_zh"]}" data-en="{block["sum_en"]}">{block["sum_en"]}</summary>\n'
        f'{indent}  <p class="tref-summary-hint" data-zh="{block["hint_zh"]}" data-en="{block["hint_en"]}">{block["hint_en"]}</p>\n'
        f'{indent}  <div class="tref-body">\n'
    )
    closer_html = f'{indent}  </div>\n{indent}</details>\n'

    # Strip data-present-step attrs from the opener line (they move to details)
    new_opener = re.sub(r'\s+data-present-step(="[^"]*")?', '', opener_line)
    new_opener = re.sub(r'\s+data-step-label="[^"]*"', '', new_opener)
    new_opener = re.sub(r'\s+data-step-title="[^"]*"', '', new_opener)
    lines[opener_idx] = new_opener

    # Insert at close_idx+1 then opener_idx (reverse for index stability)
    lines.insert(close_idx + 1, closer_html)
    lines.insert(opener_idx, summary_html)

for block in BLOCKS:
    wrap_block(block)

P.write_text(''.join(lines))
print('wrapped', len(BLOCKS), 'reference blocks')
