# MiniMax-Music3 原生 MLX 本机部署与调用指南

在 Apple Silicon（如 MacBook Pro M4 Max 64GB）上，官方原版推理管线受限于独显算子锁，无法直接运行。本仓库通过独立虚拟环境挂载 `mlx-audio`，离线调用 `mlx-community/MiniMax-Music3-mxfp8` 量化权重（3 个分片共 13.87 GB，输出 44.1 kHz 双声道立体声），并提供命令行脚本与本机回环 HTTP 服务。

## 运行环境与本地缓存位置

运行时与模型权重均存放在仓库外部，避免污染 Git 工作树或其他本地模型服务：

- **独立 Python 环境**：`~/.local/share/local-generation/minimax-music3-mlx/bin/python`（含 `mlx`、`mlx-audio` 与音频编码依赖）。
- **权重快照缓存**：`~/.cache/huggingface/hub/models--mlx-community--MiniMax-Music3-mxfp8`（含 `model-00001-of-00003.safetensors` 至 `00003` 共 13.87 GB）。
- **服务默认输出目录**：`~/.cache/study-room/minimax-music3-mlx/outputs`；连接元数据写入 `~/.cache/study-room/minimax-music3-mlx/connection.json`（权限 `0600`）。

封装入口会自动检测当前解释器；若直接用系统 `python3` 启动脚本，程序会自动切换至上述独立环境执行，并在加载阶段开启 `HF_HUB_OFFLINE=1` 阻断运行期联网请求。

## 命令行一键生成

在仓库根目录调用 `scripts/generate-minimax-music-mlx.py`，即可将风格提示词与分段歌词渲染为 16-bit PCM 立体声波形文件：

```bash
python3 scripts/generate-minimax-music-mlx.py \
  --prompt "Genre: Mandarin indie pop. BPM: 96. Key: C major. Vocals: warm intimate female lead. Arrangement: fingerpicked acoustic guitar in verse, soft brushed drums in chorus." \
  --lyrics $'[verse]\n晚风吹过霓虹闪烁的街口\n耳机里循环着未写完的前奏\n[chorus]\n让整座城市的星光为你停留' \
  --duration 30 \
  --steps 30 \
  --output /tmp/minimax_demo.wav
```

纯器乐片段无需编写歌词，直接传入 `--lyrics "[instrumental]"`（或不传 `--lyrics`，默认即为器乐标签）。加上 `--json` 可输出包含采样率、均方根振幅、文件字节数、SHA-256 摘要与推理耗时的单行结构化记录。正式长耗时渲染前，建议先附加 `--lint-only` 在毫秒级离线检查三段式提示词覆盖度、音节密度与段落标签换行隐患（`[verse]`、`[chorus]` 标签必须独占一行，否则同行歌词会被底层正则静默截断）。完整声学诊断、歌词律动切分与重编示范详见 [《MiniMax-Music3 成曲平淡成因诊断与编曲进阶控制指南》](./minimax-music3-arrangement-guide.md)。

## 本机回环 HTTP 服务（`127.0.0.1:18790`）

启动常驻回环服务（默认按需懒加载权重，传 `--eager-load` 可在启动时预热至统一内存；传 `--require-token` 可强制校验请求头 `X-MiniMax-Music-Token`）：

```bash
python3 scripts/serve-minimax-music-mlx.py --port 18790
```

### 1. 健康探针 `GET /api/health`

不触发模型加载或推理，直接返回权重快照路径与并发配额：

```bash
curl -s http://127.0.0.1:18790/api/health | python3 -m json.tool
```

### 2. 歌曲生成 `POST /api/generate`

请求体为严格校验的 JSON 对象（拒绝重复键与非有限浮点数），单进程串行闸门在并发冲突时立即返回 `429 {"error":{"code":"busy"}}`：

```bash
curl -s -X POST http://127.0.0.1:18790/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Genre: lo-fi chillhop. BPM: 84. Warm Rhodes piano, vinyl crackle, mellow bassline.",
    "lyrics": "[instrumental]",
    "duration": 10,
    "steps": 20,
    "seed": 42
  }' | python3 -m json.tool
```

主要参数约束：

| 字段 | 类型与默认值 | 取值边界与说明 |
|---|---|---|
| `prompt`（或 `caption`） | 字符串（必填） | 1 ~ 4096 字符；建议按曲风速度、人声质感、配器推进组织 |
| `lyrics` | 字符串，默认 `"[instrumental]"` | 1 ~ 8192 字符；器乐曲保留默认值 |
| `duration` | 数值，默认 `30.0` | `1.0` ~ `360.0` 秒 |
| `steps` | 整数，默认 `30` | `1` ~ `100` 步；快速试听可设为 `12` ~ `20` |
| `seed` | 整数，默认 `0` | `0` ~ `2147483647` |
| `temperature` | 数值，默认 `1.0` | `0.1` ~ `2.0`；上调至 `1.08` ~ `1.15` 可增强旋律与说唱切分弹性 |
| `ar_cfg_scale` | 数值，默认 `1.5` | `1.0` ~ `5.0`；自回归阶段对提示词与分段标签的服从强度 |
| `ar_top_k` | 整数，默认 `50` | `1` ~ `250`；自回归每帧语义与残差码本的候选截断宽度 |
| `dit_cfg_scale` | 数值，默认 `1.7` | `1.0` ~ `5.0`；流匹配声学去噪引导尺度 |
| `output_path` | 字符串（可选） | 必须以 `.wav` 结尾且位于服务配置的 `--output-dir` 目录内 |
| `return_audio_base64` | 布尔值，默认 `false` | 设为 `true` 时在响应字段 `audio_base64` 内附带编码后的音频字节 |

关于如何解决成曲动态扁平、歌词过密念经与编曲糊频问题，详见[《AI 编曲审美与 MiniMax-Music3 高阶掌控秘籍》](./ai-songwriting-and-minimax-music3-mastery.md)。

## 安全边界与许可说明

- 服务仅绑定 `127.0.0.1`，严格校验 `Host` 请求头，并拒绝携带浏览器 `Origin` 头的跨源直连写入。
- 单元测试（`pytest -q tests/test_minimax_music_mlx.py`）使用内存桩模拟推理契约、路径越界拦截与单飞并发锁，毫秒级完成校验且不触碰真实权重。
- 模型权重遵循 MiniMax 社区许可条款（年营收低于 2000 万美元的场景可商用，超出需另行获取商业授权）。
