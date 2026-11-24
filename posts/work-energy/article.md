---
title: "功与能：动能定理与机械能守恒 || Work & Energy: Kinetic Energy Theorem & Conservation"
eyebrow: "力学 · 第 7 篇 / 共 8 篇 || Mechanics · Part 7 of 8"
brand: "力学 || Mechanics"
date: 2026-04-17
strict_i18n: false
strict_density: true
lead: "力学从力的视角转向能量视角。掌握功的计算、动能定理和机械能守恒定律。 || Mechanics shifts from force perspective to energy perspective. Master work calculation, kinetic energy theorem, and conservation of mechanical energy."
hero_actions:
  - "开始学习 || Start Learning | #work-def"
  - "直接练习 || Go to Practice | #practice"
panel_label: "本章目标 || Chapter Goals"
panel_title: "从做功到能量守恒 || From Work to Energy Conservation"
panel:
  - "掌握功的定义 W=Fs cosθ || Master W=Fs cosθ"
  - "理解动能定理 Wₙₑₜ = ΔEₖ || Understand kinetic energy theorem"
  - "掌握重力势能和弹性势能 || Master gravitational and elastic PE"
  - "应用机械能守恒定律解题 || Apply conservation of mechanical energy"
metrics:
  - "核心公式 || Core Formula | W=Fs cosθ | 功的定义 || Definition of Work"
  - "关键定理 || Key Theorem | W=ΔEk | 动能定理 || KE Theorem"
  - "交互实验 || Interactive Lab | 1 | 能量守恒过山车 || Energy Roller Coaster"
  - "难度 || Difficulty | ★★★★☆ | 需牛顿定律基础 || Requires Newton's Laws"
style:
  accent: "#0284c7"
---

## #work-def 01 / Definition of Work :: 力在位移方向上的效果 || Force Effect Along Displacement

功是力与位移的「有效合作」度量。只有力在位移方向上的分量才做功。 || Work measures the 'effective collaboration' between force and displacement. Only the force component along displacement does work.

$$
W = Fs\cos\theta
$$

:::accordion
::panel { open: true }
### cosθ 的三种情况 || Three Cases of cosθ
> **📐 理解 cosθ 的作用 || 📐 Understanding cosθ**
> θ 是力 F 与位移 s 之间的夹角。cosθ 决定力沿位移方向的有效分量。 || θ is the angle between F and s. cosθ determines the effective component of force along displacement.

- **正功 (0° ≤ θ < 90°) || Positive Work (0° ≤ θ < 90°)** — cosθ > 0，力促进运动。例：推箱子前进，推力做正功。 || cosθ > 0, force promotes motion. E.g., pushing a box forward.
- **负功 (90° < θ ≤ 180°) || Negative Work (90° < θ ≤ 180°)** — cosθ < 0，力阻碍运动。例：摩擦力做负功，动能减少。 || cosθ < 0, force resists motion. E.g., friction does negative work.
- **零功 (θ = 90°) || Zero Work (θ = 90°)** — cos 90° = 0，力与位移垂直。例：匀速圆周运动中向心力不做功。 || cos 90° = 0, force perpendicular to displacement. E.g., centripetal force does no work.

::panel
### 功的单位与计算要点 || Units and Calculation Tips
功的单位：焦耳（J）。1 J = 1 N · 1 m。功是标量，有正负但不是矢量。合力的功等于各力做功的代数和。 || Unit: joule (J). 1 J = 1 N·m. Work is a scalar with sign. Net work = algebraic sum of individual works.

> **💡 求合力的功的两条路 || 💡 Two Ways to Find Net Work**
> 方法一：先求各力分别做的功，再代数求和。方法二：先求合力 Fₙₑₜ，再算 W = Fₙₑₜ · s · cosθ。两种方法完全等价，按题目条件选择更简便的。 || Method 1: Sum individual works. Method 2: Find net force first, then W = F_net·s·cosθ. Choose the simpler approach.
:::

## #kinetic-energy 02 / Kinetic Energy Theorem :: 合力做功等于动能变化 || Net Work Equals Change in Kinetic Energy

动能定理将力学中的力与运动通过能量联系起来，是解题最强大的工具之一。 || The kinetic energy theorem connects force and motion through energy — one of the most powerful problem-solving tools.

$$
E_k = \frac{1}{2}mv^2
$$

:::accordion
::panel { open: true }
### 从 F=ma 推导动能定理 || Deriving KE Theorem from F=ma
> **📐 推导过程 || 📐 Derivation**
> 设合力 F 作用下物体做匀变速直线运动： || Object under net force F in uniformly accelerated motion:
> $$
> F = ma \quad \text{and} \quad v^2 = v_0^2 + 2as
> $$
> 由运动学公式解出 a = (v² - v₀²)/(2s)，代入 F=ma： || From kinematics: a = (v² - v₀²)/(2s), substitute into F=ma:
> $$
> Fs = \frac{1}{2}mv^2 - \frac{1}{2}mv_0^2
> $$
> 即 Wₙₑₜ = ΔEₖ。合力做的功等于动能的变化量。此结论对变力也成立（需积分证明）。 || W_net = ΔEk. Net work equals change in kinetic energy. This holds for variable forces too (proven by integration).

::panel
### 动能定理的优势 || Advantages of KE Theorem
1

**全程法 || Whole-Process Method**

不需要分段分析，直接用全程合力的功等于始末动能之差。特别适合变力问题。 || No need for segment analysis. Net work over entire process equals change in KE. Great for variable-force problems.

2

**标量运算 || Scalar Calculation**

功和动能都是标量，避免了矢量分解的复杂性。只需注意正功/负功的符号。 || Work and KE are scalars, avoiding vector decomposition. Just track positive/negative signs.

3

**只关心始末状态 || Initial-Final States Only**

不需要知道中间过程的细节，只需知道初速度、末速度和各力做的总功。 || No need for intermediate details. Only initial/final velocities and total work matter.
:::

## #conservation 03 / Potential Energy & Conservation :: 能量的转化与守恒 || Energy Transformation and Conservation

重力势能和弹性势能与动能之间可以相互转化。在特定条件下，机械能总量保持不变。 || Gravitational PE, elastic PE, and KE can transform into each other. Under specific conditions, total mechanical energy is conserved.

:::accordion
::panel { open: true }
### 重力势能 Ep = mgh || Gravitational PE: Ep = mgh
$$
E_p = mgh
$$

h 是相对参考面的高度。参考面的选取是任意的，但同一题目中必须统一。重力做正功 → 势能减少；重力做负功 → 势能增加。 || h is height relative to reference level (chosen arbitrarily but consistently). Gravity does positive work → PE decreases; negative work → PE increases.

> **📐 重力做功与势能变化 || 📐 Gravity Work and PE Change**
> $$
> W_G = mgh_1 - mgh_2 = -(E_{p2} - E_{p1}) = -\Delta E_p
> $$
> 重力做的功等于重力势能减少量。这一关系与路径无关，只取决于始末高度差。 || Work by gravity equals decrease in gravitational PE. Path-independent, depends only on height difference.

::panel
### 弹性势能 Ep = ½kx² || Elastic PE: Ep = ½kx²
$$
E_p = \frac{1}{2}kx^2
$$

x 是弹簧的形变量（压缩或拉伸），k 是劲度系数。弹性势能总 ≥ 0，在自然长度位置为零。 || x is deformation (compression or extension), k is spring constant. Elastic PE ≥ 0, zero at natural length.

::panel
### 机械能守恒定律 || Conservation of Mechanical Energy
$$
E_{k1} + E_{p1} = E_{k2} + E_{p2}
$$

> **💡 守恒条件 || 💡 Conservation Conditions**
> 只有重力和弹力做功时（或外力和摩擦力不做功时），系统的机械能守恒。有摩擦力做功时，机械能减少，转化为内能。 || When only gravity and spring force do work (or external/friction forces do no work), mechanical energy is conserved. Friction converts ME to thermal energy.

拖动滑块调整初始高度，观察过山车上小球的动能、势能和机械能变化。 || Adjust the initial height slider and watch how KE, PE, and ME change on the roller coaster.

> **🧪 交互实验沙盒 || Interactive Simulation Sandbox** (`#sim-energy`) — 交互可调参数：初始高度 h || Initial height h。
:::

## #practice 04 / Enhanced Practice :: 从基础到挑战 || From Basics to Challenge

3 道基础 + 3 道进阶 + 2 道挑战，巩固功与能核心概念。 || 3 basic + 3 advanced + 2 challenge problems to solidify work and energy concepts.

:::accordion
::panel { open: true }
### 基础题（3 道） || Basic (3)
> **Q1**
> 用 100 N 的力沿水平方向推箱子前进 5 m。求推力做的功。 || Push a box 5 m with 100 N horizontal force. Find the work done.

**📖 Q1 答案 || 📖 Q1 Answer**

$$
W = Fs\cos 0° = 100 \times 5 \times 1 = 500 \text{ J}
$$

> **Q2**
> 用与水平方向成 60° 斜向上的力 F=200 N 拉物体水平移动 3 m。求拉力做的功。 || Pull an object 3 m horizontally with F=200 N at 60° above horizontal. Find work by F.

**📖 Q2 答案 || 📖 Q2 Answer**

$$
W = Fs\cos 60° = 200 \times 3 \times 0.5 = 300 \text{ J}
$$

> **Q3**
> 质量 2 kg 的物体以 3 m/s 匀速运动，受到 10 N 的制动力后停下。用动能定理求制动距离。 || 2 kg object at 3 m/s, braking force 10 N until stop. Find braking distance using KE theorem.

**📖 Q3 答案 || 📖 Q3 Answer**

动能定理 W = ΔEk： || KE theorem: W = ΔEk:

$$
-Fs = 0 - \frac{1}{2}mv_0^2
$$

$$
s = \frac{mv_0^2}{2F} = \frac{2 \times 9}{2 \times 10} = 0.9 \text{ m}
$$

::panel
### 进阶题（3 道） || Advanced (3)
> **Q4**
> 质量 1 kg 的小球从 5 m 高处自由落下（不计空气阻力）。求落地时的速度。(g=10 m/s²) || 1 kg ball free-falls from 5 m (no air resistance). Find landing speed. (g=10)

**📖 Q4 答案 || 📖 Q4 Answer**

机械能守恒：mgh = ½mv² || Conservation: mgh = ½mv²

$$
v = \sqrt{2gh} = \sqrt{2 \times 10 \times 5} = 10 \text{ m/s}
$$

> **Q5**
> 质量 0.5 kg 的物体从光滑斜面顶端由静止滑下，斜面高 4 m、长 8 m。求底端速度和斜面支持力做的功。(g=10 m/s²) || 0.5 kg object slides from rest on frictionless incline, h=4 m, L=8 m. Find speed at bottom and work by normal force. (g=10)

**📖 Q5 答案 || 📖 Q5 Answer**

支持力 ⊥ 位移方向 → Wᴺ = 0（不做功）。机械能守恒： || Normal force ⊥ displacement → Wᴺ = 0. Conservation:

$$
v = \sqrt{2gh} = \sqrt{2 \times 10 \times 4} = \sqrt{80} \approx 8.94 \text{ m/s}
$$

支持力始终垂直于斜面（即垂直于位移），做功为零。速度只与高度差有关，与斜面长度无关。 || Normal force is always perpendicular to displacement, so work = 0. Speed depends only on height, not slope length.

> **Q6**
> 质量 2 kg 的物体以 4 m/s 的初速度沿粗糙水平面滑动，摩擦系数 μ=0.2。求物体滑行距离和摩擦力做的功。(g=10 m/s²) || 2 kg object slides on rough surface, v₀=4 m/s, μ=0.2. Find distance and friction work. (g=10)

**📖 Q6 答案 || 📖 Q6 Answer**

摩擦力 f = μmg = 0.2×2×10 = 4 N。动能定理： || Friction f = μmg = 4 N. KE theorem:

$$
-fs = 0 - \frac{1}{2}mv_0^2
$$

$$
s = \frac{mv_0^2}{2f} = \frac{2 \times 16}{2 \times 4} = 4 \text{ m}
$$

$$
W_f = -fs = -4 \times 4 = -16 \text{ J}
$$

摩擦力做负功 16 J，动能全部转化为内能。 || Friction does -16 J of work. All KE converts to thermal energy.

::panel
### 挑战题（2 道） || Challenge (2)
> **Q7**
> 长 L=1 m 的轻绳悬挂质量 m=0.5 kg 的小球。将绳拉至水平位置后释放。求小球到达最低点时的速度和绳的拉力。(g=10 m/s²) || Pendulum: L=1 m, m=0.5 kg, released from horizontal. Find speed and tension at lowest point. (g=10)

**📖 Q7 答案 || 📖 Q7 Answer**

机械能守恒（参考面取最低点）： || Conservation (reference at lowest point):

$$
mgL = \frac{1}{2}mv^2 \Rightarrow v = \sqrt{2gL} = \sqrt{20} \approx 4.47 \text{ m/s}
$$

最低点受力：T - mg = mv²/L（向心力方程） || At lowest point: T - mg = mv²/L (centripetal force)

$$
T = mg + \frac{mv^2}{L} = mg + 2mg = 3mg = 15 \text{ N}
$$

> **Q8**
> 从高 h 的光滑圆弧轨道顶端由静止释放小车（质量 M），小车底部有弹簧。在最低处与静止的小球（质量 m）碰撞后弹性粘合，一起运动到另一侧高 h' 处。求 h' 的表达式。 || Cart M slides from height h on frictionless track, collides and sticks with ball m at bottom. Find height h' they reach together.

**📖 Q8 答案 || 📖 Q8 Answer**

第一阶段：M 从 h 滑到底部（机械能守恒） || Stage 1: M slides to bottom (conservation)

$$
Mgh = \frac{1}{2}Mv_1^2 \Rightarrow v_1 = \sqrt{2gh}
$$

第二阶段：碰撞（动量守恒，能量不守恒） || Stage 2: Collision (momentum conserved, energy not)

$$
Mv_1 = (M+m)v_2 \Rightarrow v_2 = \frac{M}{M+m}\sqrt{2gh}
$$

第三阶段：整体上升（机械能守恒） || Stage 3: Rise together (conservation)

$$
h' = \frac{v_2^2}{2g} = \frac{M^2}{(M+m)^2} \cdot h
$$
:::

## #roadmap 05 / Learning Roadmap :: 力学系列导航 || Mechanics Series Navigation

这是力学系列第 7 篇。你已掌握功、动能定理和机械能守恒定律。 || Part 7 of Mechanics. You've mastered work, the kinetic energy theorem, and conservation of mechanical energy.

- [第 1 篇 || Part 1：运动的描述 || Describing Motion](../describing-motion/)
- [第 2 篇 || Part 2：匀变速直线运动 || Uniform Acceleration](../uniform-acceleration/)
- [第 3 篇 || Part 3：力与平衡 || Forces & Equilibrium](../forces-equilibrium/)
- [第 4 篇 || Part 4：牛顿运动定律 || Newton's Laws](../newtons-laws/)
- [第 5 篇 || Part 5：圆周运动 || Circular Motion](../circular-motion/)
- [第 6 篇 || Part 6：万有引力与航天 || Gravitation](../gravitation/)
- **第 7 篇 · 当前 || Part 7 · Current：功与能 || Work & Energy**
- [第 8 篇 || Part 8：动量 || Momentum](../momentum/)

:::callout { title: "下一篇预告 || Next Article Preview" }
第 8 篇将聚焦**动量**——从冲量到动量定理再到动量守恒，与动能定理联合构成力学问题的双重武器。 || Part 8: **Momentum** — from impulse to momentum theorem to conservation. Combined with KE theorem, a dual weapon for mechanics problems.
:::

## #work-definition 01 / Definition & Calculation of Work :: 力对物体做了多少功？ || How Much Work Does a Force Do?

物理学中的功有严格定义：力使物体沿力的方向发生位移时，力才做了功。搬着行李站着不动？物理上没做功。 || In physics, work has a strict definition: a force does work only when it causes displacement along its direction. Holding luggage while standing still? Physically, no work is done.

:::accordion
::panel { open: true }
### 功的公式：W = Fs cosθ || Work Formula: W = Fs cosθ
$$
W = F s cos θ
$$

F

**力的大小（N） || Force Magnitude (N)**

施加在物体上的力。力越大，做的功越多。 || The force applied to the object. Greater force means more work.

s

**位移大小（m） || Displacement Magnitude (m)**

物体沿力的作用方向移动的距离。注意是位移，不是路程。 || The distance the object moves along the direction of force. Note: displacement, not distance traveled.

θ

**力与位移的夹角 || Angle Between Force & Displacement**

cos θ 决定了力在位移方向上的有效分量。θ = 0° 时功最大，θ = 90° 时功为零，θ > 90° 时功为负。 || cos θ determines the effective component of force along displacement. θ = 0° gives max work, θ = 90° gives zero, θ > 90° gives negative work.

> **功的单位 || Unit of Work**
> 功的单位是焦耳（J）。1 J = 1 N · m，即 1 牛顿的力使物体沿力的方向移动 1 米所做的功。 || The unit of work is the Joule (J). 1 J = 1 N · m, the work done by 1 Newton of force over 1 meter of displacement.

::panel
### 正功、负功与零功 || Positive, Negative & Zero Work
| 类型 || Type | 条件 || Condition | θ 范围 || θ Range | 示例 || Example |
| --- | --- | --- | --- |
| 正功 || Positive work | 力促进运动 || Force promotes motion | 0° ≤ θ < 90° | 推箱子前进 || Pushing a box forward |
| 负功 || Negative work | 力阻碍运动 || Force opposes motion | 90° < θ ≤ 180° | 摩擦力减速 || Friction slowing down |
| 零功 || Zero work | 力与运动垂直 || Force perpendicular to motion | θ = 90° | 提箱子水平走 || Carrying a suitcase horizontally |

> **💡 思考题**
> 你提着 10 kg 的行李箱在水平地面上走了 100 m。你对行李箱做了多少功？ || You carry a 10 kg suitcase horizontally for 100 m. How much work did you do on the suitcase?
> 答案：0 J。提力（向上）与位移（水平）垂直，θ = 90°，cos 90° = 0，所以做功为零。你的肌肉在消耗能量，但物理上对箱子没有做功。 || Answer: 0 J. The lifting force (upward) is perpendicular to displacement (horizontal), θ = 90°, cos 90° = 0. Your muscles burn energy, but physically no work is done on the suitcase.
:::

## #kinetic-energy 02 / Kinetic Energy & the Work-Energy Theorem :: 运动的能量与功的关系 || The Energy of Motion & Its Relation to Work

一辆高速行驶的卡车比自行车危险得多——因为它的动能巨大。动能定理揭示了合力做功与物体动能变化的精确关系。 || A speeding truck is far more dangerous than a bicycle — because of its enormous kinetic energy. The work-energy theorem reveals the precise relationship between net work and kinetic energy change.

:::accordion
::panel { open: true }
### 动能公式与直觉理解 || Kinetic Energy Formula & Intuition
$$
Ek = ½mv²
$$

- **质量效应 || Mass Effect** — 动能与质量成正比。10 吨卡车与 1 吨小车同速行驶时，卡车动能是小车的 10 倍——这就是重型车刹车距离更长的原因。 || KE is proportional to mass. A 10-ton truck at the same speed as a 1-ton car has 10× the KE — that's why heavy vehicles need longer braking distances.
- **速度效应（平方！） || Speed Effect (Squared!)** — 动能与速度的平方成正比。速度加倍，动能变为 4 倍！这就是为什么超速如此危险：80 km/h 的破坏力是 40 km/h 的 4 倍。 || KE is proportional to v². Double the speed = 4× the KE! That's why speeding is so dangerous: 80 km/h has 4× the destructive power of 40 km/h.

::panel
### 动能定理：合力做功 = 动能变化 || Work-Energy Theorem: Net Work = Change in KE
$$
Wnet = ΔEk = ½mv₂² − ½mv₁²
$$

> **核心含义 || Core Meaning**
> 合外力对物体所做的总功，等于物体动能的变化量。这是力学中最实用的定理之一——它将力、位移与速度直接关联，绕开了加速度和时间的计算。 || Net work done by all external forces equals the change in kinetic energy. This is one of the most practical theorems in mechanics — it directly links force, displacement, and velocity, bypassing acceleration and time.

+

**合力做正功 || Positive Net Work**

W > 0 → 动能增加 → 物体加速。例如汽车踩油门加速。 || W > 0 → KE increases → object accelerates. e.g., car accelerating.

−

**合力做负功 || Negative Net Work**

W < 0 → 动能减少 → 物体减速。例如汽车刹车减速。 || W < 0 → KE decreases → object decelerates. e.g., car braking.
:::

## #conservation 03 / Potential Energy & Conservation of Mechanical Energy :: 能量不会消失，只会转化 || Energy Doesn't Disappear, It Transforms

高处的物体有势能，运动的物体有动能。在理想条件下，势能和动能可以完美互换——这就是机械能守恒定律。 || Objects at height have potential energy, moving objects have kinetic energy. Under ideal conditions, PE and KE interchange perfectly — this is the conservation of mechanical energy.

:::accordion
::panel { open: true }
### 重力势能与弹性势能 || Gravitational PE & Elastic PE
- **重力势能 || Gravitational PE** — 物体因处于高处而具有的能量。选定参考面后，E_p = mgh。高度 h 越大、质量 m 越大，势能越大。举起的锤子有势能，落下时转化为动能。 || Energy an object has due to its height. With a chosen reference level, E_p = mgh. Greater h or m means more PE. A raised hammer has PE that converts to KE when dropped.
- **弹性势能 || Elastic PE** — 弹簧、橡皮筋等弹性体因形变而具有的能量。E_p = ½kx²，其中 k 是弹簧的劲度系数，x 是形变量。弓箭拉满时弹性势能最大，释放时转化为动能。 || Energy stored in springs, rubber bands due to deformation. E_p = ½kx², where k is the spring constant and x is the deformation. A fully drawn bow has maximum elastic PE, converting to KE upon release.

$$
Ep(重力) = mgh Ep(弹性) = ½kx²
$$

::panel
### 机械能守恒定律 || Conservation of Mechanical Energy
$$
Ek1 + Ep1 = Ek2 + Ep2
$$

> **守恒条件 || Conservation Conditions**
> 只有重力（或弹力）做功时，物体的动能和势能可以相互转化，但机械能总量保持不变。如果有摩擦力等非保守力做功，机械能会减少（转化为内能等）。 || When only gravity (or elastic force) does work, kinetic and potential energy can interchange, but total mechanical energy stays constant. If non-conservative forces like friction do work, mechanical energy decreases (converts to thermal energy, etc.).

- **过山车 || Roller Coaster** — 从最高点滑下时，势能转化为动能，速度增大；冲上坡时，动能转化为势能，速度减小。忽略摩擦时，起始高度完全决定了最高速度。 || Going down from the peak, PE converts to KE, speed increases; going up, KE converts to PE, speed decreases. Without friction, starting height fully determines max speed.
- **单摆 || Pendulum** — 摆到最高点时动能为零、势能最大；摆到最低点时势能最小、动能最大。能量在两种形式间反复转化，总量不变。 || At the highest point, KE = 0, PE is max; at the lowest point, PE is min, KE is max. Energy oscillates between the two forms, total unchanged.
:::

## #exercises 04 / Enhanced Exercises :: 从基础到挑战：8 道精选题 || From Basic to Challenge: 8 Selected Problems

分层训练，逐步提升。基础题巩固公式，进阶题训练分析，挑战题培养综合能力。 || Layered training for progressive improvement. Basic problems for formulas, advanced for analysis, challenge for comprehensive skills.

:::accordion
::panel { open: true }
### 基础题（3 题） || Basic Problems (3)
> **题 1：计算功 || Q1: Calculate Work**
> 一个人用 200 N 的力沿水平方向推箱子前进 5 m，求推力对箱子做的功。 || A person pushes a box horizontally with 200 N over 5 m. Find the work done by the pushing force.
> W = Fs cos θ = 200 × 5 × cos 0° = 1000 J。力与位移同向，θ = 0°，cos 0° = 1。 || W = Fs cos θ = 200 × 5 × cos 0° = 1000 J. Force and displacement are in the same direction, θ = 0°, cos 0° = 1.

> **题 2：斜拉力做功 || Q2: Angled Force Work**
> 用 100 N 的力与水平方向成 60° 角拉箱子前进 8 m，求拉力做的功。 || A 100 N force at 60° to the horizontal pulls a box 8 m. Find the work done.
> W = Fs cos θ = 100 × 8 × cos 60° = 100 × 8 × 0.5 = 400 J。 || W = Fs cos θ = 100 × 8 × cos 60° = 100 × 8 × 0.5 = 400 J.

> **题 3：求动能 || Q3: Find Kinetic Energy**
> 一辆质量为 1200 kg 的汽车以 20 m/s 的速度行驶，求其动能。 || A 1200 kg car travels at 20 m/s. Find its kinetic energy.
> E_k = ½mv² = ½ × 1200 × 20² = ½ × 1200 × 400 = 240,000 J = 240 kJ。 || E_k = ½mv² = ½ × 1200 × 20² = ½ × 1200 × 400 = 240,000 J = 240 kJ.

::panel
### 进阶题（3 题） || Advanced Problems (3)
> **题 4：动能定理求速度 || Q4: Work-Energy Theorem for Speed**
> 质量 2 kg 的物体从静止开始，受到 10 N 的水平合力作用移动 4 m。求末速度。 || A 2 kg object starts from rest and moves 4 m under a net horizontal force of 10 N. Find the final speed.
> 由动能定理：W = ΔE_k → Fs = ½mv² − 0 → 10 × 4 = ½ × 2 × v² → 40 = v² → v = √40 ≈ 6.32 m/s。 || By work-energy theorem: W = ΔE_k → Fs = ½mv² − 0 → 10 × 4 = ½ × 2 × v² → 40 = v² → v = √40 ≈ 6.32 m/s.

> **题 5：摩擦力做负功 || Q5: Friction Does Negative Work**
> 一辆 1000 kg 的汽车以 30 m/s 行驶，刹车后滑行 90 m 停下。求摩擦力的大小。 || A 1000 kg car at 30 m/s brakes and slides 90 m to a stop. Find the friction force.
> W_f = ΔE_k = 0 − ½mv₁² = −½ × 1000 × 30² = −450,000 J。又 W_f = −f × s（摩擦力与位移反向），所以 −f × 90 = −450,000 → f = 5000 N。 || W_f = ΔE_k = 0 − ½mv₁² = −½ × 1000 × 30² = −450,000 J. Also W_f = −f × s (friction opposes displacement), so −f × 90 = −450,000 → f = 5000 N.

> **题 6：机械能守恒求速度 || Q6: Conservation for Speed**
> 一个小球从 20 m 高的地方自由落下（忽略空气阻力），求落地时的速度。(g = 10 m/s²) || A ball falls freely from 20 m height (ignore air resistance). Find its speed upon hitting the ground. (g = 10 m/s²)
> 由机械能守恒：mgh = ½mv² → v = √(2gh) = √(2 × 10 × 20) = √400 = 20 m/s。 || By conservation: mgh = ½mv² → v = √(2gh) = √(2 × 10 × 20) = √400 = 20 m/s.

::panel
### 挑战题（2 题） || Challenge Problems (2)
> **题 7：斜面 + 摩擦力综合 || Q7: Incline + Friction Combined**
> 一个 5 kg 的物体从高 3 m 的光滑斜面顶端由静止滑下，到达底部后进入粗糙的水平面（动摩擦因数 μ = 0.4），求物体在水平面上滑行的距离。(g = 10 m/s²) || A 5 kg object slides from rest down a smooth 3 m high incline, then onto a rough horizontal surface (μ = 0.4). Find the sliding distance. (g = 10 m/s²)
> 斜面上机械能守恒：mgh = ½mv₁² → v₁ = √(2 × 10 × 3) = √60 m/s。水平面上用动能定理：−μmgs = 0 − ½mv₁² → s = v₁²/(2μg) = 60/(2 × 0.4 × 10) = 7.5 m。 || On incline (conservation): v₁ = √(2gh) = √60 m/s. On horizontal (work-energy): −μmgs = −½mv₁² → s = v₁²/(2μg) = 60/(2 × 0.4 × 10) = 7.5 m.

> **题 8：弹簧发射 || Q8: Spring Launch**
> 一个弹簧枪把质量 0.05 kg 的子弹竖直向上发射，弹簧压缩时弹性势能为 10 J。忽略空气阻力，求子弹能上升的最大高度。(g = 10 m/s²) || A spring gun launches a 0.05 kg bullet vertically. Compressed spring has 10 J of elastic PE. Ignoring air resistance, find the maximum height. (g = 10 m/s²)
> 弹性势能 → 动能 → 重力势能。由能量守恒：E_p(弹) = mgh → 10 = 0.05 × 10 × h → h = 10/0.5 = 20 m。子弹最高能上升 20 m。 || Elastic PE → KE → Gravitational PE. By energy conservation: E_p = mgh → 10 = 0.05 × 10 × h → h = 20 m. The bullet rises up to 20 m.
:::
