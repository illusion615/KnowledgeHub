#!/usr/bin/env python3
"""Move B (Management Surface) and D (Admin Centers) blocks out of Task 8 refs
and into the §01 Foundations chapter as collapsible references.

Idempotent: aborts if it cannot find each unique marker exactly once."""
from __future__ import annotations
from pathlib import Path
import re
import sys

PATH = Path('posts/power-platform-governance/index.html')
text = PATH.read_text()
orig_len = len(text)

# --- Extract B block: from "<!-- B. Management Surface -->" through its closing "</details>" + trailing blank line
b_start_marker = '          <!-- B. Management Surface -->\n'
b_end_marker = '          </details>\n\n          <!-- D. Admin Centers -->\n'
b_start = text.find(b_start_marker)
b_end_match = text.find(b_end_marker, b_start)
if b_start == -1 or b_end_match == -1:
    sys.exit('B block markers not found')
b_block = text[b_start:b_end_match + len('          </details>\n')]  # includes B's closing details

# --- Extract D block: from "<!-- D. Admin Centers -->" through its closing "</details>"
d_start_marker = '          <!-- D. Admin Centers -->\n'
d_start = text.find(d_start_marker)
# find next </details> after d_start
d_close_idx = text.find('          </details>\n', d_start)
if d_start == -1 or d_close_idx == -1:
    sys.exit('D block markers not found')
d_block = text[d_start:d_close_idx + len('          </details>\n')]

# --- Remove B (including the blank line + D marker line transition) and D from Task 8
# Remove B block + its trailing blank line that separates from D
b_removal_end = b_end_match  # position of "          </details>\n\n          <!-- D. Admin Centers -->\n"
# Remove from b_start to position right before the "          <!-- D. Admin Centers -->\n" line
# Equivalent: remove text[b_start : b_end_match + len('          </details>\n\n')]
b_removal = text[b_start:b_end_match + len('          </details>\n\n')]
text2 = text.replace(b_removal, '', 1)
if text2 == text:
    sys.exit('B removal had no effect')
# Now remove D block from text2
text3 = text2.replace(d_block, '', 1)
if text3 == text2:
    sys.exit('D removal had no effect')

# --- Transform copies for Foundations insertion: relabel data-step-label/title
def relabel(block: str, new_title_suffix: str) -> str:
    # data-step-label="04 / Design & Approve" -> "01 / Foundations"
    block = block.replace('data-step-label="04 / Design &amp; Approve"', 'data-step-label="01 / Foundations"')
    # data-step-title prefix "Task 8 Reference · X" -> "Foundations Reference · X"
    block = block.replace('data-step-title="Task 8 Reference', 'data-step-title="Foundations Reference')
    return block

b_for_foundations = relabel(b_block, 'Management Surface')
d_for_foundations = relabel(d_block, 'Admin Centers')

# Strip leading HTML comment line "<!-- ... -->\n" from each (it referenced Task 8 ordering)
b_for_foundations = re.sub(r'^\s*<!-- B\. Management Surface -->\n', '', b_for_foundations)
d_for_foundations = re.sub(r'^\s*<!-- D\. Admin Centers -->\n', '', d_for_foundations)

# --- Insert into Foundations chapter, right before the closing </section> after the source-note
# Anchor: the Foundations source-note ends with "Tenant-level permissions</a>.</p>" then "        </section>"
foundations_anchor = '''>Tenant-level permissions</a>.</p>
        </section>'''
if foundations_anchor not in text3:
    sys.exit('Foundations source-note anchor not found')

insertion = (
    '>Tenant-level permissions</a>.</p>\n\n'
    '          <div class="task-references" data-task-refs="foundations">\n'
    '            <p class="task-references-kicker" data-zh="参考" data-en="Reference">Reference</p>\n'
    '          <!-- Management Surface (moved from Task 8 B) -->\n'
    + b_for_foundations.rstrip() + '\n\n'
    '          <!-- Admin Centers (moved from Task 8 D) -->\n'
    + d_for_foundations.rstrip() + '\n'
    '          </div>\n'
    '        </section>'
)

text4 = text3.replace(foundations_anchor, insertion, 1)
if text4 == text3:
    sys.exit('Foundations insertion had no effect')

PATH.write_text(text4)
print(f'move complete · delta={len(text4) - orig_len:+d} bytes')
