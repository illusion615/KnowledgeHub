---
title: "牛顿运动定律：从惯性到 F=ma || Newton's Laws of Motion: From Inertia to F=ma"
eyebrow: "力学 · 第 4 篇 / 共 8 篇 || Mechanics · Part 4 of 8"
brand: "力学 || Mechanics"
date: 2026-04-17
strict_i18n: false
strict_density: true
lead: "三大定律构成经典力学的核心。从日常现象出发，掌握惯性、力与加速度的关系、作用力与反作用力。 || Three laws form the core of classical mechanics. Master inertia, force-acceleration relationships, and action-reaction pairs."
hero_actions:
  - "开始学习 || Start Learning | #inertia"
  - "直接练习 || Go to Practice | #practice"
panel_label: "本章目标 || Chapter Goals"
panel_title: "从力到运动的因果链 || The Causal Chain from Force to Motion"
panel:
  - "理解惯性与牛顿第一定律 || Understand inertia and Newton's 1st Law"
  - "掌握 F=ma 的定量关系 || Master the quantitative F=ma relationship"
  - "区分作用力-反作用力与平衡力 || Distinguish action-reaction from balanced forces"
  - "学会整体法与隔离法解题 || Apply system and isolation methods"
metrics:
  - "核心定律 || Core Laws | 3 | 牛顿三大定律 || Newton's Three Laws"
  - "关键公式 || Key Formula | F=ma | 动力学基本方程 || Fundamental equation"
  - "交互实验 || Interactive Lab | 1 | 电梯体重秤 || Elevator Scale"
  - "难度 || Difficulty | ★★★☆☆ | 需力学基础 || Requires mechanics basics"
style:
  accent: "#0284c7"
---

## #inertia 01 / Law of Inertia :: 没有力，物体怎样运动？ || How Does an Object Move Without Force?

亚里士多德说「力是维持运动的原因」，牛顿说「不对」。 || Aristotle said force sustains motion. Newton said no.

:::accordion
::panel { open: true }
### 牛顿第一定律 || Newton's First Law
$$
\text{一切物体总保持匀速直线运动或静止，除非受到合力作用}
$$

> **核心要点 || Key Point**
> 第一定律不是第二定律在 F=0 时的特例——它定义了「惯性参考系」的概念，指出力是改变运动状态的原因，而非维持运动的原因。 || The 1st Law is not a special case of F=ma at F=0 — it defines inertial reference frames and clarifies that force changes motion, not sustains it.

::panel
### 生活中的惯性现象 || Inertia in Daily Life
- **公交急刹车 || Bus Braking** — 车突然刹住，人因惯性继续前移而前倾。车停了，人的运动状态未被力改变，所以继续向前。 || Bus stops suddenly; passengers lean forward due to inertia — their motion state was not yet changed by force.
- **抽桌布 || Tablecloth Trick** — 快速抽掉桌布，餐具因惯性保持静止。关键：抽得够快使摩擦力作用时间极短。 || Pull tablecloth fast — dishes stay put due to inertia. Key: friction acts for too short a time.
- **太空中的运动 || Motion in Space** — 宇航员推出物体后，物体在无外力下匀速直线运动不停止——完美验证第一定律。 || An astronaut pushes an object — it moves in a straight line forever with no force to stop it.

::panel
### 惯性与质量 || Inertia and Mass
> **📐 惯性的量度 || 📐 Measure of Inertia**
> 质量是惯性大小的唯一量度。质量越大，运动状态越难改变。推购物车 vs 推卡车——同样的力，卡车加速度小得多。 || Mass is the sole measure of inertia. Greater mass = harder to change motion. Push a cart vs a truck — same force, much less acceleration.
> 惯性与速度无关——静止的卡车和行驶的卡车惯性一样大（质量相同）。 || Inertia is independent of velocity — a stationary truck has the same inertia as a moving one.
:::

## #fma 02 / F=ma :: 力如何改变运动？ || How Does Force Change Motion?

:::accordion
::panel { open: true }
### 牛顿第二定律 || Newton's Second Law
$$
\vec{F}_{\text{net}} = m\vec{a}
$$

> **📐 公式解读 || 📐 Formula Breakdown**
> 合力 = 质量 × 加速度。合力方向决定加速度方向。单位：力 N = kg·m/s²。 || Net force = mass × acceleration. Direction of net force determines direction of acceleration. Unit: N = kg·m/s².
> 两个关键关系：① m 不变时 F ∝ a（力越大加速度越大）；② F 不变时 a ∝ 1/m（质量越大加速度越小）。 || Two key relationships: ① F ∝ a at constant m; ② a ∝ 1/m at constant F.

::panel
### 🧪 电梯体重秤实验 || 🧪 Elevator Scale Lab
调节电梯加速度，观察体重秤示数变化。加速上升→超重；加速下降→失重；自由落体→完全失重！ || Adjust elevator acceleration. Accelerating up → overweight; accelerating down → underweight; free fall → weightless!

> **🧪 交互实验沙盒 || Interactive Simulation Sandbox** (`#sim-elevator`) — 交互可调参数：加速度 a = || Accel a =。

> **超重与失重 || Overweight & Weightlessness**
> 秤读数 N = m(g+a)。a>0（向上加速）→ N>mg 超重；a<0（向下加速）→ N<mg 失重；a=−g → N=0 完全失重。注意：超重/失重 ≠ 物体变重/变轻，是支持力变化。 || Scale reads N = m(g+a). a>0 (up) → overweight; a<0 (down) → underweight; a=−g → weightless. It is the normal force that changes, not actual weight.
:::

## #third-law 03 / Action & Reaction :: 力总是成对出现 || Forces Always Come in Pairs

:::accordion
::panel { open: true }
### 牛顿第三定律 || Newton's Third Law
$$
\vec{F}_{12} = -\vec{F}_{21}
$$

> **📐 三大特征 || 📐 Three Characteristics**
> ① 等大反向——大小相等方向相反；② 同种力——性质相同（都是弹力、都是摩擦力…）；③ 同时性——同时产生、变化、消失。 || ① Equal and opposite; ② Same type of force; ③ Simultaneous — appear, change, and vanish together.
> 人推墙：人对墙施力 = 墙对人施力。即使墙没动，这两个力也相等。 || Push a wall: your force on wall = wall's force on you, even though wall doesn't move.

::panel
### 作用-反作用力 vs 平衡力 || Action-Reaction vs Balanced Forces
| 比较 || Compare | 作用-反作用力 || Action-Reaction | 平衡力 || Balanced Forces |
| --- | --- | --- |
| 作用对象 || Acts on | 两个不同物体 || Two different objects | 同一个物体 || Same object |
| 力的性质 || Force type | 一定同种 || Always same type | 可以不同种 || Can differ |
| 能否分别分析 || Independent? | 不可分开（失去一方另一方不存在） || Inseparable | 可独立存在 || Can exist independently |
| 合力效果 || Net effect | 不能求合力（不同物体） || Cannot sum (diff objects) | 合力为零 || Net = 0 |
| 举例 || Example | 书压桌 ↔ 桌撑书 || Book on table ↔ table on book | 书的重力 + 桌对书的支持力 || Weight of book + normal from table |

> **常见误区 || Common Misconception**
> 「书放在桌上不动，重力和支持力是作用-反作用力」——错！它们是平衡力。书的重力（地球对书）的反作用力是书对地球的引力。 || Weight and normal force on the book are NOT action-reaction — they are balanced forces. The reaction to weight is the book's gravitational pull on Earth.
:::

## #methods 04 / System & Isolation Methods :: 解题的两大武器 || Two Powerful Problem-Solving Tools

:::accordion
::panel { open: true }
### 方法对比 || Method Comparison
| 方法 || Method | 整体法 || System Method | 隔离法 || Isolation Method |
| --- | --- | --- |
| 研究对象 || Object | 多个物体视为一个整体 || Multiple objects as one system | 取出单个物体分析 || Analyze one object separately |
| 适用场景 || When | 求系统外力作用效果 || Finding system acceleration | 求物体间内力 || Finding internal forces |
| 优势 || Advantage | 内力自动抵消，方程简洁 || Internal forces cancel, simpler | 能得到物体间相互作用力 || Reveals interaction forces |

::panel
### 经典例题：叠放物体 || Classic Example: Stacked Objects
> **题目 || Problem**
> 光滑水平面上，质量 M=4 kg 的木板上放质量 m=1 kg 的木块。水平推力 F=10 N 作用在木板上。m 与 M 间摩擦力足够大使二者一起运动。求：(1) 系统加速度；(2) m 所受摩擦力。 || Smooth surface: board M=4 kg, block m=1 kg on top. F=10 N pushes board. m and M move together. Find: (1) system acceleration; (2) friction on m.

1

**整体法求加速度 || System Method for Acceleration**

整体：F = (M+m)a → a = 10/(4+1) = 2 m/s² || System: F = (M+m)a → a = 10/5 = 2 m/s²

2

**隔离法求摩擦力 || Isolation Method for Friction**

隔离 m：f = ma = 1×2 = 2 N（方向与 F 相同，摩擦力驱动 m 加速） || Isolate m: f = ma = 1×2 = 2 N (friction drives m forward)

> **方法选择口诀 || Method Choice Rule**
> 求加速度用整体，求内力再隔离。两步联用效率最高。 || Use system method for acceleration, isolation for internal forces. Combine both for maximum efficiency.
:::

## #practice 05 / Enhanced Practice :: 先做后查 || Try First, Then Check

先独立思考，再展开答案自查。 || Think first, expand answers to check.

:::accordion
::panel { open: true }
### 基础题（3 道） || Basic (3)
> **Q1**
> 下列关于惯性的说法正确的是？A. 速度大惯性大 B. 只有静止物体有惯性 C. 惯性大小只与质量有关 D. 受力大惯性小 || Correct about inertia? A. Higher v = more inertia B. Only still objects C. Only depends on m D. More force = less inertia

**📖 Q1 答案 || 📖 Q1 Answer**

**C**。惯性是物体的固有属性，只与质量有关，与速度、受力状态无关。

> **Q2**
> 5 kg 物体受 20 N 合力，加速度多大？ || 5 kg object with 20 N net force, find a.

**📖 Q2 答案 || 📖 Q2 Answer**

$$
a = \frac{F}{m} = \frac{20}{5} = 4 \text{ m/s}^2
$$

> **Q3**
> 马拉车前进时，马对车的力和车对马的力哪个大？ || Horse pulls cart forward. Which force is larger: horse-on-cart or cart-on-horse?

**📖 Q3 答案 || 📖 Q3 Answer**

一样大（牛顿第三定律）。马能前进是因为地面对马的摩擦力 > 车对马的拉力，对马的合力向前。 || Equal (Newton's 3rd Law). The horse moves because ground friction on horse > cart pulls horse backward.

::panel
### 进阶题（3 道） || Advanced (3)
> **Q4**
> 电梯以 2 m/s² 加速上升，60 kg 的人站在秤上，秤示数多少？（g=10 m/s²） || Elevator accelerates up at 2 m/s². Person 60 kg on scale. Reading? (g=10)

**📖 Q4 答案 || 📖 Q4 Answer**

$$
N = m(g+a) = 60 \times (10+2) = 720 \text{ N}
$$

超重状态：秤显示 72 kg（720/10）。 || Overweight: scale reads 72 kg (720/10).

> **Q5**
> 光滑面上 2 kg 和 3 kg 两物体紧贴，10 N 力推 2 kg 物体。求加速度和两物体间的力。 || Smooth surface: 2 kg and 3 kg in contact. 10 N pushes the 2 kg. Find a and contact force.

**📖 Q5 答案 || 📖 Q5 Answer**

整体：a = 10/(2+3) = 2 m/s²。隔离 3kg：N = 3×2 = 6 N。 || System: a = 10/5 = 2 m/s². Isolate 3 kg: N = 3×2 = 6 N.

> **Q6**
> 电梯自由落体时（a=−g），秤的示数是多少？人是否「漂浮」？ || Elevator in free fall (a=−g). Scale reading? Does the person float?

**📖 Q6 答案 || 📖 Q6 Answer**

$$
N = m(g + a) = m(g - g) = 0
$$

秤示数为 0，完全失重。人和电梯以相同加速度下落，没有相互挤压，像太空中一样「漂浮」。 || Scale reads 0, complete weightlessness. Person and elevator fall together — no contact force, like floating in space.

::panel
### 挑战题（2 道） || Challenge (2)
> **Q7**
> 倾角 30° 光滑斜面上 2 kg 物体，求加速度大小和方向。（g=10 m/s²） || 2 kg on 30° smooth incline. Find acceleration. (g=10)

**📖 Q7 答案 || 📖 Q7 Answer**

$$
a = g\sin 30° = 10 \times 0.5 = 5 \text{ m/s}^2
$$

方向沿斜面向下。法向：N = mg cos30° = 17.3 N，合力沿斜面方向。 || Direction: down the incline. Normal: N = mg cos30° = 17.3 N.

> **Q8**
> 竖直升降机中，弹簧秤吊着 2 kg 物体，示数 16 N。求电梯加速度大小和方向。（g=10 m/s²） || Spring scale in elevator reads 16 N for 2 kg. Find elevator acceleration. (g=10)

**📖 Q8 答案 || 📖 Q8 Answer**

mg = 20 N，示数 16 N < mg → 失重。 || mg = 20 N, reading 16 N < mg → underweight.

$$
T = m(g+a) \Rightarrow 16 = 2(10+a) \Rightarrow a = -2 \text{ m/s}^2
$$

a = −2 m/s²，方向向下（加速下降或减速上升）。 || a = −2 m/s², direction downward.
:::

## #roadmap 06 / Learning Roadmap :: 力学系列导航 || Mechanics Series Navigation

这是力学系列第 4 篇。你已掌握牛顿三大定律和整体法/隔离法。 || Part 4 of Mechanics. You've mastered Newton's three laws and system/isolation methods.

- [第 1 篇 || Part 1：运动的描述 || Describing Motion](../describing-motion/)
- [第 2 篇 || Part 2：匀变速直线运动 || Uniform Acceleration](../uniform-acceleration/)
- [第 3 篇 || Part 3：力与平衡 || Forces & Equilibrium](../forces-equilibrium/)
- **第 4 篇 · 当前 || Part 4 · Current：牛顿运动定律 || Newton's Laws**
- [第 5 篇 || Part 5：圆周运动 || Circular Motion](../circular-motion/)
- [第 6 篇 || Part 6：万有引力与航天 || Gravitation](../gravitation/)
- [第 7 篇 || Part 7：功与能 || Work & Energy](../work-energy/)
- [第 8 篇 || Part 8：动量 || Momentum](../momentum/)

:::callout { title: "下一篇预告 || Next Article Preview" }
第 5 篇将聚焦**圆周运动**——当物体沿曲线运动时，需要向心力 $F_c = m\\frac{v^2}{r}$ 不断改变速度方向。从过山车到人造卫星，理解圆周运动的动力学条件。 || Part 5: **Circular Motion** — centripetal force changes velocity direction. From roller coasters to satellites.
:::
