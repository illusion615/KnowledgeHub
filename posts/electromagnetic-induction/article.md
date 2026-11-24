---
title: "电磁感应：法拉第定律与楞次定律 || Electromagnetic Induction: Faraday's & Lenz's Laws"
eyebrow: "电磁学 · 第 4 篇 / 共 5 篇 || Electromagnetism · Part 4 of 5"
brand: "电磁学 || Electromagnetism"
date: 2026-04-17
strict_i18n: false
strict_density: true
lead: "变化的磁通量产生感应电动势。法拉第定律给出大小，楞次定律确定方向——这是发电机和变压器的物理基础。 || Changing magnetic flux induces EMF. Faraday's law gives magnitude, Lenz's law gives direction — the physics behind generators and transformers."
hero_actions:
  - "开始学习 || Start Learning | #phenomena"
  - "直接练习 || Go to Practice | #practice"
panel_label: "本章目标 || Chapter Goals"
panel_title: "从磁通量到感应电动势 || From Magnetic Flux to Induced EMF"
panel:
  - "理解电磁感应现象与磁通量 || Understand EM induction and magnetic flux"
  - "掌握法拉第定律 ε=NΔΦ/Δt || Master Faraday's law ε=NΔΦ/Δt"
  - "运用楞次定律判断感应电流方向 || Use Lenz's law to determine induced current direction"
  - "理解动生电动势 ε=BLv || Understand motional EMF ε=BLv"
metrics:
  - "核心定律 || Core Law | ε=NΔΦ/Δt | 法拉第定律 || Faraday's Law"
  - "动生EMF || Motional EMF | ε=BLv | 导体切割磁力线 || Conductor cuts field lines"
  - "交互实验 || Interactive Lab | 1 | 磁铁穿线圈 || Magnet through coil"
  - "难度 || Difficulty | ★★★★☆ | 需磁场基础 || Requires magnetic field basics"
style:
  accent: "#7c3aed"
---

## #phenomena 01 / Electromagnetic Induction Phenomena :: 法拉第的发现 || Faraday's Discovery

1831 年法拉第发现：变化的磁场能在闭合回路中产生感应电流。关键是磁通量的变化，而非磁场本身。 || In 1831, Faraday discovered: changing magnetic field induces current in a closed loop. The key is flux change, not the field itself.

:::accordion
::panel { open: true }
### 磁通量 Φ || Magnetic Flux Φ
$$
\Phi = BA\cos\theta
$$

Φ 为穿过面积 A 的磁通量，θ 为 B 与面法线的夹角。单位：Wb（韦伯），1 Wb = 1 T·m²。 || Φ is magnetic flux through area A, θ is angle between B and surface normal. Unit: Wb (Weber), 1 Wb = 1 T·m².

- **改变 B || Change B** — 插入/拔出磁铁改变线圈中的磁场强度，磁通量变化 → 产生感应电动势。 || Inserting/removing a magnet changes B in the coil, flux changes → induced EMF.
- **改变 A || Change A** — 导体棒在磁场中滑动切割磁力线，有效面积变化 → 磁通量变化 → 产生动生电动势。 || Conductor slides in field, effective area changes → flux changes → motional EMF.
- **改变 θ || Change θ** — 线圈在磁场中转动，cosθ 不断变化 → 磁通量持续变化 → 产生交变电动势（发电机原理）。 || Coil rotates in field, cosθ changes continuously → flux changes → alternating EMF (generator principle).
:::

:::sandbox { id: "sim-induction", title: "交互实验沙盒 || Interactive Simulation Sandbox" }
交互可调参数：拖动磁铁： || Drag magnet:。
:::

## #faraday 02 / Faraday's Law of Induction :: 感应电动势的大小 || Magnitude of Induced EMF

感应电动势的大小等于磁通量变化率的 N 倍。变化越快，电动势越大。 || Induced EMF equals N times the rate of flux change. Faster change means larger EMF.

:::accordion
::panel { open: true }
### 法拉第定律公式 || Faraday's Law Formula
$$
\varepsilon = N\frac{\Delta\Phi}{\Delta t}
$$

N 为线圈匝数，ΔΦ 为磁通量变化量，Δt 为时间间隔。此公式给出的是平均电动势。 || N is number of turns, ΔΦ is flux change, Δt is time interval. This gives average EMF.

> **📐 动生电动势推导 || 📐 Motional EMF Derivation**
> 导体棒 L 以速度 v 在 B 中垂直切割磁力线，Δt 时间内扫过面积 ΔA = LvΔt： || Conductor of length L moves at v perpendicular to B, sweeps area ΔA = LvΔt in Δt:
> $$
> \Delta\Phi = B\cdot L\cdot v\cdot\Delta t
> $$
> $$
> \varepsilon = \frac{\Delta\Phi}{\Delta t} = BLv
> $$
> 动生电动势 ε = BLv，方向用右手定则或楞次定律判断。 || Motional EMF ε = BLv. Direction by right-hand rule or Lenz's law.

::panel
### 感应电动势 vs 感应电流 || Induced EMF vs Current
| 物理量 || Quantity | 产生条件 || Condition | 公式 || Formula |
| --- | --- | --- |
| 感应电动势 || Induced EMF | 磁通量变化即可 || Flux change (open or closed circuit) | ε = NΔΦ/Δt |
| 感应电流 || Induced Current | 需闭合回路 || Requires closed circuit | I = ε/R |

> **💡 易混淆点 || 💡 Common Confusion**
> 开路也能产生感应电动势，但无感应电流。闭合回路中感应电流 I = ε/(Rₑ+r)，其中 Rₑ 是外电阻，r 是内阻。 || Open circuit has induced EMF but no current. In closed circuit: I = ε/(R+r), R external, r internal resistance.
:::

## #lenz 03 / Lenz's Law :: 感应电流方向的判断 || Determining Induced Current Direction

感应电流的方向总是使其产生的磁通量阻碍原磁通量的变化——“增反减同”。 || Induced current always opposes the change in flux that caused it — “oppose increase, support decrease.”

:::accordion
::panel { open: true }
### 楞次定律表述 || Lenz's Law Statement
感应电流产生的磁场，总是阻碍引起感应电流的磁通量的变化。 || The magnetic field produced by induced current always opposes the change in flux that causes it.

1

**判断原磁通量变化 || Determine Flux Change**

原磁通量是增大还是减小？ || Is the original flux increasing or decreasing?

2

**确定感应磁场方向 || Find Induced B Direction**

增大 → 感应磁场与原磁场方向相反（反）；减小 → 感应磁场与原磁场同向（同）。 || Increasing → induced B opposes original; Decreasing → induced B supports original.

3

**用右手定则找电流 || Right-Hand Rule for Current**

根据感应磁场方向，用安培定则（右手定则）确定感应电流的方向。 || From induced B direction, use right-hand rule to find induced current direction.

::panel
### 楞次定律的本质 || Essence of Lenz's Law
> **💡 能量守恒的体现 || 💡 Energy Conservation Manifestation**
> 楞次定律是能量守恒定律在电磁感应中的体现。感应电流产生的安培力总是阻碍导体的相对运动或磁通量的变化，因此需要外力克服安培力做功，将机械能转化为电能。 || Lenz's law reflects energy conservation in EM induction. Ampere force from induced current always opposes relative motion, requiring external work to convert mechanical to electrical energy.

> **📐 导体棒受力分析 || 📐 Force Analysis on Conductor**
> 导体棒以速度 v 在 B 中切割磁力线，产生 ε = BLv，回路电流 I = BLv/R，安培力 Fₐ = BIL = B²L²v/R，方向阻碍运动。 || Conductor at v in B: ε=BLv, I=BLv/R, F_a=BIL=B²L²v/R, opposing motion.
:::

## #practice 04 / Enhanced Practice :: 从基础到挑战 || From Basics to Challenge

:::accordion
::panel { open: true }
### 基础题（3 题） || Basic (3 Questions)
> **Q1**
> 匀强磁场 B=0.5 T，面积 A=0.04 m² 的线圈平面垂直于 B。在 0.1 s 内磁场均匀减至零，求感应电动势。 || B=0.5 T, coil area A=0.04 m² perpendicular to B. B drops to 0 in 0.1 s. Find EMF.

**📖 Q1 答案 || 📖 Q1 Answer**

$$
\varepsilon = \frac{\Delta\Phi}{\Delta t} = \frac{BA}{0.1} = \frac{0.5\times 0.04}{0.1} = 0.2\text{ V}
$$

ε = 0.2 V

> **Q2**
> 导体棒 L=0.5 m 以 v=4 m/s 在 B=0.3 T 的匀强磁场中垂直切割磁力线，求动生电动势。 || Conductor L=0.5 m, v=4 m/s, B=0.3 T. Find motional EMF.

**📖 Q2 答案 || 📖 Q2 Answer**

$$
\varepsilon = BLv = 0.3\times 0.5\times 4 = 0.6\text{ V}
$$

ε = 0.6 V

> **Q3**
> 一个 100 匝线圈，磁通量在 0.02 s 内从 0.01 Wb 变化到 0.03 Wb，求平均感应电动势。 || 100-turn coil, flux changes from 0.01 Wb to 0.03 Wb in 0.02 s. Find average EMF.

**📖 Q3 答案 || 📖 Q3 Answer**

$$
\varepsilon = N\frac{\Delta\Phi}{\Delta t} = 100\times\frac{0.02}{0.02} = 100\text{ V}
$$

ε = 100 V

::panel
### 进阶题（3 题） || Advanced (3 Questions)
> **Q4**
> 导体棒 L=0.8 m 以 v=5 m/s 在 B=0.2 T 磁场中切割磁力线，回路总电阻 R=2 Ω。求回路中的感应电流和安培力。 || Conductor L=0.8 m, v=5 m/s, B=0.2 T, R=2 Ω. Find current and Ampere force.

**📖 Q4 答案 || 📖 Q4 Answer**

$$
\varepsilon = BLv = 0.2\times 0.8\times 5 = 0.8\text{ V}
$$

$$
I = \frac{\varepsilon}{R} = \frac{0.8}{2} = 0.4\text{ A}
$$

$$
F_a = BIL = 0.2\times 0.4\times 0.8 = 0.064\text{ N}
$$

I = 0.4 A，Fₐ = 0.064 N（方向阻碍运动）。 || I = 0.4 A, F_a = 0.064 N (opposing motion).

> **Q5**
> 磁铁 N 极朝下插入线圈时，从上方看感应电流是顺时针还是逆时针？磁通量是增大还是减小？ || Magnet N pole moves down into coil. Viewed from above: clockwise or counterclockwise? Is flux increasing or decreasing?

**📖 Q5 答案 || 📖 Q5 Answer**

N 极靠近 → 穿过线圈向下的磁通量增大 → 感应磁场向上（增反）→ 从上方看逆时针。 || N approaching → downward flux increases → induced B upward (opposes increase) → counterclockwise from above.

> **Q6**
> 一个 50 匝线圈，面积 0.02 m²，在 B=0.4 T 磁场中以 ω=100 rad/s 匀速转动，求最大感应电动势。 || 50-turn coil, A=0.02 m², B=0.4 T, ω=100 rad/s. Find max EMF.

**📖 Q6 答案 || 📖 Q6 Answer**

$$
\varepsilon_m = NBA\omega = 50\times 0.4\times 0.02\times 100 = 40\text{ V}
$$

εₘ = 40 V（线圈平面平行于磁场时电动势最大）。 || ε_m = 40 V (max when coil plane is parallel to field).

::panel
### 挑战题（2 题） || Challenge (2 Questions)
> **Q7**
> 导轨上导体棒从静止释放，在竖直平面内的匀强磁场 B 中下滑（受重力和安培力）。分析棒的运动趋势并求最终速度（棒质量 m，长 L，回路电阻 R）。 || Conductor bar released from rest on rails in vertical uniform B field (gravity + Ampere force). Analyze motion and find terminal velocity (mass m, length L, resistance R).

**📖 Q7 答案 || 📖 Q7 Answer**

下滑 → v 增大 → ε=BLv 增大 → I=BLv/R 增大 → Fₐ=B²L²v/R 增大 → 加速度减小。最终 Fₐ=mg 时匀速。 || Sliding → v increases → EMF increases → current increases → Ampere force increases → acceleration decreases. Terminal: F_a = mg.

$$
mg = \frac{B^2L^2v_{\max}}{R} \Rightarrow v_{\max} = \frac{mgR}{B^2L^2}
$$

最终匀速 vₘₐₓ = mgR/(B²L²)。 || Terminal velocity v_max = mgR/(B²L²).

> **Q8**
> 正方形线圈（边长 a=0.1 m，N=200 匝，R=5 Ω）以 v=2 m/s 匀速进入 B=0.5 T 的匀强磁场（磁场区域宽度 > a）。求进入过程中的感应电动势和电流。 || Square coil (a=0.1 m, N=200, R=5 Ω) enters B=0.5 T at v=2 m/s. Find EMF and current during entry.

**📖 Q8 答案 || 📖 Q8 Answer**

$$
\varepsilon = NBav = 200\times 0.5\times 0.1\times 2 = 20\text{ V}
$$

$$
I = \frac{\varepsilon}{R} = \frac{20}{5} = 4\text{ A}
$$

ε = 20 V，I = 4 A。完全进入后磁通量不再变化，ε=0，I=0。 || ε = 20 V, I = 4 A. Once fully inside, flux is constant: ε=0, I=0.
:::

## #roadmap 05 / Series Navigation :: 电磁学系列导航 || Electromagnetism Series Navigation

这是电磁学系列第 4 篇。法拉第定律与楞次定律是电磁感应的核心。 || Part 4 of Electromagnetism. Faraday's and Lenz's laws are the core of EM induction.

- [第 1 篇 || Part 1：静电场 || Electrostatics](../electrostatics/)
- [第 2 篇 || Part 2：恒定电流 || DC Circuits](../dc-circuits/)
- [第 3 篇 || Part 3：磁场 || Magnetic Fields](../magnetic-fields/)
- **第 4 篇 · 当前 || Part 4 · Current：电磁感应 || Electromagnetic Induction**
- [第 5 篇 || Part 5：交变电流与电磁波 || AC & EM Waves](../ac-em-waves/)

:::callout { title: "下一篇预告 || Next Article Preview" }
第 5 篇将聚焦**交变电流与电磁波**——从交流发电到变压器，从麦克斯韦到电磁波谱。 || Part 5: **AC & EM Waves** — from AC generation to transformers, from Maxwell to the electromagnetic spectrum.
:::
