#!/usr/bin/env python3
"""One-shot relocation of Stage 3 reference blocks into per-task sections.

Source ranges (1-indexed inclusive) in the current index.html:
  Task 12 close fix:  L3493..3495   ->  </article>\n          </div>\n        </section>
  A. Containers:      L3495..3519   (inclusive of <!-- A. --> comment line)
  B. Mgmt Surface:    L3520..3577
  C. Permission Lyr:  L3578..3603
  D. Admin Centers:   L3604..3623
  Section-end (foundations source-note + </section>): L3624..3626
  §04 capacity inner: L3630..3659
  §05 environments:   L3664..3724
  §06 access:         L3729..3840
  §07 governance:     L3845..3874

Placeholders in destination tasks:
  TASK-8-REFERENCE-INSERT  -> Task 8 (Environment Topology)
  TASK-10-REFERENCE-INSERT -> Task 10 (DLP Exception)
  TASK-11-REFERENCE-INSERT -> Task 11 (Role Plan)

Plan:
  Task 8  gets: A. Containers + B. Management Surface + D. Admin Centers
                + §04 Capacity (preserving #capacity id on inner wrapper)
                + §05 Environments (preserving #environments id)
  Task 10 gets: §07 Governance (preserving #governance id)
  Task 11 gets: C. Permission Layers + §06 Access (preserving #access id)

  Task 12 retains only its own article. Drop the inherited A/B/C/D blocks
  and the foundations-tail source-note inside design-approval.

  Sections #capacity / #environments / #access / #governance get deleted
  (their content moves into tasks; their IDs survive on inner wrapper divs).
"""
from pathlib import Path

PATH = Path(__file__).resolve().parent.parent / "posts/power-platform-governance/index.html"
lines = PATH.read_text(encoding="utf-8").splitlines(keepends=True)

def slice_lines(start, end):
    """1-indexed inclusive slice."""
    return "".join(lines[start - 1:end])

# Capture source blocks BEFORE any mutation
block_A = slice_lines(3495, 3519)
block_B = slice_lines(3520, 3577)
block_C = slice_lines(3578, 3603)
block_D = slice_lines(3604, 3623)
block_capacity_inner = slice_lines(3630, 3659)   # inner of <section id="capacity"> ... </section>
block_env_inner = slice_lines(3664, 3724)
block_access_inner = slice_lines(3729, 3840)
block_gov_inner = slice_lines(3845, 3874)

# Wrap each section's inner content with a div carrying the original id (anchor preserved).
def wrap_with_id(html, anchor_id):
    return (
        f'          <div id="{anchor_id}" class="task-reference-block">\n'
        + html
        + f'          </div>\n'
    )

capacity_wrapped = wrap_with_id(block_capacity_inner, "capacity")
env_wrapped = wrap_with_id(block_env_inner, "environments")
access_wrapped = wrap_with_id(block_access_inner, "access")
gov_wrapped = wrap_with_id(block_gov_inner, "governance")

task8_payload = (
    '          <div class="task-references" data-task-refs="8">\n'
    '            <p class="task-references-kicker" data-zh="任务 8 参考" data-en="Task 8 Reference">Task 8 Reference</p>\n'
    + block_A + block_B + block_D
    + capacity_wrapped + env_wrapped +
    '          </div>\n'
)
task10_payload = (
    '          <div class="task-references" data-task-refs="10">\n'
    '            <p class="task-references-kicker" data-zh="任务 10 参考" data-en="Task 10 Reference">Task 10 Reference</p>\n'
    + gov_wrapped +
    '          </div>\n'
)
task11_payload = (
    '          <div class="task-references" data-task-refs="11">\n'
    '            <p class="task-references-kicker" data-zh="任务 11 参考" data-en="Task 11 Reference">Task 11 Reference</p>\n'
    + block_C + access_wrapped +
    '          </div>\n'
)

# Now mutate the file in REVERSE line order so earlier indexes stay valid.

# (1) Delete §07 governance section block entirely (L3844..3875 inclusive of blank line above? keep blank line above for spacing)
#     Section spans L3844..3875. Also drop the blank separator line L3876 if present.
def replace_range(start, end, replacement):
    """1-indexed inclusive replacement of lines."""
    global lines
    lines = lines[:start - 1] + [replacement] + lines[end:]

def delete_range(start, end):
    """1-indexed inclusive deletion."""
    global lines
    lines = lines[:start - 1] + lines[end:]

# Reverse-order mutations:

# (R1) Delete governance section + preceding blank line: blank at L3843, section L3844..3875
delete_range(3843, 3875)

# (R2) Delete access section + preceding blank: blank L3727, section L3728..3841
delete_range(3727, 3841)

# (R3) Delete environments section + preceding blank: blank L3662, section L3663..3725
delete_range(3662, 3725)

# (R4) Delete capacity section + preceding blank: blank L3628, section L3629..3660
delete_range(3628, 3660)

# (R5) Replace Task 12 inherited tail (L3493..3626): orphan </div> + A/B/C/D + source-note + </section>
#      with: proper Task 12 close </article></div></section>
replace_range(
    3493,
    3626,
    '              </article>\n'
    '          </div>\n'
    '        </section>\n',
)

# Now insert task references at the placeholder markers.
text = "".join(lines)
text = text.replace(
    '          <!-- TASK-11-REFERENCE-INSERT -->\n',
    task11_payload,
)
text = text.replace(
    '          <!-- TASK-10-REFERENCE-INSERT -->\n',
    task10_payload,
)
text = text.replace(
    '          <!-- TASK-8-REFERENCE-INSERT -->\n',
    task8_payload,
)

PATH.write_text(text, encoding="utf-8")
print("relocation complete")
