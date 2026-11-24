---
title: "万有引力与航天：从苹果到卫星 || Gravitation: From Apples to Satellites"
eyebrow: "力学 · 第 6 篇 / 共 8 篇 || Mechanics · Part 6 of 8"
brand: "力学 || Mechanics"
date: 2026-04-17
strict_i18n: false
strict_density: true
lead: "牛顿将苹果落地与月球绕地统一为同一规律。掌握万有引力定律、天体运动公式与三大宇宙速度。 || Newton unified the falling apple and the orbiting Moon. Master the law of gravitation, orbital formulas, and cosmic velocities."
hero_actions:
  - "开始学习 || Start Learning | #gravity-law"
  - "直接练习 || Go to Practice | #practice"
panel_label: "本章目标 || Chapter Goals"
panel_title: "从万有引力到航天应用 || From Universal Gravitation to Space Applications"
panel:
  - "掌握万有引力定律 F=GMm/r² || Master law of gravitation F=GMm/r²"
  - "推导重力加速度 g=GM/R² || Derive g=GM/R²"
  - "理解天体运动中 v、ω、T 与 r 的关系 || Understand v, ω, T vs r in orbital motion"
  - "掌握三大宇宙速度与同步卫星 || Master three cosmic velocities and geostationary satellites"
metrics:
  - "核心公式 || Core Formula | F=GMm/r² | 万有引力定律 || Law of Gravitation"
  - "宇宙速度 || Cosmic Velocities | 3 | 7.9 / 11.2 / 16.7 km/s"
  - "交互实验 || Interactive Lab | 1 | 轨道模拟器 || Orbit Simulator"
  - "难度 || Difficulty | ★★★★☆ | 需圆周运动基础 || Requires circular motion"
style:
  accent: "#0284c7"
---

## #gravity-law 01 / Law of Universal Gravitation :: 从苹果到宇宙 || From Apple to Universe

任何两个有质量的物体之间都存在引力，大小与质量乘积成正比、距离平方成反比。 || Any two massive objects attract each other with a force proportional to the product of masses and inversely proportional to the square of distance.

$$
F = G \frac{Mm}{r^2}
$$

其中 G = 6.674×10⁻¹¹ N·m²/kg² 为万有引力常量，由卡文迪什在 1798 年通过扭秤实验测定。 || G = 6.674×10⁻¹¹ N·m²/kg² is the gravitational constant, measured by Cavendish in 1798 using a torsion balance.

:::accordion
::panel { open: true }
### 推导地表重力加速度 g || Deriving Surface Gravitational Acceleration g
> **📐 推导 g = GM/R² || 📐 Derivation: g = GM/R²**
> 地表物体所受引力近似等于重力（忽略地球自转）： || At the surface, gravitational force approximately equals weight (ignoring Earth's rotation):
> $$
> G \frac{Mm}{R^2} = mg
> $$
> 消去 m，得到： || Cancel m:
> $$
> g = \frac{GM}{R^2}
> $$
> 此式表明：g 只取决于天体的质量 M 和半径 R，与物体质量无关。地球 g ≈ 9.8 m/s²，月球 g ≈ 1.6 m/s²。 || This shows g depends only on the celestial body's M and R, not on the object's mass. Earth g ≈ 9.8, Moon g ≈ 1.6 m/s².

::panel
### 卡文迪什扭秤实验 || Cavendish Torsion Balance Experiment
- **实验装置 || Apparatus** — 一根轻杆两端各固定一个小铅球，中间系细丝悬挂。两个大铅球置于小球附近，引力使轻杆偏转。 || Light rod with small lead balls at ends, suspended by thin wire. Large balls placed nearby cause a measurable twist.
- **测量原理 || Measurement Principle** — 通过光点反射放大偏转角，结合已知的扭丝扭转常数，计算出极小的引力值，进而求得 G。 || Mirror reflects light beam to amplify tiny deflection. Combined with known torsion constant, G is calculated.
- **历史意义 || Historical Significance** — 测出 G 后，结合 g=GM/R² 即可算出地球质量。卡文迪什因此被称为「称量地球的人」。 || With G known, Earth's mass can be calculated from g=GM/R². Cavendish was called 'the man who weighed the Earth'.
:::

## #orbits 02 / Orbital Motion :: 引力提供向心力 || Gravity Provides Centripetal Force

天体做近似匀速圆周运动，万有引力充当向心力。由此推导轨道速度、角速度、周期与轨道半径的关系。 || Celestial bodies approximate uniform circular motion with gravity as centripetal force. Derive v, ω, T as functions of orbital radius.

:::callout { title: "📐 推导轨道速度 || 📐 Deriving Orbital Velocity" }
万有引力 = 向心力： || Gravitational force = centripetal force: $G\frac{Mm}{r^2} = \frac{mv^2}{r}$ 消去 m，解出 v： || Cancel m, solve for v: $v = \sqrt{\frac{GM}{r}}$ 轨道半径 r 越大，速度 v 越小。这就是「高轨慢速」的原因。 || Larger orbital radius r means smaller velocity v. This is why 'higher orbit = slower speed'.
:::

:::accordion
::panel { open: true }
### v、ω、T 与 r 的关系 || v, ω, T vs r Relationships
| 物理量 || Quantity | 公式 || Formula | 与 r 的关系 || Relation to r |
| --- | --- | --- |
| 线速度 v || Linear velocity v | $v = \sqrt{GM/r}$ | r↑ → v↓ |
| 角速度 ω || Angular velocity ω | $\omega = \sqrt{GM/r^3}$ | r↑ → ω↓ |
| 周期 T || Period T | $T = 2\pi\sqrt{r^3/(GM)}$ | r↑ → T↑ |
| 向心加速度 a || Centripetal accel a | $a = GM/r^2$ | r↑ → a↓ |

> **💡 高轨慢速长周期 || 💡 Higher Orbit = Slower & Longer Period**
> 只有周期 T 随 r 增大而增大，v、ω、a 都随 r 增大而减小。这是天体运动最核心的规律，务必牢记。 || Only T increases with r. v, ω, and a all decrease. This is the most crucial pattern in orbital mechanics.

::panel
### 轨道模拟器 || Orbit Simulator
拖动滑块调整轨道半径，观察线速度、角速度和周期如何变化。 || Adjust the orbit radius slider and observe how v, ω, and T change.

> **🧪 交互实验沙盒 || Interactive Simulation Sandbox** (`#sim-orbit`) — 交互可调参数：轨道半径 r || Orbit radius r。
:::

## #cosmic-speed 03 / Cosmic Velocities :: 从近地轨道到星际旅行 || From Low Orbit to Interstellar Travel

三大宇宙速度分别对应绕地、脱地、脱日的最小发射速度。 || Three cosmic velocities correspond to orbiting Earth, escaping Earth, and escaping the Solar System.

:::insight-grid { cols: 3 }
::card 🚀
### 第一宇宙速度 v₁ || First Cosmic Velocity v₁
v₁ = 7.9 km/s。最小环绕速度，也是近地轨道的最大环绕速度。卫星发射至少需要此速度。 || v₁ = 7.9 km/s. Minimum orbiting speed and maximum speed in low orbit. Minimum launch velocity for satellites.

::card 🌌
### 第二宇宙速度 v₂ || Second Cosmic Velocity v₂
v₂ = 11.2 km/s。脱离地球引力束缚的最小速度。达到此速度的航天器将沿抛物线轨道飞离地球。 || v₂ = 11.2 km/s. Minimum escape velocity from Earth. Spacecraft follows a parabolic trajectory away from Earth.

::card ⭐
### 第三宇宙速度 v₃ || Third Cosmic Velocity v₃
v₃ = 16.7 km/s。脱离太阳系引力束缚的最小速度。旅行者 1 号已达到此速度，正飞向星际空间。 || v₃ = 16.7 km/s. Minimum velocity to escape the Solar System. Voyager 1 has achieved this speed.
:::

:::accordion
::panel { open: true }
### 推导第一宇宙速度 || Deriving First Cosmic Velocity
> **📐 v₁ 的两种推导 || 📐 Two Derivations of v₁**
> 方法一：引力=向心力，r=R（近地轨道） || Method 1: gravity = centripetal force, r = R (low orbit)
> $$
> v_1 = \sqrt{\frac{GM}{R}} = \sqrt{gR} \approx 7.9 \text{ km/s}
> $$
> 方法二：利用 g=GM/R²，代入得 v₁=√(gR)=√(9.8×6.371×10⁶) ≈ 7.9 km/s。 || Method 2: Using g=GM/R², v₁=√(gR)=√(9.8×6.371×10⁶) ≈ 7.9 km/s.

::panel
### 同步卫星的特殊性 || Geostationary Satellite Properties
1

**固定周期 || Fixed Period**

T = 24 h = 86400 s，与地球自转同步。 || T = 24 h = 86400 s, synchronized with Earth's rotation.

2

**固定轨道半径 || Fixed Orbital Radius**

由 T² ∝ r³ 确定唯一半径 r ≈ 42400 km，距地面约 36000 km。 || T² ∝ r³ determines unique r ≈ 42400 km, altitude ≈ 36000 km.

3

**固定轨道平面 || Fixed Orbital Plane**

必须在赤道平面内，否则无法「同步」——卫星将在南北方向往返摆动。 || Must be in the equatorial plane. Otherwise, the satellite oscillates north-south and cannot stay 'stationary'.

> **💡 记忆口诀 || 💡 Memory Aid**
> 同步卫星：「定周期、定高度、定平面」三定。v₁ 既是近地轨道的环绕速度，也是卫星发射的最小速度。轨道越高，环绕速度越低，但发射速度越高（需额外能量爬升）。 || Geostationary: fixed T, fixed altitude, fixed plane. v₁ is both the low-orbit speed and minimum launch speed. Higher orbit = slower orbital speed but higher launch speed.
:::

## #practice 04 / Enhanced Practice :: 从基础到挑战 || From Basics to Challenge

3 道基础 + 3 道进阶，巩固万有引力与航天核心概念。 || 3 basic + 3 advanced problems to solidify gravitation and spaceflight concepts.

:::accordion
::panel { open: true }
### 基础题（3 道） || Basic (3)
> **Q1**
> 地球质量 M=5.97×10²⁴ kg，半径 R=6.37×10⁶ m。用万有引力公式验算地表重力加速度 g。 || Earth M=5.97×10²⁴ kg, R=6.37×10⁶ m. Verify g using the gravitation formula.

**📖 Q1 答案 || 📖 Q1 Answer**

$$
g = \frac{GM}{R^2} = \frac{6.674 \times 10^{-11} \times 5.97 \times 10^{24}}{(6.37 \times 10^6)^2} \approx 9.82 \text{ m/s}^2
$$

与标准值 9.8 m/s² 一致。微小差异因地球非完美球体及自转。 || Consistent with standard 9.8 m/s². Minor difference due to Earth's non-spherical shape and rotation.

> **Q2**
> 某行星半径是地球的 2 倍，质量是地球的 8 倍。求该行星表面重力加速度与地球的比值。 || A planet has 2x Earth's radius and 8x Earth's mass. Find the ratio of surface g to Earth's g.

**📖 Q2 答案 || 📖 Q2 Answer**

$$
\frac{g'}{g} = \frac{M'/R'^2}{M/R^2} = \frac{8M/(2R)^2}{M/R^2} = \frac{8}{4} = 2
$$

该行星表面 g 是地球的 2 倍。 || Surface g is twice Earth's.

> **Q3**
> 用 v₁=√(gR) 计算第一宇宙速度。取 g=9.8 m/s²，R=6.37×10⁶ m。 || Calculate v₁ = √(gR). Use g=9.8, R=6.37×10⁶ m.

**📖 Q3 答案 || 📖 Q3 Answer**

$$
v_1 = \sqrt{gR} = \sqrt{9.8 \times 6.37 \times 10^6} = \sqrt{6.24 \times 10^7} \approx 7900 \text{ m/s} = 7.9 \text{ km/s}
$$

::panel
### 进阶题（3 道） || Advanced (3)
> **Q4**
> 已知地球质量 M，半径 R，自转周期 T₀。推导同步卫星的轨道半径表达式。 || Given Earth mass M, radius R, rotation period T₀. Derive the expression for geostationary orbit radius.

**📖 Q4 答案 || 📖 Q4 Answer**

引力=向心力： || Gravity = centripetal force:

$$
G\frac{Mm}{r^2} = m\frac{4\pi^2}{T_0^2}r
$$

$$
r = \left(\frac{GMT_0^2}{4\pi^2}\right)^{1/3}
$$

代入数值：r ≈ 4.24×10⁷ m ≈ 42400 km，距地面约 36000 km。 || Substituting values: r ≈ 42400 km, altitude ≈ 36000 km.

> **Q5**
> 卫星 A 的轨道半径是卫星 B 的 4 倍。求它们周期之比 Tᴀ/Tᴃ 和速度之比 vᴀ/vᴃ。 || Satellite A's orbital radius is 4 times B's. Find Tᴀ/Tᴃ and vᴀ/vᴃ.

**📖 Q5 答案 || 📖 Q5 Answer**

由 T² ∝ r³： || From T² ∝ r³:

$$
\frac{T_A}{T_B} = \left(\frac{r_A}{r_B}\right)^{3/2} = 4^{3/2} = 8
$$

$$
\frac{v_A}{v_B} = \sqrt{\frac{r_B}{r_A}} = \sqrt{\frac{1}{4}} = \frac{1}{2}
$$

A 周期是 B 的 8 倍，速度是 B 的 1/2。完美体现「高轨慢速长周期」。 || A's period is 8x B's, speed is 1/2 of B's. Perfect illustration of 'higher orbit = slower, longer period'.

> **Q6**
> 某星球表面发射卫星，测得近地轨道周期为 T。已知引力常量 G。求该星球的平均密度。 || A planet's low-orbit satellite has period T. Given G, find the planet's average density.

**📖 Q6 答案 || 📖 Q6 Answer**

近地轨道 r ≈ R。引力=向心力： || Low orbit: r ≈ R. Gravity = centripetal:

$$
G\frac{Mm}{R^2} = m\frac{4\pi^2}{T^2}R
$$

$$
M = \frac{4\pi^2 R^3}{GT^2}
$$

密度 ρ = M/V = M/(4πR³/3)： || Density ρ = M/V = M/(4πR³/3):

$$
\rho = \frac{3\pi}{GT^2}
$$

密度只取决于近地周期 T！与星球质量、半径无关。 || Density depends only on T! Independent of mass and radius.
:::

## #roadmap 05 / Learning Roadmap :: 力学系列导航 || Mechanics Series Navigation

这是力学系列第 6 篇。你已掌握万有引力定律与天体运动规律。 || Part 6 of Mechanics. You've mastered the law of gravitation and orbital motion.

- [第 1 篇 || Part 1：运动的描述 || Describing Motion](../describing-motion/)
- [第 2 篇 || Part 2：匀变速直线运动 || Uniform Acceleration](../uniform-acceleration/)
- [第 3 篇 || Part 3：力与平衡 || Forces & Equilibrium](../forces-equilibrium/)
- [第 4 篇 || Part 4：牛顿运动定律 || Newton's Laws](../newtons-laws/)
- [第 5 篇 || Part 5：圆周运动 || Circular Motion](../circular-motion/)
- **第 6 篇 · 当前 || Part 6 · Current：万有引力与航天 || Gravitation**
- [第 7 篇 || Part 7：功与能 || Work & Energy](../work-energy/)
- [第 8 篇 || Part 8：动量 || Momentum](../momentum/)

:::callout { title: "下一篇预告 || Next Article Preview" }
第 7 篇将聚焦**功与能**——从功的定义到动能定理再到机械能守恒，用能量视角重新理解运动。 || Part 7: **Work & Energy** — from work definition to kinetic energy theorem to conservation of mechanical energy.
:::

## #law 01 / The Law That Unified Heaven and Earth :: 万有引力定律 || The Law of Universal Gravitation

:::accordion
::panel { open: true }
### 任何两个有质量的物体都互相吸引 || Any Two Masses Attract Each Other
$$
F = GMm / r²
$$

G

**引力常量 || Gravitational Constant**

G = 6.67 × 10⁻¹¹ N·m²/kg²。这个极小的数值说明引力非常微弱——只有当至少一个物体质量巨大（如地球）时，引力才显著。卡文迪什用扭秤实验首次精确测定了 G。 || G = 6.67 × 10⁻¹¹ N·m²/kg². This tiny value means gravity is very weak — only significant when at least one mass is huge (like Earth). Cavendish first measured G with a torsion balance.

r

**距离是质心间距 || Distance Between Centers**

r 是两个物体质心之间的距离，不是表面间距。地面上的人到地心的距离 r = 地球半径 R ≈ 6371 km。 || r is the distance between centers of mass, not surface distance. For a person on the ground, r = Earth's radius R ≈ 6371 km.

> **重力加速度的由来 || Origin of g**
> 地面上 mg = GMm/R² → g = GM/R²。代入地球数据：g = 6.67×10⁻¹¹ × 5.97×10²⁴ / (6.371×10⁶)² ≈ 9.8 m/s²。g 其实是万有引力的直接结果！ || On the surface: mg = GMm/R² → g = GM/R². Substituting Earth data: g ≈ 9.8 m/s². The value of g is a direct result of universal gravitation!
:::

## #orbits 02 / Celestial Motion :: 卫星绕行的秘密 || The Secret of Satellite Orbits

:::accordion
::panel { open: true }
### 引力提供向心力 || Gravity Provides Centripetal Force
卫星绕地球做近似匀速圆周运动时，万有引力恰好充当向心力： || When a satellite orbits Earth in approximately uniform circular motion, gravity provides the centripetal force:

$$
GMm/r² = mv²/r = mω²r = m(2π/T)²r
$$

| 物理量 || Quantity | 随轨道半径 r 的变化 || Variation with r | 推导 || Derivation |
| --- | --- | --- |
| 线速度 v || Linear speed v | r 越大，v 越小 || Larger r → smaller v | v = √(GM/r) |
| 角速度 ω || Angular speed ω | r 越大，ω 越小 || Larger r → smaller ω | ω = √(GM/r³) |
| 周期 T || Period T | r 越大，T 越大 || Larger r → larger T | T = 2π√(r³/GM) |
| 加速度 a || Acceleration a | r 越大，a 越小 || Larger r → smaller a | a = GM/r² |

> **口诀 || Mnemonic**
> 「高轨慢速长周期」——轨道越高，线速度越小、角速度越小、周期越长、加速度越小。唯一增大的是轨道半径本身。 || 'Higher orbit = slower speed, longer period' — as orbit increases, v, ω, and a all decrease; only T increases. The sole increasing quantity is r itself.

::panel
### 同步卫星 || Geostationary Satellite
地球同步轨道卫星的周期 T = 24 h，轨道平面必须是赤道平面，轨道高度约 35,786 km（距地心 42,164 km）。所有同步卫星共享同一条轨道——同步轨道是唯一的。 || Geostationary satellites have T = 24 h, orbit in the equatorial plane, at ~35,786 km altitude. All geostationary satellites share the same orbit.
:::

## #velocities 03 / Flying to Space :: 三大宇宙速度 || Three Cosmic Velocities

:::accordion
::panel { open: true }
### 逃离地球需要多快？ || How Fast to Escape Earth?
v₁

**第一宇宙速度 7.9 km/s || 1st Cosmic Velocity: 7.9 km/s**

在地球表面绕行的最小速度。由 mg = mv²/R 得 v₁ = √(gR) ≈ 7.9 km/s。发射速度 ≥ v₁ 才能入轨；发射速度越大，轨道越高，但轨道上的运行速度反而越小。 || Minimum orbital speed at the surface. v₁ = √(gR) ≈ 7.9 km/s. Launch speed ≥ v₁ to enter orbit; higher launch speed → higher orbit but slower orbital speed.

v₂

**第二宇宙速度 11.2 km/s || 2nd Cosmic Velocity: 11.2 km/s**

脱离地球引力束缚的最小速度。v₂ = √2 × v₁ ≈ 11.2 km/s。达到此速度，物体将飞离地球，不再回来。 || Minimum speed to escape Earth's gravity. v₂ = √2 × v₁ ≈ 11.2 km/s. At this speed, the object leaves Earth permanently.

v₃

**第三宇宙速度 16.7 km/s || 3rd Cosmic Velocity: 16.7 km/s**

脱离太阳系引力束缚的最小速度。旅行者 1 号探测器正以超过此速度飞出太阳系。 || Minimum speed to escape the solar system. Voyager 1 is flying beyond the solar system at above this speed.
:::

## #practice 04 / Enhanced Practice :: 万有引力应用训练 || Gravitation Application Training

:::accordion
::panel { open: true }
### 基础题（3 道） || Basic (3)
> **Q1**
> 地球质量 M = 5.97×10²⁴ kg，半径 R = 6.37×10⁶ m。用万有引力公式计算地面处的 g。 || M = 5.97×10²⁴ kg, R = 6.37×10⁶ m. Calculate g at the surface using the gravitation formula.
> g = GM/R² = 6.67×10⁻¹¹ × 5.97×10²⁴ / (6.37×10⁶)² ≈
> 
> 9.81 m/s²
> 
> 。

> **Q2**
> 某卫星的轨道半径是地球半径的 2 倍（r = 2R）。它的线速度是第一宇宙速度的多少倍？ || A satellite orbits at r = 2R. What fraction of the first cosmic velocity is its orbital speed?
> v = √(GM/r) = √(GM/2R) = v₁/√2 ≈
> 
> 0.707 v₁ ≈ 5.6 km/s
> 
> 。

> **Q3**
> 月球绕地球的轨道半径约 3.84×10⁸ m，周期约 27.3 天。利用 T² = (4π²/GM)r³ 估算地球质量。 || Moon's orbit: r = 3.84×10⁸ m, T = 27.3 days. Estimate Earth's mass using T² = (4π²/GM)r³.
> T = 27.3 × 86400 ≈ 2.36×10⁶ s。M = 4π²r³/(GT²) = 4×9.87×(3.84×10⁸)³/(6.67×10⁻¹¹×5.57×10¹²) ≈
> 
> 6.0×10²⁴ kg
> 
> 。

::panel
### 进阶题（3 道） || Advanced (3)
> **Q4 — 同步卫星高度**
> 已知 g = 10 m/s²，R = 6400 km，T = 24 h。求同步卫星的轨道半径。 || Given g = 10 m/s², R = 6400 km, T = 24 h. Find geostationary orbit radius.
> r ≈ 4.23×10⁷ m，高度 h ≈
> 
> 35,900 km
> 
> 。

> **Q5 — 变轨问题**
> 卫星从低轨道变到高轨道需要在某点加速。加速后瞬间，速度变大但轨道半径还没变。此时引力 < 所需向心力还是 >？卫星会怎样运动？ || A satellite transfers from low to high orbit by firing rockets. Right after acceleration, speed increased but radius hasn't changed. Is gravity less than or greater than the required centripetal force?
> 加速后 v 增大但 r 不变，需要的向心力 mv²/r 增大，而引力 GMm/r² 不变。此时引力 < 所需向心力，卫星做离心运动，轨道半径增大。到达高轨道后速度反而比低轨道时小（高轨慢速）。 || After acceleration, required centripetal force (mv²/r) increases while gravity stays the same. Gravity < required force → satellite moves outward. Final high-orbit speed is actually slower.

> **Q6 — 星球表面重力加速度**
> 火星的质量约为地球的 0.107 倍，半径约为地球的 0.532 倍。估算火星表面的重力加速度。 || Mars has ~0.107 Earth's mass and ~0.532 Earth's radius. Estimate Mars surface gravity.
> g_火 = GM_火/R_火² = G(0.107M_地)/(0.532R_地)² = 0.107/0.283 × g_地 ≈ 0.378 × 9.8 ≈
> 
> 3.7 m/s²
> 
> 。
:::
