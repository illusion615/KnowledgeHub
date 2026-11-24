---
title: "变化的语言：从速度表到微积分 || The Language of Change: From Speedometers to Calculus"
eyebrow: "微积分系列 · 第一篇 || Calculus Series · Part 1"
brand: "微积分 || Calculus"
date: 2026-04-14
strict_i18n: false
strict_density: true
lead: "你每天都在和\"变化\"打交道——手机电量在掉、气温在升、跑步速度在变。但你有没有想过：数学怎么精确描述这些\"一直在变\"的东西？ || You deal with change every day — phone batteries drain, temperatures rise, running speeds vary. But have you ever wondered: how does math precisely describe things that are constantly changing?"
hero_actions:
  - "开始探索 || Start Exploring | #why-change"
  - "系列导航 || Series Guide | #preview"
panel_label: "你将获得 || You Will Gain"
panel_title: "理解\"变化\"的全新视角 || A Fresh Perspective on Understanding Change"
panel:
  - "发现代数无法描述的变化 || Discover changes that algebra cannot describe"
  - "学会计算平均变化率 || Learn to calculate average rates of change"
  - "体验非线性世界的魅力 || Experience the wonder of the nonlinear world"
  - "预见微积分要解决的大问题 || Preview the big problems calculus will solve"
metrics:
  - "系列编号 || Series # | 1 / 5 | 入门篇 || Introduction"
  - "前置知识 || Prerequisites | 初中数学 || Middle School Math | 函数、坐标系 || Functions, Coordinates"
  - "难度 || Difficulty | ★☆☆☆☆ | 零基础可读 || No prerequisites needed"
  - "阅读时间 || Reading Time | ~12 min | 含互动思考 || Includes interactive thinking"
style:
  accent: "#fb7185"
---

## #why-change 01 / A Problem You Face Every Day :: 为什么代数不够用？ || Why Isn't Algebra Enough?

想象一下：你在高速公路上开车，仪表盘上的速度从 60 km/h 一路飙到 120 km/h。你走了 100 公里。问：你用了多长时间？ || Imagine this: you're driving on a highway, and the speedometer climbs from 60 km/h all the way to 120 km/h. You've traveled 100 km. Question: how long did it take?

:::callout { title: "问题出在哪？ || Where's the Problem?" }
如果你一直保持 60 km/h 匀速，答案很简单：100 ÷ 60 ≈ 1.67 小时。但速度一直在变——从 60 到 120，中间还可能减速过。**用一个固定的数字去描述一个一直在变的量，这就是代数的局限。** || If you maintained a constant 60 km/h, the answer is simple: 100 ÷ 60 ≈ 1.67 hours. But the speed keeps changing — from 60 to 120, possibly slowing down in between. **Using a fixed number to describe a constantly changing quantity — that is the limitation of algebra.**
:::

:::accordion
::panel
### 生活中的三种"变化" || Three Types of Change in Daily Life
- **手机电量 || Phone Battery** — 打游戏时电量掉得飞快，待机时几乎不动。电量的"减少速度"不是常数——它取决于你正在做什么。你没法用一个简单的公式"每小时掉 10%"来精确预测。 || Battery drains fast when gaming, barely moves on standby. The drain rate isn't constant — it depends on what you're doing. You can't predict it with a simple formula like 'loses 10% per hour.'
- **气温变化 || Temperature Change** — 早晨 6 点到中午 12 点，气温从 15°C 上升到 30°C。但它不是匀速上升的——10 点以后升得更快。天气预报需要知道每一刻的升温速率。 || From 6 AM to noon, temperature rises from 15°C to 30°C. But it doesn't rise at a constant rate — it speeds up after 10 AM. Weather forecasts need to know the warming rate at every moment.
- **火箭升空 || Rocket Launch** — 火箭刚点火时速度几乎为零，几分钟后速度达到 28,000 km/h。它的加速度也不是恒定的——随着燃料燃烧变轻，加速越来越快。这就是"变化的变化"。 || A rocket's speed is near zero at ignition but reaches 28,000 km/h within minutes. Its acceleration isn't constant either — as fuel burns and the rocket gets lighter, it accelerates faster. This is 'the change of change.'

::panel
### 代数能做什么、不能做什么？ || What Can and Can't Algebra Do?
| 情境 || Scenario | 代数能解决 || Algebra Can Solve | 需要微积分 || Needs Calculus |
| --- | --- | --- |
| 匀速行驶 100 公里用时 || Time for 100 km at constant speed | ✅ 距离 ÷ 速度 || ✅ Distance ÷ Speed | — |
| 变速行驶的总距离 || Total distance at varying speed | — | ✅ 需要"积分" || ✅ Needs Integration |
| 直线斜率 || Slope of a straight line | ✅ Δy ÷ Δx | — |
| 曲线上某一点的斜率 || Slope at a point on a curve | — | ✅ 需要"导数" || ✅ Needs Derivatives |
| 矩形面积 || Area of a rectangle | ✅ 长 × 宽 || ✅ Length × Width | — |
| 曲线围成的面积 || Area enclosed by a curve | — | ✅ 需要"积分" || ✅ Needs Integration |

> **一句话总结 || In One Sentence**
> 代数处理的是**静态**和**匀速**的世界。微积分处理的是**持续变化**的世界——而我们生活的世界，几乎所有东西都在变。 || Algebra handles the world of **static** and **constant** things. Calculus handles the world of **continuous change** — and in our world, almost everything is changing.
:::

## #daily-change 02 / Feeling the Rate of Change :: 身边就有微积分的影子 || Calculus Is All Around You

在你正式接触微积分的公式之前，先来感受一下"变化率"这个概念到底意味着什么。 || Before you encounter any calculus formulas, let's first feel what the concept of 'rate of change' really means.

:::accordion
::panel { open: true }
### 场景一：冰淇淋融化实验 || Scenario 1: Ice Cream Melting Experiment
夏天你买了一支冰淇淋，放在桌上。你每隔 5 分钟量一次它的重量： || In summer, you buy an ice cream and leave it on the table. You measure its weight every 5 minutes:

| 时间 (分钟) || Time (min) | 重量 (克) || Weight (g) | 减少了多少？ || How much less? | 融化速率 (克/分钟) || Melting rate (g/min) |
| --- | --- | --- | --- |
| 0 | 100 | — | — |
| 5 | 92 | 8 | 1.6 |
| 10 | 80 | 12 | 2.4 |
| 15 | 65 | 15 | 3.0 |
| 20 | 48 | 17 | 3.4 |
| 25 | 30 | 18 | 3.6 |

> **发现规律了吗？ || See the pattern?**
> 冰淇淋越化越快！刚开始 5 分钟只少了 8 克，后来 5 分钟就少了 18 克。**融化速率**本身也在变——这就是"变化率在变化"。在微积分里，研究这件事叫做**求导数**。 || The ice cream melts faster and faster! In the first 5 minutes it only lost 8 grams, but later it lost 18 grams in 5 minutes. The **melting rate** itself is changing — this is 'the rate of change is changing.' In calculus, studying this is called **finding the derivative**.

::panel
### 场景二：骑车上学的速度变化 || Scenario 2: Speed Changes While Cycling to School
想象你骑自行车从家到学校： || Imagine riding your bike from home to school:

1

**起步阶段 || Starting Phase**

从停着到骑起来——速度从 0 慢慢加到 15 km/h。你在"加速"。 || From standing still to pedaling — speed gradually increases from 0 to 15 km/h. You are accelerating.

2

**匀速巡航 || Cruising at Constant Speed**

在平路上稳定骑行——速度大约保持 15 km/h。这时候代数就够用了。 || Riding steadily on flat road — speed stays around 15 km/h. Algebra works fine here.

3

**上坡减速 || Slowing Down Uphill**

遇到一个上坡——速度从 15 km/h 降到 8 km/h。你在"减速"，也就是加速度为负。 || You hit a hill — speed drops from 15 km/h to 8 km/h. You are decelerating, meaning negative acceleration.

4

**下坡冲刺 || Downhill Sprint**

过了坡顶开始下坡——速度越来越快，从 8 飙到 25 km/h！减速变成了快速加速。 || Past the hilltop, you go downhill — speed increases rapidly from 8 to 25 km/h! Deceleration turns into rapid acceleration.

5

**到达刹车 || Braking at Arrival**

到学校门口捏刹车——急减速，从 25 降到 0。 || At the school gate you hit the brakes — rapid deceleration from 25 to 0.

整个过程中，你的速度一刻没停地在变。那个问题来了：**你总共骑了多远？**不能简单地拿"平均速度 × 时间"，因为速度一直在变。这个问题的精确回答，就需要**积分**。 || Throughout the entire trip, your speed never stops changing. Here comes the question: **how far did you ride in total?** You can't simply use 'average speed × time' because the speed keeps changing. The precise answer to this question requires **integration**.

::panel
### 场景三：植物的生长曲线 || Scenario 3: Plant Growth Curve
种一颗向日葵种子，每天量它的高度。你会发现： || Plant a sunflower seed and measure its height every day. You will find:

- **第 1–5 天：慢慢冒芽 || Days 1–5: Slowly Sprouting** — 种子在地下吸水膨胀，地上看不到什么变化。生长速率 ≈ 0.2 cm/天。 || The seed absorbs water and swells underground — no visible change above ground. Growth rate ≈ 0.2 cm/day.
- **第 10–30 天：疯狂拔高 || Days 10–30: Rapid Growth Spurt** — 茎秆快速伸长，每天能长 3–5 cm！这是生长速率的"峰值"。 || The stem elongates rapidly, growing 3–5 cm per day! This is the peak growth rate.
- **第 40–60 天：趋于停止 || Days 40–60: Growth Stops** — 开花后高度几乎不再变化，生长速率降回接近 0。 || After blooming, height barely changes and growth rate drops back to nearly 0.

如果把高度画成图，你会得到一条 S 形曲线。这条曲线上每一点的"陡峭程度"就是那一刻的**生长速率**——这正是**导数**要刻画的东西。 || If you plot the height on a graph, you get an S-shaped curve. The steepness at each point on this curve is the **growth rate** at that moment — this is exactly what a **derivative** describes.
:::

## #avg-rate 03 / Tools We Already Have :: 平均变化率：微积分的起点 || Average Rate of Change: The Starting Point of Calculus

在发明新工具之前，先把手头的旧工具搞清楚。"平均变化率"你早就会算了，只是可能不知道它叫这个名字。 || Before inventing new tools, let's master the ones we already have. You've been calculating 'average rate of change' for a while — you just might not know it by that name.

:::accordion
::panel { open: true }
### 什么是平均变化率？ || What Is the Average Rate of Change?
最简单的例子：你骑车 2 小时走了 30 公里，那你的**平均速度**就是： || The simplest example: you cycled 30 km in 2 hours, so your **average speed** is:

$$
v_{\text{avg}} = \frac{d}{t} = \frac{30\,\text{km}}{2\,\text{h}} = 15\,\text{km/h}
$$

写成更一般的数学语言： || In more general mathematical language:

$$
\overline{r} = \frac{\Delta y}{\Delta x} = \frac{y_2 - y_1}{x_2 - x_1}
$$

这里 Δ（读作 delta）是希腊字母，意思是"变化量"。Δy 就是 y 的变化量，Δx 就是 x 的变化量。 || Here Δ (read as 'delta') is a Greek letter meaning 'amount of change.' Δy is the change in y, and Δx is the change in x.

> **你可能已经发现了 || You Might Have Already Noticed**
> 这不就是**直线的斜率公式**吗？没错！斜率就是一种变化率。在坐标系里，把两个数据点连成直线，这条线的斜率就是这段区间的平均变化率。 || Isn't this just the **slope formula for a straight line**? Exactly! Slope is a type of rate of change. On a coordinate plane, connect two data points with a straight line, and the slope of that line is the average rate of change over that interval.

::panel
### 图形理解：割线的斜率 || Visual Understanding: Slope of a Secant Line
时间 t

距离 s

A (t₁, s₁)

B (t₂, s₂)

割线: 斜率 = Δs/Δt

Δt

Δs

实际轨迹

图中红色曲线是你实际的行进轨迹（距离随时间变化），蓝色虚线（**割线**）连接了起点 A 和终点 B。割线的斜率 = Δs / Δt = 平均速度。 || The red curve shows your actual trajectory (distance over time), and the blue dashed line (the **secant line**) connects point A to point B. The slope of the secant = Δs / Δt = average speed.

但注意：曲线有时候比割线陡（你实际速度比平均快），有时候比割线平（你实际速度比平均慢）。**平均速度抹掉了中间所有的细节。** || But notice: sometimes the curve is steeper than the secant (your actual speed is faster than average), and sometimes flatter (your actual speed is slower). **Average speed erases all the details in between.**

::panel
### 动手算一算 || Let's Do the Math
回到冰淇淋的例子。我们算一算不同区间的平均融化速率： || Back to the ice cream example. Let's calculate the average melting rate over different intervals:

| 区间 || Interval | Δ重量 (克) || ΔWeight (g) | Δ时间 (分) || ΔTime (min) | 平均速率 (克/分) || Avg. Rate (g/min) |
| --- | --- | --- | --- |
| 0–25 分钟 (全程) || 0–25 min (full) | 70 | 25 | 2.8 |
| 0–10 分钟 (前半) || 0–10 min (first half) | 20 | 10 | 2.0 |
| 15–25 分钟 (后半) || 15–25 min (second half) | 35 | 10 | 3.5 |

看到了吗？同一支冰淇淋，取不同的区间，平均速率完全不同。**区间越小，数据越能反映那一刻的真实情况。** || See that? Same ice cream, different intervals, completely different average rates. **The smaller the interval, the better the data reflects what's actually happening at that moment.**

> **微积分的核心思路就在这里 || This Is the Core Idea of Calculus**
> 如果我们把区间缩得越来越小——从 10 分钟变成 1 分钟，再变成 1 秒钟，再变成 0.001 秒钟……当区间趋近于零时，我们就得到了**瞬时变化率**。这就是**导数**的定义，也是微积分最核心的思想：**极限**。 || If we keep shrinking the interval — from 10 minutes to 1 minute, then 1 second, then 0.001 seconds... when the interval approaches zero, we get the **instantaneous rate of change**. This is the definition of the **derivative**, and also the most fundamental idea in calculus: the **limit**.
:::

## #nonlinear 04 / Why Isn't the World a Straight Line? :: 非线性：真实世界的默认模式 || Nonlinearity: The Default Mode of the Real World

初中数学里，我们经常画直线图——y = kx + b，方便、好算。但真实世界几乎没有什么是严格的直线。 || In middle school math, we often draw straight-line graphs — y = kx + b, convenient and easy to calculate. But in the real world, almost nothing is strictly a straight line.

:::accordion
::panel { open: true }
### 直线 vs 曲线：四个对比 || Straight Lines vs Curves: Four Comparisons
- **银行利息 || Bank Interest** — **简单利息**（直线）：每年存 100 元就加 5 元利息。**复利**（曲线）：利息也产生利息，增长越来越快。1000 年后复利比简单利息多出天文数字——这就是指数增长。 || **Simple interest** (straight line): deposit 100 yuan and earn 5 yuan interest per year. **Compound interest** (curve): interest earns interest, growing faster and faster. After 1000 years, compound interest exceeds simple interest by astronomical amounts — this is exponential growth.
- **投篮轨迹 || Basketball Trajectory** — 篮球出手后走的是**抛物线**，不是直线。重力让球先升后降，轨迹是 y = ax² + bx + c 的曲线。教练要知道"出手角度和力度怎么影响进球概率"，就需要研究这条曲线。 || After being shot, a basketball follows a **parabola**, not a straight line. Gravity makes it rise then fall, tracing a curve y = ax² + bx + c. To understand how release angle and force affect scoring probability, coaches need to study this curve.
- **病毒传播 || Virus Spread** — 疫情初期感染人数翻倍增长（指数），但随着免疫人群增多，增速放缓，最终趋于饱和——整体呈 S 形曲线，跟向日葵生长一样。 || Early in an epidemic, infections double exponentially. But as more people become immune, growth slows and eventually plateaus — forming an S-shaped curve, just like sunflower growth.
- **声波振动 || Sound Waves** — 音叉发出的声音是正弦波 y = sin(t)，它不断来回波动。用直线根本无法描述这种"周期性变化"。 || A tuning fork produces a sine wave y = sin(t), constantly oscillating back and forth. A straight line simply cannot describe this kind of periodic change.

::panel
### 曲线带来的两个根本问题 || Two Fundamental Problems Curves Bring
一旦我们面对曲线而不是直线，两个在代数里很简单的问题突然变得很难： || Once we face curves instead of straight lines, two problems that are simple in algebra suddenly become very hard:

?

**问题一：曲线上某一点的"方向"是什么？ || Problem 1: What is the direction at a point on a curve?**

直线的斜率处处一样。但曲线每一点的"陡峭程度"都不同——它的"方向"一直在变。怎么定义一个点的斜率？这引出了**导数**。 || A straight line has the same slope everywhere. But on a curve, the steepness at each point is different — its direction keeps changing. How do we define the slope at a single point? This leads to the **derivative**.

?

**问题二：曲线下方围成的面积是多少？ || Problem 2: What is the area under a curve?**

矩形面积 = 长 × 宽。三角形、梯形也有公式。但如果一条弯弯扭扭的曲线和 x 轴围成了一块奇怪的形状，面积怎么算？这引出了**积分**。 || Rectangle area = length × width. Triangles and trapezoids have formulas too. But if a wavy curve and the x-axis form an oddly shaped region, how do you calculate the area? This leads to **integration**.

> **微积分就是回答这两个问题的数学 || Calculus Is the Math That Answers These Two Questions**
> **导数**回答"某一瞬间变化有多快"，**积分**回答"所有变化加起来总共多少"。它们是微积分的两大支柱，而且——剧透一下——它们之间有一个令人惊叹的深层联系。 || The **derivative** answers 'how fast is something changing at a given instant,' and **integration** answers 'what is the total of all the changes added up.' They are the two pillars of calculus, and — spoiler alert — there is an astonishing deep connection between them.
:::

## #quiz 05 / ✍ Check Yourself :: 你真的理解了吗？ || Do You Really Understand?

试试回答下面的问题，不急着看答案——先自己想 30 秒。 || Try answering the questions below — don't rush to the answers. Think for 30 seconds first.

:::accordion
::panel
### 题 1：小明骑车 3 小时走了 45 km，他的平均速度是多少？能不能说他"每时每刻"都在以这个速度骑行？ || Q1: Xiao Ming cycled 45 km in 3 hours. What is his average speed? Can we say he was riding at this speed at every moment?
> **答案 || Answer**
> 平均速度 = 45 ÷ 3 = **15 km/h**。但不能说他每时每刻都以 15 km/h 骑行——他可能起步慢、中间快、上坡减速。平均速度抹掉了中间所有细节，这正是代数的局限，微积分（导数）才能描述"每一瞬间"的真实速度。 || Average speed = 45 ÷ 3 = **15 km/h**. But we cannot say he was riding at 15 km/h at every moment — he might start slow, speed up in the middle, and slow down on hills. Average speed erases all the details in between. This is exactly the limitation of algebra; calculus (derivatives) can describe the true speed at every instant.

::panel
### 题 2：为什么说"曲线上某一点的斜率"代数无法直接计算？ || Q2: Why can't algebra directly calculate the slope at a point on a curve?
> **答案 || Answer**
> 斜率公式 Δy/Δx 需要**两个点**。在一条直线上处处相同，取任意两点都一样。但曲线上每一点的"陡峭程度"都不同——取不同的两点，算出的斜率不一样。只有把两点无限靠近到"一个点"（极限的思想），才能定义那一点的斜率，这就是**导数**。 || The slope formula Δy/Δx requires **two points**. On a straight line, the slope is the same everywhere — any two points give the same result. But on a curve, the steepness at each point is different — different pairs of points give different slopes. Only by bringing two points infinitely close together (the idea of limits) can we define the slope at a single point. This is the **derivative**.

::panel
### 题 3：冰淇淋融化实验中，前 5 分钟融化 8 克，后 5 分钟（20–25 分钟）融化 18 克。为什么后面融化得更快？这体现了微积分的什么概念？ || Q3: In the ice cream experiment, the first 5 minutes melted 8g while the last 5 minutes (20–25 min) melted 18g. Why does it melt faster later? What calculus concept does this illustrate?
> **答案 || Answer**
> 因为冰淇淋越化表面积越大、暴露越多，温差导致融化加速。融化速率本身在变——"变化率在变化"。这体现的是**导数**（变化率）本身也是一个变化的函数，而导数的导数叫做**二阶导数**（加速度的概念来源）。 || Because as the ice cream melts, the surface area increases and more is exposed, causing temperature differences to accelerate melting. The melting rate itself is changing — 'the rate of change is changing.' This illustrates that the **derivative** (rate of change) is itself a changing function, and the derivative of a derivative is called the **second derivative** (the origin of the concept of acceleration).
:::

## #preview 05 / Learning Roadmap :: 后面还有什么？ || What Comes Next?

这是微积分系列的第一篇。你已经理解了"为什么需要微积分"和"平均变化率"这个起点。接下来的四篇会一步步带你深入。 || This is the first article in the calculus series. You now understand why we need calculus and the starting point of average rate of change. The next four articles will take you deeper step by step.

- **第 1 篇 · 当前 || Part 1 · Current：变化的语言：从速度表到微积分 || The Language of Change: From Speedometers to Calculus**
- [第 2 篇 || Part 2：逼近的艺术：极限思想入门 || The Art of Approaching: Introduction to Limits](../calculus-limits/)
- [第 3 篇 || Part 3：导数：捕捉瞬间的变化率 || Derivatives: Capturing the Instantaneous Rate of Change](../calculus-derivatives/)
- [第 4 篇 || Part 4：积分：化零为整的累积术 || Integration: The Art of Accumulating from Pieces](../calculus-integrals/)
- [第 5 篇 || Part 5：微积分基本定理：最优美的数学联系 || The Fundamental Theorem of Calculus: The Most Elegant Connection in Math](../calculus-fundamental-theorem/)

:::callout { title: "下一篇预告 || Next Article Preview" }
第 2 篇我们将探索**极限**——当区间缩到无穷小时会发生什么？芝诺的乌龟真的追不上吗？1/2 + 1/4 + 1/8 + … 加到无穷等于多少？这些看似哲学的问题，就是微积分的基石。 || In Part 2, we will explore **limits** — what happens when the interval shrinks to infinitely small? Can Zeno's tortoise really never be caught? What does 1/2 + 1/4 + 1/8 + … add up to? These seemingly philosophical questions are the foundation of calculus.
:::
