---
title: "几何光学：反射、折射与全反射 || Geometric Optics: Reflection, Refraction & Total Internal Reflection"
eyebrow: "光学 · 第 1 篇 / 共 2 篇 || Optics · Part 1 of 2"
brand: "光学 || Optics"
date: 2026-04-17
strict_i18n: false
strict_density: true
lead: "光沿直线传播、反射定律、折射定律（斯涅尔定律）和全反射——从镜面成像到光纤通信的物理基础。 || Rectilinear propagation, reflection, Snell's law of refraction, and total internal reflection — physics behind mirrors to fiber optics."
hero_actions:
  - "开始学习 || Start Learning | #propagation"
  - "直接练习 || Go to Practice | #practice"
panel_label: "本章目标 || Chapter Goals"
panel_title: "掌握光的传播规律 || Master Light Propagation Laws"
panel:
  - "理解光的直线传播与影的形成 || Understand rectilinear propagation and shadow formation"
  - "掌握反射定律与平面镜成像 || Master reflection law and plane mirror imaging"
  - "运用斯涅尔定律 n₁sinθ₁=n₂sinθ₂ || Apply Snell's law n₁sinθ₁=n₂sinθ₂"
  - "理解全反射与光纤原理 || Understand total internal reflection and fiber optics"
metrics:
  - "核心定律 || Core Law | n₁sinθ₁=n₂sinθ₂ | 斯涅尔定律 || Snell's Law"
  - "全反射 || Total Reflection | sinC=n₂/n₁ | 临界角公式 || Critical Angle"
  - "交互实验 || Interactive Lab | 1 | 折射模拟器 || Refraction Sim"
  - "难度 || Difficulty | ★★★☆☆ | 中等 || Intermediate"
style:
  accent: "#0d9488"
---

## #propagation 01 / Rectilinear Propagation :: 影子与小孔成像 || Shadows and Pinhole Camera

在同一均匀介质中，光沿直线传播。这是影的形成和小孔成像的基础。 || In a uniform medium, light travels in straight lines — the basis of shadow formation and pinhole cameras.

:::accordion
::panel { open: true }
### 直线传播条件 || Conditions for Straight Propagation
光在同一种均匀、透明的介质中沿直线传播。当介质不均匀时（如大气密度梯度），光线会弯曲——这就是海市蜃楼的成因。 || Light travels in straight lines in a uniform, transparent medium. In non-uniform media (e.g., atmospheric density gradient), light bends — causing mirages.

- **影的形成 || Shadow Formation** — 不透明物体挡住光，在其后方形成影子。点光源产生本影，扩展光源还产生半影。日食与月食即此原理。 || Opaque objects block light, forming shadows. Point sources create umbra; extended sources also create penumbra. Solar/lunar eclipses use this principle.
- **小孔成像 || Pinhole Camera** — 光通过小孔在屏上形成倒立的实像。像的大小取决于物距与像距之比。这是最早的成像原理。 || Light through a small hole forms an inverted real image. Image size depends on object/image distance ratio. The earliest imaging principle.
- **海市蜃楼 || Mirage** — 近地面空气受热密度降低，折射率变小，光线向上弯曲，观察者看到远方物体的虚像——直线传播的反例提示。 || Heated air near ground has lower density and refractive index; light bends upward, creating virtual images of distant objects.
:::

## #reflection 02 / Law of Reflection :: 入射角等于反射角 || Angle of Incidence Equals Angle of Reflection

反射光线、入射光线和法线在同一平面内，入射角等于反射角。 || Reflected ray, incident ray, and normal lie in the same plane; angle of incidence equals angle of reflection.

:::accordion
::panel { open: true }
### 反射定律三要素 || Three Elements of Reflection
1

**三线共面 || Coplanar**

入射光线、反射光线和法线在同一平面（入射面）内。 || Incident ray, reflected ray, and normal all lie in the same plane (plane of incidence).

2

**法线居中 || Normal Between**

反射光线与入射光线分居法线两侧。 || Reflected and incident rays are on opposite sides of the normal.

3

**两角相等 || Equal Angles**

反射角等于入射角：θᵣ = θᵢ。角度均相对法线测量。 || Angle of reflection equals angle of incidence: θᵣ = θᵢ. Both measured from normal.

::panel
### 镜面反射与漫反射 || Specular vs Diffuse Reflection
| 类型 || Type | 表面 || Surface | 反射光 || Reflected Light | 举例 || Example |
| --- | --- | --- | --- |
| 镜面反射 || Specular | 光滑 || Smooth | 平行反射 || Parallel reflection | 平面镜、水面 || Mirror, calm water |
| 漫反射 || Diffuse | 粗糙 || Rough | 散射各方向 || Scattered in all directions | 纸张、墙壁 || Paper, walls |

> **💡 都遵守反射定律 || 💡 Both Obey Reflection Law**
> 漫反射也遵守反射定律！只是粗糙表面各点法线方向不同，导致平行入射光被反射向各个方向。正因漫反射，我们才能从各个角度看到物体。 || Diffuse reflection also obeys the law of reflection! The normals at different surface points vary, scattering parallel rays in all directions. Diffuse reflection is why we see objects from all angles.
:::

## #refraction 03 / Snell's Law of Refraction :: n₁sinθ₁ = n₂sinθ₂

光从一种介质进入另一种介质时发生折射。折射率越大光速越慢，折射角越小。 || Light refracts when entering a different medium. Higher refractive index means slower speed and smaller refraction angle.

:::accordion
::panel { open: true }
### 斯涅尔定律推导 || Snell's Law Derivation
$$
n_1\sin\theta_1 = n_2\sin\theta_2
$$

> **📐 从光速比推导 || 📐 Derivation from Speed Ratio**
> 折射率定义 n = c/v，其中 c 为真空光速，v 为介质中光速。 || Refractive index n = c/v, where c is vacuum light speed, v is medium speed.
> $$
> n = \frac{c}{v}
> $$
> 光从介质 1 进入介质 2，波前到达分界面的时间相等（惠更斯原理），可推出： || Light enters medium 2 from medium 1; wavefront arrival times match (Huygens' principle):
> $$
> \frac{\sin\theta_1}{v_1} = \frac{\sin\theta_2}{v_2} \implies n_1\sin\theta_1 = n_2\sin\theta_2
> $$

光从光疏介质（n 小）进入光密介质（n 大）：折射角 < 入射角，光线向法线偏折。反之远离法线。 || From optically rarer (small n) to denser (large n): refraction angle < incidence angle, light bends toward normal. Reverse: away from normal.

::panel
### 常见折射率 || Common Refractive Indices
| 介质 || Medium | 折射率 n || n |
| --- | --- |
| 真空 || Vacuum | 1.000 |
| 空气 || Air | 1.000 3 |
| 水 || Water | 1.33 |
| 玻璃 || Glass | 1.5 – 1.9 |
| 钻石 || Diamond | 2.42 |
:::

:::sandbox { id: "sim-refraction", title: "交互实验沙盒 || Interactive Simulation Sandbox" }
交互可调参数：入射角： || Incidence:、n₂： || n₂:。
:::

## #total-reflection 04 / Total Internal Reflection :: 临界角与光纤 || Critical Angle and Fiber Optics

光从光密介质射向光疏介质，入射角大于临界角时发生全反射——光纤通信的基础。 || When light goes from denser to rarer medium and incidence angle exceeds critical angle, total internal reflection occurs — the basis of fiber optics.

:::accordion
::panel { open: true }
### 全反射条件 || Conditions for Total Reflection
1

**光密 → 光疏 || Denser → Rarer**

必须从折射率大的介质射向折射率小的介质（如玻璃 → 空气）。 || Must go from higher n to lower n (e.g., glass → air).

2

**入射角 ≥ 临界角 || Incidence ≥ Critical Angle**

入射角达到或超过临界角 C 时，折射光消失，全部反射。 || When incidence angle reaches or exceeds critical angle C, refracted ray vanishes — all light reflects.

$$
\sin C = \frac{n_2}{n_1}
$$

> **📐 临界角推导 || 📐 Critical Angle Derivation**
> 当折射角 θ₂ = 90° 时，sinθ₂ = 1，代入斯涅尔定律： || When refraction angle θ₂ = 90°, sinθ₂ = 1, substituting into Snell's law:
> $$
> n_1\sin C = n_2\cdot 1 \implies \sin C = \frac{n_2}{n_1}
> $$
> 例如玻璃（n=1.5）到空气（n=1）：sinC = 1/1.5 = 0.667，C ≈ 41.8°。 || E.g., glass (n=1.5) to air (n=1): sinC = 1/1.5 = 0.667, C ≈ 41.8°.

::panel
### 光纤通信原理 || Fiber Optics Principle
光纤由高折射率的纤芯和低折射率的包层组成。光在纤芯-包层界面不断全反射，沿光纤传输信号，几乎无损耗。 || Optical fiber has a high-n core and low-n cladding. Light undergoes repeated total internal reflection at the core-cladding interface, transmitting signals with minimal loss.

- **高带宽 || High Bandwidth** — 光纤可同时传输大量数据，带宽远超铜缆。现代互联网骨干网均使用光纤。 || Fiber can carry enormous data simultaneously; bandwidth far exceeds copper. Modern internet backbone uses fiber.
- **钻石闪耀 || Diamond Sparkle** — 钻石 n=2.42，临界角仅 24.4°，大量光线发生全反射后从顶面射出，产生璀璨火彩。 || Diamond n=2.42, critical angle only 24.4°; extensive total reflection produces brilliant sparkle.
:::

## #practice 05 / Enhanced Practice :: 从基础到挑战 || From Basics to Challenge

:::accordion
::panel { open: true }
### 基础题（3 题） || Basic (3 Questions)
> **Q1**
> 光从空气射入水中（n=1.33），入射角 45°，求折射角。 || Light from air enters water (n=1.33) at 45° incidence. Find refraction angle.

**📖 Q1 答案 || 📖 Q1 Answer**

$$
\sin\theta_2 = \frac{n_1\sin\theta_1}{n_2} = \frac{1\times\sin 45°}{1.33} = \frac{0.707}{1.33} = 0.531
$$

$$
\theta_2 = \arcsin(0.531) \approx 32.1°
$$

θ₂ ≈ 32.1°，折射角小于入射角（疏入密，偏向法线）。 || θ₂ ≈ 32.1°, refraction angle < incidence (rarer to denser, bends toward normal).

> **Q2**
> 平面镜前一物体距镜 30 cm，它的像距物多远？像是实像还是虚像？ || Object 30 cm in front of a plane mirror. How far is image from object? Real or virtual?

**📖 Q2 答案 || 📖 Q2 Answer**

平面镜成像：像距 = 物距 = 30 cm。像在镜后 30 cm，物像距离 = 60 cm。等大、正立的虚像。 || Plane mirror: image distance = object distance = 30 cm. Image is 30 cm behind mirror, object-to-image = 60 cm. Same size, upright, virtual image.

> **Q3**
> 水的折射率 n=1.33，求光从水射向空气时的全反射临界角。 || Water n=1.33. Find critical angle for light from water to air.

**📖 Q3 答案 || 📖 Q3 Answer**

$$
\sin C = \frac{n_2}{n_1} = \frac{1}{1.33} = 0.752
$$

$$
C = \arcsin(0.752) \approx 48.8°
$$

临界角 C ≈ 48.8°。入射角大于此值时发生全反射。 || Critical angle C ≈ 48.8°. Total reflection when incidence exceeds this.

::panel
### 进阶题（3 题） || Advanced (3 Questions)
> **Q4**
> 光从玻璃（n=1.5）射入水（n=1.33），入射角 30°，求折射角。能否发生全反射？ || Light from glass (n=1.5) to water (n=1.33) at 30°. Find refraction angle. Can total reflection occur?

**📖 Q4 答案 || 📖 Q4 Answer**

$$
\sin\theta_2 = \frac{1.5\times\sin 30°}{1.33} = \frac{1.5\times 0.5}{1.33} = 0.564
$$

$$
\theta_2 \approx 34.3°
$$

θ₂ ≈ 34.3°。可以发生全反射，因为 n₁ > n₂，临界角 sinC = 1.33/1.5 = 0.887，C ≈ 62.5°。 || θ₂ ≈ 34.3°. Total reflection possible since n₁ > n₂; sinC = 1.33/1.5 = 0.887, C ≈ 62.5°.

> **Q5**
> 为什么人在水下往上看时，只能看到一个圆锥形范围内的水面景象？求该圆锥的半顶角。 || Why does a person underwater see the surface only within a cone? Find the half-angle of this cone.

**📖 Q5 答案 || 📖 Q5 Answer**

水到空气存在全反射临界角 C ≈ 48.8°。超出此角度的光被全反射，人看到水面反射的水底景象。能看到水面的范围是一个半顶角 ≈ 48.8° 的圆锥。 || Water-to-air critical angle C ≈ 48.8°. Beyond this angle, light is totally reflected. Visible surface appears within a cone of half-angle ≈ 48.8°.

> **Q6**
> 一束光从空气以 60° 入射角射到一平行玻璃板（n=1.5）上表面。求光穿过玻璃板后的出射方向与入射方向的关系。 || Light hits a parallel glass slab (n=1.5) at 60°. What is the exit direction relative to incidence?

**📖 Q6 答案 || 📖 Q6 Answer**

平行玻璃板两次折射：进入时偏向法线，射出时偏离法线。由于上下表面平行，出射光线与入射光线平行，但发生侧向位移。出射方向不变（仍为 60°），只是位置平移。 || Parallel slab: two refractions. Entry bends toward normal, exit bends away. Since surfaces are parallel, exit ray is parallel to incident ray but laterally displaced. Direction unchanged (still 60°).
:::

## #roadmap 06 / Series Navigation :: 光学系列导航 || Optics Series Navigation

这是光学系列第 1 篇。几何光学为理解波动光学打好基础。 || Part 1 of Optics. Geometric optics lays the foundation for wave optics.

- **第 1 篇 · 当前 || Part 1 · Current：几何光学 || Geometric Optics**
- [第 2 篇 || Part 2：波动光学 || Wave Optics](../wave-optics/)

:::callout { title: "下一篇预告 || Next Article Preview" }
第 2 篇将聚焦**波动光学**——杨氏双缝干涉、单缝衍射和偏振现象，揭示光的波动本质。 || Part 2: **Wave Optics** — Young's double-slit interference, single-slit diffraction, and polarization, revealing the wave nature of light.
:::
