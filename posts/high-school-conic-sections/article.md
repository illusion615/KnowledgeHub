---
title: "圆锥曲线：从轨迹定义到方程与性质 || Conic Sections: From Locus Definitions to Equations and Properties"
eyebrow: "高中数学 · 选择性必修 || High School Mathematics · Selective Compulsory"
brand: "高中几何与代数 || High School Geometry and Algebra"
date: 2026-07-16
strict_i18n: false
strict_density: true
lead: "椭圆、双曲线和抛物线都由点到焦点或准线的距离条件定义。建立恰当坐标系后，几何条件转成标准方程；焦点、顶点、离心率、渐近线和焦准距则从参数关系中读出。 || Ellipses, hyperbolas, and parabolas are defined by distance conditions involving foci or directrices. A suitable coordinate system converts geometry into standard equations, from which foci, vertices, eccentricity, asymptotes, and focal parameters follow."
hero_actions:
  - "比较三类曲线 || Compare the Three Conics | #overview"
  - "进入分层自测 || Start Graded Practice | #practice"
panel_label: "统一研究链 || Unified Study Chain"
panel_title: "先读定义与朝向，再写参数关系，最后联立方程。 || Read the Definition and Orientation, Write Parameter Relations, Then Combine Equations"
panel:
  - "由轨迹条件识别椭圆、双曲线或抛物线 || Identify the conic from its locus condition"
  - "由焦点或开口方向确定标准式朝向 || Use foci or opening direction to choose the equation orientation"
  - "用 a、b、c、p 的关系减少未知量 || Use relations among a, b, c, and p to reduce unknowns"
  - "直线联立后用判别式与韦达定理处理交点 || After combining with a line, use the discriminant and Vieta's formulas"
metrics:
  - "曲线类型 || Conic Types | 3 | 椭圆 · 双曲线 · 抛物线 || Ellipse · hyperbola · parabola"
  - "统一参数 || Unified Parameter | e | 离心率区分三类曲线 || Eccentricity separates the three types"
  - "主要思想 || Core Method | 形 ⇄ 数 || Shape ⇄ Algebra | 几何条件与代数方程互译 || Translate geometry and algebra both ways"
  - "建议用时 || Study Time | 55 min | 含 6 题分层自测 || Includes six graded exercises"
style:
  accent: "#14b8a6"
---

## #overview 01 / Overview of Three Conics :: 距离和、距离差与等距条件分别生成三类圆锥曲线 || Distance Sum, Distance Difference, and Equidistance Generate the Three Conics

本节先用定义、图形闭合性、标准参数和离心率建立对比地图；后续三节再分别推导公式与性质。 || This section first builds a comparison map using definitions, boundedness, standard parameters, and eccentricity; the next three sections then derive each equation and its properties.

:::accordion
::panel { open: true }
### 一张表区分定义、形状与参数关系 || One Table Separates Definitions, Shapes, and Parameter Relations
三类曲线都可写成点到焦点与准线距离之比为常数 e；e 的大小决定曲线闭合、分支或开口。 || All three conics can be described by a constant ratio e between distance to a focus and distance to a directrix; the value of e determines whether the curve closes, splits, or opens.

| 曲线 || Conic | 轨迹定义 || Locus Definition | 参数关系 || Parameter Relation | 离心率 || Eccentricity |
| --- | --- | --- | --- |
| 椭圆 || Ellipse | 到两焦点距离之和等于 2a || Sum of distances to two foci equals 2a | c² = a² − b² | 0 < e = c/a < 1 |
| 双曲线 || Hyperbola | 到两焦点距离之差的绝对值等于 2a || Absolute difference of distances to two foci equals 2a | c² = a² + b² | e = c/a > 1 |
| 抛物线 || Parabola | 到焦点与到准线距离相等 || Distance to focus equals distance to directrix | 焦准距由 p 决定 || Focal geometry is determined by p | e = 1 |

::panel
### 建系原则决定方程是否简洁 || Coordinate Choice Determines Whether the Equation Is Simple
标准方程不是任意记号，而是把对称中心或顶点放在原点、对称轴放在坐标轴后的结果。 || A standard equation is not arbitrary notation; it results from placing the center or vertex at the origin and aligning symmetry axes with coordinate axes.

1. **先找对称中心或顶点 || Locate the Center or Vertex First** — 椭圆和双曲线以中心为原点；抛物线以顶点为原点。 || Place an ellipse or hyperbola center at the origin and a parabola vertex at the origin.
2. **让焦点或开口方向落在坐标轴 || Align Foci or Opening With a Coordinate Axis** — 焦点在 x 轴时，含 a² 的正项或一次项通常对应 x；焦点在 y 轴时对应 y。 || For foci on the x-axis, the a² denominator or linear term normally belongs to x; for the y-axis, it belongs to y.
3. **再把距离定义平方化简 || Then Square and Simplify the Distance Definition** — 平方前后要保留距离非负和定义中的常数边界，避免引入不符合原定义的点。 || Preserve nonnegative distances and definition bounds when squaring to avoid points that do not satisfy the original locus.
:::

## #ellipse 02 / Ellipses :: 椭圆以固定距离和形成闭合曲线，a 是半长轴 || An Ellipse Uses a Fixed Distance Sum to Form a Closed Curve, With a as the Semimajor Axis

总览已经区分三类轨迹，本节从两焦点距离和等于 2a 出发，读取标准方程、焦点、顶点、范围与离心率。 || The overview separated the three loci. This section starts from a fixed sum 2a of distances to two foci and reads the standard equation, foci, vertices, range, and eccentricity.

:::accordion
::panel { open: true }
### 焦点方向决定 a² 所在分母 || The Focal Axis Determines Which Denominator Is a²
椭圆中 a 始终大于 b；较大分母对应长轴和焦点方向，不能按字母 x、y 固定记忆。 || For an ellipse a is always greater than b. The larger denominator identifies the major axis and focal direction; it is not tied permanently to x or y.

焦点在 x 轴 || Foci on the x-Axis

$$
\frac{x^2}{a^2}+\frac{y^2}{b^2}=1\quad(a>b>0)
$$

焦点 (±c, 0)，顶点 (±a, 0)、(0, ±b)。 || Foci are (±c, 0); vertices are (±a, 0) and (0, ±b).

焦点在 y 轴 || Foci on the y-Axis

$$
\frac{x^2}{b^2}+\frac{y^2}{a^2}=1\quad(a>b>0)
$$

焦点 (0, ±c)，顶点 (0, ±a)、(±b, 0)。 || Foci are (0, ±c); vertices are (0, ±a) and (±b, 0).

$$
c^2=a^2-b^2,\qquad e=\frac ca,\qquad 0<e<1
$$

::panel
### 范围、对称性与离心率共同控制图形 || Range, Symmetry, and Eccentricity Control the Shape
标准椭圆关于两坐标轴和原点对称；x、y 的取值被半轴限制，因此图形闭合。 || A standard ellipse is symmetric about both axes and the origin. Its x and y values are bounded by the semiaxes, so the curve is closed.

- **范围由半轴给出 || The Semiaxes Give the Range** — 横轴长轴时 |x| ≤ a、|y| ≤ b；纵轴长轴时相应交换。 || With a horizontal major axis, |x| ≤ a and |y| ≤ b; swap them for a vertical major axis.
- **离心率越小越接近圆 || Smaller Eccentricity Is More Circle-Like** — 固定 a 时，c 变小意味着 b 变大；e 接近 0 时两半轴接近。 || For fixed a, smaller c means larger b; as e approaches 0, the semiaxes approach equality.
- **焦点距离和保持 2a || The Focal Distance Sum Remains 2a** — 任一点 P 满足 PF₁ + PF₂ = 2a；该关系常用于求距离而无需先求坐标。 || Every point P satisfies PF₁ + PF₂ = 2a, often determining distances without coordinates.
:::

## #hyperbola 03 / Hyperbolas :: 双曲线以固定距离差形成两支曲线，正项决定实轴方向 || A Hyperbola Uses a Fixed Distance Difference to Form Two Branches, and the Positive Term Sets the Transverse Axis

椭圆依赖距离和且闭合，双曲线改用距离差的绝对值；本节重点区分正项方向、焦点关系和渐近线。 || An ellipse uses a distance sum and closes; a hyperbola uses an absolute distance difference. This section focuses on the positive term, focal relation, and asymptotes.

:::accordion
::panel { open: true }
### 正项所在变量决定双曲线开口方向 || The Variable With the Positive Term Determines the Opening Direction
双曲线标准式中 a² 不一定是较大分母；a 对应实轴半长，c² = a² + b² 保证焦点比顶点离中心更远。 || In a hyperbola, a² need not be the larger denominator. The parameter a is the semitransverse axis, and c² = a² + b² places each focus beyond its vertex.

左右开口 || Opens Left and Right

$$
\frac{x^2}{a^2}-\frac{y^2}{b^2}=1
$$

顶点 (±a, 0)，焦点 (±c, 0)，渐近线 y = ±(b/a)x。 || Vertices are (±a, 0), foci are (±c, 0), and asymptotes are y = ±(b/a)x.

上下开口 || Opens Up and Down

$$
\frac{y^2}{a^2}-\frac{x^2}{b^2}=1
$$

顶点 (0, ±a)，焦点 (0, ±c)，渐近线 y = ±(a/b)x。 || Vertices are (0, ±a), foci are (0, ±c), and asymptotes are y = ±(a/b)x.

$$
c^2=a^2+b^2,\qquad e=\frac ca>1
$$

::panel
### 渐近线给出远离中心后的方向趋势 || Asymptotes Give the Directional Trend Far From the Center
把标准式右边的 1 替换为 0，可因式分解得到两条渐近线；曲线无限接近它们但标准双曲线不与其相交。 || Replacing the right side 1 with 0 and factoring gives the two asymptotes; the standard hyperbola approaches them indefinitely without intersecting them.

1. **确定正项方向 || Identify the Positive-Term Direction** — 正项是 x² 则左右开口，正项是 y² 则上下开口。 || A positive x² term opens left-right; a positive y² term opens up-down.
2. **画辅助矩形 || Draw the Auxiliary Rectangle** — 以 (±a, ±b) 为角点，矩形对角线所在直线就是渐近线。 || Use corners (±a, ±b); the rectangle's diagonal lines are the asymptotes.
3. **用顶点和渐近线定形 || Shape the Branches From Vertices and Asymptotes** — 两支从顶点向外延伸，并逐渐靠近对应渐近线。 || The two branches extend outward from the vertices and approach their asymptotes.

> **常见错误 || Common Error**
> 椭圆用较大分母判断长轴，双曲线用正项判断实轴。把两条规则混用，会同时写错顶点、焦点和渐近线。 || For ellipses, the larger denominator determines the major axis; for hyperbolas, the positive term determines the transverse axis. Mixing these rules corrupts vertices, foci, and asymptotes together.
:::

## #parabola 04 / Parabolas :: 抛物线由焦点与准线等距定义，p 的符号决定开口方向 || A Parabola Is Equidistant From a Focus and Directrix, and the Sign of p Sets Its Opening

双曲线有中心与两支，抛物线只有一个焦点和一条准线；本节用 p 统一四种朝向并读取焦点、准线和范围。 || A hyperbola has a center and two branches, while a parabola has one focus and one directrix. This section uses p to unify four orientations and read the focus, directrix, and range.

:::accordion
::panel { open: true }
### 一次项变量与开口轴变量不同 || The Linear Variable Differs From the Opening-Axis Variable
标准式中被平方的变量描述横截距离，一次项变量描述开口轴；p 是焦点到准线距离的一半并带方向符号。 || In standard form, the squared variable measures transverse displacement while the linear variable lies on the opening axis; p is the signed half-distance between focus and directrix.

| 方程 || Equation | 开口 || Opening | 焦点 || Focus | 准线 || Directrix |
| --- | --- | --- | --- |
| y² = 2px | p 正向右，p 负向左 || Right for positive p, left for negative p | (p/2, 0) | x = −p/2 |
| x² = 2py | p 正向上，p 负向下 || Up for positive p, down for negative p | (0, p/2) | y = −p/2 |

部分教材使用 y² = 4px 的记号，此时焦点写作 (p, 0)。两种约定都正确，但同一道题中必须保持一致。本文采用 y² = 2px。 || Some texts use y² = 4px, making the focus (p, 0). Both conventions are valid, but one problem must use one convention consistently. This article uses y² = 2px.

::panel
### 定义可直接处理焦点距离与准线距离 || The Definition Directly Relates Focal and Directrix Distances
抛物线上任一点 P 到焦点 F 的距离等于 P 到准线的垂直距离；面对距离问题时，定义往往比坐标开方更短。 || For every point P on a parabola, PF equals the perpendicular distance from P to the directrix; this definition is often shorter than coordinate square roots in distance problems.

$$
PF=d(P,\ell)
$$

- **顶点位于焦点与准线正中 || The Vertex Lies Midway Between Focus and Directrix** — 标准式顶点为原点，焦点与准线分别位于开口轴两侧等距位置。 || For standard form, the vertex is the origin, with focus and directrix equally spaced on opposite sides along the axis.
- **对称轴穿过顶点与焦点 || The Axis Passes Through Vertex and Focus** — y² = 2px 的对称轴是 x 轴；x² = 2py 的对称轴是 y 轴。 || For y² = 2px the axis is the x-axis; for x² = 2py it is the y-axis.
- **开口方向限制坐标范围 || Opening Direction Restricts the Coordinate Range** — 例如 p 正时 y² = 2px 必有 x ≥ 0，而 y 可以取任意实数。 || For example, with positive p, y² = 2px requires x ≥ 0 while y may be any real number.
:::

## #line 05 / Lines and Conics :: 联立后的一元二次方程编码交点数量、坐标和弦长 || The Resulting Quadratic Encodes Intersection Count, Coordinates, and Chord Length

三类标准方程已确定，本节把直线代入曲线，用判别式判断位置关系，并用韦达定理避免重复求根。 || With all three standard equations established, this section substitutes a line into a conic, uses the discriminant for positional relations, and uses Vieta's formulas to avoid unnecessary root calculation.

:::accordion
::panel { open: true }
### 判别式给出零个、一个或两个实交点 || The Discriminant Gives Zero, One, or Two Real Intersections
把直线方程代入圆锥曲线后得到 At² + Bt + C = 0；变量 t 可以是 x、y 或参数，判别式只判断实根数量。 || Substituting a line into a conic gives At² + Bt + C = 0, where t may be x, y, or a line parameter. The discriminant determines only the number of real roots.

| 判别式 || Discriminant | 实根 || Real Roots | 几何意义 || Geometric Meaning |
| --- | --- | --- |
| Δ > 0 | 两个不同实根 || Two distinct real roots | 直线与曲线有两个不同交点 || The line meets the conic at two distinct points |
| Δ = 0 | 一个二重实根 || One repeated real root | 通常表示相切；需确认代入未退化 || Usually tangent, provided the substitution has not degenerated |
| Δ < 0 | 无实根 || No real roots | 直线与实曲线无交点 || The line does not meet the real conic |

::panel
### 韦达定理直接提供交点坐标的和与积 || Vieta's Formulas Give Sums and Products of Intersection Coordinates Directly
若交点横坐标为 x₁、x₂，则无需写出根式即可得到 x₁ + x₂ 与 x₁x₂；中点、斜率积和弦长常因此简化。 || If intersection x-coordinates are x₁ and x₂, their sum and product follow without radicals; midpoint, slope products, and chord lengths often simplify as a result.

$$
Ax^2+Bx+C=0\Longrightarrow x_1+x_2=-\frac BA,\qquad x_1x_2=\frac CA
$$

1. **检查二次项系数 || Check the Quadratic Coefficient** — 若 A = 0，方程退化为一次方程，不能继续使用二次判别式和两根韦达关系。 || If A = 0, the equation becomes linear and the quadratic discriminant and two-root Vieta relations no longer apply.
2. **用 Δ 确认交点存在 || Use Δ to Confirm Intersections Exist** — 涉及弦长或两个交点时必须有 Δ > 0；不能只写韦达关系而忽略实根条件。 || A chord or two distinct intersections requires Δ > 0; Vieta's relations alone do not guarantee real roots.
3. **按目标选择根和、根积或根差 || Select Root Sum, Product, or Difference for the Target** — 根差平方可写成 (x₁ + x₂)² − 4x₁x₂，常用于弦长。 || The squared root difference is (x₁ + x₂)² − 4x₁x₂, often useful for chord length.
:::

## #practice 06 / Graded Practice :: 六道题检验识别、参数、定义与直线联立 || Six Problems Test Identification, Parameters, Definitions, and Line Intersections

前五节已经完成从轨迹到交点的知识链；本节按基础、综合和联立三层检查能否独立选择公式并处理边界。 || The first five sections completed the path from loci to intersections. This section checks formula selection and boundary handling at foundational, integrated, and intersection levels.

:::accordion
::panel { open: true }
### 基础层：由方程读取焦点与性质 || Foundation: Read Foci and Properties From Equations
先判断曲线类型和朝向，再计算参数关系。 || Identify the conic type and orientation before calculating parameter relations.

1. **椭圆 x²/25 + y²/9 = 1 的焦点与离心率 || Find the Foci and Eccentricity of x²/25 + y²/9 = 1** — a = 5、b = 3、c = 4，焦点 (±4, 0)，e = 4/5。 || a = 5, b = 3, and c = 4, so the foci are (±4, 0) and e = 4/5.
2. **双曲线 y²/16 − x²/9 = 1 的渐近线 || Find the Asymptotes of y²/16 − x²/9 = 1** — 上下开口，a = 4、b = 3，渐近线 y = ±(4/3)x。 || It opens up and down, with a = 4 and b = 3, so the asymptotes are y = ±(4/3)x.

::panel
### 综合层：定义与标准方程 || Integrated: Locus Definitions and Standard Equations
定义题优先使用距离常数，建方程题则先确定朝向和参数约定。 || Use the distance constant directly for locus-definition problems; for equation construction, determine orientation and parameter convention first.

1. **椭圆上点 P 到两焦点距离分别为 7 和 5，求 a || A Point P on an Ellipse Has Focal Distances 7 and 5; Find a** — PF₁ + PF₂ = 2a，所以 12 = 2a，得 a = 6。 || PF₁ + PF₂ = 2a, so 12 = 2a and a = 6.
2. **焦点为 (2, 0)、准线 x = −2 的抛物线方程 || Find the Parabola With Focus (2, 0) and Directrix x = −2** — 顶点为原点，本文约定 p/2 = 2，所以 p = 4，方程 y² = 8x。 || The vertex is the origin. Under this article's convention p/2 = 2, so p = 4 and the equation is y² = 8x.

::panel
### 联立层：交点数量与弦中点 || Intersection: Point Count and Chord Midpoint
联立前先确认代入后仍为二次方程，联立后再同时检查判别式和目标量。 || Before using quadratic tools, confirm substitution still yields a quadratic; then check both the discriminant and the target quantity.

1. **直线 y = x + m 与抛物线 y² = 4x 相切，求 m || Line y = x + m Is Tangent to y² = 4x; Find m** — 代入得 (x + m)² = 4x，即 x² + (2m − 4)x + m² = 0。令 Δ = 0，得 (2m − 4)² − 4m² = 0，所以 m = 1。 || Substitution gives (x + m)² = 4x, or x² + (2m − 4)x + m² = 0. Setting Δ = 0 gives (2m − 4)² − 4m² = 0, so m = 1.
2. **直线 y = kx + 1 与椭圆 x²/4 + y² = 1 有两个交点时的必要检查 || What Must Be Checked for y = kx + 1 to Meet x²/4 + y² = 1 Twice?** — 代入形成关于 x 的二次方程；必须同时确认二次项系数非零且 Δ > 0。仅写根和、根积不能证明两个实交点存在。 || Substitution creates a quadratic in x. Its quadratic coefficient must be nonzero and Δ > 0. Root sums and products alone do not prove two real intersections exist.
:::

## #references 07 / References :: 课程边界与三类曲线性质均有可核验来源 || The Curriculum Boundary and Properties of All Three Conics Have Verifiable Sources

前文按 2025 日常修订版控制椭圆、双曲线和抛物线的学习深度，并使用开放教材交叉核验定义、标准式和几何性质。 || The article follows the 2025 daily revision for depth across ellipses, hyperbolas, and parabolas and cross-checks definitions, standard forms, and properties against open textbooks.

- [1] 课程标准 · 普通高中数学课程标准日常修订版（2017 年版 2025 年修订） — http://www.bdtxjys.cn/xiangqing_7/2.html | 支撑椭圆定义、标准方程和简单性质，以及抛物线、双曲线的定义、图形、标准方程、简单性质与应用边界。 || Supports ellipse definitions, standard equations, and simple properties, plus definitions, graphs, standard equations, simple properties, and application boundaries for parabolas and hyperbolas.
- [2] OpenStax Precalculus 2e · The Ellipse — https://openstax.org/books/precalculus-2e/pages/8-1-the-ellipse | 交叉核验椭圆焦点定义、标准方程、参数关系和离心率。 || Cross-checks the focal definition, standard equations, parameter relation, and eccentricity of ellipses.
- [3] OpenStax Precalculus 2e · The Hyperbola — https://openstax.org/books/precalculus-2e/pages/8-2-the-hyperbola | 交叉核验双曲线定义、开口、焦点和渐近线。 || Cross-checks hyperbola definitions, openings, foci, and asymptotes.
- [4] OpenStax Precalculus 2e · The Parabola — https://openstax.org/books/precalculus-2e/pages/8-3-the-parabola | 交叉核验抛物线焦准定义、标准方程和朝向。 || Cross-checks the focus-directrix definition, standard equations, and orientation of parabolas.
