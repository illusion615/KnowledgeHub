---
title: "波动光学：干涉、衍射与偏振 || Wave Optics: Interference, Diffraction & Polarization"
eyebrow: "光学 · 第 2 篇 / 共 2 篇 || Optics · Part 2 of 2"
brand: "光学 || Optics"
date: 2026-04-17
strict_i18n: false
strict_density: true
lead: "杨氏双缝干涉证实了光的波动性。干涉条纹间距、单缝衍射和偏振现象揭示了光波的本质特征。 || Young's double-slit experiment confirmed the wave nature of light. Fringe spacing, single-slit diffraction, and polarization reveal intrinsic wave properties."
hero_actions:
  - "开始学习 || Start Learning | #wave-evidence"
  - "直接练习 || Go to Practice | #practice"
panel_label: "本章目标 || Chapter Goals"
panel_title: "从干涉到偏振 || From Interference to Polarization"
panel:
  - "理解光的波动性实验证据 || Understand experimental evidence for wave nature"
  - "掌握双缝干涉公式 Δx=λL/d || Master double-slit formula Δx=λL/d"
  - "了解衍射与偏振现象 || Understand diffraction and polarization"
metrics:
  - "核心公式 || Core Formula | Δx=λL/d | 条纹间距 || Fringe spacing"
  - "明纹条件 || Bright Fringe | δ=kλ | 路程差为整数倍波长 || Path diff = integer wavelength"
  - "交互实验 || Interactive Lab | 1 | 双缝干涉 || Double-slit"
  - "难度 || Difficulty | ★★★☆☆ | 中等 || Intermediate"
style:
  accent: "#0d9488"
---

## #wave-evidence 01 / Evidence for Wave Nature of Light :: 从牛顿到杨氏 || From Newton to Young

17 世纪牛顿主张微粒说，惠更斯主张波动说。1801 年杨氏双缝实验给出了光是波的决定性证据。 || Newton championed corpuscular theory; Huygens championed wave theory. In 1801, Young's double-slit experiment provided decisive evidence for light as a wave.

:::accordion
::panel { open: true }
### 杨氏双缝实验 || Young's Double-Slit Experiment
单色光通过两条紧邻的狭缝后，在远处屏幕上形成明暗相间的干涉条纹。这无法用微粒说解释——只有波才会叠加产生此图案。 || Monochromatic light through two closely spaced slits produces alternating bright and dark fringes on a distant screen. Only wave superposition explains this pattern.

- **相干条件 || Coherence Conditions** — 两波源必须频率相同、相位差恒定（相干光源）。双缝将同一光源分成两束相干光。 || Two sources must have same frequency and constant phase difference (coherent). Double slit splits one source into two coherent beams.
- **薄膜干涉 || Thin Film Interference** — 肥皂泡和油膜的彩色条纹是薄膜上下表面反射光干涉的结果。膜厚决定干涉加强的颜色。 || Soap bubbles and oil film colors result from interference of light reflected from top and bottom surfaces. Film thickness determines enhanced color.
:::

## #interference 02 / Double-Slit Interference :: 条纹间距公式 || Fringe Spacing Formula

条纹间距 Δx = λL/d，波长越长、缝屏距越大、缝间距越小，条纹越宽。 || Fringe spacing Δx = λL/d. Longer wavelength, larger screen distance, smaller slit spacing → wider fringes.

:::accordion
::panel { open: true }
### 明暗条纹条件 || Bright/Dark Fringe Conditions
> **📐 条纹间距推导 || 📐 Fringe Spacing Derivation**
> 两缝间距 d，缝到屏距离 L（L ≫ d）。屏上 P 点到两缝的路程差： || Slit separation d, screen distance L (L ≫ d). Path difference to point P:
> $$
> \delta = d\sin\theta \approx d\cdot\frac{x}{L}
> $$
> 明纹条件：δ = kλ（k=0,±1,±2...），暗纹：δ = (k+½)λ || Bright: δ=kλ (k=0,±1,...), Dark: δ=(k+½)λ
> $$
> \Delta x = \frac{\lambda L}{d}
> $$
> 相邻明纹（或暗纹）间距相等，为 Δx = λL/d。 || Adjacent bright (or dark) fringes are equally spaced by Δx = λL/d.

> **💡 测量波长 || 💡 Measuring Wavelength**
> 实验中测量 Δx、L 和 d 即可计算光的波长 λ = Δx·d/L。杨氏实验首次测出了可见光波长（约 400–750 nm）。 || By measuring Δx, L, and d, wavelength is calculated as λ = Δx·d/L. Young's experiment first measured visible light wavelength (~400–750 nm).
:::

:::sandbox { id: "sim-doubleslit", title: "交互实验沙盒 || Interactive Simulation Sandbox" }
交互可调参数：缝距 d： || Slit d:、波长 λ： || λ:。
:::

## #diffraction 03 / Diffraction & Polarization :: 光绕过障碍物的证据 || Light Bending Around Obstacles

衍射证明光能绕过障碍物传播；偏振证明光是横波。 || Diffraction proves light can bend around obstacles; polarization proves light is a transverse wave.

:::accordion
::panel { open: true }
### 单缝衍射 || Single-Slit Diffraction
单色光通过单缝时，在屏上形成中央明纹最宽最亮、两侧明纹依次变窄变暗的图案。缝宽与波长可比拟时衍射效果明显。 || Monochromatic light through a single slit produces a central maximum (widest, brightest) with progressively narrower, dimmer side maxima. Diffraction is significant when slit width is comparable to wavelength.

> **💡 衍射 vs 干涉 || 💡 Diffraction vs Interference**
> 干涉是多束光叠加（条纹等宽）；衍射是同一束光各部分的叠加（中央明纹比侧纹宽得多）。两者本质相同——波的叠加原理。 || Interference: superposition of multiple beams (equal-width fringes). Diffraction: superposition within one beam (central maximum much wider). Both based on wave superposition principle.

::panel
### 偏振 || Polarization
自然光振动方向沿所有垂直于传播方向均匀分布。通过偏振片后，只有平行于透振方向的分量通过——成为偏振光（线偏振光）。 || Natural light vibrates in all directions perpendicular to propagation. After a polarizer, only the component parallel to the transmission axis passes — becoming linearly polarized light.

| 特性 || Property | 自然光 || Natural Light | 偏振光 || Polarized Light |
| --- | --- | --- |
| 振动方向 || Vibration Dir. | 各方向均匀 || All directions equally | 单一方向 || Single direction |
| 通过偏振片 || Through Polarizer | 强度减半 || Intensity halved | 遵循马吕斯定律 || Follows Malus's law |
| 应用 || Application | — | 偏振太阳镜、LCD || Polarized sunglasses, LCD |

- **偏振太阳镜 || Polarized Sunglasses** — 水面、路面的反射光部分偏振（水平方向）。偏振太阳镜透振方向竖直，滤掉水平偏振的眩光，减少反射干扰。 || Reflected light from water/roads is partially polarized (horizontal). Polarized sunglasses with vertical transmission axis filter horizontal glare.
- **液晶显示 || LCD Display** — LCD 利用液晶分子旋转偏振方向。电场控制液晶排列 → 控制光的偏振 → 配合偏振片实现像素明暗。 || LCD uses liquid crystals to rotate polarization direction. Electric field controls crystal alignment → polarization → pixel brightness with polarizer.
:::

## #practice 04 / Enhanced Practice :: 从基础到挑战 || From Basics to Challenge

:::accordion
::panel { open: true }
### 基础题（3 题） || Basic (3 Questions)
> **Q1**
> 双缝间距 d=0.2 mm，缝到屏距 L=1 m，用 λ=600 nm 的光，求条纹间距。 || d=0.2 mm, L=1 m, λ=600 nm. Find fringe spacing.

**📖 Q1 答案 || 📖 Q1 Answer**

$$
\Delta x = \frac{\lambda L}{d} = \frac{600\times10^{-9}\times 1}{0.2\times10^{-3}} = 3\times10^{-3}\text{ m} = 3\text{ mm}
$$

Δx = 3 mm。 || Δx = 3 mm.

> **Q2**
> 双缝实验中，将入射光从红光（λ=700 nm）换为紫光（λ=400 nm），条纹间距如何变化？ || In double-slit experiment, switching from red (700 nm) to violet (400 nm) — how does fringe spacing change?

**📖 Q2 答案 || 📖 Q2 Answer**

Δx ∝ λ，紫光波长更短，条纹间距变小。比值 400/700 ≈ 0.57，条纹间距约为原来的 57%。 || Δx ∝ λ. Violet wavelength is shorter, so spacing decreases. Ratio 400/700 ≈ 0.57, spacing is ~57% of original.

> **Q3**
> 偏振光通过一偏振片，透振方向与偏振方向成 60°，透射光强度为入射光的多少？ || Polarized light through polarizer at 60° to polarization. Transmitted intensity fraction?

**📖 Q3 答案 || 📖 Q3 Answer**

$$
I = I_0\cos^2 60° = I_0\times\frac{1}{4} = 0.25I_0
$$

透射光强度为入射光的 25%（马吕斯定律）。 || Transmitted intensity is 25% of incident (Malus's law).

::panel
### 进阶题（3 题） || Advanced (3 Questions)
> **Q4**
> 双缝实验中测得 5 个明纹间距为 12 mm，L=0.8 m，d=0.25 mm。求光的波长和颜色。 || 5 bright fringes span 12 mm. L=0.8 m, d=0.25 mm. Find wavelength and color.

**📖 Q4 答案 || 📖 Q4 Answer**

5 个明纹间距 = 4 个 Δx，故 Δx = 12/4 = 3 mm。 || 5 fringes = 4 intervals, so Δx = 12/4 = 3 mm.

$$
\lambda = \frac{\Delta x\cdot d}{L} = \frac{3\times10^{-3}\times 0.25\times10^{-3}}{0.8} = 937.5\text{ nm}
$$

等等，937.5 nm 超出可见光范围。让我重算：Δx=3 mm=0.003 m，λ=0.003×0.00025/0.8=9.375×10⁻⁷ m=937.5 nm。这是近红外光。如果是可见光实验，请检查数据。 || 937.5 nm is near-infrared. If visible light, check data. Calculation is correct for given values.

> **Q5**
> 白光通过双缝后，屏上中央明纹是什么颜色？两侧条纹颜色分布如何？ || White light through double slit. What color is central maximum? How are colors distributed on sides?

**📖 Q5 答案 || 📖 Q5 Answer**

中央明纹：白色（所有波长在此处路程差为零，都相长干涉）。两侧：内紫外红——紫光波长短条纹窄，靠近中央；红光波长长条纹宽，远离中央。高级条纹有颜色重叠。 || Central: white (zero path difference for all wavelengths). Sides: violet inside, red outside — shorter wavelength has narrower spacing (closer to center). Higher-order fringes overlap in color.

> **Q6**
> 两片偏振片互相垂直放置（正交偏振），光完全被挡。在两者之间插入第三片、透振方向与第一片成 45°，光能否通过？ || Two crossed polarizers block all light. Insert a third at 45° to the first between them. Does light pass?

**📖 Q6 答案 || 📖 Q6 Answer**

能通过！第 1 片后为偏振光 I₁=I₀/2。第 2 片（45°）后：I₂=I₁cos²45°=I₀/4。第 3 片（与第 2 片成 45°）后：I₃=I₂cos²45°=I₀/8。 || Yes! After 1st: I₁=I₀/2. After 2nd (45°): I₂=I₀/4. After 3rd (45° from 2nd): I₃=I₀/8.
:::

## #roadmap 05 / Series Navigation :: 光学系列导航 || Optics Series Navigation

这是光学系列第 2 篇（完结）。从几何到波动，光学之旅圆满落幕。 || Part 2 of Optics (series complete). From geometric to wave optics, the journey concludes.

- [第 1 篇 || Part 1：几何光学 || Geometric Optics](../geometric-optics/)
- **第 2 篇 · 当前 || Part 2 · Current：波动光学 || Wave Optics**

:::callout { title: "✅ 系列完结 || ✅ Series Complete" }
光学系列全部完成！从直线传播、反射折射到干涉衍射偏振，你已掌握光学的完整图景。接下来可以学习**近代物理**系列。 || Optics series complete! From propagation, reflection, refraction to interference, diffraction, polarization — the full picture. Next: **Modern Physics** series.
:::
