---
title: "交变电流与电磁波 || Alternating Current & Electromagnetic Waves"
eyebrow: "电磁学 · 第 5 篇 / 共 5 篇 || Electromagnetism · Part 5 of 5"
brand: "电磁学 || Electromagnetism"
date: 2026-04-17
strict_i18n: false
strict_density: true
lead: "线圈在磁场中转动产生交变电动势，变压器改变电压实现远距离输电。麦克斯韦预言电磁波，赫兹实验验证。 || Rotating coil in a field generates AC. Transformers change voltage for power transmission. Maxwell predicted EM waves, Hertz confirmed."
hero_actions:
  - "开始学习 || Start Learning | #ac"
  - "直接练习 || Go to Practice | #practice"
panel_label: "本章目标 || Chapter Goals"
panel_title: "从交流电到电磁波 || From AC to Electromagnetic Waves"
panel:
  - "理解交变电流的产生与描述 || Understand AC generation and description"
  - "掌握变压器原理 U₁/U₂=n₁/n₂ || Master transformer principle U₁/U₂=n₁/n₂"
  - "了解电磁波谱与应用 || Know EM spectrum and applications"
metrics:
  - "交流EMF || AC EMF | e=Eₘsinωt | 正弦交变 || Sinusoidal AC"
  - "变压器 || Transformer | U₁/U₂=n₁/n₂ | 电压变换 || Voltage Conversion"
  - "交互实验 || Interactive Lab | 1 | AC 波形显示 || AC Waveform"
  - "难度 || Difficulty | ★★★☆☆ | 需电磁感应基础 || Requires induction basics"
style:
  accent: "#7c3aed"
---

## #ac 01 / Alternating Current :: 正弦交变电动势的产生 || Generation of Sinusoidal AC EMF

线圈在匀强磁场中匀速转动，磁通量按余弦规律变化，感应电动势按正弦规律变化。 || A coil rotating uniformly in a uniform field produces sinusoidal EMF as flux varies cosinusoidally.

:::accordion
::panel { open: true }
### 交变电动势公式 || AC EMF Formula
$$
e = E_m\sin\omega t = NBA\omega\sin\omega t
$$

Eₘ = NBAω 为峰值电动势。当线圈平面平行于 B 时 e 最大；垂直于 B 时 e = 0（但磁通量最大）。 || E_m = NBAω is peak EMF. Max e when coil plane is parallel to B; e=0 when perpendicular (but flux is maximum).

> **💡 峰值与有效值 || 💡 Peak vs RMS Values**
> 交流电用有效值（均方根值）描述热效应：U = Uₘ/√2 ≈ 0.707Uₘ。我国家用电 220 V 是有效值，峰值约 311 V。频率 50 Hz，周期 0.02 s。 || AC uses RMS for heating effect: U = U_m/√2 ≈ 0.707U_m. China mains 220 V is RMS, peak ~311 V. 50 Hz, T = 0.02 s.

::panel
### 交流电的描述参量 || AC Parameters
| 参量 || Parameter | 符号 || Symbol | 含义 || Meaning |
| --- | --- | --- |
| 峰值 || Peak | Eₘ, Uₘ, Iₘ | 最大值 || Maximum value |
| 有效值 || RMS | U, I | 等效直流热效应 || Equivalent DC heating |
| 周期 || Period | T | 完成一次循环的时间 || Time for one cycle |
| 频率 || Frequency | f | 每秒循环数 || Cycles per second |
| 角频率 || Angular Freq. | ω | ω=2πf |
:::

:::sandbox { id: "sim-ac", title: "交互实验沙盒 || Interactive Simulation Sandbox" }
交互可调参数：频率: || Freq:、振幅: || Amp:。
:::

## #transformer 02 / Transformer :: 电压变换与远距离输电 || Voltage Conversion and Long-Distance Transmission

变压器利用互感原理改变交流电的电压，是远距离输电的关键设备。 || Transformers use mutual induction to change AC voltage — key to long-distance power transmission.

:::accordion
::panel { open: true }
### 变压器公式 || Transformer Equations
$$
\frac{U_1}{U_2} = \frac{n_1}{n_2}
$$

n₁>n₂ 为降压变压器；n₁<n₂ 为升压变压器。理想变压器输入功率等于输出功率。 || n₁>n₂: step-down; n₁<n₂: step-up. Ideal transformer: input power = output power.

> **📐 理想变压器推导 || 📐 Ideal Transformer Derivation**
> 理想条件：无漏磁、无铜损、无铁损。两个线圈共享同一磁通量 Φ： || Ideal conditions: no flux leakage, no copper/iron loss. Both coils share the same flux Φ:
> $$
> \varepsilon_1 = n_1\frac{\Delta\Phi}{\Delta t}, \quad \varepsilon_2 = n_2\frac{\Delta\Phi}{\Delta t}
> $$
> $$
> \frac{\varepsilon_1}{\varepsilon_2} = \frac{n_1}{n_2} \Rightarrow \frac{U_1}{U_2} = \frac{n_1}{n_2}
> $$
> $$
> P_1 = P_2 \Rightarrow U_1 I_1 = U_2 I_2 \Rightarrow \frac{I_1}{I_2} = \frac{n_2}{n_1}
> $$
> 电压与匝数成正比，电流与匝数成反比。 || Voltage is proportional to turns ratio; current is inversely proportional.

::panel
### 远距离输电 || Long-Distance Transmission
1

**输电线损耗 || Transmission Loss**

输电线电阻为 Rₗ，损耗功率 Pₗ = I²Rₗ。要减小损耗，需减小 I。 || Line resistance R_L, loss P_L = I²R_L. To reduce loss, reduce I.

2

**升压减流 || Step Up, Reduce Current**

P = UI，总功率不变时升压可减小电流：升高 n 倍电压 → 电流缩小 n 倍 → 损耗缩小 n² 倍。 || P=UI. Raising voltage n times → current drops n times → loss drops n² times.

3

**高压输电方案 || High-Voltage Scheme**

发电厂 → 升压变压器 → 高压输电线（110 kV–1000 kV）→ 降压变压器 → 用户。 || Power plant → step-up transformer → HV lines (110 kV–1000 kV) → step-down transformer → users.
:::

## #spectrum 03 / Electromagnetic Spectrum :: 从无线电波到伽马射线 || From Radio Waves to Gamma Rays

麦克斯韦预言变化的电场产生磁场、变化的磁场产生电场，电磁波以光速 c 传播。 || Maxwell predicted changing E creates B and vice versa. EM waves propagate at speed c.

:::accordion
::panel { open: true }
### 麦克斯韦电磁理论 || Maxwell's Electromagnetic Theory
1

**变化的磁场产生电场 || Changing B Produces E**

法拉第发现：变化的磁场在空间中激发感应电场（涡旋电场）——电磁感应的本质。 || Faraday: changing B induces an electric field (vortex E) in space — the essence of EM induction.

2

**变化的电场产生磁场 || Changing E Produces B**

麦克斯韦预言：变化的电场同样能在空间中激发磁场——位移电流假说。 || Maxwell predicted: changing E also generates B — the displacement current hypothesis.

3

**电磁波传播 || EM Wave Propagation**

交变电场和磁场相互激发，形成电磁波在空间中传播。真空中电磁波速 c = 3×10⁸ m/s。 || Oscillating E and B fields mutually generate each other, propagating as EM waves at c = 3×10⁸ m/s in vacuum.

$$
c = \lambda f = 3\times10^8\text{ m/s}
$$

::panel
### 电磁波谱 || EM Spectrum
| 类型 || Type | 波长范围 || Wavelength | 应用 || Application |
| --- | --- | --- |
| 无线电波 || Radio | >1 mm | 广播、通信、雷达 || Broadcasting, communication, radar |
| 微波 || Microwave | 1 mm – 1 m | 微波炉、卫星通信 || Microwave oven, satellite comm |
| 红外线 || Infrared | 760 nm – 1 mm | 热成像、遥控器 || Thermal imaging, remote control |
| 可见光 || Visible | 380 – 760 nm | 照明、视觉 || Illumination, vision |
| 紫外线 || UV | 10 – 380 nm | 杀菌、验钞 || Sterilization, UV detection |
| X 射线 || X-ray | 0.01 – 10 nm | 医学透视 || Medical imaging |
| γ 射线 || Gamma | <0.01 nm | 放疗、探伤 || Radiation therapy, NDT |

> **💡 波谱统一性 || 💡 Spectral Unity**
> 所有电磁波本质相同——都是电场与磁场的交替振荡。区别只在于频率（波长）不同。频率越高，光子能量 E=hf 越大，穿透力越强。 || All EM waves are fundamentally the same — oscillating E and B fields. They differ only in frequency. Higher frequency means greater photon energy E=hf and more penetrating.
:::

## #practice 04 / Enhanced Practice :: 从基础到进阶 || From Basics to Advanced

:::accordion
::panel { open: true }
### 基础题（3 题） || Basic (3 Questions)
> **Q1**
> 交流电 e=311 sin(100πt) V，求：(1) 峰值；(2) 有效值；(3) 频率；(4) 周期。 || AC: e=311 sin(100πt) V. Find: (1) peak; (2) RMS; (3) frequency; (4) period.

**📖 Q1 答案 || 📖 Q1 Answer**

(1) Eₘ = 311 V；(2) U = 311/√2 ≈ 220 V；(3) ω=100π, f=ω/(2π)=50 Hz；(4) T=1/f=0.02 s。 || (1) E_m=311 V; (2) U=311/√2≈220 V; (3) ω=100π, f=50 Hz; (4) T=0.02 s.

> **Q2**
> 理想变压器原线圈 n₁=1000 匝，副线圈 n₂=200 匝，原线圈接 220 V 交流电。求副线圈电压。 || Ideal transformer: n₁=1000, n₂=200, U₁=220 V. Find U₂.

**📖 Q2 答案 || 📖 Q2 Answer**

$$
U_2 = U_1\frac{n_2}{n_1} = 220\times\frac{200}{1000} = 44\text{ V}
$$

U₂ = 44 V（降压变压器）。 || U₂ = 44 V (step-down transformer).

> **Q3**
> 电磁波在真空中波长 λ=600 nm，求频率 f。 || EM wave in vacuum, λ=600 nm. Find frequency f.

**📖 Q3 答案 || 📖 Q3 Answer**

$$
f = \frac{c}{\lambda} = \frac{3\times10^8}{600\times10^{-9}} = 5\times10^{14}\text{ Hz}
$$

f = 5×10¹⁴ Hz（可见光，橙黄色光）。 || f = 5×10¹⁴ Hz (visible light, orange-yellow).

::panel
### 进阶题（3 题） || Advanced (3 Questions)
> **Q4**
> 发电厂输出功率 P=10⁴ kW，输电线电阻 Rₗ=100 Ω。比较以 U=10 kV 和 U=100 kV 输电时的线路损耗。 || Power plant output P=10⁴ kW, R_L=100 Ω. Compare line loss at U=10 kV vs 100 kV.

**📖 Q4 答案 || 📖 Q4 Answer**

U=10 kV 时：I=P/U=10⁴/10=1000 A，Pₗ=I²R=10⁸ W=10⁵ kW（损耗 = 总功率！不可行）。 || At 10 kV: I=1000 A, P_L=10⁸ W=10⁵ kW (loss = total power! Not feasible).

U=100 kV 时：I=P/U=10⁴/100=100 A，Pₗ=I²R=10⁶ W=1000 kW（损耗 10%）。 || At 100 kV: I=100 A, P_L=10⁶ W=1000 kW (10% loss).

电压升高 10 倍，损耗降低 100 倍。 || 10× voltage → 100× less loss.

> **Q5**
> 线圈 N=100 匝，面积 A=0.05 m²，在 B=0.4 T 磁场中以 n=3000 r/min 转动。求最大电动势。 || Coil N=100, A=0.05 m², B=0.4 T, n=3000 r/min. Find max EMF.

**📖 Q5 答案 || 📖 Q5 Answer**

$$
\omega = \frac{2\pi n}{60} = \frac{2\pi\times 3000}{60} = 100\pi\text{ rad/s}
$$

$$
E_m = NBA\omega = 100\times 0.4\times 0.05\times 100\pi \approx 628\text{ V}
$$

Eₘ ≈ 628 V。有效值 U ≈ 444 V。 || E_m ≈ 628 V. RMS ≈ 444 V.

> **Q6**
> 理想变压器原线圈接 U₁=220 V，副线圈接 R=44 Ω 负载。n₁=500，n₂=100。求副线圈电压、电流及原线圈电流。 || Ideal transformer U₁=220 V, R=44 Ω, n₁=500, n₂=100. Find U₂, I₂, I₁.

**📖 Q6 答案 || 📖 Q6 Answer**

$$
U_2 = 220\times\frac{100}{500} = 44\text{ V}
$$

$$
I_2 = \frac{U_2}{R} = \frac{44}{44} = 1\text{ A}
$$

$$
I_1 = I_2\frac{n_2}{n_1} = 1\times\frac{100}{500} = 0.2\text{ A}
$$

U₂=44 V，I₂=1 A，I₁=0.2 A。 || U₂=44 V, I₂=1 A, I₁=0.2 A.
:::

## #roadmap 05 / Series Navigation :: 电磁学系列导航 || Electromagnetism Series Navigation

这是电磁学系列第 5 篇（完结）。你已完成电磁学全部内容！ || Part 5 of Electromagnetism (final). You've completed the entire Electromagnetism series!

- [第 1 篇 || Part 1：静电场 || Electrostatics](../electrostatics/)
- [第 2 篇 || Part 2：恒定电流 || DC Circuits](../dc-circuits/)
- [第 3 篇 || Part 3：磁场 || Magnetic Fields](../magnetic-fields/)
- [第 4 篇 || Part 4：电磁感应 || Electromagnetic Induction](../electromagnetic-induction/)
- **第 5 篇 · 当前 || Part 5 · Current：交变电流与电磁波 || AC & EM Waves**

### 🎉 电磁学系列完结 || 🎉 Electromagnetism Series Complete

恭喜！你已学完电磁学全部 5 篇内容，从静电场到电磁波。建议回顾各章核心公式，进行系统性复习，为后续光学和近代物理打下坚实基础。 || Congratulations! You've completed all 5 parts of Electromagnetism, from electrostatics to EM waves. Review core formulas for systematic revision before moving to optics and modern physics.
