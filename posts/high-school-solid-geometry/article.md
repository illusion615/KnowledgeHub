---
title: "立体几何：从空间关系到向量度量 || Solid Geometry: From Spatial Relations to Vector Measurement"
eyebrow: "高中数学 · 必修与选择性必修 || High School Mathematics · Compulsory and Selective Compulsory"
brand: "高中几何与代数 || High School Geometry and Algebra"
date: 2026-07-16
strict_i18n: false
strict_density: true
lead: "高中立体几何分两层：必修阶段用图形、定理和推理判断直线与平面的平行垂直关系，并计算简单几何体；选择性必修阶段用方向向量、法向量和数量积统一计算角与距离。 || High-school solid geometry has two layers. The compulsory layer uses figures, theorems, and proofs for parallel and perpendicular line-plane relations and simple solids. The selective-compulsory layer uses direction vectors, normal vectors, and dot products to compute angles and distances."
hero_actions:
  - "建立空间框架 || Build the Spatial Framework | #objects"
  - "进入分层自测 || Start Graded Practice | #practice"
panel_label: "统一解题链 || Unified Solution Chain"
panel_title: "先定对象与关系，再选综合法或向量法。 || Identify Objects and Relations, Then Choose Synthetic or Vector Methods"
panel:
  - "从图中列出点、线、面和已知位置关系 || List points, lines, planes, and known positional relations"
  - "证明题反向匹配判定定理的条件 || For proofs, work backward from theorem conditions"
  - "度量题建立坐标系或选基底 || For measurement, build coordinates or choose a basis"
  - "把余弦值转换为题目要求的锐角或距离 || Convert cosine values into the requested acute angle or distance"
metrics:
  - "基本对象 || Basic Objects | 3 | 点 · 直线 · 平面 || Point · line · plane"
  - "位置关系 || Position Relations | 2 组 || 2 groups | 平行 · 垂直 || Parallel · perpendicular"
  - "度量对象 || Measured Quantities | 4 | 线线角 · 线面角 · 二面角 · 距离 || Line-line · line-plane · dihedral · distance"
  - "建议用时 || Study Time | 60 min | 含 6 题分层自测 || Includes six graded exercises"
style:
  accent: "#14b8a6"
---

## #objects 01 / Spatial Objects and Relations :: 点、直线与平面的确定条件构成立体几何推理起点 || Determination Conditions for Points, Lines, and Planes Start Spatial Reasoning

本节先区分直线与直线、直线与平面、平面与平面的全部位置关系，并固定平面确定与交线唯一性；这些事实是后续证明链的基础。 || This section classifies all line-line, line-plane, and plane-plane relations and fixes plane determination and intersection uniqueness; these facts ground every later proof chain.

:::accordion
::panel { open: true }
### 三个不共线点唯一确定一个平面 || Three Noncollinear Points Determine One Plane
平面确定条件可改写为一条直线与线外一点，或两条相交直线，或两条平行直线；每种形式都需要排除退化情形。 || A plane can equivalently be determined by a line and an external point, two intersecting lines, or two parallel lines; each form excludes a degenerate case.

- **三点形式 || Three-Point Form** — 三个不共线点唯一确定一个平面；三点共线时有无数个平面经过该直线。 || Three noncollinear points determine one plane; three collinear points lie on infinitely many planes through their line.
- **线点形式 || Line-and-Point Form** — 一条直线和直线外一点唯一确定一个平面；若点在线上则信息不足。 || A line and a point outside it determine one plane; a point on the line adds no determination.
- **两线形式 || Two-Line Form** — 两条相交直线或两条平行直线唯一确定一个平面；异面直线不共面。 || Two intersecting or parallel lines determine one plane; skew lines are not coplanar.

::panel
### 三组位置关系覆盖所有非退化情形 || Three Relation Groups Cover All Nondegenerate Cases
空间中两直线增加了异面情形；直线与平面、两平面则按公共点数量分类。 || Space adds skew lines to the line-line classification; line-plane and plane-plane relations are classified by common points.

| 对象 || Objects | 位置关系 || Relations | 识别事实 || Identifying Fact |
| --- | --- | --- |
| 两直线 || Two lines | 相交、平行、异面、重合 || Intersecting, parallel, skew, coincident | 异面直线既不平行也不相交，且不共面 || Skew lines neither intersect nor run parallel and are not coplanar |
| 直线与平面 || Line and plane | 相交、平行、线在面内 || Intersecting, parallel, contained | 公共点分别为 1 个、0 个、无数个 || They have one, zero, or infinitely many common points |
| 两平面 || Two planes | 相交、平行、重合 || Intersecting, parallel, coincident | 两个不同平面若有公共点，其交集是一条直线 || If two distinct planes share a point, their intersection is a line |
:::

## #parallel 02 / Parallel Relations :: 线面与面面平行证明都要在平面内找到足够的方向约束 || Line-Plane and Plane-Plane Parallel Proofs Require Sufficient Directional Constraints Within a Plane

上一节列出位置关系，本节把目标反向展开为判定条件，并区分判定定理与性质定理的使用方向。 || The previous section classified relations. This section works backward from proof targets to theorem conditions and distinguishes criteria from consequences.

:::accordion
::panel { open: true }
### 线面平行需要线外条件与面内平行线 || Line-Plane Parallelism Requires an External Line and a Parallel Line in the Plane
若平面外直线 a 平行于平面 α 内直线 b，则 a 平行于 α；其中 a 不在 α 内是不可省略的条件。 || If line a outside plane α is parallel to line b in α, then a is parallel to α; the condition that a is not contained in α cannot be omitted.

1. **目标展开 || Expand the Target** — 要证 a ∥ α，寻找 α 内一条可由中位线、平行四边形或比例关系证明与 a 平行的直线 b。 || To prove a ∥ α, find b in α that can be shown parallel to a through a midline, parallelogram, or proportional relation.
2. **排除线在面内 || Exclude Containment** — 通过端点不在平面、与平面无公共点或题设位置说明 a 不在 α 内。 || Use endpoints outside the plane, no common point, or a stated position to show a is not contained in α.
3. **调用判定定理 || Apply the Criterion** — 同时写明 b 在 α 内、a ∥ b、a 不在 α 内，才完成条件闭环。 || State b lies in α, a ∥ b, and a is outside α to close every condition.

> **失败样例 || Failure Case**
> 只证明 a 平行于 α 内一条直线不能排除 a 也在 α 内；此时 a 与 α 的关系是线在面内，不是线面平行。 || Showing only that a is parallel to a line in α does not exclude a itself lying in α; that relation is containment, not line-plane parallelism.

::panel
### 面面平行需要一个平面内两条相交线提供两个方向 || Plane-Plane Parallelism Requires Two Intersecting Directions in One Plane
若平面 α 内两条相交直线分别平行于平面 β，则 α ∥ β；两条线必须相交，否则可能只约束同一个方向。 || If two intersecting lines in plane α are each parallel to plane β, then α ∥ β. The lines must intersect; otherwise they may constrain only one direction.

判定方向 || Criterion Direction

**由两组线面平行推出面面平行 || Infer Plane-Plane Parallelism From Two Line-Plane Relations**

需要 a、b 在 α 内且相交，并分别平行于 β。 || Lines a and b must intersect within α and each be parallel to β.

性质方向 || Consequence Direction

**由面面平行推出交线平行 || Infer Parallel Intersection Lines From Parallel Planes**

若 α ∥ β，第三平面 γ 分别与其交于 a、b，则 a ∥ b。 || If α ∥ β and third plane γ meets them in a and b, then a ∥ b.
:::

## #perpendicular 03 / Perpendicular Relations :: 线面垂直以面内两条相交线为判据，面面垂直以一条垂线为判据 || Line-Plane Perpendicularity Uses Two Intersecting In-Plane Lines, While Plane-Plane Perpendicularity Uses One Normal Line

平行证明依赖方向一致，本节改用方向正交；两条相交线再次用于确保控制整个平面，而不只是一个方向。 || Parallel proofs relied on matching directions. This section uses orthogonality; two intersecting lines again ensure control of the whole plane rather than one direction.

:::accordion
::panel { open: true }
### 垂直于面内两条相交线即可垂直于整个平面 || Perpendicularity to Two Intersecting In-Plane Lines Gives Perpendicularity to the Plane
若直线 l 分别垂直于平面 α 内相交直线 a、b，则 l ⟂ α；只垂直一条面内直线不足以确定线面垂直。 || If line l is perpendicular to intersecting lines a and b in plane α, then l is perpendicular to α. Perpendicularity to only one in-plane line is insufficient.

- **判定条件包含相交 || The Criterion Requires Intersection** — a、b 若平行，只提供一个方向约束，不能代表整个平面的方向空间。 || Parallel a and b provide only one directional constraint and do not span the plane's directions.
- **性质覆盖面内任意直线 || The Consequence Covers Every In-Plane Line** — 已知 l ⟂ α 后，l 垂直于 α 内所有与垂足相交的直线。 || Once l ⟂ α, line l is perpendicular to every line in α through the foot.
- **平行转移垂直关系 || Parallelism Transfers Perpendicularity** — 若 a ∥ b 且 a ⟂ α，则 b ⟂ α；若 α ∥ β 且 l ⟂ α，则 l ⟂ β。 || If a ∥ b and a ⟂ α, then b ⟂ α; if α ∥ β and l ⟂ α, then l ⟂ β.

::panel
### 一个平面经过另一个平面的垂线时两平面垂直 || A Plane Containing a Normal Line to Another Plane Is Perpendicular to It
若平面 α 内存在直线 l，使 l ⟂ β，则 α ⟂ β；证明面面垂直的任务因此转化为在线面内寻找一条线面垂线。 || If plane α contains a line l perpendicular to plane β, then α is perpendicular to β; proving plane-plane perpendicularity reduces to finding one normal line inside a plane.

1. **在目标平面内选候选直线 || Choose a Candidate Line in the Target Plane** — 常选棱、高、底面对角线或连接特殊点的直线。 || Typical candidates are edges, altitudes, base diagonals, or lines through special points.
2. **证明候选线垂直另一平面 || Prove the Candidate Is Normal to the Other Plane** — 再在另一平面中找到两条相交线，分别证明垂直。 || Find two intersecting lines in the other plane and prove perpendicularity to both.
3. **调用面面垂直判定 || Apply the Plane-Plane Criterion** — 写明候选线属于第一个平面且垂直第二个平面。 || State that the candidate line lies in the first plane and is perpendicular to the second.
:::

## #metrics 04 / Spatial Angles and Distances :: 所有空间角都可转成两条方向向量的夹角，距离都取最短垂线段 || Every Spatial Angle Reduces to Direction Vectors, and Every Distance Uses the Shortest Perpendicular Segment

平行与垂直定理解决定性关系，本节建立线线角、线面角、二面角和点面距离的定量定义，为空间向量计算做准备。 || Parallel and perpendicular theorems provide qualitative relations. This section defines line-line, line-plane, dihedral angles, and point-plane distance quantitatively in preparation for vector calculation.

:::accordion
::panel { open: true }
### 三类空间角使用不同代表线 || Three Spatial Angles Use Different Representative Lines
计算前必须先说明所取平面角为何等于原空间角；只在图上看起来相等不能作为证明。 || Before calculation, justify why the selected plane angle represents the spatial angle; visual appearance alone is not proof.

| 角 || Angle | 定义性构造 || Defining Construction | 取值 || Range |
| --- | --- | --- |
| 异面直线所成角 || Angle between skew lines | 平移一条或两条直线，使代表线相交后取锐角或直角 || Translate one or both lines to intersect, then take the acute or right angle | 0° < θ ≤ 90° |
| 直线与平面所成角 || Line-plane angle | 直线与其在平面内正射影的夹角 || Angle between the line and its orthogonal projection in the plane | 0° ≤ θ ≤ 90° |
| 二面角 || Dihedral angle | 在棱上同一点，分别在两半平面内作垂直于棱的射线 || At one point on the edge, draw one ray in each face perpendicular to the edge | 0° ≤ θ ≤ 180° |

::panel
### 距离由垂直线段定义并要求端点位置明确 || Distance Is Defined by a Perpendicular Segment With Specified Endpoints
点到平面的距离是该点到平面垂足的线段长度；平行线面或平行平面距离可转成任取一点到另一对象的距离。 || Point-plane distance is the segment from the point to its perpendicular foot. For parallel line-plane or plane-plane objects, choose any point on one and measure to the other.

- **点面距离 || Point-Plane Distance** — 从点 P 向平面 α 作垂线，垂足 H 在 α 内，则 PH 是距离。 || Drop a perpendicular from P to plane α with foot H in α; PH is the distance.
- **平行线面距离 || Parallel Line-Plane Distance** — 若 l ∥ α，l 上任一点到 α 的距离相等；可选计算最方便的点。 || If l ∥ α, every point on l has the same distance to α; choose the easiest point.
- **平行平面距离 || Parallel-Plane Distance** — 若 α ∥ β，α 内任一点到 β 的距离相等。 || If α ∥ β, every point in α has the same distance to β.
:::

## #solids 05 / Spatial Solids :: 棱柱、棱锥、圆柱、圆锥与球的表面积和体积由截面结构决定 || Surface Area and Volume of Prisms, Pyramids, Cylinders, Cones, and Spheres Follow Their Cross-Section Structure

前四节处理位置与度量，本节转向几何体本身，统一底面积、高、母线和半径的角色，并明确斜高与垂直高不可混用。 || The first four sections handled relations and measures. This section turns to solids, unifies the roles of base area, height, slant height, and radius, and separates slant from perpendicular height.

:::accordion
::panel { open: true }
### 体积公式由等截面或相似截面区分 || Volume Formulas Separate Equal and Similar Cross Sections
柱体沿高方向保持等底面积，因此体积为底面积乘高；锥体截面随高度按相似比变化，因此体积多出系数 1/3。 || Prismatic solids preserve equal cross-sectional area along the height, giving base area times height. Conical solids scale by similarity, producing the factor 1/3.

| 几何体 || Solid | 体积 || Volume | 表面积要点 || Surface-Area Note |
| --- | --- | --- |
| 棱柱或圆柱 || Prism or cylinder | V = S_base h | 总表面积 = 两底面 + 侧面积 || Total area = two bases + lateral area |
| 棱锥或圆锥 || Pyramid or cone | V = S_base h/3 | 圆锥侧面积 πrl 使用母线 l || Cone lateral area πrl uses slant height l |
| 球 || Sphere | V = 4πr³/3 | S = 4πr² |

> **易错边界 || Error Boundary**
> 体积中的 h 必须是两底面间或顶点到底面的垂直距离；圆锥侧面积中的 l 是母线。斜锥或斜柱不能把侧棱直接当作高。 || In volume formulas, h is the perpendicular distance between bases or from vertex to base. In cone lateral area, l is the slant height. A slanted edge is not automatically the height of an oblique solid.
:::

## #vectors 06 / Spatial Vector Method :: 方向向量、法向量与数量积把空间证明和度量统一为坐标计算 || Direction Vectors, Normal Vectors, and Dot Products Unify Spatial Proof and Measurement as Coordinate Calculation

综合几何已经给出定理体系，本节把平面向量推广到三维，用方向向量描述直线、用法向量描述平面，并计算平行、垂直、角与距离。 || Synthetic geometry supplied the theorem system. This section extends plane vectors to three dimensions, describes lines with direction vectors and planes with normal vectors, and calculates parallelism, perpendicularity, angles, and distances.

:::accordion
::panel { open: true }
### 空间坐标与基本定理把三维方向写成三个分量 || Spatial Coordinates and the Basis Theorem Encode Direction in Three Components
三个不共面的向量构成空间的一组基底，任意空间向量都可唯一线性表示；正交单位基底使分量直接对应 x、y、z 坐标。 || Three noncoplanar vectors form a spatial basis, uniquely representing every vector as a linear combination. An orthonormal basis makes components equal to x, y, and z coordinates.

$$
\overrightarrow{AB}=(x_B-x_A,\ y_B-y_A,\ z_B-z_A),\qquad |AB|=\sqrt{\Delta x^2+\Delta y^2+\Delta z^2}
$$

$$
a\cdot b=x_1x_2+y_1y_2+z_1z_2
$$

- **直线用方向向量 || A Line Uses a Direction Vector** — 同一直线可选任意非零平行向量作为方向向量；方向向量只确定方向，不单独确定位置。 || Any nonzero parallel vector can direct the same line; a direction vector determines orientation but not position alone.
- **平面用法向量 || A Plane Uses a Normal Vector** — 法向量垂直于平面内所有方向；非零数倍仍是同一平面的法向量方向。 || A normal vector is perpendicular to every direction in the plane; any nonzero scalar multiple gives the same normal direction.
- **平面法向量由两条相交方向约束 || Two Intersecting Directions Constrain a Plane Normal** — 若平面内有不共线向量 u、v，则法向量 n 同时满足 n·u = 0、n·v = 0。 || For nonparallel in-plane vectors u and v, a normal n satisfies n·u = 0 and n·v = 0.

::panel
### 四类关系由方向向量与法向量的比例或数量积判断 || Four Relations Follow From Proportionality or Dot Products of Direction and Normal Vectors
设直线方向向量为 v、平面法向量为 n；关系判定必须再结合公共点或包含关系，单靠方向有时只能说明平行方向。 || Let v be a line direction and n a plane normal. Directional tests may need common-point or containment information, because direction alone can indicate only parallel orientation.

| 目标关系 || Target Relation | 向量条件 || Vector Condition | 补充检查 || Additional Check |
| --- | --- | --- |
| 两直线平行 || Parallel lines | v₁ = λv₂ | 区分平行与重合 || Distinguish parallel from coincident |
| 两直线垂直 || Perpendicular lines | v₁·v₂ = 0 | 若讨论相交垂直，还需证明有公共点 || For intersecting perpendicular lines, also prove a common point |
| 直线平行平面 || Line parallel to plane | v·n = 0 | 排除直线在平面内 || Exclude line containment in the plane |
| 直线垂直平面 || Line perpendicular to plane | v = λn | v、n 均非零 || Both v and n are nonzero |
| 两平面平行 || Parallel planes | n₁ = λn₂ | 区分平行与重合 || Distinguish parallel from coincident |
| 两平面垂直 || Perpendicular planes | n₁·n₂ = 0 | 两法向量非零 || Both normals are nonzero |

::panel
### 夹角与距离通过投影统一计算 || Angles and Distances Are Unified Through Projection
向量夹角先给出余弦；线面角取方向向量与法向量夹角的余角，二面角可由两法向量夹角确定并按图形选择 θ 或 180° − θ。 || Vector angles first give a cosine. A line-plane angle is complementary to the line-direction/normal angle. A dihedral angle follows from normals, with θ or 180° − θ selected from the geometry.

$$
\cos\theta_{\text{line-line}}=\frac{|v_1\cdot v_2|}{|v_1||v_2|}
$$

$$
\sin\theta_{\text{line-plane}}=\frac{|v\cdot n|}{|v||n|}
$$

$$
d(P,\alpha)=\frac{|\overrightarrow{AP}\cdot n|}{|n|}\quad(A\in\alpha)
$$

> **角度判定 || Angle Selection**
> 绝对值公式通常返回锐角或直角。题目若要求二面角的具体平面角，必须结合两半平面方向判断取锐角还是钝角，不能只报 arccos 的锐角值。 || Absolute-value formulas usually return an acute or right angle. If a problem requests a particular dihedral plane angle, inspect the two half-planes to choose the acute or obtuse supplement rather than reporting only the acute arccos value.
:::

## #practice 07 / Graded Practice :: 六道题检验关系判定、体积、空间向量与距离 || Six Problems Test Relation Criteria, Volume, Spatial Vectors, and Distance

前六节已经覆盖必修综合几何与选择性必修向量法；本节按定性、度量和坐标三层检查证明条件与计算边界。 || The first six sections covered compulsory synthetic geometry and selective-compulsory vector methods. This section checks proof conditions and calculation boundaries at qualitative, metric, and coordinate levels.

:::accordion
::panel { open: true }
### 定性层：平行与垂直判定 || Qualitative: Parallel and Perpendicular Criteria
每题都要写全定理条件，不能只给图形直觉。 || State every theorem condition; visual intuition alone is insufficient.

1. **为何线面平行判定要补充线不在面内 || Why Must a Line-Plane Parallel Proof Exclude Containment?** — 因为面内也可能有一条直线与 a 平行；若 a 本身在面内，结论应是线在面内而不是线面平行。 || A plane may contain another line parallel to a even when a itself lies in the plane; then the relation is containment, not line-plane parallelism.
2. **直线 l 垂直平面内两条平行线，能否推出 l 垂直该平面 || If l Is Perpendicular to Two Parallel In-Plane Lines, Is l Perpendicular to the Plane?** — 不能。两条平行线只提供同一个方向；判定定理要求面内两条相交直线。 || No. Parallel lines provide only one direction; the criterion requires two intersecting in-plane lines.

::panel
### 度量层：体积与空间角 || Measurement: Volume and Spatial Angles
先确认公式中的高和代表角，再代入数据。 || Identify the perpendicular height and representative angle before substitution.

1. **底面积 18、高 5 的棱锥体积 || Find the Volume of a Pyramid With Base Area 18 and Height 5** — V = 18 × 5 / 3 = 30。高必须是顶点到底面的垂直距离。 || V = 18 × 5 / 3 = 30. The height must be perpendicular from vertex to base.
2. **直线方向向量 v 与平面法向量 n 的夹角为 30°，求线面角 || A Line Direction v Makes 30° With Plane Normal n; Find the Line-Plane Angle** — 线面角是余角，所以为 60°；不能把方向向量与法向量的夹角直接作答。 || The line-plane angle is the complement, 60°; the direction-normal angle is not the requested angle.

::panel
### 坐标层：空间距离与点面距离 || Coordinates: Spatial and Point-Plane Distance
空间距离用三个坐标差，点面距离用连接向量在法向量上的投影长度。 || Spatial point distance uses three coordinate differences; point-plane distance uses the projection of a connecting vector onto the normal.

1. **A(1, 2, −1)、B(4, 6, 1)，求 AB || For A(1, 2, −1) and B(4, 6, 1), Find AB** — AB 向量为 (3, 4, 2)，所以 AB = √(9 + 16 + 4) = √29。 || Vector AB is (3, 4, 2), so AB = √(9 + 16 + 4) = √29.
2. **平面过 A，法向量 n = (0, 0, 1)，点 P 比 A 的 z 坐标高 7，求点面距离 || A Plane Through A Has Normal n = (0, 0, 1); P Is 7 Units Higher in z; Find the Distance** — AP 在法向量方向的投影长度为 |AP·n|/|n| = 7，因此距离为 7。 || The projection of AP onto the normal has length |AP·n|/|n| = 7, so the distance is 7.
:::

## #references 08 / References :: 必修定理边界与空间向量方法均有可核验来源 || The Compulsory Theorem Boundary and Spatial Vector Method Have Verifiable Sources

前文按 2025 日常修订版衔接立体几何初步与空间向量，并用开放教材交叉核验三维坐标、方向向量、法向量、角与距离公式。 || The article follows the 2025 daily revision to connect introductory solid geometry with spatial vectors and cross-checks three-dimensional coordinates, direction and normal vectors, angles, and distances against open textbooks.

- [1] 课程标准 · 普通高中数学课程标准日常修订版（2017 年版 2025 年修订） — http://www.bdtxjys.cn/xiangqing_7/2.html | 支撑立体几何初步的平行、垂直、几何体与证明边界，以及空间向量的坐标、方向向量、法向量、夹角和距离要求。 || Supports introductory solid geometry relations, solids, and proof boundaries, plus spatial-vector coordinates, direction vectors, normal vectors, angles, and distances.
- [2] OpenStax Calculus Volume 3 · Vectors in Three Dimensions — https://openstax.org/books/calculus-volume-3/pages/2-2-vectors-in-three-dimensions | 交叉核验三维坐标、两点距离、空间向量分量、模、单位向量和线性运算。 || Cross-checks three-dimensional coordinates, point distance, vector components, magnitude, unit vectors, and linear operations.
- [3] OpenStax Calculus Volume 3 · Equations of Lines and Planes in Space — https://openstax.org/books/calculus-volume-3/pages/2-5-equations-of-lines-and-planes-in-space | 交叉核验方向向量、法向量、线面关系、点面距离与两平面夹角。本文只采用高中课程范围内的部分。 || Cross-checks direction vectors, normal vectors, line-plane relations, point-plane distance, and plane angles. Only the senior-high subset is used here.
