---
title: "逼近的艺术：极限思想入门 || The Art of Approaching: An Introduction to Limits"
eyebrow: "微积分系列 · 第二篇 || Calculus Series · Part 2"
brand: "微积分 || Calculus"
date: 2026-04-14
strict_i18n: false
strict_density: true
lead: "你能无限接近一面墙，但永远不碰到它吗？1/2 + 1/4 + 1/8 + … 加到无穷大等于多少？这些看似奇怪的问题，正是微积分的基石。 || Can you get infinitely close to a wall but never touch it? What does 1/2 + 1/4 + 1/8 + … add up to? These seemingly strange questions are the very foundation of calculus."
hero_actions:
  - "开始探索 || Start Exploring | #zeno"
  - "系列导航 || Series Guide | #nav"
panel_label: "你将获得 || You Will Gain"
panel_title: "驯服“无穷”的直觉 || Taming the Intuition of Infinity"
panel:
  - "理解芝诺悖论为什么不矛盾 || Understand why Zeno's paradox is not a contradiction"
  - "感受“无限逼近”的直觉含义 || Feel the intuitive meaning of approaching infinity"
  - "计算一个无穷级数的和 || Calculate the sum of an infinite series"
  - "用极限的语言表达变化率 || Express rates of change in the language of limits"
metrics:
  - "系列编号 || Series # | 2 / 5 | 概念篇 || Concepts"
  - "前置知识 || Prerequisites | 第 1 篇 || Part 1 | 变化率概念 || Concept of Rates of Change"
  - "难度 || Difficulty | ★★☆☆☆ | 需要一点想象力 || Requires a bit of imagination"
  - "阅读时间 || Reading Time | ~15 min | 含思考实验 || Includes thought experiments"
style:
  accent: "#fb7185"
---

## #zeno 01 / A 2,500-Year-Old Puzzle :: 芝诺悖论：阿基里斯追不上乌龟？ || Zeno's Paradox: Can Achilles Never Catch the Tortoise?

古希腊哲学家芝诺提出了一个著名的问题，困扰了人类两千多年。微积分正是解开它的钥匙。 || The ancient Greek philosopher Zeno posed a famous puzzle that baffled humanity for over two thousand years. Calculus is the key to solving it.

:::accordion
::panel { open: true }
### 悖论是什么？ || What is the paradox?
赛跑英雄阿基里斯和一只乌龟比赛。乌龟先跑 100 米，阿基里斯跑得比乌龟快 10 倍。芝诺说： || The hero Achilles races a tortoise. The tortoise gets a 100-meter head start, and Achilles runs 10 times faster. Zeno says:

1

**阿基里斯跑到乌龟的起点 || Achilles runs to the tortoise's starting point**

他跑了 100 米——但这时候乌龟已经又向前爬了 10 米。 || He runs 100 meters — but by then the tortoise has crawled 10 meters ahead.

2

**阿基里斯跑到乌龟的新位置 || Achilles runs to the tortoise's new position**

他又跑了 10 米——但乌龟又爬了 1 米。 || He runs another 10 meters — but the tortoise crawls 1 more meter.

3

**再跑到乌龟的新新位置 || Run to the tortoise's next position**

他又跑了 1 米——乌龟又跑了 0.1 米…… || He runs 1 more meter — and the tortoise moves 0.1 meter…

∞

**无限循环 || Infinite loop**

每次阿基里斯到达乌龟的上一个位置，乌龟总是前进了一小段。按这个逻辑，阿基里斯需要无穷多步才能追上——所以他永远追不上？！ || Every time Achilles reaches the tortoise's previous position, the tortoise has moved a little further. By this logic, Achilles needs infinitely many steps to catch up — so he can never catch up?!

> **当然追得上！ || Of course he catches up!**
> 常识告诉我们阿基里斯几秒钟就追上乌龟了。悖论的漏洞在于：芝诺假设“无穷多步”就需要“无穷多时间”——但实际上， || Common sense tells us Achilles catches the tortoise in just a few seconds. The flaw in the paradox: Zeno assumed "infinitely many steps" requires "infinitely much time" — but in reality,

::panel
### 用数字破解悖论 || Breaking the paradox with numbers
假设阿基里斯跑 100 m 需要 10 秒（速度 10 m/s），乌龟 1 m/s。列出每一步： || Suppose Achilles runs 100 m in 10 seconds (10 m/s), and the tortoise runs at 1 m/s. Let's list each step:

| 步骤 || Step | 阿基里斯跑的距离 || Distance Achilles runs | 花的时间 || Time spent | 累计时间 || Total time |
| --- | --- | --- | --- |
| 1 | 100 m | 10 s | 10 s |
| 2 | 10 m | 1 s | 11 s |
| 3 | 1 m | 0.1 s | 11.1 s |
| 4 | 0.1 m | 0.01 s | 11.11 s |
| 5 | 0.01 m | 0.001 s | 11.111 s |
| … | … | … | → 11.111… s |

无穷多步的总时间 = 10 + 1 + 0.1 + 0.01 + … = 11.111… = || The total time for infinitely many steps = 10 + 1 + 0.1 + 0.01 + … = 11.111… =

> **关键洞察 || Key Insight**
> **无穷多个数加在一起，可以得到一个有限的结果。 || Infinitely many numbers added together can give a finite result.**这就是“极限”思想的核心。古希腊人缺少的工具，就是 17 世纪牛顿和莱布尼茨发明的微积分中的极限理论。 || This is the core of the “limit” idea. The tool the ancient Greeks lacked was the theory of limits in calculus, invented by Newton and Leibniz in the 17th century.
:::

## #approaching 02 / Feel "Getting Infinitely Close" :: 三个思想实验 || Three Thought Experiments

极限不是一个复杂的公式——它首先是一种思考方式。来做三个思想实验。 || A limit is not a complicated formula — it's first and foremost a way of thinking. Let's try three thought experiments.

:::accordion
::panel { open: true }
### 实验一：折纸靠近 || Experiment 1: Folding Paper Closer
拿一张纸，离面前的墙 1 米远。每次把你和墙之间的距离减半： || Take a piece of paper and stand 1 meter from the wall. Each time, cut the distance between you and the wall in half:

| 步骤 || Step | 离墙距离 || Distance from wall | 走的距离 || Distance walked |
| --- | --- | --- |
| 开始 || Start | 1 m | — |
| 第 1 步 || Step 1 | 0.5 m | 0.5 m |
| 第 2 步 || Step 2 | 0.25 m | 0.25 m |
| 第 3 步 || Step 3 | 0.125 m | 0.125 m |
| 第 10 步 || Step 10 | ≈ 0.001 m | 极小 || Tiny |
| 第 30 步 || Step 30 | ≈ 0.000000001 m | 原子级别 || Atomic scale |

你永远不会“到达”墙面，但你可以 || You will never "reach" the wall, but you can get

::panel
### 实验二：相机变焦 || Experiment 2: Camera Zoom
用手机对着远处一座山拍照，然后放大——放大——再放大。你看到的细节越来越多： || Take a photo of a distant mountain with your phone, then zoom in — zoom in — zoom in more. You see more and more detail:

- **1× 广角 || 1× Wide Angle** — 看到整座山的轮廓。山坡看起来像一条平滑的曲线。 || You see the whole mountain's outline. The slope looks like a smooth curve.
- **10× 变焦 || 10× Zoom** — 看到山坡上的树林和岩石。曲线变得凹凸不平。 || You see trees and rocks on the slope. The curve becomes bumpy.
- **1000× 超级变焦 || 1000× Super Zoom** — 只看山坡上一小块区域——几乎变成一段直线！ || You focus on a tiny patch of the slope — it almost becomes a straight line!

> **这就是导数的思路 || This is the idea behind derivatives**
> 任何弯曲的曲线，如果你“变焦”到足够近（取的区间足够小），这段曲线就几乎是一条 || Any curved line, if you zoom in close enough (take a small enough interval), becomes almost a

::panel
### 实验三：WiFi 信号衰减 || Experiment 3: WiFi Signal Fading
你家路由器放在客厅。信号强度随距离变化： || Your router is in the living room. Signal strength changes with distance:

1m

**满格信号 (100%) || Full Signal (100%)**

紧挨着路由器，信号完美。 || Right next to the router — perfect signal.

5m

**信号还不错 (60%) || Decent Signal (60%)**

到了卧室，信号由于墙壁和距离衰减，但还能用。 || In the bedroom — signal weakened by walls and distance, but still usable.

15m

**信号很弱 (15%) || Weak Signal (15%)**

到了车库，几乎连不上了。 || In the garage — barely able to connect.

∞

**极限：趋近于 0% 但不真的到 0 || Limit: Approaches 0% but never truly reaches 0**

无论走多远，理论上电磁波永远在传播，信号永远不会精确为零——但它会 || No matter how far you go, electromagnetic waves keep traveling — the signal never truly hits zero, but it gets

数学语言：当距离 d → ∞ 时，信号强度 S(d) → 0。我们写成： || In math: as distance d → ∞, signal strength S(d) → 0. We write:
:::

## #infinite-sum 03 / The Arithmetic of Infinity :: 给无穷多个数求和 || Adding Up Infinitely Many Numbers

芝诺悖论里那个关键的等式——无穷多个数加起来等于一个有限的数——让我们认真算一算。 || That key equation from Zeno's paradox — infinitely many numbers adding up to a finite number — let's actually do the math.

:::accordion
::panel { open: true }
### 1/2 + 1/4 + 1/8 + … = ?
想象你有一块 1 米长的巧克力。你吃掉一半（1/2），再吃剩下的一半（1/4），再吃剩下的一半（1/8）…… || Imagine you have a 1-meter chocolate bar. You eat half (1/2), then half of what's left (1/4), then half again (1/8)…

1/2

1/4

1/8

1/16

…

总和 → 1（整块巧克力）

每次你都吃剩余的一半，你永远吃不完——但你吃掉的总量无限接近整块巧克力。 || Each time you eat half of what remains — you'll never finish, but the total you eat gets infinitely close to the whole bar.

$$
\frac{1}{2} + \frac{1}{4} + \frac{1}{8} + \frac{1}{16} + \cdots = 1
$$

::panel
### 巧妙的证明方法 || A Clever Proof
设这个无穷和为 S： || Let this infinite sum be S:

$$
S = \frac{1}{2} + \frac{1}{4} + \frac{1}{8} + \frac{1}{16} + \cdots
$$

两边乘以 2： || Multiply both sides by 2:

$$
2S = 1 + \frac{1}{2} + \frac{1}{4} + \frac{1}{8} + \cdots = 1 + S
$$

所以 2S = 1 + S，解得 || So 2S = 1 + S, which gives us

> **等比级数公式 || Geometric Series Formula**
> 这类“每项是前一项的固定倍数”的求和叫做 || This type of sum where each term is a fixed multiple of the previous one is called a

::panel
### 哪些无穷和有限，哪些无穷大？ || Which infinite sums are finite, and which blow up?
| 求和 || Sum | 结果 || Result | 为什么？ || Why? |
| --- | --- | --- |
| 1/2 + 1/4 + 1/8 + … | = 1（收敛） || = 1 (converges) | 每项缩小为前一项的一半，缩得够快 || Each term shrinks to half the previous one — fast enough |
| 1/3 + 1/9 + 1/27 + … | = 1/2（收敛） || = 1/2 (converges) | 公比 1/3，a/(1−r) = (1/3)/(2/3) = 1/2 || Ratio 1/3, a/(1−r) = (1/3)/(2/3) = 1/2 |
| 1 + 1 + 1 + 1 + … | = ∞（发散） || = ∞ (diverges) | 每项不缩小，和无限增长 || Terms don't shrink — the sum grows without bound |
| 1 + 1/2 + 1/3 + 1/4 + … | = ∞（发散！） || = ∞ (diverges!) | 虽然每项在变小，但变小得不够快 || Each term gets smaller, but not fast enough |

> **收敛 vs 发散 || Convergence vs Divergence**
> 一个无穷和如果最终趋向一个固定的数，我们说它 || If an infinite sum approaches a fixed number, we say it
:::

## #limit-def 04 / Precise Mathematical Expression :: 极限：从直觉到符号 || Limits: From Intuition to Notation

我们已经对“无限接近”有了感觉。现在学习怎么用数学符号写出来。 || We now have a feel for "getting infinitely close." Let's learn how to write it in math notation.

:::accordion
::panel { open: true }
### 极限的符号 || Limit Notation
当我们说“x 趋近于 a 时，f(x) 趋近于 L”，数学家用一个简洁的符号来表达： || When we say "as x approaches a, f(x) approaches L," mathematicians express it with a concise symbol:

$$
\lim_{x \to a} f(x) = L
$$

读作“当 x 趋近于 a 时，f(x) 的极限等于 L”。关键词： || Read as "the limit of f(x) as x approaches a equals L." Key terms:

- **lim** — limit 的缩写，意为“极限”。 || Short for limit.
- **x → a** — x 无限接近 a（但不一定等于 a）。 || x gets infinitely close to a (but doesn't have to equal a).
- **= L** — 函数值无限接近的那个数就是 L。 || The number that the function value gets infinitely close to is L.

::panel
### 用极限重写变化率 || Rewriting Rates of Change with Limits
上一篇里，我们说平均变化率是 Δy/Δx。如果把 Δx 缩到无穷小——也就是取极限——我们就得到 || In the last article, we said the average rate of change is Δy/Δx. If we shrink Δx to be infinitely small — that is, take the limit — we get the

$$
r(x) = \lim_{\Delta x \to 0} \frac{\Delta y}{\Delta x}
$$

这个极限有一个专门的名字—— || This limit has a special name —

x

y

P

割线（远）

割线（近）

切线 = 极限

图中可以看到：随着第二个点越来越靠近 P，割线（虚线）越来越接近切线（蓝色实线）。当两点重合时——也就是 Δx → 0 的极限——割线变成了切线。切线的斜率就是导数。 || In the diagram: as the second point gets closer to P, the secant lines (dashed) approach the tangent line (blue solid). When the two points merge — the limit as Δx → 0 — the secant becomes the tangent. The tangent's slope is the derivative.

::panel
### 极限解决了什么问题？ || What problems do limits solve?
在进入下一篇之前，回顾一下极限思想解锁了哪些能力： || Before moving on to the next article, let's review the abilities that limits unlock:

1

**驯服无穷 || Taming infinity**

无穷多个数可以有有限的和（芝诺悖论的解答）。 || Infinitely many numbers can have a finite sum (the answer to Zeno's paradox).

2

**定义“瞬间” || Defining an instant**

通过让时间间隔无限缩小，我们可以精确定义瞬时速度、瞬时加速度等概念。 || By shrinking time intervals infinitely small, we can precisely define instantaneous velocity, acceleration, and more.

3

**曲线→直线 || Curves → Straight Lines**

在足够小的尺度上，任何光滑曲线都近似直线——这为后面用导数分析复杂函数打下了基础。 || At a small enough scale, any smooth curve looks like a straight line — laying the foundation for analyzing complex functions with derivatives.

4

**面积的精确计算 || Exact Area Calculation**

把不规则面积分成无穷多个极小的矩形，再用极限求和——这就是积分的原理（第 4 篇会讲到）。 || Slice an irregular area into infinitely many tiny rectangles and sum them with limits — that's integration (covered in Part 4).
:::

## #quiz 05 / ✍ 检验一下 :: 你真的理解了吗？

试试回答下面的问题，不急着看答案——先自己想 30 秒。

:::accordion
::panel
### 题 1：1/3 + 1/9 + 1/27 + 1/81 + … 这个无穷求和等于多少？
> **答案**
> 这是首项 a = 1/3、公比 r = 1/3 的等比级数。用公式 S = a / (1 − r) = (1/3) / (1 − 1/3) = (1/3) / (2/3) = **1/2**。无穷多个越来越小的数加起来，等于有限值 0.5。

::panel
### 题 2：为什么芝诺悖论是错的？"无穷多步"不意味着"无穷长时间"，关键在于什么？
> **答案**
> 关键在于这些步骤的**时间越来越短**——10 秒、1 秒、0.1 秒、0.01 秒……虽然步骤无穷多，但总时间 = 10 + 1 + 0.1 + … = 11.111… ≈ 11⅑ 秒，是**有限的**。极限思想告诉我们：无穷多个趋向零的数加在一起，可以收敛到有限值。

::panel
### 题 3：当我们写 lim(x→2) x² = 4 时，x 到底等不等于 2？
> **答案**
> x **不等于 2**——x 只是"无限接近"2。极限描述的是 x 趋近某个值时函数值的**趋势**，不要求 x 真的到达那一点。这个区分非常重要：有些函数在某个点没有定义（比如 sin(x)/x 在 x=0），但极限照样存在。
:::

## #nav 05 / 系列导航 :: 继续你的旅程

- [第 1 篇：变化的语言：从速度表到微积分](../calculus-intro-change/)
- **第 2 篇 · 当前：逼近的艺术：极限思想入门**
- [第 3 篇：导数：捕捉瞬间的变化率](../calculus-derivatives/)
- [第 4 篇：积分：化零为整的累积术](../calculus-integrals/)
- [第 5 篇：微积分基本定理：最优美的数学联系](../calculus-fundamental-theorem/)

:::callout { title: "下一篇预告" }
有了极限这个工具，我们终于可以正面出击——第 3 篇将深入**导数**：如何精确计算曲线上任意一点的斜率。我们会用过山车、无人机和山坡骑车的例子，让你亲手算出"瞬间速度"。
:::
