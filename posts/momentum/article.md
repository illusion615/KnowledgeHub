---
title: "动量：碰撞中的守恒与变化 || Momentum: Conservation and Change in Collisions"
eyebrow: "力学 · 第 8 篇 / 共 8 篇 || Mechanics · Part 8 of 8"
brand: "力学 || Mechanics"
date: 2026-04-17
strict_i18n: true
strict_density: true
lead: "从台球碰撞、汽车缓冲到反冲与分裂，用动量和冲量分析速度的变化，再用动能判断碰撞类型。 || Analyze collisions, cushioning, recoil, and separation using momentum and impulse; use kinetic energy to distinguish collision types."
hero_actions:
  - "开始学习 || Start Learning | #momentum-impulse"
  - "直接练习 || Go to Practice | #practice"
panel_label: "学习目标 || Learning Goals"
panel_title: "从动量到碰撞守恒 || From Momentum to Collision Conservation"
panel:
  - "掌握动量 p = mv 与冲量 I = FΔt || Use momentum p = mv and impulse I = FΔt"
  - "由 F = ma 推导动量定理 || Derive the impulse-momentum theorem from F = ma"
  - "判断系统和各方向的动量守恒条件 || Check conservation for the system and for each direction"
  - "区分碰撞类型，求解反冲与分裂问题 || Distinguish collision types and solve recoil and separation problems"
metrics:
  - "核心公式 || Core Formula | p = mv | 动量定义 || Momentum"
  - "关键定理 || Key Theorem | I = Δp | 冲量等于动量变化 || Impulse Equals Momentum Change"
  - "交互实验 || Interactive Lab | 1 | 两种碰撞模式 || Two Collision Modes"
  - "练习题 || Worked Problems | 8 + 7 | 主练习与补充练习 || Core and Supplementary"
style:
  accent: "#0284c7"
---

## #momentum-impulse 01 / Momentum and Impulse :: 用冲量计算动量的变化 || Use Impulse to Calculate Momentum Change

动量 p = mv 是有方向的运动状态量；冲量描述合外力在一段时间内改变动量的效果。 || Momentum p = mv is a vector describing motion. Impulse measures how a net force changes momentum over time.

:::accordion
::panel { open: true }
### 动量是矢量 || Momentum Is a Vector
动量的方向与速度相同，单位为 kg·m/s；计算总动量时必须按方向相加。 || Momentum has the direction of velocity and units of kg·m/s. Total momentum is a vector sum.

$$
p = mv
$$

**质量与速度共同决定动量 || Mass and Velocity Set Momentum**

1000 kg 的汽车以 20 m/s 行驶，动量为 20,000 kg·m/s。同速时，重卡的动量大于自行车。 || A 1000 kg car at 20 m/s has momentum 20,000 kg·m/s. At the same speed, a heavy truck has more momentum than a bicycle.

**小质量也可以有较大动量 || High Speed Can Offset Small Mass**

0.01 kg 的子弹以 800 m/s 飞行，动量为 8 kg·m/s。同一物体速度加倍，动量也加倍。 || A 0.01 kg bullet at 800 m/s has momentum 8 kg·m/s. Doubling an object's velocity doubles its momentum.

> **动量与动能不能互相替代 || Momentum and Kinetic Energy Are Different**
> p = mv 是矢量，Eₖ = ½mv² 是标量。两个等质量物体等速反向运动时，总动量为零，总动能却大于零；动能衡量做功能力。 || p = mv is a vector; Eₖ = ½mv² is a scalar measuring the capacity to do work. Equal masses moving at equal speeds in opposite directions have zero total momentum but positive total kinetic energy.

::panel
### 由 F = ma 推导冲量与动量定理 || Derive Impulse-Momentum from F = ma
冲量 I 的单位是 N·s = kg·m/s。质量不变时，合外力的冲量等于动量变化量；F 表示恒力或这段时间内的平均合力。 || Impulse I has units N·s = kg·m/s. For constant mass, net impulse equals momentum change; F denotes a constant net force or its average over the interval.

$$
I = F\Delta t = \Delta p = mv' - mv
$$

$$
F = m\frac{\Delta v}{\Delta t} \implies F\Delta t = m\Delta v = \Delta p
$$

由 a = Δv/Δt 代入 F = ma 得到上述关系。Δp 的方向与合外力的冲量方向相同。 || Substitute a = Δv/Δt into F = ma. The momentum change has the same direction as the net impulse.

**手套、气囊与安全带延长缓冲时间 || Gloves, Airbags, and Seatbelts Extend Stopping Time**

给定相同的 Δp，延长减速时间可减小平均冲击力。拳击手套、安全气囊、安全带和跳高海绵垫都利用这一原理。 || For the same Δp, a longer stopping time reduces the average impact force. Boxing gloves, airbags, seatbelts, and landing mats use this principle.

**同样的冲量，时间越短平均力越大 || The Same Impulse over Less Time Means More Force**

平均力 F = Δp/Δt。若动量变化固定为 10 kg·m/s，作用 0.1 s 的平均力为 100 N，作用 0.01 s 则为 1000 N；不能仅凭接触时间判断冲量。 || Average force is F = Δp/Δt. An impulse of 10 kg·m/s over 0.1 s means 100 N; over 0.01 s it means 1000 N. Contact time alone does not determine impulse.
:::

## #conservation 02 / Conservation of Momentum :: 先检查系统受到的外力冲量 || Check the System's External Impulse First

系统总动量的变化等于外力的总冲量。外力冲量为零时总动量不变；碰撞前后必须使用同一系统、同一参考系。 || A system's momentum change equals its net external impulse. Zero external impulse preserves total momentum; compare the same system in the same reference frame before and after impact.

:::accordion
::panel { open: true }
### 守恒条件与公式 || Conservation Conditions and Formula
忽略外力冲量的两物体系统，碰前与碰后的总动量相等；一维速度的正负号表示方向。 || For two objects with negligible external impulse, total momentum before and after impact is equal. Signed velocities encode direction in one dimension.

$$
m_1 v_1 + m_2 v_2 = m_1 v_1' + m_2 v_2'
$$

1. **系统不受外力 || No External Forces** — 完全孤立的系统总动量严格守恒，内部作用力只在物体之间交换动量。 || An isolated system conserves total momentum. Internal forces exchange momentum between its objects.
2. **合外力为零 || Zero Net External Force** — 有外力但矢量和为零也可守恒，例如光滑水平面上重力与支持力抵消。 || External forces may cancel: gravity and the normal force balance on a frictionless horizontal surface.
3. **短时碰撞中外力冲量可忽略 || Negligible External Impulse during a Brief Collision** — 碰撞内力远大于摩擦力等外力时，通常可近似守恒；需限定在短暂碰撞过程，而非之后的全部运动。 || Impact forces often dominate friction, allowing approximate conservation during the short collision, not necessarily throughout later motion.

::panel
### 分方向守恒、反冲与喷气推进 || Directional Conservation, Recoil, and Propulsion
某一方向上的外力冲量为零，该方向的动量就守恒；例如忽略空气阻力时，重力不改变系统的水平总动量。 || Momentum is conserved in any direction with zero external impulse. With air resistance neglected, gravity does not change a system's total horizontal momentum.

**枪的反冲 || Gun Recoil**

发射前枪与子弹静止，总动量为零。子弹向前、枪向后，两者动量相抵；忽略外力冲量且子弹动量相同时，枪越重，后坐速度越小。 || Initially, gun and bullet have zero total momentum. Forward bullet momentum balances backward gun momentum. With negligible external impulse and the same bullet momentum, a heavier gun recoils more slowly.

**火箭推进 || Rocket Propulsion**

把火箭与喷出气体共同作为系统：气体获得向后的动量，火箭获得向前的动量。火箭在真空中也能加速，不需要依靠空气或地面。 || Treat rocket and exhaust together as the system. Exhaust gains backward momentum while the rocket gains forward momentum. A rocket can accelerate in vacuum without pushing on air or the ground.

::panel
### 碰撞模拟器 || Collision Simulator
取向右为正，调整质量与初速度后选择一种碰撞。模拟忽略外力，抵达画布边缘即停止，不加入墙壁反弹的外力冲量。 || Right is positive. Set masses and initial velocities, then choose a collision mode. No external force is modeled; animation stops at the canvas edge instead of adding a wall impulse.

> **🧪 One-dimensional collision of two labeled masses** (`#collisionCanvas`) — 交互可调参数：m₁ (kg)、v₁ (m/s)、m₂ (kg)、v₂ (m/s)。
:::

## #collision-types 03 / Collision Types :: 动能与恢复系数区分碰撞类型 || Classify Collisions by Energy and Restitution

对外力冲量可忽略的系统，三类碰撞均守恒动量；只有弹性碰撞守恒动能。以下讨论普通的一维碰撞，不含爆炸增能。 || With negligible external impulse, all three collision types conserve momentum; only elastic collisions conserve kinetic energy. The following describes ordinary one-dimensional collisions, excluding explosive energy release.

:::accordion
::panel { open: true }
### 三类碰撞对比 || Compare Three Collision Types
在给定碰前状态下，碰后共同运动的完全非弹性碰撞损失动能最多；减少的动能转为变形、内能和声音等。 || For fixed initial conditions, a perfectly inelastic collision loses the most kinetic energy. Lost kinetic energy becomes deformation, internal energy, sound, and other forms.

| 类型 || Type | 动量 || Momentum | 动能 || Kinetic Energy | 碰后状态 || After Collision | 示例 || Example |
| --- | --- | --- | --- | --- |
| 弹性碰撞 || Elastic | 守恒 || Conserved | 守恒 || Conserved | 分离 || Separate | 台球（近似）、理想分子碰撞 || Billiards (approximately), ideal molecular collisions |
| 非弹性碰撞 || Inelastic | 守恒 || Conserved | 减少 || Decreases | 分离 || Separate | 汽车碰撞后变形 || Deformation in a car crash |
| 完全非弹性 || Perfectly Inelastic | 守恒 || Conserved | 损失最大 || Maximum Loss | 粘合、同速 || Stick, Same Velocity | 子弹嵌入木块 || Bullet embedding in wood |

::panel
### 恢复系数与共同速度 || Restitution and Common Velocity
恢复系数 e 是碰后分离速度与碰前接近速度之比；取物体 1 在左、物体 2 在右且 v₁ > v₂，使用同一正方向。 || The coefficient of restitution e is separation speed divided by approach speed. Object 1 starts on the left, object 2 on the right, with v₁ > v₂ and a common positive direction.

$$
e = \frac{v_2' - v_1'}{v_1 - v_2}
$$

1. **e = 1：弹性碰撞 || e = 1: Elastic Collision** — 分离速度等于接近速度，动能守恒。 || Separation speed equals approach speed; kinetic energy is conserved.
2. **0 < e < 1：非弹性碰撞 || 0 < e < 1: Inelastic Collision** — 分离速度小于接近速度，部分动能转为内能、声音等。 || Separation is slower than approach; some kinetic energy becomes internal energy, sound, and other forms.
3. **e = 0：完全非弹性碰撞 || e = 0: Perfectly Inelastic Collision** — 两物体碰后速度相同，由动量守恒求共同速度。 || Both objects have the same final velocity, obtained from momentum conservation.

$$
v' = \frac{m_1v_1 + m_2v_2}{m_1 + m_2}
$$

::panel
### 一维弹性碰撞公式 || One-Dimensional Elastic Collision Formulas
联立动量与动能守恒可求碰后速度；以下速度均为带正负号的一维分量。 || Solve momentum and kinetic-energy conservation together for the final velocities; all velocities below are signed one-dimensional components.

$$
v_1' = \frac{m_1-m_2}{m_1+m_2}v_1 + \frac{2m_2}{m_1+m_2}v_2
$$

$$
v_2' = \frac{2m_1}{m_1+m_2}v_1 + \frac{m_2-m_1}{m_1+m_2}v_2
$$

> **等质量弹性正碰交换速度 || Equal Masses Exchange Velocities**
> m₁ = m₂ 时，v₁' = v₂，v₂' = v₁。若第二个球静止，第一个球停下，第二个球以原速度离开；这是理想牛顿摆中动量传递的基础。 || If m₁ = m₂, then v₁' = v₂ and v₂' = v₁. If the second ball starts at rest, the first stops and the second leaves at the first ball's initial velocity, underlying momentum transfer in an ideal Newton's cradle.
:::

## #practice 04 / Worked Problems :: 8 道主练习，7 道补充练习 || Eight Core and Seven Supplementary Problems

先统一正方向、选定系统，再判断使用冲量、动量守恒还是机械能守恒。每题解析可单独展开；反冲题中的速度均相对地面。 || Choose a positive direction and system, then decide whether impulse, momentum conservation, or mechanical-energy conservation applies. Reveal each solution separately; recoil velocities are relative to the ground.

:::accordion
::panel { open: true }
### 基础题（3 题） || Basic Problems (3)
先练习动量、冲量与平均力的直接计算。 || Start by calculating momentum, impulse, and average force directly.

**题 1：求动量 || Q1: Find Momentum**

质量 0.5 kg 的球以 10 m/s 向右运动，求其动量大小和方向。 || A 0.5 kg ball moves right at 10 m/s. Find its momentum magnitude and direction.

**查看解析 || Show Solution**

p = mv = 0.5 × 10 = 5 kg·m/s，方向向右。 || p = mv = 0.5 × 10 = 5 kg·m/s, to the right.

**题 2：求冲量 || Q2: Find Impulse**

恒力 F = 20 N 作用在物体上持续 0.5 s，求冲量。 || A constant force F = 20 N acts for 0.5 s. Find the impulse.

**查看解析 || Show Solution**

I = FΔt = 20 × 0.5 = 10 N·s，方向与力相同。 || I = FΔt = 20 × 0.5 = 10 N·s, in the direction of the force.

**题 3：动量定理求力 || Q3: Find Average Force**

质量 0.15 kg 的棒球由静止被击至 30 m/s，接触时间 0.01 s，求击球的平均合力。 || A 0.15 kg baseball is hit from rest to 30 m/s in 0.01 s. Find the average net force.

**查看解析 || Show Solution**

Δp = 0.15 × 30 = 4.5 kg·m/s。F = Δp/Δt = 4.5/0.01 = 450 N。 || Δp = 0.15 × 30 = 4.5 kg·m/s. F = Δp/Δt = 4.5/0.01 = 450 N.

::panel
### 进阶题（3 题） || Advanced Problems (3)
在光滑水平面或冰面上选定完整系统，比较碰撞和反冲。 || Choose the full system on a frictionless surface and compare collisions with recoil.

**题 4：子弹嵌入小车 || Q4: Bullet Embeds in a Cart**

2 kg 的小车静止在光滑水平面上，0.01 kg 的子弹以 400 m/s 射入并嵌入小车，求共同速度。 || A 0.01 kg bullet at 400 m/s embeds in a stationary 2 kg cart on a frictionless horizontal surface. Find their common velocity.

**查看解析 || Show Solution**

完全非弹性碰撞：0.01 × 400 = (0.01 + 2)v'，v' = 4/2.01 ≈ 1.99 m/s，方向与子弹原方向相同。 || Perfectly inelastic: 0.01 × 400 = (0.01 + 2)v', so v' = 4/2.01 ≈ 1.99 m/s in the bullet's initial direction.

**题 5：冰面抛球反冲 || Q5: Recoil on Ice**

50 kg 的人起初静止在光滑冰面上，将 0.5 kg 的球以相对地面 20 m/s 水平抛出，求人的反冲速度。 || An initially stationary 50 kg person on frictionless ice throws a 0.5 kg ball horizontally at 20 m/s relative to the ground. Find the person's recoil velocity.

**查看解析 || Show Solution**

初动量为零：0 = 0.5 × 20 + 50v，v = −0.2 m/s，即人以 0.2 m/s 向抛球的反方向运动。 || Initial momentum is zero: 0 = 0.5 × 20 + 50v, so v = −0.2 m/s, opposite to the throw.

**题 6：等质量弹性正碰 || Q6: Equal-Mass Elastic Collision**

2 kg 的球 A 以 4 m/s 向右运动，与静止的 2 kg 球 B 发生弹性正碰，求碰后两球速度。 || A 2 kg ball A moving right at 4 m/s collides elastically head-on with a stationary 2 kg ball B. Find both final velocities.

**查看解析 || Show Solution**

等质量弹性正碰交换速度：A 的 v₁' = 0，B 的 v₂' = 4 m/s，方向向右。 || Equal masses exchange velocities: A has v₁' = 0; B has v₂' = 4 m/s to the right.

::panel
### 挑战题（2 题） || Challenge Problems (2)
把短暂碰撞与之后的运动分开，或对爆炸前后分别列动量方程。 || Separate a brief collision from subsequent motion, or write momentum equations before and after an explosion.

**题 7：弹道摆的两阶段分析 || Q7: Two Stages of a Ballistic Pendulum**

质量 m 的球以水平速度 v 嵌入静止悬挂的 3m 沙袋。忽略空气阻力和摆动摩擦，求整体摆起的最大高度；g = 10 m/s²。 || A ball of mass m at horizontal speed v embeds in a stationary hanging sandbag of mass 3m. Neglect air resistance and swing friction. Find the maximum rise; g = 10 m/s².

**查看解析 || Show Solution**

碰撞瞬间水平方向动量守恒：mv = 4mv'，v' = v/4。随后摆起阶段机械能守恒：½(4m)v'² = (4m)gh，h = v²/(32g) = v²/320。不能对非弹性碰撞阶段使用机械能守恒。 || During impact, horizontal momentum gives mv = 4mv', hence v' = v/4. During the swing, mechanical energy gives ½(4m)v'² = (4m)gh, so h = v²/(32g) = v²/320 in SI units. Mechanical energy is not conserved during the inelastic impact.

**题 8：运动炮弹分裂 || Q8: Separation of a Moving Shell**

10 kg 的炮弹以 100 m/s 水平飞行，瞬间炸成两块。4 kg 的前块以 250 m/s 沿原方向飞行，求另一块爆炸瞬间的水平速度。 || A 10 kg shell moving horizontally at 100 m/s splits instantaneously. A 4 kg piece continues at 250 m/s. Find the other piece's horizontal velocity immediately after the explosion.

**查看解析 || Show Solution**

水平方向动量守恒：10 × 100 = 4 × 250 + 6v₂，故 v₂ = 0。该块爆炸瞬间水平速度为零，之后仍受重力作用。 || Horizontal momentum: 10 × 100 = 4 × 250 + 6v₂, giving v₂ = 0. Its horizontal velocity is momentarily zero; gravity still acts afterward.

::panel
### 补充：冲量、方向与反冲（3 题） || Supplement: Impulse, Direction, and Recoil (3)
用更短的作用时间、速度反向和枪的反冲检验正负号。 || Check signs using a shorter impulse, a reversing velocity, and gun recoil.

**补充 1：短时冲量 || S1: A Brief Impulse**

一个球受到 50 N 的恒力，持续 0.02 s，求该力的冲量。 || A constant 50 N force acts on a ball for 0.02 s. Find its impulse.

**查看解析 || Show Solution**

I = FΔt = 50 × 0.02 = 1 N·s = 1 kg·m/s，方向与力相同。 || I = FΔt = 50 × 0.02 = 1 N·s = 1 kg·m/s, in the force's direction.

**补充 2：反弹球的动量变化 || S2: Momentum Change of a Bouncing Ball**

0.2 kg 的橡皮球以 5 m/s 向右撞墙，再以 4 m/s 向左反弹。求动量变化量和墙对球的冲量。 || A 0.2 kg ball hits a wall at 5 m/s to the right and rebounds at 4 m/s to the left. Find the momentum change and the wall's impulse on the ball.

**查看解析 || Show Solution**

向右为正：p₁ = 0.2 × 5 = 1，p₂ = 0.2 × (−4) = −0.8 kg·m/s。Δp = −0.8 − 1 = −1.8 kg·m/s。墙对球的冲量为 −1.8 N·s，即向左 1.8 N·s。 || Right is positive: p₁ = 1 and p₂ = −0.8 kg·m/s. Δp = −0.8 − 1 = −1.8 kg·m/s. The wall's impulse is −1.8 N·s, or 1.8 N·s to the left.

**补充 3：枪的后坐速度 || S3: Gun Recoil Velocity**

起初静止的 4 kg 枪发射 0.02 kg 子弹，子弹相对地面速度为 600 m/s。忽略发射过程的外力冲量，求枪的后坐速度。 || An initially stationary 4 kg gun fires a 0.02 kg bullet at 600 m/s relative to the ground. Neglect external impulse during firing. Find the recoil velocity.

**查看解析 || Show Solution**

初动量为零：0 = 4v + 0.02 × 600，v = −3 m/s，枪以 3 m/s 向后运动。 || Initial momentum is zero: 0 = 4v + 0.02 × 600, giving v = −3 m/s, or 3 m/s backward.

::panel
### 补充：碰撞、能量与分裂（4 题） || Supplement: Collision, Energy, and Separation (4)
保持动量与能量的计算分开，并用两种守恒量交叉核对弹性碰撞。 || Keep momentum and energy calculations separate, and cross-check an elastic collision with both conservation laws.

**补充 4：粘合后的共同速度 || S4: Common Velocity after Sticking**

光滑水平面上，2 kg 的球 A 以 6 m/s 向右碰上静止的 3 kg 球 B，两球粘合。求共同速度。 || On a frictionless horizontal surface, a 2 kg ball A at 6 m/s to the right hits a stationary 3 kg ball B and sticks to it. Find their common velocity.

**查看解析 || Show Solution**

2 × 6 = (2 + 3)v'，v' = 12/5 = 2.4 m/s，方向向右。 || 2 × 6 = (2 + 3)v', so v' = 12/5 = 2.4 m/s to the right.

**补充 5：粘合碰撞的动能损失 || S5: Kinetic-Energy Loss after Sticking**

沿用补充 4 的质量与速度：2 kg 球以 6 m/s 碰上静止的 3 kg 球，粘合后速度 2.4 m/s。求动能损失及比例。 || Use S4: a 2 kg ball at 6 m/s sticks to a stationary 3 kg ball, with final speed 2.4 m/s. Find the kinetic-energy loss and its fraction.

**查看解析 || Show Solution**

碰前 Eₖ = ½ × 2 × 6² = 36 J；碰后 Eₖ' = ½ × 5 × 2.4² = 14.4 J。损失 21.6 J，即 60%，转化为变形和内能等。 || Before: Eₖ = ½ × 2 × 6² = 36 J. After: Eₖ' = ½ × 5 × 2.4² = 14.4 J. The loss is 21.6 J (60%), converted to deformation, internal energy, and other forms.

**补充 6：不等质量弹性正碰 || S6: Unequal-Mass Elastic Collision**

1 kg 的球 A 以 4 m/s 向右与静止的 3 kg 球 B 发生弹性正碰，求两球末速度，并核对动量和动能。 || A 1 kg ball A at 4 m/s to the right collides elastically head-on with a stationary 3 kg ball B. Find the final velocities and check momentum and kinetic energy.

**查看解析 || Show Solution**

v₁' = (1 − 3) × 4/(1 + 3) = −2 m/s，v₂' = 2 × 1 × 4/4 = 2 m/s。动量：4 = −2 + 6 kg·m/s；动能：8 = 2 + 6 J。A 向左反弹，B 向右运动。 || v₁' = (1 − 3) × 4/(1 + 3) = −2 m/s; v₂' = 2 × 1 × 4/4 = 2 m/s. Momentum: 4 = −2 + 6 kg·m/s. Kinetic energy: 8 = 2 + 6 J. A rebounds left; B moves right.

**补充 7：最高点的烟花分裂 || S7: Firework Separation at the Peak**

10 kg 的烟花弹竖直上升到最高点，速度为零。瞬间爆炸成两块，4 kg 的一块以 15 m/s 水平向右飞出，求另一块的水平速度。 || A 10 kg firework reaches the peak of its vertical ascent with zero velocity and splits instantaneously. A 4 kg piece moves horizontally right at 15 m/s. Find the other piece's horizontal velocity.

**查看解析 || Show Solution**

水平初动量为零：0 = 4 × 15 + 6v₂，v₂ = −10 m/s。另一块以 10 m/s 水平向左飞出。 || Initial horizontal momentum is zero: 0 = 4 × 15 + 6v₂, hence v₂ = −10 m/s, or 10 m/s to the left.
:::

## #roadmap 05 / Series Navigation :: 力学系列全览 || Mechanics Series Overview

按运动、力、能量、动量的顺序复习这 8 篇入门文章；功与能是分析碰撞后摆动的基础。 || Review these eight introductory articles from motion to forces, energy, and momentum. Work and energy provide the basis for analyzing the swing after an impact.

:::comparison
::versus 第 1 篇 || Part 1
### 运动的描述 || Describing Motion

::versus 第 2 篇 || Part 2
### 匀变速直线运动 || Uniform Acceleration

::versus 第 3 篇 || Part 3
### 力与平衡 || Forces and Equilibrium

::versus 第 4 篇 || Part 4
### 牛顿运动定律 || Newton's Laws

::versus 第 5 篇 || Part 5
### 圆周运动 || Circular Motion

::versus 第 6 篇 || Part 6
### 万有引力 || Gravitation

::versus 第 7 篇 || Part 7
### 功与能 || Work and Energy

::versus 第 8 篇 || Part 8
### 动量（当前） || Momentum (Current)
:::

:::callout { title: "力学入门系列已完结 || Mechanics Introductory Series Complete" }
从运动的描述到动量守恒，完成 8 篇学习后可用练习检验掌握程度，再继续学习热学或电磁学。 || After these eight articles, use the exercises to check your understanding of motion through momentum conservation, then continue with thermodynamics or electromagnetism.
:::
