---
title: "圆周运动：从旋转木马到卫星轨道 || Circular Motion: From Carousels to Satellite Orbits"
eyebrow: "力学 · 第 5 篇 / 共 8 篇 || Mechanics · Part 5 of 8"
brand: "力学 || Mechanics"
date: 2026-04-16
strict_i18n: false
strict_density: true
lead: "当物体沿曲线运动，速度方向时刻变化。掌握周期、频率、线速度、角速度四大核心量及向心力公式。 || When objects move along curves, velocity direction constantly changes. Master period, frequency, linear velocity, angular velocity, and centripetal force."
hero_actions:
  - "开始学习 || Start Learning | #life"
  - "直接练习 || Go to Practice | #practice"
panel_label: "本章目标 || Chapter Goals"
panel_title: "从匀速圆周到变速圆周 || From Uniform to Non-Uniform Circular Motion"
panel:
  - "掌握 T、f、v、ω 四量关系 || Master T, f, v, ω relationships"
  - "理解 v = ωr 的推导 || Understand v = ωr derivation"
  - "掌握向心力与向心加速度公式 || Master centripetal force and acceleration formulas"
  - "辨析向心力的来源与离心力误区 || Identify centripetal force sources and centrifugal misconception"
metrics:
  - "核心量 || Core Quantities | 4 | T / f / v / ω"
  - "关键公式 || Key Formula | F=mv²/r | 向心力公式 || Centripetal force"
  - "交互实验 || Interactive Lab | 1 | 圆周运动模拟器 || Circular Motion Sim"
  - "难度 || Difficulty | ★★★☆☆ | 需牛顿定律基础 || Requires Newton's Laws"
style:
  accent: "#0284c7"
---

## #life 01 / Circular Motion in Life :: 旋转无处不在 || Rotation Is Everywhere

从游乐场到太空，圆周运动是自然界最基本的运动形式之一。 || From playgrounds to outer space, circular motion is one of nature's most fundamental motion patterns.

:::insight-grid { cols: 2 }
::card 🎠
### 旋转木马 || Carousel
外圈马匹线速度大于内圈，但角速度相同。外圈离心感更强——这正是因为 v = ωr，r 越大 v 越大。 || Outer horses have higher linear velocity but same angular velocity. Greater centrifugal feeling because v = ωr.

::card 🚗
### 汽车过弯 || Car Turning
轮胎与地面的静摩擦力提供向心力。弯道半径越小、车速越快，所需向心力越大，超过最大静摩擦力就会侧滑。 || Static friction provides centripetal force. Smaller radius or higher speed demands more force — exceeding max friction causes skidding.

::card 🌍
### 地球公转 || Earth Orbit
地球绕太阳做近似匀速圆周运动，万有引力提供向心力。轨道半径约 1.5×10⁸ km，周期约 365.25 天。 || Earth orbits the Sun in near-uniform circular motion. Gravity provides centripetal force. R ≈ 1.5×10⁸ km, T ≈ 365.25 days.

::card 🌀
### 洗衣机甩干 || Washing Machine Spin
高速旋转时，衣物随桶壁做圆周运动。水滴因惯性沿切线方向飞出小孔——这不是「离心力甩出」，而是缺少向心力的结果。 || Water drops fly out tangentially due to inertia — not centrifugal force, but lack of centripetal force.
:::

:::sandbox { id: "sim-circular", title: "交互实验沙盒 || Interactive Simulation Sandbox" }
交互可调参数：半径 r || Radius r、角速度 ω || Angular velocity ω。
:::

## #quantities 02 / Four Core Quantities :: T、f、v、ω 的关系网 || The T, f, v, ω Relationship Web

匀速圆周运动由四个互相关联的物理量完整描述。 || Uniform circular motion is fully described by four interrelated quantities.

:::accordion
::panel { open: true }
### 周期 T 与频率 f || Period T and Frequency f
$$
T = \frac{1}{f} \qquad f = \frac{1}{T}
$$

周期 T：完成一圈所需时间，单位 s。频率 f：单位时间内完成的圈数，单位 Hz。两者互为倒数。 || Period T: time for one revolution (s). Frequency f: revolutions per unit time (Hz). They are reciprocals.

> **💡 转速 n || 💡 Rotational Speed n**
> 工程中常用转速 n（单位 r/min 或 rpm）。换算：f = n/60。例如洗衣机 1200 rpm 即 f = 20 Hz、T = 0.05 s。 || Engineering uses rpm. Conversion: f = n/60. E.g., 1200 rpm = 20 Hz, T = 0.05 s.

::panel
### 线速度 v 与角速度 ω || Linear Velocity v and Angular Velocity ω
$$
v = \frac{2\pi r}{T} = 2\pi r f
$$

$$
\omega = \frac{2\pi}{T} = 2\pi f
$$

线速度 v：质点在圆周上的瞬时速率，方向沿切线。角速度 ω：单位时间转过的角度（rad/s），描述转动快慢与半径无关。 || Linear velocity v: instantaneous speed along tangent. Angular velocity ω: angle swept per unit time (rad/s), independent of radius.

> **📐 推导 v = ωr || 📐 Derivation: v = ωr**
> 一圈弧长 = 2πr，所用时间 = T。 || Arc length per revolution = 2πr, time = T.
> $$
> v = \frac{2\pi r}{T} = \frac{2\pi}{T} \cdot r = \omega r
> $$
> 同一转盘上，ω 相同，r 越大的点 v 越大——旋转木马外圈更快的原因。 || On the same turntable, ω is the same. Larger r means larger v — why outer carousel horses are faster.

::panel
### 四量关系对照表 || Quantity Relationship Table
| 物理量 || Quantity | 符号 || Symbol | 单位 || Unit | 关键公式 || Key Formula | 物理意义 || Physical Meaning |
| --- | --- | --- | --- | --- |
| 周期 || Period | T | s | T = 1/f = 2π/ω | 转一圈的时间 || Time per revolution |
| 频率 || Frequency | f | Hz | f = 1/T = ω/(2π) | 每秒转几圈 || Revolutions per second |
| 线速度 || Linear velocity | v | m/s | v = 2πr/T = ωr | 切线方向速率 || Speed along tangent |
| 角速度 || Angular velocity | ω | rad/s | ω = 2π/T = v/r | 单位时间转角 || Angle per unit time |

> **💡 传动关系速记 || 💡 Transmission Quick Rules**
> 同轴转动：ω 相同，v ∝ r。皮带/齿轮传动：v 相同，ω ∝ 1/r。这两条是分析齿轮组、皮带轮的关键。 || Same axis: ω identical, v ∝ r. Belt/gear drive: v identical, ω ∝ 1/r. Key to analyzing gear trains.
:::

## #centripetal-force 03 / Centripetal Force :: 指向圆心的合力 || The Net Force Toward the Center

向心力不是一种新力，而是使物体做圆周运动所需的合力的径向分量。 || Centripetal force is not a new force — it's the radial component of the net force needed for circular motion.

:::accordion
::panel { open: true }
### 向心力公式 || Centripetal Force Formula
$$
F_c = m\frac{v^2}{r} = m\omega^2 r = m\frac{4\pi^2}{T^2}r
$$

> **📐 为什么公式中有 v² || 📐 Why v² Appears in the Formula**
> 由 v = ωr 代入 F = mω²r 得 F = m(v/r)²r = mv²/r。两种形式等价，选哪个取决于已知量。速度增倍，所需向心力变为 4 倍——这就是高速过弯极其危险的原因。 || Substitute v = ωr into F = mω²r to get F = mv²/r. Double the speed quadruples the required force — that's why high-speed turns are dangerous.

::panel
### 谁提供向心力？ || What Provides Centripetal Force?
- **🔗 绳的拉力 || 🔗 Tension** — 水平面上用绳甩球：绳的拉力指向圆心，全部充当向心力。竖直面甩球时拉力和重力的合力提供向心力。 || Swinging a ball on a string: tension points toward center. In vertical circle, tension + gravity combine.
- **🛤 摩擦力 || 🛤 Friction** — 汽车在平坦弯道上转弯：静摩擦力指向圆心提供向心力。路面湿滑时最大静摩擦力减小，安全车速降低。 || Car on flat curve: static friction points toward center. Wet roads reduce max friction, lowering safe speed.
- **🌍 万有引力 || 🌍 Gravity** — 天体运动中万有引力提供向心力。卫星绕地球、行星绕太阳，引力恰好等于所需向心力。 || In orbital motion, gravitational force provides centripetal force. Gravity equals the required centripetal force.
- **⚡ 电磁力 || ⚡ EM Force** — 带电粒子在匀强磁场中做匀速圆周运动，洛伦兹力提供向心力：qvB = mv²/r。 || Charged particle in uniform magnetic field: Lorentz force provides centripetal force, qvB = mv²/r.

::panel
### 离心力是误解 || Centrifugal Force Misconception
> **⚠ 离心力不是真实力 || ⚠ Centrifugal Force Is Not Real**
> 在惯性参考系中不存在离心力。你在转弯汽车里感到被「甩向外侧」，实际上是你的身体因惯性想保持直线运动，而车在向内转弯。是你缺少足够的向心力，而非有力把你推向外面。 || Centrifugal force does not exist in inertial frames. You feel pushed outward in a turning car because your body tends to continue straight (inertia), while the car turns inward. You lack sufficient centripetal force — nothing pushes you outward.

只有在旋转参考系（非惯性系）中分析问题时，才需要引入离心力作为「惯性力」——但中学阶段一律在惯性系中分析。 || Centrifugal force is introduced as a fictitious force only in rotating (non-inertial) frames. In high school physics, always analyze in inertial frames.
:::

## #centripetal-accel 04 / Centripetal Acceleration :: 匀速 ≠ 零加速度 || Constant Speed ≠ Zero Acceleration

速度是矢量，方向变化就意味着有加速度。 || Velocity is a vector — direction change means acceleration exists.

:::accordion
::panel { open: true }
### 为什么匀速圆周有加速度 || Why Uniform Circular Motion Has Acceleration
「匀速圆周运动」的匀速指速率不变，不是速度不变。速度方向每时每刻都在变化（沿切线），所以存在加速度。这个加速度的方向始终指向圆心，称为向心加速度。 || Uniform means constant speed, not constant velocity. Velocity direction changes every instant (along tangent), so acceleration exists. This acceleration always points toward the center.

$$
a_c = \frac{v^2}{r} = \omega^2 r = \frac{4\pi^2}{T^2}r
$$

::panel
### 公式关系网络 || Formula Relationship Network
| 表达式 || Expression | 适用场景 || Best Use Case | r 变化时 || When r Changes |
| --- | --- | --- |
| $a = v^2/r$ | 已知 v 和 r || Known v and r | v 定，r ↑ → a ↓ || v fixed, r↑ → a↓ |
| $a = \omega^2 r$ | 已知 ω 和 r（同轴转动） || Known ω and r (same axis) | ω 定，r ↑ → a ↑ || ω fixed, r↑ → a↑ |
| $a = v\omega$ | v 和 ω 均已知 || Both v and ω known | — |
| $a = 4\pi^2 r / T^2$ | 已知 T 和 r（天体运动） || Known T and r (orbital motion) | T 定，r ↑ → a ↑ || T fixed, r↑ → a↑ |

> **💡 选公式的诀窍 || 💡 Choosing the Right Formula**
> 做题时确定哪个量相同（同轴 → ω 同，皮带 → v 同，同周期 → T 同），再选含该量的公式。变量关系随选择的不变量完全不同。 || Identify which quantity is constant (same axis → ω, belt → v, same period → T), then pick the formula containing it.
:::

## #practice 05 / Enhanced Practice :: 从基础到挑战 || From Basics to Challenge

3 道基础 + 3 道进阶 + 2 道挑战，巩固圆周运动核心概念。 || 3 basic + 3 advanced + 2 challenge problems to solidify core concepts.

:::accordion
::panel { open: true }
### 基础题（3 道） || Basic (3)
> **Q1**
> 自行车车轮半径 0.35 m，骑行速度 7 m/s。求车轮转动的角速度和周期。 || Bicycle wheel radius 0.35 m, riding speed 7 m/s. Find ω and T.

**📖 Q1 答案 || 📖 Q1 Answer**

$$
\omega = \frac{v}{r} = \frac{7}{0.35} = 20 \text{ rad/s}
$$

$$
T = \frac{2\pi}{\omega} = \frac{2\pi}{20} \approx 0.31 \text{ s}
$$

> **Q2**
> 电风扇叶片转速 900 rpm。求频率 f 和角速度 ω。 || Fan blade at 900 rpm. Find f and ω.

**📖 Q2 答案 || 📖 Q2 Answer**

$$
f = \frac{900}{60} = 15 \text{ Hz}
$$

$$
\omega = 2\pi f = 2\pi \times 15 = 30\pi \approx 94.2 \text{ rad/s}
$$

> **Q3**
> 质量 2 kg 的物体在半径 0.5 m 的水平面上做匀速圆周运动，线速度 4 m/s。求向心力大小。 || 2 kg object in uniform circular motion, r = 0.5 m, v = 4 m/s. Find centripetal force.

**📖 Q3 答案 || 📖 Q3 Answer**

$$
F = \frac{mv^2}{r} = \frac{2 \times 16}{0.5} = 64 \text{ N}
$$

::panel
### 进阶题（3 道） || Advanced (3)
> **Q4**
> 同一转盘上 A 点距圆心 0.2 m，B 点距圆心 0.5 m。转盘匀速转动。求 vᴀ/vᴄ 和 aᴀ/aᴄ。 || Turntable: A at r=0.2 m, B at r=0.5 m, same ω. Find vᴀ/vᴄ and aᴀ/aᴄ.

**📖 Q4 答案 || 📖 Q4 Answer**

同轴 → ω 相同。v = ωr → vᴀ/vᴄ = rᴀ/rᴄ = 0.2/0.5 = 2/5。a = ω²r → aᴀ/aᴄ = 2/5。 || Same axis → same ω. v = ωr → ratio = 2/5. a = ω²r → ratio = 2/5.

> **Q5**
> 国际空间站在距地面约 400 km 的轨道上运行，周期约 92 min。地球半径 6371 km。求空间站的线速度和向心加速度。 || ISS orbits at ~400 km altitude, T ≈ 92 min. Earth radius 6371 km. Find v and a.

**📖 Q5 答案 || 📖 Q5 Answer**

r = 6371 + 400 = 6771 km = 6.771×10⁶ m，T = 92×60 = 5520 s。 || r = 6771 km = 6.771×10⁶ m, T = 5520 s.

$$
v = \frac{2\pi r}{T} = \frac{2\pi \times 6.771 \times 10^6}{5520} \approx 7700 \text{ m/s}
$$

$$
a = \frac{v^2}{r} = \frac{7700^2}{6.771 \times 10^6} \approx 8.76 \text{ m/s}^2
$$

> **Q6**
> 汽车在半径 50 m 的水平弯道上行驶，路面与轮胎间最大静摩擦系数 μ = 0.4。求不打滑的最大车速。（g=10 m/s²） || Car on flat curve, r=50 m, μ=0.4. Find max speed without skidding. (g=10)

**📖 Q6 答案 || 📖 Q6 Answer**

最大静摩擦力提供向心力：μmg = mv²/r，m 消去。 || Max friction provides centripetal force: μmg = mv²/r, m cancels.

$$
v_{max} = \sqrt{\mu g r} = \sqrt{0.4 \times 10 \times 50} = \sqrt{200} \approx 14.1 \text{ m/s}
$$

约 14.1 m/s ≈ 50.8 km/h。超过此速度静摩擦力不足，汽车将向外侧滑。 || ≈ 14.1 m/s ≈ 50.8 km/h. Beyond this speed, friction is insufficient and the car skids outward.

::panel
### 挑战题（2 道） || Challenge (2)
> **Q7**
> 两个皮带轮 A（r=0.1 m）和 B（r=0.3 m）通过皮带传动（不打滑）。A 轮转速 600 rpm。求 B 轮的角速度和边缘线速度。 || Pulley A (r=0.1 m) and B (r=0.3 m) connected by belt (no slipping). A at 600 rpm. Find B's ω and v.

**📖 Q7 答案 || 📖 Q7 Answer**

皮带 → 边缘线速度相同：vᴀ = vᴄ。 || Belt → same linear velocity at edge: vᴀ = vᴄ.

$$
\omega_A = 2\pi \times \frac{600}{60} = 20\pi \text{ rad/s}
$$

$$
v = \omega_A r_A = 20\pi \times 0.1 = 2\pi \text{ m/s} \approx 6.28 \text{ m/s}
$$

$$
\omega_B = \frac{v}{r_B} = \frac{2\pi}{0.3} = \frac{20\pi}{3} \approx 20.9 \text{ rad/s}
$$

B 轮 ω 是 A 轮的 1/3，线速度相同。大轮转得慢是皮带传动的基本规律。 || B's ω is 1/3 of A's. Same v. Larger wheel spins slower — fundamental belt drive rule.

> **Q8**
> 长度 L=1 m 的绳系一个质量 m=0.5 kg 的小球，在竖直平面内做圆周运动。若最高点速度恰好满足临界条件（绳刚好不松弛），求该速度和最高点绳的拉力。（g=10 m/s²） || String L=1 m, ball m=0.5 kg in vertical circle. At top, string barely taut (critical speed). Find v and tension. (g=10)

**📖 Q8 答案 || 📖 Q8 Answer**

最高点临界条件：绳拉力 T = 0，重力全部提供向心力。 || Critical condition at top: T = 0, gravity alone provides centripetal force.

$$
mg = \frac{mv^2}{r} \Rightarrow v = \sqrt{gr} = \sqrt{10 \times 1} = \sqrt{10} \approx 3.16 \text{ m/s}
$$

拉力 T = 0 N。此为最高点最小速度，低于此值绳松弛，球脱离圆周轨道。 || Tension T = 0 N. This is the minimum speed at the top. Below this, the string goes slack.
:::

## #roadmap 06 / Learning Roadmap :: 力学系列导航 || Mechanics Series Navigation

这是力学系列第 5 篇。你已掌握匀速圆周运动的核心公式与向心力分析。 || Part 5 of Mechanics. You've mastered uniform circular motion formulas and centripetal force analysis.

- [第 1 篇 || Part 1：运动的描述 || Describing Motion](../describing-motion/)
- [第 2 篇 || Part 2：匀变速直线运动 || Uniform Acceleration](../uniform-acceleration/)
- [第 3 篇 || Part 3：力与平衡 || Forces & Equilibrium](../forces-equilibrium/)
- [第 4 篇 || Part 4：牛顿运动定律 || Newton's Laws](../newtons-laws/)
- **第 5 篇 · 当前 || Part 5 · Current：圆周运动 || Circular Motion**
- [第 6 篇 || Part 6：万有引力与航天 || Gravitation](../gravitation/)
- [第 7 篇 || Part 7：功与能 || Work & Energy](../work-energy/)
- [第 8 篇 || Part 8：动量 || Momentum](../momentum/)

:::callout { title: "下一篇预告 || Next Article Preview" }
第 6 篇将聚焦**万有引力与航天**——从开普勒三定律到人造卫星的轨道速度，理解引力如何提供向心力并决定天体运动规律。 || Part 6: **Gravitation** — from Kepler's three laws to satellite orbital velocity. Understand how gravity provides centripetal force and governs celestial motion.
:::
