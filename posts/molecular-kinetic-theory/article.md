---
title: "分子动理论与内能 || Molecular Kinetic Theory & Internal Energy"
eyebrow: "热学 · 第 1 篇 / 共 2 篇 || Thermodynamics · Part 1 of 2"
brand: "热学 || Thermodynamics"
date: 2026-04-17
strict_i18n: false
strict_density: true
lead: "从宏观热现象深入微观分子世界。理解分子运动、分子间作用力和内能的本质。 || From macroscopic thermal phenomena to the microscopic molecular world. Understand molecular motion, intermolecular forces, and the nature of internal energy."
hero_actions:
  - "开始学习 || Start Learning | #molecular-world"
  - "直接练习 || Go to Practice | #practice"
panel_label: "本章目标 || Chapter Goals"
panel_title: "从微观到宏观 || From Micro to Macro"
panel:
  - "了解分子大小与阿伏加德罗常数 || Molecular size & Avogadro's number"
  - "理解扩散和布朗运动的微观本质 || Microscopic nature of diffusion & Brownian motion"
  - "掌握分子间引力与斥力的关系 || Intermolecular attraction & repulsion"
  - "理解内能的构成与改变方式 || Internal energy composition & change"
metrics:
  - "分子直径 || Molecular Diameter | ~10⁻¹⁰ m | 约一亿分之一厘米 || About 0.1 nanometer"
  - "阿伏加德罗常数 || Avogadro's Number | 6.02×10²³ | 1 mol 的粒子数 || Particles per mole"
  - "交互实验 || Interactive Lab | 1 | 布朗运动模拟 || Brownian Motion Sim"
  - "难度 || Difficulty | ★★★☆☆ | 概念为主 || Concept-focused"
style:
  accent: "#ea580c"
---

## #molecular-world 01 / The Molecular World :: 看不见的微观构成 || The Invisible Microscopic Constitution

物质由大量分子组成。分子极小（~10⁻¹⁰ m），数量极大（阿伏加德罗常数 Nₐ ≈ 6.02×10²³）。 || Matter consists of a huge number of molecules. Molecules are tiny (~10⁻¹⁰ m) and numerous (Avogadro's number Nₐ ≈ 6.02×10²³).

:::accordion
::panel { open: true }
### 分子大小的测量 || Measuring Molecular Size
> **📐 油膜法估算分子直径 || 📐 Oil Film Method**
> 将一滴油酸滴在水面上，测量油膜面积 S 和油滴体积 V。假设油膜展开为单分子层： || Drop oleic acid on water, measure film area S and droplet volume V. Assume film is one molecule thick:
> $$
> d = \frac{V}{S}
> $$
> 典型结果：d ≈ 10⁻¹⁰ m，即约 0.1 nm。这证明分子确实极其微小。 || Typical result: d ≈ 10⁻¹⁰ m, about 0.1 nm. This confirms molecules are extraordinarily small.

::panel
### 阿伏加德罗常数 || Avogadro's Number
$$
N_A = 6.022 \times 10^{23} \text{ mol}^{-1}
$$

> **💡 直觉感受 || 💡 Intuition**
> 如果每秒数一个分子，6.02×10²³ 个分子需要约 1.9×10¹⁶ 年——远超宇宙年龄（138 亿年）。一杯水（约 18 g）中含有 6.02×10²³ 个水分子。 || Counting one molecule per second, 6.02×10²³ molecules would take ~1.9×10¹⁶ years — far exceeding the age of the universe (13.8 billion years). A cup of water (~18 g) contains 6.02×10²³ water molecules.
:::

## #brownian 02 / Evidence of Molecular Motion :: 扩散与布朗运动 || Diffusion & Brownian Motion

分子永不停息地做无规则运动。扩散现象和布朗运动是最直接的证据。 || Molecules are in constant, irregular motion. Diffusion and Brownian motion are the most direct evidence.

:::accordion
::panel { open: true }
### 扩散现象 || Diffusion
- **气体扩散 || Gas Diffusion** — 打开香水瓶，整个房间很快闻到香味。气体分子运动速度最快，扩散最迅速。 || Open a perfume bottle and the whole room smells it quickly. Gas molecules move fastest, diffusing most rapidly.
- **液体扩散 || Liquid Diffusion** — 将墨水滴入清水，逐渐变为均匀的淡色。液体分子间距较小，扩散比气体慢。 || Drop ink into water; it gradually becomes uniformly colored. Liquid molecules are closer, so diffusion is slower than gas.
- **固体扩散 || Solid Diffusion** — 铅板和金板紧贴放置几年后，接触面互相渗入约 1 mm。固体分子间距最小，扩散极慢。 || Lead and gold plates pressed together for years show ~1 mm mutual penetration. Solid molecules are closest, diffusion is extremely slow.

::panel
### 布朗运动模拟器 || Brownian Motion Simulator
悬浮微粒受到周围分子从各个方向的不平衡撞击，发生无规则运动。温度越高，分子运动越剧烈，布朗运动越明显。 || Suspended particles receive unbalanced impacts from surrounding molecules in all directions, causing irregular motion. Higher temperature means more vigorous molecular motion and more pronounced Brownian motion.

> **🧪 交互实验沙盒 || Interactive Simulation Sandbox** (`#brownianCanvas`) — 交互可调参数：温度 || Temperature。

> **💡 布朗运动 ≠ 分子运动 || 💡 Brownian Motion ≠ Molecular Motion**
> 布朗运动是悬浮微粒（花粉、碳粒）的运动，不是分子本身的运动。它间接反映了液体（气体）分子的无规则运动。微粒越小、温度越高，布朗运动越明显。 || Brownian motion is the movement of suspended particles (pollen, carbon), not molecules themselves. It indirectly reflects the irregular motion of liquid (gas) molecules. Smaller particles and higher temperature make it more pronounced.
:::

## #intermolecular 03 / Intermolecular Forces :: 引力与斥力的微妙平衡 || The Subtle Balance of Attraction & Repulsion

分子间同时存在引力和斥力。两者都随距离增大而减小，但斥力减小得更快。 || Intermolecular attraction and repulsion coexist. Both decrease with distance, but repulsion decreases faster.

:::accordion
::panel { open: true }
### F-r 关系图 || F-r Diagram
r₀

**平衡距离 r₀ ≈ 10⁻¹⁰ m || Equilibrium r₀ ≈ 10⁻¹⁰ m**

引力 = 斥力，合力为零。分子间距约 10⁻¹⁰ m 时达到平衡。 || Attraction = repulsion, net force is zero. Achieved at ~10⁻¹⁰ m.

<

**r < r₀：斥力为主 || r < r₀: Repulsion Dominates**

分子过于靠近时，斥力急剧增大并超过引力。表现为固体和液体难以被压缩。 || When molecules are too close, repulsion increases sharply. This is why solids and liquids are hard to compress.

>

**r > r₀：引力为主 || r > r₀: Attraction Dominates**

分子略微远离平衡位置时，引力超过斥力。表现为液体有表面张力，固体有弹性。 || When molecules move slightly beyond equilibrium, attraction exceeds repulsion. This produces surface tension and solid elasticity.

∞

**r > 10r₀：力可忽略 || r > 10r₀: Force Negligible**

分子间距超过 10⁻⁹ m（约 10 倍分子直径）时，分子力几乎为零。气体分子间距大，分子力可忽略。 || Beyond ~10⁻⁹ m (~10 diameters), molecular forces are negligible. Gas molecules are far apart, so intermolecular forces are negligible.
:::

## #internal-energy 04 / Internal Energy :: 分子动能与分子势能的总和 || Sum of Molecular KE & PE

物体内所有分子的动能和分子间势能的总和叫做内能。温度是分子平均动能的标志。 || Internal energy is the total of all molecular kinetic and potential energies. Temperature indicates average molecular KE.

:::accordion
::panel { open: true }
### 内能的构成 || Composition of Internal Energy
- **分子动能 || Molecular KE** — 分子做无规则运动而具有的动能。温度越高，分子平均动能越大。温度是分子平均动能的标志。注意：是「平均」动能，单个分子的速度有快有慢。 || KE from irregular molecular motion. Higher temperature = greater average molecular KE. Temperature indicates AVERAGE molecular KE — individual molecules vary.
- **分子势能 || Molecular PE** — 分子间存在引力和斥力，因此具有分子势能。分子势能与分子间距有关，即与物体的体积有关。 || Intermolecular forces create molecular PE. Molecular PE depends on molecular spacing, i.e., on the object's volume.

::panel
### 改变内能的两种方式 || Two Ways to Change Internal Energy
| 方式 || Method | 本质 || Nature | 示例 || Example |
| --- | --- | --- |
| 做功 || Work | 能量转化（其他形式 ↔ 内能） || Energy conversion (other forms ↔ internal) | 摩擦生热、压缩气体 || Friction heating, gas compression |
| 热传递 || Heat Transfer | 能量转移（内能从高温到低温） || Energy transfer (internal energy from hot to cold) | 开水变凉、暖手 || Hot water cooling, warming hands |

> **💡 做功与热传递等效 || 💡 Work & Heat Transfer Are Equivalent**
> 做功和热传递在改变内能上是等效的。两种方式都能使物体内能增大或减小，效果相同，区别只在于能量交换的机制不同。 || Work and heat transfer are equivalent in changing internal energy. Both can increase or decrease internal energy; they differ only in the mechanism of energy exchange.
:::

## #practice 05 / Enhanced Exercises :: 从基础到进阶：6 道精选题 || From Basic to Advanced: 6 Selected Problems

:::accordion
::panel { open: true }
### 基础题（3 题） || Basic (3)
> **题 1：油膜法 || Q1: Oil Film Method**
> 将体积 V = 1×10⁻⁶ mL 的油酸滴在水面上，形成面积 S = 1×10⁻⁴ m² 的油膜。估算油酸分子的直径。 || Oil droplet V = 1×10⁻⁶ mL forms area S = 1×10⁻⁴ m². Estimate the molecular diameter.
> **查看解析 || Show Solution**
> 
> V = 1×10⁻⁶ mL = 1×10⁻⁹ cm³ = 1×10⁻¹⁵ m³。d = V/S = 10⁻¹⁵/10⁻⁴ = 10⁻¹¹ m = 0.1 nm。符合分子直径的数量级。 || V = 10⁻¹⁵ m³. d = V/S = 10⁻¹⁵/10⁻⁴ = 10⁻¹¹ m = 0.1 nm.

> **题 2：扩散判断 || Q2: Diffusion Judgment**
> 下列哪个不属于扩散现象？A. 花香四溢 B. 墨水散开 C. 灰尘飞扬 D. 腌菜入味 || Which is NOT diffusion? A. Flower fragrance B. Ink spreading C. Dust flying D. Pickling vegetables
> **查看解析 || Show Solution**
> 
> 答案：C。灰尘飞扬是宏观物体的机械运动，不是分子运动。扩散是分子的自发运动，ABD 都是扩散。 || Answer: C. Dust flying is macroscopic mechanical motion, not molecular motion. Diffusion is spontaneous molecular motion; A, B, D are all diffusion.

> **题 3：温度与内能 || Q3: Temperature & Internal Energy**
> 「温度升高，内能一定增大」这句话对吗？ || Is 'Higher temperature always means greater internal energy' correct?
> **查看解析 || Show Solution**
> 
> 对于同一物体，温度升高时分子平均动能增大，内能确实增大。但不能比较不同物体：一杯 100°C 的水内能可能小于一桶 50°C 的水。内能还与质量、物质种类、体积（分子势能）有关。 || For the same object, yes — higher temperature means greater average molecular KE and greater internal energy. But you cannot compare different objects: a cup of 100°C water may have less internal energy than a barrel of 50°C water.

::panel
### 进阶题（3 题） || Advanced (3)
> **题 4：布朗运动分析 || Q4: Brownian Motion Analysis**
> 在显微镜下观察悬浮微粒的布朗运动，以下说法正确的是？A. 微粒越大运动越明显 B. 温度越高运动越明显 C. 运动轨迹是分子的运动轨迹 D. 静止液体中不会发生布朗运动 || Under a microscope, which statement about Brownian motion is correct? A. Larger particles move more B. Higher temp means more movement C. Trajectory shows molecular paths D. No Brownian motion in still liquid
> **查看解析 || Show Solution**
> 
> 答案：B。A 错，微粒越小运动越明显；C 错，轨迹是微粒（不是分子）的运动；D 错，液体宏观静止但分子仍在运动。 || Answer: B. A is wrong (smaller particles move more); C is wrong (trajectory is particle, not molecule); D is wrong (liquid is macroscopically still but molecules move).

> **题 5：分子力综合 || Q5: Molecular Forces Combined**
> 两分子从远处靠近至 r = r₀ 的过程中，分子力做正功还是负功？分子势能如何变化？ || As two molecules approach from far away to r = r₀, does the molecular force do positive or negative work? How does molecular PE change?
> **查看解析 || Show Solution**
> 
> r > r₀ 时引力为主，分子力方向指向对方（与运动方向同向），做正功。分子力做正功时分子势能减小。到 r₀ 时分子势能最小（不是零）。 || For r > r₀, attraction dominates; force direction matches motion, doing positive work. Positive work by molecular force decreases molecular PE. At r₀, PE is at minimum (not zero).

> **题 6：内能变化方式 || Q6: Ways to Change Internal Energy**
> 冬天搓手取暖和用热水袋取暖，哪个是做功改变内能，哪个是热传递改变内能？两种方式的本质区别是什么？ || Rubbing hands vs. using a hot water bottle for warmth — which is work, which is heat transfer? What's the essential difference?
> **查看解析 || Show Solution**
> 
> 搓手是做功（摩擦力做功，机械能 → 内能），热水袋是热传递（内能从高温物体转移到低温物体）。本质区别：做功是能量形式的转化，热传递是同一形式能量的转移。 || Rubbing = work (friction converts mechanical energy to internal energy). Hot water bottle = heat transfer (internal energy transfers from hot to cold). Difference: work converts energy forms; heat transfer moves the same form.
:::

## #roadmap 06 / Series Navigation :: 热学系列 || Thermodynamics Series

- [Part 1：分子动理论与内能（当前） || Molecular Kinetic Theory (Current)](#)
- [Part 2：热力学定律 || Laws of Thermodynamics](../thermodynamics-laws/)

### 👉 下一篇预告：热力学定律 || 👉 Next: Laws of Thermodynamics

从热力学第一定律到第二定律，从蒸汽机效率到熵的概念。理解能量守恒在热学中的应用和热过程的方向性。 || From the first law to the second law of thermodynamics, from steam engine efficiency to the concept of entropy. Understand energy conservation in thermal processes and the directionality of heat.

## #molecular-world 01 / The Molecular World :: 微观粒子的大小、数量与运动 || Size, Quantity & Motion of Microscopic Particles

分子非常小、数量极多、永不停歇地运动。这三个基本事实构成了分子动理论的基石。 || Molecules are very small, extremely numerous, and in perpetual motion. These three facts form the foundation of molecular kinetic theory.

:::accordion
::panel { open: true }
### 分子的大小与阿伏加德罗常数 || Molecular Size & Avogadro's Number
🔬

**分子有多小？ || How Small Are Molecules?**

一般分子直径约 10⁻¹⁰ m（0.1 纳米）。如果把一个乒乓球放大到地球大小，球上的一个分子大约只有乒乓球那么大。 || Typical molecular diameter is ~10⁻¹⁰ m (0.1 nm). If a ping-pong ball were enlarged to the size of Earth, a molecule on it would be about the size of the original ping-pong ball.

N

A

**阿伏加德罗常数 || Avogadro's Number**

1 摩尔任何物质包含 N_A ≈ 6.022 × 10²³ 个分子。18 g 的水（约一汤匙）中含有 6 × 10²³ 个水分子。如果每秒数 10 亿个，需要数 190 亿年。 || 1 mole of any substance contains N_A ≈ 6.022 × 10²³ molecules. 18 g of water (~1 tablespoon) has 6 × 10²³ water molecules. Counting 1 billion per second would take 19 billion years.

$$
NA ≈ 6.022 × 10²³ mol⁻¹
$$

::panel
### 扩散现象与布朗运动 || Diffusion & Brownian Motion
- **扩散现象 || Diffusion** — 一滴墨水滴入清水中，无需搅拌即可慢慢均匀散开。这是因为水分子和墨水分子都在做无规则运动，相互碰撞导致混合。温度越高，扩散越快。 || A drop of ink in clear water spreads evenly without stirring. Water and ink molecules undergo random motion, colliding and mixing. Higher temperature means faster diffusion.
- **布朗运动 || Brownian Motion** — 1827 年植物学家布朗在显微镜下观察到花粉颗粒在水中做无规则运动。这不是花粉自己运动，而是无数水分子从各个方向不均匀撞击花粉造成的。颗粒越小、温度越高，布朗运动越明显。 || In 1827, botanist Brown observed pollen grains making random movements in water under a microscope. This isn't the pollen moving on its own, but countless water molecules striking unevenly from all sides. Smaller particles and higher temperatures make Brownian motion more pronounced.

> **区分：分子运动 vs 布朗运动 || Distinction: Molecular vs Brownian Motion**
> 布朗运动是悬浮颗粒的运动，不是分子的运动。但它间接证明了液体分子在做无规则运动。我们看不到单个分子的运动，但能看到分子运动的宏观证据。 || Brownian motion is the movement of suspended particles, not molecules themselves. But it indirectly proves liquid molecules are in random motion. We can't see individual molecules, but we can see macroscopic evidence of their motion.
:::

## #intermolecular 02 / Intermolecular Forces :: 引力与斥力的精妙平衡 || The Delicate Balance of Attraction & Repulsion

分子间同时存在引力和斥力。两种力的大小关系随距离变化，决定了物质呈现固态、液态还是气态。 || Both attraction and repulsion exist between molecules simultaneously. Their relative magnitudes change with distance, determining whether matter is solid, liquid, or gas.

:::accordion
::panel { open: true }
### 引力、斥力与平衡距离 || Attraction, Repulsion & Equilibrium Distance
→←

**斥力与引力同时存在 || Repulsion & Attraction Coexist**

分子间既有引力也有斥力，它们同时作用，但随距离变化不同。斥力随距离增大而急剧减小（下降极快），引力也随距离增大而减小，但比斥力慢。 || Molecules exert both attractive and repulsive forces simultaneously, but they change differently with distance. Repulsion drops off much faster than attraction as distance increases.

r₀

**平衡距离 r₀ ≈ 10⁻¹⁰ m || Equilibrium Distance r₀ ≈ 10⁻¹⁰ m**

当 r = r₀ 时，引力 = 斥力，合力为零。r < r₀ 时，斥力 > 引力，合力表现为斥力（固体难以压缩）。r > r₀ 时，引力 > 斥力，合力表现为引力（液体有表面张力）。 || At r = r₀, attraction = repulsion, net force = 0. When r < r₀, repulsion dominates (solids are hard to compress). When r > r₀, attraction dominates (liquids have surface tension).

| 距离 || Distance | 合力表现 || Net Force | 物质状态 || State | 生活例子 || Example |
| --- | --- | --- | --- |
| r < r₀ | 斥力为主 || Repulsion dominates | 固体特征 || Solid behavior | 固体不易压缩 || Solids are hard to compress |
| r = r₀ | 平衡（F = 0） || Equilibrium (F = 0) | 稳定位置 || Stable position | 分子自然间距 || Natural molecular spacing |
| r₀ < r < 10r₀ | 引力为主 || Attraction dominates | 液体特征 || Liquid behavior | 水滴呈球形 || Water drops form spheres |
| r > 10r₀ | ≈ 0 | 气体特征 || Gas behavior | 气体自由扩散 || Gas diffuses freely |
:::

## #internal-energy 03 / Internal Energy :: 分子运动与相互作用的能量总和 || Total Energy of Molecular Motion & Interaction

物体内部所有分子的动能和势能之和，就是物体的内能。温度、质量和物态都影响内能的大小。 || The sum of kinetic and potential energies of all molecules inside an object is its internal energy. Temperature, mass, and state of matter all affect internal energy.

:::accordion
::panel { open: true }
### 内能 = 分子动能 + 分子势能 || Internal Energy = Molecular KE + Molecular PE
- **分子动能 || Molecular KE** — 分子无规则运动的动能。温度是分子平均动能的标志——温度越高，分子运动越剧烈，平均动能越大。0°C 的水和 0°C 的冰，分子平均动能相同。 || KE of random molecular motion. Temperature is a measure of average molecular KE — higher temperature means more vigorous motion and greater average KE. Water and ice at 0°C have the same average molecular KE.
- **分子势能 || Molecular PE** — 分子间引力和斥力产生的势能，取决于分子间的距离。物态变化时（如熔化、汽化），温度不变但内能增加——增加的就是分子势能。 || PE arising from intermolecular forces, depends on molecular spacing. During phase changes (melting, vaporization), temperature stays constant but internal energy increases — the increase is molecular PE.

> **温度 vs 内能 || Temperature vs Internal Energy**
> 温度相同的物体，分子平均动能相同，但内能可能不同（因为质量、物态不同）。100°C 的一杯水和一壶水温度相同，但一壶水的内能远大于一杯水——因为分子总数多得多。 || Objects at the same temperature have the same average molecular KE, but may have different internal energies (due to different mass or phase). A pot and a cup of 100°C water have the same temperature, but the pot has far more internal energy — many more molecules.

::panel
### 改变内能的两种方式 || Two Ways to Change Internal Energy
| 方式 || Method | 本质 || Essence | 示例 || Example | 能量转化 || Energy Flow |
| --- | --- | --- | --- |
| 做功 || Doing Work | 能量转化 || Energy conversion | 搓手取暖、压缩气体升温 || Rubbing hands, gas compression | 机械能 → 内能 || Mechanical E → Internal E |
| 热传递 || Heat Transfer | 能量转移 || Energy transfer | 开水冷却、暖气取暖 || Hot water cooling, radiator heating | 内能从高温到低温 || Internal E: high → low temp |

> **做功与热传递等效 || Work & Heat Transfer Are Equivalent**
> 做功和热传递在改变内能上是等效的。用火加热一壶水（热传递）和用搅拌器搅拌水升温（做功），最终效果相同。这是焦耳实验的重要结论。 || Work and heat transfer are equivalent in changing internal energy. Heating water with fire (heat transfer) or stirring it (work) both achieve the same result. This was Joule's important experimental conclusion.
:::

## #exercises 04 / Enhanced Exercises :: 从基础到进阶：6 道精选题 || From Basic to Advanced: 6 Selected Problems

分子动理论侧重概念理解和现象解释，练习以判断和分析为主。 || Molecular kinetic theory focuses on conceptual understanding. Exercises emphasize judgment and analysis.

:::accordion
::panel { open: true }
### 基础题（3 题） || Basic Problems (3)
> **题 1：扩散现象 || Q1: Diffusion**
> 在热水和冷水中同时滴入一滴墨水，哪杯水中墨水扩散更快？为什么？ || Ink is dropped into hot water and cold water simultaneously. In which does it spread faster? Why?
> 热水中扩散更快。温度越高，分子运动越剧烈（平均动能越大），分子间碰撞越频繁，扩散速度越快。 || Faster in hot water. Higher temperature means more vigorous molecular motion (greater average KE), more frequent collisions, and faster diffusion.

> **题 2：布朗运动判断 || Q2: Brownian Motion Judgment**
> 以下关于布朗运动的说法，哪些正确？ A. 布朗运动是液体分子的运动 B. 颗粒越小布朗运动越明显 C. 温度越高布朗运动越剧烈 D. 布朗运动说明分子在做无规则运动 || Which statements about Brownian motion are correct? A. Brownian motion is the motion of liquid molecules B. Smaller particles show more obvious Brownian motion C. Higher temperature makes it more vigorous D. It proves molecules move randomly
> B、C、D 正确。A 错误——布朗运动是悬浮颗粒的运动，不是分子的运动。但它间接反映了分子的无规则运动。 || B, C, D are correct. A is wrong — Brownian motion is the motion of suspended particles, not molecules. But it indirectly reflects random molecular motion.

> **题 3：温度与内能 || Q3: Temperature & Internal Energy**
> 一杯 50°C 的水和一桶 50°C 的水，温度和内能哪个相同？哪个不同？ || A cup and a bucket of 50°C water — which is the same and which is different: temperature or internal energy?
> 温度相同（都是 50°C，分子平均动能相同），但内能不同（一桶水分子总数远多于一杯水，内能大得多）。 || Temperature is the same (both 50°C, same average molecular KE), but internal energy differs (the bucket has far more molecules, much greater internal energy).

::panel
### 进阶题（3 题） || Advanced Problems (3)
> **题 4：分子力分析 || Q4: Molecular Force Analysis**
> 将一根铅棒截成两段，把断面磨平后紧压在一起，悬挂重物也不分开。试用分子力的知识解释。 || A lead rod is cut in two, the surfaces polished flat, and pressed together — they hold even with weight hanging. Explain using molecular forces.
> 两段铅的断面磨平后，接触面处分子间距达到了可以产生分子引力的范围（r < 10r₀）。此时分子间引力使两段铅粘合在一起。日常物体断面不能粘合，是因为表面粗糙，实际接触面积极小，分子间距太大。 || After polishing, molecules at the contact surface reach distances where intermolecular attraction operates (r < 10r₀). Normal broken surfaces can't bond because they're rough, with very small actual contact area and molecules too far apart.

> **题 5：物态变化与内能 || Q5: Phase Change & Internal Energy**
> 0°C 的冰变成 0°C 的水，温度没变，内能是否变化？为什么？ || 0°C ice changes to 0°C water. Temperature unchanged. Does internal energy change? Why?
> 内能增加了。虽然温度没变（分子平均动能不变），但冰融化时需要吸收热量，这些热量用于打破固体的分子排列，增大分子间距，即增加了分子势能。所以内能 = 分子动能 + 分子势能中，势能部分增大了。 || Internal energy increases. Though temperature is unchanged (average molecular KE is the same), melting requires absorbing heat to break the solid molecular arrangement and increase molecular spacing — increasing molecular PE. So the PE component of internal energy increases.

> **题 6：内能改变方式 || Q6: Ways to Change Internal Energy**
> 分别举出两个通过做功和热传递改变内能的例子，并说明能量转化或转移的方向。 || Give two examples each of changing internal energy through work and heat transfer, and describe the energy flow direction.
> 做功：(1) 搓手取暖——机械能 → 内能，手变热；(2) 自行车刹车——动能 → 内能，刹车片发热。热传递：(1) 暖气取暖——内能从高温暖气片转移到低温空气；(2) 冰袋降温——内能从高温身体转移到低温冰袋。 || Work: (1) Rubbing hands — mechanical → internal energy; (2) Bicycle brakes — KE → internal energy. Heat transfer: (1) Radiator heating — internal energy from hot radiator to cold air; (2) Ice pack cooling — internal energy from warm body to cold ice.
:::
