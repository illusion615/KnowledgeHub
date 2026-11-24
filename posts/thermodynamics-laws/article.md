---
title: "热力学定律：从蒸汽机到熵 || Laws of Thermodynamics: From Steam Engines to Entropy"
eyebrow: "热学 · 第 2 篇 / 共 2 篇 || Thermodynamics · Part 2 of 2"
brand: "热学 || Thermodynamics"
date: 2026-04-17
strict_i18n: false
strict_density: true
lead: "热力学定律揭示了能量转化的规律和热过程的方向性。从蒸汽机效率到宇宙热寂，探索热学的深层本质。 || The laws of thermodynamics reveal energy conversion patterns and the directionality of thermal processes. From steam engine efficiency to heat death."
hero_actions:
  - "开始学习 || Start Learning | #first-law"
  - "直接练习 || Go to Practice | #practice"
panel_label: "本章目标 || Chapter Goals"
panel_title: "从能量守恒到熵 || From Energy Conservation to Entropy"
panel:
  - "掌握热力学第一定律 ΔU=Q+W || Master 1st law ΔU=Q+W"
  - "理解热力学第二定律两种表述 || Understand two statements of 2nd law"
  - "掌握理想气体状态方程 pV=nRT || Master ideal gas law pV=nRT"
  - "区分等温、等压、等容过程 || Distinguish isothermal/isobaric/isochoric"
metrics:
  - "核心公式 || Core Formula | ΔU = Q + W | 热力学第一定律 || First Law"
  - "关键概念 || Key Concept | ΔS ≥ 0 | 熵增原理 || Entropy Increase"
  - "交互实验 || Interactive Lab | 1 | 气体状态模拟 || Gas Law Simulator"
  - "难度 || Difficulty | ★★★★☆ | 需分子动理论基础 || Requires Molecular Theory"
style:
  accent: "#ea580c"
---

## #first-law 01 / First Law of Thermodynamics :: 能量守恒在热学中的体现 || Energy Conservation in Thermodynamics

系统内能的变化等于外界对系统做的功加上系统吸收的热量。能量不会凭空产生或消失。 || Change in internal energy equals work done on the system plus heat absorbed. Energy cannot be created or destroyed.

$$
\Delta U = Q + W
$$

:::accordion
::panel { open: true }
### 符号约定与理解 || Sign Convention & Understanding
> **📐 第一定律推导 || 📐 First Law Derivation**
> 系统（如气体）的内能变化来自两个途径：做功（W）和热传递（Q）。 || A system's (e.g., gas) internal energy changes through two channels: work (W) and heat transfer (Q).
> 约定：Q > 0 表示系统吸热，Q < 0 表示放热；W > 0 表示外界对系统做功（压缩），W < 0 表示系统对外做功（膨胀）。 || Convention: Q > 0 means system absorbs heat, Q < 0 means releases. W > 0 means external work on system (compression), W < 0 means system does work (expansion).

- **加热密封气体 || Heating Sealed Gas** — Q > 0（吸热），W = 0（体积不变），ΔU = Q > 0。内能增大，温度升高。 || Q > 0 (absorbs heat), W = 0 (constant volume), ΔU = Q > 0. Internal energy increases, temperature rises.
- **绝热膨胀 || Adiabatic Expansion** — Q = 0（绝热），W < 0（对外做功），ΔU = W < 0。内能减小，温度降低。 || Q = 0 (adiabatic), W < 0 (system does work), ΔU = W < 0. Internal energy decreases, temperature drops.
- **等温过程 || Isothermal Process** — ΔU = 0（温度不变），Q = -W。吸收的热量全部用于对外做功，或外界做功全部以热量形式放出。 || ΔU = 0 (constant temp), Q = -W. All absorbed heat goes to work, or all work done is released as heat.
:::

## #second-law 02 / Second Law of Thermodynamics :: 热过程的方向性 || Directionality of Thermal Processes

第一定律说能量守恒，第二定律说自然过程有方向：热量自发地从高温流向低温，永远不会反过来。 || The first law says energy is conserved; the second says natural processes have direction: heat flows spontaneously from hot to cold, never the reverse.

:::accordion
::panel { open: true }
### 两种经典表述 || Two Classic Statements
| 表述 || Statement | 内容 || Content | 关键词 || Keyword |
| --- | --- | --- |
| 克劳修斯 || Clausius | 热量不能自发地从低温物体传到高温物体 || Heat cannot spontaneously flow from cold to hot | 自发 || Spontaneous |
| 开尔文 || Kelvin | 不可能从单一热源吸热全部转化为功而不产生其他影响 || Cannot convert all heat from a single source to work with no other effect | 单一热源 || Single source |

> **💡 两种表述等价 || 💡 Both Statements Are Equivalent**
> 克劳修斯表述和开尔文表述是等价的，可以互相推导。违反其中一个，必然违反另一个。它们从不同角度说明了同一件事：自然过程的方向性（不可逆性）。 || Clausius and Kelvin statements are equivalent; violating one violates the other. They describe the same thing from different angles: the directionality (irreversibility) of natural processes.

::panel
### 熵与不可逆性 || Entropy & Irreversibility
$$
\Delta S \geq 0 \quad (\text{isolated system})
$$

S

**熵是什么 || What Is Entropy**

熵（S）是体系「无序程度」的量度。有序排列的熵低，混乱无序的熵高。洗过的扑克牌 vs 洗牌后——洗牌后熵更大。 || Entropy (S) measures 'disorder.' Ordered arrangements have low entropy, disordered ones have high entropy.

↑

**熵增原理 || Entropy Increase Principle**

孤立系统的熵永远不会减少（ΔS ≥ 0）。自然界的一切自发过程都朝着熵增大的方向进行。这就是为什么碎掉的杯子不会自动复原。 || Entropy of an isolated system never decreases (ΔS ≥ 0). All spontaneous processes proceed toward increasing entropy.
:::

## #ideal-gas 03 / Ideal Gas Law :: p、V、T 的统一关系 || The Unified Relationship of p, V, T

理想气体状态方程将压强、体积和温度三个宏观量统一联系起来。 || The ideal gas law unifies pressure, volume, and temperature.

$$
pV = nRT
$$

:::accordion
::panel { open: true }
### 三种等值过程对比 || Three Special Processes
| 过程 || Process | 不变量 || Constant | 关系 || Relation | 图像 || Graph |
| --- | --- | --- | --- |
| 等温 || Isothermal | T | pV = C | p-V 双曲线 || p-V hyperbola |
| 等压 || Isobaric | p | V/T = C | V-T 过原点直线 || V-T line through origin |
| 等容 || Isochoric | V | p/T = C | p-T 过原点直线 || p-T line through origin |

::panel
### 气体状态模拟器 || Gas Law Simulator
调节温度和外部压强，观察活塞位置（体积）的变化。气体分子运动速度随温度改变。 || Adjust temperature and external pressure to observe piston position (volume) changes. Gas molecular speed changes with temperature.

> **🧪 交互实验沙盒 || Interactive Simulation Sandbox** (`#gasCanvas`) — 交互可调参数：温度 T || Temp T、压强 P || Pressure P。
:::

## #practice 04 / Enhanced Exercises :: 从基础到进阶：6 道精选题 || From Basic to Advanced: 6 Selected Problems

:::accordion
::panel { open: true }
### 基础题（3 题） || Basic (3)
> **题 1：第一定律计算 || Q1: First Law Calculation**
> 一定量的气体吸收 500 J 热量，同时对外做了 200 J 的功。气体内能变化了多少？ || Gas absorbs 500 J of heat while doing 200 J of work on surroundings. What is the change in internal energy?
> **查看解析 || Show Solution**
> 
> Q = 500 J（吸热为正），W = -200 J（对外做功为负）。ΔU = Q + W = 500 + (-200) = 300 J。气体内能增加 300 J。 || Q = 500 J (absorbed, positive), W = -200 J (work on surroundings, negative). ΔU = Q + W = 500 - 200 = 300 J.

> **题 2：第二定律判断 || Q2: Second Law Judgment**
> 以下说法中正确的是？A. 热量不能从低温物体传到高温物体 B. 不可能使热量完全转化为功 C. 不可能从单一热源吸热全部转化为功而不产生其他影响 D. 所有涉及热现象的宏观过程都是可逆的 || Which is correct? A. Heat cannot transfer from cold to hot B. Heat cannot be fully converted to work C. Cannot convert all heat from single source to work with no other effect D. All thermal macro-processes are reversible
> **查看解析 || Show Solution**
> 
> 答案：C。A 错，冰箱可以（但不是自发的）；B 错，等温膨胀可以（但有其他影响）；D 错，宏观热过程是不可逆的。 || Answer: C. A is wrong (refrigerators do it, just not spontaneously). B is wrong (isothermal expansion can, with other effects). D is wrong (macro thermal processes are irreversible).

> **题 3：等温过程 || Q3: Isothermal Process**
> 一定量的理想气体在等温过程中体积从 2 L 变为 4 L，初始压强为 2 atm。求末状态压强。 || Ideal gas undergoes isothermal process: V changes from 2 L to 4 L, initial pressure 2 atm. Find final pressure.
> **查看解析 || Show Solution**
> 
> 等温过程 pV = C：p₁V₁ = p₂V₂，2 × 2 = p₂ × 4，p₂ = 1 atm。 || Isothermal: p₁V₁ = p₂V₂, 2 × 2 = p₂ × 4, p₂ = 1 atm.

::panel
### 进阶题（3 题） || Advanced (3)
> **题 4：综合过程分析 || Q4: Combined Process Analysis**
> 一定量气体先等容加热（p 从 1 atm → 2 atm），再等压膨胀（V 从 3 L → 6 L）。求末状态温度与初始的比值 T₂/T₁。 || Gas first heats at constant volume (p: 1→2 atm), then expands at constant pressure (V: 3→6 L). Find T₂/T₁.
> **查看解析 || Show Solution**
> 
> 等容过程：p/T = C，p₁/T₁ = p₂/T'，T' = 2T₁。等压过程：V/T = C，V₁/T' = V₂/T₂，3/(2T₁) = 6/T₂，T₂ = 4T₁。所以 T₂/T₁ = 4。 || Isochoric: T' = 2T₁. Isobaric: 3/(2T₁) = 6/T₂, T₂ = 4T₁. So T₂/T₁ = 4.

> **题 5：绝热过程 || Q5: Adiabatic Process**
> 快速压缩气缸中的气体（可视为绝热过程），气体温度升高还是降低？用第一定律说明原因。 || Rapidly compressing gas in a cylinder (adiabatic): does temperature rise or fall? Explain using the first law.
> **查看解析 || Show Solution**
> 
> 绝热：Q = 0。外界对气体做功 W > 0。ΔU = Q + W = W > 0，内能增大，温度升高。柴油机就是利用这个原理点火的。 || Adiabatic: Q = 0. External work on gas W > 0. ΔU = W > 0, internal energy increases, temperature rises. Diesel engines use this principle.

> **题 6：熵增应用 || Q6: Entropy Application**
> 解释为什么不加搅拌时，一杯咖啡中加入的牛奶会自发混合均匀，但混合后的咖啡不会自发分离成咖啡和牛奶两层。 || Explain why milk added to coffee mixes spontaneously without stirring, but mixed coffee never spontaneously separates back into two layers.
> **查看解析 || Show Solution**
> 
> 混合是自发过程，熵增大（从有序到无序）。分离是反向过程，熵会减小，违反熵增原理。在孤立系统中，自发过程总是朝着熵增大（更无序）的方向进行。虽然分离不违反能量守恒（第一定律），但违反了第二定律。 || Mixing is spontaneous, entropy increases (order to disorder). Separation would decrease entropy, violating entropy increase principle. In isolated systems, spontaneous processes always go toward greater entropy. Separation doesn't violate energy conservation (1st law) but violates the 2nd law.
:::

## #roadmap 05 / Series Navigation :: 热学系列 || Thermodynamics Series

- [Part 1：分子动理论与内能 || Molecular Kinetic Theory](../molecular-kinetic-theory/)
- [Part 2：热力学定律（当前） || Thermodynamics Laws (Current)](#)

### 🎉 热学系列已完结！ || 🎉 Thermodynamics Series Complete!

恭喜你完成了热学全部 2 篇学习！从分子动理论到热力学定律，你已经理解了热现象的微观本质和能量转化的基本规律。接下来可以挑战电磁学系列。 || Congratulations on completing both Thermodynamics chapters! Next: try the Electromagnetism series.

## #first-law 01 / The First Law of Thermodynamics :: 能量不能凭空产生或消灭 || Energy Cannot Be Created or Destroyed

热力学第一定律是能量守恒定律在热现象中的具体表达：系统内能的变化等于外界对它做的功和传递给它的热量之和。 || The First Law is the expression of energy conservation in thermal phenomena: the change in internal energy equals the sum of work done on the system and heat transferred to it.

:::accordion
::panel { open: true }
### 公式与符号约定 || Formula & Sign Conventions
$$
ΔU = Q + W
$$

ΔU

**内能变化量 || Change in Internal Energy**

ΔU > 0：内能增加（温度升高或相变吸热）。ΔU < 0：内能减少（温度降低或相变放热）。 || ΔU > 0: internal energy increases (temperature rises or endothermic phase change). ΔU < 0: internal energy decreases.

Q

**热量 || Heat**

Q > 0：系统吸收热量。Q < 0：系统放出热量。热量是热传递过程中内能转移的量度。 || Q > 0: system absorbs heat. Q < 0: system releases heat. Heat measures internal energy transfer during heat transfer.

W

**外界对系统做的功 || Work Done on the System**

W > 0：外界对系统做功（压缩气体）。W < 0：系统对外做功（气体膨胀推活塞）。注意：部分教材使用 ΔU = Q − W（W 为系统对外做功），符号相反。 || W > 0: work done on the system (compressing gas). W < 0: system does work on surroundings (gas expands). Note: some texts use ΔU = Q − W where W is work done by the system.

- **打气筒变热 || Bicycle Pump Gets Hot** — 按压打气筒时，你对气体做功（W > 0），气体内能增加（ΔU > 0），气体温度升高。如果忽略散热（Q = 0），则 ΔU = W。 || When pumping, you do work on the gas (W > 0), internal energy increases (ΔU > 0), temperature rises. If heat loss is negligible (Q = 0), then ΔU = W.
- **加热水 || Heating Water** — 用火加热水（Q > 0），水的内能增加（ΔU > 0），温度升高。如果容器体积不变（W = 0），则 ΔU = Q。热传递是改变内能的方式之一。 || Heating water with fire (Q > 0) increases internal energy (ΔU > 0), temperature rises. If container volume is fixed (W = 0), then ΔU = Q.

> **永动机不可能 || Perpetual Motion Is Impossible**
> 第一类永动机——不消耗任何能量就能永远运动并对外做功的机器——违反了热力学第一定律。能量不能凭空产生，任何机器的输出不能超过输入。 || A perpetual motion machine of the first kind — one that runs forever and does work without consuming energy — violates the First Law. Energy cannot be created from nothing; output can never exceed input.
:::

## #second-law 02 / The Second Law of Thermodynamics :: 热量自发地从高温流向低温 || Heat Spontaneously Flows from Hot to Cold

热力学第二定律揭示了自然过程的方向性：热量可以自发地从高温物体传向低温物体，但反过来不会自发发生。 || The Second Law reveals the directionality of natural processes: heat spontaneously flows from hot to cold objects, but the reverse doesn't happen spontaneously.

:::accordion
::panel { open: true }
### 两种经典表述 || Two Classic Statements
| 表述 || Statement | 内容 || Content | 关键词 || Keywords |
| --- | --- | --- |
| 克劳修斯 || Clausius | 热量不可能自发地从低温物体传到高温物体 || Heat cannot spontaneously flow from cold to hot | 热传导方向 || Heat flow direction |
| 开尔文 || Kelvin | 不可能从单一热源吸热并全部转化为功而不引起其他变化 || Cannot extract heat from a single source and convert it entirely to work | 热机效率 || Engine efficiency |

> **两种表述等价 || Both Statements Are Equivalent**
> 克劳修斯表述从热传导角度出发，开尔文表述从热机效率角度出发，它们在数学上是等价的。违反一个必然违反另一个。 || The Clausius statement approaches from heat conduction, the Kelvin statement from engine efficiency. They are mathematically equivalent — violating one necessarily violates the other.

::panel
### 熵与不可逆性 || Entropy & Irreversibility
S

**熵（Entropy） || Entropy**

熵是衡量系统无序程度的物理量。自然过程总是朝着熵增加的方向进行——系统自发地从有序走向无序。打碎的鸡蛋不会自己复原，打散的扑克牌不会自己排回顺序。 || Entropy measures the degree of disorder in a system. Natural processes always proceed toward increasing entropy — systems spontaneously move from order to disorder. A broken egg won't reassemble; shuffled cards won't re-sort themselves.

→

**不可逆性 || Irreversibility**

一切自发的宏观过程都是不可逆的：热传导（高温→低温）、扩散（浓→稀）、摩擦生热（机械能→内能）。虽然每个过程不违反能量守恒，但反方向不会自发发生。这就是时间箭头的物理本质。 || All spontaneous macroscopic processes are irreversible: heat conduction (hot→cold), diffusion (concentrated→dilute), friction (mechanical→thermal). Each conserves energy, but the reverse doesn't happen spontaneously. This is the physical basis of the arrow of time.

- **冰箱不违反第二定律 || Refrigerators Don't Violate the Second Law** — 冰箱把热量从冷的内部传到热的外部，看起来违反克劳修斯表述？不！冰箱消耗了电能（做功），第二定律说的是不能自发地从冷传到热——借助外界做功可以实现。 || A fridge moves heat from cold inside to hot outside — seems to violate Clausius? No! It consumes electricity (work). The Second Law says heat can't spontaneously flow from cold to hot — but with external work, it can.
- **热机效率限制 || Heat Engine Efficiency Limit** — 任何热机都不可能将吸收的热量 100% 转化为功。必须有一部分热量排放到低温热源。卡诺热机给出了理论最高效率：η = 1 − T_低/T_高。 || No heat engine can convert 100% of absorbed heat into work. Some heat must be released to a cold reservoir. The Carnot engine gives the theoretical maximum efficiency: η = 1 − T_cold/T_hot.

$$
ηCarnot = 1 − Tcold / Thot
$$
:::

## #gas-laws 03 / Gas State Equations :: 理想气体的压强、体积与温度 || Pressure, Volume & Temperature of Ideal Gases

理想气体状态方程将气体的三个状态量（p、V、T）统一在一个公式中，是描述气体宏观行为的核心工具。 || The ideal gas law unifies three state variables (p, V, T) in one equation — the core tool for describing macroscopic gas behavior.

:::accordion
::panel { open: true }
### 理想气体状态方程 || Ideal Gas Law
$$
pV = nRT
$$

p

**压强（Pa） || Pressure (Pa)**

气体对容器壁的压力。大量分子不断撞击容器壁产生的宏观效果。标准大气压 = 1.013 × 10⁵ Pa。 || The force gas exerts on container walls. The macroscopic effect of countless molecules striking the walls. Standard atmospheric pressure = 1.013 × 10⁵ Pa.

V

**体积（m³） || Volume (m³)**

气体占据的空间大小。气体没有固定体积，会充满整个容器。 || The space occupied by the gas. Gases have no fixed volume — they fill the entire container.

T

**热力学温度（K） || Thermodynamic Temperature (K)**

必须用开尔文温度！T(K) = t(°C) + 273.15。绝对零度（0 K = −273.15°C）是理论下限，分子运动完全停止。 || Must use Kelvin! T(K) = t(°C) + 273.15. Absolute zero (0 K = −273.15°C) is the theoretical minimum where molecular motion ceases.

::panel
### 三种特殊过程 || Three Special Processes
| 过程 || Process | 条件 || Condition | 规律 || Law | 示例 || Example |
| --- | --- | --- | --- |
| 等温过程 || Isothermal | T = const | pV = 常数（玻意耳） || pV = const (Boyle) | 注射器缓慢推压 || Slowly pressing a syringe |
| 等压过程 || Isobaric | p = const | V/T = 常数（盖-吕萨克） || V/T = const (Gay-Lussac) | 活塞加热气体 || Heating gas in piston |
| 等容过程 || Isochoric | V = const | p/T = 常数（查理） || p/T = const (Charles) | 密封容器加热 || Heating sealed container |

> **一般气体状态方程 || General Gas State Equation**
> 对于一定质量的理想气体，在两个不同状态之间：p₁V₁/T₁ = p₂V₂/T₂。这个方程在三个特殊过程中分别简化为上表中的规律。 || For a fixed mass of ideal gas between two states: p₁V₁/T₁ = p₂V₂/T₂. This simplifies to each law in the table for the three special processes.

$$
p₁V₁ / T₁ = p₂V₂ / T₂
$$
:::

## #exercises 04 / Enhanced Exercises :: 从基础到进阶：6 道精选题 || From Basic to Advanced: 6 Selected Problems

热力学结合了概念理解与定量计算，注意温度单位换算（°C → K）。 || Thermodynamics combines conceptual understanding with quantitative calculation. Watch temperature unit conversion (°C → K).

:::accordion
::panel { open: true }
### 基础题（3 题） || Basic Problems (3)
> **题 1：第一定律应用 || Q1: First Law Application**
> 一定量气体吸收了 500 J 的热量，同时对外做了 200 J 的功。求气体内能的变化。 || A gas absorbs 500 J of heat and does 200 J of work on its surroundings. Find the change in internal energy.
> ΔU = Q + W = 500 + (−200) = 300 J。气体吸热 500 J，其中 200 J 用于对外做功，300 J 转化为内能增加。 || ΔU = Q + W = 500 + (−200) = 300 J. 500 J absorbed, 200 J used for work, 300 J increases internal energy.

> **题 2：第二定律判断 || Q2: Second Law Judgment**
> 以下过程哪些违反了热力学第二定律？ A. 热量从火炉传到水中 B. 冰箱将食物热量排到室内 C. 汽车发动机将汽油的全部热量转化为动力 D. 碎玻璃自动恢复成完整的杯子 || Which of these violate the Second Law? A. Heat from stove to water B. Fridge expels heat to room C. Car engine converts 100% of fuel heat to motion D. Broken glass spontaneously reassembles
> C 和 D 违反。A 是自发高温→低温传热，正常。B 冰箱消耗电能做功，不违反。C 违反开尔文表述——不可能 100% 转化热为功。D 违反熵增原理——碎片不会自发恢复有序。 || C and D violate it. A is natural hot→cold transfer. B uses electricity (work). C violates Kelvin's statement — can't convert 100% heat to work. D violates entropy increase — disorder won't spontaneously become order.

> **题 3：等温过程 || Q3: Isothermal Process**
> 温度不变时，将气体体积从 2 L 压缩到 1 L，原来压强为 1 atm，求压缩后的压强。 || At constant temperature, gas volume is compressed from 2 L to 1 L. Initial pressure is 1 atm. Find the final pressure.
> 等温过程：p₁V₁ = p₂V₂ → 1 × 2 = p₂ × 1 → p₂ = 2 atm。体积减半，压强加倍。 || Isothermal: p₁V₁ = p₂V₂ → 1 × 2 = p₂ × 1 → p₂ = 2 atm. Halving volume doubles pressure.

::panel
### 进阶题（3 题） || Advanced Problems (3)
> **题 4：气体状态变化 || Q4: Gas State Change**
> 密封容器中的气体，初始状态为 27°C、2 atm。加热到 127°C 后，压强是多少？ || Gas in a sealed container starts at 27°C, 2 atm. After heating to 127°C, what is the pressure?
> 等容过程（密封容器 V 不变）：p₁/T₁ = p₂/T₂。T₁ = 27 + 273 = 300 K，T₂ = 127 + 273 = 400 K。p₂ = p₁ × T₂/T₁ = 2 × 400/300 = 8/3 ≈ 2.67 atm。 || Isochoric (sealed, V constant): p₁/T₁ = p₂/T₂. T₁ = 300 K, T₂ = 400 K. p₂ = 2 × 400/300 ≈ 2.67 atm.

> **题 5：卡诺热机效率 || Q5: Carnot Engine Efficiency**
> 一台热机高温热源温度 527°C，低温热源温度 27°C。求卡诺热机理论最高效率。 || A heat engine operates between 527°C (hot) and 27°C (cold). Find the maximum Carnot efficiency.
> T_hot = 527 + 273 = 800 K，T_cold = 27 + 273 = 300 K。η = 1 − T_cold/T_hot = 1 − 300/800 = 1 − 0.375 = 62.5%。实际热机效率一定低于此值。 || T_hot = 800 K, T_cold = 300 K. η = 1 − 300/800 = 62.5%. Actual engines are less efficient.

> **题 6：综合状态方程 || Q6: Combined State Equation**
> 轮胎内气体初始状态：27°C、2.5 atm、10 L。高速行驶后温度升至 87°C，轮胎体积膨胀到 10.5 L。求此时轮胎内气压。 || Tire gas initial state: 27°C, 2.5 atm, 10 L. After driving, temperature rises to 87°C and volume expands to 10.5 L. Find the new pressure.
> p₁V₁/T₁ = p₂V₂/T₂ → 2.5 × 10/300 = p₂ × 10.5/360。p₂ = 2.5 × 10 × 360/(300 × 10.5) = 9000/3150 ≈ 2.86 atm。温度升高和体积膨胀的共同效果使气压略有升高。 || p₁V₁/T₁ = p₂V₂/T₂ → 2.5 × 10/300 = p₂ × 10.5/360. p₂ = 9000/3150 ≈ 2.86 atm. Combined temperature rise and volume expansion slightly increase pressure.
:::
