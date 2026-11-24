---
title: "匀变速直线运动：公式与自由落体 || Uniform Acceleration & Free Fall"
eyebrow: "力学 · 第 2 篇 / 共 8 篇 || Mechanics · Part 2 of 8"
brand: "力学 || Mechanics"
date: 2026-04-17
strict_i18n: false
strict_density: true
lead: "加速度恒定时的三大运动学公式——刹车距离、自由落体、追及问题的万能钥匙。 || Three kinematic equations for constant acceleration — the master key to braking, free fall, and chase problems."
hero_actions:
  - "开始学习 || Start Learning | #scene"
  - "直接练习 || Go to Practice | #practice"
panel_label: "本章目标 || Chapter Goals"
panel_title: "掌握匀变速运动的完整工具箱 || Master the Uniform Acceleration Toolbox"
panel:
  - "熟练运用三大运动学公式 || Master three kinematic equations"
  - "用 v-t 图求位移和加速度 || Use v-t graphs for displacement & acceleration"
  - "理解自由落体和竖直上抛 || Understand free fall & vertical throw"
  - "解决追及与相遇问题 || Solve chase & encounter problems"
metrics:
  - "核心公式 || Core Formulas | 3 | 运动学方程 || Kinematic equations"
  - "关键常数 || Key Constant | g | 9.8 m/s²"
  - "交互实验 || Interactive Labs | 1 | v-t 图模拟器 || v-t Graph Simulator"
  - "难度 || Difficulty | ★★☆☆☆ | 初学可达 || Beginner friendly"
style:
  accent: "#0284c7"
---

## #scene 01 / Real-World Scenarios :: 匀变速运动在哪里？ || Where Is Uniform Acceleration?

加速度恒定的运动比你想的更常见——从苹果落地到航天发射。 || Constant-acceleration motion is more common than you think — from falling apples to rocket launches.

:::accordion
::panel { open: true }
### 四个经典场景 || Four Classic Scenarios
- **自由落体 || Free Fall** — 苹果从树上掉落，初速度为零，加速度恒为 g ≈ 9.8 m/s²。1 秒后速度约 10 m/s，2 秒后约 20 m/s。 || Apple falls from tree: v₀=0, a=g≈9.8 m/s². After 1 s: ~10 m/s; after 2 s: ~20 m/s.
- **紧急刹车 || Emergency Braking** — 汽车以 108 km/h（30 m/s）紧急制动。路面摩擦提供恒定减速度约 8 m/s²，需知刹车距离来保命。 || Car at 108 km/h (30 m/s) brakes hard. Friction provides ~8 m/s² deceleration — braking distance saves lives.
- **飞机起飞 || Airplane Takeoff** — 波音 737 需达到约 80 m/s 的离地速度。跑道长度有限，必须计算所需加速度和滑跑时间。 || Boeing 737 needs ~80 m/s liftoff speed. Limited runway — must calculate required acceleration.
- **追及问题 || Chase Problem** — 警车从静止加速追赶匀速行驶的逃逸车辆。何时追上？追上时警车速度多少？经典双物体问题。 || Police car accelerates from rest to catch a constant-speed vehicle. When? At what speed?

::panel
### 🧪 交互实验：v-t 图模拟器 || 🧪 Lab: v-t Graph Simulator
调整初速度 v₀ 和加速度 a，观察 v-t 图的变化。斜率 = 加速度，图线下方面积 = 位移。 || Adjust v₀ and a to see the v-t graph change. Slope = acceleration, area under curve = displacement.

> **🧪 交互实验沙盒 || Interactive Simulation Sandbox** (`#sim-vt-graph`) — 交互可调参数：$v_0$：、$a$：、时间： || Time:。
:::

## #formulas 02 / Three Kinematic Equations :: 匀变速运动的万能工具 || The Universal Tools of Uniform Acceleration

三个公式，五个量（v₀, v, a, x, t）——每个公式包含四个量、缺少一个。根据已知条件选公式。 || Three equations, five variables (v₀, v, a, x, t) — each contains four and omits one.

:::accordion
::panel { open: true }
### 公式一：速度-时间关系 || Equation 1: Velocity-Time
$$
v = v_0 + at
$$

> **📐 公式解读 || 📐 Formula Breakdown**
> 加速度定义式 a = (v − v₀)/t 变形即得。含义：末速度 = 初速度 + 加速度 × 时间。 || Rearranged from a = (v−v₀)/t. Meaning: final velocity = initial velocity + acceleration × time.
> 例：跑车初速度 0，加速度 5 m/s²，4 s 后速度 = 0 + 5×4 = 20 m/s（72 km/h）。 || Example: car starts from rest, a=5 m/s², after 4 s: v = 0+5×4 = 20 m/s (72 km/h).
> 此公式不含位移 x——当题目不涉及距离时优先使用。 || This equation omits displacement x — use it when distance is not involved.

::panel
### 公式二：位移-时间关系 || Equation 2: Displacement-Time
$$
x = v_0 t + \frac{1}{2}at^2
$$

> **📐 推导过程 || 📐 Derivation**
> 匀变速运动的平均速度 = (v₀ + v)/2。将 v = v₀ + at 代入： || Average velocity of uniform acceleration = (v₀+v)/2. Substituting v = v₀+at:
> x = v̄ · t = [(v₀ + v₀ + at)/2] · t = v₀t + ½at²。½ 来自平均——因为速度在均匀变化，实际效果是 a 的一半。 || x = v̄·t = [(v₀+v₀+at)/2]·t = v₀t+½at². The ½ comes from averaging — velocity changes uniformly.
> 此公式不含末速度 v——当不需要求末速度时使用。 || This equation omits final velocity v — use when final velocity is not needed.

::panel
### 公式三：速度-位移关系（消去时间） || Equation 3: Velocity-Displacement (No Time)
$$
v^2 = v_0^2 + 2ax
$$

> **📐 推导过程 || 📐 Derivation**
> 从公式一 v = v₀ + at 得 t = (v − v₀)/a，代入公式二： || From eq.1: t = (v−v₀)/a. Substitute into eq.2:
> x = v₀·(v−v₀)/a + ½a·[(v−v₀)/a]² = (v²−v₀²)/(2a)，整理得 v² = v₀² + 2ax。 || x = v₀(v−v₀)/a + ½a[(v−v₀)/a]² → v² = v₀² + 2ax.
> 此公式不含时间 t——刹车距离问题的首选，因为通常已知初末速度和加速度。 || This equation omits time t — ideal for braking distance problems.

> **刹车距离速算 || Quick Braking Distance**
> 刹车到停（v=0）：0 = v₀² + 2ax → x = v₀²/(2|a|)。速度翻倍 → 刹车距离翻 4 倍！60 km/h 刹 17 m，120 km/h 需 68 m。 || Braking to stop (v=0): x = v₀²/(2|a|). Double speed → 4× braking distance! 60 km/h: 17 m; 120 km/h: 68 m.

::panel
### 公式选择速查表 || Formula Selection Quick Reference
| 公式 || Formula | $v_0$ | $v$ | $a$ | $x$ | $t$ | 缺少 || Omits |
| --- | --- | --- | --- | --- | --- | --- |
| $v = v_0 + at$ | ✓ | ✓ | ✓ | ✗ | ✓ | 位移 x || x |
| $x = v_0 t + \tfrac{1}{2}at^2$ | ✓ | ✗ | ✓ | ✓ | ✓ | 末速度 v || v |
| $v^2 = v_0^2 + 2ax$ | ✓ | ✓ | ✓ | ✓ | ✗ | 时间 t || t |

> **选公式口诀 || Formula Selection Tip**
> 看题目「不给什么量」→ 选「缺那个量」的公式。不给 x → 用公式一；不给 v → 用公式二；不给 t → 用公式三。 || Check what's NOT given → pick the equation that omits it. No x → eq.1; no v → eq.2; no t → eq.3.
:::

## #vt-graph 03 / v-t Graph Analysis :: 一图胜千言 || A Graph Worth a Thousand Words

v-t 图是匀变速运动最强大的可视化工具。三条规则即可完整读图。 || The v-t graph is the most powerful visualization tool for uniform acceleration.

:::accordion
::panel { open: true }
### 三条读图规则 || Three Graph-Reading Rules
1

**斜率 = 加速度 || Slope = Acceleration**

v-t 图中直线的斜率 k = Δv/Δt = a。斜率为正 → 加速；为负 → 减速；为零 → 匀速（水平线）。斜率越陡，加速度越大。 || Slope k = Δv/Δt = a. Positive → speeding up; negative → slowing down; zero → constant velocity (horizontal).

2

**面积 = 位移 || Area = Displacement**

v-t 图线与时间轴围成的面积等于位移。在时间轴上方为正位移，下方为负位移。匀变速运动的面积是梯形（或三角形）。 || Area between v-t line and t-axis = displacement. Above axis → positive; below → negative. Uniform acceleration gives a trapezoid (or triangle).

3

**交点 = 速度相等 || Intersection = Equal Velocity**

两条 v-t 线的交点表示两物体速度相等的时刻。追及问题中，交点对应追上或被追上的关键瞬间。 || Intersection of two v-t lines = moment when both objects have equal velocity — key in chase problems.

::panel
### 面积公式推导 || Area Formula Derivation
> **📐 梯形面积 = 位移 || 📐 Trapezoid Area = Displacement**
> 匀变速运动的 v-t 图是直线：起点 (0, v₀)，终点 (t, v)。与时间轴围成梯形。 || Uniform acceleration v-t line: from (0, v₀) to (t, v). Forms a trapezoid with t-axis.
> 梯形面积 = (上底 + 下底) × 高 / 2 = (v₀ + v) × t / 2。 || Trapezoid area = (top + bottom) × height / 2 = (v₀+v)×t/2.
> 这正是位移公式的另一种形式：x = (v₀ + v)t/2——「平均速度 × 时间」。 || This is another form of the displacement equation: x = (v₀+v)t/2 — 'average velocity × time'.
:::

## #freefall 04 / Free Fall & Vertical Throw :: 重力场中的匀变速运动 || Uniform Acceleration in Gravity

自由落体和竖直上抛是匀变速直线运动的两个重要特例。 || Free fall and vertical throw are two important special cases of uniform acceleration.

:::accordion
::panel { open: true }
### 自由落体：v₀ = 0, a = g || Free Fall: v₀=0, a=g
自由落体 = 初速度为零、仅受重力的匀加速运动。三大公式简化为： || Free fall = starting from rest with only gravity. The three equations simplify to:

$$
v = gt \qquad h = \frac{1}{2}gt^2 \qquad v^2 = 2gh
$$

> **📐 1:3:5:7 规则 || 📐 The 1:3:5:7 Rule**
> 自由落体在连续相等时间 T 内的位移之比为 1:3:5:7:…（奇数序列）。 || In free fall, displacements in consecutive equal time intervals T are in ratio 1:3:5:7:… (odd number sequence).
> 证明：第 n 段位移 = ½g(nT)² − ½g((n−1)T)² = ½gT²(2n−1)。比值即 1:3:5:7。 || Proof: n-th segment = ½g(nT)²−½g((n−1)T)² = ½gT²(2n−1). Ratios: 1:3:5:7.
> 推广：从静止开始的任何匀加速运动均满足此规律。 || Generalization: any uniformly accelerating motion from rest satisfies this rule.

| 下落时间 || Fall Time | 速度 (m/s) || Velocity (m/s) | 累计距离 (m) || Total Distance (m) | 本段距离 (m) || Segment (m) |
| --- | --- | --- | --- |
| 1 s | 9.8 | 4.9 | 4.9 |
| 2 s | 19.6 | 19.6 | 14.7 |
| 3 s | 29.4 | 44.1 | 24.5 |
| 4 s | 39.2 | 78.4 | 34.3 |

::panel
### 竖直上抛：对称性 || Vertical Throw: Symmetry
竖直上抛 = 初速度向上、加速度向下（a = −g）的匀变速运动。 || Vertical throw = initial velocity upward, acceleration downward (a = −g).

$$
v = v_0 - gt \qquad h = v_0 t - \frac{1}{2}gt^2
$$

1

**最高点：v = 0 || Highest Point: v = 0**

上升到最高点时速度恰好为零。令 v = 0 得上升时间 t↑ = v₀/g，最大高度 H = v₀²/(2g)。 || At the top, v = 0. Rise time t↑ = v₀/g, max height H = v₀²/(2g).

2

**时间对称：t↑ = t↓ || Time Symmetry: t↑ = t↓**

上升时间 = 下降时间。总空中时间 = 2v₀/g。上升减速与下落加速完全对称。 || Rise time = fall time. Total air time = 2v₀/g. Deceleration up and acceleration down are symmetric.

3

**速度对称：同一高度速率相等 || Speed Symmetry: Same Height = Same Speed**

经过同一高度时，上升速率 = 下落速率（方向相反）。回到抛出点时速率等于初速度。 || At the same height, upward speed = downward speed (opposite direction). Returns to start with initial speed.

> **安全警示 || Safety Warning**
> 向上抛出物体，落回时速度等于初速度。以 20 m/s 向上扔石头，落回时打击力等价于从 20 m 高处落下——非常危险！ || An object thrown up returns at the same speed. Throwing a stone at 20 m/s up is equivalent to dropping it from 20 m — very dangerous!
:::

## #practice 05 / Enhanced Practice :: 先做后查 || Try First, Then Check

先独立思考，再展开答案自查。建议动笔列出已知量和未知量后选公式。 || Think first, expand answers to check. List known/unknown variables, then pick the right equation.

:::accordion
::panel { open: true }
### 基础题（3 道） || Basic (3)
> **Q1**
> 汽车从静止出发，加速度 2 m/s²，求 6 s 后的速度和位移。 || Car starts from rest, a=2 m/s². Find velocity and displacement after 6 s.

**📖 Q1 答案 || 📖 Q1 Answer**

用公式一（不需要 x 关系先求 v）： || Using equation 1:

$$
v = 0 + 2 \times 6 = 12 \text{ m/s}
$$

用公式二求位移： || Using equation 2 for displacement:

$$
x = 0 \times 6 + \frac{1}{2} \times 2 \times 6^2 = 36 \text{ m}
$$

> **Q2**
> 物体以 10 m/s 的初速度做匀减速运动，加速度为 −2 m/s²，求 3 s 末的速度。 || Object at v₀=10 m/s decelerates at a=−2 m/s². Find velocity at t=3 s.

**📖 Q2 答案 || 📖 Q2 Answer**

$$
v = 10 + (-2) \times 3 = 4 \text{ m/s}
$$

3 s 后物体仍在运动，速度降为 4 m/s。 || Still moving after 3 s, velocity drops to 4 m/s.

> **Q3**
> 自由落体 2 s 后速度和下落高度各是多少？（g = 9.8 m/s²） || Free fall: velocity and height after 2 s? (g = 9.8 m/s²)

**📖 Q3 答案 || 📖 Q3 Answer**

$$
v = 9.8 \times 2 = 19.6 \text{ m/s}
$$

$$
h = \frac{1}{2} \times 9.8 \times 4 = 19.6 \text{ m}
$$

2 s 内下落近 20 m（约 6 层楼高）。 || Falls ~20 m in 2 s (about 6 stories).

::panel
### 进阶题（3 道） || Advanced (3)
> **Q4**
> 汽车以 30 m/s 行驶，紧急刹车加速度为 −6 m/s²。求刹车距离和刹车时间。 || Car at 30 m/s brakes at a=−6 m/s². Find braking distance and time.

**📖 Q4 答案 || 📖 Q4 Answer**

用公式三（不含 t）求距离： || Using equation 3 (no t) for distance:

$$
0 = 30^2 + 2 \times (-6) \times x \Rightarrow x = \frac{900}{12} = 75 \text{ m}
$$

用公式一求时间： || Using equation 1 for time:

$$
0 = 30 + (-6)t \Rightarrow t = 5 \text{ s}
$$

> **Q5**
> 将球竖直上抛，初速度 20 m/s（g = 10 m/s²）。求最大高度和总空中时间。 || Ball thrown up at v₀=20 m/s (g=10 m/s²). Find max height and total air time.

**📖 Q5 答案 || 📖 Q5 Answer**

最高点 v = 0： || At highest point, v = 0:

$$
H = \frac{v_0^2}{2g} = \frac{400}{20} = 20 \text{ m}
$$

$$
t_\text{total} = \frac{2v_0}{g} = \frac{40}{10} = 4 \text{ s}
$$

上升 2 s + 下降 2 s = 总共 4 s 空中。 || 2 s up + 2 s down = 4 s total air time.

> **Q6**
> v-t 图中一条直线从 (0, 4) 到 (6, 16)。求加速度和 0~6 s 的位移。 || v-t graph: a line from (0,4) to (6,16). Find acceleration and displacement from 0-6 s.

**📖 Q6 答案 || 📖 Q6 Answer**

斜率 = 加速度： || Slope = acceleration:

$$
a = \frac{16 - 4}{6 - 0} = 2 \text{ m/s}^2
$$

面积 = 位移（梯形）： || Area = displacement (trapezoid):

$$
x = \frac{(4 + 16) \times 6}{2} = 60 \text{ m}
$$

::panel
### 挑战题（2 道） || Challenge (2)
> **Q7**
> 追及问题：甲车匀速 20 m/s，乙车在甲车身后 100 m 处从静止以 3 m/s² 加速追赶。求乙追上甲所需时间。 || Chase: Car A at constant 20 m/s. Car B starts 100 m behind from rest at a=3 m/s². When does B catch A?

**📖 Q7 答案 || 📖 Q7 Answer**

追上条件：乙的位移 = 甲的位移 + 100 m。 || Catch-up condition: B's displacement = A's displacement + 100 m.

$$
\frac{1}{2} \times 3 \times t^2 = 20t + 100
$$

$$
1.5t^2 - 20t - 100 = 0
$$

用求根公式：t = (20 + √(400 + 600))/3 = (20 + √1000)/3 ≈ (20 + 31.6)/3 ≈ 17.2 s。 || Quadratic formula: t = (20+√1000)/3 ≈ 17.2 s.

注意：先检验乙的速度是否已超过甲——v_乙 = 3×17.2 = 51.6 m/s > 20 m/s，确认可以追上。 || Check: v_B = 3×17.2 = 51.6 m/s > 20 m/s, confirmed B does catch A.

> **Q8**
> 从楼顶自由释放一个球，已知最后 1 s 内下落了 25 m。求楼高。（g = 10 m/s²） || A ball is dropped from a building rooftop. It falls 25 m in the last 1 s. Find building height. (g = 10 m/s²)

**📖 Q8 答案 || 📖 Q8 Answer**

设总下落时间为 T，则： || Let total fall time be T:

$$
H = \frac{1}{2}gT^2, \quad H - 25 = \frac{1}{2}g(T-1)^2
$$

两式相减：25 = ½g(2T−1) = 5(2T−1) → 2T−1 = 5 → T = 3 s。 || Subtract: 25 = 5(2T−1) → T = 3 s.

$$
H = \frac{1}{2} \times 10 \times 9 = 45 \text{ m}
$$

楼高 45 m，约 15 层。 || Building height: 45 m, about 15 stories.
:::

## #roadmap 06 / Learning Roadmap :: 力学系列导航 || Mechanics Series Navigation

这是力学系列第 2 篇。你已掌握匀变速运动的三大公式和自由落体运动。 || Part 2 of Mechanics. You've mastered the three kinematic equations and free fall.

- [第 1 篇 || Part 1：运动的描述 || Describing Motion](../describing-motion/)
- **第 2 篇 · 当前 || Part 2 · Current：匀变速直线运动 || Uniform Acceleration**
- [第 3 篇 || Part 3：力与平衡 || Forces & Equilibrium](../forces-equilibrium/)
- [第 4 篇 || Part 4：牛顿运动定律 || Newton's Laws](../newtons-laws/)
- [第 5 篇 || Part 5：圆周运动 || Circular Motion](../circular-motion/)
- [第 6 篇 || Part 6：万有引力与航天 || Gravitation](../gravitation/)
- [第 7 篇 || Part 7：功与能 || Work & Energy](../work-energy/)
- [第 8 篇 || Part 8：动量 || Momentum](../momentum/)

:::callout { title: "下一篇预告 || Next Article Preview" }
第 3 篇将聚焦**力与平衡**——重力、弹力、摩擦力三大常见力的分析，力的合成与分解，以及共点力平衡条件。掌握受力分析是学习牛顿定律的前提。 || Part 3: **Forces & Equilibrium** — gravity, elastic force, friction analysis; force composition and decomposition; equilibrium conditions.
:::
