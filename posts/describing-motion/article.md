---
title: "运动的描述：位移、速度与加速度 || Describing Motion: Displacement, Velocity & Acceleration"
eyebrow: "力学 · 第 1 篇 / 共 8 篇 || Mechanics · Part 1 of 8"
brand: "力学 || Mechanics"
date: 2026-04-17
strict_i18n: false
strict_density: true
lead: "一切物理学的起点——如何精确描述物体的运动。从跑步计时到汽车仪表盘，建立位移、速度、加速度三大运动学量的直觉。 || The starting point of physics — how to precisely describe motion. Build intuition for displacement, velocity, and acceleration."
hero_actions:
  - "开始学习 || Start Learning | #scene"
  - "直接练习 || Go to Practice | #practice"
panel_label: "本章目标 || Chapter Goals"
panel_title: "建立运动的精确语言 || Build the Precise Language of Motion"
panel:
  - "区分路程与位移 || Distinguish distance from displacement"
  - "理解速度与速率的区别 || Understand velocity vs speed"
  - "掌握加速度的物理含义 || Master the meaning of acceleration"
  - "用运动学量解决实际问题 || Apply kinematic quantities to real problems"
metrics:
  - "核心概念 || Core Concepts | 6 | 运动学基本量 || Kinematic quantities"
  - "关键公式 || Key Formulas | 4 | 定义式 || Definitions"
  - "交互实验 || Interactive Labs | 2 | 位移 + 速度 || Displacement + Velocity"
  - "难度 || Difficulty | ★☆☆☆☆ | 零基础可学 || From scratch"
style:
  accent: "#0284c7"
---

## #scene 01 / Motion Is Everywhere :: 从「我跑得比你快」说起 || Starting from "I Run Faster Than You"

日常生活中我们随时在谈论运动。但物理学要求更精确——快在哪？怎么量？ || We talk about motion daily. But physics demands precision.

:::accordion
::panel { open: true }
### 三个让你重新认识运动的问题 || Three Questions That Redefine Motion
- **操场跑一圈回到起点 || One Lap Around the Track** — 你跑了 400 m 回到起点。路程 = 400 m，但位移 = 0！因为起终点重合。 || 400 m lap back to start: distance = 400 m, displacement = 0!
- **仪表盘上的两个数字 || Two Dashboard Numbers** — 速度表显示瞬时速率，里程表记录总路程。两者都不包含方向信息。 || Speedometer = instantaneous speed; odometer = total distance. Neither includes direction.
- **火箭升空前 10 秒 || First 10 Seconds of Launch** — 火箭从静止加速。「越来越快」——用加速度来量化这种变化的快慢。 || Rocket accelerates from rest. Acceleration quantifies how quickly speed changes.

::panel
### 🧪 交互实验：位移与路程 || 🧪 Lab: Displacement vs Distance
拖动滑块让小球在数轴上运动。观察「位移」和「路程」的实时变化——折返时路程继续增加但位移可能减小！ || Drag the slider to move the ball. Watch displacement and distance change in real time — when reversing, distance grows but displacement may shrink!

> **🧪 交互实验沙盒 || Interactive Simulation Sandbox** (`#sim-displacement`) — 交互可调参数：位置： || Position:。
:::

## #concepts 02 / Precise Language :: 运动学基本量 || Fundamental Kinematic Quantities

:::accordion
::panel { open: true }
### 参考系与质点 || Reference Frame & Particle
1

**参考系：运动是相对的 || Reference Frame: Motion Is Relative**

坐在火车上你相对火车静止、相对地面高速运动。描述运动前必须先选参考系（通常选地面）。 || On a train: still relative to train, fast relative to ground. Pick a frame first (usually ground).

2

**质点模型 || Particle Model**

物体大小远小于运动范围时可看做一个点。地球绕太阳 → 质点；研究自转 → 不行。 || When object size is tiny compared to motion range, treat as a point.

::panel
### 路程与位移 || Distance vs Displacement
| 比较 || Compare | 路程 s || Distance s | 位移 Δx || Displacement Δx |
| --- | --- | --- |
| 定义 || Def | 路径总长度 || Total path length | 起→终直线距离（含方向） || Start→end straight line (with direction) |
| 类型 || Type | 标量 || Scalar | 矢量 || Vector |
| 能否为零 || Can be 0? | 运动就不为零 || Non-zero if moved | 回到起点就为零 || Zero if returned to start |

::panel
### 速度与速率 || Velocity vs Speed
$$
\vec{v} = \frac{\Delta \vec{x}}{\Delta t}
$$

> **📐 公式解读 || 📐 Formula Breakdown**
> 速度 = 位移 ÷ 时间。位移 Δx 是矢量 → 速度也是矢量（有大小和方向）。仪表盘显示的是速率 = 路程 / 时间（标量，只有大小）。 || Velocity = displacement ÷ time. Displacement is a vector → velocity is also a vector. Dashboard shows speed = distance/time (scalar).
> 当 Δt 趋近于零时，平均速度变为瞬时速度。高铁全程平均 293 km/h，但某瞬间可能 350 km/h。 || As Δt → 0, average velocity becomes instantaneous velocity.

::panel
### 加速度 || Acceleration
$$
\vec{a} = \frac{\Delta \vec{v}}{\Delta t} = \frac{v - v_0}{t}
$$

> **📐 物理含义 || 📐 Physical Meaning**
> 加速度 = 单位时间内速度的变化量。单位 m/s²，读作「米每秒平方」——每秒速度增加多少。 || Acceleration = velocity change per unit time. Unit: m/s² — how many m/s velocity changes each second.
> 加速度是矢量。方向与速度同向 → 加速；反向 → 减速。刹车时 a 不为零，只是方向与运动相反。 || Acceleration is a vector. Same direction as v → speeding up; opposite → slowing down.

> **常见误区 || Common Misconception**
> 「加速度大 = 速度大」是错的！匀速 120 km/h 的卡车 a=0；起步自行车 5 km/h 时 a 可能 2 m/s²。加速度描述变化率，不是大小。 || 'High a = high v' is wrong! Truck at constant 120 km/h: a=0; starting bicycle at 5 km/h: a ≈ 2 m/s².
:::

## #deep 03 / Vector Thinking :: 方向为什么重要？ || Why Direction Matters

:::accordion
::panel
### 矢量 vs 标量速查 || Vector vs Scalar Quick Ref
| 物理量 || Qty | 类型 || Type | 方向 || Dir? | 单位 || Unit |
| --- | --- | --- | --- |
| 路程 || Distance | 标量 || Scalar | ✗ | m |
| 位移 || Displacement | 矢量 || Vector | ✓ | m |
| 速率 || Speed | 标量 || Scalar | ✗ | m/s |
| 速度 || Velocity | 矢量 || Vector | ✓ | m/s |
| 加速度 || Acceleration | 矢量 || Vector | ✓ | m/s² |

::panel
### 🧪 交互实验：加速与减速 || 🧪 Lab: Acceleration & Deceleration
设置初速度和加速度，点击「开始」观察小球运动与速度箭头变化。正加速度 → 加速；负加速度 → 减速；a=0 → 匀速。 || Set v₀ and a, click Start. Positive a → speed up; negative a → slow down; a=0 → constant.

> **🧪 交互实验沙盒 || Interactive Simulation Sandbox** (`#sim-acceleration`) — 交互可调参数：$v_0$：、$a$：。
:::

## #practice 04 / Enhanced Practice :: 先做后查 || Try First, Then Check

先独立思考，再展开答案自查。 || Think first, expand answers to check.

:::accordion
::panel { open: true }
### 基础题（3 道） || Basic (3)
> **Q1 — 概念辨析**
> 正确的是？A. 速度大→加速度大 B. 位移大→路程大 C. a 与 v 同向→加速 D. v=0→a=0 || Correct? A. High v → high a B. Large disp → large dist C. a same dir as v → accel D. v=0 → a=0

**📖 Q1 答案 || 📖 Q1 Answer**

**C**。A 错：匀速时 a=0；B 错：路程 ≥ |位移|；D 错：最高点 v=0 但 a=g。

> **Q2 — 单位换算**
> 72 km/h = ? m/s

**📖 Q2 答案 || 📖 Q2 Answer**

$$
72 \div 3.6 = 20 \text{ m/s}
$$

记住：km/h → m/s 除以 3.6。 || Remember: ÷ 3.6.

> **Q3 — 路程与位移**
> 先向东 3 m，再向西 5 m。求路程和位移。 || 3 m east, then 5 m west. Find distance and displacement.

**📖 Q3 答案 || 📖 Q3 Answer**

路程 = 3 + 5 = **8 m**。位移 = 3 − 5 = **−2 m（向西 2 m）**。

::panel
### 进阶题（3 道） || Advanced (3)
> **Q4 — 平均速度陷阱**
> 前半段路程 4 m/s，后半段 6 m/s。全程平均速率？（≠ 5！） || First half at 4 m/s, second half 6 m/s. Average speed? (≠ 5!)

**📖 Q4 答案 || 📖 Q4 Answer**

$$
\bar{v} = \frac{2s}{\frac{s}{4}+\frac{s}{6}} = \frac{2}{\frac{1}{4}+\frac{1}{6}} = \frac{24}{5} = 4.8 \text{ m/s}
$$

按路程分段用调和平均，不是算术平均！ || Equal-distance → harmonic mean, not arithmetic!

> **Q5 — 加速度计算**
> 跑车 0 → 108 km/h 用 6 s，求 a。 || Car 0→108 km/h in 6 s, find a.

**📖 Q5 答案 || 📖 Q5 Answer**

108 km/h = 30 m/s

$$
a = \frac{30 - 0}{6} = 5 \text{ m/s}^2
$$

> **Q6 — 减速方向**
> 汽车 20 m/s 向东刹车 4 s 停下。求 a 的大小和方向。 || Car 20 m/s east, stops in 4 s. Find a.

**📖 Q6 答案 || 📖 Q6 Answer**

$$
a = \frac{0 - 20}{4} = -5 \text{ m/s}^2
$$

大小 5 m/s²，方向向西。负号 = 与正方向相反 = 减速。 || Magnitude 5 m/s², direction west. Negative = opposite to positive direction.
:::

## #roadmap 05 / Learning Roadmap :: 力学系列导航 || Mechanics Series Navigation

这是力学系列第 1 篇。你已掌握位移、速度、加速度的基本概念。 || Part 1 of Mechanics. You've mastered displacement, velocity, and acceleration.

- **第 1 篇 · 当前 || Part 1 · Current：运动的描述 || Describing Motion**
- [第 2 篇 || Part 2：匀变速直线运动 || Uniform Acceleration](../uniform-acceleration/)
- [第 3 篇 || Part 3：力与平衡 || Forces & Equilibrium](../forces-equilibrium/)
- [第 4 篇 || Part 4：牛顿运动定律 || Newton's Laws](../newtons-laws/)
- [第 5 篇 || Part 5：圆周运动 || Circular Motion](../circular-motion/)
- [第 6 篇 || Part 6：万有引力与航天 || Gravitation](../gravitation/)
- [第 7 篇 || Part 7：功与能 || Work & Energy](../work-energy/)
- [第 8 篇 || Part 8：动量 || Momentum](../momentum/)

:::callout { title: "下一篇预告 || Next Article Preview" }
第 2 篇将聚焦**匀变速直线运动**——当加速度恒定时，三大公式 $v = v_0 + at$、$x = v_0 t + \\frac{1}{2}at^2$、$v^2 = v_0^2 + 2ax$ 将解决自由落体、刹车距离和追及问题。 || Part 2: **uniform acceleration** — three equations to solve free fall, braking, and chase problems.
:::
