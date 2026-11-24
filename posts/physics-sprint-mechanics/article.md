---
title: "力学冲刺：正交分解、匀变速、圆周运动、胡克定律与功能关系 || Mechanics Sprint: Decomposition, Kinematics, Circular Motion, Hooke's Law, and Energy"
eyebrow: "力学 · 四校自招冲刺 || Mechanics · Selective-Exam Sprint"
brand: "力学 || Mechanics"
date: 2026-06-23
strict_i18n: false
strict_density: true
lead: "为冲刺四校联考自招而写。六个高中先修高频考点，每个都给方法步骤、必要推导、带详解例题与易错清单，目标是用最短时间补齐短板。 || Built for the top-four selective-exam sprint. Six high-frequency, high-school-preview topics, each with method steps, key derivations, worked examples, and a pitfall list."
hero_actions:
  - "从正交分解开始 || Start with Decomposition | #decompose"
  - "直接看速查表 || Jump to Cheat Sheet | #cheatsheet"
panel_label: "你将拿到 || You Will Gain"
panel_title: "六个考点的「方法 + 例题 + 易错」 || Method + Examples + Pitfalls for Six Topics"
panel:
  - "力的正交分解与斜面模型 || Orthogonal decomposition and the inclined-plane model"
  - "匀变速直线运动三式与推论 || Three kinematic equations and key corollaries"
  - "重力加速度、自由落体与竖直上抛 || Gravity g, free fall, and vertical projectile"
  - "动能、势能、动能定理与机械能守恒 || Kinetic/potential energy, work-energy theorem, conservation"
  - "圆周运动：线速度、角速度与向心力 || Circular motion: linear/angular speed and centripetal force"
  - "胡克定律：弹簧弹力 F = kx || Hooke's law: spring force F = kx"
metrics:
  - "覆盖考点 || Topics | 6 | 高频先修点 || Preview Topics"
  - "例题 || Worked Examples | 14 | 均带详解 || All Solved"
  - "前置 || Prereq | 中考力学 || Zhongkao Mechanics | 受力 / 速度 || Forces / Speed"
  - "建议用时 || Time | ~35 min | 含动手算 || With Practice"
style:
  accent: "#0284c7"
---

## #decompose 01 / Splitting a Force into Two Axes :: 力的正交分解：多力平衡的通用解法 || Orthogonal Decomposition: The General Tool for Equilibrium

当物体受三个或更多不在一条直线上的力时，逐一作平行四边形太慢。正交分解把每个力投影到互相垂直的 x、y 轴上，把一道二维平衡题变成两道一维方程。 || When a body feels three or more non-collinear forces, drawing parallelograms is slow. Decomposition projects every force onto perpendicular x and y axes, turning one 2-D problem into two 1-D equations.

:::accordion
::panel { open: true }
### 四步流程：建系、投影、列方程、求解 || Four Steps: Axes, Project, Equations, Solve
正交分解的全部技巧就在「建系」这一步——让尽量多的力直接落在坐标轴上，剩下要分解的力最少。

1. **建立直角坐标系** — 水平面问题用水平 / 竖直轴；斜面问题改用「沿斜面 / 垂直斜面」轴，这样支持力、下滑分量都落在轴上。
2. **把斜的力正交投影** — 与某轴成 θ 角的力 F，贴着该轴的分量是 F cosθ，垂直该轴的分量是 F sinθ。
3. **分轴列平衡方程** — 物体平衡（静止或匀速）时，两轴上分量分别抵消：ΣFx = 0，ΣFy = 0。
4. **解方程求未知量** — 两个方程最多解两个未知量（如支持力 N 与摩擦力 f）。

$$
F_x = F\cos\theta,\qquad F_y = F\sin\theta
$$

::panel
### 斜面模型：重力的两个分量 || Inclined Plane: Decomposing Gravity
斜面是自招最高频的分解场景。倾角 θ 的斜面上，重力 G = mg 竖直向下，沿「斜面 / 垂直斜面」两轴分解：

> **📐 重力沿斜面分解**
> 沿斜面方向（使物体下滑）的分量：G∥ = mg sinθ。
> 垂直斜面方向（把物体压向斜面）的分量：G⊥ = mg cosθ。
> 记忆抓手：倾角 θ 越大，越「陡」、越容易下滑，所以「下滑分量」必须随 θ 增大——它对应的是 sinθ。垂直压紧的分量对应 cosθ。

$$
G_{\parallel} = mg\sin\theta,\qquad G_{\perp} = mg\cos\theta
$$

::panel
### 例题：斜面静止与斜向拉力 || Examples: Static Incline and Angled Pull
例 1

倾角 37° 的斜面上，质量 2 kg 的木块恰好静止。取 g = 10 m/s²，sin37° = 0.6，cos37° = 0.8。求斜面对木块的支持力 N 与摩擦力 f。

沿斜面 / 垂直斜面建系，重力分解为 mg sinθ（沿斜面向下）与 mg cosθ（压向斜面）。

**垂直斜面方向：**N = mg cosθ = 2 × 10 × 0.8 = **16 N**。

**沿斜面方向：**静止，故摩擦力平衡下滑分量，f = mg sinθ = 2 × 10 × 0.6 = **12 N**，方向沿斜面向上。

例 2

水平地面上质量 5 kg 的箱子，受与水平方向成 30° 斜向上的拉力 F = 20 N，恰好匀速移动。取 g = 10 m/s²。求地面支持力 N 与摩擦力 f。

用水平 / 竖直轴。拉力分解为 F cos30°（水平）与 F sin30°（竖直向上）。

**水平方向：**匀速，f = F cos30° = 20 × 0.866 ≈ **17.3 N**。

**竖直方向：**N + F sin30° = mg ⟹ N = 50 − 20 × 0.5 = **40 N**。

注意 N = 40 N < mg = 50 N：斜向上的拉力替地面分担了一部分重力。

**⚠ 易错提醒**

- **分解 ≠ 多算一个力。**分量只是同一个力的两个投影，列方程时用分量就不要再把原力重复计入。
- **sin / cos 不要死背。**看分量与已知角是「邻边（cosθ）」还是「对边（sinθ）」；斜面下滑分量永远是 sinθ。
- **坐标系要会选。**斜面题沿斜面建系最省事，硬套水平竖直会多分解一次。
- **有斜向力时 N ≠ mg。**竖直方向上还有拉力 / 压力的分量在参与平衡。
:::

## #kinematics 02 / Constant-Acceleration Motion :: 匀变速直线运动：三式与四条推论 || Uniform Acceleration: Three Equations, Four Corollaries

加速度大小、方向都不变的直线运动。三条基本公式加几条推论，覆盖刹车、自由落体、追及相遇等绝大多数运动学题。 || Straight-line motion with constant acceleration. Three core equations plus a few corollaries cover braking, free fall, and most chase problems.

:::accordion
::panel { open: true }
### 三大基本公式与选式技巧 || The Three Core Equations
设初速度 v₀、末速度 v、加速度 a、时间 t、位移 x，规定一个正方向后，三式如下：

$$
v = v_0 + at
$$

$$
x = v_0 t + \tfrac{1}{2}at^2
$$

$$
v^2 - v_0^2 = 2ax
$$

> **选哪条公式？看「缺哪个量」**
> 三式各缺一个量：第一式不含位移 x，第二式不含末速度 v，第三式不含时间 t。题目不问、也没给的那个量，就选「不含它」的那条公式，可省去联立。

::panel
### 四条高频推论：平均速度与逐差法 || Four Corollaries: Average Speed and Equal-Time Differences
> **📐 自招常用的四条推论**
> ① 平均速度（仅匀变速成立）：v̅ = (v₀ + v) / 2 = x / t。
> ② 中间时刻速度等于全程平均速度：v(t/2) = (v₀ + v) / 2。
> ③ 逐差法：连续相等时间 T 内，相邻位移之差恒定，Δx = aT²。多段时用 (x₃+x₄) − (x₁+x₂) = 4aT² 提高精度。
> ④ 初速度为零的匀加速比例：相等时间末速度比 1:2:3…；从起点起位移比 1:4:9…；各段位移比 1:3:5:7…（连续奇数）。

$$
\bar v = \dfrac{v_0 + v}{2} = \dfrac{x}{t},\qquad \Delta x = aT^2
$$

::panel
### 例题：刹车陷阱与逐差求 a || Examples: The Braking Trap and Finding a
例 3

汽车以 20 m/s 行驶，刹车后加速度大小为 5 m/s²。求刹车后 6 s 内汽车的位移。

**先判断是否中途停下：**停车时间 t₀ = v₀ / a = 20 / 5 = 4 s < 6 s，说明第 4 秒末就已停止，后 2 s 静止不动。

**实际位移用前 4 s（到停止为止）算：**x = v₀² / (2a) = 20² / (2 × 5) = 400 / 10 = **40 m**。

**反例（错解）：**直接代 t = 6 得 x = v₀t − ½at² = 120 − 90 = 30 m，比正确值 40 m 还小，明显荒谬——刹停后公式已失效。

例 4

某物体做匀加速直线运动，连续两个 2 s 内的位移分别为 12 m 和 20 m。求加速度 a 与第一段开始时的速度 v₀。

**逐差法求 a：**Δx = aT² ⟹ 20 − 12 = a × 2² ⟹ a = **2 m/s²**。

**代回第一段：**x₁ = v₀T + ½aT² ⟹ 12 = 2v₀ + ½ × 2 × 4 ⟹ 12 = 2v₀ + 4 ⟹ v₀ = **4 m/s**。

**⚠ 易错提醒**

- **先定正方向。**减速时加速度取负号，代入公式时连同符号一起算。
- **刹车 / 上抛先判断「会不会中途停 / 返回」。**超过停车时间后物体不动，不能再套公式。
- **平均速度 = (v₀+v)/2 只对匀变速成立**，变加速运动不能用。
:::

## #gravity 03 / The Bridge from Force to Motion :: 重力加速度：自由落体与竖直上抛 || Gravity g: Free Fall and Vertical Projectile

重力加速度 g 是只受重力时的加速度。把它代入匀变速三式，就得到自由落体与竖直上抛的全部公式。 || g is the acceleration when only gravity acts. Substituting it into the kinematic equations yields all free-fall and vertical-projectile formulas.

:::accordion
::panel { open: true }
### g 的本质：定值、方向与质量无关 || The Nature of g: Constant and Mass-Independent
↓

**定义与方向**

物体只受重力时的加速度，方向竖直向下。这是它与「速度」「重力」最本质的区别——它是变化率。

🔢

**数值**

g ≈ 9.8 m/s²，做题常取 10 m/s²。月球表面约 1.6 m/s²。

⚖

**重力 G = mg**

质量 m（kg）是物体属性、处处不变；重力 G（N）随 g 变化，两者不可混用。

🌍

**g 会变（拔高）**

同一地球，纬度越高 g 略大（赤道最小、两极最大）；高度越高 g 越小。

> **轻重物体下落一样快**
> 忽略空气阻力时，自由落体加速度都等于 g，与质量无关。所以铁球和羽毛在真空管里同时落地——这是伽利略推翻「重者先落」的核心结论。

::panel
### 自由落体与竖直上抛公式 || Free Fall and Vertical Projectile Formulas
**自由落体**是初速度为零、加速度为 g 的匀加速运动。把 v₀ = 0、a = g 代入三式：

$$
v = gt,\qquad h = \tfrac{1}{2}gt^2,\qquad v^2 = 2gh
$$

> **📐 竖直上抛：全程加速度都是 g 向下**
> 以 v₀ 竖直上抛，上升阶段减速、下降阶段加速，但加速度始终是 g、方向竖直向下，可当作一个统一的匀变速过程处理。
> 到最高点时 v = 0，上升时间 t↑ = v₀ / g，最大高度 H = v₀² / (2g)。
> 对称性：上升和下落经过同一高度时速率相等、时间相等，回到抛出点的总时间 t = 2v₀ / g。

$$
H = \dfrac{v_0^2}{2g},\qquad t_{\text{总}} = \dfrac{2v_0}{g}
$$

::panel
### 例题：自由落体与竖直上抛 || Examples: Free Fall and Projectile
例 5

物体自由下落，落地时速度为 30 m/s。取 g = 10 m/s²，求下落高度 h 与下落时间 t。

**时间：**v = gt ⟹ t = 30 / 10 = **3 s**。

**高度：**h = v² / (2g) = 900 / 20 = **45 m**（或 h = ½gt² = ½ × 10 × 9 = 45 m）。

例 6

以 20 m/s 竖直上抛一小球。取 g = 10 m/s²，求上升的最大高度 H 与回到抛出点的总时间。

**最大高度：**H = v₀² / (2g) = 400 / 20 = **20 m**。

**总时间：**t = 2v₀ / g = 40 / 10 = **4 s**。

**⚠ 易错提醒**

- **g 是定值，不随质量改变。**题目里「越重越快」一定是没忽略空气阻力的情形，自招默认忽略阻力。
- **最高点 v = 0，但 a = g ≠ 0。**那一瞬间小球仍在加速向下。
- **分清位移与路程。**上抛回到原点，位移为 0、路程为 2H。
:::

## #energy 04 / Replacing Force Analysis with Work :: 动能、势能与功能关系 || Kinetic Energy, Potential Energy, and Their Theorems

动能定理和机械能守恒把「力做功」与「速度变化」直接挂钩。涉及变力、曲线路径或只问速度时，往往比牛顿定律快得多。 || The work-energy theorem and conservation of mechanical energy link work to speed change directly — often faster than Newton's laws for variable forces or curved paths.

:::accordion
::panel { open: true }
### 三个能量公式 || The Three Energy Formulas
🏎

**动能 Eₖ**

Eₖ = ½mv²。标量，恒 ≥ 0；v 要平方，速度翻倍动能变 4 倍。

⛰

**重力势能 Eₙ**

Eₙ = mgh。相对所选零势能面，可正可负；h 是相对参考面的高度。

🏹

**弹性势能**

形变量越大、劲度越大则越大（定性掌握即可）；弹簧拉伸或压缩都储存它。

💪

**功 W = Fs cosα**

力与位移夹角 α = 90° 时不做功（支持力、向心力都不做功）。

$$
E_k = \tfrac{1}{2}mv^2,\qquad E_p = mgh
$$

::panel
### 动能定理与机械能守恒 || Work-Energy Theorem and Conservation
> **📐 动能定理：合外力做的总功 = 动能变化**
> W合 = Eₖ₂ − Eₖ₁ = ½mv₂² − ½mv₁²。这里 W合 是所有力（重力、摩擦、拉力…）做功的代数和。
> 适用范围比机械能守恒广：有摩擦、有外力时仍然成立，是冲刺阶段最该练熟的工具。

> **📐 机械能守恒：只有重力（或弹力）做功时**
> 当只有重力 / 弹力做功（无摩擦、无外部拉力推力）时，动能与势能可以互相转化但总量不变：
> ½mv₁² + mgh₁ = ½mv₂² + mgh₂。

$$
W_{\text{合}} = \tfrac{1}{2}mv_2^2 - \tfrac{1}{2}mv_1^2
$$

$$
\tfrac{1}{2}mv_1^2 + mgh_1 = \tfrac{1}{2}mv_2^2 + mgh_2
$$

::panel
### 例题：动能定理、守恒与含摩擦 || Examples: Theorem, Conservation, and Friction
例 7

质量 2 kg 的物体以 6 m/s 的初速度滑上粗糙水平面，滑行 4 m 后停下。求物体受到的摩擦力 f。

水平面上只有摩擦力做功（负功）。由动能定理：

−f·x = 0 − ½mv₀² ⟹ −f × 4 = −½ × 2 × 6² = −36 ⟹ f = **9 N**。

例 8

光滑斜面顶端、距底端竖直高度 1.8 m 处，物体由静止释放。取 g = 10 m/s²，求滑到底端的速度。

斜面光滑，只有重力做功，机械能守恒：

mgh = ½mv² ⟹ v = √(2gh) = √(2 × 10 × 1.8) = **6 m/s**（结果与质量、与斜面倾角都无关）。

例 9

质量 1 kg 的物体从高 5 m 的粗糙斜面顶端由静止滑下，到底端速度为 8 m/s。取 g = 10 m/s²，求下滑过程中摩擦力做的功 W₌。

有摩擦，用动能定理（重力做正功 mgh，摩擦做负功 W₌）：

mgh + W₌ = ½mv² ⟹ 1 × 10 × 5 + W₌ = ½ × 1 × 64 ⟹ 50 + W₌ = 32 ⟹ W₌ = **−18 J**。

负号表示摩擦力做负功，这 18 J 机械能转化为内能。

**⚠ 易错提醒**

- **动能里的 ½ 不能漏，v 要平方**；动能是标量、没有方向，恒为正。
- **用势能前先选定零势能面**，h 是相对该面的高度。
- **有摩擦 / 外力时不能用机械能守恒**，要改用动能定理（更通用）。
- **与位移垂直的力不做功**，如支持力、绳的张力（圆周运动中）、向心力。
:::

## #circular 05 / Bending Motion into a Circle :: 圆周运动：线速度、角速度与向心力 || Circular Motion: Linear Speed, Angular Speed, and Centripetal Force

物体沿圆轨迹运动时，方向时刻改变，因此即使速率不变也存在加速度。匀速圆周运动的核心是一条指向圆心的向心力，它由具体的某个力（绳张力、重力、支持力）来充当。 || On a circular path the direction changes every instant, so there is acceleration even at constant speed. The core of uniform circular motion is a single centripetal force pointing to the center, played by a real force such as tension, gravity, or the normal force.

:::accordion
::panel { open: true }
### 描述量：线速度、角速度、周期与转速 || Quantities: Linear/Angular Speed, Period, Frequency
🏎

**线速度 v**

沿切线方向、单位时间走过的弧长。v = 2πr / T，方向始终沿切线、时刻在变。

🔄

**角速度 ω**

单位时间转过的圆心角。ω = 2π / T，单位 rad/s；同一转盘上各点 ω 相同。

⏱

**周期 T 与频率 f**

转一圈用时 T（s），f = 1 / T（Hz）。转速 n（r/s 或 r/min）描述每秒 / 每分转数。

🔗

**v 与 ω 的关系**

v = ωr：半径越大、线速度越大，但角速度可以相同（同轴齿轮 / 转盘）。

$$
v = \dfrac{2\pi r}{T} = \omega r,\qquad \omega = \dfrac{2\pi}{T} = 2\pi f
$$

> **「同轴」与「同带」两种传动**
> 同一转轴（或同一圆盘）上各点**角速度 ω 相同**，半径大的点线速度大；皮带 / 齿轮咬合传动时接触点**线速度 v 相同**，半径大的轮角速度小。判断同轴还是同带是传动题的第一步。

::panel
### 向心加速度与向心力 || Centripetal Acceleration and Force
> **📐 向心力：让物体「拐弯」的合力**
> 匀速圆周运动速率不变，但速度方向时刻指向切线、不断变化，对应一个指向圆心的**向心加速度**：a = v² / r = ω²r。
> 由牛顿第二定律，提供这个加速度的合力就是**向心力**：F = ma = mv² / r = mω²r，方向始终指向圆心。
> 关键认识：向心力**不是一种新的力**，而是由已有的某个力（或合力）充当——水平转盘上是摩擦力，绳系小球是绳张力，行星绕转是万有引力。

$$
a = \dfrac{v^2}{r} = \omega^2 r,\qquad F = \dfrac{mv^2}{r} = m\omega^2 r
$$

> **向心力不做功**
> 向心力始终指向圆心、与线速度（切线方向）垂直，夹角 90°，因此**向心力对物体不做功**。这与第 04 节「与位移垂直的力不做功」一致，也解释了匀速圆周运动动能为何不变。

::panel
### 例题：转盘、水平圆周与竖直圆周 || Examples: Turntable, Horizontal and Vertical Circles
例 10

一转盘 2 s 转一圈，盘面上一点距轴 0.5 m。求该点的周期 T、角速度 ω、线速度 v 与向心加速度 a。（取 π ≈ 3.14）

**周期：**T = **2 s**。**角速度：**ω = 2π / T = 6.28 / 2 = **3.14 rad/s**。

**线速度：**v = ωr = 3.14 × 0.5 ≈ **1.57 m/s**。

**向心加速度：**a = v² / r = 1.57² / 0.5 ≈ **4.93 m/s²**（或 a = ω²r = 3.14² × 0.5 ≈ 4.93 m/s²）。

例 11

质量 0.2 kg 的小球用 1 m 长的绳系住，在光滑水平面上做匀速圆周运动，线速度 2 m/s。求绳的拉力。

水平面上绳张力充当向心力：F = mv² / r = 0.2 × 2² / 1 = **0.8 N**。

绳的拉力就等于这个向心力 0.8 N，方向沿绳指向圆心。

例 12

质量 m 的小球在竖直平面内做圆周运动，绳长 r。求小球恰好能通过最高点时的最小速度（取重力加速度 g）。

最高点时重力竖直向下、正好指向圆心。「恰好通过」指绳张力 T = 0，此时**仅靠重力**提供向心力：

mg = mv²ₘₐₓ / r ⟹ vₘₐₓ = √(gr)。

这是竖直圆周的临界条件：最高点速度低于 √(gr) 时绳会松弛、小球做不了完整圆周运动。

**⚠ 易错提醒**

- **向心力不是额外的力。**先做受力分析，再看哪个力（或合力分量）指向圆心充当向心力，不要在受力图里凭空多画一个「向心力」。
- **匀速圆周运动不是「无加速度」。**速率不变，但速度方向变，向心加速度始终存在。
- **同轴看 ω、同带看 v。**传动题先判断是同轴还是皮带咬合，再用 v = ωr 换算。
- **竖直圆周分最高 / 最低点。**最高点重力帮忙提供向心力，最低点绳张力要同时克服重力并提供向心力，两处方程不同。
:::

## #hooke 06 / The Quantitative Law of Spring Force :: 胡克定律：弹簧弹力 F = kx || Hooke's Law: Spring Force F = kx

第 04 节定性提到弹性势能，这一节把弹簧弹力定量化。在弹性限度内，弹簧弹力与形变量成正比——这是自招里弹簧测力计、弹簧串并联与弹力平衡题的基础。 || Section 04 mentioned elastic potential energy qualitatively; this section makes spring force quantitative. Within the elastic limit, spring force is proportional to deformation — the basis for spring-scale, spring-combination, and elastic-equilibrium problems.

:::accordion
::panel { open: true }
### 定律内容：F = kx 与三个要点 || The Law: F = kx and Three Key Points
> **📐 胡克定律**
> 在弹性限度内，弹簧的弹力 F 与形变量 x 成正比：F = kx。
> **x 是形变量**（伸长或压缩的长度），等于「现长 − 原长」的绝对值，**不是弹簧的总长**。
> **k 是劲度系数**（N/m），只由弹簧本身决定（材料、粗细、匝数、原长），与拉力、形变量都无关；k 越大弹簧越「硬」。

$$
F = kx,\qquad x = |L - L_0|
$$

📏

**形变量 x**

伸长或压缩量，= |现长 − 原长|；拉伸、压缩都适用，弹力方向总是「反抗形变」。

🔩

**劲度系数 k**

弹簧固有属性，单位 N/m；F-x 图线的斜率就是 k。

♾

**弹性限度**

超过弹性限度后 F = kx 失效，撤力也不再复原，做题默认在限度内。

🔗

**串联 / 并联（拔高）**

并联更「硬」（k 增大），串联更「软」（k 减小）；定性了解即可。

::panel
### 例题：求劲度系数与形变量 || Examples: Finding k and Deformation
例 13

竖直悬挂的弹簧原长 10 cm，挂上 2 kg 重物后稳定时长 14 cm。取 g = 10 m/s²，求弹簧的劲度系数 k。

稳定时弹簧弹力等于重物重力：F = mg = 2 × 10 = 20 N。

形变量 x = 14 − 10 = 4 cm = 0.04 m。

由 F = kx：k = F / x = 20 / 0.04 = **500 N/m**。

例 14

劲度系数 200 N/m 的弹簧，下端固定、上端竖直放置一个 1 kg 的物块并静止。取 g = 10 m/s²，求弹簧的压缩量。

物块静止，弹簧弹力（向上）平衡重力：F = mg = 1 × 10 = 10 N。

由 F = kx：x = F / k = 10 / 200 = 0.05 m = **5 cm**（压缩量）。

**⚠ 易错提醒**

- **x 是形变量，不是弹簧总长。**必须用「现长 − 原长」，直接代总长是最常见错误。
- **k 与拉力、形变量无关。**k 只由弹簧本身决定；换更大的力，x 变大但 k 不变。
- **单位统一到 SI。**x 用 m、k 用 N/m，cm 必须先换算。
- **先判断拉伸还是压缩。**弹力方向总是反抗形变——拉伸时向内拉、压缩时向外推。
:::

## #cheatsheet 07 / Last Look Before the Exam :: 公式速查与适用条件 || Formula Cheat Sheet and Conditions

把六个考点的核心公式与「用它的前提」放在一张表里。条件比公式更容易丢分。 || The core formulas and the precondition for each, in one table. The conditions cost more marks than the formulas.

| 考点 || Topic | 核心公式 || Core Formula | 适用条件 / 用法 || Condition / Use |
| --- | --- | --- |
| 正交分解 | Fx = F cosθ，Fy = F sinθ；平衡时 ΣFx = ΣFy = 0 | 多力平衡；斜面沿斜面建系，G∥ = mg sinθ、G⊥ = mg cosθ |
| 匀变速 | v = v₀+at；x = v₀t+½at²；v²−v₀² = 2ax | 加速度恒定的直线运动；先定正方向，减速 a 取负 |
| 匀变速推论 | v̅ = (v₀+v)/2；Δx = aT² | 仅匀变速；逐差法由相邻等时位移差求 a |
| 自由落体 | v = gt；h = ½gt²；v² = 2gh | 初速度为零、只受重力；g 取 9.8 或 10 m/s² |
| 竖直上抛 | H = v₀²/(2g)；t总 = 2v₀/g | 全程 a = g 向下；上下对称，先判断是否返回 |
| 动能 / 势能 | Eₖ = ½mv²；Eₙ = mgh | 动能恒正、是标量；势能相对零势能面 |
| 动能定理 | W合 = ½mv₂² − ½mv₁² | 最通用；含摩擦、变力、外力均适用 |
| 机械能守恒 | ½mv₁²+mgh₁ = ½mv₂²+mgh₂ | 仅当只有重力 / 弹力做功；有摩擦改用动能定理 |
| 圆周运动 | v = 2πr/T = ωr；a = v²/r = ω²r | 匀速圆周；同轴 ω 相同、同带 v 相同 |
| 向心力 | F = mv²/r = mω²r | 指向圆心；由绳张力 / 重力 / 摩擦力充当，不额外画 |
| 胡克定律 | F = kx | 弹性限度内；x = \|现长 − 原长\|，k 为弹簧固有属性 |

:::callout { title: "冲刺策略：先把「条件」背熟" }
这六个考点的公式都不长，自招丢分几乎都在「用错条件」——把平均速度公式用到变加速、把机械能守恒用到有摩擦、向心力凭空多画一个、胡克定律里代了总长而非形变量。考前重点过这张表的第三列。
:::

## #nav 08 / Go Deeper :: 相关文章 || Related Articles

想把某个考点学得更透，下面是站内同主题的系统文章；电学冲刺另起一篇。 || To master any single topic in depth, here are the systematic articles on this site; the circuits sprint is a separate piece.

- [力学 · 系统篇 || Mechanics · Deep：力与平衡：重力、弹力、摩擦力 || Forces & Equilibrium](../forces-equilibrium/)
- [运动学 · 系统篇 || Kinematics · Deep：匀变速直线运动：公式与自由落体 || Uniform Acceleration & Free Fall](../uniform-acceleration/)
- [能量 · 系统篇 || Energy · Deep：功与能：动能定理与机械能守恒 || Work & Energy](../work-energy/)
- [电学 · 冲刺篇 || Circuits · Sprint：电路混联：识别结构、等效电阻与功率 || Series-Parallel Circuits](../physics-sprint-circuits/)
