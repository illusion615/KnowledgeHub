---
title: "量子世界初探：光电效应与波粒二象性 || Introduction to Quantum: Photoelectric Effect & Wave-Particle Duality"
eyebrow: "近代物理 · 第 1 篇 / 共 2 篇 || Modern Physics · Part 1 of 2"
brand: "近代物理 || Modern Physics"
date: 2026-04-17
strict_i18n: false
strict_density: true
lead: "普朗克的量子假说打开了新世界的大门。爱因斯坦的光子理论解释了光电效应，德布罗意揭示了物质的波动性。 || Planck's quantum hypothesis opened a new world. Einstein's photon theory explained the photoelectric effect; de Broglie revealed the wave nature of matter."
hero_actions:
  - "开始学习 || Start Learning | #blackbody"
  - "直接练习 || Go to Practice | #practice"
panel_label: "本章目标 || Chapter Goals"
panel_title: "走进量子世界 || Enter the Quantum World"
panel:
  - "了解黑体辐射与普朗克量子化假说 || Understand blackbody radiation and Planck's quantization"
  - "掌握光电效应方程 Ek=hν−W₀ || Master photoelectric equation Ek=hν−W₀"
  - "理解波粒二象性与德布罗意波长 || Understand wave-particle duality and de Broglie wavelength"
metrics:
  - "光子能量 || Photon Energy | E=hν | 普朗克公式 || Planck's formula"
  - "光电方程 || Photoelectric | Ek=hν−W₀ | 爱因斯坦 || Einstein"
  - "交互实验 || Interactive Lab | 1 | 光电效应 || Photoelectric"
  - "难度 || Difficulty | ★★★★☆ | 需光学基础 || Requires optics"
style:
  accent: "#be185d"
---

## #blackbody 01 / Blackbody Radiation & Quantum Hypothesis :: 能量是不连续的 || Energy Is Quantized

1900 年普朗克为解释黑体辐射谱提出：能量的发射和吸收不是连续的，而是以 hν 为单位的份额——量子。 || In 1900, Planck proposed: energy emission/absorption is not continuous but occurs in discrete units of hν — quanta.

:::accordion
::panel { open: true }
### 普朗克常数 || Planck's Constant
$$
E = h\nu
$$

h = 6.626×10⁻³⁴ J·s 是普朗克常数。ν 为辐射频率。这一公式标志着量子物理的诞生。 || h = 6.626×10⁻³⁴ J·s is Planck's constant. ν is radiation frequency. This formula marks the birth of quantum physics.

- **黑体 || Blackbody** — 能完全吸收所有频率电磁辐射的理想物体。其辐射谱只与温度有关，与材料无关。 || An ideal object that absorbs all electromagnetic radiation. Its spectrum depends only on temperature, not material.
- **紫外灾变 || Ultraviolet Catastrophe** — 经典理论预测高频辐射强度趋于无穷——与实验严重不符。普朗克的量子假说成功解决了这一困难。 || Classical theory predicted infinite high-frequency intensity — contradicting experiments. Planck's quantum hypothesis resolved this.
:::

## #photoelectric 02 / Photoelectric Effect :: 光子打出电子 || Photons Eject Electrons

光照射金属表面，频率大于截止频率时立即释放出电子。爱因斯坦用光子理论完美解释了全部实验规律。 || Light on metal surfaces ejects electrons instantly when frequency exceeds threshold. Einstein's photon theory perfectly explains all experimental observations.

:::accordion
::panel { open: true }
### 爱因斯坦光电方程 || Einstein's Photoelectric Equation
$$
E_k = h\nu - W_0
$$

> **📐 光电方程解读 || 📐 Equation Breakdown**
> 一个光子的全部能量 hν 用于两部分：①克服逸出功 W₀（使电子脱离金属表面所需最小能量）；②剩余成为光电子的最大初动能 Ek。 || One photon's energy hν goes to: ①work function W₀ (minimum energy to free electron); ②remaining becomes maximum kinetic energy Ek.
> $$
> \nu_0 = \frac{W_0}{h}
> $$
> ν₀ 为截止频率（极限频率）。当 ν < ν₀ 时，无论光多强都不能发生光电效应。 || ν₀ is threshold frequency. When ν < ν₀, no photoelectric effect regardless of intensity.

| 实验现象 || Observation | 经典波动理论 || Classical Wave | 光子理论 || Photon Theory |
| --- | --- | --- |
| 截止频率 || Threshold freq. | ✗ 无法解释 || ✗ Cannot explain | ✓ hν > W₀ |
| 瞬时发射 || Instant emission | ✗ 需积累能量 || ✗ Needs accumulation | ✓ 一对一 || ✓ One-to-one |
| Ek 与频率关系 || Ek vs frequency | ✗ 与强度相关 || ✗ Depends on intensity | ✓ Ek=hν−W₀ |
| 光电流与强度 || Current vs intensity | ✓ 正比 || ✓ Proportional | ✓ 光子数正比 || ✓ Photon count |
:::

:::sandbox { id: "sim-photoelectric", title: "交互实验沙盒 || Interactive Simulation Sandbox" }
交互可调参数：频率 ν： || Freq ν:、强度： || Intensity:。
:::

## #duality 03 / Wave-Particle Duality :: 德布罗意物质波 || de Broglie Matter Waves

光既是波也是粒子。1924 年德布罗意大胆预言：一切实物粒子都具有波动性，波长 λ=h/p。 || Light is both wave and particle. In 1924, de Broglie boldly predicted: all matter has wave properties, with wavelength λ=h/p.

:::accordion
::panel { open: true }
### 德布罗意公式 || de Broglie Formula
$$
\lambda = \frac{h}{p} = \frac{h}{mv}
$$

p = mv 为粒子动量。宏观物体质量大，λ 极小（远小于原子尺寸），波动性无法观测；微观粒子（电子等）λ 可与原子尺寸相当。 || p = mv is momentum. Macroscopic objects have large mass, so λ is negligible; microscopic particles (electrons) have λ comparable to atomic sizes.

> **💡 电子衍射的验证 || 💡 Electron Diffraction Verification**
> 1927 年戴维逊-革末实验观察到电子束被镍晶体衍射，衍射图案与 λ=h/p 预言完全吻合。这证实了物质波的存在。电子显微镜正是利用电子的短波长获得远超光学显微镜的分辨率。 || In 1927, Davisson-Germer experiment observed electron beam diffraction by nickel crystal, matching λ=h/p prediction. This confirmed matter waves. Electron microscopes exploit short electron wavelength for superior resolution.

::panel
### 光的波粒二象性总结 || Light's Wave-Particle Duality Summary
🌊

**波动性 || Wave Nature**

干涉、衍射、偏振——大量光子的统计行为体现波动性。 || Interference, diffraction, polarization — statistical behavior of many photons shows wave nature.

⚡

**粒子性 || Particle Nature**

光电效应、康普顿散射——单个光子与物质的相互作用体现粒子性。 || Photoelectric effect, Compton scattering — single photon interactions with matter show particle nature.

∞

**统一 || Unity**

波粒二象性是微观世界的基本特征。E=hν 和 p=h/λ 将粒子量（E, p）和波量（ν, λ）联系在一起。 || Wave-particle duality is fundamental to the microscopic world. E=hν and p=h/λ connect particle (E, p) and wave (ν, λ) properties.
:::

## #practice 04 / Enhanced Practice :: 从基础到挑战 || From Basics to Challenge

:::accordion
::panel { open: true }
### 基础题（3 题） || Basic (3 Questions)
> **Q1**
> 某金属的逸出功 W₀=3.3 eV，用频率 ν=1.0×10¹⁵ Hz 的光照射，能否发生光电效应？（h=6.63×10⁻³⁴ J·s，1 eV=1.6×10⁻¹⁹ J） || Metal W₀=3.3 eV, ν=1.0×10¹⁵ Hz. Photoelectric effect? (h=6.63×10⁻³⁴ J·s, 1 eV=1.6×10⁻¹⁹ J)

**📖 Q1 答案 || 📖 Q1 Answer**

$$
h\nu = 6.63\times10^{-34}\times 1.0\times10^{15} = 6.63\times10^{-19}\text{ J} = 4.14\text{ eV}
$$

hν = 4.14 eV > W₀ = 3.3 eV，可以发生光电效应。Ek = 4.14 − 3.3 = 0.84 eV。 || hν = 4.14 eV > W₀ = 3.3 eV. Yes. Ek = 4.14 − 3.3 = 0.84 eV.

> **Q2**
> 光电效应实验中，增大入射光的强度（频率不变），最大初动能 Ek 会变化吗？光电流会变化吗？ || In photoelectric experiment, increase intensity (frequency unchanged). Does Ek change? Does photocurrent change?

**📖 Q2 答案 || 📖 Q2 Answer**

Ek = hν − W₀，只与频率有关，强度增大不改变 Ek。但光子数增多，打出的电子数增多，饱和光电流增大。 || Ek = hν − W₀ depends only on frequency; Ek unchanged. But more photons → more electrons → larger saturation photocurrent.

> **Q3**
> 电子的质量 m=9.11×10⁻³¹ kg，速度 v=1.0×10⁶ m/s，求其德布罗意波长。 || Electron m=9.11×10⁻³¹ kg, v=1.0×10⁶ m/s. Find de Broglie wavelength.

**📖 Q3 答案 || 📖 Q3 Answer**

$$
\lambda = \frac{h}{mv} = \frac{6.63\times10^{-34}}{9.11\times10^{-31}\times 1.0\times10^6} = 7.28\times10^{-10}\text{ m} \approx 0.73\text{ nm}
$$

λ ≈ 0.73 nm，与原子间距（~0.1 nm 量级）可比拟，能观测到电子衍射。 || λ ≈ 0.73 nm, comparable to atomic spacing (~0.1 nm order). Electron diffraction is observable.

::panel
### 进阶题（3 题） || Advanced (3 Questions)
> **Q4**
> 某金属用 λ₁=400 nm 的光照射时最大初动能 Ek₁=0.89 eV，用 λ₂=300 nm 时，求 Ek₂ 和逸出功 W₀。 || Metal: λ₁=400 nm gives Ek₁=0.89 eV. Find Ek₂ for λ₂=300 nm and W₀.

**📖 Q4 答案 || 📖 Q4 Answer**

λ₁=400 nm → ν₁=c/λ₁=7.5×10¹⁴ Hz → hν₁=3.10 eV || λ₁=400 nm → hν₁=3.10 eV

$$
W_0 = h\nu_1 - E_{k1} = 3.10 - 0.89 = 2.21\text{ eV}
$$

λ₂=300 nm → hν₂=4.14 eV

$$
E_{k2} = h\nu_2 - W_0 = 4.14 - 2.21 = 1.93\text{ eV}
$$

W₀ = 2.21 eV，Ek₂ = 1.93 eV。 || W₀ = 2.21 eV, Ek₂ = 1.93 eV.

> **Q5**
> 100 g 的棒球以 40 m/s 运动，其德布罗意波长是多少？与电子相比说明什么？ || 100 g baseball at 40 m/s. What is its de Broglie wavelength? What does this tell us vs electrons?

**📖 Q5 答案 || 📖 Q5 Answer**

$$
\lambda = \frac{h}{mv} = \frac{6.63\times10^{-34}}{0.1\times 40} = 1.66\times10^{-34}\text{ m}
$$

λ ≈ 1.66×10⁻³⁴ m，比原子核（~10⁻¹⁵ m）还小 19 个数量级。宏观物体波动性完全不可观测。 || λ ≈ 1.66×10⁻³⁴ m — 19 orders smaller than a nucleus (~10⁻¹⁵ m). Macroscopic wave behavior is unobservable.

> **Q6**
> 光电效应中遏止电压 U₀=1.2 V，求最大初动能 Ek（用 eV 和 J 表示）。 || Stopping voltage U₀=1.2 V. Find Ek in eV and J.

**📖 Q6 答案 || 📖 Q6 Answer**

$$
E_k = eU_0 = 1.2\text{ eV} = 1.2\times1.6\times10^{-19} = 1.92\times10^{-19}\text{ J}
$$

Ek = 1.2 eV = 1.92×10⁻¹⁹ J。遏止电压与最大初动能之间由 eU₀ = Ek 联系。 || Ek = 1.2 eV = 1.92×10⁻¹⁹ J. Stopping voltage relates to max KE by eU₀ = Ek.
:::

## #roadmap 05 / Series Navigation :: 近代物理系列导航 || Modern Physics Series Navigation

这是近代物理系列第 1 篇。量子世界的大门已经打开。 || Part 1 of Modern Physics. The door to the quantum world is open.

- **第 1 篇 · 当前 || Part 1 · Current：量子世界初探 || Quantum Introduction**
- [第 2 篇 || Part 2：原子与原子核 || Atomic & Nuclear](../atomic-nuclear/)

:::callout { title: "下一篇预告 || Next Article Preview" }
第 2 篇将聚焦**原子与原子核**——从原子结构模型到核反应与放射性衰变。 || Part 2: **Atomic & Nuclear Physics** — from atomic models to nuclear reactions and radioactive decay.
:::
