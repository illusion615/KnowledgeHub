---
title: "从考试成绩到预测模型：如何分析试卷难度与个人优势 || From Exam Scores to Prediction: Modeling Difficulty and Relative Advantage"
eyebrow: "高中数学 · 面向高一初学者 || High School Mathematics · A First-Year Introduction"
brand: "高中数学 || High School Mathematics"
date: 2026-09-25
strict_i18n: true
strict_density: true
lead: "如果你刚上高一，学过百分数、平均数和一次函数，却没听过「回归」或「最小二乘」，可以从这里开始。我们用一道考试成绩题，先解释每一步要解决什么，再用小算例认识符号和方法，最后算出答案并检查它能不能相信。主线不需要微积分，也不要求会编程。 || If you are in your first year of high school and know percentages, averages, and linear functions but have never met regression or least squares, start here. We use an exam-score problem to explain each decision, introduce notation through small calculations, and then compute and evaluate the answers. The main path requires neither calculus nor programming."
hero_actions:
  - "从题意开始 || Start With the Problem | #problem"
  - "先认识建模方法 || Start With the Modeling Method | #readiness"
  - "查看本题答案与限制 || View Answers and Limitations | #results"
panel_label: "本题求解目标 || Solution Goal"
panel_title: "从现实问题推到有条件、有检验的数值答案 || Derive Numerical Answers With Explicit Assumptions and Tests"
panel:
  - "先看懂建模全程，再按需补齐算术、函数和符号知识。 || Understand the modeling process first, then review arithmetic, functions, and notation as needed."
  - "用原题数据走完「找规则—检验—回答」的过程。 || Use the actual records to build a rule, test it, and answer the questions."
  - "第一次读不必完成进阶推导，但要看懂答案的条件。 || The advanced algebra is optional on a first reading; the answer's conditions are not."
style:
  accent: "#f59e0b"
custom_scripts:
  - ./vendor/katex/katex.min.js
  - ./math-rendering.js
  - ./model-evolution.js
  - ./chart-typography.js
  - ./model-walkthrough.js
  - ./least-squares-demo.js
  - ./knowledge-dialog.js
  - ./presentation-plan.js
  - ./presentation.js
custom_styles:
  - ./vendor/katex/katex.min.css
  - ./math-rendering.css
  - ./process-flow.css
  - ./knowledge-cards.css
  - ./extension-cards.css
  - ./concept-emphasis.css
  - ./model-evolution.css
  - ./model-walkthrough.css
  - ./least-squares-demo.css
  - ./presentation.css
---

## #problem 01 / Problem Description :: 成绩 || Scores

### 背景与考试记录 || Background and Exam Records

老师常说：「平时考不好，高考也不可能考好。」但在我们的身边，总有一群咸鱼可以逆袭，这究竟是天上掉馅饼的偶然，还是暗藏玄机的必然？ || Teachers often say: if you do poorly in regular exams, you cannot do well in the college entrance exam. Yet some struggling students turn their fortunes around. Is that a lucky accident, or is there an underlying explanation?

如果你有一个学生小金在高中所有数学正式考试的成绩数据如下： || Suppose you have the following results for a student, Xiaojin, from all formal mathematics exams during high school:

**高一数学考试成绩（满分 100 分） || Year 1 Mathematics Exams (Maximum 100 Points)**

| 考试 || Exam | 1 · 测验 || 1 · Test | 2 · 期中 || 2 · Midterm | 3 · 测验 || 3 · Test | 4 · 期末 || 4 · Final | 5 · 测验 || 5 · Test | 6 · 期中 || 6 · Midterm | 7 · 测验 || 7 · Test | 8 · 期末 || 8 · Final |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 个人分数 || Student score | 80 | 78 | 81 | 85 | 77 | 69 | 73 | 83 |
| 难度 || Difficulty | 0.25 | 0.18 | 0.25 | 0.22 | 0.26 | 0.19 | 0.22 | 0.23 |
| 年级均分 || Grade mean | 63 | 70 | 58 | 72 | 66 | 73 | 62 | 72 |

**高二数学考试成绩（满分 100 分） || Year 2 Mathematics Exams (Maximum 100 Points)**

| 考试 || Exam | 1 · 测验 || 1 · Test | 2 · 期中 || 2 · Midterm | 3 · 测验 || 3 · Test | 4 · 期末 || 4 · Final | 5 · 测验 || 5 · Test | 6 · 期中 || 6 · Midterm | 7 · 测验 || 7 · Test | 8 · 期末 || 8 · Final |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 个人分数 || Student score | 96 | 88 | 68 | 81 | 60 | 82 | 83 | 85 |
| 难度 || Difficulty | 0.15 | 0.21 | 0.30 | 0.25 | 0.34 | 0.22 | 0.19 | 0.20 |
| 年级均分 || Grade mean | 80 | 73 | 75 | 72 | 58 | 75 | 70 | 75 |

**高三数学考试成绩（满分 150 分） || Year 3 Mathematics Exams (Maximum 150 Points)**

| 考试 || Exam | 1 · 测验 || 1 · Test | 2 · 期中 || 2 · Midterm | 3 · 测验 || 3 · Test | 4 · 一模 || 4 · Mock 1 | 5 · 测验 || 5 · Test | 6 · 二模 || 6 · Mock 2 | 7 · 测验 || 7 · Test | 8 · 三模 || 8 · Mock 3 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 个人分数 || Student score | 130 | 130 | 90 | 121 | 118 | 125 | 133 | 141 |
| 难度 || Difficulty | 0.17 | 0.22 | 0.40 | 0.23 | 0.30 | 0.27 | 0.20 | 0.15 |
| 年级均分 || Grade mean | 110 | 122 | 91 | 122 | 108 | 118 | 120 | 123 |

### 原题说明：计分口径、难度与群体位置 || Original Conditions: Scoring, Difficulty, and Cohort Position

其中，高一数学和高二数学是百分制试卷，高三数学一百五十分制试卷。任何一张高中数学试卷中的题目都可以分为简单题、中档题和难题。试卷的难度系数等于难题的分值除以全卷的分值。年级均分作为一个重要的参考指标给出，以了解个体在群体中所处的位置。试卷的难度和考生在年级中的位置或多或少会影响一名考生的心态。 || Year 1 and Year 2 papers are scored out of 100, and Year 3 papers out of 150. Questions on any high-school mathematics paper can be classified as easy, intermediate, or hard. The paper's difficulty coefficient is the marks allocated to hard questions divided by total marks. The grade mean is provided as a reference for the student's position within the cohort. Paper difficulty and position within the grade may influence a student's mindset.

### 原题两问 || The Two Original Questions

1. 如果高考的难度是 0.2，试综合学生小金的数学能力和心态建立数学模型预测其高考数学的分数。 || If the entrance-exam difficulty is 0.2, build a mathematical model that considers Xiaojin's mathematical ability and mindset to predict the mathematics score.
2. 如果高考的难度介于 0.1 和 0.3 之间，试问高考的难度系数为多少时，小金有最大的可能性考出和年级均分拉开最大的高分？ || If entrance-exam difficulty lies between 0.1 and 0.3, at what difficulty coefficient does Xiaojin have the greatest possibility of achieving a high score with the largest margin over the grade mean?

原题注：小金的成绩仅供参考，切勿对号入座，谢谢！ || Original note: Xiaojin's results are provided for reference only; please do not identify them with any particular person.

## #readiness 02 / Modeling Method :: 数学建模的六个环节 || Six Components of Mathematical Modeling

数学模型是对现实问题的简化数学描述。COMAP与SIAM联合出版的GAIMME指南，将建模过程概括为问题定义、假设与变量、数学求解、分析评价、迭代修订和实施报告六个环节。 || A mathematical model is a simplified mathematical description of reality. The GAIMME guidelines, published jointly by COMAP and SIAM, organize modeling into problem definition, assumptions and variables, mathematical solution, assessment, revision and implementation.

:::callout { title: "📊 从问题定义到模型评价与修订 || From Problem Definition to Assessment and Revision" }
按箭头顺序阅读六个环节。宽屏虚线从修订返回假设；窄屏按1—6纵向排列，通过修订卡内链接回查。各环节可并行或反复进行。 || Follow the arrows through the six components. On wide screens, the dashed arrow returns from revision to assumptions. Narrow screens use a vertical 1–6 flow with return links in the revision card. Components may occur in parallel or repeat as needed.
:::

### 方法来源 || Methodological Source

[8] Garfunkel, S., & Montgomery, M. (Eds.). (2016). GAIMME: Guidelines for Assessment & Instruction in Mathematical Modeling Education. COMAP & SIAM. 第一版，第1章，印刷页12—13，图1.2。上述中文标题与说明为意译。 || First edition, Chapter 1, pp. 12–13, Figure 1.2 (printed pagination). The Chinese headings and descriptions are paraphrases. [官方介绍 || Official Overview](https://www.comap.com/resources/free-resources/gaimme) · [第一版原文 || First-Edition Report](https://www.comap.com/images/resources/free_resources/GAIMME_Report.pdf)

## #modeling-overview 03 / Overview of This Problem :: 本题的建模路线与结果概览 || Modeling Route and Results at a Glance

阶段序号用于近似学习进程，不是考试次数的加分规则； || The stage index approximates progression through study, not points gained by taking more exams;[为何引入这一项，见模型构建。 || see the modeling rationale for this input.](#stage-proxy-rationale)

:::sandbox { id: "exam-performance-modeling-sandbox-1", title: "结构对照：均值基线、线性方案与后续有界修订 || Structure Comparison: Mean Baseline, Linear Rule and Later Bounded Revision", canvas: false, script: "./vendor/katex/katex.min.js", style: "./vendor/katex/katex.min.css" }
共同信息截止为第20次：均值只用其中第18—20次，其余使用第1—20次。固定参照阶段 || All use information through exam 20: the mean uses only exams 18–20, while the regressions use exams 1–20. Fix reference stage$t=20$，绘制得分率随难度变化的曲线。 || to plot score rate against difficulty.
:::

## #math-toolkit 04 / Mathematical Toolkit :: 先掌握读题与检验必备的工具，再按需深入推导 || Learn the Essential Tools First; Explore Derivations When Ready

必备知识帮助你读懂本题的式子、比较和误差；扩展知识帮助你进一步理解系数推导与结论的边界。每项都说明含义、本题用途和首次阅读应掌握的程度。不要求高一读者已经学过回归、概率分布或矩阵，也不必先会证明所有系数公式。 || Essential knowledge lets you read the formulas, comparisons, and errors in this problem. Extensions deepen your understanding of coefficient derivations and their limits. Each item explains its meaning, use in this case, and first-pass learning goal. Regression, distributions, matrices, and proofs of every formula are not prerequisites.

### 知识点概要｜先看类型与用途，再按需展开学习 || Knowledge Overview | Identify the Type and Purpose, Then Read Further

青绿色卡片是必备知识，紫色卡片是扩展知识，每张卡片也有文字标签。点击卡片即可在浮窗中阅读完整解释、公式、本题用途与学习要求；按 Esc、点击关闭按钮或浮窗外侧，可返回概要。 || Teal cards mark essentials and purple cards mark extensions, with text labels on every card. Select a card to open its complete explanation, formulas, use in this problem, and learning goals. Press Esc, use Close, or select the backdrop to return to the overview.

未启用 JavaScript：完整知识点保留在概要下方，点击标题可跳转阅读。 || JavaScript is disabled: full explanations remain below the overview, and topic titles link to them.

### 必备知识：先看懂这些，再读本题模型 || Essentials: Read These Before the Models

- 必备知识 || Essential [比例、百分数与百分点 || Proportions, Percentages, and Percentage Points](#toolkit-rates) 统一满分尺度，分清得分率与优势。 || Align scoring scales and distinguish rates from margins.
- 必备知识 || Essential [两种平均数 || Two Kinds of Mean](#toolkit-means) 分清同次年级参照与个人近期表现。 || Separate the same-exam cohort reference from personal recent performance.
- 必备知识 || Essential [变量、参数、函数与坐标 || Variables, Parameters, Functions, and Coordinates](#toolkit-functions) 把记录读成输入、输出与图上的点。 || Read records as inputs, outputs, and plotted points.
- 必备知识 || Essential [下标、横线、帽号、求和与区间 || Subscripts, Bars, Hats, Sums, and Intervals](#toolkit-symbols) 在读复杂公式前，先知道每个记号在说什么。 || Understand the notation before meeting longer formulas.
- 必备知识 || Essential [一次函数的斜率与端点 || Linear Slopes and Endpoints](#toolkit-slopes) 解释变化方向，比较允许难度内的最大优势。 || Explain direction and compare margins over the allowed difficulty range.
- 必备知识 || Essential [绝对误差、平方误差与最小二乘直觉 || Absolute Errors, Squared Errors, and Least-Squares Intuition](#toolkit-errors) 理解怎样量偏差、为什么要由数据求系数。 || Understand how mismatch is measured and coefficients are estimated.
- 必备知识 || Essential [训练与检验 || Training and Evaluation](#toolkit-testing) 分清求规则的数据与检查规则的数据。 || Distinguish records that build a rule from those that check it.

### 扩展知识：用途先看清，推导可以第二遍再读 || Extensions: Know Their Purpose Now; Revisit the Derivations Later

- 扩展知识 || Extension [中心化、配方与二元方程组 || Centering, Completing Squares, and Two Equations](#toolkit-algebra) 追究最小二乘系数为什么这样求。 || Explain how the least-squares coefficients are derived.
- 扩展知识 || Extension [二次函数与有界映射 || Quadratics and Bounded Mappings](#toolkit-quadratics) 认识弯曲的候选关系，以及顶点与端点的比较。 || Understand curved candidates and comparisons of vertices with endpoints.
- 扩展知识 || Extension [期望与阈值概率 || Expectation and Threshold Probabilities](#toolkit-probability) 解释为什么平均领先最多不等于超过某分数的机会最大。 || Explain why the largest mean lead need not give the best chance of exceeding a threshold.
- 扩展知识 || Extension [代理指标与因果可区分性 || Proxies and Separating Causal Explanations](#toolkit-proxies) 知道能力、心态的数学名称不能替代真实测量。 || Recognize that mathematical labels for ability and mindset do not replace measurements.

阅读详情 || Reading Details

### 必备｜比例统一尺度，百分点表示两个百分数的差 || Essential | Rates Align Scales; Percentage Points Measure Their Difference

是什么：比例是部分除以整体，百分数是把同一个比例写成每一百份。100 分试卷得 80 分，得分率是 80÷100，也就是 0.80 或 80%；直接比较 80 分和另一张试卷的 130 分，则忽略了满分可能不同。 || What it is: a proportion divides a part by its whole; a percentage expresses that same proportion per hundred. Scoring 80 out of 100 gives a rate of 80÷100, or 0.80 or 80%. Comparing 80 with 130 on another exam ignores possibly different maximum scores.

$$
\frac{80}{100}=0.80=80\%
$$

本题在哪里用：变量章把个人分数和同次年级均分都除以该次满分，先比较得分率，最后乘满分换回分数。80% 比 63% 高 17 个百分点，得分率差是 0.17；若问相对于 63% 增长百分之几，还要用 0.17 除以 0.63，不能直接说增长 17%。 || Where it is used: the Variables chapter divides both personal scores and same-exam grade means by that exam's maximum, then converts rates back to points by multiplication. 80% is 17 percentage points above 63%, a rate difference of 0.17. A relative percentage increase would divide 0.17 by 0.63; it is not a 17% increase.

首次阅读掌握到：会在分数、小数、百分数之间换写，先问分母是什么。本题难度也是比例，但它的分子是难题分值，不是失分；难度 0.20 不能直接推出得分率 0.80。 || First-pass goal: convert between fractions, decimals, and percentages, always checking the denominator. Difficulty is also a proportion here, but its numerator is marks allocated to hard questions, not marks lost. Difficulty 0.20 does not imply a score rate of 0.80.

### 必备｜平均数必须先说明在平均谁、哪些考试 || Essential | A Mean Needs a Group and a Set of Exams

是什么：算术平均数是把所选数值加起来，再除以个数。「个人历次平均分」沿同一个人的考试记录求平均，例如高一前两次是 (80+78)÷2=79 分；「年级均分」则在同一次考试中对许多学生求平均，第一张表的 63 分属于后者。两者平均的对象不同，不能互相替代。 || What it is: an arithmetic mean adds the selected values and divides by their count. A personal historical mean averages one student's exams: the first two Year 1 scores give (80+78)÷2=79 points. A grade mean averages many students in one exam; the first table's 63 points is this second kind. These means average different things and are not interchangeable.

本题在哪里用：同次年级均分是计算相对优势的参照；个人最近几次的平均得分率是简单预测的基线，也用于构造近期能力代理。跨越不同满分的考试时，先统一成得分率再平均，不能把不同口径的原始分数直接混在一起。 || Where it is used: the same-exam grade mean is the reference for relative advantage; the student's recent mean score rate is a simple forecast baseline and helps construct a recent ability proxy. Across different exam maxima, convert to rates before averaging instead of mixing raw scores on different scales.

首次阅读掌握到：每见一个平均数，都能说出对象、记录范围和单位。后文的「预期成绩」是模型估计的相近条件下平均水平，不是保证下一次恰好考到这个数，也不是把历史成绩简单再平均一次。 || First-pass goal: identify the people, records, and units behind each mean. An expected score later is the model's estimated average under similar conditions, not a guaranteed next score or simply another average of the historical scores.

### 必备｜变量会变，参数定规则，函数把输入变成输出 || Essential | Variables Change; Parameters Specify an Input–Output Rule

是什么：变量表示可以取不同值的量；参数是同一条已确定规则中的固定数。求参数时可以试不同数值，更新数据、模型或拟合准则后也可重估，但不能为同次预测随意改参数。若写 f(d)，d 是输入，f 是规则的名字，f(d) 是按规则算出的输出，不是 f 乘 d。下面只是认识函数的例子，不是本题拟合结果： || What it is: variables can take different values; parameters are fixed numbers within a specified rule. Estimation may try different values, and changes to data, model or fitting criterion may lead to refitting, but parameters cannot be changed arbitrarily for a prediction. In f(d), d is the input, f names the rule, and f(d) is its output, not f multiplied by d. The following illustrates a function, not a fitted result for this problem:

$$
\begin{aligned}f(d)&=0.90-0.50d,\\f(0.20)&=0.90-0.50\times0.20\\&=0.80.\end{aligned}
$$

本题在哪里用：公式的输入包含考试编号与难度，待求的系数决定同一条规则怎样变化；不能每遇到一个新点就随意换系数。f(t,d) 同时接收两个输入，就像矩形面积同时需要长和宽，不要求先学多元函数理论。看难度—得分率图时，横坐标放难度，纵坐标放得分率；上例的 (0.20,0.80) 是公式给出的点，实际记录的点未必落在这条线上。 || Where it is used: exam order and difficulty are inputs, while estimated coefficients determine how one rule changes. Do not change coefficients arbitrarily for each new point. f(t,d) takes two inputs, just as rectangle area needs length and width; no multivariable theory is assumed. On a difficulty–score-rate plot, difficulty is horizontal and score rate vertical. The example's (0.20,0.80) is a point given by the rule; observed points need not lie on that line.

首次阅读掌握到：会代入求值，分清输入、输出、参数，会按坐标轴读点。能算出一个函数值，只说明规则可计算；现实成绩是否遵循它，还要检验。 || First-pass goal: substitute values, distinguish inputs, outputs, and parameters, and read points against their axes. Computing a function value only shows that the rule is calculable; whether actual scores follow it still needs testing.

### 必备｜符号指南：先把记号读成一句话 || Essential | Notation Guide: Read Symbols in Words First

是什么：下标像记录的标签，yₜ 表示第 t 次的得分率，不是 y 乘 t；yₜ₋₁ 指前一次，n 表示所用记录的条数。区间 [0,1] 包含两端，(0,1) 不含两端；≈ 表示近似相等。其余记号的读法和用法见下表。 || What it is: a subscript labels a record. yₜ is the score rate for exam t, not y times t; yₜ₋₁ refers to the previous exam, and n counts the records used. [0,1] includes both endpoints, (0,1) excludes them, and ≈ means approximately equal. The table explains the other symbols.

本题在哪里用：下标区分当前与过去，横线表示均值，帽号区分实际值与估计值，求和号表达总偏差，绝对值量偏差大小，区间限制可比较的难度。首次阅读只需会把记号译成一句话，并看清每次用了哪些记录，不必背整串公式。 || Where it is used: subscripts distinguish present from past, bars mark means, hats identify estimates, sums express total mismatch, absolute values measure its size, and intervals constrain difficulty. On a first reading, translate each symbol into words and identify which records are used; do not memorize whole formulas.

| 记号 || Notation | 怎样读，怎样用 || Meaning and Use |
| --- | --- |
| $\bar y$ | y 的平均值。把所用的 y 加起来，再除以记录数 n。 || The mean of y: add the included y values and divide by n. |
| $\widehat y_t$ | 模型对第 t 次得分率的估计；没有帽子的 yₜ 才是实际得分率。参数上的帽号也表示它由数据估计而来。 || The model's estimate for exam t; yₜ without the hat is observed. Hats on coefficients also indicate estimates from data. |
| $\sum_{t=1}^{n}y_t$ | 把第 1 项一直加到第 n 项；上下的数字说明从哪里开始、到哪里结束。 || Add terms 1 through n; the lower and upper labels give the starting and ending indices. |
| $&#124;e&#124;$ | 误差 e 的绝对值，只看相差多少，不看偏高还是偏低；例如 &#124;−2&#124;=2。 || The absolute error: its size without direction. For example, &#124;−2&#124;=2. |
| $t_*,\ d_*$ | 星号标记要讨论的未来考试或给定情景，不是乘号。答案中的 d⋆ 则标记比较后选出的难度。 || A star marks the future exam or scenario, not multiplication. In the answer, d⋆ marks the selected difficulty. |

例如，高一前三次的得分率为 0.80、0.78、0.81。求和号只是把下面的加法写短： || For example, the first three Year 1 score rates are 0.80, 0.78, and 0.81. The sum symbol abbreviates this addition:

$$
\begin{aligned}\sum_{t=1}^{3}y_t&=y_1+y_2+y_3\\&=0.80+0.78+0.81\\&=2.39.\end{aligned}
$$

若公式要求平均值，就还要除以 3。遇到 ∈ 时读作「属于」；例如 t∈𝒯 表示只选编号在训练集 𝒯 中的那些考试。训练集就是用来找规则的那部分记录。 || To obtain the mean, divide that sum by 3. Read ∈ as belongs to: t∈𝒯 restricts the sum to exam indices in the training set 𝒯, the records used to build the rule.

### 必备｜斜率说变化，最大值还要看允许区间 || Essential | Slopes Describe Change; Maxima Depend on the Allowed Interval

是什么：一次函数中，输入前的系数叫斜率，表示输入增加 1 时输出改变多少。前面示例的斜率是 −0.50，难度从 0.20 增到 0.30 时，输出改变 −0.50×0.10=−0.05，从 0.80 降到 0.75。输入越大、输出越小，叫递减；这只是示例规则，尚未证明真实考试也如此。 || What it is: the input's coefficient in a linear function is its slope, the output change for one extra input unit. The earlier example has slope −0.50. Raising difficulty from 0.20 to 0.30 changes the output by −0.50×0.10=−0.05, from 0.80 to 0.75. Falling output as input rises is called decreasing; this example does not prove the same behavior in actual exams.

本题在哪里用：第二问固定未来考试阶段，再比较不同难度下的预计优势。若优势关于难度的规则是直线，在包含两端的区间内，正斜率在右端最大，负斜率在左端最大，斜率为零则处处相同。这里看的是优势函数的斜率，不能拿个人成绩函数的斜率代替。 || Where it is used: Question 2 fixes the future exam stage and compares predicted margins at different difficulties. For a linear margin rule on a closed interval, a positive slope gives its maximum at the right endpoint, a negative slope at the left, and zero gives a tie throughout. Use the margin function's slope, not the personal-score function's slope.

首次阅读掌握到：会用「斜率×输入变化量」求输出变化，会按符号选端点，同时记住区间外不能直接沿用结论。公式的端点最大值不自动等于现实中已经证实的最佳难度。 || First-pass goal: compute output change as slope times input change and use its sign to select an endpoint, without extending conclusions beyond the interval. A formula's endpoint maximum is not automatically a confirmed best difficulty in reality.

### 必备｜误差不能正负抵消，平方让大偏差更显眼 || Essential | Avoid Canceling Errors; Squaring Emphasizes Large Misses

是什么：本文把误差记为实际值减预测值，正数表示预测偏低，负数表示偏高。若两次误差是 +2 分和 −2 分，直接相加是 0，却不是两次都预测正确；绝对值之和是 4，平方和是 8。绝对值保留相差大小，平方则让大偏差受到更重的惩罚，例如误差从 2 变成 4，平方从 4 变成 16。 || What it is: here error is observed minus predicted, positive for underprediction and negative for overprediction. Errors of +2 and −2 points sum to zero, but neither forecast is correct: their absolute values sum to 4 and their squares to 8. Absolute values keep the size of each miss; squares penalize large misses more strongly, so doubling an error from 2 to 4 increases its square from 4 to 16.

本题在哪里用：最小二乘就是在训练记录上，选择让这些偏差的平方和最小的参数；拟合时的偏差也叫残差。检验时还用平均绝对误差，即把绝对误差加起来再除以次数，英文缩写为 MAE。求系数的准则与报告预测误差的尺度可以不同，但比较候选规则时必须用同一批记录、同一口径。 || Where it is used: least squares chooses parameters minimizing the sum of squared mismatches on training records; those fitting mismatches are also called residuals. Evaluation also uses mean absolute error, or MAE: add absolute errors and divide by their count. Fitting and reporting need not use the same error measure, but candidate rules must be compared on the same records and scale.

首次阅读掌握到：会算绝对值、平方与平均误差，知道「平方和最小」是在同一组训练记录上比较参数，并不保证下一次最准确。两分数的小例子与完整系数求法留在 || First-pass goal: calculate absolute values, squares, and mean errors, and understand that minimizing training squared error does not guarantee the most accurate next forecast. The two-score example and full coefficient calculation remain in[参数求解章 || the coefficient chapter](#coefficients)。 || .

### 必备｜训练是求规则，检验是先预测再对答案 || Essential | Training Builds a Rule; Evaluation Predicts Before Checking

是什么：「训练」是用一部分过去记录求参数；「验证」是拿未参与求这些参数的记录，先预测再对答案；「预测」是用规则估计未知结果。好比先做练习，再用没做过的题检查掌握情况，不能因为练习答案背得熟，就宣称新题一定答对。 || What it is: training estimates parameters from some past records; validation predicts records not used to estimate those parameters and then checks their outcomes; prediction estimates an unknown result. Like practicing before attempting unseen questions, remembering the practice answers does not guarantee success on new ones.

本题在哪里用：预测第 4 次时，只能用第 1—3 次已知的信息，不能把第 4 次成绩算进个人均值。用来挑选公式的记录已经影响了决定，所以还要留出不参与选择的较晚记录作最后检查；成绩有先后顺序，不能让未来信息混入过去。 || Where it is used: predicting exam 4 may use information known from exams 1–3, but cannot include exam 4's score in the personal mean. Records used to choose a formula have influenced the decision, so later records untouched by that choice are needed for a final check. Preserve exam order and keep future information out of earlier predictions.

首次阅读掌握到：能指出每次预测时哪些信息已知、哪些必须遮住；检验是有用性的证据，不是未来准确的保证。具体划分和误差比较见 || First-pass goal: identify what was known at each forecast and what had to remain hidden. Evaluation provides evidence of usefulness, not a guarantee. See the actual splits and error comparisons in[检验章 || the evaluation chapter](#validation)。 || .

### 扩展｜中心化、配方与二元方程组：把求系数变成可解的代数 || Extension | Centering, Completing Squares, and Two Equations for Coefficients

是什么：中心化是每个数减去同一组的均值，例如 78、80 减去 79 后成为 −1、1，彼此的差不变，新数之和为零。配方是把二次式改写成平方加常数，便于找最小值，例如 x²−2x+3=(x−1)²+2。二元一次方程组则用两个条件同时确定两个未知数，常用代入或消元求解。 || What it is: centering subtracts a group's mean from each value. Subtracting 79 from 78 and 80 gives −1 and 1: their difference is unchanged and their sum is zero. Completing the square rewrites a quadratic as a square plus a constant to expose its minimum, for example x²−2x+3=(x−1)²+2. Two linear equations impose two conditions on two unknowns and can be solved by substitution or elimination.

本题在哪里用：中心化先把截距与均值联系起来，配方帮助说明误差平方和为什么在某处最小，再解两个斜率满足的方程组，最后恢复截距。如果两个输入总是一起变化，两个条件可能无法独立确定两种作用，不能见到方程组就认定一定有唯一解。 || Where it is used: centering relates the intercept to the means; completing squares explains where squared error is minimized; equations determine the two slopes before the intercept is recovered. If the inputs always move together, the conditions may not independently determine two effects. Having two equations does not by itself guarantee a unique solution.

首次阅读掌握到：知道这些工具负责解释「系数从哪里来」即可，不要求立即独立推导。准备好后再读 || First-pass goal: know that these tools explain where the coefficients come from; an independent derivation is not required yet. When ready, read[参数求解章的可选进阶证明 || the optional advanced proof in the coefficient chapter](#coefficients)，逐步核对这些工具如何连接起来。 || and check how these tools connect, step by step.

### 扩展｜非线性与边界：曲线可以弯，也要尊重满分 || Extension | Nonlinearity and Bounds: Curves Must Respect the Score Limit

是什么：含有输入平方项的二次函数，图像是抛物线，变化快慢不再处处相同。开口向下时顶点是最高处；但在限定区间内求最大值，只能比较区间中的顶点（若有）与两个端点，不能采用区间外的顶点。开口向上时，闭区间最大值在端点。 || What it is: a quadratic function includes a squared input and has a parabolic graph, so its rate of change is not constant. A downward-opening parabola is highest at its vertex, but a maximum over a restricted interval must compare any vertex inside it with both endpoints, not use an outside vertex. For an upward-opening parabola, the closed-interval maximum is at an endpoint.

本题在哪里用：二次项是描述非线性变化的一种候选，不是默认正确答案；参数更多，可能把旧数据的偶然波动也记住。候选比较见 || Where it is used: quadratic terms offer one candidate for nonlinear change, not an automatically correct answer. Extra parameters may also memorize accidental fluctuations in old records. See candidate comparisons in[检验章 || Evaluation](#validation)，函数最大值如何用于难度比较见 || and how function maxima enter difficulty comparisons in[情景章 || Scenarios](#scenarios)。 || .

一个函数在规定输入范围内的值始终被两个固定的有限数夹住，就称它在该范围内有界。得分率模型不仅要有界，还要限制在 0 与 1 之间。下面选择一个满足此要求的函数 g；z 是任意实数输入，e 约为 2.718，是指数函数常用的底数。 || A function is bounded on a specified input domain if its values stay between two fixed finite numbers. A score-rate model must not merely be bounded: its bounds must respect 0 and 1. Below, g is one function meeting this requirement; z is a real input and e, approximately 2.718, is the usual exponential base.

$$
g(z)=\frac{1}{1+e^{-z}},\qquad 0<g(z)<1
$$

为什么不会越界？任意有限 z 都有 e 的 −z 次方大于 0，所以分母大于 1，分数就在 0 与 1 之间。例如 z=0 时，e 的零次方是 1，g(0)=1÷(1+1)=0.5。这是认识函数的小例子，不是本题预测结果。 || Why is the output bounded? For any finite z, e to the power −z is positive, so the denominator exceeds 1 and the fraction lies between 0 and 1. At z=0, e to the zero power is 1, so g(0)=1÷(1+1)=0.5. This illustrates the function, not a forecast from the exam data.

首次阅读掌握到：二次项允许弯曲，却不自动限制分数；有界映射限制数值，却不保证更准。后文的 || First-pass goal: a quadratic allows curvature but does not enforce score limits; a bounded mapping enforces limits but does not guarantee accuracy. See the[有界候选模型 || bounded candidate model](#bounded-model)会说明怎样使用和检验它，不要求先学会数值求解。 || for its construction and evaluation; numerical optimization is not a prerequisite.

### 扩展｜平均领先与超过阈值的机会，不是同一个问题 || Extension | Mean Lead and the Chance of Beating a Threshold Differ

是什么：期望可先理解为把各种可能结果按其发生机会加权得到的平均水平；阈值概率则问结果超过某条线的机会。例如纯示意地比较两种情况：一种总领先 1 分，另一种各有一半机会领先 10 分或落后 6 分。后一种平均领先 2 分，比前一种大，但领先的机会只有一半，反而比前一种低；这不是本题数据的概率估计。 || What it is: expectation is an average of possible outcomes weighted by their chances; a threshold probability asks how likely an outcome is to exceed a specified cutoff. In an invented illustration, one situation always leads by 1 point, while another has equal chances of leading by 10 or trailing by 6. The second has a larger mean lead of 2 points but only half the chance of being ahead, versus certainty in the first. These are not probability estimates from this problem's data.

本题在哪里用：第二问暂按预计领先年级均分最多来比较难度，而不是宣称超过均分或某名次的概率最大。现有 24 次记录来自一个人且条件变化，只有年级均分，没有全体分数分布，也没有足够证据确定每种难度下未来误差怎样分布。要估概率需额外定义阈值、建立并检验随机波动假设，不能由一个预测分数或均分直接推出精确概率。 || Where it is used: Question 2 initially compares expected leads over the grade mean, not the probability of beating that mean or attaining a rank. The 24 records concern one student under changing conditions, with grade means but no full cohort score distributions and insufficient evidence for future error distributions at each difficulty. Probability estimation needs a defined threshold and tested assumptions about random variation; a point forecast or mean alone cannot supply a precise probability.

首次阅读掌握到：能区分「平均多少」与「超过某值的机会多大」，不要求计算概率分布。后文的解释边界见 || First-pass goal: distinguish an average amount from the chance of exceeding a value, without calculating probability distributions. See the interpretation limits in[情景章 || Scenarios](#scenarios)。 || .

### 扩展｜代理指标是线索，不是能力与心态的直接测量 || Extension | Proxies Are Clues, Not Direct Ability or Mindset Measurements

是什么：代理指标是用可观察的量间接代表难以直接测量的概念。例如近期成绩可以提供能力线索，但也受试卷内容、难度和临场状态影响。因果可区分性问的是：现有证据能不能排除其他解释，而不只是能否给不同项起不同名字。 || What it is: a proxy uses an observable quantity to stand for something harder to measure. Recent scores can give clues about ability, but also reflect content, difficulty, and exam-day state. Separating causal explanations asks whether the evidence rules out alternatives, not merely whether terms have different names.

本题在哪里用：近期表现的难度调整量用作能力代理，上次相对表现的变化用作反馈信号。两者可以帮助预测，却不能仅凭总分断定一次进步有多少来自能力、多少来自心态；同一个较高分数可能来自知识进步，也可能来自状态更好。即使方程能唯一求出系数，也不等于真实原因已被唯一分开。 || Where it is used: difficulty-adjusted recent performance serves as an ability proxy, and a change in the last relative performance serves as feedback. They may help prediction, but total scores alone cannot determine how much improvement came from ability versus mindset: the same higher score could reflect learning or a better exam-day state. Even uniquely solved coefficients do not uniquely separate real causes.

首次阅读掌握到：区分「可计算的代理」「预测有帮助」与「证明了原因」三个层次；知道需要更直接的能力与考前心态测量来加强证据。构造与假设见 || First-pass goal: distinguish a calculable proxy, predictive usefulness, and causal proof; recognize the need for more direct ability and pre-exam mindset measurements. For constructions and assumptions, see[代理模型拓展 || the optional proxy model](#ability-mindset)，把这里的概念用到实际记录上。 || to apply these ideas to the actual records.

## #objectives 05 / Solution 1 · Identify the Problem :: 个人得分高，与领先均分多，是两个目标 || A High Score and a Large Lead Are Different Targets

第一问先给出个人成绩的条件性基准，现有数据不能唯一分离真实能力与心态。第二问原文含有「最大可能性」，本文选择可计算的简化目标「条件平均分差最大」，不把它等同于概率最大。容易的试卷可能同时提高个人成绩和均分，所以两个输出仍需分开。 || Question 1 first receives a conditional score benchmark; the data cannot uniquely separate true ability and mindset. Question 2 uses the words greatest possibility; this article adopts the calculable simplified objective of maximum conditional mean margin, not maximum probability. Easier papers may raise both personal and cohort scores, so the two outcomes remain distinct.

### 绝对成绩看得分率，相对优势看得分率之差 || Use Score Rate for Performance and Rate Difference for Advantage

得分率是分数除以该次满分。个人得分率记为 y，年级均分除以同次满分后记为 m；两者之差 r=y−m 表示相对优势。用得分率比较，最后再乘满分换回分数。 || A score rate is a score divided by that exam's maximum. Let y be the student's rate and m the grade mean divided by the same maximum. Their difference r=y−m measures relative advantage. Compare on this common scale, then multiply by the maximum to return to points.

| 目标 || Target | 预测对象 || Outcome | 回答的问题 || Question Answered |
| --- | --- | --- |
| 绝对成绩 || Absolute performance | y | 在指定难度与未来阶段，个人预期能取得多少分？ || What score is expected at a specified difficulty and future stage? |
| 相对优势 || Relative advantage | r = y − m | 个人预计高于或低于年级均分多少？ || How far above or below the grade mean is the student expected to be? |

:::callout { title: "📊 图 1｜分数更高，未必领先更多 || Figure 1 | A Higher Score Need Not Mean a Larger Lead" }
读图：两组条形共用从 0 到 1 的尺度。个人得分率 y 与相对均分差 r 对这两次考试给出的排序不同，所以必须先确定目标。跨年级的两次记录不能单独证明能力提高或难度的因果影响。来源：原题表格。[1] || Read the chart: both pairs share a 0–1 scale. Student rate y and margin r rank these exams differently, so the target must be defined first. Two exams from different years cannot establish ability development or a causal difficulty effect. Source: original tables. [1]
:::

r 为正表示高于均分，为负表示低于均分。它是差值，不是把分差再除以均分得到的相对增长率；也不是年级排名。预测时还必须说明，所说的年级均分指哪个参考群体。 || Positive r means above the mean; negative r means below it. This is a difference, not a percentage increase relative to the mean, and not a rank. Any prediction must also identify the reference cohort.

### 「期望分差最大」不等于「超过门槛的概率最大」 || Maximum Expected Margin Differs From Maximum Threshold Probability

先用日常语言区分：「平均能高出多少分」问的是大小；「有多大把握至少高出某个分数」问的是可能性。前一种平均水平叫期望，后一种可能性用概率表示。例如概率 0.8 表示 80% 的可能性，不表示能得 80 分。本文实际求的是前一种目标。 || Distinguish two questions in everyday terms: how large is the average lead, and how likely is a lead above a specified threshold? The first concerns an expectation; the second concerns a probability. A probability of 0.8 means an 80% chance, not a score of 80. The worked solution uses the first objective.

- 若目标是预期领先更多，可比较不同难度下 r 的条件期望，即给定这些条件时 r 的平均水平。必须声明这是对题意的一种解释。 || To seek a larger expected lead, compare the conditional expectation of r across difficulty levels: its average at those conditions. State explicitly that this is one interpretation of the wording.
- 若目标是更有把握地超过门槛，可预先指定优势阈值 q，比较 P(r > q)。这还需要对波动的分布作出假设，不能只画一条平均趋势线。 || To maximize the chance of exceeding a target, specify a threshold q in advance and compare P(r > q). This requires a model of variability, not just a mean trend.

例如，一个情景的平均分差更大，但波动也更大，它超过某个门槛的概率未必更高。只有 24 条单人记录时，复杂概率结论的证据通常不足；可以先说明期望目标，再把概率解释列为扩展。 || A scenario with a larger mean margin may also have greater variability and need not have a higher probability of clearing a particular threshold. With only 24 records from one student, a detailed probability model is difficult to substantiate; an expectation-based interpretation can be the starting point.

拓展阅读 || Further Reading

为什么平均水平不能决定越过门槛的概率？ || Why Does a Mean Not Determine a Threshold Probability?

区分平均表现与超过某个分数的机会。 || Distinguish average performance from the chance of exceeding a score.

阅读详情 → || Read More →

### 平均水平与阈值概率 || Means and Threshold Probabilities

分布描述一个量可能取哪些值，以及这些值出现得多不多。要问超过某个门槛的概率，就要知道门槛两侧分别有多少可能性；一个平均值不能提供全部信息。 || A distribution describes possible values and how likely they are. A threshold probability depends on the probability on either side of the threshold; a mean alone does not provide that information.

- 若把给定难度 d 下优势不超过 q 的概率记为 F_d(q)，则超过门槛的概率是 1 − F_d(q)。这个函数需要关于波动的信息。 || If F_d(q) denotes the probability that the margin is at most q at difficulty d, the probability of exceeding q is 1 − F_d(q). This function requires information about variability.
- 只有在另加分布形状、波动大小等假设后，才可能由平均趋势推到门槛概率；这些假设必须单独说明和检查。 || Moving from a mean trend to a threshold probability requires additional assumptions about distribution shape and variability. State and assess those assumptions separately.

## #variables 06 / Solution 2.1 · Assumptions and Variables: Align the Data :: 统一满分尺度，同时保留时间与年级差异 || Normalize the Score Scale Without Erasing Time and Grade Differences

高一80分与高三130分的满分不同，不能直接比较大小。先分别计算 || Year 1's score of 80 and Year 3's 130 have different maxima. First compute$\frac{80}{100}=0.80$、 || and$\frac{130}{150}\approx0.867$，才得到相同计分尺度下的表现。这个换算只统一单位，不会自动消除试卷难度和知识范围的差异。 || to express performance on the same scale. This conversion aligns units; it does not remove differences in difficulty or content.

### 一行代表一次考试，变量带上含义与取值范围 || Represent Each Exam With Defined Variables and Ranges

变量就是用字母表示会变化的量。这里把考试按先后排为第1—24次，用 || A variable is a letter representing a quantity that can change. Order the exams chronologically from 1 to 24 and use$t$表示阶段序号； || as the stage index.$y_t$读作该次考试的个人得分率，下标用于指明记录，不是乘法。阶段序号作为模型输入的理由见模型构建。表内「分」是原始计分单位，得分率没有分数单位。 || denotes the student's rate for that exam: the subscript identifies a record, not multiplication. The modeling section explains why stage is an input. Raw scores are in points; score rates have no point unit.

| 符号 || Symbol | 定义 || Definition | 范围或单位 || Range or Unit |
| --- | --- | --- |
| $S_t,\ \overline S_t,\ M_t$ | 个人分数、年级均分、该次满分 || Student score, grade mean, exam maximum | 分 || Points |
| $y_t=\frac{S_t}{M_t}$ | 个人得分率 || Student score rate | [0, 1] |
| $m_t=\frac{\overline S_t}{M_t}$ | 年级平均得分率 || Grade mean score rate | [0, 1] |
| $r_t=y_t-m_t$ | 相对均分的得分率差 || Score-rate margin over the mean | [−1, 1] |
| $d_t$ | 该次难题分值占比 || Hard-question mark share for that exam | $0\le d_t\le1$ |
| $t$ | 考试阶段序号（时间代理）：按先后排列，每学年8次；用于近似学习进程 || Exam stage index (a time proxy): chronological order, eight exams per school year; approximates progression through study | 高一1—8；高二9—16；高三17—24。序号差不是实际天数。 || Year 1: 1–8; Year 2: 9–16; Year 3: 17–24. Index differences are not elapsed days. |

### 把两条原始记录实际换算一次 || Work Through Two Records

按全三年的顺序编号，高一第一次是 t = 1，高三第一次是 t = 17。把两条记录代入定义，就能看出满分换算与目标选择分别解决什么问题。 || Numbering exams across all three years gives t = 1 for the first Year 1 exam and t = 17 for the first Year 3 exam. Substituting these records into the definitions shows why both scale and target matter.

| 换算 || Quantity | t = 1 | t = 17 |
| --- | --- | --- |
| 个人得分率 y || Student rate y | $\frac{80}{100}=0.800$ | $\frac{130}{150}=\frac{13}{15}\approx0.867$ |
| 均分得分率 m || Mean rate m | $\frac{63}{100}=0.630$ | $\frac{110}{150}=\frac{11}{15}\approx0.733$ |
| 优势 r = y − m || Margin r = y − m | $0.800-0.630=0.170$ | $\frac{2}{15}\approx0.133$ |

换算结果说明：后一次得分率从0.800升到约0.867，但领先均分的得分率差从0.170降到约0.133。所以个人成绩与相对优势需要分开预测。得分率是本次考试表现，不是已经排除难度、内容和状态影响的「真实实力指数」。表内小数用于展示，计算保留完整精度。 || The rate rises from 0.800 to about 0.867, while the margin falls from 0.170 to about 0.133. Personal scores and relative margins therefore need separate forecasts. A score rate describes performance on that exam, not pure ability with difficulty, content, and state removed. Displayed decimals are rounded; calculations retain full precision.

这里的 0.170 表示 80% 比 63% 高 17 个百分点；不要把它说成「相对均分提高了 17%」，后者还要除以原来的 63%。把得分率换回分数时，要乘当次满分。表中的 [0,1] 表示从 0 到 1、两端都包含；≈ 表示近似相等。另要注意，考试编号相差 1，并不保证真实时间都相隔同样多天。 || The margin 0.170 means 80% is 17 percentage points above 63%. It is not a 17% increase relative to the mean, which would require division by 63%. Multiply a rate by the exam maximum to recover points. [0,1] includes both endpoints; ≈ means approximately equal. Consecutive exam indices need not represent equal numbers of days.

### 表格能告诉我们什么，不能告诉我们什么 || What the Table Can and Cannot Tell Us

先列出数据没有提供什么，可以避免把数学符号解释得比证据更充分。 || Listing missing information helps keep the interpretation within what the data can support.

- 知道年级均分，不等于知道每个人考了多少。即使均分相同，大家的分数也可能挤在一起或分散得很开，因此不能仅由均分算出小金的排名。 || Knowing the grade mean does not reveal every student's score. The same mean can accompany tightly grouped or widely spread scores, so it does not determine Xiaojin's rank.
- 难题占比相同的两份试卷，仍可能考查不同知识与题型。难度 d 不能唯一决定个人或群体成绩。 || Two papers with the same hard-question share may test different topics and question types. Difficulty d cannot uniquely determine either individual or group scores.
- 表格没有记录考前紧张程度。成绩比模型估计低，可能因为题型不熟、身体状态、模型遗漏了信息等；不能把所有没解释的差异都叫作「心态影响」。 || The table does not measure pre-exam anxiety. A lower-than-estimated score could reflect unfamiliar questions, health, or omitted information; unexplained differences cannot all be called mindset effects.

## #exploration 07 / Solution 2.2 · Assumptions and Variables: Explore and State Conditions :: 先看同阶段的点怎样变化，再比较不同阶段 || Inspect Changes Within a Stage Before Comparing Stages

先把原题记录画出来，再决定哪些关系值得用简单模型描述。图 2 使用全部 24 次考试，左图合并观察，右图区分年级。点的位置来自原题数值，只有颜色和形状改变；它们帮助我们发现问题，但不能单凭图形说明谁导致谁。 || Plot the records before choosing a model. Figure 2 uses all 24 exams, pooled on the left and labeled by school year on the right. Positions come from the source data; only color and shape change. The plots suggest questions, not causal conclusions.

### 读懂24个观测点，再判断哪些关系值得建模 || Read the 24 Observations Before Proposing Relationships

散点图中的一个点代表一次考试：横轴放你想考察的输入，纵轴放对应结果。例如横轴取难度、纵轴取得分率，高一第一次就是点 (0.25,0.80)。不同颜色表示不同年级，便于检查是不是年级差异改变了整体印象。 || Each point in a scatterplot represents an exam. Put the input of interest on the horizontal axis and its outcome on the vertical axis. With difficulty versus score rate, the first Year 1 exam is (0.25,0.80). Color by school year to see whether differences between years change the pooled impression.

本节先看难度—得分率这一组关系：左图把24次记录放在一起，右图用年级标记同一批点。比较两图，是为了判断整体印象是否受到阶段差异影响；不是先认定「越往后一定越好」或「只有难度决定成绩」。 || Focus first on difficulty and score rate. The left panel pools all 24 records; the right identifies school years for the same points. Comparing them helps assess stage differences, without assuming that later always means better or that difficulty alone determines scores.

:::callout { title: "📊 图 2｜原题 24 次考试：合并看，再按年级看 || Figure 2 | All 24 Exams: Pooled and Labeled by Year" }
来源：原题三张成绩表。[1] 左右各保留 24 个数据点，某些位置会重叠：高一第 3 次与高二第 4 次都是 (0.25,0.81)，并未漏画或错开。右图的圆点、空心菱形、三角形分别代表高一、高二、高三；图中未添加回归线。 || Source: the three original tables. [1] Both panels contain 24 observations, with overlap where values coincide: Year 1 exam 3 and Year 2 exam 4 are both (0.25,0.81), neither omitted nor displaced. Circles, hollow diamonds, and triangles identify Years 1, 2, and 3. No regression lines are added.
:::

### 从图中找回原表的数值，再决定能说到哪一步 || Trace the Points Back to the Table Before Drawing Conclusions

1. 先找同一难度：d=0.22 处，高一两次得分率为 0.85、0.73，高二一次为 0.82，高三一次为 130/150≈0.867。横坐标相同，纵坐标却不同，说明只知道难度不能唯一确定成绩；同年级内也仍有波动。 || At d=0.22, Year 1 rates are 0.85 and 0.73, Year 2 is 0.82, and Year 3 is 130/150≈0.867. The same horizontal coordinate has different outcomes, even within a year: difficulty alone does not determine a score.
2. 再看各年级覆盖哪里：高一难度集中在 0.18—0.26，高二为 0.15—0.34，高三为 0.15—0.40。合并图右边较难的试卷主要来自高二、高三，不能把不同年级当成在完全相同条件下作比较。 || Difficulty ranges also differ: 0.18–0.26 in Year 1, 0.15–0.34 in Year 2, and 0.15–0.40 in Year 3. The harder papers on the right of the pooled plot come from Years 2 and 3; school years are not compared under identical conditions.
3. 最后才提出假设：高二从 (0.15,0.96) 到 (0.34,0.60)、高三从 (0.15,0.94) 到 (0.40,0.60)，两组端点都提示较难试卷可能伴随较低得分率。但中间点并非依次下降，高一也不能简单照搬这个判断。它们支持我们尝试加入难度与阶段信息，不足以直接证明因果或已经发生「分组前后趋势反转」。 || Only then form a hypothesis: the Year 2 endpoints (0.15,0.96) and (0.34,0.60), and Year 3 endpoints (0.15,0.94) and (0.40,0.60), suggest that harder papers may accompany lower rates. Intermediate points do not decrease in strict order, and Year 1 need not follow the same pattern. This motivates testing difficulty and stage inputs; it proves neither causality nor a reversal between pooled and grouped trends.

若某一点偏离其他记录，先回查照片与考试背景，不因它使拟合变差就删除。可比较保留该点与暂不纳入时的结果变化，但要公开比较规则。 || For an unusual point, check the source record and exam context before excluding it. Sensitivity with and without that point can be studied, with the comparison rule disclosed.

### 每条假设都要写出作用和可能失效的条件 || State What Each Assumption Enables and When It May Fail

假设是暂时接受、用来建立规则的条件，不是已经证明的事实。例如「近期情况可以延续到下一次考试」，能让我们开始预测；若学生突然生病或复习内容大变，它就可能不再适用。每条假设都应说明何时可能失败。 || An assumption is a condition provisionally accepted to build a rule, not a proven fact. Assuming recent conditions continue lets us predict, but illness or a major change in preparation could invalidate it. State how each assumption might fail.

- 短期延续：近期学习状态对目标考试仍有参考价值。若考试间隔很长、复习方式或知识覆盖突变，这种延续可能失效。 || Short-term continuity: recent performance is informative about the target exam. Long gaps or major changes in preparation and topic coverage may break this assumption.
- 局部近似：在有数据支持的难度范围，直线可以近似平均变化。接近满分的上限效应或明显弯曲，会提示需要调整模型。 || Local approximation: a line may approximate mean behavior over a supported difficulty range. Ceiling effects near full marks or systematic curvature challenge that approximation.
- 参考群体可比：历史年级均分对未来所指群体仍有意义。若未来比较对象换成更广泛的高考人群，原校年级均分不能直接替代。 || Comparable cohort: past grade means remain relevant to the future reference group. A school cohort cannot simply stand in for the full entrance-exam population.

混杂是指多个因素同时变化，使某个表面关系可能包含其他因素的影响。本题中的年级、知识范围和时间彼此关联，即使加入时间项，也不能保证已分离出纯粹的能力或难度效应。 || Confounding occurs when several factors vary together, so an observed relationship may reflect other influences. School year, topic coverage, and time are related here; adding a time term does not guarantee isolation of ability or difficulty effects.

## #models 08 / Solution 3.1 · Formulate and Solve: Build Baseline Models :: 先试一个简单预测，再解释为什么加入阶段与难度 || Try a Simple Forecast Before Adding Stage and Difficulty

基线是比较用的简单预测规则；回归模型用输入描述输出的平均变化。原计算比较最近3次均值、时间—难度线性模型和增加难度平方项的模型，按选择期MAE采用线性方案。有界模型作为后续修订，另行估计并按统一协议评价。[2] || A baseline is a simple comparison rule; regression models an outcome's mean using inputs. The original calculation compares the last-three mean, a linear time–difficulty model and a model with squared difficulty, selecting the linear specification by selection-period MAE. The subsequent bounded revision is estimated separately and evaluated under a matched protocol. [2]

### 先算一次简单预测：前三次平均能否预测第四次 || A First Forecast: Use Three Exams to Predict the Fourth

用来求参数或制定规则的过去记录称为训练集；不参与这些决定、留到以后核对预测的记录称为留出集。这里先规定一个不解释难度的对照规则：在预测时点，取最近 k 次已知得分率的平均数预测下一次。k 必须事先固定或只在训练期选择，不能看完目标成绩再挑窗口。 || Past records used to estimate parameters or develop a rule form the training set; records reserved to check predictions without influencing those decisions form a holdout set. Begin with a rule that ignores difficulty: average the last k known score rates to predict the next exam. Fix k beforehand or choose it within training, not after seeing the target outcome.

$$
\widehat{y}_{t+1,\mathrm{base}}=\frac{1}{k}\sum_{j=0}^{k-1}y_{t-j}
$$

先实际试一次：假装只知道高一前三次成绩，取 k=3，去预测第 4 次。前三次得分率的平均值约为 0.7967，乘回当时满分 100 分： || Try it once: pretend only the first three Year 1 scores are known. With k=3, predict exam 4. Their mean score rate is about 0.7967; multiply by the 100-point maximum:

$$
\begin{aligned}\widehat S_4&=100\times\frac{0.80+0.78+0.81}{3}\\&\approx79.67.\end{aligned}
$$

揭晓原表，第 4 次实际为 85 分，预测偏低约 5.33 分。这个小例子演示的是「先预测、再核对」，不能凭一次误差判断基线好坏，更不能断言这 5.33 分全由难度或学习进步造成。 || The table reveals an actual score of 85 on exam 4, about 5.33 points above the forecast. This illustrates prediction before checking; one error cannot establish the baseline's quality or show that difficulty or learning caused the entire 5.33-point difference.

### 为什么还需要另一个模型？ || Why Consider Another Model?

固定前三次记录后，下一张试卷无论难度是0.15还是0.30，均值规则都会给出79.67分，因为它没有使用目标难度。滚动均值会随新成绩更新，却没有明确写出阶段与难度变化如何影响预测。我们因此保留基线，另建接收这两个输入的候选方程。 || With the first three records fixed, the mean rule predicts 79.67 points whether the next difficulty is 0.15 or 0.30: target difficulty is not an input. A rolling mean updates with new scores but has no explicit stage–difficulty relationship. Retain it as a baseline and propose a separate equation with those two inputs.

原计算比较三种候选结构。「线性方案」指阶段和难度仅含一次项的模型；二次方案仍然对待估系数线性，同样采用最小二乘估计。 || The original calculation compares three candidate structures. The linear specification contains first-degree stage and difficulty terms. The quadratic specification is also linear in its estimated coefficients and is likewise fitted by least squares.

| 候选 || Candidate | 作用 || Purpose | 取舍 || Trade-off |
| --- | --- | --- |
| 最近3次均值 || Last-three mean | 作为 y 或 r 的简单参照 || Simple forecast of y or r | 忽略难度；近期窗口需事先规定 || Ignores difficulty; fix the window in advance |
| 时间与难度的线性模型 || Linear time and difficulty model | 区分近期趋势与难度关联 || Represent trend and difficulty association | 参数少，但只描述局部平均关系 || Few parameters; only a local mean approximation |
| 必要时增加一个二次项 || One quadratic term if justified | 检查难度关系是否有弯曲 || Allow curvature in difficulty | 须改善留出表现，且对少数点不过度敏感 || Must improve holdout performance without undue sensitivity |

这里比较的是整套预测规则：均值只使用最近3次，回归使用截至预测时点的全部训练记录。因此误差差异不能单独归因于加入难度、加入阶段或增加样本量；若要区分各项增量，需要在相同训练范围下另做有无该项的对照。 || These comparisons concern complete forecasting rules: the mean uses the last three records, while regressions use all training records available at the cutoff. Error differences cannot be attributed separately to adding difficulty, stage or more records. Isolating each addition requires a separate with/without comparison over the same training range.

记录数量也会影响判断。只看高三更贴近高考阶段，却只剩 8 次；三年合起来有 24 次，但年级差异更大。稍后我们会分别计算，看看换一种合理选法会让答案改变多少，这叫敏感性检查。 || The number of records also matters. Final-year data are closer to the target stage but leave only eight exams; pooling all years gives 24 with greater differences between stages. Later we change this choice and inspect how much the answer moves—a sensitivity check.

拓展阅读 || Further Reading

怎样选择恰当的模型？ || How Should We Select a Model?

从任务、约束和证据出发，避免只看曲线形状。 || Start with the task, constraints, and evidence—beyond the curve's shape.

阅读详情 → || Read More →

### 模型选择：依据、术语与本题应用 || Model Selection: Criteria, Terminology, and Application

模型选择依据用途约束、预测误差与稳定性。比较采用一致的预测协议；在适用条件成立、表现相近时优先采用较简单的模型。证据不足以区分时，保留比较结果及其不确定性。 || Model selection considers application constraints, forecast errors and stability under a common evaluation protocol. Among suitable models with similar performance, prefer the simpler specification. When the evidence is inconclusive, report the comparison and its uncertainty.

依据：本拓展综合预测任务的选择与评价原则，不是 GAIMME 原图的新增环节。参见 Hyndman 与 Athanasopoulos《Forecasting: Principles and Practice》第三版的 || Basis: this extension summarizes selection and evaluation principles for forecasting; it is not an extra component of the original GAIMME diagram. See Hyndman and Athanasopoulos, Forecasting: Principles and Practice, third edition,[§7.5 预测变量选择 || §7.5 Selecting Predictors](https://otexts.com/fpp3/selecting-predictors.html)与 || and[§5.10 时序交叉验证 || §5.10 Time Series Cross-Validation](https://otexts.com/fpp3/tscv.html)。

### 从问题出发选择结构，避免从公式库里盲挑名字 || Start From the Problem Instead of Picking Formula Names

1. 确定任务：要解释关系、预测未来，还是比较决策？若预测下一次考试，就检查下一次预测；若一次预测更远的几场，就按相同跨度检验，不能混用误差。 || Define the task: explanation, forecasting, or decision comparison? Evaluate next-exam forecasts when that is the goal, and matching multi-step forecasts when predicting several exams ahead. Do not mix their errors.
2. 检查约束：输出是否有上下界？哪些输入在预测时可用？希望在哪个范围使用？若模型在要使用的范围内给出不可能的分数，就需改模型或明确缩小用途，不能只凭历史 MAE 较小忽略越界。 || Check constraints: output bounds, inputs available at prediction time, and the intended domain. If a model gives impossible scores in that domain, revise it or explicitly narrow its use. Lower historical MAE does not excuse invalid outputs.
3. 提出候选：先设一个容易解释的基线。局部变化近似匀速，可试直线；有持续弯曲证据，可提出低复杂度曲线；若要求输出始终位于固定上下限之间，可试有界均值模型，这里「有界」就是不越过这些界限。每个新增结构都要说明依据，不凭单个点或「学习通常如此」决定形式。 || Propose candidates: begin with an interpretable baseline. Try a line for approximately constant local change, a low-complexity curve for persistent curvature, or a bounded mean when outputs must stay between fixed limits. Justify each addition rather than decide from one point or a generic claim about learning.
4. 公平比较：先定好误差指标、预测跨度和数据使用规则，再用同一批目标记录比较。训练误差小不等于未来预测好；用于挑模型的记录已影响决策，不能再称最终独立检验。时间序列保留先后顺序，任何一步都不能偷用未来答案。 || Compare fairly: fix the metric, horizon, and information rules before comparing the same target records. Small training error is not good future accuracy. Records used to select a model influence that decision and are not an independent final test. Preserve time order and exclude future outcomes at every stage.
5. 检查稳定性再作决定：换合理窗口或暂不纳入某条记录，系数、预测与最优位置会不会大变？表现接近且都满足用途约束时，优先简单、稳定的候选。证据不足就报告不足；不能把已经反复看过的数据重新切分后当作全新确认。 || Assess stability before deciding: do reasonable windows or single-record omission diagnostics substantially change coefficients, forecasts, or optima? When performance is similar and constraints are met, prefer simpler, stable candidates. Report insufficient evidence when appropriate; repartitioning repeatedly inspected data does not create fresh confirmation.

### 术语提醒：曲线弯，不一定就不是线性回归 || Terminology: A Curved Graph Can Still Be Linear Regression

统计中的「线性回归」通常指对待估系数线性。下面 x 是输入，f(x) 是模型输出，a、b、c 是待估系数；虽然含有平方项、图像可以弯曲，但系数仍各自一次出现，没有彼此相乘，因此这是线性回归中的多项式模型： || In statistics, linear regression usually means linear in the coefficients being estimated. Here x is the input, f(x) the model output, and a, b, c the unknown coefficients. The squared input allows curvature, but each coefficient still enters to the first power without multiplying another coefficient. This is a polynomial model within linear regression:

$$
f(x)=a+bx+cx^2
$$

另一种构造是先计算输入的加权和，例如 a+bt+cd，这个中间量称为线性预测子；再用一个能限制输出范围的函数处理它，得到不超过分数边界的平均值。它不是普通最小二乘直线回归：需要比较的是函数结构和估计方法是否适合任务，而不只是图像直或弯。 || Another construction first computes a weighted sum of inputs, such as a+bt+cd, called a linear predictor. A function then maps that intermediate value to a mean within the score limits. This is not ordinary least-squares straight-line regression: suitability depends on the function structure and estimation method, not just whether the graph is straight or curved.

### 到后文看这套逻辑怎样落实 || Follow the Logic in the Actual Solution

- 求解 3.1：从基线构造候选，说明每一项为何进入 || Solution 3.1: Build Candidates From a Baseline and Justify Each Term
- 求解 4：原模型选择与后续检查，不能混淆两种角色 || Solution 4: Distinguish Original Model Selection From Subsequent Evaluation
- 求解 5：统一规则比较新旧候选，再检查稳定性 || Solution 5: Compare Candidates Under Matched Rules and Check Stability

本题有界模型满足分数范围约束；第17—24次统一一步回顾比较中，线性模型的总体MAE较小。两项结果分别描述输出可行性与预测误差。 || The bounded model satisfies the score-range constraint. In the matched one-step retrospective comparison on exams 17–24, the linear model has lower overall MAE. These results describe output feasibility and forecast error, respectively.

### 为什么把考试阶段纳入模型？ || Why Include the Exam Stage?

### 只用难度，意味着忽略阶段差异 || Difficulty Alone Omits Stage Differences

先考虑只接收难度的规则，其中两个系数都需要估计： || First consider a rule that uses difficulty alone, with two coefficients to estimate:$\widehat y=\alpha+\gamma d$，其中 || , where$\alpha$是常数项， || is the constant and$\gamma$是难度系数。同样难度的高一与高三考试会得到相同的预测。这忽略了学生状态随学习阶段变化的可能性，因此值得提出包含阶段信息的候选。 || is the difficulty coefficient. Year 1 and Year 3 exams of the same difficulty receive the same forecast. This omits possible changes in the student's state through study, motivating a candidate with stage information.

### 使用的是有序阶段，不是编号本身的作用 || Use Ordered Stages, Not an Effect of the Identifier

本题每学年8次记录。将各年表内列序视为考试先后顺序，跨年从1排到24，在这个顺序假设下，用 || There are eight records per school year. Treating each year's column order as exam order gives indices 1–24 across the three years. Under this ordering assumption,$t$粗略表示学习进程。任意编号本身不提供学习阶段信息；这里借用的是时间顺序。把所有编号整体加上同一个数，并相应调整模型截距，预测可以保持不变。 || roughly represents progression through study. An arbitrary identifier supplies no stage information; chronological order is what matters here. Adding the same number to every index and adjusting the intercept accordingly can leave predictions unchanged.

阶段趋势可能混合知识积累、复习和试卷内容变化等影响。因此，加入这一项是允许平均表现随阶段变化，不是规定多考一次就能提高成绩；也不能把估计出的趋势直接解释为能力增长或考试次数的因果效应。 || A stage trend may combine knowledge accumulation, revision, and changes in paper content. This term allows mean performance to vary with stage; it does not prescribe improvement from taking another exam or identify a causal effect of ability growth or exam frequency.

### 序号作为时间代理，有哪些近似？ || What Does the Time Proxy Approximate?

用序号差近似阶段距离，再用直线描述局部趋势，相当于先把相邻考试看作等间距的阶段。现实中间隔一周或三个月，序号都只增加1；学习进展也未必匀速。有真实日期、复习时长等信息时，应比较这些输入是否更合适，并限制线性趋势的外推范围。 || Using index differences as stage distances and a straight line for the local trend treats successive exams as equally spaced stages. In reality, both a one-week and a three-month gap increase the index by one, and learning need not progress at a constant rate. With dates or study-duration data, compare more direct inputs and limit extrapolation of the linear trend.

以上解释为什么提出这个候选；是否值得保留阶段项，还要看预测表现。后文用 || This motivates proposing the candidate; retaining the stage term also requires predictive evidence. The later[相同训练范围下的删变量对照 || with/without-stage comparison over matched training ranges](#time-proxy-check)检验这一点。下面先把参照水平和两项调整写成方程。 || examines that question. First, express the reference level and two adjustments as an equation.

### 线性候选的构造：参照水平、阶段调整与难度调整 || Constructing the Linear Candidate: Reference Level, Stage and Difficulty

线性模型的构成为：平均得分率＝参照水平＋阶段调整＋难度调整。三个参数由同一训练集联合估计。推导先给出参照形式，再将其改写为截距形式。 || The linear model combines a reference level, a stage adjustment and a difficulty adjustment. Its three parameters are estimated jointly from the training set. The derivation starts from the reference form and then rewrites it in intercept form.

### ① 水平参照：定义参照条件下的平均表现 || ① Reference Level: Define Mean Performance at the Reference

选定参照阶段 t₀ 和参照难度 d₀，用 A 表示模型在这组条件下的平均得分率。下标 0 表示参照，不是第 0 次考试；A 需要估计，不直接等于前三次均值 0.7967 或某次实际成绩。 || Choose reference stage t₀ and difficulty d₀. Let A be the modeled mean score rate under those conditions. Subscript 0 marks a reference, not exam zero. A must be estimated; it is not automatically the earlier three-exam mean of 0.7967 or an observed score.

$$
f_0(t,d)=A
$$

### ② 阶段调整：把「往后一次，平均改变多少」写出来 || ② Stage Adjustment: Express the Mean Change per Later Exam

三年记录跨越不同学习阶段，所以让预测随考试编号 t 改变。先假设：难度可比时，编号每增加1，平均得分率改变 b；相对 t₀ 前进 t−t₀ 次，就调整 b(t−t₀)。b 的正负由数据估计，不预先规定进步。t 是考试顺序，不是真实备考时长，也不等于数学能力。 || The records span different learning stages, so allow prediction to vary with exam index t. Assume that at comparable difficulty, each additional index changes the mean rate by b; moving t−t₀ indices gives adjustment b(t−t₀). Estimate the sign of b rather than assuming improvement. t is exam order, not elapsed preparation time or mathematical ability.

$$
f_1(t,d)=A+b(t-t_0)
$$

这仍不够：在同一个目标阶段，这条式子对简单卷和难卷给出的预测相同。而且，若后期试卷恰好更容易，只看编号可能把试卷变化误当成阶段变化。因此还要把难度单独放进候选方程。 || This is still incomplete: at a fixed target stage it gives the same forecast for easier and harder papers. If later papers also happen to be easier, using exam order alone could confuse paper changes with stage changes. Difficulty therefore deserves its own input in the candidate equation.

### ③ 难度调整：在相同阶段，再按难度差作修正 || ③ Difficulty Adjustment: Adjust for Difficulty at the Same Stage

再作一个直线假设：阶段不变时，难度改变多少，平均得分率就约改变它的 c 倍。因此，相对参照难度 d₀ 的调整是 c(d−d₀)；难度增加 0.01，只调整 0.01c，不是加 c。预期难卷可能降低得分并不等于已知 c 必为负，仍须用记录估计。 || Add a second straight-line assumption: at fixed stage, a difficulty change produces approximately c times that change in the mean score rate. Relative to d₀, the adjustment is c(d−d₀). Increasing difficulty by 0.01 contributes 0.01c, not c. Expecting harder papers to reduce scores does not establish a negative c; it must still be estimated.

把「水平参照＋阶段调整＋难度调整」相加，得到下面的候选。令 f(t,d) 表示其平均得分率，参照处的值 f(t₀,d₀) 就是 A。这里额外假设两项可以直接相加，且各自斜率不随另一输入变化；这不是说阶段和难度在实际数据中互不相关。 || Add the reference level, stage adjustment, and difficulty adjustment. Let f(t,d) denote the candidate mean score rate; its reference value f(t₀,d₀) is A. This adds an assumption of additive adjustments whose slopes do not vary with the other input. It does not mean that stage and difficulty are unrelated in the observed records.

$$
f(t,d)\approx f(t_0,d_0)+b(t-t_0)+c(d-d_0)
$$

这套说法是模型中的条件比较，不要求题目真的有「同一次考试、两种难度」的配对记录；参数由整组训练记录共同估计。因为阶段、试卷内容和难度可能同时变化，即使求出了 b、c，也不能直接把它们当成学习进步或难度变化的因果效应。 || These are conditional comparisons within a model, not a requirement for paired observations of the same exam at two difficulties. Estimate the parameters jointly from the training records. Stage, content, and difficulty may change together, so estimated b and c are not automatically causal effects of learning or difficulty.

### ④ 整理方程：展开、归并，再定义简写 a || ④ Collect Terms: Expand, Regroup, Then Define the Shorthand a

前面通过假设得到「参照水平＋阶段调整＋难度调整」。这一步只做代数整理，不增加新的建模假设。先用乘法分配律展开：b 乘 t 和 −t₀，c 乘 d 和 −d₀。 || Our assumptions gave a reference level plus stage and difficulty adjustments. This step performs only algebraic rearrangement, adding no modeling assumption. First distribute multiplication: b multiplies t and −t₀, while c multiplies d and −d₀.

$$
\begin{aligned}&A+b(t-t_0)+c(d-d_0)\\&=A+bt-bt_0+cd-cd_0.\end{aligned}
$$

再调整各项的位置，把不含输入 t、d 的三项 A、−bt₀、−cd₀ 放在一起；含输入的 bt、cd 留在后面。移动的是带着正负号的整项： || Next regroup the three terms without the inputs t and d: A, −bt₀, and −cd₀. Leave bt and cd afterward. Move each complete term with its sign:

$$
\begin{aligned}&A+bt-bt_0+cd-cd_0\\&=(A-bt_0-cd_0)+bt+cd.\end{aligned}
$$

为什么括号内可以合并成一个数？t₀、d₀ 是选定的参照；A、b、c 是同一套模型的参数。参数估定后，改变输入 t、d 不会改变 A−bt₀−cd₀。「目前还不知道参数值」与「参数随每次输入而变」是两回事。 || Why can the bracket be represented by one number? t₀ and d₀ are chosen references, and A, b, c are parameters of one model. Once estimated, changing the inputs t and d does not change A−bt₀−cd₀. Not knowing a parameter yet is different from allowing it to change with every input.

为少写几个符号，现在把这一整块定义为小写 a；符号 := 表示「定义为」： || To shorten the expression, now define lowercase a as this entire bracket. The symbol := means is defined as:

$$
a:=A-bt_0-cd_0
$$

用 a 替换括号，原来的三个部分就写成 a+bt+cd，所以平均得分率的表达式可改写为： || Replace the bracket with a. The original three-part expression becomes a+bt+cd, so the mean score-rate expression can now be written as:

$$
f(t,d)\approx a+bt+cd
$$

a 替代参照水平参数 A，自由参数仍为三个。两种形式等价，分别便于解释和系数估计。 || a replaces the reference-level parameter A, leaving three free parameters. The two forms are equivalent and support interpretation and coefficient estimation, respectively.

t、d 是每次会换的输入；a、b、c 是同一条规则中的固定参数，不能每个点各换一套。实际第 t 次的得分率记为 yₜ，该次难度记为 dₜ；成绩未必恰好等于模型平均值，把剩余偏离记为 εₜ： || t and d are changing inputs; a, b, c are fixed parameters within one rule, not a new set for every observation. Write the observed score rate on exam t as yₜ and its difficulty as dₜ. An observed score need not equal the modeled mean; denote the remaining deviation by εₜ:

:::callout { title: "关键洞察 || Key Insight" }
$y_t=a+bt+cd_t+\varepsilon_t$ a 是常数项，也称截距；它对应两个输入都取 0 时公式给出的值，不一定对应真实考试。b、c 决定输入改变时的变化方向和大小。ε 是希腊字母 epsilon，只是给「还没解释的偏离」起的名字，不是心理分数。若要把公式解释为平均水平，还需假设相同输入条件下这些偏离平均为零。 || a is the constant term, or intercept: the formula's value when both inputs are zero, not necessarily a real exam. b and c describe the direction and size of changes. ε, the Greek letter epsilon, labels unexplained deviation; it is not a mindset score. Interpreting the formula as a mean requires those deviations to average to zero under the same inputs.
:::

第二问把输出量换成 rₜ = yₜ − mₜ，同样作局部线性近似，便得到下面的优势模型。注意：u、v、w 是另一组待求系数，不能直接照抄 a、b、c；输出变了，误差和最合适的系数也会改变。 || For the second question, replace the outcome with rₜ = yₜ − mₜ and apply the same local linear approximation. Its coefficients u, v, w must be estimated for that outcome; they cannot simply be copied from a, b, c.

:::callout { title: "关键洞察 || Key Insight" }
$r_t=u+vt+wd_t+\eta_t$ 直接预测个人与均分的差，避免为相对目标额外输入未来均分；它仍依赖历史参考群体与未来群体可比。u、v、w 的作用与上式对应，η 是未解释的偏离。 || Directly model the margin to avoid requiring a separate future mean as an input for this target. Cohort comparability is still assumed. u, v, and w play analogous roles, and η is unexplained deviation.
:::

方程形式确定后，用历史记录选择 a、b、c，使方程尽量贴近这些记录，这叫拟合。两个输入 t、d 共同决定每次估计值；不是只在难度—得分率图上画一条线代表所有阶段。上面的常数式和单阶段式只是构造台阶，本文没有新增它们的单独拟合结果。 || Once the form is specified, choose a, b, c from past records so that its outputs approximate the observations; this is fitting. Both t and d determine each estimate, rather than one line on a difficulty–score plot representing every stage. The constant and stage-only forms are explanatory steps, not additional fitted results.

怎样求参数，见 || For parameter estimation, see[求解 3.2：用最小二乘找到系数 || Solution 3.2: Find Coefficients With Least Squares](#coefficients)；整套预测规则的表现，见 || ; to assess the complete forecasting rule, see[求解 4：在同一批后续考试上比较 || Solution 4: Compare on the Same Later Exams](#validation)。有了方程不等于已经得到参数，有了拟合结果也不等于已经证明预测更好。 || . An equation is not yet an estimated model, and a fitted model is not yet evidence of better prediction.

拓展阅读 || Further Reading

拟合和检验为什么可以使用不同误差？ || Why Can Fitting and Evaluation Use Different Errors?

解释平方误差与绝对误差的不同用途。 || Understand the roles of squared and absolute error.

阅读详情 → || Read More →

### 拟合损失与检验指标 || Fitting Loss and Evaluation Metrics

把误差平方后再求和，可以避免正负误差互相抵消，并对较大的偏离施加更高代价。 || Summing squared errors prevents positive and negative errors from canceling and penalizes larger deviations more strongly.

- 若两次误差分别为 e 和 −e，直接相加等于零，并不表示两次都准确；平方和为 2e²，只有 e = 0 才为零。 || Errors e and −e sum to zero even when neither prediction is correct. Their squared sum is 2e², which is zero only when e = 0.
- 绝对值也能避免抵消，因此平方并非唯一选择。用平方误差估计系数、用留出集的平均绝对误差评价预测，是两个不同环节，并不矛盾。 || Absolute errors also avoid cancellation, so squaring is not the only choice. Fitting with squared error and evaluating held-out predictions with MAE are distinct, compatible steps.

### 确定输入：预测时实际知道哪些信息 || Specify the Inputs Available at Prediction Time

信息泄漏是指模型在训练或评估时使用了真实预测时拿不到的信息，从而显得异常准确。[2] || Information leakage occurs when fitting or evaluation uses information unavailable at the real prediction time, creating misleading apparent accuracy. [2]

- 不能用同场 rₜ 去预测 yₜ，因为 rₜ = yₜ − mₜ 已包含待预测的个人成绩。这只是绕路使用答案。 || Do not use same-exam rₜ to predict yₜ: rₜ = yₜ − mₜ already contains the target score.
- 若用年级均分帮助预测个人成绩，未来 m* 也未知。应另建均分预测或设定情景，并把均分预测误差传递到个人成绩的不确定性中；不能拿留出考试的真实均分冒充已知输入。 || If the grade mean predicts the student's score, future m* is also unknown. Forecast it separately or specify scenarios, and propagate its uncertainty. Do not silently use the actual held-out mean as an available predictor.
- 本题允许把目标试卷的给定难度作为输入。若现实中难度事先未知，应分别讨论明确的难度情景，不能在预测后用实际试卷难度替代原先未知的输入。 || This problem supplies target difficulty as an input. If difficulty is unknown in actual use, specify separate difficulty scenarios instead of treating the eventually observed difficulty as something known beforehand.

至此，模型需要的输入、输出和待估系数已经明确。接下来只解决一个问题：用过去记录，怎样同时确定 a、b、c？ || The inputs, outputs, and unknown coefficients are now specified. The next task is to estimate a, b, c jointly from past records.

## #coefficients 09 / Solution 3.2 · Formulate and Solve: Estimate Parameters :: 先弄懂「怎样算更贴近」，再决定参数是多少 || Define a Better Fit Before Finding the Coefficients

回顾符号：yₜ 是第 t 次得分率，t 是考试编号，dₜ 是该次难度；a 是常数项，b、c 是阶段与难度的系数，εₜ 是模型未解释的偏离。前三个系数要由训练记录共同估计，不能每次考试各换一套。 || Recall the notation: yₜ is the score rate at exam t, t is the exam index, and dₜ its difficulty. a is the constant, b and c the stage and difficulty coefficients, and εₜ the unexplained deviation. Estimate one shared set of three coefficients from training records, not a different set for each exam.

:::sandbox { id: "exam-performance-modeling-sandbox-2", title: "用一个数代表 80 分和 78 分，怎样选才合理 || Which Single Number Should Represent 80 and 78?", canvas: false }
设共同代表分数为 C，误差定义为实际分数减 C。如果 C=79，两次误差是1和−1，加起来为0，但并非两次都准确。因此先把误差平方再相加，得到用于比较的总量 J(C)： || Let C be a common representative score and define error as observed score minus C. At C=79, the errors are 1 and −1. Their sum is zero even though neither estimate is exact. Instead, square each error and add them to obtain the comparison quantity J(C):
:::

## #validation 10 / Solution 4 · Analyze and Assess :: 按历史时点回算：用较早记录预测较晚考试 || Historical Forecast Reconstruction: Earlier Records Predict Later Exams

求系数时已经用过的成绩，不能再单独证明预测能力。这里按考试先后模拟真实预测：先用过去求系数，预测较晚的考试，再揭晓实际结果。目标是检查这条规则能否超出训练记录继续使用。[2] || Scores already used for estimation cannot by themselves demonstrate predictive ability. Reproduce the forecast in time order: fit on the past, predict a later exam, then reveal its outcome. This checks whether the rule remains useful beyond the records used to fit it. [2]

### 把训练、模型选择与最终检查分开 || Separate Fitting, Model Selection, and Final Evaluation

可以把验证理解为一次不能偷看答案的检查。用来求系数的记录叫训练集；拿来比较几种公式、决定选哪一种的记录叫模型选择集；最后再留一段不参与这些决定的记录作最终检查，叫测试集或留出集。本文都按考试先后划分，不能把未来的成绩混到过去的训练里。 || Think of validation as a test whose answers must stay hidden until prediction. Training data determine coefficients; a model-selection set chooses between candidate rules; a separate final test or holdout set checks the chosen procedure. Split chronologically so future scores cannot enter past training.

一个公式可能把过去的偶然波动也记住，看旧记录很准，遇到新记录却不准，这叫过拟合。因此「过去贴得很近」和「以后预测得好」要分开检查；只有 24 次记录，检查结果本身也可能不稳定。 || A rule can memorize accidental past fluctuations and fit old records closely while predicting new ones poorly—overfitting. Past fit and future accuracy must therefore be checked separately. With only 24 exams, evaluation itself can be unstable.

### 把检验协议具体落到这 24 条记录 || Specify a Protocol for These 24 Records

原脚本用1—16次作初始拟合，以17—20次滚动预测误差选择模型，再用1—20次重估并冻结参数，预测21—24次。本研究基于已知24条历史记录按信息截止点回算，比较结论限于该数据和协议；外部效度需在新考试记录中检验。 || The original script fits on exams 1–16, selects the model using rolling errors on 17–20, then refits and freezes parameters on 1–20 to predict 21–24. This retrospective analysis reconstructs forecasts from 24 known historical records at specified information cutoffs. Comparisons apply to these data and protocols; external validity requires new exam records.

1. 只用 1—16 次求 â₁₆、b̂₁₆、ĉ₁₆，再把 t = 17、给定难度 0.17 输入，得到 ŷ₁₇。此时不能用第 17 次的个人分数和年级均分作输入。 || Estimate â₁₆, b̂₁₆, ĉ₁₆ using only exams 1–16, then input t = 17 and the specified difficulty 0.17 to obtain ŷ₁₇. Do not use the 17th student score or grade mean as predictors.
2. 形成预测后，才用实际得分率 13/15 核对，得到 e₁₇ = 13/15 − ŷ₁₇。向后移动，用 1—17 次预测第 18 次，直到得到第 20 次的误差。基线也在同样的时点、用同样可用的信息预测。 || Only after prediction, compare with the observed rate 13/15 to obtain e₁₇ = 13/15 − ŷ₁₇. Move forward, using 1–17 to predict exam 18, through exam 20. Evaluate the baseline at the same cutoffs with the same available information.
3. 用这四次误差比较模型；选定形式和窗口规则后冻结这些选择，再用 1—20 次估计系数，对 21—24 次作最终检查。若一次预测这四次，应分别报告提前 1、2、3、4 步的误差，避免把它们混同于下一次预测精度。 || Compare models on these four errors. Freeze the chosen form and window rule, refit on exams 1–20, and evaluate 21–24. If forecasting all four at once, report errors separately for horizons 1–4 without treating all as next-exam accuracy.

「提前 1 步」就是预测下一次考试；「提前 4 步」是在第 20 次结束时就预测第 24 次，中间不能拿第 21—23 次的实际成绩来更新。距离越远，不确定因素可能越多，所以要把这些不同距离的检查分清。 || One step ahead means the next exam. Four steps ahead means predicting exam 24 at the end of exam 20, without updating from the actual results of exams 21–23. More distant predictions may face more changes, so distinguish these horizons.

怎样比较「预测得准不准」？先规定误差等于实际值减预测值：正数表示预测偏低，负数表示预测偏高。然后取绝对值，再求平均，这就是平均绝对误差，英文缩写 MAE。数值越小，说明在这批检查记录上平均偏得越少。 || To compare accuracy, define error as observed minus predicted: positive means underprediction, negative means overprediction. Average the absolute errors to get mean absolute error, or MAE. A smaller value means smaller average misses on those evaluation records.

$$
\operatorname{MAE}_{17:20}=\frac{|e_{17}|+|e_{18}|+|e_{19}|+|e_{20}|}{4}
$$

若 e 用得分率计算，MAE 也先是得分率单位。第 17—24 次都为 150 分制，因此把各次得分率误差乘以 150，就得到后面表格中的「分」。不要把 0.02 的得分率误差直接读作 0.02 分；在 150 分制下它是 3 分。 || When e is a rate error, MAE initially has rate units too. Exams 17–24 all have a 150-point maximum, so multiplying each rate error by 150 gives the point errors in the tables. A rate error of 0.02 is not 0.02 points; on this scale it is 3 points.

这里检验的是「给定难度」条件下的成绩预测，因此可以把留出试卷的难度作为情景输入。若现实中连难度也未知，就还需要难度情景或难度预测，其不确定性不能省略。本文实际按上述协议计算，结果如下。[4] || This evaluates score prediction conditional on a specified difficulty, so held-out difficulty is a scenario input. Unknown difficulty would need its own scenarios or forecast and uncertainty. The following results were computed using this protocol. [4]

### 时间—难度对照模型：保留原来的选择与检查记录 || Time–Difficulty Comparisons: Preserve the Original Evaluation

下面比较近期均值、时间—难度直线和增加难度平方项的三种候选。先看17—20次的选择结果，再看21—24次的检查；两张表承担不同任务，不能把有利的数字混在一起挑模型。 || Compare three candidates: the recent mean, the time–difficulty line, and the version with squared difficulty. First inspect selection on exams 17–20, then evaluation on 21–24. The tables serve different purposes; favorable entries cannot be mixed to select a model.

基线固定取最近 3 次均值；候选回归分别为 t + d、t + d + d²，均含截距。两种输出分别选择模型，以 17—20 次滚动预测的 MAE 较小者为准。所有误差都折算到 150 分制，分差误差也以分为单位。 || Fix the baseline at the last three observations. Compare regressions with t + d and t + d + d², both with intercepts. Select separately for each target by rolling MAE on exams 17–20. All errors, including margin errors, are in 150-point score units.

**旧方案 A｜17—20 次：每次重估参数，预测下一场；用于模型选择 || Original A | Exams 17–20: Refit for Each One-Step Forecast; Model Selection**

| 模型 || Model | 成绩 MAE／分 || Score MAE / Points | 分差 MAE／分 || Margin MAE / Points |
| --- | --- | --- |
| 最近 3 次均值 || Last-3 Mean | 12.79 | 10.13 |
| 线性：t + d（两目标均入选） || Linear: t + d (Selected for Both) | **3.15** | **5.87** |
| 二次：t + d + d² || Quadratic: t + d + d² | 7.61 | 10.65 |

以第 17 次为例：只用前 16 次求得线性系数后，预测成绩为 131.89 分，实际为 130 分，误差为 −1.89 分。第 17—20 次的成绩误差依次约为 −1.89、8.23、1.24、−1.23 分，绝对值的平均数为 3.15 分。 || For exam 17, the linear model fitted only on exams 1–16 predicts 131.89 points versus an observed 130, an error of −1.89. Score errors for exams 17–20 are approximately −1.89, 8.23, 1.24, and −1.23 points; their mean absolute value is 3.15.

**旧方案 B｜21—24 次：仅用 1—20 次拟合，一次预测四场，不更新中间成绩 || Original B | Fit on 1–20, Forecast 21–24 Together Without Intermediate Updates**

| 模型 || Model | 成绩 MAE／分 || Score MAE / Points | 分差 MAE／分 || Margin MAE / Points |
| --- | --- | --- |
| 最近 3 次均值 || Last-3 Mean | 15.58 | 10.00 |
| 已选线性模型 || Selected Linear Model | 6.60 | 6.93 |
| 二次模型（对照，不重新选） || Quadratic (Comparison Only) | 5.87 | 6.99 |

线性模型对第21—24次的成绩误差为9.11、10.12、4.49、2.68分，均为低估；分差误差为8.74、4.35、6.20、8.43分。二次模型在该段成绩MAE较低；本报告保留按第17—20次误差确定的线性方案。 || The linear model's score errors for exams 21–24 are 9.11, 10.12, 4.49 and 2.68 points, all underpredictions; margin errors are 8.74, 4.35, 6.20 and 8.43. The quadratic model has lower score MAE in this block. This report retains the linear specification selected using exams 17–20.

:::callout { title: "📊 图 4｜每次只用左边的过去，预测右边的下一次 || Figure 4 | Predict the Next Exam Using Only Its Past" }
读图：橙色格中的真实结果，只能在形成预测后用于核对。它在更晚一轮中成为训练资料是允许的，因为到那一轮时它已经发生；但本轮不能提前使用右侧记录。 || Read the chart: the orange outcome is revealed only after the prediction is made. It may enter training in a later round because it has then occurred. Future cells remain unavailable in the current round.
:::

如果反复依据最终留出结果改模型，这批数据也参与了模型选择，便不再是独立检查。若使用滞后项，多步预测时不能偷用中间尚未发生考试的真实成绩；此时需预测滞后值或改用不依赖它的模型。 || Repeatedly revising the model after inspecting the final holdout turns that holdout into model-selection data. For multi-step forecasts with lagged inputs, intermediate future scores are unavailable: forecast those inputs or use a model that does not require them.

### 阶段项是否改善预测？补充删变量对照 || Does the Stage Term Improve Prediction? An Additional Ablation

删变量对照，是去掉一个输入后重新估计模型，再比较预测误差。为回答阶段序号是否有预测用途，这里新增一项回顾性分析，沿用原来的数据和信息截止点；它不属于原先三种候选的选择结果，也不增加新的独立留出数据。 || An ablation removes an input, refits the model, and compares forecast errors. This additional retrospective analysis asks whether the stage index has predictive value, using the original data and information cutoffs. It is separate from the original three-candidate selection and adds no fresh independent holdout data.

比较只用难度的 || Compare difficulty alone,$\widehat y=\alpha+\gamma d$与阶段加难度的 || , with stage and difficulty,$\widehat y=a+bt+cd$。两者均在同一批训练记录上，以得分率的最小二乘误差估计各自全部系数；不是直接删掉原公式的阶段项而保留其他系数。目标考试和给定难度相同，只改变是否使用阶段输入。 || . Both estimate all their own coefficients by least squares in score-rate units on the same training records. Removing the stage term does not leave the other original coefficients unchanged. Target exams and specified difficulties are identical; only the inclusion of the stage input differs.

第17—20次采用逐次预测：每次用此前全部记录重估，预测下一场；第21—24次采用冻结参数预测：只用1—20次估计参数，一次预测后面四场，中间不更新。 || For exams 17–20, refit on all preceding records before each next-exam forecast. For exams 21–24, fit only on 1–20 and freeze those parameters for all four forecasts, without intermediate updates.

**补充回顾性对照｜个人成绩MAE，均为150分制；每行使用相同目标和训练截止点 || Additional retrospective comparison | Student-score MAE on the 150-point scale; matching targets and cutoffs within each row**

| 检验方式 || Evaluation protocol | 只用难度／分 || Difficulty only / points | 阶段＋难度／分 || Stage + difficulty / points |
| --- | --- | --- |
| 第17—20次，逐次预测 || 17–20: one-step forecasts | 3.89 | 3.15 |
| 第21—24次，冻结参数 || 21–24: frozen parameters | 9.78 | 6.60 |

在这两种历史检验方式下，加入阶段项均降低了平均绝对误差，支持在本题线性方案中保留这项信息。每行只有4次目标考试，结论限于这些记录和协议；误差改善不能证明考试次数的因果作用，也没有在此检验系数的统计显著性。后续新记录应继续检查它是否有用。 || Including stage reduces mean absolute error under both historical protocols, supporting its retention in this problem's linear specification. Each row has only four target exams, so the conclusion is limited to these records and protocols. Better errors establish neither a causal effect of exam frequency nor coefficient significance, which is not tested here. Reassess usefulness on subsequent new records.

[删变量对照计算脚本 || Ablation calculation script](time-proxy-calculation.py) · [逐次预测、训练截止点与误差 || Per-exam forecasts, training cutoffs, and errors](time-proxy-results.json)

### 检查残差、敏感性和预测范围，不只报告一个分数 || Inspect Residuals, Sensitivity, and Prediction Ranges

检验应指出模型在哪里可能失效，而不仅给出一个总体误差。 || Validation should identify where the model may fail, not just report an aggregate error.

- 残差检查：随时间是否连续偏正或偏负？随难度是否弯曲或波动扩大？这些现象可能提示遗漏趋势、非线性或误差结构不合适，不能一概归于心态。 || Residual checks: are errors persistently positive or negative over time? Do they curve or spread out with difficulty? Such patterns may indicate omitted trends, nonlinearity, or an unsuitable error model, not necessarily mindset.
- 敏感性检查：改变近期窗口、比较全三年与近期数据、检查某个异常点的影响后，判断是否明显改变？若改变，应把结论写成依赖假设的条件判断。 || Sensitivity checks: do conclusions change with the recent window, all-year versus recent data, or the inclusion of an unusual observation? If so, report that dependence rather than a definitive conclusion.
- 范围检查：个人得分率应在 [0, 1] 内。线性模型若经常预测越界，应重新检查形式与适用范围，不能只把结果截到边界便宣称模型有效。 || Range checks: a score rate must lie in [0, 1]. Frequent out-of-range linear predictions call for reconsidering the model or its scope; clipping them to the bounds does not validate the model.

还有一种常见误解：平均误差是几分，就以为下一次一定只会差这几分。平均数不是上限，少数考试可能差得更多。要进一步给出「未来分数大概落在哪个区间、覆盖把握有多大」，还需要关于波动的额外依据；本文不凭四次检查就宣称一个精确的概率范围。[3] || A common mistake is treating an average error as a limit on the next error. An average is not a bound; some misses can be larger. A range for a future score with a stated coverage level needs additional evidence about variability. Four evaluation exams do not justify an invented precise probability range. [3]

## #iteration 11 / Solution 5 · Iterate :: 从检验发现问题：修正模型，再检查准确性与稳定性 || Revise From Evaluation: Recheck Accuracy and Stability

把从已有记录建立的规则用于历史观测范围之外，称为外推。时间—难度直线在旧检查中连续低估，又在低难度外推时给出超过满分的预测。前者提示检查遗漏变化和数据范围；后者说明函数形式缺少分数边界。修正必须重新提出候选、估计参数并检验，不能只改答案。 || Using a rule beyond the range observed in its historical data is extrapolation. The time–difficulty line repeatedly underpredicted in the original check and exceeded full marks when extrapolated to low difficulty. The first issue calls for checking omitted changes and the fitting sample; the second reveals a missing score bound. Revision requires a new candidate, estimation, and evaluation, not merely an edited answer.

### 补充候选：先让预测不超过满分，再检查是否更准 || Additional Candidate: Enforce the Score Limit, Then Test Accuracy

得分率必须位于 0 到 1 之间，而前面的直线形式本身没有施加这个限制。下面先解释怎样限制一个函数的输出，再将它用于本题。 || A score rate must lie between 0 and 1, but the preceding linear form does not enforce that constraint. First define a function with the required output limits, then apply it to this problem.

有界函数：在规定的输入范围内，函数值始终位于两个固定的有限数之间。例如得分率要求下限为 0、上限为 1。下面用 g 表示所选函数，用 z 表示它的输入；z 可以是任意实数，本身还不是预测得分率。 || Bounded function: over a specified input domain, the function values remain between two fixed finite numbers. A score rate needs bounds of 0 and 1. Let g denote the chosen function and z its input; z may be any real number and is not itself a predicted score rate.

本节采用分数响应logit均值模型。响应为0—1之间的得分率，logistic映射给出条件均值，参数按准似然估计。[7] || This section uses a fractional-logit mean model. The response is a score rate between 0 and 1, the logistic mapping specifies its conditional mean, and parameters are estimated by quasi-likelihood. [7]

取 e≈2.718 为指数的底数。我们选择下面这个具体函数，它常称为 logistic 函数： || Let e≈2.718 be the exponential base. Choose the following specific function, commonly called the logistic function:

$$
g(z)=\frac{1}{1+e^{-z}}
$$

对任意有限 z，e 的 −z 次方都大于 0，分母便大于 1，所以 g(z) 始终大于 0、小于 1。先代一个数核对：z=0 时，g(0)=1÷(1+1)=0.5；乘 150 得到 75。这只是说明函数怎样工作，不是本题模型已经预测出 75 分。 || For any finite z, e to the power −z is positive. The denominator exceeds 1, so g(z) always lies strictly between 0 and 1. At z=0, g(0)=1÷(1+1)=0.5; multiplying by 150 gives 75. This checks how the function works, not a fitted prediction of 75 points for this student.

接着确定 g 的输入：先算 aᵧ+bᵧt+cᵧd，再把所得数代入 g。这个输入加权和叫线性预测子；下标 y 表示这组系数用于个人得分率。群体均分率用另一组下标为 m 的系数，同样处理。 || Next specify the input to g: calculate aᵧ+bᵧt+cᵧd and substitute that value into g. This weighted input sum is called a linear predictor; subscript y labels the coefficients for the student's rate. A separate set labeled m serves the cohort mean rate.

μ 读作 mu，这里表示相同阶段和难度条件下的模型平均得分率。μᵧ对应个人，μₘ对应群体均分；它们不是下一次必然出现的实际成绩。把上面的输入和函数连接起来，就得到： || μ, pronounced mu, denotes the model's average score rate at the same stage and difficulty. μᵧ is for the student and μₘ for the cohort mean; neither is a guaranteed next observed score. Combining the input expressions with g gives:

$$
\begin{aligned}\mu_y(t,d)&=g(a_y+b_yt+c_yd),\\\mu_m(t,d)&=g(a_m+b_mt+c_md).\end{aligned}
$$

两条条件均值函数各含三个参数，输出在0与1之间。各乘150得到预计分数，均值之差乘150得到预计分差。[7] || Each conditional mean has three parameters and lies between 0 and 1. Multiplying by 150 gives expected points; multiplying their difference by 150 gives the expected point margin. [7]

为什么不只把两条直线相减？在同一批训练记录、同一组输入和最小二乘准则下，分别拟合个人与均分后相减，等价于直接拟合 r=y−m。真正改变候选的是有界的非线性形式，不是「同时预测两个量」这几个字。它也没有自动分离能力与心态。 || Why not simply subtract two fitted lines? With the same training records, inputs, and least-squares criterion, fitting personal and cohort rates separately and subtracting is equivalent to fitting r=y−m directly. The change here is the bounded nonlinear form, not merely predicting two quantities. It does not automatically separate ability and mindset.

计算复核 || Calculation Audit

有界均值的参数怎样估计？ || How Is the Bounded Mean Estimated?

查看拟合准则、数值求解与适用边界。 || Inspect the fitting criterion, numerical solution, and limits.

阅读详情 → || Read More →

### 有界均值的参数估计 || Estimating the Bounded Mean

先规定怎样衡量一组系数的好坏。把模型与观测的不一致汇总成一个数，称为损失；损失越小，表示按这个准则越贴近训练记录。下面 yₜ 是实际得分率，μₜ 是模型平均得分率，J 是总损失，log 是以 e 为底的自然对数。 || First define how to compare coefficient sets. A loss summarizes mismatch between the model and observations in one number; a smaller value means a closer fit under that criterion. Below yₜ is the observed rate, μₜ the modeled mean rate, J the total loss, and log the natural logarithm with base e.

$$
J=-\sum_t\left[y_t\log\mu_t+(1-y_t)\log(1-\mu_t)\right]
$$

上式为负准对数似然损失。在函数形式固定后，数值迭代指反复更新系数以减小该损失。梯度由损失对各系数的变化率组成；收敛检查则判断其是否满足预设阈值。本实现采用阻尼Newton法。 || The expression is the negative quasi-log-likelihood loss. With the functional form fixed, numerical iteration updates coefficients to reduce this loss. The gradient contains the loss's rates of change with respect to the coefficients; convergence is checked against a specified tolerance. The implementation uses damped Newton updates.

群体均分率使用相同准则。这不是先对实际得分率取 logit 再逆变换，也不把 150 分当作 150 次独立的对错试验；本篇不据此给出显著性或置信区间。[6][7] || The same criterion is used for the cohort mean rate. This neither transforms observed rates with a logit and inverts them afterward nor treats 150 points as independent binary trials. No significance tests or confidence intervals are inferred here. [6][7]

代码对输入使用预先固定的中心和尺度，改善数值计算；这不增加参数，也不使用未来成绩。损失准则不同于前面的最小二乘，但预测比较统一使用相同考试的 MAE。 || The code uses fixed centering and scaling of inputs for numerical stability, adding no parameters or future scores. The fitting loss differs from least squares, but forecast comparisons use MAE on the same exams.

### 统一规则再比较：同一时点、同一预测跨度、同一信息 || Compare Under One Protocol: Same Cutoff, Horizon, and Information

旧表的6.60分来自一次预测四场，不能直接与每场重估的一步误差排名。这里将原三候选和后续有界修订放到统一协议：在第17—24次的每场考试前，只用此前记录重新估计参数，再预测下一场；该场给定难度可用，实际成绩和均分不可用。[6] || The old MAE of 6.60 comes from forecasting four exams at once and cannot be ranked directly against one-step errors with refitting. Here the three original candidates and the later bounded revision share one protocol: before each exam 17–24, refit using earlier records and predict the next exam. Its specified difficulty is allowed; its actual score and cohort mean are not. [6]

下表为统一一步协议的回顾性结果。17—20与21—24两列报告分段MAE，合计列为八次绝对误差的平均。均值基线使用最近三次记录，其余三种回归使用预测时点之前的全部记录。 || The table reports retrospective results under the matched one-step protocol. The 17–20 and 21–24 columns give block MAE; the total averages all eight absolute errors. The mean baseline uses the last three records, while the three regressions use all records preceding each forecast.

**本轮个人成绩 MAE／分：所有列均为逐次重估的一步预测 || Current Score MAE / Points: Refit Before Every One-Step Forecast**

| 模型 || Model | 17–20 | 21–24 | 合计8次 || All 8 |
| --- | --- | --- | --- |
| 近期均值 || Recent Mean | 12.79 | 11.75 | 12.27 |
| 时间—难度线性 || Time–Difficulty Linear | 3.15 | 4.89 | 4.02 |
| 难度加二次项 || With Quadratic Difficulty | 7.61 | 4.44 | 6.02 |
| 有界均值 || Bounded Mean | 4.50 | 4.92 | 4.71 |

有界模型满足输出范围约束，八次MAE为4.71分，高于线性的4.02分。二次模型在后一段误差较小，但八次总体误差较大。 || The bounded model satisfies the output constraint and has an eight-exam MAE of 4.71 points, compared with 4.02 for the linear model. The quadratic model has lower error in the later block but higher error over all eight exams.

**本轮分差 MAE／分：有界双输出为两条均值预测相减 || Current Margin MAE / Points: Bounded Pair Subtracts Two Mean Predictions**

| 模型 || Model | 17–20 | 21–24 | 合计8次 || All 8 |
| --- | --- | --- | --- |
| 近期分差均值 || Recent Mean Margin | 10.13 | 7.00 | 8.56 |
| 直接线性分差 || Direct Linear Margin | 5.87 | 5.30 | 5.59 |
| 直接二次分差 || Direct Quadratic Margin | 10.65 | 5.43 | 8.04 |
| 有界双输出 || Bounded Pair | 8.20 | 4.77 | 6.49 |

有界双输出在后一段较好，但合计仍不如直接线性分差；不能只挑有利的一列。它共估计两组三参数，而直接分差只估计一组三参数，复杂度并不相同。原方案选择线性依据的是旧表 17—20 次的表现，不是声称它在每段都最好。 || The bounded pair does better in the later block but worse overall than the direct linear margin; do not select only a favorable column. It estimates two sets of three coefficients, versus one set for the direct margin. The original linear selection relied on exams 17–20, not a claim of winning in every block.

### 检查稳定性：换合理窗口，不挑着删除坏结果 || Check Stability: Vary Reasonable Windows, Not Unfavorable Outcomes

固定第 25 次、难度 0.2，分别用最近 24、12、8 次拟合；另做 24 次逐点影响检查，每次仅暂不纳入一条原记录，保留真实考试编号。这些重拟合只诊断敏感性，不是留一法预测检验，也不改变原数据。[6] || For exam 25 at difficulty 0.2, refit on the last 24, 12, or 8 exams. Also run 24 single-record omission diagnostics, preserving original exam indices. These refits assess sensitivity, not leave-one-out forecast accuracy, and do not alter source data. [6]

**窗口变化下的个人成绩情景估计／分，不是误差或置信区间 || Score Scenarios by Fitting Window / Points, Not Errors or Confidence Intervals**

| 最近记录数 || Recent Exams | 线性 || Linear | 有界 || Bounded |
| --- | --- | --- |
| 24 | 132.64 | 132.58 |
| 12 | 137.36 | 135.95 |
| 8 | 136.06 | 136.07 |

逐点影响检查中，线性预测在 131.64—133.58 分之间，有界预测在 131.72—133.35 分之间；换窗口的影响在本次检查中更明显。这些范围不是未来成绩区间，也不能断言某条记录由生病或心态造成。 || Single-record omissions give 131.64–133.58 points for the linear model and 131.72–133.35 for the bounded model; changing the window has a larger effect in these checks. These are not intervals for future scores and do not identify illness or mindset as the cause of any observation.

在参数可以独立估计的线性模型中，用记录数减去估计参数数，得到名义残差自由度。这里是 24−3=21。这只是参数计数，不等于预测证据充分：同一人的重复考试并非必然独立，跨年内容又不同，每个旧评价段只有 4 次。方程可求解不保证显著性检验或真实高考迁移成立。 || For a linear model with independently estimable coefficients, the number of records minus the number of estimated coefficients gives the nominal residual degrees of freedom: here 24−3=21. This is a parameter count, not sufficient predictive evidence. Repeated exams need not be independent, content changes across years, and each old evaluation block contains only four outcomes. Solvability does not validate significance tests or entrance-exam transfer.

### 下一轮改进依赖新证据，仅靠更换函数远远不够 || The Next Round Requires New Evidence Beyond Changing Functions

- 记录真实考试日期、间隔、限时与知识覆盖；统一满分不等于试卷已等值，难题占比相同也不保证同样难。 || Record dates, gaps, time limits, and content coverage. A common score scale is not test equating, and equal hard-question shares do not ensure equal difficulty.
- 明确群体均分指同校年级还是高考比较群体；记录影响考试可比性的条件，不从考后误差直接猜测原因。 || Specify whether the cohort mean refers to the school grade or an entrance-exam comparison population. Record conditions affecting comparability rather than guess causes from forecast errors.
- 先固定候选、窗口、预测跨度和误差指标，再用以后新发生的考试检查；没有新记录，就只能继续称为回顾性研究。 || Freeze candidates, windows, forecast horizons, and metrics before evaluating newly occurring exams. Without new records, further comparisons remain retrospective.

## #scenarios 12 / Solution 6.1 · Implement and Report: Apply to the Two Scenarios :: 固定未来阶段，再比较难度情景下的模型输出 || Hold the Future Stage Fixed When Comparing Difficulty Scenarios

第一问把给定难度代入个人得分率方程，换算为分数；第二问固定目标阶段，比较分差方程在不同难度下的输出。两问均沿用前文的时间—难度模型。高考难度不由学生控制，这些比较是情景分析，不是学生选择试卷的策略。 || Question 1 substitutes the specified difficulty into the personal score-rate equation and converts it to points. Question 2 fixes the target stage and compares the margin equation across difficulties. Both use the time–difficulty models developed above. Difficulty is not controlled by the student; these are scenarios, not a strategy for selecting an exam.

### 固定难度预测：明确条件，再换回分数单位 || Fixed-Difficulty Prediction: Specify Conditions and Restore Score Units

先看时间—难度对照模型的用法。用 f̂ 表示其平均得分率预测函数，上方的帽号表示由数据估计而来，不是已知真规律。这条对照式不含能力与心态的独立输入。 || First consider the time–difficulty benchmark. Let f̂ be its mean score-rate predictor; the hat denotes estimation, not a known law. This benchmark has no separate ability or mindset inputs.

:::callout { title: "关键洞察 || Key Insight" }
$\widehat S_*=M_*\,\widehat f(t_*,d_*)$ 星号表示目标考试：t* 为所假定的未来阶段，d* 为给定难度，M* 为该次满分。若模型有其他输入，也必须明确其在预测时的来源。 || The star marks the target exam: t* is the assumed future stage, d* the specified difficulty, and M* the maximum score. Any additional inputs need a stated source available at prediction time.
:::

保留线性模型后，f̂(t*, d*) = â + b̂t* + ĉd*。原题指定难度为 0.2、满分为 150 分，所以得分预测的代入式是： || For the selected linear model, f̂(t*, d*) = â + b̂t* + ĉd*. With difficulty 0.2 and a 150-point maximum, the score calculation is:

$$
\widehat S_*=150\left(\widehat a+\widehat b\,t_*+0.2\widehat c\right)
$$

t* 不能凭空省略。若把高考视为紧接第 24 次后的下一次考试，可以约定 t* = 25，但这是按考试顺序延续趋势的假设；若间隔与以往明显不同，就需要时间距离或状态情景，不能假装序号已经描述了真实成长。 || Do not omit t*. If the entrance exam is treated as the next exam after record 24, one may set t* = 25, but this assumes trend continuity per exam index. An unusual time gap requires elapsed-time information or state scenarios; the index does not measure actual growth.

1. 说明目标考试与最后一次历史考试之间的距离；考试序号不能自动替代真实备考时长。 || State the gap between the final observed exam and the target. An exam index does not automatically represent elapsed preparation time.
2. 确认给定难度及阶段是否有历史信息支持，并在需要时设置不同状态情景。 || Check historical support for the target difficulty and stage; introduce alternative performance-state scenarios if needed.
3. 最终报告同时给出点预测、时序误差和敏感性；没有足够证据校准预测区间时，不把单个估计值或平均误差包装成确定范围。 || Report the point forecast, chronological errors, and sensitivity together. Without enough evidence to calibrate a prediction interval, do not turn a point estimate or average error into a guaranteed range.

### 区间内比较：先写目标函数，再比较候选位置 || Interval Comparison: Define the Objective Before Comparing Candidates

第二问要比较哪种难度下的预计优势较大。先把未来阶段固定，再让难度 d 在允许范围内变化。用 ĥ(t*, d) 表示在这些条件下模型给出的平均得分率差，乘满分后得到分数差 G(d)。G 就是用来比较好坏的目标函数。 || Question 2 compares expected advantage across difficulty scenarios. Fix the future stage and vary d within its allowed range. Let ĥ(t*,d) be the estimated mean rate margin under those inputs; multiplying by the maximum score gives the point margin G(d). This comparison function is the objective function.

:::callout { title: "关键洞察 || Key Insight" }
$\begin{aligned}G(d)&=M_*\,\widehat h(t_*,d),\\&\max_{d\in[0.1,\,0.3]}G(d).\end{aligned}$ G 的单位是分。固定且为正的满分只改变单位，不改变候选位置的比较次序。若另选概率目标，应改为最大化 P(r* > q | t*, d)，并另行建立波动模型。 || G is measured in points. A fixed positive maximum score changes units but not the ordering of candidates. A probability objective instead maximizes P(r* > q | t*, d) and requires a separate model of variability.
:::

式子里的 max 读作「求最大值」：只允许 d 从 0.1 到 0.3，找出让 G(d) 最大的难度。区间左端点是 0.1，右端点是 0.3；「找到最大的分差」和「找到对应的难度」是相互关联的两个量，单位不要弄混。 || Read max as find the maximum: restrict d to 0.1–0.3 and find the difficulty giving the largest G(d). The left endpoint is 0.1 and the right endpoint 0.3. The largest point margin and the difficulty where it occurs are related but different quantities with different units.

### 先从已经建立的线性模型推出比较规则 || Derive the Comparison Rule From the Linear Model

$$
G(d)=150\left(\widehat u+\widehat v\,t_*+\widehat w d\right)
$$

$$
G(d_2)-G(d_1)=150\widehat w(d_2-d_1)
$$

当 d₂ > d₁ 时，两个情景的优劣只取决于 ŵ 的符号：正值表示模型在区间内随难度增加而上升，负值表示下降，零表示相同。这个比较规则来自相减后常数项消失，不需要猜一个「适中难度」。用本题数据求出 ŵ 后，就能确定该模型下应比较哪一侧的端点。 || For d₂ > d₁, the sign of ŵ determines the ordering: positive means increasing, negative decreasing, zero tied. Constant terms cancel, so there is no need to guess a moderate difficulty. Estimating ŵ from the records determines which endpoint the model favors.

进阶推导 || Advanced Derivation

二次曲线怎样在区间内求最大值？ || How Do We Maximize a Quadratic on an Interval?

用配方找顶点，再与允许区间的端点比较。 || Complete the square, then compare the vertex with permitted endpoints.

阅读详情 → || Read More →

### 二次模型的区间最大值 || Interval Maximum of a Quadratic Model

本题入选的是线性模型，只看斜率就能比较；下面为已经熟悉配方的读者保留二次函数情形，不是理解本题答案的前提。 || The selected model here is linear, so its slope is enough for comparison. This extension is for readers familiar with completing the square; it is not needed for the answer to this case.

若残差和留出检验共同支持难度的非线性关系，可以试用 ĥ(t, d) = û + v̂t + ŵd + k̂d²。固定 t* 后记 K = û + v̂t*，当 k̂ ≠ 0 时，对难度部分配方： || If residuals and held-out tests support curvature, consider ĥ(t, d) = û + v̂t + ŵd + k̂d². At fixed t*, set K = û + v̂t*. For nonzero k̂, complete the square in d:

$$
\begin{aligned}K+\widehat w d+\widehat k d^2&=\widehat k\left(d+\frac{\widehat w}{2\widehat k}\right)^2\\&\quad+K-\frac{\widehat w^2}{4\widehat k}.\end{aligned}
$$

顶点位置因此是 dᵥ = −ŵ/(2k̂)。k̂ < 0 时，顶点是无区间限制时的最大值位置；k̂ > 0 时，它反而是最小值位置。限制在题设区间后，只把区间内的顶点和两个端点列为候选，再比较目标值；k̂ = 0 则退回线性情形。不能为了得到一个区间内部的答案而强加二次项。 || The vertex is therefore dᵥ = −ŵ/(2k̂). It is an unconstrained maximum when k̂ < 0 and a minimum when k̂ > 0. On the stated interval, compare the endpoints and any interior vertex; k̂ = 0 returns to the linear case. Do not impose curvature merely to obtain an interior answer.

在数据范围之外继续套用公式，叫外推。它能算出数，不代表有同样充分的证据：比如没有参加过难度 0.10 的考试，却把从更难试卷学到的关系延长过去。这正是本题第二问需要特别说明的限制。 || Applying a formula beyond the observed data range is extrapolation. A number can be computed without equally strong evidence—for example, extending a relationship learned from harder papers down to difficulty 0.10 when no such exam was observed. That limitation matters for the second question.

端点成为候选最优，只说明所选模型在给定区间内如此变化；不说明区间外继续改善。超出历史难度或目标阶段支持范围的判断属于外推。若曲线很平或换模型就换位置，应报告一组近似相当的情景和不确定性，避免制造虚假的精确难度。 || An endpoint optimum only describes the selected model within the specified interval; it does not imply improvement beyond it. Predictions outside supported difficulty or stage ranges are extrapolations. A flat curve or unstable location calls for reporting comparable scenarios and uncertainty, avoiding an artificially precise difficulty.

## #results 13 / Solution 6.2 · Implement and Report: Answers and Conditions :: 给定条件下的成绩估计与分差最优值 || Conditional Score Estimates and Maximum Expected Margins

以下假定目标考试紧接第24次、满分150且输入口径可比。线性模型的成绩点估计为132.64分，有界模型为132.58分；第二问比较条件期望分差。本文报告点估计与历史误差，预测区间的校准留待后续数据评价。[4][6] || Assume the target follows exam 24, has a maximum of 150 points and uses comparable inputs. The score point estimates are 132.64 for the linear model and 132.58 for the bounded model. Question 2 compares conditional expected margins. This study reports point estimates and historical errors; prediction-interval calibration is reserved for subsequent data evaluation. [4][6]

### 保留线性形式后，重估用于两问的系数 || Refit the Selected Linear Forms for the Two Questions

采用原协议选出的线性形式，以全部24次记录重估用于未来情景的系数。检验误差仍按原训练截止点报告，最终参数用于第25次的条件计算。 || Refit the linear form selected under the original protocol on all 24 records for future scenarios. Evaluation errors retain their original training cutoffs; the final coefficients are used for conditional calculations at exam 25.

计算复核 || Calculation Audit

把实际数值代入系数公式 || Substitute the Actual Values Into the Coefficient Formulas

核对均值、中间求和量和系数计算。 || Check the means, intermediate sums, and coefficient calculation.

阅读详情 → || Read More →

### 系数公式的数值复核 || Numerical Audit of the Coefficient Formulas

最终重估时，两个模型使用相同的 t、d 输入，所以共享 t̄ = 12.5、d̄ = 0.233333、P = 1150、Q = 0.85、R = 0.078933、Δ = 90.050833。以下展示值经过舍入，实际运算保留完整精度。 || The final models share the same t and d inputs: t̄ = 12.5, d̄ = 0.233333, P = 1150, Q = 0.85, R = 0.078933, and Δ = 90.050833. Displayed quantities are rounded; calculations retain full precision.

| 求和量 || Quantity | 输出 y：个人得分率 || Outcome y: Score Rate | 输出 r：相对得分率差 || Outcome r: Rate Margin |
| --- | --- | --- |
| 输出均值 || Outcome Mean | 0.803194 | 0.085139 |
| U | 2.615000 | −3.735000 |
| V | −0.094922 | −0.041244 |

例如，个人得分率模型的 b̂ = (RU − QV)/Δ ≈ 0.003188139，ĉ = (PV − QU)/Δ ≈ −1.236893668，再由均值恢复截距 â ≈ 1.051951232。对 r 重复同样过程，得到两条最终方程： || For the score-rate model, b̂ = (RU − QV)/Δ ≈ 0.003188139 and ĉ = (PV − QU)/Δ ≈ −1.236893668; recovering the intercept gives â ≈ 1.051951232. Repeat for r to obtain the final equations:

为计算第25次的情景，现在用全部24条已发生记录重估系数，得到下面两条方程：第一条估计个人得分率，第二条估计相对均分差。它们仍是前面建立的线性形式，只是把未知参数换成了数据算出的数值；不能把这次全量拟合当作新的独立检验。 || For the exam-25 scenario, refit the coefficients using all 24 completed records. The first equation estimates personal score rate and the second the margin over the cohort mean. These retain the earlier linear forms, replacing unknown parameters with fitted values. This full-sample refit is not a new independent evaluation.

$$
\begin{aligned}\widehat y(t,d)&\approx1.051951232\\&\quad+0.003188139t-1.236893668d.\end{aligned}
$$

$$
\begin{aligned}\widehat r(t,d)&\approx0.235869999\\&\quad-0.002884573t-0.491459762d.\end{aligned}
$$

先读懂系数，再代入高考情景：难度相同时，考试编号增加1，第一条公式的得分率估计增加约0.003188，折合150分制约0.48分；阶段相同时，难度增加0.01，估计分数减少约1.86分。正时间系数、负难度系数描述的是这条拟合规则中的关联，不是已经证明能力进步或难度的因果作用。 || Interpret the coefficients before substituting the target scenario. At fixed difficulty, one additional exam index raises the first model's estimated rate by about 0.003188, or 0.48 points on a 150-point scale. At fixed stage, a 0.01 difficulty increase lowers the estimate by about 1.86 points. These signs describe fitted associations, not proven ability growth or causal effects of difficulty.

两条时间斜率符号不同，表示模型允许个人得分率提高、相对优势却缩小。截距约1.052对应 t=0、d=0，不是某次真实考试，也不能解释成「基础实力超过满分」。后面的代入使用未舍入系数，避免把展示近似误当精确计算。 || Opposite time-slope signs allow the student's rate to rise while the relative margin falls. The intercept of about 1.052 corresponds to t=0 and d=0, not an observed exam or ability above full marks. The calculations below use unrounded coefficients rather than treating displayed approximations as exact.

返回第三步：查看前20次的候选形式 || Return to Step 3: Inspect Candidates Fitted on Exams 1–20

### 第一问：给定难度下的时间—难度模型预测 || Question 1: Time–Difficulty Prediction at the Given Difficulty

使用前文已建立并检验的个人得分率方程。把目标考试视为第 24 次之后紧接的一次，取 t*=25；题设给定 d*=0.20，满分 M*=150。先代入求得分率，再换回分数：[4] || Use the personal score-rate equation developed and evaluated above. Treat the target as the exam immediately after record 24, so t*=25. The specified difficulty is d*=0.20 and the maximum M*=150. Calculate the rate first, then convert it to points: [4]

$$
\begin{aligned}\widehat y(25,0.20)&\approx1.051951232+0.003188139\times25\\&\quad-1.236893668\times0.20\\&\approx0.884276.\end{aligned}
$$

:::callout { title: "关键洞察 || Key Insight" }
$\widehat S_*=150\widehat y(25,0.20)\approx132.64$ 第一问的条件答案：在考试阶段延续、试卷口径可比且难度为 0.20 的条件下，时间—难度模型给出约 132.64 分，按整数表述约为 133 分。显示系数经过舍入，计算使用完整精度。 || Conditional answer to Question 1: with stage continuity, comparable exam definitions, and difficulty 0.20, the time–difficulty model gives approximately 132.64 points, or about 133 as an integer. Displayed coefficients are rounded; the calculation uses full precision.
:::

这是基于考试顺序与难度的条件预测，不是确定成绩，也没有直接分离真实能力和心理状态。原题若要求分别识别这两种因素，现有记录仍不充分；不能把时间系数称为能力、把误差称为心态。 || This is a conditional prediction from exam order and difficulty, not a guaranteed score or a direct separation of ability and psychological state. If the original question requires identifying those factors separately, the available records remain insufficient. The time coefficient is not ability, and error is not mindset.

同条件下，有界模型的点估计为132.58分。线性模型的批量检验MAE为6.60分，统一一步回顾检验MAE为4.02分，分别对应前20次拟合后一次预测四场、以及第17—24次逐次重估预测。[4][6] || Under the same conditions, the bounded model gives a point estimate of 132.58. The linear model has MAE 6.60 for the four-exam batch forecast fitted through exam 20, and MAE 4.02 for sequentially refitted one-step forecasts over exams 17–24. [4][6]

拓展阅读 || Further Reading

如何进一步纳入能力与心态？ || How Could Ability and Mindset Be Included?

比较新增测量与历史记录建模两种路径，以及各自的验证要求。 || Compare new measurements with historical-record modeling and their validation requirements.

阅读详情 → || Read More →

### 将能力与心态纳入模型的方法与条件 || Methods and Conditions for Including Ability and Mindset

纳入一个因素，首先要说明它怎样被观察、何时可以取得，不能只在方程中增加一个符号名称。两种可行的研究路径整理自既有方法论，不代表已取得这些测量或验证了新的因果关系。 || Including a factor first requires specifying how it is observed and when it becomes available; adding a symbol name to an equation is not enough. Two research approaches are outlined from existing methodology, without claiming that new measurements or causal validation have been obtained.

### 方法一：补充独立测量，再建立多因素预测模型 || Approach 1: Add Independent Measurements and Fit a Multivariable Model

能力可由知识范围一致的分题成绩或独立能力测试提供指标；心理状态可在每次考试前按固定时间与方法记录自信、紧张等。用这些考前可得指标与试卷难度共同预测成绩，再与不加这些指标的模型作同口径比较。测量本身也有误差；预测相关性不等于已证明心理因果。 || Comparable item-level scores or independent ability tests can supply ability indicators; confidence and anxiety can be recorded consistently before each exam. Combine these pre-exam indicators with difficulty, then compare with a model omitting them under the same protocol. Measurements have error, and predictive association does not establish psychological causation.

### 方法二：只有历史记录时，提出可检验的代理假设 || Approach 2: Test Proxy Hypotheses When Only Historical Records Exist

代理指标是用可观察的记录间接表示难以直接测量的概念。例如，用近期难度校正后的表现表示能力线索，用上次相对表现的变化构造反馈信号。这需要额外假设，不能把信号直接称为真实心态。应比较有无该输入的预测，并在新记录上确认其稳定性。 || A proxy uses observable records to represent a concept that is difficult to measure directly. Difficulty-adjusted recent performance may indicate ability, and changes in prior relative performance may supply a feedback signal. This requires additional assumptions; the signal is not measured mindset. Compare forecasts with and without the input and assess stability on new records.

本文已有的代理假设、分项计算及不一致的检验结果集中在 || The existing proxy assumptions, component calculations, and mixed evaluation results are collected in[篇末代理模型拓展 || the end-of-article proxy-model extension](#ability-mindset)。它们保留为选读研究，不替代第一问的主线条件答案。[5][6] || . They remain optional research and do not replace the main conditional answer to Question 1. [5][6]

### 共同要求：预测前可得，估计与检验分开 || Shared Requirements: Available Before Prediction, Evaluated Separately

不使用目标考试的真实成绩或考后状态作为考前输入。先固定变量定义、时间窗口、预测跨度和评价指标，再用新考试检查；若要估计心理因素的因果效应，还需要能排除其他解释的研究设计，不能只依靠一个拟合系数。 || Do not use the target exam's observed score or post-exam state as a pre-exam predictor. Fix variable definitions, windows, horizons, and metrics before testing on new exams. Estimating a psychological causal effect additionally requires a design that can rule out alternative explanations, not just a fitted coefficient.

### 第二问：按这条公式，最小难度对应最大的预计分差 || Question 2: This Formula Gives the Largest Expected Margin at the Lowest Difficulty

使用前面的时间—难度分差方程，固定 t*=25，再将相对得分率差乘以满分150，得到分数差： || Use the time–difficulty margin equation above, fix t*=25, and multiply the rate margin by the 150-point maximum to obtain the point margin:

$$
\begin{aligned}G(d)&=150\widehat r(25,d)\\&\approx24.563350-73.718964d.\end{aligned}
$$

难度 d 前的系数 −73.718964 是负数：d 增大，G 就减小。因此在允许的 0.1 到 0.3 之间，最小的 d 对应最大的 G；这就是「递减函数在左端点取最大值」的具体含义。代入 0.1： || The coefficient of d, −73.718964, is negative: increasing d lowers G. Within the allowed range 0.1–0.3, the smallest d therefore gives the largest G. This is what it means for a decreasing function to attain its maximum at the left endpoint. Substitute 0.1:

:::callout { title: "关键洞察 || Key Insight" }
$d^{\star}=0.10,\qquad G(0.10)\approx17.19$ 答案：按「预期领先均分最多」来解第二问，这条线性公式在难度 0.10 处给出最大值，预计领先约 17.19 分。但「按公式算出最大」不等于「现实中已证实最好」；这里用了外推，也没有算出某个获胜概率。 || Answer: if Question 2 means the largest expected lead, this linear formula gives its maximum at difficulty 0.10, about 17.19 points above the mean. A maximum of the formula is not a confirmed best real-world difficulty: it requires extrapolation and supplies no winning probability.
:::

:::callout { title: "📊 图 5｜拟合模型给出的优势曲线及其外推区域 || Figure 5 | Fitted Expected Margin and Its Extrapolation Region" }
曲线来自全部 24 条记录重估后的优势模型，点仅标示五个计算情景，不是五次新观测。底色只标出没有同难度记录的部分，并不表示误差可能有多大。来源：本文计算记录。[4] || The curve uses the margin model refitted on all 24 records. Points mark five calculated scenarios, not new observations. Shading marks difficulty without historical observations; it does not show the possible size of prediction errors. Source: calculation record. [4]
:::

历史难度范围为[0.15,0.40]，因此0.10属于外推。该难度下，个人成绩线性模型给出151.19分，超过150分制上界；这一情景不满足成绩预测的可行性约束。 || Observed difficulties range from 0.15 to 0.40, so 0.10 requires extrapolation. At that difficulty, the linear score model gives 151.19 points, above the 150-point maximum. This scenario violates the score-feasibility constraint.

若额外要求难度不超出历史观测范围，比较区间就缩为 [0.15, 0.30]，同一模型的最大值出现在 0.15，预期分差约 13.51 分。这是增加数据支持约束后的另一种答案，并非把原题的下界偷偷改掉。若坚持将「最大可能性」解释为概率最大，还必须补充事件门槛与误差分布，以上期望分差答案不能替代概率答案。 || If we additionally restrict difficulty to historical support, the comparison interval becomes [0.15, 0.30]. The same model is largest at 0.15, with an expected margin of about 13.51 points. This is a different answer under an added support constraint, not a silent change to the original interval. A literal probability objective would also require an event threshold and error distribution; expected margin cannot substitute for it.

### 有界修正后出现了网格内点，但仍不能宣布找到了最佳难度 || A Bounded Model Has an Interior Grid Maximum, Not a Confirmed Best Difficulty

将本轮有界个人与群体均值模型都用全部 24 条记录重估，固定 t=25，在题设区间按 0.01 间隔比较 21 个预先规定的难度点。下表抽取代表点；这不是连续区间精确求极值，也没有加入新观测。[6] || Refit both bounded means on all 24 records, fix t=25, and compare a prespecified grid of 21 difficulties spaced by 0.01 over the stated interval. Representative points appear below. This is not an exact continuous optimization or new observational evidence. [6]

**有界双输出的情景值／分；低于0.15仍是外推 || Bounded-Pair Scenarios / Points; Below 0.15 Is Still Extrapolation**

| 难度 || Difficulty | 个人 || Student | 均分 || Cohort Mean | 分差 || Margin |
| --- | --- | --- | --- |
| 0.10 | 141.26 | 129.58 | 11.68 |
| 0.12 | 139.94 | 128.22 | 11.72 |
| 0.15 | 137.60 | 126.04 | 11.56 |
| 0.20 | 132.58 | 122.01 | 10.57 |
| 0.25 | 125.89 | 117.47 | 8.41 |
| 0.30 | 117.26 | 112.43 | 4.83 |

完整网格上分差最高的位置是 0.12，但只比 0.10 高约 0.04 分、比 0.15 高约 0.16 分，而且 0.12 仍低于历史最低难度。若只比较历史支持与题设的交集，网格最高位置是 0.15。输出不越界，只解决了数值可行性，并没有补出低难度区缺失的数据。 || The full grid peaks at 0.12, but its margin is only about 0.04 points above 0.10 and 0.16 above 0.15; it remains below the lowest observed difficulty. Restricting the grid to the intersection of historical support and the stated interval gives 0.15. Bounded outputs fix numerical feasibility, not the missing evidence at low difficulty.

逐点影响检查会让最高网格位置在 0.10—0.14 之间变动；改用最近 24、12、8 次记录时，位置依次为 0.12、0.14、0.16。原线性公式的 0.10 与新候选的 0.12 都依赖模型和资料选择，不能把新内点包装成已发现的「甜蜜点」。 || Single-record omission diagnostics move the best grid location between 0.10 and 0.14. Using the last 24, 12, or 8 records gives 0.12, 0.14, and 0.16 respectively. Both the original linear value of 0.10 and the new grid value of 0.12 depend on the model and sample; an interior point is not a discovered sweet spot.

题中 d 是难题分值占比，d=0 也不等于全卷送分或人人满分；本题并未要求比较 0。第二问若指概率最大，还需先定义超过谁、超过多少，并估计波动，不能用均值曲线代替概率。到这里可以报告条件性情景和限制，但不能给出经证实的真实最优难度。 || Here d is the share of marks assigned to hard questions; d=0 does not imply everyone scores full marks, and zero is outside the requested comparison. If Question 2 seeks a probability maximum, define the event and threshold and model variability; a mean curve is not a probability. We can report conditional scenarios and limits, not a verified real-world optimal difficulty.

### 换一组合理的数据范围，答案会变化多少 || How Sensitive Are the Answers to the Fitting Sample?

下表针对时间—难度模型：固定 t*=25 与难度 0.2，只改变估计资料，用来检查结论对资料范围的敏感性，不据此反选模型或删除原始记录。 || This table assesses the time–difficulty model at fixed t*=25 and difficulty 0.2 while changing the fitting sample. It checks sensitivity to the sample, without reselecting a model or deleting source records.

| 估计资料 || Fitting Sample | 成绩预测／分 || Score / Points | 优势的难度斜率 ŵ || Margin Difficulty Slope ŵ |
| --- | --- | --- |
| 全部 24 次（对照模型） || All 24 (Benchmark) | 132.64 | −0.491460 |
| 仅高三 8 次 || Final Year Only (8) | 136.06 | −0.473110 |
| 暂不纳入第 19 次（影响检查） || Omit Exam 19 (Influence Check) | 132.75 | −0.522638 |

成绩点估计对年级范围有几分的敏感性；这三种取样下优势的难度斜率都为负，但这并不能补上 0.10 附近缺失的数据。建模的完整结论应同时包括「算出了什么」与「证据支持到哪里」，而不只给出一个精确小数。 || The score estimate shifts by several points with the school-year range. The margin difficulty slope is negative in these three samples, but that does not supply missing observations near 0.10. A complete conclusion states both the calculation and the limits of its evidence.

计算复核 || Calculation Audit

查看计算脚本与逐次误差 || Inspect the Scripts and Per-Exam Errors

追溯模型结果的数据来源和复算方法。 || Trace the model results to their data and reproduction methods.

阅读详情 → || Read More →

### 计算资料与复核方法 || Calculation Records and Reproduction

计算记录分为原模型比较、代理扩展、统一协议有界回顾和前20次参数快照四部分。 || Calculation records comprise the original model comparison, proxy extension, matched bounded-model review and first-20 parameter snapshot.

- [原时间—难度对照模型结果（JSON） || Original Time–Difficulty Benchmark Results (JSON)](model-results.json) · [原计算脚本 || Original Calculation Script](model-calculation.py)
- [能力—反馈模型分项结果与检验（JSON） || Ability–Feedback Components and Checks (JSON)](ability-mindset-results.json) · [新增计算脚本 || Extension Calculation Script](ability-mindset-calculation.py)

[统一协议与有界回顾结果 || Matched-Protocol and Bounded Review Results](robustness-review-results.json) · [回顾计算脚本 || Review Calculation Script](robustness-review.py)

[总览前20次参数与候选快照 || First-20 Parameters and Candidate Snapshot](model-walkthrough-results.json) · [快照复核脚本 || Snapshot Reproduction Script](model-walkthrough-calculation.py)

脚本读取三张原始数据表。线性、二次及代理模型的最小二乘系数采用浮点和精确有理数消元交叉核对；有界模型采用数值优化，并以梯度判据检查收敛。 || The scripts read the three source tables. Linear, quadratic and proxy least-squares coefficients are cross-checked by floating-point and exact rational elimination. The bounded model uses numerical optimization with a gradient-based convergence criterion.

## #checklist 14 / Extension · Understanding and Application :: 拓展与能力检测 || Extension and Skills Check

本章集中放置迁移情境、能力与心态代理模型的选读构造，以及能力自测。主线读完后，可按需要展开代理模型，或检查自己能否选择合适的信息、识别证据的边界。 || This chapter collects a transfer scenario, the optional ability–mindset proxy construction, and a skills check. After the main solution, explore the proxy model as needed or test your ability to choose suitable information and recognize the limits of evidence.

拓展阅读 || Further Reading

把建模方法用于每周数学练习 || Apply the Method to Weekly Math Practice

判断哪些变量可以沿用，哪些条件必须重新检查。 || Decide which variables carry over and which conditions need reassessment.

阅读详情 → || Read More →

### 迁移情境：每周一份同满分的数学练习 || Transfer Scenario: Weekly Math Practice With a Common Maximum

假设你每周完成一份满分相同的数学练习，想预测下一次个人成绩。可保留按先后排列的 t 和个人得分率 y；若每份练习都按同一标准标出难题分值，也可记录难度 d。同满分时，原始分数本来就在同一计分尺度上；保留得分率主要是便于沿用本文的表达，不代表练习已经同样难。 || Suppose you complete one math practice paper each week, all with the same maximum, and want to predict your next score. Keep the chronological index t and personal score rate y; record difficulty d if hard-question marks are identified consistently. With a common maximum, raw scores already share a scoring scale. Keeping score rates reuses the article's notation; it does not make the papers equally difficult.

必须重查练习是否覆盖相近知识、是否限时独立完成，以及中间有没有长时间停练或重复做原题。若一份是开卷单元练习，另一份是闭卷综合练习，即使满分一样，也不宜不加区分地混在一起。下一份的难度若事先未知，只能先按明确的难度情境讨论，不能把做完后的信息当成预测前已知。 || Recheck topic coverage, time limits, independent completion, long gaps, and repeated questions. An open-book unit exercise and a closed-book comprehensive paper should not be pooled without distinction merely because their maxima match. If the next paper's difficulty is unknown in advance, discuss explicit difficulty scenarios rather than treat information obtained afterward as a known forecast input.

只有自己做题、没有可比群体的均分时，就不能照原定义计算相对优势 r 和反馈 Fₜ；不要把缺失的均分填成零。近期得分可以提供能力代理的线索，但练习间隔改变后，近期窗口是否合适也要重查。可以迁移变量的含义和检查思路，不能搬用本文的系数、误差大小或最优难度；这些都需要新记录支持。 || Without a comparable group's mean, personal practice alone cannot supply relative margin r or feedback Fₜ as defined here; do not replace a missing mean with zero. Recent scores can inform an ability proxy, but a different practice schedule also calls for reconsidering its window. Transfer the meanings of variables and the evaluation ideas, not this article's coefficients, error size, or optimal difficulty: those require evidence from the new records.

拓展阅读 || Further Reading

能力与心态代理：构造、推导与检验 || Ability and Mindset Proxies: Construction, Derivation, and Evaluation

完整阅读代理假设及其有限、并不一致的预测证据。 || Explore the proxy assumptions and their limited, mixed predictive evidence.

阅读详情 → || Read More →

### 能力与心态代理模型拓展 || Ability and Mindset Proxy Model Extension

仅有考试顺序和难度的公式，是一个对照模型，不是对第一问全部要求的完整回应。考试顺序不等于数学能力；没有解释的误差也不等于心态。要综合两者，必须说明它们在模型中各代表什么、由什么信息得到，以及哪些部分仍无法从题目数据确定。 || A formula using exam order and difficulty is a comparison model, not a complete response to Question 1. Exam order is not mathematical ability, and unexplained error is not mindset. A combined model must state what each component means, how it is constructed, and what remains unidentified by the data.

### 先区分：想研究的量，与表格真正记录的量 || Distinguish the Intended Concepts From the Recorded Quantities

| 想研究什么 || Concept | 模型表示方式 || Representation | 不能声称什么 || Limit |
| --- | --- | --- |
| 数学能力：相近知识范围、给定难度下的较稳定表现 || Ability: relatively stable performance at a reference difficulty and comparable content | 用前三次成绩校正难度后求平均，得到近期能力代理 Kₜ || Average the last three difficulty-adjusted score rates to form proxy Kₜ | 它仍混有过去的状态和试卷差异，不是纯能力测量 || It still mixes past state and paper differences; it is not pure ability |
| 心态：信心、紧张等对发挥的可能影响 || Mindset: possible effects of confidence and anxiety on performance | 先算上次相对表现的反馈 Fₜ，再假设其影响为 Hₜ=λFₜ || Compute prior relative-performance feedback Fₜ and hypothesize a response Hₜ=λFₜ | Fₜ 不是心态分数；λ 也不是已证实的心理因果效应 || Fₜ is not a mindset score, and λ is not an established psychological causal effect |
| 当前试卷难度 || Current difficulty | 保留题中难题占比 dₜ，与参照难度 0.2 比较 || Retain hard-question share dₜ and compare it with reference 0.2 | 不能凭一个系数分开题目变难的直接影响与紧张带来的间接影响 || One coefficient cannot separate a direct difficulty effect from difficulty-induced anxiety |

这种用现有记录间接表示目标概念的量，叫代理指标。它允许我们提出并检验一个模型，但不能代替直接测量。只看到总成绩，就像只知道两个数之和是 130：125+5 和 135−5 都能得到它。若能力与心态都逐次自由变化，单凭总分不能唯一分开两者。 || A proxy indirectly represents a concept using available records. It lets us propose and test a model, but does not replace direct measurement. A total of 130 could be 125+5 or 135−5. If ability and mindset vary freely each exam, the total alone cannot uniquely separate them.

### 能力代理：先把过去三次表现放到同一参照难度 || Ability Proxy: Put the Last Three Performances at a Reference Difficulty

记预测前最近三次的平均得分率为 Bₜ，平均难度为 d̄ₜ。横线表示平均，下标 t 表示「为预测第 t 次而计算」。取三次是为了在「近期」与「别让一次波动决定全部」之间作简单折中，不是已经验证的最佳窗口。 || Let Bₜ be the mean score rate of the last three exams and d̄ₜ their mean difficulty. The bar means average, and t labels the target exam for which it is computed. Three exams are a simple compromise between recency and avoiding dependence on one result, not a proven optimal window.

$$
\begin{aligned}B_t&=\frac{y_{t-1}+y_{t-2}+y_{t-3}}{3},\\\bar d_t&=\frac{d_{t-1}+d_{t-2}+d_{t-3}}{3}.\end{aligned}
$$

直接平均仍会受旧试卷难度影响。因此设参照难度 d₀=0.2，用待求系数 γ 表示难度每增加一单位时得分率的平均变化。过去某次比参照更难，就先减去模型归于难度差的那一部分，再平均： || The raw mean still reflects earlier paper difficulty. Set reference d₀=0.2 and let γ be the coefficient for mean score-rate change per difficulty unit. Subtract the modeled difficulty contribution from each earlier result before averaging:

$$
\begin{aligned}K_t(\gamma)&=\frac{1}{3}\sum_{j=1}^{3}\left[y_{t-j}-\gamma(d_{t-j}-0.2)\right]\\&=B_t-\gamma(\bar d_t-0.2).\end{aligned}
$$

Kₜ 表示模型估计的「按参照难度折算的近期表现」，作为能力的代理。若 γ 为负，过去平均试卷比 0.2 更难，折算后的 Kₜ 就会高于原平均 Bₜ。它比单用考试编号更贴近学生自己的表现，但仍不能完全排除过去心态和知识范围的影响。 || Kₜ is modeled recent performance adjusted to the reference difficulty, used as an ability proxy. If γ is negative and recent papers were harder than 0.2, Kₜ exceeds the raw mean Bₜ. It uses the student's performance more directly than an exam index, but cannot eliminate earlier mindset or curriculum effects.

### 心态假设：上次比自己之前表现得更好，可能产生反馈 || Mindset Hypothesis: A Better-Than-Usual Result May Carry Forward

一次考得高于均分，不一定会让学生更有信心：如果他过去一直领先更多，这次反而可能失望。因此用「上一次相对均分的优势」减去「再之前三次优势的平均」，构造反馈信号 Fₜ。正值表示上次比自己此前的相对表现更好，负值表示更差。 || Being above the mean need not boost confidence if the student usually leads by more. Define feedback Fₜ as the last margin over the mean minus the average margin of the three exams before that. Positive values mean better relative performance than the student's recent baseline; negative values mean worse.

$$
F_t=r_{t-1}-\frac{r_{t-2}+r_{t-3}+r_{t-4}}{3}
$$

现在再提出心理解释的假设：这份反馈可能影响下一次发挥，先用 Hₜ=λFₜ 表示它在得分率上的响应。λ 由历史记录估计，不事先规定一定为正。Fₜ 本身不是心理量表；即使估出正 λ，也只能说这个反馈信号与后续表现有关，不能排除学习状态持续、偶然波动等其他解释。 || Now hypothesize that this feedback affects the next performance, initially through a score-rate response Hₜ=λFₜ. Estimate λ from history without forcing a positive sign. Fₜ is not a psychological scale, and a positive λ only describes a predictive association; persistent preparation or random fluctuations remain alternative explanations.

在线性参数模型中，系数可辨识性取决于完整设计矩阵的列秩。若两项使用同一难度差作为输入，则只能识别系数之和： || In a linear-in-parameters model, coefficient identifiability depends on the column rank of the complete design matrix. When two terms share the same difficulty difference as input, only the sum of their coefficients is identifiable:

$$
\begin{aligned}&\gamma(d_t-\bar d_t)+\kappa(d_t-\bar d_t)\\&=(\gamma+\kappa)(d_t-\bar d_t)\end{aligned}
$$

本文能力代理本身也依赖难度系数。检验新增项的可辨识性，需要先展开完整方程并保留这条依赖。统计参数可估性与心理因果识别分别评价。 || The ability proxy itself depends on the difficulty coefficient. Identifiability of an added term must be assessed after expanding the complete equation with this dependence retained. Statistical estimability and psychological causal identification are assessed separately.

### 组合成一个可计算的综合模型，避免只停留在名词替换 || Combine the Components Into a Computable Model

在「近期能力代理可延续、反馈影响可延续、各项可相加」的假设下，个人得分率由能力代理、当前难度调整、反馈响应和剩余波动组成。另加常数 α，校正从近期平均到下一次表现的整体偏差。α、γ、λ 是三个待求系数，分别读作 alpha、gamma、lambda；它们与前面 a、b、c 一样只是参数的名字，并非已经知道的心理量： || Assume the ability proxy and feedback response persist and combine additively. Score rate contains the ability proxy, current-difficulty adjustment, feedback response, and remaining variation, plus a constant α for the overall next-exam offset. α, γ, λ—alpha, gamma, lambda—are names for three coefficients to estimate, just like a, b, c, not known psychological measurements:

$$
\begin{aligned}y_t&=\alpha+K_t(\gamma)+\gamma(d_t-0.2)\\&\quad+H_t+\varepsilon_t,\\H_t&=\lambda F_t.\end{aligned}
$$

把 Kₜ 的定义代入，参照难度项相消，得到更方便求系数的形式： || Substitute the definition of Kₜ. Reference-difficulty terms cancel, giving a convenient estimation equation:

$$
y_t-B_t=\alpha+\gamma(d_t-\bar d_t)+\lambda F_t+\varepsilon_t
$$

这仍然是「一个输出、两个输入、三个系数」：输出改为 yₜ−Bₜ，输入改为当前难度与近期平均难度的差，以及反馈 Fₜ。用同样的最小二乘方法可同时求 α、γ、λ，无须先猜 γ 再反复循环。因为需要前四次记录，第 5 次才有完整输入；24 次记录提供 20 条可拟合的目标记录。 || This still has one outcome, two inputs, and three coefficients: outcome yₜ−Bₜ, inputs dₜ−d̄ₜ and Fₜ. The same least-squares method jointly estimates α, γ, λ, without guessing γ in a separate loop. Four prior records are required, so complete inputs start at exam 5, giving 20 fitting targets from 24 exams.

$$
\begin{aligned}e_t&=y_t-B_t-\alpha-\gamma(d_t-\bar d_t)-\lambda F_t,\\&\min_{\alpha,\gamma,\lambda}\sum_{t=5}^{n}e_t^2.\end{aligned}
$$

每个训练时点的 Bₜ、d̄ₜ、Fₜ 都只能用它以前的记录构造，不能用全体 24 次的平均值代替。预测第 25 次时才可使用全部已发生记录。若最近一次考试与高考相隔很久，能力和反馈仍能延续的假设就需要重审，不能把考试编号当作真实时间长度。 || Construct Bₜ, d̄ₜ, Fₜ from records strictly before each training target, never from full-dataset averages. Only the exam-25 forecast may use all observed records. If the entrance exam is much later, persistence of ability and feedback needs reconsideration; an exam index is not elapsed time.

### 代理拓展的情景计算：分项与结果 || Proxy Extension Scenario: Components and Results

使用第 5—24 次的 20 条完整目标记录估计综合模型，得到 α≈0.005359531、γ≈−1.291547062、λ≈0.215075912。它们分别表示整体校正、难度变化的平均响应、反馈信号的平均响应。正 λ 不能直接当成「自信提高了多少分」的因果证据。[5] || Fitting the 20 complete targets at exams 5–24 gives α≈0.005359531, γ≈−1.291547062, λ≈0.215075912: overall correction, difficulty response, and feedback response. Positive λ is not causal evidence of how many points confidence adds. [5]

预测前最近三次是高三第 6、7、8 次：个人分数 125、133、141，难度 0.27、0.20、0.15。因此近期平均得分率 B₂₅≈0.886667，近期平均难度 d̄₂₅≈0.206667。 || The last three exams are final-year exams 6–8: scores 125, 133, 141 and difficulties 0.27, 0.20, 0.15. Hence B₂₅≈0.886667 and d̄₂₅≈0.206667.

$$
\begin{aligned}B_{25}&=\frac{125+133+141}{3\times150}\approx0.886667,\\\bar d_{25}&=\frac{0.27+0.20+0.15}{3}\approx0.206667.\end{aligned}
$$

上次优势为 (141−123)/150=0.12；再之前三次的优势分别为 (118−108)/150、(125−118)/150、(133−120)/150，平均为 0.066667。因此反馈信号为： || The last margin is (141−123)/150=0.12. The three before it are (118−108)/150, (125−118)/150, and (133−120)/150, averaging 0.066667. Thus the feedback signal is:

$$
F_{25}=\frac{3}{25}-\frac{1}{15}=\frac{4}{75}\approx0.053333
$$

把这些量代回综合模型，能力代理在参照难度下为 K₂₅≈0.895277。当前难度恰好也是 0.2，当前难度调整项为零，但过去试卷的难度校正仍已进入 K₂₅。换成 150 分制，各项如下；小数均为展示舍入。 || Substitution gives K₂₅≈0.895277 at the reference difficulty. The target difficulty is also 0.2, so its current adjustment is zero, but earlier-paper difficulty has already been corrected within K₂₅. Components in 150-point units follow; displayed decimals are rounded.

| 模型项 || Model Component | 分数贡献 || Points | 怎样解释 || Interpretation |
| --- | --- | --- |
| $150K_{25}$ | 134.29 | 校正过去难度后的近期能力代理，不是直接测得的纯能力分 || Recent ability proxy after difficulty correction, not a pure measured ability score |
| $150\alpha$ | 0.80 | 整体偏差校正，不能单独叫能力增长 || Overall offset, not an independently identified ability gain |
| $150\gamma(d_*-0.2)$ | 0.00 | 当前难度等于参照难度 || Target difficulty equals the reference |
| $150H_{25}=150\lambda F_{25}$ | 1.72 | 假设通过心态延续的反馈响应；不是已测得的心理加分 || Feedback response hypothesized to persist through mindset, not a measured psychological bonus |

:::callout { title: "关键洞察 || Key Insight" }
$\begin{aligned}\widehat S_{25}&\approx134.2915+0.8039+0+1.7206\\&\approx136.82.\end{aligned}$ 代理拓展的条件情景：在近期能力代理及反馈—心态假设成立时，难度 0.2 的估计约为 137 分。这不是第一问的主线答案；求和使用未舍入值，也没有据此测得真实心态或证明预测优于基础模型。 || Conditional proxy-extension scenario: under the recent-ability and feedback–mindset assumptions, difficulty 0.2 gives about 137 points. This is not the main answer to Question 1. The sum uses unrounded values and neither measures true mindset nor establishes better accuracy than the baseline model.
:::

在同一组已拟合系数下，只把反馈项 H₂₅ 设为零，预测约为 135.10 分；保留反馈时增加约 1.72 分。这是代数上的情景差，不是「心态中性」的实测对照。若完全删去反馈项并重新拟合，其预测则约为 134.80 分；两种操作不能混为一谈。主线的 132.64 分与这些拓展情景基于不同假设，不能把差值解释为真实心理收益。 || With the same fitted coefficients, setting only H₂₅ to zero gives about 135.10 points; retaining feedback adds about 1.72. This is an algebraic scenario contrast, not an observed neutral-mindset control. Removing feedback and refitting gives about 134.80; these are different operations. The main estimate of 132.64 and these extension scenarios use different assumptions, so their differences are not measured psychological benefits.

若题意要求真实地区分「能力贡献多少、心态贡献多少」，现有总分、难度和均分仍不足以作唯一回答。更可靠的后续资料是：可比较的分题得分或能力测试、每次考前采集的紧张与自信记录、考试日期与间隔。仅补一个预测数，不能消除这些信息缺口。 || If the question requires a real separation of ability and mindset contributions, totals, difficulty, and cohort means still do not identify a unique answer. Useful additional data would include comparable item-level scores or ability tests, pre-exam anxiety and confidence records, and exam dates and intervals. Another predicted number cannot remove those information gaps.

### 补充检验：把反馈项拿掉，看看加入它是否真的有帮助 || Additional Check: Does the Feedback Term Actually Help?

要检验心态代理，不能只看带 λ 的公式能否算出分数。我们在同一批目标考试上比较两种模型：一类保留能力代理与难度调整、令 λ=0 并重新求其余系数；另一类再加入反馈 Fₜ。两者都从第 5 次开始形成训练目标，窗口都固定为三次。[5] || A feedback hypothesis is not validated just because its equation returns a number. Compare two models on the same target exams: ability proxy plus difficulty adjustment with λ=0 and other coefficients refitted, versus the same structure with feedback Fₜ. Both start training targets at exam 5 with fixed three-exam windows. [5]

**旧补充 C｜17—20 次每次重估；21—24 次冻结参数但逐场更新代理，均为一步预测 || Original C | Refit on 17–20; Freeze Coefficients on 21–24 but Update Proxies After Each Exam; One-Step Forecasts**

| 比较模型 || Model | 17—20 次滚动 MAE／分 || Rolling 17–20 MAE / Points | 21—24 次逐次 MAE／分 || Sequential 21–24 MAE / Points |
| --- | --- | --- |
| 能力代理＋难度，不加反馈 || Ability Proxy + Difficulty, No Feedback | 6.02 | 5.98 |
| 能力代理＋难度＋反馈 || Ability Proxy + Difficulty + Feedback | 5.45 | 6.57 |

检验口径要分清：17—20 次每次只用此前记录重新求系数；21—24 次固定使用截至第 20 次估出的系数，但每次考试结束后，允许用刚揭晓的成绩更新下一次的能力代理与反馈。它检验的是连续的下一次预测，不是站在第 20 次一次预测四场。因此右列不能直接与旧表四步预测的 6.60 分排名。 || For exams 17–20, refit coefficients using only earlier records each time. For 21–24, freeze coefficients estimated through exam 20, but release each completed outcome to update the next exam's proxies. This evaluates sequential one-step predictions, not four forecasts made at exam 20, so the right column is not directly comparable with the old batch score MAE of 6.60.

加入反馈后，前一段误差略小，后一段却变大。因此不能宣称「心态项提高了预测能力」，更不能宣称已经证实心理因果。本次补充发生在旧结果已经看过之后，上表只能作为回顾性模型检查，不能再把同一批数据称为全新的独立确认；真正验证仍需之后的新考试记录。 || Feedback slightly improves the earlier block and worsens the later one. It does not establish improved prediction, let alone psychological causation. This extension was proposed after the old results had been inspected, so these are retrospective checks, not fresh independent confirmation. New exams are needed for a genuine subsequent test.

### 代理模型的统一协议比较：与主线研究相同的预测方式 || Matched Proxy Comparison: The Same Forecast Protocol as the Main Review

下面改用求解 5 的统一协议：第 17—24 次每场都只用此前记录重新估计参数，预测下一场，窗口固定为三次。与上面的旧补充 C 不同，21—24 次也重新估计参数，因此误差不同；不能把不同协议的两列表混成一次比较。这仍是回顾性研究，不是新独立验证。[6] || Now apply the matched protocol from Solution 5: before each exam 17–24, refit using earlier records and predict the next exam, with three-exam windows. Unlike original supplement C above, coefficients are refitted for exams 21–24 too, giving different errors. Do not mix columns from the two protocols. This remains retrospective, not fresh independent validation. [6]

**代理拓展的成绩 MAE／分：每场重估参数的一步预测 || Proxy Extension Score MAE / Points: Refit Before Every One-Step Forecast**

| 模型 || Model | 17–20 | 21–24 | 合计8次 || All 8 |
| --- | --- | --- | --- |
| 能力代理，不加反馈 || Ability Proxy, No Feedback | 6.02 | 6.28 | 6.15 |
| 能力代理＋反馈 || Ability Proxy + Feedback | 5.45 | 6.76 | 6.10 |

加入反馈后，总误差只从 6.15 变为 6.10，后一段却从 6.28 变为 6.76；这种不稳定的小差异不足以证明反馈有用，更不是心理因果证据。能力—反馈用 20 个目标估计 3 个参数，名义残差自由度为 17，但参数计数不保证独立性或显著性推断成立。若研究心态，需要在考试前按固定方式记录自信、紧张与健康状态，不能从考后误差反推。 || Feedback changes total error only from 6.15 to 6.10 while worsening the later block from 6.28 to 6.76. This unstable small difference does not establish usefulness or psychological causation. The ability–feedback model uses 20 targets and three parameters, giving 17 nominal residual degrees of freedom, but parameter counts do not justify independence or significance inference. Mindset research needs consistent pre-exam records of confidence, anxiety, and health, not explanations inferred from errors afterward.

### 不用重算整道题，也能检查自己是否读懂 || Check Your Understanding Without Recomputing the Whole Case

先用自己的话回答下面的问题，再打开参考解释。能说明所用的假设和理由，比记住某个预测分数更重要。 || Answer the questions in your own words before opening the explanations. Understanding the assumptions and reasoning matters more than memorizing a predicted score.

1. 难度为 0.2，是否就能断定平均得分率是 0.8？ || Does difficulty 0.2 imply a mean score rate of 0.8?
2. 80/100 与 130/150 为什么要先做除法，不能直接相减？ || Why divide in 80/100 and 130/150 rather than directly subtract 80 from 130?
3. 能不能为每次考试各选一组 a、b、c，让过去的误差全部变成零？ || Should each exam get its own a, b, c so every past error becomes zero?
4. 检查中的平均绝对误差为 6.60 分，能否保证高考预测最多只差 6.60 分？ || Does an evaluation MAE of 6.60 guarantee a future error no larger than 6.60?
5. 模型算出难度 0.10 的预期分差最大，为什么还不能宣布它是现实中的确定最优值？ || Why is a modeled maximum at difficulty 0.10 not a confirmed real-world optimum?

### 代理辨析：算出的量，测到了什么？ || Proxy Check: What Was Actually Measured?

Fₜ 为正，能否直接断言学生更自信？近期得分上升，能否认定真实能力提高？各写出一个可能的其他解释，并提出一项可以补充收集的信息。 || Does positive Fₜ prove greater confidence? Do rising recent scores establish improved underlying ability? Give one alternative explanation for each and propose one additional kind of information to collect.

### 小设计题：为自己的下一次练习作准备 || Mini Design Task: Prepare for Your Next Practice

你有十次按日期排列的同满分练习记录，只有个人分数，没有群体均分。请画一个记录表的表头，注明哪些列在预测下一次前就能获得；选出本文仍可使用的输出量，并说明是否能构造原定义的 Fₜ。再划出用于最后检查的连续三次记录，给出一个不用复杂拟合的比较基线；指出一种会让你暂停合并这些记录的练习条件变化。不必计算新系数。 || You have ten dated practice records with a common maximum, personal scores only, and no group means. Sketch a table header and mark which fields are available before the next forecast; choose an applicable outcome from this article and explain whether Fₜ can be constructed as defined. Reserve three consecutive records for a final check, propose a baseline requiring no complex fitting, and name a change in practice conditions that would make you pause before pooling the records. No new coefficient calculation is needed.

参考答案 || Reference Answers

五问、代理辨析与小设计的参考解释 || Explanations for the Questions, Proxy Reasoning, and Design Task

先独立回答，再核对假设、理由与证据边界。 || Answer first, then check the assumptions, reasoning, and evidence limits.

阅读详情 → || Read More →

### 能力自测参考解释 || Skills Check: Reference Explanations

五个问题分别检查定义、尺度、规则的一致性、误差解释和外推边界。 || The questions check definitions, scale, a shared rule, interpretation of error, and extrapolation limits.

1. 不能。难度是难题分值占比，不能决定考生能拿到多少分。 || No. Difficulty is the share of marks assigned to hard questions, not the share a student will earn.
2. 两份试卷满分不同，直接相减会混入计分尺度的差异；先转成得分率才能作这种比较。 || The maxima differ. Raw subtraction mixes performance with scale; score rates align that scale.
3. 这样可能记住过去，却没有给下一次提供一条共同的规则。模型要用同一组参数处理同一适用范围内的记录，并用新记录检验。 || That can memorize history without providing a shared rule for the next exam. Use one coefficient set within the model's scope, then test it on new records.
4. 不能。它是过去四次误差大小的平均数，不是每一次的上限。 || No. It averages the magnitudes of four past errors; it does not bound every error.
5. 0.10 小于原题实际出现过的最低难度 0.15，属于外推；单独成绩模型还在这里超过满分。这些警讯说明算得出来不等于证据充分。 || 0.10 is below the smallest observed difficulty, 0.15, so it is extrapolation. The separate score model even exceeds full marks there. Computability is not the same as adequate evidence.

### 代理辨析的参考 || Reasoning About Proxies

两种断言都不成立。Fₜ 为正只表示上次相对表现好于再之前三次的平均，可能来自偶然发挥，并不直接测量信心；近期得分上升也可能只是练习更简单。可补充练习前同一量表的自信或紧张自评，以及试卷的题型、难度和完成条件。自评仍有误差，补充记录也不等于证明了心理因果关系。 || Neither claim follows. Positive Fₜ means the last relative performance exceeded the average of the three before it; random variation could explain it, and confidence was not directly measured. Rising recent scores may simply reflect easier papers. Add a consistent pre-practice confidence or anxiety rating, along with question types, difficulty, and completion conditions. Self-reports remain imperfect, and added records do not by themselves establish psychological causation.

### 小设计的一种可行回答 || One Possible Design

下面选择从第7次结束时一次预测第8—10次的批量检查，所以各候选都不能用第8、9次实测更新预测，误差对应提前1、2、3步；若要检验连续的下一次预测，应另设所有候选一致的滚动更新协议，不能混用两种结果。 || The example below chooses a batch check: predict exams 8–10 at the end of exam 7. No candidate may update from observed exams 8 or 9, and the errors correspond to horizons 1, 2 and 3. Evaluating successive next-exam forecasts instead requires a separately specified rolling update protocol shared by all candidates; do not mix the two results.

表头可列日期、满分、限时与开闭卷、知识范围、难题分值占比、个人分数。日期和计划条件可提前登记，难题占比要确认能否提前取得，个人分数只能事后填写。可预测个人得分率 y，但缺少均分时不能照原定义计算 r 或 Fₜ。选择最后三次作检查，前七次用于制定方案；例如固定用前七次个人分数的平均值预测这三次，再按同样三次的平均绝对误差比较候选模型，不能看到检查结果后又回头挑方案。若由限时闭卷改成不限时开卷，应先区分条件；同满分不能消除这种差异。 || A table could record date, maximum score, time limit and book access, topic coverage, hard-question mark share, and personal score. Date and planned conditions can be entered beforehand; check whether difficulty is available in advance, while the personal score is recorded afterward. Predict personal score rate y; without means, r and Fₜ cannot be computed as defined. Reserve the last three records and develop the plan on the first seven. For example, predict all three with the fixed mean of the first seven personal scores and compare a candidate model by MAE on those same three records, without choosing a new plan after viewing their results. A switch from timed closed-book to untimed open-book practice calls for distinguishing conditions; a common maximum does not remove that difference.

## #references 15 / Sources and Notes :: 参考来源 || References

题设、通用方法与本地数值计算分别注明来源。本文已实际拟合并执行时序检查；数值结果是给定数据、模型和协议下的估计，不是对高考表现的保证，也不是对心态机制的因果识别。 || The statement, general methods, and local calculations have separate sources. Fitting and chronological evaluation were performed. Results are estimates conditional on the data, models, and protocol—not guarantees of entrance-exam performance or causal identification of mindset.

- [1] 用户提供的题目照片 | 原题文字、三年共 24 次考试数据、计分口径、难度定义和两问均据照片转录。表格增加每年列序、统一难度的小数位数，并将「年均」标为「年级均分」，未改动数值。不披露学校及相关出处标识，不公开照片或手写内容。 || Source for the transcribed statement, 24 exams across three years, scoring scales, difficulty definition, and questions. Tables add within-year column numbers, use consistent decimal formatting, and expand the abbreviated mean label without changing values. School identifiers, the photograph, and handwriting are not reproduced.
- [2] Hyndman & Athanasopoulos · Forecasting: Principles and Practice (3rd ed.) — https://otexts.com/fpp3/regression.html | [时间序列回归 || Time Series Regression](https://otexts.com/fpp3/regression.html) · [最小二乘估计 || Least Squares Estimation](https://otexts.com/fpp3/least-squares.html) · [时间序列交叉验证 || Time Series Cross-Validation](https://otexts.com/fpp3/tscv.html)。支持回归的基本解释，以及仅用过去数据检验未来预测的原则；本文针对考试场景提出的变量选择不属于教材对本题的结论。 || . Supports the regression framework and evaluating future predictions using only past information. The exam-specific variable choices here are proposals, not conclusions supplied by the textbook.
- [3] Hyndman & Athanasopoulos · Forecasting: Principles and Practice (3rd ed.) — https://otexts.com/fpp3/prediction-intervals.html | [预测区间 || Prediction Intervals](https://otexts.com/fpp3/prediction-intervals.html)。介绍预测区间及其误差假设，用于本文的不确定性讨论。 || . Introduces prediction intervals and their error assumptions, informing the discussion of uncertainty.
- [4] 本文可复核计算记录 | [模型结果与验证记录 || Model Results and Evaluation Record](model-results.json) · [计算脚本 || Calculation Script](model-calculation.py)。记录系数、MAE、情景计算与敏感性结果。模型选择采用17—20次MAE，21—24次使用前20次估计的参数评价；研究设计为历史回算。 || . Records coefficients, MAE, scenario calculations and sensitivity results. Model selection uses MAE on exams 17–20; exams 21–24 are evaluated with parameters estimated through exam 20. The study design is retrospective forecast reconstruction.
- [5] 本文能力—反馈代理模型：补充计算 | [分项与回顾性检验结果 || Components and Retrospective Checks](ability-mindset-results.json) · [复核脚本 || Reproduction Script](ability-mindset-calculation.py)。支持能力代理、反馈信号、贡献分解及有无反馈的同口径比较。三次窗口与心理反馈解释是本文的建模假设，不是题设事实或已有心理研究的验证结论。该补充是在原留出结果已知后提出，只作回顾性检查。 || . Supports the proxy inputs, component decomposition, and matched with/without-feedback comparison. Three-exam windows and the psychological interpretation are modeling assumptions, not givens or validated psychological findings. Proposed after the original holdout results were known, the extension receives retrospective checks only.
- [6] 本轮统一协议与有界模型回顾性研究 | [完整逐次误差、网格与影响检查 || Per-Exam Errors, Grid, and Influence Checks](robustness-review-results.json) · [复核脚本 || Reproduction Script](robustness-review.py)。独立保存，不覆盖[4][5]。本轮全部结果在旧数据已知后计算，不能宣称新的独立验证或自动更换主模型。 || . Stored separately without replacing [4] or [5]. All checks use previously observed outcomes; they are not fresh independent confirmation or grounds for automatically replacing the main model.
- [7] Papke & Wooldridge · Fractional Response Models — https://www.nber.org/papers/t0147 | [Econometric Methods for Fractional Response Variables with an Application to 401(k) Plan Participation Rates](https://www.nber.org/papers/t0147)。NBER技术工作论文0147（1993），正式发表于Journal of Applied Econometrics（1996）。支持分数响应均值的拟似然建模思路，不为本题小样本提供预测准确或心理因果的保证。有界预测及评价原则另见 || . NBER Technical Working Paper 0147 (1993), published in the Journal of Applied Econometrics (1996). Supports quasi-likelihood mean modeling for fractional responses, not accuracy or psychological causation for this small sample. For bounds and evaluation principles, see[FPP3 §13.3](https://otexts.com/fpp3/limits.html) · [§7.5](https://otexts.com/fpp3/selecting-predictors.html)。
- [8] Garfunkel & Montgomery (Eds.) · GAIMME (2016), First Edition — https://www.comap.com/resources/free-resources/gaimme | [官方介绍 || Official Overview](https://www.comap.com/resources/free-resources/gaimme) · [第一版原文 || First-Edition Report](https://www.comap.com/images/resources/free_resources/GAIMME_Report.pdf)。印刷页12—13及图1.2介绍本文采用的六环节建模过程。 || . Printed pages 12–13 and Figure 1.2 present the six-component modeling process used in this article.
