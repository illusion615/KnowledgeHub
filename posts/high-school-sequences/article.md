---
title: "数列：用离散函数描述递推与累积 || Sequences: Describing Recurrence and Accumulation With Discrete Functions"
eyebrow: "高中数学 · 选择性必修 || High School Mathematics · Selective Compulsory"
brand: "高中代数与函数 || High School Algebra and Functions"
date: 2026-07-16
strict_i18n: false
strict_density: true
lead: "数列把正整数位置映射到确定数值。等差数列刻画固定增量，等比数列刻画固定倍率；通项公式回答第 n 项，前 n 项和回答累计总量。 || A sequence maps positive-integer positions to values. Arithmetic sequences model constant increments, geometric sequences model constant ratios, explicit formulas give the nth term, and partial sums give accumulated totals."
hero_actions:
  - "建立知识地图 || Build the Knowledge Map | #map"
  - "进入分层自测 || Start Graded Practice | #practice"
panel_label: "统一解题链 || Unified Solution Chain"
panel_title: "先识别变化规律，再建立通项，最后处理累计量。 || Identify the Pattern, Build the Explicit Term, Then Compute Accumulation"
panel:
  - "明确首项、项数与下标起点 || Identify the first term, number of terms, and starting index"
  - "比较相邻项的差或比 || Compare consecutive differences or ratios"
  - "用通项、递推或前 n 项和表达未知量 || Express unknowns through explicit terms, recurrences, or partial sums"
  - "回到题目语境检查项数、单位与取值 || Return to the context and verify term count, units, and valid values"
metrics:
  - "核心模型 || Core Models | 2 | 等差 · 等比 || Arithmetic · geometric"
  - "主要表达 || Main Representations | 4 | 列表 · 图象 · 通项 · 递推 || Table · graph · explicit · recursive"
  - "累计公式 || Sum Formulas | 2 | 等差和 · 等比和 || Arithmetic sum · geometric sum"
  - "建议用时 || Study Time | 45 min | 含 6 题分层自测 || Includes six graded exercises"
style:
  accent: "#f97316"
---

## #map 01 / Sequence Knowledge Map :: 数列是定义域为正整数集或其有限子集的函数 || A Sequence Is a Function on Positive Integers or a Finite Subset

本节先固定数列的函数身份、四种表示和三个核心量；这些概念决定后续公式中的下标、项数与累计边界。 || This section establishes sequences as functions, compares four representations, and fixes three core quantities; these ideas determine indices, term counts, and accumulation boundaries in every later formula.

:::accordion
::panel { open: true }
### 第 n 项、通项公式与前 n 项和回答不同问题 || The nth Term, Explicit Formula, and Partial Sum Answer Different Questions
数列记作 {aₙ}，其中 aₙ 是位置 n 对应的函数值，Sₙ 是从第 1 项累加到第 n 项的总和。 || A sequence is written {aₙ}, where aₙ is the value at position n and Sₙ is the total accumulated from term 1 through term n.

- **通项公式定位单项 || An Explicit Formula Locates One Term** — 给定 n 可以直接求第 n 项，也可以由已知项反求 n。 || Given n, it returns one term directly; given a term value, it may determine n.
- **递推公式连接相邻状态 || A Recurrence Connects Consecutive States** — 递推必须同时给出初始项，否则不能唯一确定整个数列。 || A recurrence also needs an initial term; without it, the sequence is not uniquely determined.
- **前 n 项和描述累计 || A Partial Sum Describes Accumulation** — 当 n ≥ 2 时有 a_n = S_n − S_{n−1}，但首项应单独取 a_1 = S_1。 || For n ≥ 2, a_n = S_n − S_{n−1}; the first term must be handled separately as a_1 = S_1.

::panel
### 四种表示方式分别突出数值、趋势、定位与生成 || Four Representations Emphasize Values, Trends, Location, and Generation
同一数列可以在列表、离散图象、通项公式与递推公式之间转换；选择标准是当前问题需要看到哪种结构。 || One sequence can be represented by a table, discrete graph, explicit formula, or recurrence; choose the representation that exposes the structure needed by the problem.

| 表示 || Representation | 突出信息 || Information Exposed | 限制 || Limitation |
| --- | --- | --- |
| 列表 || Table | 前若干项的具体数值 || Concrete values of early terms | 不能证明规律对所有 n 成立 || Does not prove a pattern for every n |
| 离散图象 || Discrete graph | 增减、增长速度与上下界 || Increase, decrease, growth rate, and bounds | 点之间没有连续函数值 || No function values exist between plotted indices |
| 通项公式 || Explicit formula | 任意一项与下标的直接关系 || Direct relation between any term and its index | 不一定容易从题目直接得到 || May be difficult to derive directly |
| 递推公式 || Recurrence | 当前状态如何生成下一状态 || How one state generates the next | 求远处项通常需要逐步计算 || A distant term may require sequential computation |
:::

## #arithmetic 02 / Arithmetic Sequences :: 相邻项保持固定差时，通项呈一次函数式增长 || A Constant Consecutive Difference Produces Linear Growth in the Index

上一节建立了通项与累计量，本节把固定增量翻译成公差 d，并推导第 n 项与前 n 项和。 || The previous section established individual terms and accumulation. This section translates a constant increment into common difference d and derives the nth term and partial sum.

:::accordion
::panel { open: true }
### 公差把递推式与通项公式连接起来 || The Common Difference Connects the Recurrence and Explicit Formula
若对所有适用的 n 都有 aₙ₊₁ − aₙ = d，则每前进一步增加同一个 d；从首项走 n − 1 步即可到达 aₙ。 || If aₙ₊₁ − aₙ = d for every applicable n, each step adds the same d; moving n − 1 steps from the first term reaches aₙ.

$$
a_{n+1}-a_n=d\quad\Longrightarrow\quad a_n=a_1+(n-1)d
$$

已知首项 || Known First Term

**从 a₁ 向前走 n − 1 步 || Move n − 1 Steps From a₁**

例如 a₁ = 4、d = 3，则 a₈ = 4 + 7 × 3 = 25。 || For a₁ = 4 and d = 3, a₈ = 4 + 7 × 3 = 25.

已知任意一项 || Known Arbitrary Term

**任意两项之差等于下标差乘公差 || Any Term Difference Equals Index Difference Times d**

$$
a_n-a_m=(n-m)d
$$

该形式减少先求首项的中间步骤。 || This form avoids solving for the first term as an intermediate step.

::panel
### 倒序相加把 n 个不同项化成 n 组相同平均值 || Reverse Pairing Converts n Different Terms Into Equal Averages
等差数列首尾两项、第二项与倒数第二项的和都等于 a₁ + a_n，因此总和等于项数乘首尾平均值。 || In an arithmetic sequence, the first and last terms, the second and next-to-last terms, and every symmetric pair share sum a₁ + a_n; the total is the number of terms times the endpoint average.

$$
S_n=\frac{n(a_1+a_n)}{2}=na_1+\frac{n(n-1)}{2}d
$$

1. **确认项数 || Confirm the Number of Terms** — 从第 p 项加到第 q 项共有 q − p + 1 项，不是 q − p 项。 || From term p through term q, there are q − p + 1 terms, not q − p.
2. **选择已知量更完整的公式 || Choose the Formula Matching Known Quantities** — 已知首末项用 n(a₁ + a_n)/2；已知首项和公差用第二式。 || Use n(a₁ + a_n)/2 for known endpoints; use the second form for a known first term and difference.
3. **检查结果量级 || Check the Resulting Scale** — 和应等于项数乘平均项；若明显超出该量级，应检查项数或下标。 || The sum equals term count times the average term; a different scale signals an index or term-count error.
:::

## #geometric 03 / Geometric Sequences :: 相邻项保持固定非零比时，通项呈指数函数式变化 || A Constant Nonzero Ratio Produces Exponential Change in the Index

等差数列使用固定增量，本节改用固定倍率 q；这会把线性增长转换为指数增长、衰减或交替变化。 || Arithmetic sequences use a fixed increment. This section replaces it with a fixed ratio q, producing exponential growth, decay, or alternating behavior.

:::accordion
::panel { open: true }
### 公比控制增长、衰减与符号交替 || The Common Ratio Controls Growth, Decay, and Alternating Signs
若非零项之间始终满足 aₙ₊₁/aₙ = q，则从首项到第 n 项共乘 q 达 n − 1 次。 || If nonzero consecutive terms satisfy aₙ₊₁/aₙ = q, moving from the first term to the nth term multiplies by q exactly n − 1 times.

$$
\frac{a_{n+1}}{a_n}=q\quad\Longrightarrow\quad a_n=a_1q^{n-1}
$$

- **q 大于 1 时绝对值通常增长 || For q Greater Than 1, Magnitude Usually Grows** — 正首项对应指数增长，例如复利、人口按固定比例增长。 || A positive first term gives exponential growth, as in compound interest or proportional population growth.
- **q 位于 0 与 1 之间时衰减 || For q Between 0 and 1, Magnitude Decays** — 每一步保留固定比例，例如折旧、药物浓度或放射性衰变的离散模型。 || Each step retains a fixed proportion, as in discrete models of depreciation, drug concentration, or radioactive decay.
- **q 小于 0 时符号交替 || For Negative q, Signs Alternate** — 绝对值由 |q| 决定，正负号随奇偶位置交替；判断单调性时不能只看 |q|。 || Magnitude follows |q| while signs alternate by parity; monotonicity cannot be inferred from |q| alone.

::panel
### 错位相减推导有限等比数列前 n 项和 || Shift-and-Subtract Derives the Finite Geometric Sum
把 S_n 乘 q 后与原式相减，中间 n − 1 项全部抵消；q = 1 时分母为零，必须单独处理。 || Multiplying S_n by q and subtracting cancels the n − 1 middle terms. When q = 1 the denominator vanishes, so that case must be handled separately.

$$
S_n=a_1+a_1q+\cdots+a_1q^{n-1}
$$

$$
S_n=\begin{cases}\dfrac{a_1(1-q^n)}{1-q},&q\ne1\\na_1,&q=1\end{cases}
$$

> **失败样例 || Failure Case**
> 把 q = 1 代入分式会得到 0/0，而实际数列每项都等于 a₁，前 n 项和为 na₁。公式使用前必须先分情况。 || Substituting q = 1 into the fraction gives 0/0, while the actual sequence has every term equal to a₁ and sum na₁. Split the cases before applying the formula.
:::

## #strategy 04 / Problems and Modeling :: 识别差、比与累计结构，可把文字条件转成方程组 || Differences, Ratios, and Accumulation Convert Verbal Conditions Into Equations

前两节给出了两个模型，本节按已知项、前 n 项和与现实递推三类输入组织统一解题流程。 || The previous sections established two models. This section organizes one solution process around known terms, partial sums, and real-world recurrences.

:::accordion
::panel { open: true }
### 四步流程从规律识别走到语境校验 || A Four-Step Workflow Runs From Pattern Recognition to Context Validation
无论是纯数学题还是贷款、折旧、增长题，都先定义第 n 项代表什么，再决定使用差、比、通项或累计公式。 || For both abstract and applied problems, first define what the nth term represents, then choose a difference, ratio, explicit term, or accumulation formula.

1. **定义对象与下标 || Define the Quantity and Index** — 写清 a_n 是第 n 年末余额、第 n 层砖数还是第 n 次测量值；首项时刻必须明确。 || State whether a_n is the balance after year n, bricks in layer n, or the nth measurement; fix the time represented by the first term.
2. **识别固定差或固定比 || Identify a Constant Difference or Ratio** — 增加固定数量对应等差；按固定百分比变化对应等比。百分比需转为倍率 1 ± r。 || A fixed amount gives an arithmetic sequence; a fixed percentage gives a geometric sequence, with percentage converted to factor 1 ± r.
3. **建立最少未知量的方程 || Build Equations With the Fewest Unknowns** — 优先使用 aₙ − aₘ = (n − m)d 或 aₙ/aₘ = qⁿ⁻ᵐ，避免无必要地先求首项。 || Prefer aₙ − aₘ = (n − m)d or aₙ/aₘ = qⁿ⁻ᵐ to avoid solving for the first term unnecessarily.
4. **核对整数性、单位与边界 || Verify Integrality, Units, and Boundaries** — 人数、层数和期数通常取正整数；金额、长度与比例需保留题目要求的单位和精度。 || People, layers, and periods usually require positive integers; money, length, and ratios must preserve required units and precision.

::panel
### 已知 S_n 时，首项与其余项必须分开恢复 || When S_n Is Known, Recover the First Term Separately
关系 a_n = S_n − S_{n−1} 只对 n ≥ 2 直接成立；第 1 项由 S_1 单独确定。 || The relation a_n = S_n − S_{n−1} applies directly only for n ≥ 2; the first term is determined separately by S_1.

$$
a_1=S_1,\qquad a_n=S_n-S_{n-1}\quad(n\ge2)
$$

正确处理 || Correct Handling

**先算 a₁，再写 n ≥ 2 的表达式 || Compute a₁ First, Then State the Formula for n ≥ 2**

最后检查 n = 1 是否与后续表达式一致；不一致时保留分段形式。 || Finally test whether n = 1 matches the later expression; retain a piecewise formula when it does not.

常见错误 || Common Error

**直接代 n = 1 并虚构 S₀ || Substituting n = 1 and Inventing S₀**

除非题目或定义明确给出 S₀ = 0，否则不能用未定义的 S₀ 替代首项检查。 || Unless the problem explicitly defines S₀ = 0, an undefined S₀ cannot replace the first-term check.
:::

## #induction 05 / Mathematical Induction :: 数学归纳法通过起点与递推步证明所有正整数情形 || Mathematical Induction Proves All Positive-Integer Cases Through a Base and Step

新版标准把数学归纳法标为拓展内容；本节只覆盖证明数列简单命题所需的基础结构，不扩展到强归纳法。 || The 2025 standard marks mathematical induction as extension content. This section covers only the basic structure needed for simple sequence statements and does not enter strong induction.

:::accordion
::panel { open: true }
### 基础步与归纳步缺一不可 || Both the Base Case and Inductive Step Are Necessary
归纳法不是从若干样例猜结论，而是在验证起点后证明任一成立位置都能推出下一位置。 || Induction does not infer a theorem from examples. It verifies a base case and proves that any valid position forces the next one.

1. **基础步 || Base Case** — 验证命题 P(1) 或题目指定的最小下标成立。 || Verify P(1), or the smallest index specified by the statement.
2. **归纳假设 || Inductive Hypothesis** — 假设当 n = k 时 P(k) 成立；该假设必须在下一步中被实际使用。 || Assume P(k) holds for n = k; the next step must actually use this hypothesis.
3. **归纳步 || Inductive Step** — 从 P(k) 推出 P(k + 1)，而不是重新独立验证某个具体数字。 || Derive P(k + 1) from P(k), rather than independently checking another concrete number.
4. **结论 || Conclusion** — 说明命题对从起点开始的所有正整数 n 成立。 || State that the proposition holds for every positive integer n from the base onward.

$$
1+2+\cdots+n=\frac{n(n+1)}{2}
$$
:::

## #practice 06 / Graded Practice :: 六道题检验通项、求和、建模与归纳结构 || Six Problems Test Explicit Terms, Sums, Modeling, and Inductive Structure

前五节已经形成完整方法链；本节按基础、综合和建模三层检查能否独立选择模型并验证结果。 || The first five sections formed a complete method. This section checks independent model selection and validation at foundational, integrated, and modeling levels.

:::accordion
::panel { open: true }
### 基础层：识别模型并代入公式 || Foundation: Identify the Model and Apply Its Formula
两题分别检验等差通项和等比求和，先写模型参数再计算。 || The two problems test an arithmetic explicit term and a geometric sum. Write model parameters before calculating.

1. **等差数列 5，8，11，… 的第 20 项 || Find Term 20 of 5, 8, 11, …** — a₁ = 5、d = 3，所以 a₂₀ = 5 + 19 × 3 = 62。 || a₁ = 5 and d = 3, so a₂₀ = 5 + 19 × 3 = 62.
2. **等比数列 3，6，12，… 的前 8 项和 || Find the First Eight-Term Sum of 3, 6, 12, …** — a₁ = 3、q = 2，所以 S₈ = 3(2⁸ − 1)/(2 − 1) = 765。 || a₁ = 3 and q = 2, so S₈ = 3(2⁸ − 1)/(2 − 1) = 765.

::panel
### 综合层：由已知项与前 n 项和反求结构 || Integrated: Recover Structure From Known Terms and Partial Sums
两题检验能否减少未知量，并正确处理 a₁ 与 n ≥ 2 的边界。 || These problems test reducing unknowns and handling the boundary between a₁ and n ≥ 2 correctly.

1. **等差数列中 a₄ = 10、a₉ = 25，求 d 与 a₁ || In an Arithmetic Sequence, a₄ = 10 and a₉ = 25; Find d and a₁** — 5d = 15，得 d = 3；a₁ = a₄ − 3d = 1。 || 5d = 15 gives d = 3; then a₁ = a₄ − 3d = 1.
2. **已知 S_n = n² + 2n，求 a_n || Given S_n = n² + 2n, Find a_n** — a₁ = S₁ = 3；n ≥ 2 时 a_n = S_n − S_{n−1} = 2n + 1。该式代 n = 1 也得 3，所以统一为 a_n = 2n + 1。 || a₁ = S₁ = 3. For n ≥ 2, a_n = S_n − S_{n−1} = 2n + 1. This also gives 3 at n = 1, so a_n = 2n + 1 for all n.

::panel
### 建模层：百分比递推与归纳证明 || Modeling: Percentage Recurrence and Inductive Proof
应用题先定义时刻，证明题则检查归纳假设是否真正进入 k + 1 的推导。 || Applied problems require a precise time index, while proof problems require the inductive hypothesis to enter the derivation for k + 1.

1. **设备初值 20,000 元，每年末保留 80%，三年末价值 || An Asset Starts at 20,000 and Retains 80% Each Year; Find Its Value After Three Years** — 以初值为第 0 年，三年末为 20,000 × 0.8³ = 10,240 元。若把初值误作 a₁ 后代 a₃，会少乘一次。 || Treat the initial value as year 0. After three years the value is 20,000 × 0.8³ = 10,240. Calling the initial value a₁ and using a₃ would miss one multiplication.
2. **用归纳法证明 1 + 3 + … + (2n − 1) = n² || Prove 1 + 3 + … + (2n − 1) = n² by Induction** — n = 1 成立；假设前 k 个奇数和为 k²，则再加 2k + 1 得 k² + 2k + 1 = (k + 1)²，因此对所有正整数 n 成立。 || The case n = 1 holds. Assuming the first k odd numbers sum to k², adding 2k + 1 gives k² + 2k + 1 = (k + 1)², so the claim holds for every positive integer n.
:::

## #references 07 / References :: 课程范围与公式推导均有可核验来源 || The Curriculum Scope and Formula Derivations Have Verifiable Sources

前文按 2025 日常修订版界定必学与拓展边界，并使用开放教材交叉核验等差、等比与求和公式；练习题为本文重新编写。 || The article follows the 2025 daily revision for required and extension boundaries and cross-checks arithmetic, geometric, and sum formulas against open textbooks; all exercises were newly written.

- [1] 课程标准 · 普通高中数学课程标准日常修订版（2017 年版 2025 年修订） — http://www.bdtxjys.cn/xiangqing_7/2.html | 支撑数列作为特殊函数、等差与等比通项和前 n 项和、现实建模，以及数学归纳法属于拓展内容的范围判断。 || Supports sequences as special functions, arithmetic and geometric explicit and partial-sum formulas, real-world modeling, and mathematical induction as extension content.
- [2] OpenStax Precalculus 2e · Arithmetic Sequences — https://openstax.org/books/precalculus-2e/pages/11-2-arithmetic-sequences | 交叉核验等差数列递推、通项与有限和公式。 || Cross-checks arithmetic recurrences, explicit terms, and finite-sum formulas.
- [3] OpenStax Precalculus 2e · Geometric Sequences — https://openstax.org/books/precalculus-2e/pages/11-3-geometric-sequences | 交叉核验等比数列通项、有限和与增长衰减模型。 || Cross-checks geometric explicit terms, finite sums, and growth or decay models.
