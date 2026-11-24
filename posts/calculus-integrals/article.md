---
title: "积分：化零为整的累积术 || Integrals: The Art of Accumulating Infinitesimals"
eyebrow: "微积分系列 · 第四篇 || Calculus Series · Part 4"
brand: "微积分 || Calculus"
date: 2026-04-14
strict_i18n: false
strict_density: true
lead: "速度一直在变，总共走了多远？水龙头流量忽大忽小，水桶最终接了多少水？当“速率”不是常数时，怎么算出“总量”？ || Speed keeps changing — how far did you go? The faucet flow varies — how much water ended up in the bucket? When the rate isn’t constant, how do you calculate the total?"
hero_actions:
  - "开始探索 || Start Exploring | #why-integral"
  - "系列导航 || Series Guide | #series-nav"
panel_label: "你将获得 || You Will Gain"
panel_title: "从\"切片\"到\"积分\"的直觉 || From Slicing to Integration — Building Intuition"
panel:
  - "理解积分要解决什么问题 || Understand what problem integrals solve"
  - "掌握\"切片→求和→取极限\"三步法 || Master the three-step method: slice → sum → take the limit"
  - "看懂黎曼和的几何意义 || Visualize the geometric meaning of Riemann sums"
  - "发现积分在生活中的广泛应用 || Discover real-world applications of integrals"
metrics:
  - "系列编号 || Series # | 4 / 5 | 积分篇 || Integrals"
  - "前置知识 || Prerequisites | 极限 + 导数 || Limits + Derivatives | 第 2、3 篇内容 || Parts 2 & 3"
  - "难度 || Difficulty | ★★★★☆ | 需要一点耐心 || Requires some patience"
  - "阅读时间 || Reading Time | ~15 min | 含互动思考 || Includes interactive thinking"
style:
  accent: "#fb7185"
---

## #why-integral 01 / The Reverse Problem of Derivatives :: 知道速度，怎么算距离？ || If You Know the Speed, How Do You Find the Distance?

上一篇（导数）我们学会了从“总量”推出“变化率”：知道距离的函数，就能求出每一瞬间的速度。现在问题反过来了—— || In the previous article (Derivatives), we learned how to go from total quantity to rate of change: given the distance function, we could find the speed at every instant. Now the question is reversed —

:::callout { title: "核心问题 || Core Question" }
你坐在副驾驶，只能看到速度表。车开了 2 小时，速度一直在变——有时 40 km/h，有时 120 km/h。**你能知道车总共开了多远吗？** || You’re in the passenger seat, and all you can see is the speedometer. The car has been driving for 2 hours, with speed constantly changing — sometimes 40 km/h, sometimes 120 km/h. **Can you figure out the total distance traveled?**
:::

:::accordion
::panel { open: true }
### 匀速的情况：小学就会 || Constant speed: elementary school level
如果速度从头到尾都是 60 km/h，那太简单了： || If the speed stays at 60 km/h the entire time, it's super easy:

$$
d = v \times t = 60 \times 2 = 120\,\text{km}
$$

在速度-时间图上，这就是一个**矩形的面积**——底边是时间（2 小时），高是速度（60 km/h），面积 = 底 × 高 = 120。 || On a speed-time graph, this is simply the **area of a rectangle** — the base is time (2 hours), the height is speed (60 km/h), area = base × height = 120.

时间 t (h)

速度 v

面积 = 距离

0

2

60

::panel
### 变速的情况：矩形不够用了 || Varying speed: rectangles aren’t enough
但真实的速度曲线是弯弯曲曲的。速度从 40 起步，加到 120，又降到 80……画成图是这样的： || But in reality, the speed curve is wavy. Speed starts at 40, ramps up to 120, then drops to 80... Here's what it looks like on a graph:

时间 t (h)

速度 v

阴影面积 = 总距离

但形状不规则，怎么算？

0

2

> **关键洞察 || Key Insight**
> 距离 = 速度-时间图下方的面积。匀速时面积是矩形，好算。变速时面积是曲线围成的不规则图形——**这就是积分要干的事：算曲线下方的面积。** || Distance = the area under the speed-time graph. At constant speed, the area is a rectangle — easy to calculate. At varying speed, the area is an irregular shape bounded by a curve — **and that's exactly what integrals do: calculate the area under a curve.**

::panel
### 不只是距离：面积的普遍意义 || Beyond distance: the universal meaning of area
- **水龙头接水 || Filling a Bucket** — 水流量（升/秒）× 时间 = 总水量。流量一直在变的话，总水量 = 流量-时间图的面积。 || Flow rate (liters/sec) × time = total water. If the flow rate keeps changing, total water = the area under the flow-time graph.
- **电力消耗 || Power Consumption** — 功率（瓦特）× 时间 = 总用电量（瓦时）。空调忽开忽关，功率一直变，总能耗 = 功率曲线下的面积。 || Power (watts) × time = total energy (watt-hours). With the AC turning on and off, power keeps changing — total energy = the area under the power curve.
- **降雨量累计 || Cumulative Rainfall** — 雨量计记录的是"每小时降水量"。把它画成图，曲线下面积就是总降水量——这就是天气预报里"累计降水"的算法。 || A rain gauge records hourly precipitation. Plot it on a graph, and the area under the curve is the total rainfall — that's how weather forecasts calculate cumulative precipitation.

data-zh="规律来了：**当一个量的"速率"随时间变化，要算这个量的"总累积"，就是在算速率曲线下方的面积。**这就是积分。" data-en="Here's the pattern: **when the rate of a quantity changes over time, finding its total accumulation means calculating the area under the rate curve.** That's integration.">规律来了：**当一个量的"速率"随时间变化，要算这个量的"总累积"，就是在算速率曲线下方的面积。**这就是积分。
:::

## #slice-sum 02 / An Ancient and Brilliant Idea :: 切成小条，逐个击破 || Slice into Thin Strips, Conquer One by One

曲线下方的面积不规则，算不出来？那就把它切成很多很多小条——每一小条都近似于一个窄矩形，矩形面积你会算吧？ || The area under a curve is irregular and hard to calculate directly? Then slice it into lots of thin strips — each strip is approximately a narrow rectangle, and you know how to calculate rectangle areas, right?

:::accordion
::panel { open: true }
### 用"披萨切法"理解切片思想 || Understanding slicing with the pizza method
想象你面前有一块形状奇怪的蛋糕（曲线下方的面积），你想知道它多大。直接量？太难了。 || Imagine you have a weirdly shaped cake in front of you (the area under the curve), and you want to know how big it is. Measure it directly? Too hard.

1

**竖着切成窄条 || Slice vertically into thin strips**

先把蛋糕竖着切成 4 条。每条虽然有一边是弯的，但因为很窄，和一个矩形差不多。 || First, slice the cake vertically into 4 strips. Even though one side of each strip is curved, because it's so narrow, it's almost like a rectangle.

2

**每条当作矩形算面积 || Treat each strip as a rectangle**

每个矩形的宽 = 切片宽度，高 = 那个位置曲线的高度。面积 = 宽 × 高。 || Each rectangle's width = slice width, height = the curve's value at that position. Area = width × height.

3

**全部加起来 || Add them all up**

所有小矩形的面积之和 ≈ 曲线下方的面积。切得越多越细，误差越小。 || The sum of all small rectangles ≈ the area under the curve. The more and thinner you slice, the smaller the error.

::panel
### 动手体验：车程估算 || Hands-on: estimating a car trip
回到速度变化的例子。假设 2 小时内速度如下： || Back to the speed change example. Suppose the speed over 2 hours is as follows:

| 时间段 || Time Period | 速度 (km/h) || Speed (km/h) | 时长 (h) || Duration (h) | 估计距离 (km) || Est. Distance (km) |
| --- | --- | --- | --- |
| 0:00 – 0:30 | 40 | 0.5 | 20 |
| 0:30 – 1:00 | 80 | 0.5 | 40 |
| 1:00 – 1:30 | 120 | 0.5 | 60 |
| 1:30 – 2:00 | 90 | 0.5 | 45 |

$$
d_{\text{total}} \approx 20 + 40 + 60 + 45 = 165\,\text{km}
$$

我们把 2 小时切成了 4 段，每段用一个固定速度估计。如果切成 8 段、16 段、1000 段呢？每段越窄，用那段起点的速度来估计就越准确。 || We split 2 hours into 4 segments, using a fixed speed for each. What if we split into 8, 16, or 1000 segments? The narrower each segment, the more accurate the estimate.

> **这就是积分的核心思路 || This Is the Core Idea of Integration**
> 切片 → 求和 → 让切片数趋向无穷（宽度趋向零）→ 得到精确值。有没有想起什么？对，又是**极限**！第 2 篇学的极限在这里再次登场。 || Slice → sum → let the number of slices approach infinity (width approaches zero) → get the exact value. Ring a bell? Yes, it's **limits** again! The limits we learned in Part 2 make a comeback here.

::panel
### 图解：从粗糙到精确 || Illustrated: from rough to precise
- **切 4 条 || 4 Strips** — 每条很宽，矩形顶部和曲线之间有明显空隙或溢出。误差较大——但至少给了个大概估计。 || Each strip is wide, with noticeable gaps or overflow between the rectangle tops and the curve. The error is significant — but at least it gives a rough estimate.
- **切 16 条 || 16 Strips** — 每条变窄了，矩形更贴合曲线。误差明显减小。 || Each strip is narrower, and the rectangles fit the curve much better. The error is noticeably smaller.
- **切无穷多条 || Infinitely Many Strips** — 每条宽度趋向零，矩形完美贴合曲线。求和的结果就是曲线下方的精确面积——这就是**定积分**。 || Each strip's width approaches zero, and the rectangles perfectly match the curve. The sum gives the exact area under the curve — this is the **definite integral**.

x

f(x)

8 个矩形的面积之和 ≈ 曲线下面积

f(x)
:::

## #riemann 03 / Writing It in Math Language :: 黎曼和：从直觉到符号 || Riemann Sums: From Intuition to Notation

我们已经有了"切片→求和→取极限"的直觉。现在把它翻译成数学家的语言——别怕，每个符号你都认识。 || We already have the intuition of slice → sum → take the limit. Now let's translate it into mathematical language — don't worry, you'll recognize every symbol.

:::accordion
::panel { open: true }
### 黎曼和公式 || The Riemann Sum Formula
把区间 [a, b] 切成 n 等份，每份宽 Δx = (b − a) / n。在第 i 份那里，函数值是 f(xᵢ)。那么： || Divide the interval [a, b] into n equal parts, each with width Δx = (b − a) / n. At the i-th part, the function value is f(xᵢ). Then:

$$
S \approx f(x_1)\Delta x + f(x_2)\Delta x + \cdots + f(x_n)\Delta x
$$

用求和符号写得更紧凑： || Written more compactly with summation notation:

$$
S \approx \sum_{i=1}^{n} f(x_i) \cdot \Delta x
$$

这就叫**黎曼和**（Riemann Sum），以德国数学家黎曼命名。它是"用一堆小矩形面积之和来近似曲线下面积"的精确数学写法。 || This is called a **Riemann sum**, named after German mathematician Riemann. It's the precise mathematical way to write "approximating the area under a curve with a bunch of small rectangles."

::panel
### 从 Σ 到 ∫：积分符号的诞生 || From Σ to ∫: Birth of the Integral Sign
当 n → ∞（切片无穷多），Δx → 0（每片无穷窄），黎曼和就趋近于精确的面积。数学家用一个新符号来表达这个极限过程： || When n → ∞ (infinitely many slices) and Δx → 0 (each slice infinitely thin), the Riemann sum approaches the exact area. Mathematicians use a new symbol for this limiting process:

$$
\int_a^b f(x)\,dx
$$

对应关系一目了然： || The correspondence is clear:

| 切片求和 || Slice Sum | 积分符号 || Integral Sign | 含义 || Meaning |
| --- | --- | --- |
| Σ | ∫ | "加起来"——∫ 是拉长的 S，代表 Sum（求和） || Add them up — ∫ is an elongated S, standing for Sum |
| f(xᵢ) | f(x) | 每一小条的"高度" || The height of each strip |
| Δx | dx | 每一小条的"宽度"，无穷小 || The width of each strip, infinitesimally small |
| i = 1 到 n || i = 1 to n | a 到 b || a to b | 求和的范围 || The range of summation |

> **符号不可怕 || The Notation Isn't Scary**
> ∫ₐᵇ f(x) dx 的意思就是：**把 f(x) 的值当作高，dx 当作无穷窄的宽，从 a 到 b 把所有这些无穷小矩形的面积加起来。**仅此而已。 || ∫ₐᵇ f(x) dx simply means: **use f(x) as the height, dx as the infinitesimally narrow width, and add up all these infinitesimal rectangles from a to b.** That's all there is to it.

::panel
### 动手算：y = x 从 0 到 4 的面积 || Hands-on: area of y = x from 0 to 4
先用几何直觉：y = x 是一条过原点的直线，从 x = 0 到 x = 4，和 x 轴围成一个**三角形**。底 = 4，高 = 4： || First, use geometric intuition: y = x is a straight line through the origin. From x = 0 to x = 4, it forms a **triangle** with the x-axis. Base = 4, height = 4:

$$
S = \frac{1}{2} \times 4 \times 4 = 8
$$

现在用切片法验证。切成 4 份（Δx = 1），用每个区间左端点的值当高： || Now verify with the slicing method. Divide into 4 parts (Δx = 1), using the left endpoint value as the height:

| 区间 || Interval | 左端点 xᵢ || Left endpoint xᵢ | f(xᵢ) = xᵢ | 面积 = f(xᵢ)·Δx || Area = f(xᵢ)·Δx |
| --- | --- | --- | --- |
| [0,1] | 0 | 0 | 0 |
| [1,2] | 1 | 1 | 1 |
| [2,3] | 2 | 2 | 2 |
| [3,4] | 3 | 3 | 3 |

$$
S_4 = 0 + 1 + 2 + 3 = 6
$$

如果切成 8 份（Δx = 0.5），结果是 7；切成 100 份，结果是 7.92；切成 10000 份，结果是 7.9992…… || If we split into 8 parts (Δx = 0.5), the result is 7; into 100 parts, 7.92; into 10,000 parts, 7.9992...

> **极限再次登场 || Limits Make a Comeback**
> n → ∞ 时，黎曼和 → 8，和三角形面积完全吻合！这验证了"切片→求和→取极限"这套方法确实能算出精确面积。而积分的记法就是：∫₀⁴ x dx = 8。 || As n → ∞, the Riemann sum → 8, perfectly matching the triangle's area! This confirms that slice → sum → take the limit truly produces the exact area. In integral notation: ∫₀⁴ x dx = 8.
:::

## #real-world 04 / Integrals Are Everywhere :: 生活和工程中的积分应用 || Applications of Integrals in Life and Engineering

积分不只是"算面积的数学工具"——它是所有"累积"问题的通用语言。来看看工程师、科学家们每天都在积分什么。 || Integrals aren't just a math tool for calculating areas — they're the universal language for all accumulation problems. Let's see what engineers and scientists integrate every day.

:::accordion
::panel { open: true }
### 六个真实场景 || Six real-world scenarios
- **GPS 计算总里程 || GPS Calculates Total Distance** — 手机 GPS 每秒记录一次速度。把这些速度值"切片求和"——实际上就是在做数值积分——就得到你的跑步总里程。运动 App 背后全靠积分。 || Your phone's GPS records speed every second. Adding up those speed values — essentially numerical integration — gives your total running distance. Fitness apps rely entirely on integrals.
- **不规则地形面积 || Irregular Terrain Area** — 工程师测量一块河边地皮，边界弯弯曲曲。用积分把边界函数下面的面积算出来，就知道这块地有多大——比一个个三角形拼还精确。 || Engineers survey a riverside plot with winding boundaries. Using integrals to calculate the area under the boundary function gives the plot's exact size — far more precise than piecing triangles together.
- **心脏泵血量 || Cardiac Output** — 心电图记录了血液流速随时间的变化。医生对流速曲线做积分，就能知道心脏每分钟泵出了多少血——这是评估心功能的关键指标。 || ECG records blood flow rate over time. Doctors integrate the flow curve to determine how much blood the heart pumps per minute — a key indicator of cardiac function.
- **火箭轨道计算 || Rocket Trajectory Calculation** — 火箭推力随燃料消耗而变化 → 加速度在变 → 速度在变 → 位置在变。要从推力算出最终位置，需要做两次积分：推力→速度→位置。 || Rocket thrust changes as fuel burns → acceleration changes → speed changes → position changes. To calculate the final position from thrust, you need two integrations: thrust → speed → position.
- **年度用电量 || Annual Electricity Usage** — 电力公司记录每个时刻的功率消耗。全年用电量 = 功率对时间的积分。你家电表上转的那个数字，本质上就是一个积分器。 || The power company records power consumption at every moment. Annual electricity usage = the integral of power over time. That spinning number on your home meter is essentially an integrator.
- **游戏物理引擎 || Game Physics Engines** — 游戏里的球怎么弹、车怎么飘？物理引擎每帧都在做数值积分：力→加速度→速度→位置。每秒 60 帧，就是每秒做 60 次"切片求和"。 || How does a ball bounce or a car drift in games? The physics engine performs numerical integration every frame: force → acceleration → speed → position. At 60 fps, that's 60 slice-and-sum operations per second.

::panel
### 积分 vs 导数：一对互逆操作 || Integrals vs. Derivatives: inverse operations
| — | 导数（微分） || Derivative (Differentiation) | 积分 || Integral |
| --- | --- | --- |
| 回答的问题 || Question answered | 变化有多快？（速率） || How fast is it changing? (Rate) | 总共累积了多少？（总量） || How much has accumulated? (Total) |
| 图形含义 || Graphical meaning | 曲线上一点的切线斜率 || Slope of the tangent at a point on the curve | 曲线下方围成的面积 || Area enclosed under the curve |
| 操作方向 || Direction | 总量 → 速率（从整体看局部） || Total → Rate (from whole to part) | 速率 → 总量（从局部推整体） || Rate → Total (from part to whole) |
| 日常类比 || Daily analogy | 看速度表读瞬时速度 || Reading instant speed from speedometer | 从速度表推算总路程 || Calculating total distance from speedometer |
| 核心思路 || Core idea | 差商取极限 || Difference quotient → limit | 切片求和取极限 || Slice, sum → limit |

> **剧透：它们是互逆运算 || Spoiler: They Are Inverse Operations**
> 导数把"总量"变成"速率"，积分把"速率"变回"总量"。就像加法和减法、乘法和除法一样——导数和积分互为逆运算。**这个关系是微积分最深刻、最优美的定理**，我们将在第 5 篇揭晓。 || Derivatives turn totals into rates; integrals turn rates back into totals. Just like addition and subtraction — derivatives and integrals are inverse operations. **This relationship is the most profound and elegant theorem in calculus**, which we'll reveal in Part 5.
:::

## #quiz 05 / ✍ Check Yourself :: 你真的理解了吗？ || Do You Really Understand?

不急着看答案，先在纸上试试。 || Don't rush to the answers — try it on paper first.

:::accordion
::panel
### 题 1：一辆车在 3 小时内速度分别是 40、60、80 km/h（每小时恒定），总距离是多少？这本质上是在做什么运算？ || Q1: A car travels at 40, 60, 80 km/h over 3 hours (constant each hour). What is the total distance? What operation is this essentially?
> **答案 || Answer**
> 总距离 = 40×1 + 60×1 + 80×1 = **180 km**。 || Total distance = 40×1 + 60×1 + 80×1 = **180 km**.
> 这就是在做**黎曼和**——把时间切成 3 段，每段用固定速度估计距离，再求和。如果切成更多段（每分钟一个速度值），结果就越接近精确的积分值。 || This is essentially a **Riemann sum** — splitting time into 3 segments, estimating distance with a fixed speed for each, then summing. With more segments (one speed value per minute), the result gets closer to the exact integral.

::panel
### 题 2：∫ 符号里的各部分分别对应黎曼和的什么？写出 ∫₀⁵ 2x dx 中每个符号的含义。 || Q2: What does each part of the ∫ symbol correspond to in a Riemann sum? Write the meaning of each symbol in ∫₀⁵ 2x dx.
> **答案 || Answer**
> **∫** 是拉长的 S（Sum 求和）；**0、5** 是积分的起点和终点；**2x** 是被积函数 f(x)，即每一小条的"高度"；**dx** 是每一小条无穷小的"宽度"。整体含义：把 f(x)=2x 从 x=0 到 x=5 的曲线下方面积加起来。 || **∫** is an elongated S (Sum); **0, 5** are the start and end points; **2x** is the integrand f(x), the height of each strip; **dx** is the infinitesimally small width. Overall: add up the area under f(x)=2x from x=0 to x=5.

::panel
### 题 3：用切片法估算 y = x 从 0 到 6 的面积（切成 3 份，用左端点）。再用三角形面积公式验证精确值。 || Q3: Estimate the area of y = x from 0 to 6 using slicing (3 parts, left endpoints). Then verify the exact value with the triangle area formula.
> **答案 || Answer**
> **切片法**：Δx = 2，三条矩形高分别为 f(0)=0, f(2)=2, f(4)=4。 || **Slicing method**: Δx = 2, the three rectangle heights are f(0)=0, f(2)=2, f(4)=4.
> $$
> \Sigma = 0 \times 2 + 2 \times 2 + 4 \times 2 = 12
> $$
> **精确值**：三角形，底 = 6，高 = 6，面积 = ½ × 6 × 6 = **18**。 || **Exact value**: triangle with base = 6, height = 6, area = ½ × 6 × 6 = **18**.
> 切片估计 12 偏小（每条矮了一截）。切更多份会越来越接近 18。 || The slicing estimate of 12 is too small (each strip is a bit short). More slices will get closer and closer to 18.
:::

## #series-nav 05 / Learning Roadmap :: 系列导航 || Series Guide

你已经掌握了积分的核心思想。下一篇——也是本系列的终章——将揭示导数与积分之间那个令人惊叹的联系。 || You've mastered the core idea of integrals. The next article — the series finale — will reveal the stunning connection between derivatives and integrals.

- [第 1 篇 || Part 1：变化的语言：从速度表到微积分 || The Language of Change: From Speedometers to Calculus](../calculus-intro-change/)
- [第 2 篇 || Part 2：逼近的艺术：极限思想入门 || The Art of Approximation: Introduction to Limits](../calculus-limits/)
- [第 3 篇 || Part 3：导数：捕捉瞬间的变化率 || Derivatives: Capturing the Instantaneous Rate of Change](../calculus-derivatives/)
- **第 4 篇 · 当前 || Part 4 · Current：积分：化零为整的累积术 || Integrals: The Art of Accumulating Infinitesimals**
- [第 5 篇 || Part 5：微积分基本定理：最优美的数学联系 || The Fundamental Theorem of Calculus: The Most Elegant Mathematical Connection](../calculus-fundamental-theorem/)

:::callout { title: "下一篇预告 || Next Up" }
导数和积分看起来完全不同——一个是"缩到无穷小看斜率"，一个是"切成无穷多求面积"。但牛顿和莱布尼茨发现，它们竟然是同一枚硬币的正反面。第 5 篇将带你理解**微积分基本定理**——被誉为数学史上最优美的公式之一。 || Derivatives and integrals seem completely different — one zooms into the infinitely small to find slopes, the other slices into infinitely many pieces to find areas. But Newton and Leibniz discovered they are two sides of the same coin. Part 5 will help you understand the **Fundamental Theorem of Calculus** — hailed as one of the most elegant formulas in the history of mathematics.
:::
