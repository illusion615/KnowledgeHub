---
title: "静电场：从库仑定律到电势能 || Electrostatics: From Coulomb's Law to Electric Potential Energy"
eyebrow: "电磁学 · 第 1 篇 / 共 5 篇 || Electromagnetism · Part 1 of 5"
brand: "电磁学 || Electromagnetism"
date: 2026-04-17
strict_i18n: false
strict_density: true
lead: "电荷之间的作用力遵循平方反比定律，电场是传递力的媒介。掌握库仑定律、电场强度与电势能的核心关系。 || Charge interactions follow the inverse-square law. The electric field mediates force. Master Coulomb's law, field intensity, and potential energy."
hero_actions:
  - "开始学习 || Start Learning | #phenomena"
  - "直接练习 || Go to Practice | #practice"
panel_label: "本章目标 || Chapter Goals"
panel_title: "从静电现象到电势能 || From Electrostatic Phenomena to Potential Energy"
panel:
  - "理解静电现象与电荷守恒 || Understand electrostatic phenomena and charge conservation"
  - "掌握库仑定律 F=kq₁q₂/r² || Master Coulomb's law F=kq₁q₂/r²"
  - "理解电场强度及电场线 || Understand electric field intensity and field lines"
  - "掌握电势、电势差与电势能 || Master electric potential, potential difference, and potential energy"
metrics:
  - "核心定律 || Core Law | F=kq₁q₂/r² | 库仑定律 || Coulomb's Law"
  - "关键常数 || Key Constant | k=9×10⁹ | N·m²/C²"
  - "交互实验 || Interactive Lab | 1 | 电场线模拟器 || Field Line Sim"
  - "难度 || Difficulty | ★★★☆☆ | 需力学基础 || Requires mechanics"
style:
  accent: "#7c3aed"
---

## #phenomena 01 / Electrostatic Phenomena :: 电荷与静电力 || Charges and Electrostatic Force

自然界只有两种电荷——正电荷与负电荷，同种相斥、异种相吸。 || Nature has only two types of charge — positive and negative. Like repels, opposite attracts.

:::insight-grid { cols: 2 }
::card 🎈
### 气球摩擦起电 || Balloon Charging
气球在头发上摩擦后能吸附墙壁——摩擦使电子从头发转移到气球表面，气球带负电，与墙壁感应正电区域相吸。 || A balloon rubbed on hair sticks to walls — friction transfers electrons to the balloon, creating attraction via induction.

::card ⚡
### 闪电 || Lightning
云层中冰晶碰撞使正负电荷分离。当电势差达到约 10⁸ V 时，空气被击穿，产生放电通道——闪电。 || Ice crystal collisions separate charges in clouds. When potential difference reaches ~10⁸ V, air breaks down — lightning.

::card 🧲
### 感应起电 || Electrostatic Induction
将带电体靠近导体，导体内自由电子重新分布，近端与带电体异号、远端同号。这就是静电感应。 || Bringing a charged object near a conductor redistributes free electrons — near end opposite, far end same sign.

::card 🔋
### 电荷守恒 || Charge Conservation
电荷既不能被创造也不能被消灭，只能从一个物体转移到另一个物体。系统总电荷量守恒。 || Charge cannot be created or destroyed — only transferred. Total charge is conserved.
:::

:::sandbox { id: "sim-field", title: "交互实验沙盒 || Interactive Simulation Sandbox" }
纯静态前端交互模拟画布，零后端依赖运行。 || Pure static frontend interactive simulation canvas.
:::

## #coulomb 02 / Coulomb's Law :: 电荷间的平方反比力 || Inverse-Square Force Between Charges

两个点电荷之间的静电力与电荷量乘积成正比，与距离平方成反比。 || Electrostatic force between two point charges is proportional to the product of charges and inversely proportional to distance squared.

:::accordion
::panel { open: true }
### 库仑定律公式 || Coulomb's Law Formula
$$
F = k\frac{q_1 q_2}{r^2}
$$

k = 9×10⁹ N·m²/C²（静电力常量）。适用条件：真空中两个静止点电荷。方向沿连线，同号排斥、异号吸引。 || k = 9×10⁹ N·m²/C². Applies to two stationary point charges in vacuum. Direction along the line joining charges.

> **💡 库仑扭秤实验 || 💡 Coulomb's Torsion Balance**
> 1785 年库仑用扭秤精确测量了电荷间的力，证实了平方反比关系。实验精度达到 2%，与理论预期高度吻合。 || In 1785, Coulomb used a torsion balance to precisely measure forces between charges, confirming the inverse-square relationship with ~2% accuracy.

::panel
### 与万有引力的类比 || Comparison with Gravitation
> **📐 库仑力 vs 万有引力 || 📐 Coulomb Force vs Gravitational Force**
> 两者都是平方反比力，但存在本质区别： || Both follow inverse-square law but differ fundamentally:

| 比较项 || Comparison | 库仑力 || Coulomb Force | 万有引力 || Gravitation |
| --- | --- | --- |
| 公式 || Formula | F=kq₁q₂/r² | F=Gm₁m₂/r² |
| 方向 || Direction | 引力或斥力 || Attractive or repulsive | 只有引力 || Attractive only |
| 强度 || Strength | 极强（k=9×10⁹） || Very strong (k=9×10⁹) | 极弱（G=6.67×10⁻¹¹） || Very weak (G=6.67×10⁻¹¹) |
| 适用对象 || Applies to | 带电体 || Charged bodies | 有质量的物体 || Massive bodies |
:::

## #field 03 / Electric Field and Intensity :: 场是力的媒介 || The Field Mediates Force

电荷周围存在电场，电场对放入其中的电荷施加力。电场强度描述电场的强弱和方向。 || An electric field exists around charges and exerts force on other charges placed in it. Field intensity describes strength and direction.

:::accordion
::panel { open: true }
### 电场强度定义 || Definition of Field Intensity
$$
E = \frac{F}{q}
$$

E 是电场本身的性质，与试探电荷 q 无关。单位：N/C 或 V/m。方向：正电荷受力方向。 || E is a property of the field itself, independent of test charge q. Unit: N/C or V/m. Direction: force on positive charge.

$$
E = k\frac{Q}{r^2} \quad \text{(point charge)}
$$

点电荷场强公式中 Q 为场源电荷，r 为场点到源的距离。场强随距离平方衰减。 || For a point charge, Q is the source charge, r is distance from source to field point. E decreases with r².

::panel
### 电场线与匀强电场 || Field Lines and Uniform Field
1

**电场线从正出发 || Lines Start from Positive**

电场线从正电荷出发，终止于负电荷（或延伸至无穷远）。电场线不相交、不闭合。 || Field lines start from positive charges, end at negative charges (or extend to infinity). Lines never cross or form loops.

2

**疏密反映强弱 || Density Reflects Strength**

电场线越密集的区域场强越大；越稀疏的区域场强越小。 || Denser field lines indicate stronger field; sparser lines indicate weaker field.

3

**平行板匀强电场 || Uniform Field: Parallel Plates**

两块平行带电板之间，电场线平行且等间距，场强处处相等：E = U/d，U 为板间电压，d 为板距。 || Between parallel charged plates, field lines are parallel and equal-spaced. E = U/d, where U is voltage and d is plate separation.
:::

## #potential 04 / Electric Potential and Potential Energy :: 能量视角看电场 || The Energy Perspective of Fields

电势描述电场中各点的能量特征，电势能是电荷在电场中的势能。 || Electric potential describes energy characteristics at each point; potential energy is the energy of a charge in a field.

:::accordion
::panel { open: true }
### 电势与电势差 || Potential and Potential Difference
$$
U_{AB} = \varphi_A - \varphi_B = \frac{W_{AB}}{q}
$$

电势差（电压）Uₐₑ 等于电场力将单位正电荷从 A 移到 B 所做的功。电势 φ 是标量，选取参考零点后确定。 || Potential difference U_AB equals work done by electric force moving unit positive charge from A to B. Potential φ is scalar, determined after choosing reference zero.

> **💡 等势面 || 💡 Equipotential Surfaces**
> 电势相等的点构成等势面。等势面与电场线垂直；沿等势面移动电荷，电场力不做功。等势面密集处场强大。 || Points of equal potential form equipotential surfaces. They are perpendicular to field lines; moving charges along them requires no work. Dense surfaces indicate strong fields.

::panel
### 电势能与功能关系 || Potential Energy and Work-Energy
$$
E_p = q\varphi
$$

$$
W_{AB} = E_{pA} - E_{pB} = q(\varphi_A - \varphi_B) = qU_{AB}
$$

电场力做正功，电势能减小；电场力做负功，电势能增加。功 = 电势能的减少量。 || Positive work by electric force decreases potential energy; negative work increases it. Work = decrease in potential energy.

> **📐 能量守恒应用 || 📐 Energy Conservation Application**
> 电荷在电场中运动时，若只受电场力： || When only electric force acts on a charge:
> $$
> \frac{1}{2}mv_A^2 + q\varphi_A = \frac{1}{2}mv_B^2 + q\varphi_B
> $$
> 动能与电势能之和守恒。这是力学中机械能守恒的电学推广。 || Sum of kinetic and electric potential energy is conserved — the electrical analog of mechanical energy conservation.
:::

## #practice 05 / Enhanced Practice :: 从基础到挑战 || From Basics to Challenge

:::accordion
::panel { open: true }
### 基础题（3 题） || Basic (3 Questions)
> **Q1**
> 两个点电荷 q₁=2×10⁻⁸ C，q₂=8×10⁻⁸ C，相距 0.3 m，求它们之间的库仑力。 || Two point charges q₁=2×10⁻⁸ C, q₂=8×10⁻⁸ C, 0.3 m apart. Find Coulomb force.

**📖 Q1 答案 || 📖 Q1 Answer**

$$
F = k\frac{q_1 q_2}{r^2} = 9\times10^9 \times \frac{2\times10^{-8}\times 8\times10^{-8}}{0.3^2} = 1.6\times10^{-4}\text{ N}
$$

F = 1.6×10⁻⁴ N

> **Q2**
> 在电场强度 E=1000 V/m 的匀强电场中，一个 q=2×10⁻⁶ C 的正电荷受到的电场力为多大？ || In a uniform field E=1000 V/m, find force on charge q=2×10⁻⁶ C.

**📖 Q2 答案 || 📖 Q2 Answer**

$$
F = qE = 2\times10^{-6} \times 1000 = 2\times10^{-3}\text{ N}
$$

F = 2×10⁻³ N = 2 mN

> **Q3**
> A、B 两点间电势差 Uₐₑ=100 V，将 q=5×10⁻⁶ C 的正电荷从 A 移到 B，电场力做的功为多少？ || U_AB=100 V. Move q=5×10⁻⁶ C from A to B. Find work by electric force.

**📖 Q3 答案 || 📖 Q3 Answer**

$$
W = qU_{AB} = 5\times10^{-6} \times 100 = 5\times10^{-4}\text{ J}
$$

W = 5×10⁻⁴ J = 0.5 mJ

::panel
### 进阶题（3 题） || Advanced (3 Questions)
> **Q4**
> 点电荷 Q=4×10⁻⁸ C 产生的电场中，距 Q 为 0.2 m 的 A 点场强为多大？方向如何？ || Point charge Q=4×10⁻⁸ C. Find E at point A, 0.2 m away. Direction?

**📖 Q4 答案 || 📖 Q4 Answer**

$$
E = k\frac{Q}{r^2} = 9\times10^9 \times \frac{4\times10^{-8}}{0.04} = 9000\text{ V/m}
$$

E = 9000 V/m，方向沿 Q 到 A 的连线向外（Q 为正电荷）。 || E = 9000 V/m, directed radially outward from Q (positive charge).

> **Q5**
> 平行板电容器板间距 d=2 cm，板间电压 U=200 V。一个电子（e=1.6×10⁻¹⁹ C）在板间受到的电场力为多大？ || Parallel plates: d=2 cm, U=200 V. Find force on electron (e=1.6×10⁻¹⁹ C).

**📖 Q5 答案 || 📖 Q5 Answer**

$$
E = \frac{U}{d} = \frac{200}{0.02} = 10000\text{ V/m}
$$

$$
F = eE = 1.6\times10^{-19} \times 10000 = 1.6\times10^{-15}\text{ N}
$$

F = 1.6×10⁻¹⁵ N，方向从正极板指向负极板（电子受力方向与电场方向相反）。 || F = 1.6×10⁻¹⁵ N, directed from positive to negative plate (opposite to field for electron).

> **Q6**
> 将电荷量 q=4×10⁻⁶ C 的正电荷从电势 φₐ=500 V 处移到 φₑ=200 V 处，求电场力做的功和电势能的变化。 || Move q=4×10⁻⁶ C from φ_A=500 V to φ_B=200 V. Find work and change in potential energy.

**📖 Q6 答案 || 📖 Q6 Answer**

$$
W = q(\varphi_A - \varphi_B) = 4\times10^{-6} \times (500-200) = 1.2\times10^{-3}\text{ J}
$$

W = 1.2 mJ（正功），电势能减少 1.2 mJ。正电荷从高电势移向低电势，电场力做正功。 || W = 1.2 mJ (positive). Potential energy decreases by 1.2 mJ. Positive charge moves from high to low potential.

::panel
### 挑战题（2 题） || Challenge (2 Questions)
> **Q7**
> 三个等量正电荷 q 分别放在等边三角形的三个顶点上，边长为 a。求三角形中心处的电场强度大小。 || Three equal positive charges q at vertices of equilateral triangle, side a. Find E at the center.

**📖 Q7 答案 || 📖 Q7 Answer**

由对称性，三个点电荷在中心产生的电场大小相等、方向互成 120°。三个矢量首尾相接构成封闭三角形，合力为零。 || By symmetry, the three field vectors at the center are equal in magnitude and 120° apart. They form a closed triangle — net field is zero.

$$
E_{\text{center}} = 0
$$

> **Q8**
> 一质子（m=1.67×10⁻²⁷ kg，q=1.6×10⁻¹⁹ C）从静止开始，经 U=1000 V 电势差加速。求末速度。 || A proton (m=1.67×10⁻²⁷ kg, q=1.6×10⁻¹⁹ C) accelerated from rest through U=1000 V. Find final speed.

**📖 Q8 答案 || 📖 Q8 Answer**

由动能定理：qU = ½mv² || By work-energy theorem: qU = ½mv²

$$
v = \sqrt{\frac{2qU}{m}} = \sqrt{\frac{2 \times 1.6\times10^{-19} \times 1000}{1.67\times10^{-27}}} \approx 4.38\times10^5\text{ m/s}
$$

v ≈ 4.38×10⁵ m/s。注意：此速度远小于光速，经典力学适用。 || v ≈ 4.38×10⁵ m/s. Note: well below speed of light, classical mechanics applies.
:::

## #roadmap 06 / Series Navigation :: 电磁学系列导航 || Electromagnetism Series Navigation

这是电磁学系列第 1 篇。你已掌握静电场的核心概念。 || Part 1 of Electromagnetism. You've mastered the core concepts of electrostatics.

- **第 1 篇 · 当前 || Part 1 · Current：静电场 || Electrostatics**
- [第 2 篇 || Part 2：恒定电流 || DC Circuits](../dc-circuits/)
- [第 3 篇 || Part 3：磁场 || Magnetic Fields](../magnetic-fields/)
- [第 4 篇 || Part 4：电磁感应 || Electromagnetic Induction](../electromagnetic-induction/)
- [第 5 篇 || Part 5：交变电流与电磁波 || AC & EM Waves](../ac-em-waves/)

:::callout { title: "下一篇预告 || Next Article Preview" }
第 2 篇将聚焦**恒定电流**——从欧姆定律到闭合电路分析，理解电流、电阻、电功率的核心关系。 || Part 2: **DC Circuits** — from Ohm's law to closed circuit analysis. Understand current, resistance, and power.
:::
