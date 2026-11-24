---
title: "向量运算：加减、数乘、数量积与投影 || Vector Operations: Addition, Scalar Multiplication, Dot Products, and Projection"
eyebrow: "高中数学 · 必修 || High School Mathematics · Compulsory"
brand: "高中几何与代数 || High School Geometry and Algebra"
date: 2026-07-16
strict_i18n: false
strict_density: true
lead: "向量同时携带大小与方向。高中运算包括加减、数乘和数量积；向量只能除以非零标量，本质是乘以其倒数，不存在通用的向量除以向量。 || A vector carries magnitude and direction. High-school operations are addition, subtraction, scalar multiplication, and the dot product. A vector can be divided only by a nonzero scalar; general vector-by-vector division is undefined."
hero_actions:
  - "理解运算体系 || Understand the Operations | #linear"
  - "进入分层自测 || Start Graded Practice | #practice"
panel_label: "统一判断 || Unified Decision"
panel_title: "先判断结果类型，再选择几何法或坐标法。 || Determine the Result Type, Then Choose Geometry or Coordinates"
panel:
  - "加减与数乘的结果仍是向量 || Addition, subtraction, and scalar multiplication return vectors"
  - "数量积的结果是实数 || A dot product returns a real number"
  - "共线用比例，垂直用数量积为零 || Use proportional components for parallelism and zero dot product for perpendicularity"
  - "投影把一个向量分解到指定方向 || Projection resolves one vector along a specified direction"
metrics:
  - "标准运算 || Standard Operations | 4 | 加 · 减 · 数乘 · 数量积 || Add · subtract · scale · dot"
  - "结果类型 || Result Types | 2 | 向量或实数 || Vector or scalar"
  - "几何判定 || Geometric Tests | 3 | 共线 · 垂直 · 夹角 || Parallel · perpendicular · angle"
  - "建议用时 || Study Time | 40 min | 含 6 题分层自测 || Includes six graded exercises"
style:
  accent: "#14b8a6"
---

## #meaning 01 / Concepts and Representation :: 大小与方向共同确定向量，起点位置不改变自由向量 || Magnitude and Direction Determine a Vector, Not Its Drawn Position

本节区分向量、标量、零向量与单位向量，并把几何箭头转换为坐标；这些定义决定后续每种运算的输入与输出。 || This section distinguishes vectors, scalars, zero vectors, and unit vectors and converts geometric arrows into coordinates; these definitions determine the inputs and outputs of every later operation.

:::accordion
::panel { open: true }
### 四个基本对象建立向量语言 || Four Basic Objects Establish Vector Language
向量用有向线段表示；只要大小相等且方向相同，即使画在不同位置也表示同一自由向量。 || Vectors are represented by directed segments. Equal magnitude and equal direction define the same free vector even when drawn at different positions.

- **向量同时包含大小与方向 || A Vector Has Magnitude and Direction** — 位移、速度和力是典型向量；只给数值而没有方向不能唯一描述它们。 || Displacement, velocity, and force are vectors; a number without direction does not determine them.
- **标量只有数值大小 || A Scalar Has Magnitude Only** — 质量、时间和温度可用单个实数表示；标量可以缩放向量。 || Mass, time, and temperature use one real number; a scalar can scale a vector.
- **零向量没有确定方向 || The Zero Vector Has No Defined Direction** — 零向量坐标为 (0, 0)、模为 0；它不能被单位化，因为除数会变成 0。 || The zero vector has coordinates (0, 0) and magnitude 0; it cannot be normalized because the divisor would be zero.
- **单位向量只保留方向 || A Unit Vector Retains Direction Only** — 非零向量 a 的同向单位向量为 a/|a|，其模等于 1。 || For nonzero a, the unit vector a/|a| has the same direction and magnitude 1.

::panel
### 两点坐标之差给出从起点到终点的向量 || Terminal Minus Initial Coordinates Gives the Directed Vector
若 A(x₁, y₁) 是起点、B(x₂, y₂) 是终点，则每个分量都用终点减起点；颠倒次序会得到相反向量。 || For initial point A(x₁, y₁) and terminal point B(x₂, y₂), subtract initial coordinates from terminal coordinates componentwise; reversing the order gives the opposite vector.

$$
\overrightarrow{AB}=(x_2-x_1,\ y_2-y_1),\qquad |\overrightarrow{AB}|=\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}
$$

从 A 到 B || From A to B

**终点减起点 || Terminal Minus Initial**

A(−1, 2)、B(3, 5) 给出 AB = (4, 3)，模为 5。 || A(−1, 2) and B(3, 5) give AB = (4, 3), with magnitude 5.

从 B 到 A || From B to A

**方向反转，分量同时变号 || Reverse Direction and Negate Both Components**

BA = (−4, −3) = −AB；两者模相同、方向相反。 || BA = (−4, −3) = −AB; the magnitudes match and directions oppose.
:::

## #linear 02 / Addition, Subtraction, and Scaling :: 加减组合位移，数乘改变长度并可能反转方向 || Addition Combines Displacements, While Scaling Changes Length and May Reverse Direction

上一节确定了向量的大小与方向，本节建立三角形法则、平行四边形法则和数乘规则，并明确向量除法的边界。 || The previous section fixed magnitude and direction. This section establishes triangle and parallelogram addition, scalar multiplication, and the precise boundary of vector division.

:::accordion
::panel { open: true }
### 向量加法把连续动作合成为一次净位移 || Vector Addition Combines Consecutive Motions Into One Net Displacement
把第二个向量的起点平移到第一个向量终点，首尾连接后的合向量从最初起点指向最终终点。 || Translate the second vector so its initial point meets the first vector's terminal point; the resultant points from the original start to the final endpoint.

1. **三角形法则处理连续位移 || Use the Triangle Rule for Consecutive Displacements** — 若 AB = a、BC = b，则 AC = a + b。 || If AB = a and BC = b, then AC = a + b.
2. **平行四边形法则处理共同起点 || Use the Parallelogram Rule for a Common Initial Point** — 以 a、b 为邻边，公共起点出发的对角线表示 a + b。 || With a and b as adjacent sides, the diagonal from the common initial point represents a + b.
3. **减法转成加相反向量 || Convert Subtraction Into Addition of the Opposite** — a − b = a + (−b)；从共同起点看，a − b 指向从 b 的终点到 a 的终点。 || a − b = a + (−b). From a common start, a − b points from the terminal point of b to that of a.

$$
(a_1,a_2)\pm(b_1,b_2)=(a_1\pm b_1,\ a_2\pm b_2)
$$

::panel
### 数乘与除以标量是一组互逆操作 || Scalar Multiplication and Division by a Scalar Are Inverse Operations
实数 λ 乘向量 a 会把模放大为 |λ｜a|；λ 的正负决定方向保持还是反转。除以非零标量等于乘其倒数。 || Multiplying vector a by real λ changes its magnitude to |λ｜a|; the sign of λ preserves or reverses direction. Division by a nonzero scalar equals multiplication by its reciprocal.

$$
\lambda(a_1,a_2)=(\lambda a_1,\lambda a_2),\qquad \frac{a}{\lambda}=\frac1\lambda a\quad(\lambda\ne0)
$$

- **λ 大于 0 时方向保持 || Positive λ Preserves Direction** — λ = 2 使长度加倍；λ = 1/2 使长度减半。 || λ = 2 doubles length; λ = 1/2 halves it.
- **λ 小于 0 时方向反转 || Negative λ Reverses Direction** — −a 与 a 等长反向；−3a 还会把长度放大三倍。 || −a has equal length and opposite direction; −3a also triples the length.
- **除以模得到单位向量 || Dividing by Magnitude Gives a Unit Vector** — 当 a ≠ 0 时，e = a/|a| 与 a 同向且 |e| = 1。 || For a ≠ 0, e = a/|a| points with a and satisfies |e| = 1.

> **运算边界 || Operation Boundary**
> 高中向量体系没有通用的 a/b。只有 a 除以非零实数 λ 被定义；数量积 a·b 是乘法形式，但结果是实数，也不能作为向量除法的逆运算。 || High-school vector algebra has no general a/b. Only division of a by a nonzero real scalar λ is defined. The dot product a·b is multiplicative in notation but returns a scalar and has no vector-division inverse.
:::

## #coordinates 03 / Basis and Coordinates :: 平面内两个不共线向量可唯一表示任意向量 || Two Nonparallel Basis Vectors Represent Every Plane Vector Uniquely

加减和数乘建立了线性运算，本节用平面向量基本定理把几何对象编码为坐标，并给出共线、模与单位化判据。 || Addition and scaling established linear operations. This section uses the fundamental theorem of plane vectors to encode geometry as coordinates and derives tests for parallelism, magnitude, and normalization.

:::accordion
::panel { open: true }
### 基本定理把二维几何化为两个系数 || The Fundamental Theorem Converts Plane Geometry Into Two Coefficients
若 e₁、e₂ 不共线，则平面内任意向量 a 都能且只能写成 λe₁ + μe₂；唯一性使坐标运算可靠。 || If e₁ and e₂ are nonparallel, every plane vector a has one and only one representation λe₁ + μe₂; uniqueness makes coordinate operations reliable.

$$
a=\lambda e_1+\mu e_2
$$

| 任务 || Task | 坐标判据 || Coordinate Test | 必要条件 || Condition |
| --- | --- | --- |
| 求模 || Magnitude | \|a\| = √(x² + y²) | a = (x, y) |
| 判断共线 || Parallelism | x₁y₂ − x₂y₁ = 0 | 两向量不能都未定义；讨论方向时排除零向量 || Vectors must be defined; exclude the zero vector when discussing direction |
| 求同向单位向量 || Unit vector | a/\|a\| | a ≠ 0 |
| 线性组合 || Linear combination | λa + μb | 分量分别运算 || Operate componentwise |
:::

## #dot 04 / Dot Product and Projection :: 数量积把方向关系转化为一个可计算实数 || The Dot Product Converts Directional Relations Into One Computable Scalar

坐标表示让线性运算可计算，本节进一步用数量积连接夹角、垂直、功和投影；这是 2025 修订版明确要求的投影内容。 || Coordinates made linear operations computable. This section uses the dot product to connect angles, perpendicularity, work, and projection, including projection explicitly required by the 2025 revision.

:::accordion
::panel { open: true }
### 几何定义与坐标公式描述同一个实数 || Geometric and Coordinate Formulas Describe the Same Scalar
对非零向量 a、b，数量积等于两向量模与夹角余弦的乘积；在直角坐标系中等于对应分量乘积之和。 || For nonzero a and b, the dot product equals the product of their magnitudes and the cosine of the included angle; in rectangular coordinates it equals the sum of component products.

$$
a\cdot b=|a||b|\cos\theta=x_1x_2+y_1y_2
$$

- **数量积为正表示锐角 || A Positive Dot Product Indicates an Acute Angle** — a·b > 0 时 cosθ > 0，因此 0° ≤ θ < 90°。 || When a·b > 0, cosθ > 0, so 0° ≤ θ < 90°.
- **数量积为零判定垂直 || A Zero Dot Product Tests Perpendicularity** — 对两个非零向量，a·b = 0 当且仅当 a ⟂ b。零向量与任意向量数量积也为 0，但没有方向。 || For two nonzero vectors, a·b = 0 exactly when a is perpendicular to b. The zero vector also dots to zero with every vector but has no direction.
- **数量积为负表示钝角 || A Negative Dot Product Indicates an Obtuse Angle** — a·b < 0 时 cosθ < 0，因此 90° < θ ≤ 180°。 || When a·b < 0, cosθ < 0, so 90° < θ ≤ 180°.

::panel
### 投影把向量拆成平行分量与垂直分量 || Projection Splits a Vector Into Parallel and Perpendicular Components
a 在非零向量 b 方向上的数量投影是带符号长度，投影向量则把该长度乘以 b 的单位向量。 || The scalar projection of a onto nonzero b is a signed length; the vector projection multiplies that length by the unit vector along b.

$$
\operatorname{comp}_b a=\frac{a\cdot b}{|b|},\qquad \operatorname{proj}_b a=\frac{a\cdot b}{|b|^2}b\quad(b\ne0)
$$

1. **选择投影方向 || Choose the Projection Direction** — 分母和最终方向都由 b 决定；把 a、b 颠倒会得到不同问题。 || Both the denominator and resulting direction are determined by b; swapping a and b changes the problem.
2. **计算平行分量 || Compute the Parallel Component** — proj_b a 与 b 共线，其系数正负表示同向或反向。 || proj_b a is parallel to b; the sign of its coefficient indicates same or opposite direction.
3. **剩余量是垂直分量 || The Remainder Is the Perpendicular Component** — a − proj_b a 与 b 的数量积为 0。 || a − proj_b a has dot product zero with b.

> **失败样例 || Failure Case**
> 当 b = 0 时，|b| 与 |b|² 都为 0，投影公式无定义；零向量没有可作为投影目标的方向。 || When b = 0, both |b| and |b|² vanish, so projection is undefined; the zero vector provides no target direction.
:::

## #applications 05 / Geometric and Physical Applications :: 共线、垂直、夹角与功可由同一套向量运算解决 || One Vector Toolkit Solves Parallelism, Perpendicularity, Angles, and Work

数量积已经编码方向关系，本节把坐标判据用于平面几何、力学和解三角形，并比较何时选综合几何或向量法。 || The dot product encoded directional relations. This section applies coordinate tests to plane geometry, mechanics, and triangle solving and compares vector and synthetic approaches.

:::accordion
::panel { open: true }
### 三类问题对应三条直接判据 || Three Problem Types Map to Three Direct Tests
先把几何条件翻译成方向向量或位移向量，再按共线、垂直或夹角选择公式。 || Translate the geometry into direction or displacement vectors, then select the parallel, perpendicular, or angle formula.

| 问题 || Problem | 判据 || Test | 边界 || Boundary |
| --- | --- | --- |
| 平行或三点共线 || Parallel lines or collinear points | a = λb 或 x₁y₂ − x₂y₁ = 0 | 方向判定通常要求非零向量 || Directional tests normally require nonzero vectors |
| 垂直 || Perpendicularity | a·b = 0 | 两方向向量均非零 || Both direction vectors are nonzero |
| 夹角 || Included angle | cosθ = (a·b)/(\|a\|\|b\|) | 0° ≤ θ ≤ 180° |
| 恒力做功 || Work by a constant force | W = F·s = \|F\|\|s\|cosθ | F 为恒力、s 为位移 || F is constant and s is displacement |

::panel
### 正弦定理与余弦定理连接向量和三角形 || The Sine and Cosine Laws Connect Vectors and Triangles
三角形边向量满足首尾相加关系，数量积展开 |a − b|² 可得到余弦定理；正弦定理则用于已知一组对边与对角时求解。 || Triangle side vectors satisfy head-to-tail addition. Expanding |a − b|² with a dot product yields the cosine law; the sine law applies when one opposite side-angle pair is known.

余弦定理 || Cosine Law

**适合边边边或边角边 || Use for SSS or SAS**

$$
c^2=a^2+b^2-2ab\cos C
$$

本质是两个边向量之差的模平方。 || It is the squared magnitude of the difference between two side vectors.

正弦定理 || Sine Law

**适合已知对边与对角 || Use With an Opposite Side-Angle Pair**

$$
\frac{a}{\sin A}=\frac{b}{\sin B}=\frac{c}{\sin C}=2R
$$

边边角情形需检查可能存在两个三角形。 || For SSA data, check whether two triangles are possible.
:::

## #practice 06 / Graded Practice :: 六道题检验线性运算、数量积、投影与应用 || Six Problems Test Linear Operations, Dot Products, Projection, and Applications

前五节已经建立运算与判定体系；本节按基础、综合和应用三层检查结果类型、零向量边界与公式选择。 || The first five sections established the operation and test system. This section checks result types, zero-vector boundaries, and formula selection at foundational, integrated, and applied levels.

:::accordion
::panel { open: true }
### 基础层：分量运算与单位向量 || Foundation: Component Operations and Unit Vectors
先判断结果应为向量还是实数，再逐分量计算。 || Determine whether the result should be a vector or scalar before calculating componentwise.

1. **a = (2, −1)、b = (−3, 4)，求 2a − b || For a = (2, −1) and b = (−3, 4), Find 2a − b** — 2a − b = (4, −2) − (−3, 4) = (7, −6)。 || 2a − b = (4, −2) − (−3, 4) = (7, −6).
2. **求 v = (−3, 4) 的同向单位向量 || Find a Unit Vector in the Direction of v = (−3, 4)** — |v| = 5，所以 v/|v| = (−3/5, 4/5)。 || |v| = 5, so v/|v| = (−3/5, 4/5).

::panel
### 综合层：垂直与投影 || Integrated: Perpendicularity and Projection
数量积负责方向判定，投影还要明确目标方向向量。 || The dot product handles directional tests; projection also requires an explicit target direction.

1. **求 m，使 (m, 2) 与 (1, −3) 垂直 || Find m Such That (m, 2) Is Perpendicular to (1, −3)** — m × 1 + 2 × (−3) = 0，所以 m = 6。 || m × 1 + 2 × (−3) = 0, so m = 6.
2. **求 a = (3, 4) 在 b = (1, 0) 方向上的投影向量 || Project a = (3, 4) Onto the Direction b = (1, 0)** — a·b = 3、|b|² = 1，所以 proj_b a = 3b = (3, 0)；剩余 (0, 4) 与 b 垂直。 || a·b = 3 and |b|² = 1, so proj_b a = 3b = (3, 0); the remainder (0, 4) is perpendicular to b.

::panel
### 应用层：功与几何参数 || Application: Work and Geometric Parameters
应用题把物理量或几何关系翻译成向量后，仍回到数量积与线性组合。 || After translating physical or geometric information into vectors, applied problems return to dot products and linear combinations.

1. **10 N 恒力与 6 m 位移夹角 60°，求功 || A 10 N Constant Force Acts Through 6 m at 60°; Find the Work** — W = 10 × 6 × cos60° = 30 J。只有沿位移方向的力分量做功。 || W = 10 × 6 × cos60° = 30 J. Only the force component along displacement contributes work.
2. **A(0, 0)、B(4, 1)、C(1, m)，若 AB ⟂ AC，求 m || For A(0, 0), B(4, 1), and C(1, m), Find m if AB Is Perpendicular to AC** — AB = (4, 1)、AC = (1, m)，数量积 4 + m = 0，所以 m = −4。 || AB = (4, 1) and AC = (1, m). Their dot product 4 + m = 0, so m = −4.
:::

## #references 07 / References :: 课程边界与向量公式均有可核验来源 || The Curriculum Boundary and Vector Formulas Have Verifiable Sources

前文以 2025 日常修订版界定平面向量、投影和解三角形范围，并用开放教材交叉核验运算、坐标与数量积。 || The article follows the 2025 daily revision for plane vectors, projection, and triangle solving and cross-checks operations, coordinates, and dot products against an open textbook.

- [1] 课程标准 · 普通高中数学课程标准日常修订版（2017 年版 2025 年修订） — http://www.bdtxjys.cn/xiangqing_7/2.html | 支撑向量概念、加减与数乘、基本定理、坐标表示、数量积、投影与投影向量、几何和物理应用及解三角形的范围。 || Supports vector concepts, addition and scaling, the fundamental theorem, coordinates, dot products, projection vectors, geometric and physical applications, and triangle solving.
- [2] OpenStax Precalculus 2e · 8.8 Vectors — https://openstax.org/books/precalculus-2e/pages/8-8-vectors | 交叉核验向量几何表示、模与方向、加减、数乘、分量、单位向量、数量积及现实应用。 || Cross-checks geometric vectors, magnitude and direction, addition and subtraction, scaling, components, unit vectors, dot products, and applications.
