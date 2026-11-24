---
title: "磁场：安培力与洛伦兹力 || Magnetic Fields: Ampere Force & Lorentz Force"
eyebrow: "电磁学 · 第 3 篇 / 共 5 篇 || Electromagnetism · Part 3 of 5"
brand: "电磁学 || Electromagnetism"
date: 2026-04-17
strict_i18n: false
strict_density: true
lead: "电流产生磁场，磁场对电流和运动电荷施力。掌握安培力、洛伦兹力与带电粒子在磁场中的圆周运动。 || Currents create magnetic fields; fields exert forces on currents and moving charges. Master Ampere force, Lorentz force, and circular motion of charged particles."
hero_actions:
  - "开始学习 || Start Learning | #basics"
  - "直接练习 || Go to Practice | #practice"
panel_label: "本章目标 || Chapter Goals"
panel_title: "从磁场到带电粒子运动 || From Magnetic Fields to Charged Particle Motion"
panel:
  - "理解磁感应强度 B 与磁场线 || Understand magnetic flux density B and field lines"
  - "掌握安培力 F=BIL sinθ || Master Ampere force F=BIL sinθ"
  - "掌握洛伦兹力 F=qvB sinθ || Master Lorentz force F=qvB sinθ"
  - "推导轨道半径 r=mv/(qB) || Derive orbital radius r=mv/(qB)"
metrics:
  - "安培力 || Ampere Force | F=BIL sinθ | 通电导线受力 || Force on wire"
  - "洛伦兹力 || Lorentz Force | F=qvB sinθ | 运动电荷受力 || Force on charge"
  - "交互实验 || Interactive Lab | 1 | 粒子圆周运动 || Circular Motion"
  - "难度 || Difficulty | ★★★☆☆ | 需电学基础 || Requires E&M basics"
style:
  accent: "#7c3aed"
---

## #basics 01 / Magnetic Field Basics :: 磁感应强度与磁场线 || Magnetic Flux Density and Field Lines

磁场是磁体和电流周围存在的一种物质，磁感应强度 B 描述磁场的强弱和方向。 || Magnetic fields exist around magnets and currents. B describes field strength and direction.

:::accordion
::panel { open: true }
### 磁感应强度 B || Magnetic Flux Density B
$$
B = \frac{F}{IL} \quad \text{(unit: T = Tesla)}
$$

定义：在匀强磁场中，垂直于 B 放置的通电导线所受力 F 与电流 I 和导线长度 L 的比值。1 T = 1 N/(A·m)。 || Definition: ratio of force on a current-carrying wire perpendicular to B, to the product IL. 1 T = 1 N/(A·m).

- **地磁场 || Earth's Field** — 地球磁场约 5×10⁻⁵ T，地磁北极在地理南极附近。指南针的 N 极指向地磁南极（地理北极方向）。 || Earth's field ~5×10⁻⁵ T. Magnetic north is near geographic south. Compass N points toward geographic north.
- **MRI 磁场 || MRI Field** — 医用 MRI 磁场约 1.5–3 T，是地磁场的数万倍。超导线圈产生强大均匀磁场用于人体成像。 || Medical MRI fields ~1.5–3 T, tens of thousands times Earth's field. Superconducting coils generate strong uniform fields.

::panel
### 磁场线与右手定则 || Field Lines and Right-Hand Rule
1

**磁场线方向 || Field Line Direction**

磁场线从 N 极出发，回到 S 极（外部）；在磁体内部从 S 极到 N 极。磁场线是闭合曲线，不相交。 || Field lines go from N to S (external), S to N inside magnet. They are closed curves, never crossing.

2

**直线电流磁场 || Straight Current Field**

用安培定则（右手定则）：右手握住导线，大拇指指向电流方向，四指弯曲方向为磁场线方向。 || Right-hand grip rule: thumb along current, curled fingers show field direction.

3

**螺线管磁场 || Solenoid Field**

右手握螺线管，四指沿电流方向弯曲，大拇指所指方向为螺线管 N 极方向。螺线管内部磁场近似匀强。 || Right hand grips solenoid, fingers curl with current, thumb points to N pole. Internal field is approximately uniform.
:::

## #ampere 02 / Ampere Force :: 通电导线在磁场中的受力 || Force on Current-Carrying Wire in Magnetic Field

通电导线在磁场中受到力的作用——安培力。其大小取决于 B、I、L 和夹角 θ。 || A current-carrying wire in a magnetic field experiences a force — Ampere force. Depends on B, I, L, and angle θ.

:::accordion
::panel { open: true }
### 安培力公式与推导 || Ampere Force Formula and Derivation
$$
F = BIL\sin\theta
$$

θ 为电流方向与磁场方向的夹角。当 θ=90° 时，F 最大 = BIL；当 θ=0° 时，F=0。 || θ is angle between current and B direction. Maximum F=BIL when θ=90°; F=0 when θ=0°.

> **📐 安培力的微观本质 || 📐 Microscopic Origin of Ampere Force**
> 导线中有 n 个自由电荷/单位体积，每个电荷 q 以漂移速度 v 运动，截面积 S，长度 L： || With n free charges per volume, each charge q drifting at speed v, cross-section S, length L:
> $$
> I = nqvS
> $$
> $$
> F = nSL \cdot qvB = BIL
> $$
> 安培力是所有运动电荷所受洛伦兹力的宏观表现。 || Ampere force is the macroscopic manifestation of Lorentz forces on all moving charges.

::panel
### 左手定则判断方向 || Left-Hand Rule for Direction
1

**伸开左手 || Extend Left Hand**

让磁场线穿入手心（手心朝向 B 的方向）。 || Let field lines enter the palm (palm faces B direction).

2

**四指指向电流 || Fingers Point Along Current**

四指伸直指向电流 I 的方向。 || Straight fingers point in current direction I.

3

**拇指即力方向 || Thumb Shows Force**

大拇指所指方向即为安培力 F 的方向。 || Thumb points in the direction of Ampere force F.

> **💡 常见应用 || 💡 Common Applications**
> 直流电动机利用安培力使线圈转动；电流天平利用安培力测量电流；磁悬浮列车利用安培力实现悬浮与驱动。 || DC motors use Ampere force to rotate coils; current balances measure current; maglev trains use it for levitation and propulsion.
:::

## #lorentz 03 / Lorentz Force :: 运动电荷在磁场中的受力 || Force on Moving Charge in Magnetic Field

单个运动电荷在磁场中受到洛伦兹力，方向垂直于速度和磁场，不做功。 || A single moving charge experiences Lorentz force, perpendicular to both v and B. Does no work.

:::accordion
::panel { open: true }
### 洛伦兹力公式 || Lorentz Force Formula
$$
F = qvB\sin\theta
$$

θ 为速度 v 与磁场 B 的夹角。洛伦兹力始终垂直于速度方向，因此不做功，不改变动能，只改变运动方向。 || θ is angle between v and B. Lorentz force is always perpendicular to v, so it does no work — changes direction only.

> **💡 关键特征 || 💡 Key Properties**
> 洛伦兹力不做功 → 速率不变 → 只改变速度方向。若 v ⊥ B，粒子做匀速圆周运动；若 v 与 B 成任意角，粒子做螺旋运动。 || Lorentz force does no work → speed is constant → only direction changes. If v⊥B: uniform circular motion; if at angle: helical motion.

::panel
### 圆周与螺旋运动 || Circular and Helical Motion
> **📐 圆周运动半径推导 || 📐 Circular Motion Radius Derivation**
> 当 v ⊥ B 时，洛伦兹力提供向心力： || When v⊥B, Lorentz force provides centripetal force:
> $$
> qvB = \frac{mv^2}{r}
> $$
> $$
> r = \frac{mv}{qB}
> $$
> 周期 T = 2πr/v = 2πm/(qB)，与速度无关！这是回旋加速器的理论基础。 || Period T = 2πr/v = 2πm/(qB), independent of speed! This is the basis of cyclotrons.

| 运动类型 || Motion Type | 条件 || Condition | 轨迹 || Trajectory |
| --- | --- | --- |
| 匀速圆周 || Uniform Circular | v ⊥ B | 圆形，r=mv/(qB) || Circle, r=mv/(qB) |
| 螺旋运动 || Helical | v 与 B 成角 θ || v at angle θ to B | 螺旋线 || Helix |
| 匀速直线 || Uniform Linear | v ∥ B | 直线，F=0 || Straight, F=0 |
:::

:::sandbox { id: "sim-particle", title: "交互实验沙盒 || Interactive Simulation Sandbox" }
交互可调参数：v:、B:、q:。
:::

## #practice 04 / Enhanced Practice :: 从基础到挑战 || From Basics to Challenge

:::accordion
::panel { open: true }
### 基础题（3 题） || Basic (3 Questions)
> **Q1**
> 一根长 L=0.5 m 的导线，通过 I=4 A 的电流，垂直放入 B=0.2 T 的匀强磁场中，求安培力。 || Wire L=0.5 m, I=4 A, perpendicular to B=0.2 T. Find Ampere force.

**📖 Q1 答案 || 📖 Q1 Answer**

$$
F = BIL\sin 90° = 0.2 \times 4 \times 0.5 = 0.4\text{ N}
$$

F = 0.4 N

> **Q2**
> 一个电子（e=1.6×10⁻¹⁹ C）以 v=2×10⁶ m/s 的速度垂直射入 B=0.1 T 的磁场中，求洛伦兹力。 || Electron (e=1.6×10⁻¹⁹ C) enters B=0.1 T at v=2×10⁶ m/s perpendicular. Find Lorentz force.

**📖 Q2 答案 || 📖 Q2 Answer**

$$
F = qvB = 1.6\times10^{-19} \times 2\times10^6 \times 0.1 = 3.2\times10^{-14}\text{ N}
$$

F = 3.2×10⁻¹⁴ N

> **Q3**
> 质子（m=1.67×10⁻²⁷ kg，q=1.6×10⁻¹⁹ C）以 v=10⁶ m/s 垂直射入 B=0.5 T 磁场，求圆周运动半径。 || Proton (m=1.67×10⁻²⁷ kg, q=1.6×10⁻¹⁹ C) at v=10⁶ m/s, B=0.5 T. Find radius.

**📖 Q3 答案 || 📖 Q3 Answer**

$$
r = \frac{mv}{qB} = \frac{1.67\times10^{-27}\times 10^6}{1.6\times10^{-19}\times 0.5} = 0.0209\text{ m} \approx 2.09\text{ cm}
$$

r ≈ 2.09 cm

::panel
### 进阶题（3 题） || Advanced (3 Questions)
> **Q4**
> 一根导线长 L=0.4 m，通过 I=5 A 的电流，与磁场方向成 30° 角放入 B=0.3 T 的匀强磁场中，求安培力。 || Wire L=0.4 m, I=5 A at 30° to B=0.3 T. Find Ampere force.

**📖 Q4 答案 || 📖 Q4 Answer**

$$
F = BIL\sin 30° = 0.3\times 5\times 0.4\times 0.5 = 0.3\text{ N}
$$

F = 0.3 N。sin 30° = 0.5。 || F = 0.3 N. sin 30° = 0.5.

> **Q5**
> 带电粒子在 B=0.2 T 的磁场中做圆周运动，半径 r=0.1 m，周期 T=6.28×10⁻⁷ s。求粒子的荷质比 q/m。 || Charged particle in B=0.2 T, r=0.1 m, T=6.28×10⁻⁷ s. Find q/m.

**📖 Q5 答案 || 📖 Q5 Answer**

$$
T = \frac{2\pi m}{qB} \Rightarrow \frac{q}{m} = \frac{2\pi}{TB} = \frac{2\pi}{6.28\times10^{-7}\times 0.2} = 5\times10^7\text{ C/kg}
$$

q/m = 5×10⁷ C/kg

> **Q6**
> 一束正离子以 v=4×10⁶ m/s 垂直进入 B=0.4 T 磁场，测得半径 r=0.21 m。已知离子电荷 q=1.6×10⁻¹⁹ C，求离子质量。 || Ions at v=4×10⁶ m/s enter B=0.4 T, r=0.21 m, q=1.6×10⁻¹⁹ C. Find mass.

**📖 Q6 答案 || 📖 Q6 Answer**

$$
m = \frac{qBr}{v} = \frac{1.6\times10^{-19}\times 0.4\times 0.21}{4\times10^6} = 3.36\times10^{-27}\text{ kg}
$$

m ≈ 3.36×10⁻²⁷ kg ≈ 2 倍质子质量（α 粒子候选）。 || m ≈ 3.36×10⁻²⁷ kg ≈ 2× proton mass (alpha particle candidate).

::panel
### 挑战题（2 题） || Challenge (2 Questions)
> **Q7**
> 电子以 v=3×10⁶ m/s 的速度与 B=0.01 T 的匀强磁场成 60° 角射入。求螺旋运动的：(1) 圆周运动半径；(2) 螺距。 || Electron at v=3×10⁶ m/s enters B=0.01 T at 60°. Find: (1) circular radius; (2) pitch.

**📖 Q7 答案 || 📖 Q7 Answer**

垂直分速度 v⊥ = v sin 60° = 2.6×10⁶ m/s；平行分速度 v∥ = v cos 60° = 1.5×10⁶ m/s。 || v⊥ = v sin 60° = 2.6×10⁶ m/s; v∥ = v cos 60° = 1.5×10⁶ m/s.

$$
r = \frac{mv_\perp}{qB} = \frac{9.11\times10^{-31}\times 2.6\times10^6}{1.6\times10^{-19}\times 0.01} \approx 1.48\times10^{-3}\text{ m}
$$

$$
T = \frac{2\pi m}{qB} \approx 3.58\times10^{-9}\text{ s}
$$

$$
d = v_\parallel T \approx 1.5\times10^6 \times 3.58\times10^{-9} \approx 5.37\times10^{-3}\text{ m}
$$

r ≈ 1.48 mm，螺距 d ≈ 5.37 mm。 || r ≈ 1.48 mm, pitch d ≈ 5.37 mm.

> **Q8**
> 回旋加速器中，质子在 B=1.2 T 磁场中加速，最大半径 R=0.5 m。求质子获得的最大动能。(mₚ=1.67×10⁻²⁷ kg) || Cyclotron: proton in B=1.2 T, max radius R=0.5 m. Find max kinetic energy. (mₚ=1.67×10⁻²⁷ kg)

**📖 Q8 答案 || 📖 Q8 Answer**

由 r = mv/(qB) 得 v = qBR/m： || From r=mv/(qB), v=qBR/m:

$$
E_k = \frac{1}{2}mv^2 = \frac{q^2B^2R^2}{2m} = \frac{(1.6\times10^{-19})^2\times 1.44\times 0.25}{2\times 1.67\times10^{-27}} \approx 2.76\times10^{-12}\text{ J}
$$

Eₖ ≈ 2.76×10⁻¹² J ≈ 17.3 MeV。 || Eₖ ≈ 2.76×10⁻¹² J ≈ 17.3 MeV.
:::

## #roadmap 05 / Series Navigation :: 电磁学系列导航 || Electromagnetism Series Navigation

这是电磁学系列第 3 篇。安培力与洛伦兹力是电磁学的核心工具。 || Part 3 of Electromagnetism. Ampere and Lorentz forces are core EM tools.

- [第 1 篇 || Part 1：静电场 || Electrostatics](../electrostatics/)
- [第 2 篇 || Part 2：恒定电流 || DC Circuits](../dc-circuits/)
- **第 3 篇 · 当前 || Part 3 · Current：磁场 || Magnetic Fields**
- [第 4 篇 || Part 4：电磁感应 || Electromagnetic Induction](../electromagnetic-induction/)
- [第 5 篇 || Part 5：交变电流与电磁波 || AC & EM Waves](../ac-em-waves/)

:::callout { title: "下一篇预告 || Next Article Preview" }
第 4 篇将聚焦**电磁感应**——从法拉第定律到楞次定律，理解感应电动势的产生与方向判断。 || Part 4: **Electromagnetic Induction** — from Faraday's law to Lenz's law and induced EMF.
:::
