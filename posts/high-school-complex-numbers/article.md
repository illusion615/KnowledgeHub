---
title: "复数：从数系扩充到复平面运算 || Complex Numbers: From Number-System Extension to Plane Geometry"
eyebrow: "高中数学 · 必修 || High School Mathematics · Compulsory"
brand: "高中几何与代数 || High School Geometry and Algebra"
date: 2026-07-16
strict_i18n: false
strict_density: true
lead: "复数通过 i² = −1 扩充实数系，使每个实系数一元二次方程都能在复数范围讨论根。代数形式 a + bi 支持四则运算，复平面把实部与虚部分别映射到横纵坐标。 || Complex numbers extend the real system through i² = −1, allowing roots of every real-coefficient quadratic to be discussed over the complex numbers. The form a + bi supports arithmetic, while the complex plane maps real and imaginary parts to horizontal and vertical coordinates."
hero_actions:
  - "理解数系扩充 || Understand the Extension | #extension"
  - "进入分层自测 || Start Graded Practice | #practice"
panel_label: "统一方法 || Unified Method"
panel_title: "先化为 a + bi，再分离实部与虚部。 || Convert to a + bi, Then Separate Real and Imaginary Parts"
panel:
  - "所有 i 的幂按模 4 化简 || Reduce powers of i by the exponent modulo 4"
  - "相等复数的实部、虚部分别相等 || Equal complex numbers have equal real and imaginary parts"
  - "除法用分母共轭把分母实数化 || Use the denominator's conjugate to make division real-denominated"
  - "几何问题把 z = a + bi 看作点 (a, b) || For geometry, view z = a + bi as point (a, b)"
metrics:
  - "基本形式 || Standard Form | a + bi | a、b 为实数 || a and b are real"
  - "i 的周期 || Cycle of i | 4 | i · −1 · −i · 1"
  - "标准运算 || Standard Operations | 4 | 加 · 减 · 乘 · 除 || Add · subtract · multiply · divide"
  - "建议用时 || Study Time | 35 min | 含 6 题分层自测 || Includes six graded exercises"
style:
  accent: "#14b8a6"
---

## #extension 01 / Extending the Number System :: 规定 i² = −1 后，负数开平方可统一写成实数倍 i || Defining i² = −1 Converts Negative Square Roots Into Real Multiples of i

本节从方程 x² + 1 = 0 的实数无解出发，定义虚数单位、复数代数形式和复数相等；这些规则是后续运算的公理化起点。 || Starting from the lack of real solutions to x² + 1 = 0, this section defines the imaginary unit, algebraic form, and equality of complex numbers; these rules are the foundation for all later operations.

:::accordion
::panel { open: true }
### 复数把实部与虚部组合成有序二元结构 || A Complex Number Combines Ordered Real and Imaginary Components
任意复数写成 z = a + bi，其中 a 是实部、b 是虚部系数；实部与虚部的次序和角色不能交换。 || Every complex number has form z = a + bi, where a is the real part and b is the imaginary coefficient; their roles and order are distinct.

$$
z=a+bi,\qquad a,b\in\mathbb R,\qquad i^2=-1
$$

- **实数是复数的子集 || Real Numbers Are a Subset of Complex Numbers** — 当 b = 0 时，a + 0i 就是实数 a；数系扩充保留原有实数运算。 || When b = 0, a + 0i is the real number a; the extension preserves real arithmetic.
- **纯虚数的实部为零 || A Pure Imaginary Number Has Zero Real Part** — 当 a = 0 且 b ≠ 0 时，z = bi 是纯虚数；i 本身对应 b = 1。 || When a = 0 and b ≠ 0, z = bi is pure imaginary; i corresponds to b = 1.
- **复数相等要求两个分量分别相等 || Complex Equality Requires Componentwise Equality** — 该判据把复数方程转成两个实数方程。 || This criterion converts one complex equation into two real equations.

::panel
### i 的整数次幂每四次循环 || Integer Powers of i Repeat Every Four Exponents
由 i² = −1 可继续得到 i³ = −i、i⁴ = 1；之后每乘一个 i 重复同一四项周期。 || From i² = −1 follow i³ = −i and i⁴ = 1; multiplying by i thereafter repeats the same four-term cycle.

| 指数除以 4 的余数 || Exponent Modulo 4 | 幂值 || Power | 示例 || Example |
| --- | --- | --- |
| 0 | 1 | i²⁰ = 1 |
| 1 | i | i²¹ = i |
| 2 | −1 | i²² = −1 |
| 3 | −i | i²³ = −i |

> **易错边界 || Error Boundary**
> √(−9) = 3i 描述主平方根；方程 x² = −9 的解则是 x = ±3i。根式值与方程的两个根不能混为一谈。 || √(−9) = 3i denotes the principal square root, while x² = −9 has solutions x = ±3i. A radical value and both equation roots are different statements.
:::

## #plane 02 / Complex Plane and Modulus :: 复数 a + bi 与平面点 (a, b) 一一对应 || The Complex Number a + bi Corresponds One-to-One With the Point (a, b)

上一节把复数写成两个实分量，本节将它们映射到实轴与虚轴，并用距离解释复数的模和两复数之差。 || The previous section expressed a complex number through two real components. This section maps them to the real and imaginary axes and interprets modulus and complex differences as distances.

:::accordion
::panel { open: true }
### 模表示复平面上到原点的距离 || Modulus Is Distance From the Origin in the Complex Plane
z = a + bi 对应点 Z(a, b)，其模由勾股定理得到；两复数之差的模则是两对应点之间的距离。 || z = a + bi corresponds to Z(a, b). Its modulus follows from the Pythagorean theorem, while the modulus of a difference is the distance between the corresponding points.

$$
|z|=\sqrt{a^2+b^2},\qquad |z_1-z_2|=\text{distance}(Z_1,Z_2)
$$

代数解释 || Algebraic Interpretation

**模是非负实数 || Modulus Is a Nonnegative Real Number**

|3 − 4i| = 5；模不是复数本身，也不保留方向。 || |3 − 4i| = 5. Modulus is not the complex number itself and carries no direction.

几何解释 || Geometric Interpretation

**等模复数落在同一圆上 || Equal-Modulus Numbers Lie on One Circle**

|z| = r 表示以原点为圆心、r 为半径的圆；r 必须非负。 || |z| = r represents the circle centered at the origin with radius r; r must be nonnegative.

::panel
### 共轭复数关于实轴对称 || Complex Conjugates Reflect Across the Real Axis
z = a + bi 的共轭为 z̄ = a − bi；它保留实部、反转虚部，因此在复平面上关于实轴对称。 || The conjugate of z = a + bi is z̄ = a − bi. It preserves the real part and reverses the imaginary part, reflecting the point across the real axis.

- **和提取实部 || The Sum Extracts the Real Part** — 结果一定是实数。 || The result is always real.
- **差提取虚部系数 || The Difference Extracts the Imaginary Coefficient** — 结果为纯虚数或零。 || The result is pure imaginary or zero.
- **积等于模平方 || The Product Equals the Squared Modulus** — 该恒等式是复数除法实数化的核心。 || This identity is the core of rationalizing complex division.
:::

## #arithmetic 03 / Complex Arithmetic :: 加减按分量，乘法用 i² = −1，除法乘分母共轭 || Add by Components, Multiply With i² = −1, and Divide With a Conjugate

复平面给出几何直觉，本节回到代数形式，建立四则运算的统一结果格式 a + bi。 || The complex plane supplied geometric intuition. This section returns to algebraic form and standardizes all four operations into the result form a + bi.

:::accordion
::panel { open: true }
### 加减与乘法都遵循实数代数规则 || Addition, Subtraction, and Multiplication Follow Real Algebraic Rules
把 i 当作符号参与分配律，最后用 i² = −1 降次，再合并实部与虚部。 || Treat i as a symbol under the distributive law, then reduce powers with i² = −1 and collect real and imaginary parts.

| 运算 || Operation | 公式 || Formula | 结果类型 || Result Type |
| --- | --- | --- |
| 加法 || Addition | (a + bi) + (c + di) = (a + c) + (b + d)i | a + bi |
| 减法 || Subtraction | (a + bi) − (c + di) = (a − c) + (b − d)i | a + bi |
| 乘法 || Multiplication | (a + bi)(c + di) = (ac − bd) + (ad + bc)i | a + bi |

$$
(2+3i)(4-i)=8-2i+12i-3i^2=11+10i
$$

::panel
### 除法通过共轭把分母化为模平方 || Division Uses the Conjugate to Turn the Denominator Into a Squared Modulus
分母 z = c + di 非零时，同乘其共轭 c − di；分母变成 c² + d²，必为正实数。 || For nonzero denominator z = c + di, multiply by its conjugate c − di; the denominator becomes the positive real number c² + d².

$$
\frac{a+bi}{c+di}=\frac{(a+bi)(c-di)}{c^2+d^2}\quad(c+di\ne0)
$$

1. **写出分母共轭 || Write the Denominator's Conjugate** — 只改变虚部符号；c + di 的共轭是 c − di。 || Change only the imaginary sign; the conjugate of c + di is c − di.
2. **分子分母同乘 || Multiply Numerator and Denominator** — 同乘同一个非零复数不改变商值。 || Multiplying both by the same nonzero complex number preserves the quotient.
3. **化为标准形式 || Convert to Standard Form** — 展开分子、用 i² = −1，再把实部与虚部分别除以实分母。 || Expand the numerator, use i² = −1, then divide both real and imaginary parts by the real denominator.

> **失败样例 || Failure Case**
> 若 c = d = 0，原分母就是零复数，共轭法得到的分母仍为 0；复数除法与实数除法一样不能除以零。 || If c = d = 0, the original denominator is the zero complex number and conjugation still gives denominator 0; complex division, like real division, cannot divide by zero.
:::

## #structure 04 / Equations and Structure :: 复数相等与共轭根把复数问题转成实数方程组 || Complex Equality and Conjugate Roots Convert Problems Into Real Systems

四则运算得到标准形式后，本节用实部、虚部分离求参数，并说明实系数二次方程的非实根为何成共轭对。 || After arithmetic produces standard form, this section separates real and imaginary parts to solve parameters and explains why nonreal roots of real-coefficient quadratics occur in conjugate pairs.

:::accordion
::panel { open: true }
### 一个复数等式通常提供两个实数条件 || One Complex Equation Usually Provides Two Real Conditions
含实参数 x、y 的复数等式先整理为 A(x, y) + B(x, y)i = 0，再令实部和虚部分别为零。 || For real parameters x and y, first rewrite a complex equation as A(x, y) + B(x, y)i = 0, then set the real and imaginary parts separately to zero.

$$
(x+2i)+(3+yi)=7-i\Longrightarrow\begin{cases}x+3=7\\2+y=-1\end{cases}\Longrightarrow x=4,\ y=-3
$$

有效前提 || Valid Premise

**参数声明为实数 || Parameters Are Declared Real**

只有 x、y 为实数时，x + yi 才直接把 x、y 解释为实部与虚部系数。 || Only when x and y are real does x + yi directly identify them as the real and imaginary coefficients.

常见错误 || Common Error

**只比较含 i 的项而忽略化简 || Comparing i-Terms Before Simplifying**

表达式中若有 i²、分母或乘积，必须先完整化为 a + bi，再比较分量。 || If i², denominators, or products occur, fully reduce to a + bi before comparing components.

::panel
### 实系数二次方程的非实根成共轭对 || Nonreal Roots of a Real-Coefficient Quadratic Form a Conjugate Pair
当判别式 Δ 小于 0 时，根式 √Δ 可写成 i√(−Δ)，求根公式给出两个虚部符号相反的根。 || When discriminant Δ is negative, √Δ becomes i√(−Δ), and the quadratic formula produces two roots with opposite imaginary signs.

$$
ax^2+bx+c=0,\quad \Delta=b^2-4ac<0\Longrightarrow x=\frac{-b\pm i\sqrt{-\Delta}}{2a}
$$

例如 x² − 2x + 5 = 0 的判别式为 −16，两个根为 1 ± 2i；根的和 2、积 5 仍满足韦达定理。 || For x² − 2x + 5 = 0, the discriminant is −16 and the roots are 1 ± 2i; their sum 2 and product 5 still satisfy Vieta's formulas.
:::

## #polar 05 / Trigonometric-Form Extension :: 三角表示把复数写成模与辐角，乘除对应伸缩与旋转 || Trigonometric Form Uses Modulus and Argument, Turning Products Into Scaling and Rotation

2025 修订版把复数三角表示标为拓展内容；本节只建立代数表示与三角表示的转换及乘除几何意义，不进入复分析。 || The 2025 revision marks trigonometric form as extension content. This section covers conversion and the geometric meaning of multiplication and division without entering complex analysis.

:::accordion
::panel { open: true }
### 模相乘、辐角相加描述复数乘法 || Complex Multiplication Multiplies Moduli and Adds Arguments
非零复数 z 对应从原点出发的向量；若其模为 r、与正实轴夹角为 θ，则可写成 r(cosθ + i sinθ)。 || A nonzero complex number corresponds to a vector from the origin. With modulus r and angle θ from the positive real axis, it has form r(cosθ + i sinθ).

$$
z=r(\cos\theta+i\sin\theta),\qquad r=|z|>0
$$

乘法 || Multiplication

**模相乘，辐角相加 || Multiply Moduli and Add Arguments**

$$
r_1\operatorname{cis}\theta_1\cdot r_2\operatorname{cis}\theta_2=r_1r_2\operatorname{cis}(\theta_1+\theta_2)
$$

几何上先按 r₂ 伸缩，再旋转 θ₂。 || Geometrically, scale by r₂ and rotate by θ₂.

除法 || Division

**模相除，辐角相减 || Divide Moduli and Subtract Arguments**

$$
\frac{r_1\operatorname{cis}\theta_1}{r_2\operatorname{cis}\theta_2}=\frac{r_1}{r_2}\operatorname{cis}(\theta_1-\theta_2)
$$

要求除数模 r₂ 非零。 || The divisor modulus r₂ must be nonzero.
:::

## #practice 06 / Graded Practice :: 六道题检验标准形式、复平面、除法与参数分离 || Six Problems Test Standard Form, the Complex Plane, Division, and Parameter Separation

前五节建立了代数与几何双重表示；本节按基础、综合和拓展三层检查能否正确化简并解释结果。 || The first five sections established algebraic and geometric representations. This section checks simplification and interpretation at foundational, integrated, and extension levels.

:::accordion
::panel { open: true }
### 基础层：i 的幂与复数加乘 || Foundation: Powers of i and Complex Addition and Multiplication
先按模 4 化简 i 的幂，再把结果整理为 a + bi。 || Reduce powers of i modulo 4, then collect the result in a + bi form.

1. **化简 i⁵⁸ || Simplify i⁵⁸** — 58 除以 4 余 2，所以 i⁵⁸ = i² = −1。 || 58 leaves remainder 2 modulo 4, so i⁵⁸ = i² = −1.
2. **计算 (1 + 2i)(3 − i) || Compute (1 + 2i)(3 − i)** — 展开得 3 − i + 6i − 2i² = 5 + 5i。 || Expanding gives 3 − i + 6i − 2i² = 5 + 5i.

::panel
### 综合层：模、除法与参数 || Integrated: Modulus, Division, and Parameters
三类任务分别调用距离、共轭与分量相等判据。 || The three task types use distance, conjugation, and componentwise equality respectively.

1. **求 z = −5 + 12i 的模 || Find the Modulus of z = −5 + 12i** — |z| = √(25 + 144) = 13；对应点到原点距离为 13。 || |z| = √(25 + 144) = 13; the corresponding point is 13 units from the origin.
2. **计算 (2 + i)/(1 − i) || Compute (2 + i)/(1 − i)** — 同乘 1 + i，得 [(2 + i)(1 + i)]/2 = (1 + 3i)/2。 || Multiplying by 1 + i gives [(2 + i)(1 + i)]/2 = (1 + 3i)/2.
3. **实数 x、y 满足 (x − 1) + (y + 2)i = 3 − 4i || Real x and y Satisfy (x − 1) + (y + 2)i = 3 − 4i** — 实部给 x − 1 = 3，虚部给 y + 2 = −4，所以 x = 4、y = −6。 || The real parts give x − 1 = 3 and imaginary parts give y + 2 = −4, so x = 4 and y = −6.

::panel
### 拓展层：乘法的旋转解释 || Extension: The Rotational Meaning of Multiplication
乘以 i 不改变模，并把辐角增加 90°，因此在复平面上对应逆时针四分之一周旋转。 || Multiplication by i preserves modulus and adds 90° to the argument, corresponding to a quarter-turn counterclockwise in the complex plane.

1. **点 z = 2 + i 乘以 i 后的位置 || Locate iz for z = 2 + i** — iz = 2i + i² = −1 + 2i，对应点从 (2, 1) 旋转到 (−1, 2)，两点到原点距离均为 √5。 || iz = 2i + i² = −1 + 2i, so point (2, 1) rotates to (−1, 2); both have distance √5 from the origin.
:::

## #references 07 / References :: 课程边界与复数运算均有可核验来源 || The Curriculum Boundary and Complex Arithmetic Have Verifiable Sources

前文按 2025 日常修订版区分必学的代数表示、四则运算和几何意义，以及拓展的三角表示；开放教材用于交叉核验公式。 || The article follows the 2025 daily revision to distinguish required algebraic form, arithmetic, and geometry from extension trigonometric form; an open textbook cross-checks the formulas.

- [1] 课程标准 · 普通高中数学课程标准日常修订版（2017 年版 2025 年修订） — http://www.bdtxjys.cn/xiangqing_7/2.html | 支撑复数概念、代数表示、几何意义、四则运算，以及三角表示属于拓展内容的范围。 || Supports complex-number concepts, algebraic form, geometric meaning, four operations, and trigonometric form as extension content.
- [2] OpenStax Precalculus 2e · 3.1 Complex Numbers — https://openstax.org/books/precalculus-2e/pages/3-1-complex-numbers | 交叉核验 i 的定义与幂周期、复平面、加减乘除、共轭和标准形式。 || Cross-checks the definition and power cycle of i, the complex plane, arithmetic, conjugates, and standard form.
