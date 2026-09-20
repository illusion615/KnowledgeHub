# NanoJev MLX Runtime — Attribution and Scope

The decision-head architecture and candidate encoding are adapted from
[TianyuCodings/NanoJev](https://github.com/TianyuCodings/NanoJev), pinned to
`71a513bb0163b5634467842b523ee0c0ed6fb1c7` (`train_toy_decisions.py` and
`predict_toy_decisions.py`). The MLX Qwen3 backbone is supplied by the separately
installed `mlx-lm` package, under its own license.

This runtime is an independent implementation, not affiliated with TypeSafe,
NanoJev's authors, ZeroDegress, or oMLX. No model weights are redistributed.
The downloaded fine-tuned weights have unresolved licensing in their published
model card; code licensing is not a substitute for permission to use weights or
data commercially.

## Upstream MIT Notice

MIT License

Copyright (c) 2026 OpenJev contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
