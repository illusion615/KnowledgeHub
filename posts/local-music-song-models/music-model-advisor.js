// posts/local-music-song-models/music-model-advisor.js
// Pure static hardware x creative-scenario model advisor & CLI generator.
// Zero backend dependencies — runs 100% locally on GitHub Pages.

(function () {
  'use strict';

  var HARDWARE_OPTIONS = [
    { id: 'm4max64', zh: 'M4 Max 64GB (MLX/MPS)', en: 'M4 Max 64GB (MLX/MPS)' },
    { id: 'mac24', zh: 'Mac 24~32GB (Apple Silicon)', en: 'Mac 24-32GB (Apple Silicon)' },
    { id: 'gpu24', zh: 'RTX 3090 / 4090 24GB (CUDA)', en: 'RTX 3090 / 4090 24GB (CUDA)' },
    { id: 'gpu12', zh: '主流 12~16GB 独显', en: '12-16GB Mainstream GPU' }
  ];

  var TASK_OPTIONS = [
    { id: 'vocal', zh: '中文歌词全曲演唱', en: 'Full Song w/ Chinese Vocals' },
    { id: 'bgm', zh: '纯器乐氛围与配乐', en: 'Instrumental & Ambient BGM' },
    { id: 'fast', zh: '10 秒极速出小样', en: '10s Rapid Demo Sketch' },
    { id: 'commercial', zh: '严苛商用合规二创', en: 'Commercial-Safe Production' }
  ];

  var MATRIX = {
    'm4max64:vocal': {
      model: { zh: 'MiniMax Music 3 (MXFP8 原生 MLX)', en: 'MiniMax Music 3 (MXFP8 Native MLX)' },
      license: { zh: '社区商用许可 (<$20M/年)', en: 'Community License (<$20M/yr)' },
      reason: {
        zh: '64GB 统一内存可零卸载常驻 13.87 GB 的 MiniMax-Music3-mxfp8 权重（对比 Hugging Face 原仓 28.51 GB 模块化 BF16 权重，保留高咬字精度，WildSongBench 音素错误率仅 6.27%），通过 mlx-audio 或 SGLang-Omni 原生 MLX 服务直接输出 5 分钟级双语流行全曲。',
        en: '64GB unified memory keeps the 13.87 GB MiniMax-Music3-mxfp8 checkpoint fully resident with zero offload (vs 28.51 GB modular BF16), preserving top lyric articulation (6.27% PER on WildSongBench) via mlx-audio.'
      },
      mem: { zh: '17.5 ~ 20.5 GiB', en: '17.5 - 20.5 GiB' },
      latency: { zh: '约 140~165 秒 / 3 分钟曲', en: '~140-165s / 3-min song' },
      stack: { zh: 'mlx-audio (Apple MLX)', en: 'mlx-audio (Apple MLX)' },
      cmd: 'pip install -U mlx-audio\npython -m mlx_audio.music.generate \\\n  --model mlx-community/MiniMax-Music3-mxfp8 \\\n  --caption "Mandarin indie pop, 96 BPM, warm female vocal, acoustic guitar and strings" \\\n  --lyrics-file lyrics.txt --duration 180 --steps 30 --output song.wav',
      alts: [
        {
          name: { zh: '备选 1：ACE-Step 1.5 XL (start_gradio_ui_macos.sh)', en: 'Alt 1: ACE-Step 1.5 XL (MLX Gradio)' },
          desc: { zh: 'MIT 协议无门槛商用，4B DiT + 4B Qwen3 规划器全常驻仅占约 16 GiB，支持封面重绘与本地 LoRA。', en: 'MIT license, 4B DiT + 4B LM takes ~16 GiB on MLX with cover repainting and LoRA support.' }
        },
        {
          name: { zh: '备选 2：YuE2-3B (8-bit MLX / ABC 白盒改谱)', en: 'Alt 2: YuE2-3B (8-bit MLX / Editable Score)' },
          desc: { zh: '适合先导出 score.abc 手工改和弦走向再合成，注意权重为 CC-BY-NC-4.0 非商用。', en: 'Exports editable score.abc for white-box chord reharmonization; CC-BY-NC-4.0 non-commercial weights.' }
        }
      ]
    },
    'm4max64:bgm': {
      model: { zh: 'Magenta RealTime 2 Base (2.4B MLX) + Stable Audio 3', en: 'Magenta RealTime 2 Base (2.4B MLX) + Stable Audio 3' },
      license: { zh: 'Apache-2.0 (MRT2) / 社区许可', en: 'Apache-2.0 (MRT2) / Community' },
      reason: {
        zh: 'M4 Max 是 Google 官方认证可实时流式运行 mrt2_base (2.4B) 的芯片档位，生成速度大于播放速度，还可直接编译为 Logic Pro 的 AUv3 插件；长篇高保真立体声采样可搭配 mlx-audio 下的 Stable Audio 3 Medium。',
        en: 'M4 Max runs the 2.4B mrt2_base model faster than real-time with native AUv3 DAW integration, complemented by Stable Audio 3 Medium on MLX.'
      },
      mem: { zh: '6.2 ~ 9.5 GiB', en: '6.2 - 9.5 GiB' },
      latency: { zh: '实时流式 (RTF < 0.8)', en: 'Live Streaming (RTF < 0.8)' },
      stack: { zh: 'magenta-rt[mlx] / C++ Core', en: 'magenta-rt[mlx] / C++ Core' },
      cmd: 'uv pip install "magenta-rt[mlx]"\nmrt models init && mrt models download\nmrt mlx generate --prompt "warm neo-soul Rhodes piano, brushed drums, 88 BPM" \\\n  --duration 60.0 --model=mrt2_base',
      alts: [
        {
          name: { zh: '备选 1：Stable Audio 3 Medium (mlx-audio)', en: 'Alt 1: Stable Audio 3 Medium (mlx-audio)' },
          desc: { zh: '8 步 Ping-Pong 采样直出最长 380 秒 44.1kHz 立体声配乐与环境音效。', en: '8-step ping-pong sampling for up to 380s of 44.1 kHz stereo music and sound effects.' }
        },
        {
          name: { zh: '备选 2：ACE-Step 1.5 Vocal2BGM 伴奏轨道', en: 'Alt 2: ACE-Step 1.5 Instrumental / Vocal2BGM' },
          desc: { zh: '支持干声自动配器伴奏或纯器乐分轨生成，MIT 协议直接进商业项目。', en: 'Generates multi-layer instrumental arrangements or BGM from dry vocals under MIT license.' }
        }
      ]
    },
    'm4max64:fast': {
      model: { zh: 'ACE-Step 1.5 Turbo (MLX 原生 8 步)', en: 'ACE-Step 1.5 Turbo (MLX Native 8-Step)' },
      license: { zh: 'MIT 开源协议', en: 'MIT Open License' },
      reason: {
        zh: '采用无分类器引导蒸馏的 8 步 Turbo DiT 配合 MLX 原生后端，在 M4 Max 上十余秒即可拉出完整 3 分钟带词小样，适合高频抽卡试错词曲结构。',
        en: 'Distilled 8-step CFG-free Turbo DiT on native MLX produces 3-minute lyric demos in seconds on M4 Max for rapid creative iteration.'
      },
      mem: { zh: '8.0 ~ 12.4 GiB', en: '8.0 - 12.4 GiB' },
      latency: { zh: '约 14~22 秒 / 3 分钟曲', en: '~14-22s / 3-min song' },
      stack: { zh: 'ACE-Step MLX 启动脚本', en: 'ACE-Step MLX Launcher' },
      cmd: 'git clone https://github.com/ACE-Step/ACE-Step-1.5.git && cd ACE-Step-1.5\nchmod +x start_gradio_ui_macos.sh\n./start_gradio_ui_macos.sh',
      alts: [
        {
          name: { zh: '备选 1：DiffRhythm v1.2 (MPS 非自回归)', en: 'Alt 1: DiffRhythm v1.2 (MPS NAR)' },
          desc: { zh: '纯潜在扩散省去自回归逐帧等待，单次前向去噪即可合成双声道带词歌曲。', en: 'Pure non-autoregressive latent diffusion synthesizes full stereo songs without token-by-token latency.' }
        },
        {
          name: { zh: '备选 2：MiniMax Music 3 (4-bit MLX)', en: 'Alt 2: MiniMax Music 3 (4-bit MLX)' },
          desc: { zh: '9.20 GB 极轻量权重，把时长设为 30 秒可快速试听主副歌过渡段落。', en: '9.20 GB 4-bit weights; set duration=30s to audition verse-to-chorus transitions quickly.' }
        }
      ]
    },
    'm4max64:commercial': {
      model: { zh: 'ACE-Step 1.5 XL SFT + HeartMuLa-oss-3B 组合', en: 'ACE-Step 1.5 XL SFT + HeartMuLa-oss-3B Combo' },
      license: { zh: 'MIT + Apache-2.0（完全免版税商用）', en: 'MIT + Apache-2.0 (Royalty-Free)' },
      reason: {
        zh: '彻底规避 CC-BY-NC 与营收分成红线：ACE-Step 1.5 全系采用 MIT 协议，HeartMuLa-oss-3B 采用 Apache-2.0 协议，二者在 64GB 统一内存下均可全精度常驻。',
        en: 'Eliminates non-commercial and revenue-cap risks: ACE-Step 1.5 (MIT) and HeartMuLa-oss-3B (Apache-2.0) both run at full precision in 64GB unified memory.'
      },
      mem: { zh: '15.5 ~ 18.0 GiB', en: '15.5 - 18.0 GiB' },
      latency: { zh: '约 25~40 秒 (ACE XL)', en: '~25-40s (ACE XL)' },
      stack: { zh: 'ACE-Step MLX / audio.cpp Metal', en: 'ACE-Step MLX / audio.cpp Metal' },
      cmd: 'git clone https://github.com/ACE-Step/ACE-Step-1.5.git && cd ACE-Step-1.5\nACESTEP_CONFIG_PATH=acestep-v15-xl-sft \\\nACESTEP_LM_MODEL_PATH=acestep-5Hz-lm-4B \\\n./start_gradio_ui_macos.sh',
      alts: [
        {
          name: { zh: '备选 1：HeartMuLa-oss-3B (Apache-2.0)', en: 'Alt 1: HeartMuLa-oss-3B (Apache-2.0)' },
          desc: { zh: '多语种歌词控制力强，WildSongBench 综合分达 6.25，适合商业短视频与独立游戏主题曲。', en: 'Strong multilingual lyric control (6.25 on WildSongBench) under permissive Apache-2.0.' }
        },
        {
          name: { zh: '备选 2：DiffRhythm 2 (Apache-2.0)', en: 'Alt 2: DiffRhythm 2 (Apache-2.0)' },
          desc: { zh: '西工大开源块流匹配架构，Apache-2.0 协议清晰，适合批量生产背景唱段。', en: 'Block flow-matching architecture under clean Apache-2.0 licensing for batch production.' }
        }
      ]
    },
    'mac24:vocal': {
      model: { zh: 'MiniMax Music 3 (4-bit MLX / 分阶段卸载)', en: 'MiniMax Music 3 (4-bit MLX / Stage Offload)' },
      license: { zh: '社区商用许可 (<$20M/年)', en: 'Community License (<$20M/yr)' },
      reason: {
        zh: '24~32GB Mac 跑 28.5 GB BF16 会触发剧烈 Swap，但切换至 9.20 GB 的 4-bit MLX 权重（或在 24GB 机器启用 SGLang-Omni 原生 --stage-offload-components ar,dit）即可稳定运行，且官方已在 24GiB M5 上跑通中英文黄金校验。',
        en: 'While 28.5 GB BF16 swaps heavily on 24-32GB Macs, the 9.20 GB 4-bit MLX build (or MXFP8 with --stage-offload-components ar,dit) runs cleanly within unified RAM.'
      },
      mem: { zh: '11.5 ~ 14.2 GiB', en: '11.5 - 14.2 GiB' },
      latency: { zh: '约 160~210 秒 / 3 分钟曲', en: '~160-210s / 3-min song' },
      stack: { zh: 'mlx-audio 4-bit / music3_server', en: 'mlx-audio 4-bit / music3_server' },
      cmd: {
        zh: 'pip install -U mlx-audio\npython -m mlx_audio.music.generate \\\n  --model mlx-community/MiniMax-Music3-4bit \\\n  --caption "Warm Mandarin ballad, piano and cello, 76 BPM" \\\n  --lyrics $"[verse]\\n街灯把影子拉得很长\\n[chorus]\\n风吹过旧站台" --duration 90 --output song.wav',
        en: 'pip install -U mlx-audio\npython -m mlx_audio.music.generate \\\n  --model mlx-community/MiniMax-Music3-4bit \\\n  --caption "Warm indie ballad, piano and cello, 76 BPM" \\\n  --lyrics $"[verse]\\nStreetlights stretch the evening shadows\\n[chorus]\\nWind drifts past the old station" --duration 90 --output song.wav'
      },
      alts: [
        {
          name: { zh: '备选 1：ACE-Step 1.5 (2B Turbo + 1.7B LM)', en: 'Alt 1: ACE-Step 1.5 (2B Turbo + 1.7B LM)' },
          desc: { zh: '仅占约 8~10 GiB 统一内存，速度远快于自回归大模型，适合日常主力创作。', en: 'Uses only 8-10 GiB unified memory and generates much faster than large AR backbones.' }
        }
      ]
    },
    'mac24:bgm': {
      model: { zh: 'Magenta RealTime 2 Small (230M MLX)', en: 'Magenta RealTime 2 Small (230M MLX)' },
      license: { zh: 'Apache-2.0', en: 'Apache-2.0' },
      reason: {
        zh: '230M 参数在 MacBook Air 乃至 24GB MacBook Pro 上均可轻松实现超实时流式生成，后台常驻几乎不抢占 IDE 与浏览器内存。',
        en: '230M model streams faster than real-time on any Apple Silicon Mac including Air models with minimal memory overhead.'
      },
      mem: { zh: '1.8 ~ 2.6 GiB', en: '1.8 - 2.6 GiB' },
      latency: { zh: '超实时流式输出', en: 'Faster-than-realtime stream' },
      stack: { zh: 'magenta-rt[mlx]', en: 'magenta-rt[mlx]' },
      cmd: 'uv pip install "magenta-rt[mlx]"\nmrt models init && mrt models download\nmrt mlx generate --prompt "ambient synth pad and gentle rain lo-fi" --duration 45.0 --model=mrt2_small',
      alts: [
        {
          name: { zh: '备选 1：Stable Audio Open Small (CoreML / MLX)', en: 'Alt 1: Stable Audio Open Small (CoreML / MLX)' },
          desc: { zh: '341M 极轻量立体声扩散模型，几秒内生成高保真过渡音效与循环鼓组。', en: '341M stereo diffusion model generating crisp SFX and drum loops in seconds.' }
        }
      ]
    },
    'mac24:fast': {
      model: { zh: 'ACE-Step 1.5 (2B Turbo · MLX 4-bit/8-bit)', en: 'ACE-Step 1.5 (2B Turbo · MLX 4-bit/8-bit)' },
      license: { zh: 'MIT 开源协议', en: 'MIT Open License' },
      reason: {
        zh: '2B DiT 搭配 0.6B 或 1.7B 规划模型在 24GB Mac 上游刃有余，开启 8 步 Turbo 后半分钟内即可拿到完整主副歌。',
        en: '2B DiT paired with 0.6B/1.7B LM fits comfortably in 24GB RAM, delivering full songs in under half a minute.'
      },
      mem: { zh: '6.8 ~ 9.2 GiB', en: '6.8 - 9.2 GiB' },
      latency: { zh: '约 18~28 秒 / 3 分钟曲', en: '~18-28s / 3-min song' },
      stack: { zh: 'ACE-Step MLX', en: 'ACE-Step MLX' },
      cmd: 'git clone https://github.com/ACE-Step/ACE-Step-1.5.git && cd ACE-Step-1.5\nACESTEP_CONFIG_PATH=acestep-v15-turbo ACESTEP_LM_MODEL_PATH=acestep-5Hz-lm-0.6B ./start_gradio_ui_macos.sh',
      alts: [
        {
          name: { zh: '备选 1：audio.cpp Metal 后端', en: 'Alt 1: audio.cpp Metal Backend' },
          desc: { zh: '纯 C++ 零 Python 依赖，直接加载 GGUF 量化组件包节省运行时内存。', en: 'Pure C++ ggml runtime with zero Python overhead and compact GGUF memory footprint.' }
        }
      ]
    },
    'mac24:commercial': {
      model: { zh: 'ACE-Step 1.5 (2B SFT / Turbo · MIT)', en: 'ACE-Step 1.5 (2B SFT / Turbo · MIT)' },
      license: { zh: 'MIT 开源协议', en: 'MIT Open License' },
      reason: {
        zh: 'MIT 协议无任何商用附加条款，2B SFT 版本在 24GB 统一内存下无需激进量化即可保持细腻人声与配器分离度。',
        en: 'Unrestricted MIT license; 2B SFT runs cleanly on 24GB Macs without aggressive quantization.'
      },
      mem: { zh: '8.5 ~ 11.0 GiB', en: '8.5 - 11.0 GiB' },
      latency: { zh: '约 25~45 秒 / 3 分钟曲', en: '~25-45s / 3-min song' },
      stack: { zh: 'ACE-Step MLX', en: 'ACE-Step MLX' },
      cmd: 'git clone https://github.com/ACE-Step/ACE-Step-1.5.git && cd ACE-Step-1.5\nACESTEP_CONFIG_PATH=acestep-v15-sft ACESTEP_LM_MODEL_PATH=acestep-5Hz-lm-1.7B ./start_gradio_ui_macos.sh',
      alts: [
        {
          name: { zh: '备选 1：DiffRhythm 2 (Apache-2.0)', en: 'Alt 1: DiffRhythm 2 (Apache-2.0)' },
          desc: { zh: 'Apache-2.0 协议，块流匹配显存占用约 8~10 GiB，适合轻量商用生产。', en: 'Apache-2.0 block flow-matching model using ~8-10 GiB memory.' }
        }
      ]
    },
    'gpu24:vocal': {
      model: { zh: 'YuE2-3B (BF16 免量化) / MiniMax Music 3 (Offload 或 Q8)', en: 'YuE2-3B (BF16 Native) / MiniMax Music 3 (Offload or Q8)' },
      license: { zh: 'CC-BY-NC-4.0 (YuE2) / 社区商用 (Music 3)', en: 'CC-BY-NC-4.0 (YuE2) / Community (Music 3)' },
      reason: {
        zh: '24GB CUDA 卡是当前开源歌曲模型的黄金靶机：跑 YuE2-3B 全精度峰值仅 11.18 GiB（RTX 4090 实测 71 秒出 3.6 分钟 48kHz 立体声全曲，WildSongBench 榜首）；跑 MiniMax Music 3 可用 diffusers 自动 CPU 卸载（~22 GiB）或 audio.cpp Q8（13.4 GiB）。',
        en: '24GB CUDA is the sweet spot: YuE2-3B peaks at 11.18 GiB in full BF16 (71s for a 3.6-min 48 kHz song on RTX 4090), while MiniMax Music 3 fits in ~22 GiB with auto offload or 13.4 GiB in Q8.'
      },
      mem: { zh: '11.2 GiB (YuE2) / 13.4~22 GiB (Music 3)', en: '11.2 GiB (YuE2) / 13.4-22 GiB (Music 3)' },
      latency: { zh: '71 秒 / 215 秒全曲 (RTX 4090)', en: '71s / 215s song (RTX 4090)' },
      stack: { zh: 'PyTorch CUDA Graphs + FlashAttn', en: 'PyTorch CUDA Graphs + FlashAttn' },
      cmd: 'git clone https://github.com/multimodal-art-projection/YuE.git && cd YuE\nuv sync --extra cuda\nuv run python examples/generate.py --output outputs/first-song',
      alts: [
        {
          name: { zh: '商用平替：MiniMax Music 3 (audio.cpp Q8 / ComfyUI)', en: 'Commercial Pick: MiniMax Music 3 (Q8 / ComfyUI)' },
          desc: { zh: 'Q8 峰值显存 13.4 GiB，实时率 1.20x，兼具顶级中文咬字与年营收 2000 万美元内商用授权。', en: 'Q8 peaks at 13.4 GiB (1.20x realtime) with top Chinese articulation and <$20M commercial rights.' }
        },
        {
          name: { zh: '微调首选：ACE-Step 1.5 XL (4B DiT + 4B LM)', en: 'Fine-Tune Pick: ACE-Step 1.5 XL (4B DiT + 4B LM)' },
          desc: { zh: '24GB 可无卸载全常驻 XL 模型，且支持 8 首干声 1 小时训出专属风格 LoRA。', en: 'Fits XL 4B DiT + 4B LM with zero offload and trains custom style LoRAs in 1 hour on 3090.' }
        }
      ]
    },
    'gpu24:bgm': {
      model: { zh: 'Stable Audio Open 1.0 + Meta JASCO (和弦鼓点控制)', en: 'Stable Audio Open 1.0 + Meta JASCO (Chord/Drum Control)' },
      license: { zh: 'Stability 社区许可 / CC-BY-NC', en: 'Stability Community / CC-BY-NC' },
      reason: {
        zh: '在 24GB CUDA 上，Stable Audio Open 1.0 几秒内即可渲染高动态 44.1kHz 立体声配乐；若需严格对齐视频分镜的和弦进行与鼓点切分，可调用 JASCO 时间轴条件控制。',
        en: '24GB CUDA renders 44.1 kHz stereo clips in seconds via Stable Audio Open 1.0, while JASCO provides bar-level chord and drum conditioning.'
      },
      mem: { zh: '5.5 ~ 8.0 GiB', en: '5.5 - 8.0 GiB' },
      latency: { zh: '约 2~5 秒 / 47 秒立体声片段', en: '~2-5s / 47s stereo clip' },
      stack: { zh: 'stable-audio-tools / ComfyUI', en: 'stable-audio-tools / ComfyUI' },
      cmd: 'git clone https://github.com/Stability-AI/stable-audio-tools.git && cd stable-audio-tools\nuv sync --extra ui\nuv run python run_gradio.py --pretrained-name stabilityai/stable-audio-open-1.0',
      alts: [
        {
          name: { zh: '备选 1：TangoFlux (Rectified Flow + CRPO)', en: 'Alt 1: TangoFlux (Rectified Flow + CRPO)' },
          desc: { zh: '25~50 步流匹配极速生成 30 秒 44.1kHz 拟音与环境声效，提示词遵循度高。', en: '25-50 step rectified flow generating faithful 30s 44.1 kHz foley and ambient audio.' }
        }
      ]
    },
    'gpu24:fast': {
      model: { zh: 'ACE-Step 1.5 XL Turbo (vLLM + CUDA)', en: 'ACE-Step 1.5 XL Turbo (vLLM + CUDA)' },
      license: { zh: 'MIT 开源协议', en: 'MIT Open License' },
      reason: {
        zh: 'RTX 3090 实测 2B Turbo 生成整首歌曲不到 10 秒，升级至 4B XL Turbo 在 24GB 显存内同样免卸载全速运行，支持一次并发抽卡 8 首歌。',
        en: 'Generates a full song in under 10s on RTX 3090 (2B Turbo) and runs 4B XL Turbo with zero offload and batch sizes up to 8.'
      },
      mem: { zh: '14.5 ~ 19.0 GiB', en: '14.5 - 19.0 GiB' },
      latency: { zh: '<10 秒 (2B) / ~16 秒 (XL)', en: '<10s (2B) / ~16s (XL)' },
      stack: { zh: 'ACE-Step + vLLM CUDA', en: 'ACE-Step + vLLM CUDA' },
      cmd: 'git clone https://github.com/ACE-Step/ACE-Step-1.5.git && cd ACE-Step-1.5\nuv sync\nuv run acestep',
      alts: [
        {
          name: { zh: '备选 1：DiffRhythm 2 (Block Flow Matching)', en: 'Alt 1: DiffRhythm 2 (Block Flow Matching)' },
          desc: { zh: '半自回归分块流匹配兼顾秒级吞吐与副歌段落衔接。', en: 'Semi-autoregressive block flow matching balances fast throughput and chorus coherence.' }
        }
      ]
    },
    'gpu24:commercial': {
      model: { zh: 'ACE-Step 1.5 XL SFT (MIT) + MiniMax Music 3 (ComfyUI)', en: 'ACE-Step 1.5 XL SFT (MIT) + MiniMax Music 3 (ComfyUI)' },
      license: { zh: 'MIT / 社区许可 (<$20M)', en: 'MIT / Community (<$20M)' },
      reason: {
        zh: '需要完全开放开源协议选 ACE-Step 1.5 XL（MIT，支持一键训练自家曲库 LoRA）；追求商业发行级流行人声质感且年营收低于 2000 万美元，可直接拉取下载量超 140 万次的 Comfy-Org/MiniMax-Music-3 工作流。',
        en: 'Use ACE-Step 1.5 XL (MIT) for unrestricted commercial LoRA workflows, or Comfy-Org/MiniMax-Music-3 (<$20M revenue cap) for studio vocal polish.'
      },
      mem: { zh: '16.5 ~ 21.8 GiB', en: '16.5 - 21.8 GiB' },
      latency: { zh: '约 18~35 秒 (ACE XL)', en: '~18-35s (ACE XL)' },
      stack: { zh: 'ComfyUI 原生节点 / vLLM', en: 'ComfyUI Native Nodes / vLLM' },
      cmd: {
        zh: 'pip install git+https://github.com/huggingface/diffusers@dafe3733fcfdbf3c48915fe77be3aef65b5d6a2d transformers accelerate soundfile\n# 在 Python 中启用 ComponentsManager.enable_auto_cpu_offload(device="cuda") 稳定控制在 ~22GB 内',
        en: 'pip install git+https://github.com/huggingface/diffusers@dafe3733fcfdbf3c48915fe77be3aef65b5d6a2d transformers accelerate soundfile\n# Enable ComponentsManager.enable_auto_cpu_offload(device="cuda") in Python to cap peak VRAM at ~22GB'
      },
      alts: [
        {
          name: { zh: '备选 1：HeartMuLa-oss-3B (Apache-2.0)', en: 'Alt 1: HeartMuLa-oss-3B (Apache-2.0)' },
          desc: { zh: 'Apache-2.0 授权清晰，配备 MuLaCover 可控翻唱与编曲重塑扩展。', en: 'Clean Apache-2.0 license with MuLaCover controllable remix and cover extensions.' }
        }
      ]
    },
    'gpu12:vocal': {
      model: { zh: 'ACE-Step 1.5 (2B SFT + 1.7B LM) / MiniMax Music 3 (Q4 GGUF)', en: 'ACE-Step 1.5 (2B SFT + 1.7B LM) / MiniMax Music 3 (Q4 GGUF)' },
      license: { zh: 'MIT / 社区商用许可', en: 'MIT / Community License' },
      reason: {
        zh: '12~16GB 甜点卡无需放弃全曲人声：ACE-Step 1.5 Tier-5 档位默认启用 INT8 与 VAE 卸载即可流畅跑 2B SFT；而 audio.cpp 的 MiniMax Music 3 Q4/Q8/Q4 混合包实测峰值显存仅 9.8 GiB！',
        en: '12-16GB GPUs handle full vocals easily: ACE-Step Tier-5 runs 2B SFT + 1.7B LM natively, while audio.cpp runs MiniMax Music 3 Q4/Q8/Q4 in just 9.8 GiB peak VRAM.'
      },
      mem: { zh: '9.8 ~ 12.6 GiB', en: '9.8 - 12.6 GiB' },
      latency: { zh: '约 15 秒 (ACE) / 135 秒 (Music 3 Q4)', en: '~15s (ACE) / 135s (Music 3 Q4)' },
      stack: { zh: 'ACE-Step Tier-5 / audio.cpp CUDA', en: 'ACE-Step Tier-5 / audio.cpp CUDA' },
      cmd: {
        zh: 'audiocpp_cli --task gen --family minimax_music3 \\\n  --model models/MiniMax-Music3-GGUF --backend cuda \\\n  --text "Bright Mandarin pop rock, crisp drums, emotional female vocal" \\\n  --request-option "lyrics=[verse] 霓虹把夜色点亮 [chorus] 我们迎着风歌唱" \\\n  --request-option duration_sec=120 --out song.wav',
        en: 'audiocpp_cli --task gen --family minimax_music3 \\\n  --model models/MiniMax-Music3-GGUF --backend cuda \\\n  --text "Bright pop rock, crisp drums, emotional female vocal" \\\n  --request-option "lyrics=[verse] City neon lights the night [chorus] Singing into the open wind" \\\n  --request-option duration_sec=120 --out song.wav'
      },
      alts: [
        {
          name: { zh: '备选 1：DiffRhythm v1.2 (--chunked 8GB 模式)', en: 'Alt 1: DiffRhythm v1.2 (--chunked 8GB Mode)' },
          desc: { zh: '开启分块解码后最低 8GB 显存即可端到端生成 4 分 45 秒完整歌曲。', en: 'With --chunked decoding enabled, synthesizes 4m45s stereo songs in as little as 8GB VRAM.' }
        }
      ]
    },
    'gpu12:bgm': {
      model: { zh: 'Stable Audio Open Small / TangoFlux', en: 'Stable Audio Open Small / TangoFlux' },
      license: { zh: '社区许可 / 开源研究', en: 'Community / Open Research' },
      reason: {
        zh: '显存占用不到 5 GiB，单张 4060 Ti / 4070 即可在 1~3 秒内批量刷出游戏环境声、转场音效与器乐 Loop。',
        en: 'Takes under 5 GiB VRAM on RTX 4060 Ti / 4070, rendering game ambience, SFX, and instrumental loops in 1-3 seconds.'
      },
      mem: { zh: '3.2 ~ 4.8 GiB', en: '3.2 - 4.8 GiB' },
      latency: { zh: '约 1.5~3 秒 / 30 秒片段', en: '~1.5-3s / 30s clip' },
      stack: { zh: 'Diffusers / TangoFlux', en: 'Diffusers / TangoFlux' },
      cmd: 'pip install git+https://github.com/declare-lab/TangoFlux\npython -c "import torchaudio; from tangoflux import TangoFluxInference; m=TangoFluxInference(); a=m.generate(\'Warm synthwave arpeggio with punchy retro drums, 110 BPM\', steps=25, duration=30); torchaudio.save(\'bgm.wav\', a, 44100)"',
      alts: [
        {
          name: { zh: '备选 1：MusicGen-Melody (1.5B)', en: 'Alt 1: MusicGen-Melody (1.5B)' },
          desc: { zh: '支持哼唱音频作为旋律引导生成伴奏（CC-BY-NC 非商用）。', en: 'Conditions instrumental generation on hummed reference melodies (CC-BY-NC).' }
        }
      ]
    },
    'gpu12:fast': {
      model: { zh: 'ACE-Step 1.5 (2B Turbo) / DiffRhythm-base', en: 'ACE-Step 1.5 (2B Turbo) / DiffRhythm-base' },
      license: { zh: 'MIT / Apache-2.0', en: 'MIT / Apache-2.0' },
      reason: {
        zh: '即便在 8~12GB 显存档位，ACE-Step 2B Turbo 与 DiffRhythm 分块模式依然保持十秒级整曲生成速度，彻底告别初代 YuE 动辄十几分钟的等待。',
        en: 'Even on 8-12GB cards, ACE-Step 2B Turbo and chunked DiffRhythm deliver ~10-15s full-song synthesis.'
      },
      mem: { zh: '7.5 ~ 9.5 GiB', en: '7.5 - 9.5 GiB' },
      latency: { zh: '约 12~18 秒 / 全曲', en: '~12-18s / full song' },
      stack: { zh: 'ACE-Step vLLM / DiffRhythm', en: 'ACE-Step vLLM / DiffRhythm' },
      cmd: 'git clone https://github.com/ASLP-lab/DiffRhythm.git && cd DiffRhythm\npip install -r requirements.txt\nbash scripts/infer_prompt_ref.sh --chunked',
      alts: [
        {
          name: { zh: '备选 1：ACE-Step DiT-only 极简模式 (≤4GB)', en: 'Alt 1: ACE-Step DiT-only Mode (≤4GB)' },
          desc: { zh: '关闭 5Hz LM 后连 4~6GB 轻薄本独显也能跑通全曲合成。', en: 'Disabling the 5Hz LM planner drops VRAM requirement below 4-6GB.' }
        }
      ]
    },
    'gpu12:commercial': {
      model: { zh: 'ACE-Step 1.5 (2B SFT · MIT) + 本地风格 LoRA', en: 'ACE-Step 1.5 (2B SFT · MIT) + Custom Style LoRA' },
      license: { zh: 'MIT 开源协议', en: 'MIT Open License' },
      reason: {
        zh: 'ACE-Step 1.5 不仅本体采用 MIT 协议，而且训练 8 首干声的风格 LoRA 仅需 12GB 显存，甜点卡用户也能合法沉淀独立厂牌音色。',
        en: 'MIT-licensed end-to-end; LoRA fine-tuning on 8 songs requires just 12GB VRAM, letting mainstream GPUs train proprietary studio styles.'
      },
      mem: { zh: '10.2 ~ 12.0 GiB', en: '10.2 - 12.0 GiB' },
      latency: { zh: '约 18~28 秒 / 3 分钟曲', en: '~18-28s / 3-min song' },
      stack: { zh: 'ACE-Step Gradio + LoRA Tab', en: 'ACE-Step Gradio + LoRA Tab' },
      cmd: {
        zh: 'git clone https://github.com/ACE-Step/ACE-Step-1.5.git && cd ACE-Step-1.5\nuv sync && uv run acestep\n# 在浏览器打开 http://localhost:7860 切换至 LoRA Training 标签页即可在 12GB 显存内微调',
        en: 'git clone https://github.com/ACE-Step/ACE-Step-1.5.git && cd ACE-Step-1.5\nuv sync && uv run acestep\n# Open http://localhost:7860 and switch to the LoRA Training tab to fine-tune within 12GB VRAM'
      },
      alts: [
        {
          name: { zh: '备选 1：DiffRhythm 2 (Apache-2.0)', en: 'Alt 1: DiffRhythm 2 (Apache-2.0)' },
          desc: { zh: 'Apache-2.0 协议免授权费，12GB 显存无需复杂卸载即可直出全曲。', en: 'Royalty-free Apache-2.0 license; fits comfortably inside 12GB VRAM.' }
        }
      ]
    }
  };

  function currentLang() {
    var htmlLang = document.documentElement.getAttribute('data-lang') || document.documentElement.getAttribute('lang') || 'zh';
    return htmlLang.indexOf('en') === 0 ? 'en' : 'zh';
  }

  function pickText(pair, lang) {
    if (!pair) return '';
    if (typeof pair === 'string') return pair;
    return lang === 'en' ? (pair.en || pair.zh) : (pair.zh || pair.en);
  }

  function mountAdvisor() {
    var slot = document.getElementById('local-music-advisor');
    if (!slot) return;

    var controls = slot.querySelector('[data-sandbox-controls="local-music-advisor"]');
    var stage = slot.querySelector('[data-sandbox-stage="local-music-advisor"]');
    if (!controls || !stage) return;

    var state = { hw: 'm4max64', task: 'vocal' };

    function renderControls() {
      var hwBtns = HARDWARE_OPTIONS.map(function (opt) {
        var cls = 'advisor-chip' + (state.hw === opt.id ? ' is-active' : '');
        return '<button type="button" class="' + cls + '" data-advisor-hw="' + opt.id + '" data-zh="' + opt.zh + '" data-en="' + opt.en + '">' + pickText(opt, currentLang()) + '</button>';
      }).join('');

      var taskBtns = TASK_OPTIONS.map(function (opt) {
        var cls = 'advisor-chip' + (state.task === opt.id ? ' is-active' : '');
        return '<button type="button" class="' + cls + '" data-advisor-task="' + opt.id + '" data-zh="' + opt.zh + '" data-en="' + opt.en + '">' + pickText(opt, currentLang()) + '</button>';
      }).join('');

      controls.innerHTML = [
        '<div class="advisor-toolbar">',
        '  <div class="advisor-filter-row">',
        '    <span class="advisor-filter-label" data-zh="1. 本机硬件：" data-en="1. Hardware:">' + (currentLang() === 'en' ? '1. Hardware:' : '1. 本机硬件：') + '</span>',
        '    ' + hwBtns,
        '  </div>',
        '  <div class="advisor-filter-row">',
        '    <span class="advisor-filter-label" data-zh="2. 创作目标：" data-en="2. Scenario:">' + (currentLang() === 'en' ? '2. Scenario:' : '2. 创作目标：') + '</span>',
        '    ' + taskBtns,
        '  </div>',
        '</div>'
      ].join('\n');

      var hwNodes = controls.querySelectorAll('[data-advisor-hw]');
      for (var i = 0; i < hwNodes.length; i++) {
        (function (btn) {
          btn.addEventListener('click', function () {
            state.hw = btn.getAttribute('data-advisor-hw') || 'm4max64';
            renderControls();
            renderStage();
          });
        })(hwNodes[i]);
      }

      var taskNodes = controls.querySelectorAll('[data-advisor-task]');
      for (var j = 0; j < taskNodes.length; j++) {
        (function (btn) {
          btn.addEventListener('click', function () {
            state.task = btn.getAttribute('data-advisor-task') || 'vocal';
            renderControls();
            renderStage();
          });
        })(taskNodes[j]);
      }
    }

    function renderStage() {
      var lang = currentLang();
      var key = state.hw + ':' + state.task;
      var rec = MATRIX[key] || MATRIX['m4max64:vocal'];
      var cmdText = pickText(rec.cmd, lang);

      var altHtml = (rec.alts || []).map(function (alt) {
        return [
          '<div class="advisor-alt-item">',
          '  <strong data-zh="' + alt.name.zh + '" data-en="' + alt.name.en + '">' + pickText(alt.name, lang) + '</strong>',
          '  <span data-zh="' + alt.desc.zh + '" data-en="' + alt.desc.en + '">' + pickText(alt.desc, lang) + '</span>',
          '</div>'
        ].join('\n');
      }).join('\n');

      stage.innerHTML = [
        '<div class="advisor-board">',
        '  <div class="advisor-primary-card">',
        '    <div class="advisor-badge-row">',
        '      <span class="advisor-rank-pill" data-zh="首选推荐方案" data-en="Primary Recommendation">' + (lang === 'en' ? 'Primary Recommendation' : '首选推荐方案') + '</span>',
        '      <span class="advisor-license-pill" data-zh="' + rec.license.zh + '" data-en="' + rec.license.en + '">' + pickText(rec.license, lang) + '</span>',
        '    </div>',
        '    <h4 class="advisor-model-title" data-zh="' + rec.model.zh + '" data-en="' + rec.model.en + '">' + pickText(rec.model, lang) + '</h4>',
        '    <p class="advisor-model-reason" data-zh="' + rec.reason.zh + '" data-en="' + rec.reason.en + '">' + pickText(rec.reason, lang) + '</p>',
        '    <div class="advisor-stats-grid">',
        '      <div class="advisor-stat-box">',
        '        <span class="advisor-stat-key" data-zh="预计峰值显存/内存" data-en="Est. Peak Memory">' + (lang === 'en' ? 'Est. Peak Memory' : '预计峰值显存/内存') + '</span>',
        '        <span class="advisor-stat-val" data-zh="' + rec.mem.zh + '" data-en="' + rec.mem.en + '">' + pickText(rec.mem, lang) + '</span>',
        '      </div>',
        '      <div class="advisor-stat-box">',
        '        <span class="advisor-stat-key" data-zh="典型推理耗时" data-en="Typical Latency">' + (lang === 'en' ? 'Typical Latency' : '典型推理耗时') + '</span>',
        '        <span class="advisor-stat-val" data-zh="' + rec.latency.zh + '" data-en="' + rec.latency.en + '">' + pickText(rec.latency, lang) + '</span>',
        '      </div>',
        '      <div class="advisor-stat-box">',
        '        <span class="advisor-stat-key" data-zh="推荐运行引擎" data-en="Recommended Runtime">' + (lang === 'en' ? 'Recommended Runtime' : '推荐运行引擎') + '</span>',
        '        <span class="advisor-stat-val" data-zh="' + rec.stack.zh + '" data-en="' + rec.stack.en + '">' + pickText(rec.stack, lang) + '</span>',
        '      </div>',
        '    </div>',
        '    <div class="advisor-cmd-wrap">',
        '      <div class="advisor-cmd-head">',
        '        <span data-zh="本地快速启动与生成命令" data-en="Local Quickstart & Inference Command">' + (lang === 'en' ? 'Local Quickstart & Inference Command' : '本地快速启动与生成命令') + '</span>',
        '        <button type="button" class="advisor-copy-btn" id="advisor-copy-trigger" data-zh="复制命令" data-en="Copy CLI">' + (lang === 'en' ? 'Copy CLI' : '复制命令') + '</button>',
        '      </div>',
        '      <pre class="advisor-cmd-code" id="advisor-cmd-text">' + cmdText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>',
        '    </div>',
        '  </div>',
        '  <div class="advisor-alt-card">',
        '    <span class="advisor-rank-pill" data-zh="同硬件互补备选" data-en="Complementary Alternatives">' + (lang === 'en' ? 'Complementary Alternatives' : '同硬件互补备选') + '</span>',
        '    <div class="advisor-alt-list">' + altHtml + '</div>',
        '  </div>',
        '</div>'
      ].join('\n');

      var copyBtn = document.getElementById('advisor-copy-trigger');
      if (copyBtn && navigator.clipboard) {
        copyBtn.addEventListener('click', function () {
          navigator.clipboard.writeText(pickText(rec.cmd, currentLang())).then(function () {
            copyBtn.textContent = currentLang() === 'en' ? 'Copied!' : '已复制！';
            setTimeout(function () {
              copyBtn.textContent = currentLang() === 'en' ? 'Copy CLI' : '复制命令';
            }, 1500);
          });
        });
      }
    }

    renderControls();
    renderStage();

    var obs = new MutationObserver(function () {
      renderControls();
      renderStage();
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang', 'lang'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAdvisor);
  } else {
    mountAdvisor();
  }
})();
