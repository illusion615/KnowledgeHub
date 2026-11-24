---
title: "浮力：从液体压强到阿基米德原理 || Buoyancy: From Liquid Pressure to Archimedes"
eyebrow: "力学 · 中考自招专题 || Mechanics · Exam Focus"
brand: "力学 || Mechanics"
date: 2026-06-07
strict_i18n: false
strict_density: true
lead: "不背结论，用四个可调实验把压强差、阿基米德原理与浮沉条件连成一条因果链。 || No rote rules — four adjustable labs link pressure difference, the Archimedes principle, and float-sink conditions into one causal chain."
hero_actions:
  - "打开主模拟器 || Open Main Lab | #archimedes"
  - "直接做真题 || Go to Exams | #practice"
panel_label: "本章目标 || Chapter Goals"
panel_title: "把浮力还原成压强差 || Reduce Buoyancy to a Pressure Gap"
panel:
  - "理解液体压强 p = ρgh 与上下压力差 || Grasp liquid pressure p = ρgh and the up-down force gap"
  - "用称重法测出浮力，建立浮力概念 || Measure buoyancy by weighing to define it"
  - "用模拟器归纳阿基米德原理与浮沉条件 || Derive Archimedes and float-sink rules in the lab"
  - "解释轮船、潜艇、密度计、气球 || Explain ships, submarines, hydrometers, balloons"
metrics:
  - "压强公式 || Pressure | p = ρgh | 只与液体密度和深度有关 || Depends on density and depth only"
  - "核心原理 || Core Law | F浮 = ρ液gV排 | 浮力等于排开液体所受重力 || Buoyancy equals weight of displaced liquid"
  - "交互实验 || Interactive Labs | 4 | 称重·沉浮·盐水·潜艇 || Weigh · Float · Brine · Sub"
  - "难度 || Difficulty | ★★★★☆ | 中考重点 · 自招高频 || Exam core · high frequency"
style:
  accent: "#0284c7"
---

## #pressure 01 / Liquid Pressure :: 浮力的根源：液体内部的压强差 || The Root of Buoyancy: A Pressure Gap Inside the Liquid

浮力不是凭空出现的，它来自液体对物体上下表面的压力差。要讲清这件事，先要知道液体内部的压强怎么随深度变化。本章先把压强这把标尺立起来，后面三章都建立在它之上。 || Buoyancy is not magic — it comes from the pressure difference on an object's top and bottom faces. To see why, we first need how pressure grows with depth. This chapter erects the ruler the next three rely on.

P

### 液体压强公式 p = ρgh

液体内部某点的压强，只由液体密度 ρ 和这点到液面的深度 h 决定，与液体总量、容器形状、容器底面积统统无关。深度每增加 1 米，水中压强约增加 10000 Pa。

↕

### 同一深度，各方向压强相等

液体内部同一深度处，向上、向下、向左、向右的压强大小都相等。正因为如此，一个浸入液体的物体，侧面左右受到的压力相互抵消，只剩下下表面与上表面的竖直压力差。

Δ

### 下深上浅 → 下大上小 → 净向上

物体下表面比上表面更深，受到的向上压强更大；上表面较浅，受到的向下压强较小。两者之差乘以表面积，就是一股净向上的力——这正是浮力的来历。

$$
p = \rho g h \qquad F = pS
$$

:::callout { title: "三个最容易错的点 || Three Common Traps" }
① 压强 p 与深度 h 有关，但浮力 F浮 与深度无关（只要物体完全浸没，再往下沉浮力不变）——别把"压强随深度增大"误推成"浮力随深度增大"。 ② 深度 h 指的是到自由液面的竖直距离，不是物体本身的高度，也不是到容器底的距离。 ③ p = ρgh 里的 ρ 是液体的密度，不是浸入物体的密度。
:::

:::accordion
::panel
### 为什么压强与容器形状无关 || Why Pressure Ignores Container Shape
把细颈瓶、粗桶、斜口杯装到同样的水深，底部压强完全相同——这就是著名的"帕斯卡裂桶实验"背后的道理。

1

**压强只数"头顶上的那一柱"**

某点受到的压强，取决于它正上方那一竖直液柱的高度，而不是整桶水的重量。容器再粗再细，只要液面到该点的竖直高度相同，p = ρgh 给出的结果就相同。

2

**连通器：液面总会拉平**

上端开口、下部相连的容器叫连通器。同种静止液体不流动时，各容器中的液面总在同一水平面。茶壶、船闸、下水道存水弯、锅炉水位计都是连通器的应用。
:::

## #buoyancy 02 / What Is Buoyancy :: 什么是浮力，又怎样把它测出来 || What Buoyancy Is, and How to Measure It

上一章我们知道了压强差会产生一股净向上的力。这一章给它一个名字——浮力，并用最经典的称重法把它的大小测出来。拖动下面的滑块，让物体一点点浸入水中，看测力计读数怎么变。 || The pressure gap produces a net upward force; here we name it buoyancy and measure it with the classic weighing method. Drag the slider to lower the object into water and watch the scale.

:::callout { title: "称重法：两次读数之差就是浮力 || Weighing Method" }
先在空气中用弹簧测力计称出物体重力 G；再把物体浸入液体，读出测力计的示数 F示。物体在液体中受三个力平衡：向上的拉力 F示、向上的浮力 F浮、向下的重力 G。于是 **F浮 = G − F示**。测力计"变轻"的那部分，正是浮力托起来的。
:::

:::sandbox { id: "weigh-canvas", title: "交互实验沙盒 || Interactive Simulation Sandbox" }
交互可调参数：浸入深度 || Submerge depth、物体密度 || Object density。
:::

:::callout { title: "从模拟器里读出两条规律 || Two Rules From the Lab" }
① 物体未全部浸没时，浸得越深、排开的水越多，浮力越大、测力计示数越小。 ② 物体一旦完全浸没，再往深处压，排开体积不再变化，浮力和示数都保持恒定——这是"浮力与深度无关"最直接的证据。
:::

## #archimedes 03 / Archimedes' Principle :: 浮力到底有多大：F浮 = ρ液 g V排 || How Big Is Buoyancy: F = ρ·g·V

称重法只能测一次一个值。阿基米德原理给出通用公式：浮力等于物体排开的那部分液体所受的重力。调节物体密度、体积和液体密度，看浮力、重力、排水量怎样联动，再拖动物块亲手把它压进水里。 || The weighing method gives one value at a time; Archimedes gives the general formula — buoyancy equals the weight of the displaced liquid. Tune the three sliders and drag the block underwater.

$$
F_{\text{浮}} = G_{\text{排液}} = \rho_{\text{液}}\, g\, V_{\text{排}}
$$

:::sandbox { id: "buoy-canvas", title: "交互实验沙盒 || Interactive Simulation Sandbox" }
交互可调参数：物体密度 ρ物 (g/cm³) || Object ρ (g/cm³)**0.60**、液体密度 ρ液 (g/cm³) || Liquid ρ (g/cm³)**1.00**、物体体积 V (cm³) || Volume V (cm³)**500**。
:::

:::accordion
::panel { open: true }
### 公式里每个量到底指什么 || What Each Symbol Means
阿基米德原理短短一行，但每个符号都有它"只看谁、不看谁"的脾气，这正是考试设陷阱的地方。

ρ

**ρ液 是液体密度**

浮力由液体的密度决定，与物体本身的密度无关。同一物体在水和盐水里，浮力不同。

V

**V排 是排开体积**

是浸入液体的那部分体积，不是物体总体积。漂浮时只算水面以下的部分。

g

**g 是常数**

g ≈ 9.8 N/kg，计算常取 10 N/kg。它把"质量"换算成"重力"。

≠

**与深度、形状无关**

浮力不看物体沉到多深，也不看物体什么形状，只认排开了多少液体。

::panel
### 阿基米德原理的推导 || Deriving the Principle
用第 01 章的压强差，可以把这条原理推导出来，而不是死记。设一个高 h、底面积 S 的立方体浸没在密度为 ρ液 的液体中，上表面深度 h₁、下表面深度 h₂。

> **📐 压力差 → 浮力**
> 下表面向上的压力：F下 = ρ液 g h₂ · S；上表面向下的压力：F上 = ρ液 g h₁ · S。
> 净向上的力：F浮 = F下 − F上 = ρ液 g (h₂ − h₁) · S = ρ液 g · h · S。
> 而 h · S 正是立方体的体积，也就是它排开的液体体积 V排。所以 F浮 = ρ液 g V排，与阿基米德原理完全一致。

$$
F_{\text{浮}} = \rho_{\text{液}} g h_2 S - \rho_{\text{液}} g h_1 S = \rho_{\text{液}} g\, V_{\text{排}}
$$
:::

## #float-sink 04 / Float or Sink :: 上浮、下沉、悬浮、漂浮怎么判断 || Judging Rise, Sink, Suspend, and Float

有了浮力和重力两个量，物体的命运就由它们的大小关系决定。完全浸没时，比较浮力与重力，等价于比较液体密度与物体密度。下面的盐水实验把这条分界线演给你看：不断加盐，让鸡蛋从沉底变成上浮。 || With buoyancy and weight in hand, the object's fate is decided by their comparison — which, when fully submerged, is the same as comparing the two densities. The brine lab shows the boundary live.

| 受力关系 || Force | 密度关系 || Density | 运动状态 || Motion | 最终结果 || Result | 排开体积 || Displaced |
| --- | --- | --- | --- | --- |
| F浮 > G | ρ液 > ρ物 | 上浮 | 漂浮在液面 | V排 < V物（部分露出） |
| F浮 = G | ρ液 = ρ物 | 悬浮 | 停在液体中任意处 | V排 = V物（恰好浸没） |
| F浮 < G | ρ液 < ρ物 | 下沉 | 沉到容器底 | V排 = V物（完全浸没） |

:::callout { title: "漂浮和悬浮别混 || Float vs Suspend" }
悬浮：物体完全浸没在液体内部，靠 ρ液 = ρ物 维持，浮力恰好等于重力，一旦密度稍有差别就会上浮或下沉。漂浮：物体有一部分露出液面，靠减少排开体积让浮力降到正好等于重力，是一种稳定状态。两者都满足 F浮 = G，但漂浮时 V排 < V物，悬浮时 V排 = V物。
:::

:::sandbox { id: "egg-canvas", title: "交互实验沙盒 || Interactive Simulation Sandbox" }
交互可调参数：盐水密度 ρ液 (g/cm³) || Brine ρ (g/cm³)**1.00**。
:::

## #applications 05 / Four Applications :: 同一原理，四种工程造物 || One Principle, Four Engineered Things

轮船、潜艇、密度计、气球与飞艇，全是浮力原理的应用，区别只在于它们用哪种方式调节浮力与重力的平衡。先看潜艇怎样靠改变自重沉浮，再对照另外三种。 || Ships, submarines, hydrometers, and balloons all apply buoyancy — they differ only in how they balance buoyancy and weight. See how a submarine changes its own weight, then compare the other three.

:::sandbox { id: "sub-canvas", title: "交互实验沙盒 || Interactive Simulation Sandbox" }
交互可调参数：压载水舱进水量 || Ballast fill**0%**。
:::

:::insight-grid { cols: 2 }
::card 01
### 轮船：空心增大排水体积
钢铁密度约是水的 8 倍，做成实心必沉。造成中空船体后，整艘船的平均密度小于水，能排开远多于自身体积的水。轮船从河水开进海水，因海水密度更大，排水体积减小，吃水变浅、略微上浮。排水量指的是满载时排开水的质量。

::card 02
### 潜艇：改变自重而非浮力
潜艇靠压载水舱注水、排水来改变自身重力，从而实现下潜、悬停、上浮。它的体积基本不变，浮力恒定——这是它与轮船、鱼最根本的区别。鱼则是靠鳔的胀缩改变自身体积（进而改变浮力）。

::card 03
### 密度计：漂浮测密度
密度计是一根能竖直漂浮的玻璃管。无论放进哪种液体，它都漂浮，浮力始终等于自重 G（定值）。液体密度越大，需排开的体积越小，密度计露出越多、浸入越浅。所以刻度上小下大，且不均匀。

::card 04
### 气球与飞艇：空气里的浮力
浮力不只存在于液体，气体里同样有。气球充入密度比空气小的氢气或氦气，或加热使内部空气膨胀变稀（热气球），让整体平均密度小于周围空气，空气浮力大于重力便上升。
:::

## #advanced 06 / Beyond · Toward High School :: 自招与高中常考的四类难点 || Four Hard Spots for Selective Exams

中考定量到阿基米德原理就够了，但自主招生和高中会进一步考察液面升降、多液体分层、浮力做功与帕斯卡原理。下面四个折叠块各攻一类，建议先自己推一遍再看答案。 || Zhongkao stops at Archimedes, but selective and high-school exams push into liquid-level changes, layered liquids, work by buoyancy, and Pascal's law. Each fold tackles one.

:::accordion
::panel { open: true }
### 液面升降问题：冰块融化 || Liquid Level: Melting Ice
漂浮的冰块融化后，杯中水面升还是降？这是自招高频题，关键在比较"冰排开的水"与"冰化成的水"。

> **📐 漂浮冰块融化，水面不变**
> 冰漂浮时，F浮 = G冰，即排开水的重力等于冰的重力，故排开水的体积 V排 = m冰 / ρ水。
> 冰全部化成水后，这些水的体积 V水 = m冰 / ρ水，与原来排开的体积完全相等。所以纯冰漂浮在纯水中融化，液面保持不变。
> 变式：冰中包着一块石头则液面下降；冰漂在盐水里融化则液面上升；判断的统一方法都是比较 V排 与融化产物的体积。

::panel
### 浮力的本质与压力差积分 || The Origin of Buoyancy
第 03 章用立方体推了原理，但对任意形状的物体，浮力依然等于 ρ液 g V排。原因是：把任意曲面切成无数竖直细柱，每根细柱上下表面的压力差等于该柱排开液体的重力，所有细柱求和（积分）后，总浮力就等于整个物体排开液体的重力。

> **一个有用的极端例子**
> 如果物体下表面与容器底紧密贴合、之间没有液体（如吸在水底的橡皮泥、桥墩底面陷入淤泥），液体无法从下方向上施压，物体就不受向上的浮力。这说明浮力的根源确实是"上下表面的压力差"，而非某种与生俱来的属性。

::panel
### 帕斯卡原理与液压机 || Pascal's Law and Hydraulics
帕斯卡原理：加在密闭液体上的压强，能大小不变地向各个方向传递。液压机、汽车液压刹车、千斤顶都靠它。

> **📐 液压机如何放大力**
> 两个活塞通过密闭液体相连，面积分别为 S₁、S₂。在小活塞上加力 F₁ 产生压强 p = F₁ / S₁，这个压强传到大活塞上，输出力 F₂ = p · S₂ = F₁ · S₂ / S₁。
> 大活塞面积是小活塞的几倍，输出的力就放大几倍。代价是小活塞要下压更长的距离——这正是功的原理（省力不省功）在液压上的体现。

$$
\frac{F_1}{S_1} = \frac{F_2}{S_2}
$$

::panel
### 多液体分层与压强叠加 || Layered Liquids and Pressure
水和油互不相溶，密度小的油浮在水上，形成分层。计算下层某点的压强时，要把上面每一层液体的 ρgh 逐层叠加。

> **📐 分层液体的压强**
> 设上层油深 h油、密度 ρ油，下层水深 h水、密度 ρ水。水中深度 h水 处某点的压强为：
> p = ρ油 g h油 + ρ水 g h水。一个浸在水层、跨越油水界面的物体，浮力仍等于它在两层中各自排开液体重力之和。
:::

## #practice 07 / Exam Practice :: 从中考定量到自招拔高 || From Zhongkao Calculation to Selective Depth

每题先自己列式求解，再展开核对。计算统一取 g = 10 N/kg，ρ水 = 1.0×10³ kg/m³。能讲清每一步用了哪条规律，才算真正掌握。 || Solve each first, then expand to check. Take g = 10 N/kg and ρ_water = 1.0×10³ kg/m³ throughout.

:::accordion
::panel { open: true }
### 中考真题（3 题） || Zhongkao (3 Questions)
> **Q1 · 称重法**
> 用弹簧测力计吊一金属块，在空气中读数 2.7 N，将它完全浸没在水中后读数 1.7 N。求金属块受到的浮力、体积和密度。

**📖 Q1 答案 || 📖 Q1 Answer**

浮力：F浮 = G − F示 = 2.7 − 1.7 = 1.0 N。

由 F浮 = ρ水 g V排，且完全浸没 V排 = V物：V = F浮 /(ρ水 g) = 1.0 /(1.0×10³ × 10) = 1.0×10⁻⁴ m³ = 100 cm³。

质量 m = G/g = 2.7/10 = 0.27 kg，密度 ρ = m/V = 0.27 / 1.0×10⁻⁴ = 2.7×10³ kg/m³（铝）。

> **Q2 · 漂浮问题**
> 一木块漂浮在水面上，露出水面的体积占总体积的 1/5。求木块的密度。

**📖 Q2 答案 || 📖 Q2 Answer**

漂浮时 F浮 = G，即 ρ水 g V排 = ρ木 g V物。

露出 1/5，浸入 V排 = 4/5 V物。代入：ρ水 ×(4/5)V物 = ρ木 V物。

ρ木 = (4/5) ρ水 = 0.8×10³ kg/m³ = 0.8 g/cm³。漂浮物体的密度，等于浸入体积比乘以液体密度。

> **Q3 · 海水与河水**
> 同一艘轮船从长江驶入大海，海水密度大于河水。它受到的浮力如何变化？吃水深度（船浸入水中的深度）如何变化？

**📖 Q3 答案 || 📖 Q3 Answer**

轮船始终漂浮，F浮 = G船 不变，所以浮力不变。

由 F浮 = ρ液 g V排，浮力不变而海水 ρ液 增大，故 V排 减小，吃水变浅，船身略微上浮。这就是"水涨船高"反过来——盐水更"托人"。

::panel
### 自招真题（3 题） || Selective Exams (3 Questions)
> **Q4 · 冰块融化**
> 一块冰漂浮在一杯水中。冰全部融化后，杯中水面是上升、下降还是不变？若冰块中冻着一颗小石子呢？

**📖 Q4 答案 || 📖 Q4 Answer**

纯冰：漂浮时排开水体积 V排 = m冰/ρ水，融化后水的体积也是 m冰/ρ水，二者相等，水面不变。

含石子：漂浮时石子的重力也由浮力支撑，排开的水偏多；融化后石子沉底，只排开自己那点体积，排水减少，故水面下降。

> **Q5 · 浮力计算**
> 边长 10 cm 的正方体木块，密度 0.6×10³ kg/m³，放入水中漂浮。求它浸入水中的深度，以及要把它完全压入水中需要多大向下的力。

**📖 Q5 答案 || 📖 Q5 Answer**

V物 = (0.1)³ = 1.0×10⁻³ m³，G = ρ木 g V物 = 0.6×10³ ×10 ×1.0×10⁻³ = 6 N。

漂浮 F浮 = G = 6 N，V排 = F浮/(ρ水 g) = 6/(1.0×10³×10) = 6.0×10⁻⁴ m³。浸入深度 = V排/底面积 = 6.0×10⁻⁴ / (0.1×0.1) = 0.06 m = 6 cm。

完全压入时 F浮' = ρ水 g V物 = 1.0×10³×10×1.0×10⁻³ = 10 N。向下压力 F = F浮' − G = 10 − 6 = 4 N。

> **Q6 · 容器与浮力的反作用**
> 一杯水放在台秤上示数为 W₀。用细线吊一金属块使其完全浸没在水中但不接触杯底，金属块受到的浮力为 F浮。此时台秤的示数是多少？

**📖 Q6 答案 || 📖 Q6 Answer**

水对金属块施加向上的浮力 F浮，根据牛顿第三定律，金属块对水施加大小相等、方向向下的反作用力 F浮。

这个向下的力压在水及容器上，最终传到台秤。所以台秤示数变为 W₀ + F浮。注意这里增加的是浮力，而不是金属块的全部重力——其余的重力由细线承担。
:::

## #roadmap 08 / Mechanics Series Navigation :: 把浮力放回力学全景 || Place Buoyancy Back in Mechanics

浮力是受力分析的一种具体应用，前承力与平衡，后接功与能。想巩固受力分析，或看浮力做功的能量视角，接着读这两篇。 || Buoyancy is a concrete case of force analysis — it follows forces and equilibrium and leads into work and energy.

- [前置阅读 || Prerequisite：力与平衡：重力、弹力、摩擦力 || Forces & Equilibrium](../forces-equilibrium/)
- **当前 || Current：浮力：从液体压强到阿基米德原理 || Buoyancy & Archimedes**
- [延伸阅读 || Further Reading：功与能：动能定理与机械能守恒 || Work & Energy](../work-energy/)
