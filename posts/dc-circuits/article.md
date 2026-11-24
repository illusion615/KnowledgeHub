---
title: "恒定电流：欧姆定律与电路分析 || DC Circuits: Ohm's Law and Circuit Analysis"
eyebrow: "电磁学 · 第 2 篇 / 共 5 篇 || Electromagnetism · Part 2 of 5"
brand: "电磁学 || Electromagnetism"
date: 2026-04-17
strict_i18n: false
strict_density: true
lead: "电流是电荷的定向移动，欧姆定律连接电压、电流与电阻。从简单串并联到闭合电路，系统掌握电路分析方法。 || Current is directional charge flow. Ohm's law connects voltage, current, and resistance. Master circuit analysis from simple to closed circuits."
hero_actions:
  - "开始学习 || Start Learning | #current-voltage"
  - "直接练习 || Go to Practice | #practice"
panel_label: "本章目标 || Chapter Goals"
panel_title: "从欧姆定律到闭合电路 || From Ohm's Law to Closed Circuits"
panel:
  - "理解电流、电压与电动势 || Understand current, voltage, and EMF"
  - "掌握欧姆定律与串并联电阻 || Master Ohm's law and series/parallel resistance"
  - "理解电功率与焦耳定律 || Understand power and Joule's law"
  - "掌握闭合电路欧姆定律 || Master Ohm's law for closed circuits"
metrics:
  - "核心定律 || Core Law | U=IR | 欧姆定律 || Ohm's Law"
  - "闭合电路 || Closed Circuit | ε=I(R+r) | 全电路欧姆定律 || Full circuit Ohm's law"
  - "交互实验 || Interactive Lab | 1 | 电路搭建模拟器 || Circuit Builder Sim"
  - "难度 || Difficulty | ★★★☆☆ | 需静电场基础 || Requires electrostatics"
style:
  accent: "#7c3aed"
---

## #current-voltage 01 / Current and Voltage :: 电荷的定向流动 || Directed Flow of Charges

电流是电荷的定向移动，电压是驱动电流的原因，电动势是电源维持电压的能力。 || Current is directed charge flow. Voltage drives current. EMF is the source's ability to maintain voltage.

:::accordion
::panel { open: true }
### 电流的定义 || Definition of Current
$$
I = \frac{q}{t}
$$

电流 I 等于单位时间通过导体横截面的电荷量。单位：安培（A）。方向规定为正电荷移动方向，与电子实际移动方向相反。 || Current I equals charge passing through a cross-section per unit time. Unit: Ampere (A). Convention: direction of positive charge flow, opposite to electron flow.

- **导体中的电流 || Current in Conductors** — 金属导体中，自由电子在电场作用下定向移动形成电流。电子移动速率约 0.1 mm/s，但电场传播接近光速。 || In metals, free electrons drift under electric field. Drift speed ~0.1 mm/s, but field propagates near light speed.
- **电压与电动势 || Voltage and EMF** — 电压 U 是电场力做功的量度（U=W/q）。电动势 ε 是非静电力做功的量度（ε=W′/q），表征电源将其他能量转化为电能的本领。 || Voltage U measures work by electric force (U=W/q). EMF ε measures work by non-electrostatic force (ε=W′/q), the source's ability to convert energy to electrical energy.
:::

:::sandbox { id: "sim-circuit", title: "交互实验沙盒 || Interactive Simulation Sandbox" }
交互可调参数：电动势 ε || EMF ε、外阻 R || Ext R、内阻 r || Int r。
:::

## #ohm 02 / Ohm's Law and Resistance :: U、I、R 的定量关系 || Quantitative Relationship of U, I, R

导体中的电流与两端电压成正比，与电阻成反比。 || Current through a conductor is proportional to voltage and inversely proportional to resistance.

:::accordion
::panel { open: true }
### 欧姆定律 || Ohm's Law
$$
U = IR
$$

适用于纯电阻电路（金属导体、电解液等）。R 与 U、I 无关，由导体本身决定。单位：欧姆（Ω）。 || Applies to pure resistive circuits (metals, electrolytes). R is independent of U and I — determined by the conductor itself. Unit: Ohm (Ω).

$$
R = \rho \frac{L}{A}
$$

电阻率 ρ 取决于材料和温度。L 为导体长度，A 为横截面积。铜 ρ ≈ 1.7×10⁻⁸ Ω·m，锰铜 ρ ≈ 4.4×10⁻⁷ Ω·m。 || Resistivity ρ depends on material and temperature. L = length, A = cross-section. Copper ρ ≈ 1.7×10⁻⁸ Ω·m.

::panel
### 串联与并联 || Series and Parallel
> **📐 串联电阻推导 || 📐 Series Resistance Derivation**
> 串联时各电阻电流相同 I，总电压 U = U₁ + U₂ = IR₁ + IR₂ = I(R₁+R₂) || In series, current I is the same. Total U = IR₁ + IR₂ = I(R₁+R₂)
> $$
> R_{\text{series}} = R_1 + R_2 + \cdots + R_n
> $$

> **📐 并联电阻推导 || 📐 Parallel Resistance Derivation**
> 并联时各电阻电压相同 U，总电流 I = I₁ + I₂ = U/R₁ + U/R₂ = U(1/R₁+1/R₂) || In parallel, voltage U is the same. Total I = U/R₁ + U/R₂ = U(1/R₁+1/R₂)
> $$
> \frac{1}{R_{\text{parallel}}} = \frac{1}{R_1} + \frac{1}{R_2} + \cdots + \frac{1}{R_n}
> $$

| 比较项 || Comparison | 串联 || Series | 并联 || Parallel |
| --- | --- | --- |
| 电流 || Current | 处处相等 I || Same I everywhere | I = I₁+I₂ |
| 电压 || Voltage | U = U₁+U₂ | 处处相等 U || Same U everywhere |
| 总电阻 || Total R | R = R₁+R₂（增大） || R = R₁+R₂ (increases) | 1/R = 1/R₁+1/R₂（减小） || 1/R = 1/R₁+1/R₂ (decreases) |
| 特点 || Feature | 分压不分流 || Divide voltage | 分流不分压 || Divide current |
:::

## #power 03 / Electric Power and Joule's Law :: 电能的转化与消耗 || Conversion and Consumption of Electrical Energy

电功率衡量电能转化的快慢，焦耳定律给出电流热效应的定量关系。 || Power measures the rate of energy conversion. Joule's law quantifies the heating effect of current.

:::accordion
::panel { open: true }
### 电功率公式族 || Power Formula Family
$$
P = UI = I^2R = \frac{U^2}{R}
$$

三个表达式等价（纯电阻电路）。P = UI 是最普遍的形式，适用于所有电路；后两个仅适用于纯电阻。 || Three equivalent forms (pure resistive circuit). P = UI is the most general. The other two apply only to pure resistance.

> **💡 额定功率与实际功率 || 💡 Rated vs Actual Power**
> 电器标称「220V 100W」表示在额定电压 220V 下功率为 100W。实际电压不同时，实际功率按 P=U²/R 计算（R 不变）。 || A "220V 100W" rating means 100W at 220V. At different voltages, actual power follows P=U²/R (R constant).

::panel
### 焦耳定律 || Joule's Law
$$
Q = I^2 R t
$$

电流通过导体产生的热量 Q 与电流平方、电阻和通电时间成正比。纯电阻电路中 Q = W = UIt。非纯电阻电路中 Q < W（部分电能转化为其他形式）。 || Heat Q produced by current through a conductor is proportional to I², R, and time t. In pure resistance, Q = W = UIt. In non-pure resistance, Q < W.

1

**纯电阻电路 || Pure Resistive Circuit**

电热器、白炽灯——电能全部转化为热能。Q = W = UIt = I²Rt = U²t/R。 || Heaters, incandescent bulbs — all electrical energy converts to heat. Q = W = UIt.

2

**非纯电阻电路 || Non-Pure Resistive Circuit**

电动机、充电电池——电能部分转化为机械能/化学能。Q = I²Rt < W = UIt。 || Motors, charging batteries — part of energy becomes mechanical/chemical. Q = I²Rt < W = UIt.
:::

## #closed-circuit 04 / Ohm's Law for Closed Circuits :: 含内阻的完整分析 || Complete Analysis with Internal Resistance

真实电源都有内阻，外电路电压必然小于电动势。 || Real sources have internal resistance. Terminal voltage is always less than EMF.

:::accordion
::panel { open: true }
### 全电路欧姆定律 || Full Circuit Ohm's Law
$$
\varepsilon = I(R + r)
$$

电动势 ε 等于电流乘以内外电阻之和。路端电压 U = ε − Ir，外阻越大电流越小路端电压越高，短路时 I = ε/r 极大。 || EMF ε equals current times total resistance (internal + external). Terminal voltage U = ε − Ir. Short circuit: I = ε/r, extremely large.

> **📐 路端电压与外阻的关系 || 📐 Terminal Voltage vs External Resistance**
> 将 I = ε/(R+r) 代入 U = IR： || Substitute I = ε/(R+r) into U = IR:
> $$
> U = \varepsilon \cdot \frac{R}{R+r}
> $$
> 当 R ≫ r 时，U ≈ ε（开路近似）；当 R = 0 时，U = 0（短路）。U-I 图为斜率 −r 的直线，纵截距为 ε。 || When R ≫ r, U ≈ ε (open circuit). When R = 0, U = 0 (short circuit). U-I graph is a line with slope −r, y-intercept ε.

::panel
### 外电路最大功率 || Maximum Power to External Circuit
$$
P_R = I^2 R = \frac{\varepsilon^2 R}{(R+r)^2}
$$

对 R 求导令 dP/dR = 0，得最大功率条件：R = r（外阻等于内阻时外电路获得最大功率）。 || Maximize by setting dP/dR = 0: R = r. External circuit receives maximum power when external resistance equals internal resistance.

$$
P_{R,\max} = \frac{\varepsilon^2}{4r} \quad \text{when } R = r
$$

> **💡 效率与功率的矛盾 || 💡 Efficiency vs Power Tradeoff**
> R = r 时功率最大但效率仅 50%。实际工程中通常 R ≫ r，牺牲少量功率换取高效率（发电厂效率需 >95%）。 || At R = r, max power but only 50% efficiency. In practice, R ≫ r for high efficiency (power plants need >95%).
:::

## #practice 05 / Enhanced Practice :: 从基础到挑战 || From Basics to Challenge

:::accordion
::panel { open: true }
### 基础题（3 题） || Basic (3 Questions)
> **Q1**
> 一段导体两端电压 U=6 V，通过的电流 I=0.5 A，求导体电阻。 || Conductor with U=6 V, I=0.5 A. Find resistance.

**📖 Q1 答案 || 📖 Q1 Answer**

$$
R = \frac{U}{I} = \frac{6}{0.5} = 12\text{ }\Omega
$$

R = 12 Ω

> **Q2**
> R₁=6 Ω 和 R₂=3 Ω 串联，求总电阻；若并联，求总电阻。 || R₁=6 Ω and R₂=3 Ω in series, then in parallel. Find total R for each.

**📖 Q2 答案 || 📖 Q2 Answer**

$$
R_{\text{series}} = 6 + 3 = 9\text{ }\Omega
$$

$$
\frac{1}{R_{\text{parallel}}} = \frac{1}{6} + \frac{1}{3} = \frac{1}{2} \Rightarrow R_{\text{parallel}} = 2\text{ }\Omega
$$

串联 9 Ω，并联 2 Ω。 || Series 9 Ω, parallel 2 Ω.

> **Q3**
> 一个电热器功率 P=1000 W，工作 2 小时，产生多少热量？（纯电阻） || Heater P=1000 W, runs 2 hours. How much heat? (pure resistance)

**📖 Q3 答案 || 📖 Q3 Answer**

$$
Q = Pt = 1000 \times 2 \times 3600 = 7.2 \times 10^6\text{ J} = 7.2\text{ MJ}
$$

Q = 7.2 MJ = 2 kWh

::panel
### 进阶题（3 题） || Advanced (3 Questions)
> **Q4**
> 电动势 ε=12 V，内阻 r=1 Ω 的电源接外阻 R=5 Ω。求电流、路端电压和电源效率。 || Source: ε=12 V, r=1 Ω, external R=5 Ω. Find I, terminal voltage, and efficiency.

**📖 Q4 答案 || 📖 Q4 Answer**

$$
I = \frac{\varepsilon}{R+r} = \frac{12}{5+1} = 2\text{ A}
$$

$$
U = \varepsilon - Ir = 12 - 2\times1 = 10\text{ V}
$$

$$
\eta = \frac{U}{\varepsilon} = \frac{R}{R+r} = \frac{5}{6} \approx 83.3\%
$$

I = 2 A，U = 10 V，效率 83.3%。 || I = 2 A, U = 10 V, efficiency 83.3%.

> **Q5**
> 铜导线长 L=100 m，横截面积 A=1 mm²=1×10⁻⁶ m²，铜电阻率 ρ=1.7×10⁻⁸ Ω·m。求电阻。 || Copper wire: L=100 m, A=1 mm², ρ=1.7×10⁻⁸ Ω·m. Find R.

**📖 Q5 答案 || 📖 Q5 Answer**

$$
R = \rho\frac{L}{A} = 1.7\times10^{-8} \times \frac{100}{1\times10^{-6}} = 1.7\text{ }\Omega
$$

R = 1.7 Ω

> **Q6**
> 一电动机接在 U=220 V 的电路中，工作电流 I=5 A，线圈电阻 R₀=2 Ω。求电动机的输入功率、发热功率和机械功率。 || Motor: U=220 V, I=5 A, coil R₀=2 Ω. Find input power, heating power, and mechanical power.

**📖 Q6 答案 || 📖 Q6 Answer**

$$
P_{\text{in}} = UI = 220 \times 5 = 1100\text{ W}
$$

$$
P_{\text{heat}} = I^2 R_0 = 25 \times 2 = 50\text{ W}
$$

$$
P_{\text{mech}} = P_{\text{in}} - P_{\text{heat}} = 1100 - 50 = 1050\text{ W}
$$

输入 1100 W，发热 50 W，机械 1050 W。电动机是非纯电阻电路，不能用 P=U²/R。 || Input 1100 W, heat 50 W, mechanical 1050 W. Motor is non-pure resistive; cannot use P=U²/R.

::panel
### 挑战题（2 题） || Challenge (2 Questions)
> **Q7**
> 电源 ε=6 V，r=0.5 Ω。外接 R₁=4 Ω 和 R₂=12 Ω 并联。求干路电流、各支路电流和路端电压。 || Source ε=6 V, r=0.5 Ω. External R₁=4 Ω and R₂=12 Ω in parallel. Find currents and terminal voltage.

**📖 Q7 答案 || 📖 Q7 Answer**

$$
R_{\text{ext}} = \frac{R_1 R_2}{R_1+R_2} = \frac{4\times12}{16} = 3\text{ }\Omega
$$

$$
I = \frac{\varepsilon}{R_{\text{ext}}+r} = \frac{6}{3.5} \approx 1.71\text{ A}
$$

$$
U = \varepsilon - Ir = 6 - 1.71\times0.5 \approx 5.14\text{ V}
$$

I₁ = U/R₁ = 5.14/4 ≈ 1.29 A，I₂ = U/R₂ = 5.14/12 ≈ 0.43 A。 || I₁ = U/R₁ ≈ 1.29 A, I₂ = U/R₂ ≈ 0.43 A.

> **Q8**
> 测量某电源参数：当外阻 R₁=9 Ω 时路端电压 U₁=4.5 V；当外阻 R₂=4 Ω 时路端电压 U₂=4 V。求电动势 ε 和内阻 r。 || Measuring source: R₁=9 Ω gives U₁=4.5 V; R₂=4 Ω gives U₂=4 V. Find ε and r.

**📖 Q8 答案 || 📖 Q8 Answer**

由 ε = U + Ir = U + (U/R)r，列二元一次方程组： || From ε = U + Ir = U + (U/R)r, set up simultaneous equations:

$$
\varepsilon = 4.5 + \frac{4.5}{9}r = 4.5 + 0.5r
$$

$$
\varepsilon = 4 + \frac{4}{4}r = 4 + r
$$

联立：4.5 + 0.5r = 4 + r → 0.5 = 0.5r → r = 1 Ω，ε = 5 V。 || Solving: 4.5 + 0.5r = 4 + r → r = 1 Ω, ε = 5 V.
:::

## #roadmap 06 / Series Navigation :: 电磁学系列导航 || Electromagnetism Series Navigation

这是电磁学系列第 2 篇。你已掌握欧姆定律与闭合电路分析。 || Part 2 of Electromagnetism. You've mastered Ohm's law and closed circuit analysis.

- [第 1 篇 || Part 1：静电场 || Electrostatics](../electrostatics/)
- **第 2 篇 · 当前 || Part 2 · Current：恒定电流 || DC Circuits**
- [第 3 篇 || Part 3：磁场 || Magnetic Fields](../magnetic-fields/)
- [第 4 篇 || Part 4：电磁感应 || Electromagnetic Induction](../electromagnetic-induction/)
- [第 5 篇 || Part 5：交变电流与电磁波 || AC & EM Waves](../ac-em-waves/)

:::callout { title: "下一篇预告 || Next Article Preview" }
第 3 篇将聚焦**磁场**——从安培力到洛伦兹力，理解电流与磁场的相互作用以及带电粒子在磁场中的运动。 || Part 3: **Magnetic Fields** — from Ampere's force to Lorentz force. Understand current-field interaction and charged particle motion in magnetic fields.
:::
