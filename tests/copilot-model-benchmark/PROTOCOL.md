# GitHub Copilot Model Benchmark v1

## Purpose

Compare DeepSeek V4 Pro, GPT 5.6 Sol, Gemini 3.1 Pro, and Grok 4.6 inside GitHub Copilot under the same repository, prompts, tool permissions, and grading rules.

## Run Rules

1. Use a fresh Copilot chat for every run. Each model performs two runs.
2. Confirm the selected model in the Copilot UI before submitting the master prompt. The runner records the declared model; current Copilot logs do not expose the selected model per request.
3. The first tool action must be `runner.js begin`. Reading files or running another command first invalidates the speed sample.
4. The final tool action must be `runner.js end`. Work after that marker invalidates the speed sample.
5. Use the same workspace commit and unchanged source lock for all eight runs.
6. Do not reuse another model's answer, session context, generated files, or grader feedback.
7. Do not edit product files. All implementation work goes under `.tmp/copilot-model-benchmark/<run-id>/`.
8. Record failures, retries, test commands, and grader evidence. A failed attempt is part of long-horizon stability, not something to erase.

## Dimensions

| Dimension | Weight | Grading |
|---|---:|---|
| Executable correctness | 25 | Deterministic scheduler tests, including edge cases and immutability |
| Architecture reasoning | 20 | Blinded rubric: architecture, data model, conflict strategy, scaling, trade-offs |
| Long-context diagnosis | 25 | Three source-backed bugs in the locked 4,489-line runtime; false positives lose points |
| Long-horizon stability | 25 | Multi-file fixture implementation, tests, instruction adherence, recovery behavior |
| Observable execution speed | 5 | Median `begin`→`end` duration across two runs, scored only after all models finish |

## Speed Definition

Copilot 0.62.0 VS Code debug logs only contain `session_start`; they do not expose request start, first streamed chunk, completion, or token timestamps. The later `copilot-cli-json-timing-v1` measurement addendum supersedes this limitation for CLI runs because the CLI JSON stream exposes model, assistant, tool, and turn events without changing the frozen task protocol.

The reproducible speed metric is **observable execution duration**: elapsed wall time between the model's first runner action and final runner action. It measures tool-driven agent throughput, including reading, implementation, tests, and repairs, but excludes unknown pre-tool reasoning latency.

After all eight runs, each model's speed value is the median of its two valid durations. The fastest median receives 5 points; other models receive `5 × fastestMedian / modelMedian`, capped at 5 and rounded to one decimal.

## Validity

A run is invalid when the model is misidentified, protocol/source hashes differ, required evidence is absent, timing markers are misplaced, or product files are modified. Invalid runs are repeated; they are not silently repaired in the result table.