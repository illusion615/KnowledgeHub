---
title: "电路混联：识别结构、等效电阻、电流电压分配与功率 || Series-Parallel Circuits: Structure, Equivalent R, I/U Sharing, and Power"
eyebrow: "电学 · 四校自招冲刺 || Circuits · Selective-Exam Sprint"
brand: "电学 || Circuits"
date: 2026-06-23
strict_i18n: false
strict_density: true
lead: "混联是中考与自招电学的主战场。本篇用一个贯穿全文的例题，把「识别结构 → 求等效电阻 → 分配电流电压 → 算功率 → 动态分析」打成一条完整链路。 || Mixed circuits are the core of exam electricity. One running example threads structure recognition, equivalent resistance, current/voltage sharing, power, and dynamic analysis into a single chain."
hero_actions:
  - "从串并联规律开始 || Start with the Basics | #basics"
  - "直接看速查表 || Jump to Cheat Sheet | #cheatsheet"
panel_label: "你将拿到 || You Will Gain"
panel_title: "一条「看懂电路到算出一切」的流程 || A Pipeline from Reading a Circuit to Solving It"
panel:
  - "串联与并联的电流、电压、电阻规律 || Current, voltage, resistance rules for series and parallel"
  - "识别混联结构：电流路径法与等电位法 || Reading mixed circuits: current-path and equipotential methods"
  - "逐步化简求等效电阻，再分配电流电压 || Reduce to equivalent resistance, then share current and voltage"
  - "电功率计算与滑动变阻器动态分析 || Power calculation and rheostat dynamic analysis"
metrics:
  - "核心技能 || Core Skill | 电路化简 || Reduction | 识别 + 计算 || Read + Solve"
  - "例题 || Worked Examples | 9 | 含训练题 || Plus Drills"
  - "前置 || Prereq | 欧姆定律 || Ohm's Law | U = IR"
  - "建议用时 || Time | ~25 min | 含动手算 || With Practice"
style:
  accent: "#7c3aed"
---

## #basics 01 / The Two Foundations :: 串联与并联的三组规律 || The Three Rules of Series and Parallel

混联电路只是串联和并联的组合。先把这两块地基的「电流、电压、电阻」三组规律背到不假思索，后面化简才会快。 || A mixed circuit is just a combination of series and parallel. Lock in the current, voltage, and resistance rules for both before tackling reduction.

:::comparison
::versus 串联 || Series
### 电流一条路，电压分着担
- 电流处处相等：I = I₁ = I₂。
- 总电压等于各分电压之和：U = U₁ + U₂。
- 总电阻等于各电阻之和：R = R₁ + R₂。
- 分压：电阻越大分得电压越多，U₁ : U₂ = R₁ : R₂。

::versus 并联 || Parallel { highlight: true }
### 电压一样高，电流分着流
- 各支路电压相等：U = U₁ = U₂。
- 总电流等于各支路电流之和：I = I₁ + I₂。
- 总电阻取倒数和：1/R = 1/R₁ + 1/R₂。
- 分流：电阻越小分得电流越多，I₁ : I₂ = R₂ : R₁。
:::

:::callout { title: "📐 两电阻并联的实用公式" }
由 1/R = 1/R₁ + 1/R₂ 通分整理，得到考场最常用的「积比和」：
:::

$$
R_{\text{并}} = \dfrac{R_1 R_2}{R_1 + R_2}
$$

:::callout { title: "两个数量级直觉" }
并联总电阻一定比其中最小的那个还小；两个相等电阻 R 并联等于 R/2。串联总电阻一定比其中最大的那个还大。算完用这两条估一眼，能挡掉大部分计算错误。
:::

## #identify 02 / Read First, Compute Later :: 识别混联结构的两种方法 || Two Methods to Read a Mixed Circuit

混联题失分，多半不是不会算，而是没看出「谁和谁串、谁和谁并」。两种方法配合理想电表的处理，能把任何混联化成清晰的串并联组合。 || Most mistakes on mixed circuits come from misreading the structure, not the math. Two methods plus ideal-meter handling untangle any layout.

:::accordion
::panel { open: true }
### 电流路径法与等电位法 || Current-Path and Equipotential Methods
🔌

**电流路径法**

从电源正极出发沿电流方向走：电流不分岔地依次流过的元件是串联；电流在某点分成几支、再汇合的元件是并联。

📍

**等电位法（节点法）**

给每个节点编号，用纯导线（电阻为零）直接相连的点电位相同，可合并成同一点，再把电路重画成规整的串并联。

> **理想电表怎么处理**
> 理想电压表内阻无穷大，相当于断路——把它所在支路「去掉」，但它读出的是所并两点间的电压。理想电流表内阻为零，相当于一根导线——把它「短接」，两端可合并为同一节点。

下面这个电路贯穿后面几章：电源电压 U = 12 V，R₁ = 2 Ω 与「R₂ = 3 Ω 和 R₃ = 6 Ω 的并联」串联。

> **📊 内联数据可视化图表 || Inline SVG Visualization** — 图：R₁ 与（R₂ ∥ R₃）串联。节点 A、B 之间是并联段。U = 12 V，R₁ = 2 Ω，R₂ = 3 Ω，R₃ = 6 Ω。

::panel
### 例题：电流表短接合并节点 || Example: Ammeter Shorting and Node Merge
例 1

R₁ 与 R₂ 并联后，再与 R₃ 串联接到电源。一只理想电流表接在 R₁ 支路中。问：电流表读数是 R₁ 的电流还是干路电流？把电流表换成理想电压表又会怎样？

**电流表（理想，内阻 0）：**相当于导线，串在 R₁ 支路里就只测这条支路的电流，即 **I₁**（不是干路电流）。它的存在不改变电路结构。

**换成电压表（理想，内阻 ∞）：**相当于断路。若把它串进 R₁ 支路，这条支路就断了，电流为零，电路退化成 R₂ 与 R₃ 串联——结构被改变了。所以电压表只能并联在元件两端测电压，不能串入支路。
:::

## #equivalent 03 / Reduce to a Single Resistor :: 逐步合并求等效电阻 || Reduce Step by Step to Find Equivalent Resistance

求总电阻的套路是「由里到外、先并后串」：先把最内层的并联或串联小块合并成一个等效电阻，再把它当作单个电阻继续合并，直到只剩一个。 || Always work inside-out: collapse the innermost parallel or series block first, treat it as one resistor, and repeat until only one remains.

:::accordion
::panel { open: true }
### 例题：化简贯穿电路求总电阻与干路电流 || Example: Reduce the Running Circuit
例 2

上节电路：U = 12 V，R₁ = 2 Ω 与（R₂ = 3 Ω ∥ R₃ = 6 Ω）串联。求总电阻 R 与干路电流 I。

**第一步，先并：**R₂ 与 R₃ 并联，R₂₃ = R₂R₃ / (R₂+R₃) = 3 × 6 / (3 + 6) = **2 Ω**。

**第二步，再串：**R = R₁ + R₂₃ = 2 + 2 = **4 Ω**。

**第三步，求干路电流：**由欧姆定律 I = U / R = 12 / 4 = **3 A**。这就是流过 R₁ 的电流。

验算：并联段 2 Ω 比最小支路 3 Ω 还小 ✓；总电阻 4 Ω 比最大块 2 Ω 大 ✓。

> **📐 化简口诀**
> 找到「电流不分岔依次流过」的元件 → 串联相加；找到「两端直接接在同一对节点上」的元件 → 并联用积比和。每合并一块，就把它当成一个新电阻重画，电路会越来越简单。
:::

## #distribute 04 / From Trunk Back to Each Branch :: 电流与电压的分配 || Sharing Current and Voltage

求出干路电流后，沿「总 → 分」的方向回推：串联部分先分电压，并联部分再分电流。每一步都只用欧姆定律和串并联规律。 || With the trunk current known, work from whole to parts: series blocks split voltage, parallel blocks split current — each step just uses Ohm's law and the series/parallel rules.

:::accordion
::panel { open: true }
### 例题：求各电阻上的电压与电流 || Example: Voltage and Current on Each Resistor
例 3

接例 2（I = 3 A，R₂₃ = 2 Ω）。求 R₁ 两端电压 U₁、并联段电压 U₂₃，以及各支路电流 I₂、I₃。

**R₁ 上的电压（串联，过它的就是干路电流）：**U₁ = I·R₁ = 3 × 2 = **6 V**。

**并联段电压：**U₂₃ = U − U₁ = 12 − 6 = **6 V**（也等于 I·R₂₃ = 3 × 2 = 6 V）。

**各支路电流（并联同压，各自用欧姆定律）：**I₂ = U₂₃ / R₂ = 6 / 3 = **2 A**；I₃ = U₂₃ / R₃ = 6 / 6 = **1 A**。

验算：I₂ + I₃ = 2 + 1 = 3 A = 干路电流 ✓；分流比 I₂ : I₃ = 2 : 1 = R₃ : R₂ ✓。

**⚠ 易错提醒**

- **并联段两端是同一个电压**，不要再用干路电流去乘某个支路电阻求支路电压。
- **分流跟电阻成反比**：电阻小的支路电流大。分压才跟电阻成正比。
- **每个电阻只能用「它自己的」U、I、R 配欧姆定律**，U = IR 三个量必须对应同一段，不能张冠李戴。
:::

## #power 05 / Who Draws More Power :: 电功率与电能 || Electric Power and Energy

功率公式有三个等价形式，选用哪个取决于「手上有哪两个量」。在串、并联里，功率与电阻的比例关系恰好相反，这是高频考点。 || Power has three equivalent forms; pick the one matching the quantities you have. Its proportionality to resistance flips between series and parallel — a frequent exam point.

:::accordion
::panel { open: true }
### 三个功率公式与串并联比例 || Three Power Formulas and the Proportionality
$$
P = UI = I^2 R = \dfrac{U^2}{R}
$$

> **📐 串联看 I²R，并联看 U²/R**
> 串联时电流 I 相同，用 P = I²R，功率与电阻成正比——电阻大的更费电、更亮。
> 并联时电压 U 相同，用 P = U²/R，功率与电阻成反比——电阻小的反而更费电、更亮。
> 电能 W = Pt（t 用秒，W 用焦耳）；额定功率指用电器在额定电压下的功率，实际电压不同则实际功率不同。

::panel
### 例题：求各电阻功率与总功率 || Example: Power on Each Resistor
例 4

接前例（U = 12 V，I = 3 A；R₁ = 2 Ω 上 I₁ = 3 A，R₂ = 3 Ω 上 I₂ = 2 A，R₃ = 6 Ω 上 I₃ = 1 A，并联段电压 6 V）。求三个电阻的功率与电源总功率。

P₁ = I₁²R₁ = 3² × 2 = **18 W**。

P₂ = U₂₃² / R₂ = 6² / 3 = **12 W**；P₃ = 6² / 6 = **6 W**。

**总功率：**P = UI = 12 × 3 = **36 W**。验算 P₁ + P₂ + P₃ = 18 + 12 + 6 = 36 W = 总功率 ✓。
:::

## #dynamic 06 / When the Rheostat Moves :: 电表的动态分析 || Dynamic Analysis of Meter Readings

自招常考：滑动变阻器阻值变化时，电流表、电压表读数怎么变。抓住「先看干路总电阻怎么变」这条主线，就能一路推出每个表的变化。 || A favorite exam type: how meter readings change as a rheostat slides. Track the total resistance first, and every meter follows.

:::accordion
::panel { open: true }
### 动态分析的主线与「串反并同」 || The Main Thread of Dynamic Analysis
1. **看变阻器怎么接** — 判断滑片移动使接入电路的电阻变大还是变小。
2. **推干路总电阻** — 变阻器串在干路 → 总电阻同向变；并在某段 → 该段及总电阻反向变。
3. **推干路电流** — 由 I = U/R，总电阻变大则干路电流变小，反之变大。
4. **逐表回推** — 串联定值电阻的电压 = 干路电流 × 它的电阻，跟着干路电流走；其余电压用 U 总减去已知部分。

::panel
### 例题：滑动变阻器与两个电表 || Example: Rheostat with Two Meters
例 5

定值电阻 R₀ 与滑动变阻器 R 串联接电源（电压 U 不变）。电流表 A 接在干路，电压表 V 并在变阻器 R 两端。当滑片移动使 R 增大时，A 和 V 的读数各如何变化？

**总电阻：**R 增大 → 总电阻 R₀ + R 增大。

**电流表 A（测干路电流）：**I = U / (R₀ + R)，总电阻变大 → 干路电流变小 → **A 读数减小**。

**R₀ 上的电压：**U₀ = I·R₀，随电流减小而减小。

**电压表 V（测 R 两端）：**U╲ = U − U₀，U 不变、U₀ 减小 → **V 读数增大**。

规律：变阻器自身电压与它的阻值「同向」变化，与之串联的定值电阻电压「反向」变化。

例 6

接例 5，若电压表错接成并在定值电阻 R₀ 两端，R 增大时这只电压表读数又如何变化？

此时电压表测 U₀ = I·R₀。R 增大 → 干路电流减小 → U₀ 减小 → **读数减小**。

对比例 5 可见：同样是 R 增大，测变阻器的电压表升、测定值电阻的电压表降——读数往哪边变，取决于电压表并在谁的两端。

**⚠ 易错提醒**

- **先抓总电阻，再推电流，最后推各电压**，顺序别乱。
- **看清电压表并在「谁」两端**：测定值电阻还是测变阻器，结论完全相反。
- **理想电流表当导线、理想电压表当断路**，分析前先把电表理想化。
:::

## #redraw 07 / Beyond · Untangling Messy Circuits :: 复杂电路改画：节点编号法 || Redrawing Complex Circuits: The Node-Labeling Method

自招最难的电路题，往往不是算得难，而是元件散布、导线绕来绕去，根本看不出谁串谁并。这一节给出把任意「乱图」改画成规整串并联的通用方法，再用三道例题和训练把它练熟。 || The hardest selective-exam circuit problems are not hard to compute — they are hard to read, with scattered parts and tangled wires. This section gives a general method to redraw any messy circuit into clean series-parallel form.

:::accordion
::panel { open: true }
### 节点编号法：四步把乱图改画成规整图 || Node Labeling: Four Steps to Redraw
核心思想：电路里「靠纯导线（无电阻）相连的点，电位相同，算作同一个节点」。只要先把节点认清，每个电阻「接在哪两个节点之间」就唯一确定了，结构自然显现。

1. **标节点** — 沿导线走，凡是只靠纯导线、闭合开关、理想电流表相连的点，全标成同一个字母（A、B、C…）。遇到电阻才换字母。
2. **登记每个电阻接在哪两点** — 把每个电阻写成「R = 某点—某点」，例如 R₁：A—B、R₂：A—B、R₃：B—C。
3. **按节点重画** — 把节点 A、B、C… 在纸上排开，按登记表把电阻挂上去：接同一对节点的电阻互相并联，依次串接不同节点的电阻串联。
4. **照常化简** — 得到规整图后，用第 03 章「由里到外、先并后串」求等效电阻，再分配电流电压。

> **截图那种电路就是这样解**
> 像你看到的那种元件散布、导线交错的电路，不要试图「一眼看出」串并联。老老实实标节点、登记两端、重画，再乱的图也会变成几个电阻挂在两三个节点之间的规整图。

::panel
### 例 7：散布的电阻其实都在 A、B 之间 || Example 7: Scattered Resistors All Sit Between A and B
下图是改画后的结果：原图中 R₁ = 6 Ω、R₂ = 3 Ω、R₃ = 2 Ω 被画得分散、导线交错，标完节点才发现三者的左端都连到节点 A、右端都连到节点 B（中间导线无电阻）。

> **📊 内联数据可视化图表 || Inline SVG Visualization** — 图：改画后 R₁、R₂、R₃ 全部接在节点 A、B 之间 = 三者并联。

例 7

求 A、B 之间的总电阻。R₁ = 6 Ω，R₂ = 3 Ω，R₃ = 2 Ω。

三者并联，用倒数和：

1/R = 1/6 + 1/3 + 1/2 = 1/6 + 2/6 + 3/6 = 6/6 = 1 ⟹ R = **1 Ω**。

验算：并联总电阻 1 Ω 比最小支路 R₃ = 2 Ω 还小 ✓。这题的全部难点在「看出三者并联」，算反而最简单——这正是改画的价值。

::panel
### 例 8：一根导线把电阻短路 || Example 8: A Wire Short-Circuits a Resistor
改画时最容易翻车的陷阱：和某个电阻**并联**的一段纯导线（或闭合的开关、理想电流表），会把这个电阻「短路」——电流全走零电阻的导线，电阻上没有电流、没有电压，相当于不存在。

例 8

R₁ = 4 Ω 与 R₂ = 6 Ω 串联接到 12 V 电源，另有一根导线直接跨接在 R₂ 的两端。求干路电流，以及 R₂ 上的电流。

**标节点：**导线跨接 R₂ 两端，使 R₂ 两端成为同一节点（等电位）。R₂ 被短路。

**等效电路：**只剩 R₁ 接在电源两端，总电阻 R = R₁ = **4 Ω**。

**干路电流：**I = U / R = 12 / 4 = **3 A**。

**R₂ 上的电流：**R₂ 两端电压为 0，**I₂ = 0**，电流全部从导线流过。

**⚠ 易错提醒**

- **「与电阻并联的导线」才短路它**；与电阻串联的导线只是延长线，不短路。
- **闭合开关 = 导线，断开开关 = 断路。**开关一闭一断常常改变结构，要重新标节点。
- **理想电流表当导线**，若它和某电阻并联，也会把该电阻短路（实际题里电流表一般串联，不会这样接）。

::panel
### 例 9：平衡电桥，桥上无电流 || Example 9: A Balanced Bridge Carries No Current
有一类电路改画不动——中间架了一条「桥」（惠斯通电桥）。但当电桥**平衡**时，桥的两端电位相等、桥上无电流，可以把桥臂直接拆掉，剩下纯串并联。

> **📐 电桥平衡判据**
> 四个臂 R₁、R₂、R₃、R₄ 组成菱形（A 进、C 出），R₁、R₂ 一条边，R₃、R₄ 另一条边，中间桥 R₅ 连两条边的中点 B、D。
> 当 R₁ / R₂ = R₃ / R₄ 时，B、D 等电位，桥 R₅ 上无电流，可拆掉。电路化为 (R₁ + R₂) 与 (R₃ + R₄) 两条支路的并联。

例 9

菱形电桥 R₁ = 1 Ω、R₂ = 2 Ω、R₃ = 2 Ω、R₄ = 4 Ω，中间桥 R₅ = 5 Ω。求 A、C 间总电阻。

**先判平衡：**R₁/R₂ = 1/2，R₃/R₄ = 2/4 = 1/2，相等 ⟹ 电桥平衡，R₅ 上无电流，拆掉。

**两条支路串联：**上支路 R₁ + R₂ = 3 Ω；下支路 R₃ + R₄ = 6 Ω。

**两支路并联：**R = 3 × 6 / (3 + 6) = 18 / 9 = **2 Ω**。

注意 R₅ = 5 Ω 是干扰量——平衡时无论它多大都不影响结果。

::panel
### 训练：三道改画题（先做再翻答案） || Drills: Three Redraw Problems
不看上面的例题，自己标节点、改画、计算。算完再展开答案核对。

**训练 1** R₁ = 3 Ω、R₂ = 6 Ω、R₃ = 9 Ω 三个电阻，标节点后发现都接在节点 A、B 之间。求 A、B 间总电阻。

**查看答案 || Show answer**

三者并联：1/R = 1/3 + 1/6 + 1/9 = 6/18 + 3/18 + 2/18 = 11/18 ⟹ R = 18/11 ≈ **1.64 Ω**。

验算：比最小支路 3 Ω 还小 ✓。

**训练 2** R₁ = 5 Ω 与 R₂ = 10 Ω 串联接 15 V 电源，开关 S 与 R₁ 并联。求 S 闭合时的干路电流，以及 R₁ 上的电流。

**查看答案 || Show answer**

S 闭合 = 一根导线跨接在 R₁ 两端，R₁ 被短路。等效电路只剩 R₂ = 10 Ω。

干路电流 I = U / R₂ = 15 / 10 = **1.5 A**；R₁ 两端电压为 0，**I₁ = 0**。

**训练 3** 菱形电桥 R₁ = 2 Ω、R₂ = 3 Ω、R₃ = 4 Ω、R₄ = 6 Ω，中间桥 R₅ = 7 Ω。判断电桥是否平衡；若平衡，求 A、C 间总电阻。

**查看答案 || Show answer**

判平衡：R₁/R₂ = 2/3，R₃/R₄ = 4/6 = 2/3，相等 ⟹ **平衡**，桥 R₅ 无电流，拆掉。

上支路 2 + 3 = 5 Ω，下支路 4 + 6 = 10 Ω，并联：R = 5 × 10 / 15 = **10/3 ≈ 3.33 Ω**。
:::

## #cheatsheet 08 / Last Look Before the Exam :: 混联分析速查表 || Mixed-Circuit Cheat Sheet

把串联、并联、功率与电表处理的关键规律压缩成一张表，作为考前最后过的清单。 || Series, parallel, power, and meter handling compressed into one last-minute checklist.

| 项目 || Item | 串联 || Series | 并联 || Parallel |
| --- | --- | --- |
| 电流 | 处处相等 I = I₁ = I₂ | 干路 = 各支路之和 I = I₁ + I₂ |
| 电压 | 总 = 各分压之和 U = U₁ + U₂ | 各支路相等 U = U₁ = U₂ |
| 电阻 | R = R₁ + R₂（比最大还大） | R = R₁R₂/(R₁+R₂)（比最小还小） |
| 分配规律 | 分压 U ∝ R | 分流 I ∝ 1/R |
| 功率（同 I / 同 U） | 用 P = I²R，P ∝ R | 用 P = U²/R，P ∝ 1/R |
| 理想电表 | 电流表内阻 0（当导线，串入测电流）；电压表内阻 ∞（当断路，并联测电压） |   |
| 复杂改画 | 节点编号法：纯导线/闭合开关/理想电流表相连 = 同一节点；与电阻并联的导线短路该电阻；电桥 R₁/R₂ = R₃/R₄ 平衡时桥上无电流可拆 |   |
| 通用工具 | 欧姆定律 U = IR（三量须同段）；功率 P = UI = I²R = U²/R；电能 W = Pt |   |

:::callout { title: "解混联题的固定流程" }
（乱图先标节点、改画成规整串并联）→ 识别结构（电流路径 / 等电位 + 电表理想化）→ 由里到外化简求总电阻 → I = U/R 求干路电流 → 沿「总到分」分配电压电流 → 按需求功率。每一步都只用欧姆定律和串并联规律，不要跳步。
:::

## #nav 09 / Go Deeper :: 相关文章 || Related Articles

想把电路学得更系统，下面是站内同主题文章；力学冲刺另起一篇。 || For a more systematic treatment, see the related articles below; the mechanics sprint is a separate piece.

- [电学 · 系统篇 || Circuits · Deep：恒定电流：欧姆定律与电路分析 || DC Circuits: Ohm's Law & Analysis](../dc-circuits/)
- [电学 · 前置 || Electricity · Basis：静电场：从库仑定律到电势能 || Electrostatics](../electrostatics/)
- [电磁 · 延伸 || Magnetism · Next：磁场：安培力与洛伦兹力 || Magnetic Fields](../magnetic-fields/)
- [力学 · 冲刺篇 || Mechanics · Sprint：力学冲刺：正交分解、匀变速、g 与功能 || Mechanics Sprint](../physics-sprint-mechanics/)
