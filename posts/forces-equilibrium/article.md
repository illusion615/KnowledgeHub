---
title: "力与平衡：重力、弹力、摩擦力 || Forces & Equilibrium"
eyebrow: "力学 · 第 3 篇 / 共 8 篇 || Mechanics · Part 3 of 8"
brand: "力学 || Mechanics"
date: 2026-04-17
strict_i18n: false
strict_density: true
lead: "三种常见力的本质与计算，受力分析四步法，力的合成与分解——牛顿运动定律的基石。 || Three common forces, four-step force analysis, composition & decomposition — the foundation for Newton's laws."
hero_actions:
  - "开始学习 || Start Learning | #forces"
  - "直接练习 || Go to Practice | #practice"
panel_label: "本章目标 || Chapter Goals"
panel_title: "建立受力分析的完整能力 || Build Complete Force Analysis Skills"
panel:
  - "理解重力、弹力、摩擦力的本质 || Understand gravity, elastic force, and friction"
  - "掌握受力分析四步法 || Master the four-step force analysis method"
  - "用平行四边形法则合成与分解力 || Compose & decompose forces via parallelogram rule"
  - "应用共点力平衡条件解题 || Apply concurrent force equilibrium to solve problems"
metrics:
  - "核心公式 || Core Formulas | 4 | 力学方程 || Force equations"
  - "关键常数 || Key Constant | g | 9.8 N/kg"
  - "交互实验 || Interactive Labs | 1 | 斜面分解模拟 || Incline Decomposition"
  - "难度 || Difficulty | ★★★☆☆ | 需要画图 || Drawing required"
style:
  accent: "#0284c7"
---

## #forces 01 / Three Forces :: 重力、弹力与摩擦力 || Gravity, Elastic Force & Friction

高中力学中最常见的三种力——几乎所有受力分析题都从这三种力开始。 || The three most common forces in mechanics — nearly every force analysis starts here.

:::accordion
::panel { open: true }
### 重力 G = mg || Gravity G = mg
重力是地球对物体的引力在地球表面的分量，方向竖直向下，作用点在重心。 || Gravity is the component of Earth's gravitational attraction at the surface, directed vertically downward, acting at the center of gravity.

$$
G = mg
$$

> **📐 公式解读 || 📐 Formula Breakdown**
> g 的来源：万有引力定律 F = GMm/R²，在地球表面 mg ≈ GMm/R²，因此 g = GM/R²≈ 9.8 m/s²。g 随纬度和海拔略有变化，赤道最小（约 9.78），两极最大（约 9.83）。 || Origin of g: from F = GMm/R² at Earth's surface, mg ≈ GMm/R², so g = GM/R² ≈ 9.8 m/s². g varies slightly with latitude and altitude.
> 重力不等于万有引力：由于地球自转，重力 = 万有引力 − 向心力分量。但差异极小（< 0.3%），高中阶段可近似相等。 || Weight ≠ gravitational force strictly, due to Earth's rotation. The difference is < 0.3%, negligible at high school level.

> **重心的位置 || Center of Gravity**
> 质量分布均匀的规则物体，重心在几何中心。不倒翁的重心很低，所以被推偏后能自动回正——重力矩提供回复作用。 || For uniform regular objects, the center of gravity is at the geometric center. A roly-poly toy has a very low CoG, enabling self-righting.

::panel
### 弹力与胡克定律 F = kx || Elastic Force & Hooke's Law F = kx
物体发生弹性形变时产生的力，方向与形变方向相反。接触面的支持力和绳的拉力本质都是弹力。 || Force produced when an object undergoes elastic deformation, directed opposite to the deformation. Normal force and tension are both elastic forces.

$$
F = kx
$$

> **📐 公式解读 || 📐 Formula Breakdown**
> k 是劲度系数（单位 N/m），由弹簧自身材料和尺寸决定；x 是弹簧形变量（伸长或压缩量），不是总长度。 || k is the spring constant (N/m), determined by material and dimensions; x is the deformation (extension or compression), not total length.
> 适用条件：弹簧在弹性限度内。超过弹性限度，形变不可恢复，胡克定律失效。 || Valid only within the elastic limit. Beyond that, deformation is permanent and Hooke's law fails.

- **🔗 绳的拉力 || 🔗 Tension** — 轻绳各处张力相等（忽略质量）。方向沿绳指向绳收缩的方向。绳只能拉不能推。 || Tension is equal throughout a massless rope, directed along the rope toward its contraction. Rope can only pull.
- **📐 面的支持力 || 📐 Normal Force** — 接触面发生微小形变产生的弹力。方向垂直于接触面指向被支持物体。N 不一定等于 mg！ || Elastic force from tiny surface deformation. Perpendicular to contact surface. N ≠ mg in general!

::panel
### 摩擦力 f = μN || Friction f = μN
两个相互接触的物体，当有相对运动或相对运动趋势时，在接触面上产生的阻碍相对运动的力。 || Force between two contacting surfaces that opposes relative motion or the tendency of relative motion.

$$
f = \mu N
$$

| 比较项 || Aspect | 静摩擦力 || Static Friction | 滑动摩擦力 || Kinetic Friction |
| --- | --- | --- |
| 产生条件 || Condition | 有相对运动趋势但未滑动 || Tendency of motion, no sliding | 已发生相对滑动 || Sliding has occurred |
| 大小 || Magnitude | 0 < f ≤ f_max，随外力调整 || 0 < f ≤ f_max, adjusts with applied force | f = μN，恒定（与速度无关） || f = μN, constant (speed-independent) |
| 方向 || Direction | 沿接触面，与运动趋势相反 || Along surface, opposite tendency | 沿接触面，与相对运动方向相反 || Along surface, opposite relative motion |
| 关键公式 || Formula | 由平衡方程求解 || Solved from equilibrium | f = μN |

> **📐 公式解读 || 📐 Formula Breakdown**
> μ 是动摩擦因数，无单位，由接触面材料和粗糙程度决定（钢-钢约 0.15，橡胶-水泥约 0.7）。N 是法向压力，不是重力！斜面上 N = mg cosθ，此时 f = μmg cosθ。 || μ is the kinetic friction coefficient (dimensionless). Steel-steel ≈ 0.15, rubber-concrete ≈ 0.7. N is normal force, not weight! On an incline N = mg cosθ.
:::

## #analysis 02 / Four-Step Force Analysis :: 「一重二弹三摩擦」口诀 || The Mnemonic: Gravity → Elastic → Friction

受力分析是力学解题的第一步也是最关键的一步。画错力，后面全错。 || Force analysis is the first and most critical step in mechanics — wrong diagram means wrong answer.

1

### 选研究对象 || Choose the Object

明确分析哪个物体，将它从系统中'隔离'出来。在图上用虚线框标出。 || Identify which object to analyze. Isolate it from the system with a dashed boundary.

2

### 画重力 || Draw Gravity

从重心出发，竖直向下画 G = mg。所有在地球上的物体都受重力（除非题目特别说明'不计重力'）。 || From center of gravity, draw G = mg vertically downward. All objects on Earth have weight.

3

### 找弹力（接触力） || Find Elastic Forces

检查研究对象与哪些物体接触——每个接触面/绳/弹簧都可能有弹力。支持力垂直接触面，绳拉力沿绳方向。 || Check all contact surfaces, ropes, and springs. Normal force ⊥ surface; tension along rope.

4

### 查摩擦力 + 验证 || Check Friction + Verify

有接触 + 有压力 + 有运动（趋势）= 有摩擦。最后用牛顿第二定律验证：合力方向与加速度方向是否一致？ || Contact + pressure + motion/tendency = friction. Verify with Newton's 2nd law: net force direction matches acceleration?

:::callout { title: "常见陷阱 || Common Pitfalls" }
① 多画力：凭空添加'向前的力'或'运动力'——力是物体间的相互作用，必须找到施力物体。② 少画力：忘记空气阻力或绳另一端的拉力。③ 方向错：支持力画歪了（必须垂直接触面）。 || ① Adding phantom forces like 'forward force' — every force needs a source. ② Missing forces: air drag or tension at the other end. ③ Wrong direction: normal force must be ⊥ to surface.
:::

## #composition 03 / Composition & Decomposition :: 平行四边形法则与正交分解 || Parallelogram Rule & Orthogonal Decomposition

多个力可以等效为一个合力；一个力也可以分解为两个分力——这就是力的等效替代思想。 || Multiple forces can be replaced by one resultant; one force can be split into components — the equivalence principle.

:::accordion
::panel { open: true }
### 合力范围与平行四边形法则 || Resultant Range & Parallelogram Rule
两个共点力 F₁ 和 F₂ 的合力 F 满足： || For two concurrent forces F₁ and F₂, the resultant F satisfies:

$$
|F_1 - F_2| \leq F \leq F_1 + F_2
$$

> **📐 公式解读 || 📐 Formula Breakdown**
> 当两力同向（θ = 0°）时合力最大 F = F₁ + F₂；反向（θ = 180°）时合力最小 F = |F₁ − F₂|。夹角 θ 从 0° 增大到 180°，合力从最大值单调减小到最小值。 || Same direction (θ=0°): F_max = F₁+F₂. Opposite (θ=180°): F_min = |F₁−F₂|. As θ goes 0°→180°, F decreases monotonically.
> 一般情况用余弦定理：F² = F₁² + F₂² + 2F₁F₂cosθ。当 θ = 90° 时简化为 F = √(F₁² + F₂²)。 || General case via cosine rule: F² = F₁² + F₂² + 2F₁F₂cosθ. When θ=90°: F = √(F₁²+F₂²).

::panel
### 🧪 交互实验：斜面力分解 || 🧪 Lab: Incline Force Decomposition
拖动滑块调整斜面倾角 θ，观察重力沿斜面方向分量 mg sinθ（驱动下滑）与垂直斜面分量 mg cosθ（压紧斜面）的实时变化。 || Adjust incline angle θ and observe the real-time decomposition of gravity into mg sinθ (along slope) and mg cosθ (perpendicular to slope).

> **🧪 交互实验沙盒 || Interactive Simulation Sandbox** (`#sim-incline`) — 交互可调参数：倾角 θ： || Angle θ:、质量 m： || Mass m:。

::panel
### 正交分解法 || Orthogonal Decomposition Method
处理多力问题的通用方法：建立直角坐标系（通常沿斜面和垂直斜面），把每个力投影到两个轴上，分别在 x 和 y 方向列方程。 || General method for multi-force problems: set up orthogonal axes (usually along and perpendicular to the incline), project each force, then write equations for x and y.

1

**建立坐标系 || Set Up Axes**

选择使最多力落在坐标轴上的方向。斜面问题：x 轴沿斜面，y 轴垂直斜面。 || Choose axes to maximize forces along axes. Incline: x along slope, y ⊥ slope.

2

**分解各力 || Decompose Each Force**

将不在坐标轴上的力按 Fx = F cosα、Fy = F sinα 分解。斜面上重力分解：Gx = mg sinθ，Gy = mg cosθ。 || For off-axis forces: Fx = F cosα, Fy = F sinα. On incline: Gx = mg sinθ, Gy = mg cosθ.

3

**列方程求解 || Write Equations & Solve**

x 方向：ΣFx = ma；y 方向：ΣFy = 0（若该方向无加速度）。两个方程解两个未知数。 || x: ΣFx = ma; y: ΣFy = 0 (if no acceleration). Two equations for two unknowns.
:::

## #equilibrium 04 / Equilibrium Condition :: 共点力平衡：ΣF = 0 || Concurrent Force Equilibrium: ΣF = 0

物体处于静止或匀速直线运动状态时，所受合力为零——这就是平衡状态。 || When an object is at rest or in uniform motion, the net force is zero — equilibrium.

:::accordion
::panel { open: true }
### 平衡条件与常用方法 || Equilibrium Conditions & Methods
$$
\sum \vec{F} = 0 \quad \Longrightarrow \quad \sum F_x = 0,\;\sum F_y = 0
$$

> **📐 公式解读 || 📐 Formula Breakdown**
> 矢量方程 ΣF⃗ = 0 等价于两个标量方程。实际解题时正交分解最通用，但二力/三力时有更快的方法。 || Vector equation ΣF⃗=0 equals two scalar equations. Orthogonal decomposition is universal, but 2-force / 3-force shortcuts exist.

- **二力平衡 || Two-Force Equilibrium** — 只受两个力平衡 → 两力等大反向共线。判断：如果物体只受两个力，它们一定在同一条直线上。 || Two forces in equilibrium → equal, opposite, collinear.
- **三力平衡 || Three-Force Equilibrium** — 三个共点力平衡 → 任意两力的合力与第三力等大反向。三力必共点（汇交定理），可用力三角形封闭法解题。 || Three concurrent forces in equilibrium → any two forces combine to equal and opposite the third. Forces must be concurrent.
- **正交分解法 || Orthogonal Method** — 适用于任意多力平衡。建坐标系，在两个方向分别令 ΣFx = 0、ΣFy = 0 求解。 || Works for any number of forces. Set axes, solve ΣFx=0 and ΣFy=0 separately.

::panel
### 经典题型：悬挂与斜面 || Classic Types: Hanging & Incline
- **灯绳悬挂 || Lamp Suspension** — 两根绳悬挂一盏灯（质量 m）。已知两绳与竖直方向夹角 α 和 β，求绳拉力。沿 x、y 正交分解：T₁sinα = T₂sinβ，T₁cosα + T₂cosβ = mg。 || Two ropes suspend a lamp (mass m) at angles α, β from vertical. Decompose: T₁sinα = T₂sinβ, T₁cosα + T₂cosβ = mg.
- **斜面静止 || Object on Incline** — 物体在粗糙斜面上静止。沿斜面：f = mg sinθ；垂直斜面：N = mg cosθ。若已知 μ 和 θ，可判断物体是否会滑动：mg sinθ 与 μmg cosθ 比大小。 || Object at rest on rough incline. Along slope: f = mg sinθ; perpendicular: N = mg cosθ. Compare mg sinθ vs μmg cosθ to predict sliding.
:::

## #practice 05 / Practice Problems :: 从基础到挑战 || From Basics to Challenge

8 道精选题——3 道基础巩固 + 3 道进阶提高 + 2 道挑战冲刺。点击查看详细解析。 || 8 selected problems — 3 basic, 3 intermediate, 2 challenge. Click to reveal detailed solutions.

:::accordion
::panel { open: true }
### 基础巩固（3 题） || Basic (3 problems)
> **B1. 重力计算 || B1. Weight Calculation**
> 一个质量 m = 3 kg 的物体放在水平桌面上。求：(1) 物体所受重力；(2) 桌面对物体的支持力。（g = 10 m/s²） || A 3 kg object sits on a horizontal table. Find: (1) weight; (2) normal force. (g = 10 m/s²)

**📖 B1 答案 || 📖 B1 Answer**

(1) G = mg = 3 × 10 = 30 N，方向竖直向下。 || (1) G = mg = 3 × 10 = 30 N, vertically downward.

(2) 物体静止在水平面上，竖直方向平衡：N = G = 30 N，方向竖直向上。 || (2) At rest on horizontal surface, vertical equilibrium: N = G = 30 N upward.

> **B2. 胡克定律 || B2. Hooke's Law**
> 一根弹簧的劲度系数 k = 200 N/m，自然长度 L₀ = 15 cm。现将弹簧拉伸到 20 cm。求弹力大小。 || A spring with k = 200 N/m and natural length 15 cm is stretched to 20 cm. Find elastic force.

**📖 B2 答案 || 📖 B2 Answer**

形变量 x = 20 − 15 = 5 cm = 0.05 m。 || Deformation x = 20−15 = 5 cm = 0.05 m.

F = kx = 200 × 0.05 = 10 N。 || F = kx = 200 × 0.05 = 10 N.

> **B3. 滑动摩擦力 || B3. Kinetic Friction**
> 一个 5 kg 的木块在水平地面上被水平推力推着匀速运动。已知 μ = 0.4，g = 10 m/s²。求摩擦力和推力。 || A 5 kg block moves at constant speed on a horizontal surface with μ = 0.4. Find friction and push force.

**📖 B3 答案 || 📖 B3 Answer**

水平面匀速 → 合力为零。N = mg = 5 × 10 = 50 N。 || Constant speed on horizontal surface → net force = 0. N = mg = 50 N.

f = μN = 0.4 × 50 = 20 N。匀速运动，推力 F = f = 20 N。 || f = μN = 0.4 × 50 = 20 N. Constant speed: F = f = 20 N.

::panel
### 进阶提高（3 题） || Intermediate (3 problems)
> **A1. 斜面平衡 || A1. Incline Equilibrium**
> 一个质量 m = 2 kg 的物体静止在倾角 θ = 30° 的粗糙斜面上。求：(1) 物体受到的摩擦力；(2) 斜面对物体的支持力。（g = 10 m/s²） || A 2 kg object rests on a rough incline (θ=30°). Find (1) friction; (2) normal force. g=10 m/s².

**📖 A1 答案 || 📖 A1 Answer**

沿斜面方向：f = mg sinθ = 2 × 10 × sin30° = 2 × 10 × 0.5 = 10 N（沿斜面向上）。 || Along slope: f = mg sinθ = 2×10×0.5 = 10 N (up the slope).

垂直斜面方向：N = mg cosθ = 2 × 10 × cos30° = 20 × 0.866 ≈ 17.3 N。 || Perpendicular: N = mg cos30° = 20 × 0.866 ≈ 17.3 N.

> **A2. 合力范围 || A2. Resultant Range**
> 两个共点力 F₁ = 5 N、F₂ = 3 N，求合力 F 的取值范围。若要求 F = 5 N，则两力夹角为多少？ || Two forces F₁=5 N, F₂=3 N. Find range of resultant F. If F=5 N, what is the angle between them?

**📖 A2 答案 || 📖 A2 Answer**

合力范围：|F₁ − F₂| ≤ F ≤ F₁ + F₂ → 2 N ≤ F ≤ 8 N。 || Range: |5−3| ≤ F ≤ 5+3 → 2 N ≤ F ≤ 8 N.

F = 5 N 时，用余弦定理：5² = 5² + 3² + 2×5×3×cosθ → 25 = 25 + 9 + 30cosθ → cosθ = −9/30 = −0.3 → θ ≈ 107.5°。 || F=5: 25 = 25+9+30cosθ → cosθ = −0.3 → θ ≈ 107.5°.

> **A3. 绳悬挂灯 || A3. Lamp Suspension**
> 如图，两根轻绳 OA 和 OB 悬挂一盏质量 m = 4 kg 的灯。OA 与竖直方向夹角 30°，OB 水平连接墙壁。求 OA 和 OB 绳中的拉力。 || Two light ropes OA (30° from vertical) and OB (horizontal, to wall) support a 4 kg lamp. Find tensions.

**📖 A3 答案 || 📖 A3 Answer**

对结点 O 受力分析：受重力 G = 40 N↓、OA 拉力 T₁（沿 OA 斜向上）、OB 拉力 T₂（水平向右）。 || At point O: G=40 N↓, T₁ along OA (upper left), T₂ horizontal (right).

y 方向：T₁cos30° = G → T₁ = 40/cos30° = 40/0.866 ≈ 46.2 N。 || y: T₁cos30° = G → T₁ = 40/0.866 ≈ 46.2 N.

x 方向：T₂ = T₁sin30° = 46.2 × 0.5 ≈ 23.1 N。 || x: T₂ = T₁sin30° ≈ 23.1 N.

::panel
### 挑战冲刺（2 题） || Challenge (2 problems)
> **C1. 斜面 + 摩擦 + 推力 || C1. Incline + Friction + Push**
> 一个 m = 4 kg 的物体在倾角 θ = 37° 的斜面上被沿斜面向上的推力 F 推着匀速上行。已知 μ = 0.5，sin37° = 0.6，cos37° = 0.8，g = 10 m/s²。求推力 F。 || A 4 kg block moves up a 37° incline at constant speed with applied force F along the slope. μ=0.5, g=10 m/s². Find F.

**📖 C1 答案 || 📖 C1 Answer**

垂直斜面：N = mg cosθ = 4 × 10 × 0.8 = 32 N。 || ⊥ slope: N = mg cosθ = 4×10×0.8 = 32 N.

摩擦力：f = μN = 0.5 × 32 = 16 N（沿斜面向下，因为物体上行）。 || f = μN = 0.5×32 = 16 N (down the slope, opposing upward motion).

沿斜面方向匀速：F = mg sinθ + f = 4 × 10 × 0.6 + 16 = 24 + 16 = 40 N。 || Along slope, constant speed: F = mg sinθ + f = 24 + 16 = 40 N.

> **C2. 三力平衡 — 矢量三角形 || C2. Three-Force Equilibrium — Vector Triangle**
> 质量 m = 1 kg 的小球被轻绳悬挂于天花板上，同时被一个水平力 F 拉住，使绳与竖直方向成 60° 角静止。求绳的拉力 T 和水平力 F。 || A 1 kg ball hangs from a ceiling rope and is held by horizontal force F so the rope makes 60° with vertical. Find T and F.

**📖 C2 答案 || 📖 C2 Answer**

三力平衡：重力 G = mg = 10 N↓、绳拉力 T（沿绳斜上方）、水平力 F→。 || Three forces: G=10 N↓, T along rope (upper), F horizontal.

y 方向：Tcos60° = mg → T = 10/cos60° = 10/0.5 = 20 N。 || y: Tcos60° = mg → T = 10/0.5 = 20 N.

x 方向：F = Tsin60° = 20 × (√3/2) ≈ 17.3 N。 || x: F = Tsin60° = 20×(√3/2) ≈ 17.3 N.

也可用力三角形：G、T、F 构成直角三角形，直角在 G 和 F 之间，斜边为 T。tanα = F/G → F = G tan60° = 10√3 ≈ 17.3 N。 || Alternatively: G, T, F form a right triangle. tan60° = F/G → F = 10√3 ≈ 17.3 N.
:::

## #roadmap 06 / Series Navigation :: 力学全部 8 篇 || All 8 Mechanics Articles

- [第 1 篇 || Part 1：运动的描述 || Describing Motion](../describing-motion/)
- [第 2 篇 || Part 2：匀变速直线运动 || Uniform Acceleration](../uniform-acceleration/)
- **第 3 篇 · 当前 || Part 3 · Current：力与平衡 || Forces & Equilibrium**
- [第 4 篇 || Part 4：牛顿运动定律 || Newton's Laws](../newtons-laws/)
- [第 5 篇 || Part 5：圆周运动 || Circular Motion](../circular-motion/)
- [第 6 篇 || Part 6：万有引力与航天 || Gravitation](../gravitation/)
- [第 7 篇 || Part 7：功与能 || Work & Energy](../work-energy/)
- [第 8 篇 || Part 8：动量 || Momentum](../momentum/)

:::callout { title: "下一篇预告 || Next Article Preview" }
第 4 篇将聚焦**牛顿运动定律**——从惯性到 F = ma，理解力与运动的因果关系。有了受力分析的基础，你将学会用牛顿第二定律计算加速度并预测物体的运动轨迹。 || Part 4: **Newton's Laws** — from inertia to F=ma. With force analysis skills mastered, you'll compute acceleration and predict trajectories.
:::
