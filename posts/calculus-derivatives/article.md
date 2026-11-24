---
title: "导数：捕捉瞬间的变化率 || Derivatives: Capturing Instantaneous Rates of Change"
eyebrow: "微积分系列 · 第三篇 · 高中完整范围 || Calculus Series · Part 3 · Complete Senior-High Scope"
brand: "微积分 || Calculus"
date: 2026-07-16
strict_i18n: false
strict_density: true
lead: "导数把函数在一点附近的局部变化压缩成一个数。高中阶段不仅要会求导，还要用导数写切线、判定单调区间、寻找极值与闭区间最值，并解决不超过三次多项式和简单实际模型。 || A derivative compresses a function's local change near one point into one number. Senior-high study goes beyond differentiation to tangent lines, monotonic intervals, extrema, closed-interval maxima and minima, and simple applications involving polynomials of degree at most three."
hero_actions:
  - "从定义开始 || Start From the Definition | #definition"
  - "进入分层自测 || Start Graded Practice | #practice"
panel_label: "研究函数主线 || Function-Analysis Spine"
panel_title: "求导只是入口，符号变化才把局部信息变成整体性质。 || Differentiation Is the Entry; Sign Changes Convert Local Data Into Global Behavior"
panel:
  - "平均变化率取极限得到瞬时变化率 || A limit of average rates gives the instantaneous rate"
  - "导数值等于曲线切线斜率 || The derivative value equals the tangent slope"
  - "导数正负决定函数增减 || The derivative sign determines increase or decrease"
  - "导数变号与端点比较决定极值和最值 || Sign changes and endpoint comparisons determine extrema and absolute values"
metrics:
  - "高中任务 || Senior-High Tasks | 5 | 定义 · 求导 · 切线 · 单调 · 最值 || Definition · differentiate · tangent · monotonicity · extrema"
  - "简单复合函数 || Simple Composite Form | f(ax+b) | 2025 课标明确边界 || Explicit 2025 curriculum boundary"
  - "多项式范围 || Polynomial Scope | ≤ 3 次 || Degree ≤ 3 | 单调区间与闭区间最值 || Monotonic intervals and closed-interval extrema"
  - "建议用时 || Study Time | 60 min | 含 6 题分层自测 || Includes six graded exercises"
style:
  accent: "#fb7185"
---

## #meaning 01 / Rates and Local Linearity :: 导数同时描述瞬时变化率与局部切线斜率 || A Derivative Describes Both Instantaneous Rate and Local Tangent Slope

本节先把物理变化率、函数图象和局部线性统一起来；下一节再用极限把这种直觉写成定义。 || This section unifies physical rate, function graphs, and local linearity; the next section writes that intuition as a limit definition.

:::accordion
::panel { open: true }
### 平均变化率只描述区间，导数描述一点附近 || Average Rate Describes an Interval; the Derivative Describes a Neighborhood of One Point
函数从 x₁ 到 x₂ 的平均变化率是割线斜率；让第二点无限接近第一点，割线趋向切线，平均变化率趋向瞬时变化率。 || The average rate from x₁ to x₂ is the secant slope. As the second point approaches the first, the secant approaches the tangent and the average rate approaches the instantaneous rate.

区间信息 || Interval Information

**平均变化率是割线斜率 || Average Rate Is a Secant Slope**

$$
\frac{f(x_2)-f(x_1)}{x_2-x_1}
$$

例如 4 秒内路程增加 20 米，平均速度为 5 m/s，但不能说明每一秒都以 5 m/s 运动。 || If distance grows 20 m in 4 s, average speed is 5 m/s, but this does not imply speed was 5 m/s at every instant.

局部信息 || Local Information

**瞬时变化率是切线斜率 || Instantaneous Rate Is a Tangent Slope**

$$
f'(x_0)
$$

位置函数的导数是瞬时速度；速度函数的导数是瞬时加速度。 || The derivative of position is instantaneous velocity; the derivative of velocity is instantaneous acceleration.

::panel
### 可导意味着函数在该点附近可用直线近似 || Differentiability Means the Function Is Locally Approximated by a Line
当 f 在 x₀ 处可导，足够小的增量 Δx 产生的函数增量近似为 f'(x₀)Δx；误差相对 Δx 更小。 || If f is differentiable at x₀, a sufficiently small increment Δx produces function change approximately f'(x₀)Δx, with error smaller relative to Δx.

$$
f(x_0+\Delta x)\approx f(x_0)+f'(x_0)\Delta x
$$

- **导数为正表示局部上升 || A Positive Derivative Means Local Increase** — 小的正 Δx 通常产生正函数增量。 || A small positive Δx generally produces a positive function change.
- **导数为负表示局部下降 || A Negative Derivative Means Local Decrease** — 小的正 Δx 通常产生负函数增量。 || A small positive Δx generally produces a negative function change.
- **导数为零只说明水平切线 || A Zero Derivative Gives Only a Horizontal Tangent** — x³ 在 0 处导数为 0，却没有极大或极小值；极值还要检查导数变号。 || x³ has derivative 0 at 0 but no local maximum or minimum; extrema require a derivative sign change.
:::

## #definition 02 / Derivative Definition :: 差商极限存在且有限时，函数在该点可导 || A Function Is Differentiable Where the Difference-Quotient Limit Exists and Is Finite

上一节给出割线趋向切线的直觉，本节把增量写成统一差商，并用左右极限说明尖点、间断和竖直切线为何可能不可导。 || The previous section gave the secant-to-tangent intuition. This section writes the common difference quotient and uses one-sided limits to explain nondifferentiability at corners, discontinuities, and vertical tangents.

:::accordion
::panel { open: true }
### 导数定义把区间宽度压缩到零 || The Derivative Definition Shrinks Interval Width to Zero
令 h 表示自变量增量，差商给出从 x₀ 到 x₀ + h 的平均变化率；h 趋近 0 时若有唯一有限极限，该极限就是导数。 || Let h denote the input increment. The difference quotient gives the average rate from x₀ to x₀ + h; if it has one finite limit as h approaches 0, that limit is the derivative.

$$
f'(x_0)=\lim_{h\to0}\frac{f(x_0+h)-f(x_0)}{h}
$$

1. **固定研究点 || Fix the Point of Study** — x₀ 保持不变，x₀ + h 从左右两侧接近它。 || Keep x₀ fixed while x₀ + h approaches it from both sides.
2. **先化简差商再取极限 || Simplify the Difference Quotient Before Taking the Limit** — 直接代 h = 0 通常得到 0/0；应先因式分解或有理化消去 h。 || Direct substitution h = 0 usually gives 0/0; factor or rationalize before taking the limit.
3. **检查左右极限一致 || Check Matching One-Sided Limits** — 左右差商趋向不同值时，双侧导数不存在。 || If the one-sided difference quotients approach different values, the two-sided derivative does not exist.

::panel
### 用定义推导 x²、倒数与平方根的导数 || Use the Definition for x², the Reciprocal, and the Square Root
定义推导展示公式从差商产生；考试中通常使用公式表，但应能对课标列出的基本函数执行定义计算。 || Definition derivations show how formulas arise. Routine problems use a derivative table, but students should perform definition calculations for the basic functions listed by the curriculum.

$$
f(x)=x^2:\quad \frac{(x+h)^2-x^2}{h}=2x+h\longrightarrow f'(x)=2x
$$

$$
f(x)=\frac1x:\quad \frac{\frac1{x+h}-\frac1x}{h}=-\frac1{x(x+h)}\longrightarrow f'(x)=-\frac1{x^2}
$$

$$
f(x)=\sqrt x:\quad \frac{\sqrt{x+h}-\sqrt x}{h}=\frac1{\sqrt{x+h}+\sqrt x}\longrightarrow f'(x)=\frac1{2\sqrt x}\quad(x>0)
$$

::panel
### 可导必连续，但连续不保证可导 || Differentiability Implies Continuity, but Continuity Does Not Imply Differentiability
可导要求差商极限存在，因此函数值必须与邻近值衔接；反过来，连续函数仍可能在尖点或竖直切线处不可导。 || Differentiability requires a difference-quotient limit, forcing the function value to connect with nearby values. Conversely, a continuous function may fail to be differentiable at a corner or vertical tangent.

- **跳跃或空点导致不连续 || Jumps or Holes Break Continuity** — 函数在该点不连续时一定不可导。 || A function that is discontinuous at a point is not differentiable there.
- **绝对值在原点形成尖点 || Absolute Value Has a Corner at the Origin** — |x| 在 0 处连续，但左导数 −1、右导数 1，不可导。 || |x| is continuous at 0, but its left derivative is −1 and right derivative is 1.
- **竖直切线对应无限斜率 || A Vertical Tangent Has Infinite Slope** — 高中导数取有限实数值；差商趋向无穷时不称该点可导。 || In the senior-high definition, a derivative is finite and real; divergence to infinity is not differentiability.
:::

## #rules 03 / Derivative Formulas and Rules :: 公式表与四则运算法则覆盖高中简单函数和 f(ax+b) || A Derivative Table and Arithmetic Rules Cover Senior-High Simple Functions and f(ax+b)

定义说明公式来源，本节建立实际计算工具：基本初等函数导数、和差积商规则，以及课标限定的简单复合函数。 || The definition explained where formulas come from. This section builds the working toolkit: derivatives of elementary functions, sum-product-quotient rules, and curriculum-bounded simple composites.

:::accordion
::panel { open: true }
### 基本初等函数导数表 || Derivative Table for Elementary Functions
使用公式前要同时检查原函数定义域和导数公式适用区间；例如 ln x 与 √x 的导数都只在正数区间使用。 || Before using a formula, check both the function domain and the interval where the derivative formula applies; for example, derivatives of ln x and √x are used only for positive x.

| 函数 || Function | 导数 || Derivative | 条件 || Condition |
| --- | --- | --- |
| c | 0 | c 为常数 || c is constant |
| x^n | nx^{n−1} | 按函数定义域使用 || Use on the function's domain |
| sin x | cos x | x 用弧度 || x is measured in radians |
| cos x | −sin x | x 用弧度 || x is measured in radians |
| e^x | e^x | 所有实数 x || All real x |
| a^x | a^x ln a | a > 0, a ≠ 1 |
| ln x | 1/x | x > 0 |
| log_a x | 1/(x ln a) | x > 0, a > 0, a ≠ 1 |

::panel
### 和差逐项求导，积商必须保留交叉项 || Differentiate Sums Termwise; Products and Quotients Need Cross Terms
常数倍和加减可直接分配导数；乘积导数不是两个导数相乘，商法则的分子顺序也不能颠倒。 || Derivatives distribute over constant multiples and sums. A product derivative is not the product of derivatives, and the quotient-rule numerator order matters.

| 结构 || Structure | 法则 || Rule | 检查 || Check |
| --- | --- | --- |
| cf(x) | [cf(x)]' = cf'(x) | c 与 x 无关 || c is independent of x |
| f(x) ± g(x) | f'(x) ± g'(x) | 逐项保持符号 || Preserve each sign termwise |
| f(x)g(x) | f'(x)g(x) + f(x)g'(x) | 两个交叉项相加 || Add two cross terms |
| f(x)/g(x) | [f'(x)g(x) − f(x)g'(x)]/g²(x) | g(x) ≠ 0 |

$$
[x^2e^x]'=2xe^x+x^2e^x=e^x(x^2+2x)
$$

::panel
### f(ax+b) 的导数多一个内层斜率 a || The Derivative of f(ax+b) Includes the Inner Slope a
2025 课标把简单复合函数限定为 f(ax+b)。外层按公式求导后，还要乘内层线性函数 ax+b 的导数 a。 || The 2025 curriculum bounds simple composites to f(ax+b). Differentiate the outer function and multiply by the derivative a of the inner linear function ax+b.

$$
[f(ax+b)]'=a f'(ax+b)
$$

- **幂函数复合 || Power Composite** — 外层三次幂给 3(2x−1)²，再乘内层导数 2。 || The outer cube gives 3(2x−1)², then multiply by inner derivative 2.
- **三角函数复合 || Trigonometric Composite** — 外层正弦变余弦，再乘内层导数 3。 || The outer sine becomes cosine, then multiply by inner derivative 3.
- **指数函数复合 || Exponential Composite** — 漏乘 −4 会同时写错符号和变化速度。 || Omitting −4 gives both the wrong sign and wrong rate.
:::

## #tangent 04 / Tangent and Normal Lines :: 切线方程由切点坐标与该点导数唯一确定 || A Tangent Line Is Determined by the Point and the Derivative There

导数公式已经可计算，本节把 f'(x₀) 作为斜率写出切线，并区分已知切点、已知切线过外点和法线三类条件。 || Derivative formulas now make slopes computable. This section writes the tangent using f'(x₀) and separates known-contact, external-point, and normal-line conditions.

:::accordion
::panel { open: true }
### 已知切点时用点斜式一步写出切线 || With a Known Contact Point, Use Point-Slope Form Directly
曲线 y = f(x) 在 x = x₀ 处的切点为 (x₀, f(x₀))，斜率为 f'(x₀)。 || For y = f(x), the contact point at x = x₀ is (x₀, f(x₀)) and the tangent slope is f'(x₀).

$$
y-f(x_0)=f'(x_0)(x-x_0)
$$

1. **求切点纵坐标 || Find the Contact y-Coordinate** — 把 x₀ 代入原函数，不是代入导函数。 || Substitute x₀ into the original function, not the derivative.
2. **求切线斜率 || Find the Tangent Slope** — 把 x₀ 代入导函数得到 f'(x₀)。 || Substitute x₀ into the derivative to obtain f'(x₀).
3. **用点斜式并按要求整理 || Use Point-Slope Form and Simplify as Requested** — 先保留点斜式便于检查，再展开为一般式或斜截式。 || Keep point-slope form for checking before expanding to general or slope-intercept form.

::panel
### 切线过外点时切点横坐标是未知量 || When a Tangent Passes Through an External Point, the Contact x-Coordinate Is Unknown
设切点横坐标为 t，先写曲线在 t 处的切线，再把外点坐标代入；不能把外点横坐标直接当切点横坐标。 || Let the contact x-coordinate be t, write the tangent at t, and then substitute the external point. The external point's x-coordinate is not automatically the contact coordinate.

$$
y-f(t)=f'(t)(x-t)
$$

切点条件 || Contact Condition

**点 (t, f(t)) 必须在曲线上 || Point (t, f(t)) Must Lie on the Curve**

该条件由写成 f(t) 自动满足。 || Writing the point as f(t) enforces this condition automatically.

外点条件 || External-Point Condition

**给定点只需落在切线上 || The Given Point Need Only Lie on the Tangent**

代入切线方程后解 t，可能得到零个、一个或多个切点。 || Substitute it into the tangent equation and solve for t; zero, one, or multiple contact points may result.

> **法线边界 || Normal-Line Boundary**
> 当切线斜率 f'(x₀) 非零时，法线斜率为 −1/f'(x₀)。若切线水平，则法线为竖直线 x = x₀，不能写成有限斜率形式。 || When tangent slope f'(x₀) is nonzero, the normal slope is −1/f'(x₀). If the tangent is horizontal, the normal is the vertical line x = x₀ and has no finite slope form.
:::

## #monotonicity 05 / Derivatives and Monotonicity :: 在连续区间上，导数符号表把临界点连接成单调区间 || On a Continuous Interval, a Derivative Sign Chart Connects Critical Points Into Monotonic Intervals

切线处理一点，本节把 f'(x) 的符号扩展到整个定义域；按 2025 课标，多项式重点控制在不超过三次。 || Tangents handled one point. This section extends the sign of f'(x) across the domain; under the 2025 curriculum, polynomial analysis focuses on degree at most three.

:::accordion
::panel { open: true }
### 四步符号表法确定单调区间 || A Four-Step Sign-Chart Method Determines Monotonic Intervals
先确定原函数定义域，再求导数为零或不存在的分界点；在每个开区间判断导数符号。 || Start with the original function's domain, then find points where the derivative is zero or undefined; test the derivative sign on each open interval.

1. **写原函数定义域 || Write the Original Domain** — 对数真数、分母和根式条件可能把数轴分成多个部分。 || Logarithm arguments, denominators, and radicals may split the number line into several parts.
2. **求 f'(x) 并解临界条件 || Find f'(x) and Solve Critical Conditions** — 求 f'(x) = 0，并记录定义域内导数不存在的点。 || Solve f'(x) = 0 and record points in the domain where f'(x) is undefined.
3. **判断各区间符号 || Determine the Sign on Each Interval** — 可用因式符号、二次函数图象或测试点；不能只看临界点本身。 || Use factor signs, a quadratic graph, or test points; critical-point values alone are insufficient.
4. **写开区间结论 || State Open-Interval Conclusions** — f' 正的区间递增，f' 负的区间递减；分界点通常不写进单调开区间。 || The function increases where f' is positive and decreases where f' is negative; boundary points are normally excluded from open monotonic intervals.

::panel
### 三次函数的导数是二次函数，判别式决定转折结构 || A Cubic Has a Quadratic Derivative, Whose Discriminant Controls Turning Structure
对三次多项式 f，f' 为二次函数；其零点数量决定符号表有零个、一个二重点或两个分界点。 || For a cubic polynomial f, derivative f' is quadratic; its number of real zeros gives zero, one repeated, or two sign-chart boundaries.

| f' 的判别式 || Discriminant of f' | 临界点 || Critical Points | 可能结构 || Possible Structure |
| --- | --- | --- |
| Δ < 0 | 无实零点 || No real zeros | f' 恒同号，f 在全域单调 || f' keeps one sign, so f is monotonic throughout |
| Δ = 0 | 一个二重零点 || One repeated zero | f' 通常不变号，水平切线不一定是极值 || f' usually does not change sign; a horizontal tangent need not be an extremum |
| Δ > 0 | 两个不同零点 || Two distinct zeros | 可能形成增减增或减增减 || May form increase-decrease-increase or the reverse |

$$
f(x)=x^3-3x:\quad f'(x)=3(x-1)(x+1)
$$

导数在 (−∞, −1) 与 (1, +∞) 为正、在 (−1, 1) 为负，因此 f 先增、后减、再增。 || The derivative is positive on (−∞, −1) and (1, +∞) and negative on (−1, 1), so f increases, decreases, and increases again.
:::

## #extrema 06 / Extrema, Absolute Values, and Applications :: 极值由局部变号确定，闭区间最值还必须比较端点 || Local Extrema Follow Sign Changes, While Closed-Interval Absolute Extrema Also Require Endpoints

单调区间已经给出函数走势，本节区分极值与最值，并把候选点比较法用于不超过三次多项式和简单优化模型。 || Monotonic intervals now describe the function's movement. This section separates local and absolute extrema and applies candidate comparison to polynomials of degree at most three and simple optimization models.

:::accordion
::panel { open: true }
### 导数为零是可导极值点的必要条件，不是充分条件 || A Zero Derivative Is Necessary but Not Sufficient for a Differentiable Interior Extremum
若可导函数在区间内部 x₀ 取得极值，则 f'(x₀) = 0；反向判断要看导数是否变号。 || If a differentiable function has a local extremum at interior point x₀, then f'(x₀) = 0. The converse requires a derivative sign change.

极大值 || Local Maximum

**导数由正变负 || The Derivative Changes From Positive to Negative**

函数在 x₀ 左侧递增、右侧递减，f(x₀) 是局部极大值。 || The function increases left of x₀ and decreases right of it, making f(x₀) a local maximum.

极小值 || Local Minimum

**导数由负变正 || The Derivative Changes From Negative to Positive**

函数在 x₀ 左侧递减、右侧递增，f(x₀) 是局部极小值。 || The function decreases left of x₀ and increases right of it, making f(x₀) a local minimum.

> **反例 || Counterexample**
> f(x) = x³ 在 x = 0 处满足 f'(0) = 0，但 f'(x) = 3x² 在两侧都非负，没有由正变负或由负变正，因此 0 不是极值点。 || For f(x) = x³, f'(0) = 0, but f'(x) = 3x² is nonnegative on both sides, so no sign change occurs and 0 is not an extremum.

::panel
### 闭区间最值在端点与内部临界点中比较 || Closed-Interval Absolute Extrema Are Chosen From Endpoints and Interior Critical Points
连续函数在闭区间上能取得最大值和最小值；候选点包括两个端点，以及区间内部导数为零或不存在的点。 || A continuous function on a closed interval attains a maximum and minimum. Candidates are the two endpoints and interior points where the derivative is zero or undefined.

1. **确认闭区间连续 || Confirm Continuity on the Closed Interval** — 分母为零、对数或根式边界可能破坏连续性，需要先拆区间。 || Zero denominators and logarithm or radical boundaries may break continuity and require interval splitting.
2. **找内部候选点 || Find Interior Candidates** — 求 f'(x) = 0，并保留落在开区间内部的解。 || Solve f'(x) = 0 and retain solutions in the interval interior.
3. **计算所有候选函数值 || Evaluate Every Candidate** — 端点不可因导数不存在而遗漏；最值比较的是 f 值，不是 x 值。 || Do not omit endpoints because derivatives are not two-sided there; compare f-values, not x-values.
4. **比较并写完整结论 || Compare and State the Full Conclusion** — 说明在何处取得最大或最小值，以及对应值。 || State where each absolute extremum occurs and its value.

::panel
### 实际优化先建立目标函数与可行区间 || Applied Optimization Starts With an Objective Function and Feasible Interval
导数只优化已经正确建立的函数；变量含义、单位和可行范围必须在求导前确定，结果还要回到语境检验。 || Derivatives optimize only a correctly built function. Variable meaning, units, and feasible range must be fixed before differentiation, and the result must be checked in context.

- **建立变量与约束 || Define the Variable and Constraints** — 长度、数量和时间通常非负；材料总量、预算或区间给出上界。 || Length, quantity, and time are generally nonnegative; material, budget, or interval conditions supply upper bounds.
- **把目标量化为一元函数 || Write the Objective as One Function** — 用约束消去其他变量，得到面积、体积、成本或收益函数。 || Use constraints to eliminate other variables and obtain an area, volume, cost, or revenue function.
- **比较候选并解释单位 || Compare Candidates and Interpret Units** — 临界点若不在可行区间内必须舍去；最终值带回原单位。 || Discard critical points outside the feasible interval and report the final quantity in original units.
:::

## #practice 07 / Graded Practice :: 六道题覆盖求导、切线、单调、极值与闭区间最值 || Six Problems Cover Differentiation, Tangents, Monotonicity, Extrema, and Closed-Interval Values

前六节已经覆盖 2025 课标高中范围；本节按计算、函数研究和综合应用三层检查完整解题链。 || The first six sections cover the 2025 senior-high scope. This section tests the complete solution chain at computational, function-analysis, and integrated levels.

:::accordion
::panel { open: true }
### 计算层：运算法则与简单复合 || Computation: Operation Rules and Simple Composites
先识别和、积或复合结构，再逐层求导。 || Identify sum, product, or composite structure before differentiating layer by layer.

1. **求 f(x) = 2x³ − 3x² + 5 的导数 || Differentiate f(x) = 2x³ − 3x² + 5** — 逐项求导得 f'(x) = 6x² − 6x。 || Termwise differentiation gives f'(x) = 6x² − 6x.
2. **求 g(x) = (3x + 1)⁴ 的导数 || Differentiate g(x) = (3x + 1)⁴** — 外层导数 4(3x + 1)³，再乘内层导数 3，得 g'(x) = 12(3x + 1)³。 || The outer derivative is 4(3x + 1)³; multiplying by inner derivative 3 gives g'(x) = 12(3x + 1)³.

::panel
### 函数研究层：切线与单调区间 || Function Analysis: Tangents and Monotonic Intervals
切线使用一点信息，单调性使用整个导数符号表。 || A tangent uses one-point data; monotonicity uses the full derivative sign chart.

1. **求 y = x² 在 x = 2 处的切线 || Find the Tangent to y = x² at x = 2** — 切点 (2, 4)，斜率 f'(2) = 4，所以 y − 4 = 4(x − 2)，即 y = 4x − 4。 || The point is (2, 4) and f'(2) = 4, so y − 4 = 4(x − 2), or y = 4x − 4.
2. **求 f(x) = x³ − 3x 的单调区间 || Find the Monotonic Intervals of f(x) = x³ − 3x** — f'(x) = 3(x − 1)(x + 1)。递增区间为 (−∞, −1)、(1, +∞)，递减区间为 (−1, 1)。 || f'(x) = 3(x − 1)(x + 1). The function increases on (−∞, −1) and (1, +∞) and decreases on (−1, 1).

::panel
### 综合层：极值与闭区间最值 || Integrated: Local and Closed-Interval Extrema
极值看变号，最值比较端点与内部候选函数值。 || Local extrema use sign changes; absolute extrema compare endpoint and interior candidate values.

1. **求 f(x) = x³ − 3x 的极值 || Find the Local Extrema of f(x) = x³ − 3x** — 在 x = −1 处导数由正变负，极大值 f(−1) = 2；在 x = 1 处由负变正，极小值 f(1) = −2。 || At x = −1 the derivative changes positive to negative, giving local maximum f(−1) = 2. At x = 1 it changes negative to positive, giving local minimum f(1) = −2.
2. **求同一函数在 [0, 2] 上的最大值与最小值 || Find the Absolute Maximum and Minimum of the Same Function on [0, 2]** — 候选点为 0、1、2。函数值分别为 0、−2、2，所以最小值 −2 在 x = 1 取得，最大值 2 在 x = 2 取得。 || Candidates are 0, 1, and 2, with values 0, −2, and 2. The minimum −2 occurs at x = 1 and the maximum 2 at x = 2.
:::

## #references 08 / References :: 高中导数范围与核心定理均有可核验来源 || The Senior-High Derivative Scope and Core Results Have Verifiable Sources

前文以 2025 日常修订版为范围主依据，并用开放微积分教材交叉核验定义、运算法则、切线、单调性和最值方法；例题为本文重新编写。 || The article uses the 2025 daily revision as its primary scope and cross-checks definitions, operation rules, tangents, monotonicity, and extrema against an open calculus text; all examples were newly written.

- [1] 课程标准 · 普通高中数学课程标准日常修订版（2017 年版 2025 年修订） — http://www.bdtxjys.cn/xiangqing_7/2.html | 支撑瞬时变化率与几何意义、定义求导函数清单、基本公式和四则法则、f(ax+b)、不超过三次多项式的单调区间、极值与闭区间最值边界。 || Supports instantaneous-rate and geometric meanings, the functions differentiated from definition, formula and arithmetic rules, f(ax+b), monotonic intervals for polynomials of degree at most three, and local and closed-interval extrema boundaries.
- [2] OpenStax Calculus Volume 1 · Defining the Derivative — https://openstax.org/books/calculus-volume-1/pages/3-1-defining-the-derivative | 交叉核验差商极限、瞬时变化率、切线斜率与可导性。 || Cross-checks the difference-quotient limit, instantaneous rate, tangent slope, and differentiability.
- [3] OpenStax Calculus Volume 1 · Maxima and Minima — https://openstax.org/books/calculus-volume-1/pages/4-3-maxima-and-minima | 交叉核验临界点、极值必要条件和闭区间候选点比较法。 || Cross-checks critical points, necessary conditions for extrema, and the closed-interval candidate method.
