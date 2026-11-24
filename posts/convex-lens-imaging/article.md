---
title: "凸透镜成像规律：物距决定像的性质 || Convex Lens Imaging: How Object Distance Sets the Image"
eyebrow: "光学 · 中考专题 || Optics · Zhongkao Focus"
brand: "光学 || Optics"
date: 2026-06-07
strict_i18n: false
strict_density: true
lead: "不背规律表，用一张可拖动的光路图把物距、像距和像的虚实、正倒、大小连成一条连续的规律。 || Skip the lookup table — one draggable ray diagram ties object distance, image distance, and the image's real/virtual, orientation, and size into one continuous rule."
hero_actions:
  - "打开模拟器 || Open Simulator | #simulator"
  - "直接练习 || Go to Practice | #practice"
panel_label: "本章目标 || Chapter Goals"
panel_title: "把规律表换成可推导的光路 || Replace the Table With Ray Logic"
panel:
  - "认识凸透镜三要素：光心、焦点、焦距 || Identify the three lens elements: optical center, focus, focal length"
  - "掌握三条特殊光线的作图法 || Master the three principal rays for ray tracing"
  - "用模拟器归纳成像规律，而非背表 || Derive the imaging rule with a simulator, not by rote"
  - "解释照相机、投影仪、放大镜、眼睛 || Explain cameras, projectors, magnifiers, and the eye"
metrics:
  - "第一判据 || First Boundary | u = f | 一倍焦距分虚实 || Focal point splits real/virtual"
  - "第二判据 || Second Boundary | u = 2f | 二倍焦距分大小 || 2f splits enlarged/reduced"
  - "交互实验 || Interactive Lab | 1 | 凸透镜成像模拟器 || Convex Lens Simulator"
  - "难度 || Difficulty | ★★★☆☆ | 中考核心 || Zhongkao Core"
style:
  accent: "#0d9488"
---

## #basics 01 / Lens Basics :: 先认清三要素和两段关键距离 || First, Identify the Three Elements and Two Key Distances

规律的所有计算都围绕焦距 f 展开，而描述成像还需要两段距离：物距 u 和像距 v。先分清凸凹透镜，再锁定光心、焦点、焦距与 u、v 的含义，后面的光路才画得准。 || Every rule is measured against the focal length f, and describing an image needs two distances: object distance u and image distance v. Tell convex from concave, then lock down the optical center, focus, focal length, and the meaning of u and v before any ray tracing.

:::comparison
::versus 凸透镜 · 会聚 || Convex · Converging { highlight: true }
### 凸透镜 · 会聚 || Convex · Converging
中间厚、边缘薄。平行光经过后会聚到一点（实焦点），是本章成像规律的主角。 || Thick center, thin edge. Parallel light converges to one real focal point. It is the focus of this chapter's imaging rule.

::versus 凹透镜 · 发散 || Concave · Diverging
### 凹透镜 · 发散 || Concave · Diverging
中间薄、边缘厚。平行光经过后发散，反向延长线交于虚焦点，永远成正立缩小的虚像。 || Thin center, thick edge. Parallel light diverges; back-extensions meet at a virtual focus. It always forms an upright, reduced, virtual image.
:::

⊙

### 光心 O || Optical Center O

透镜中心。通过光心的光线方向不改变，是作图时最稳的一条参考线。 || The lens center. A ray through it keeps its direction — the most reliable reference line when drawing.

✶

### 焦点 F || Focus F

平行于主光轴的光线会聚处。凸透镜两侧各有一个焦点，对称分布。 || Where rays parallel to the principal axis converge. A convex lens has one focus on each side, symmetrically placed.

⇹

### 焦距 f || Focal Length f

光心到焦点的距离。焦距越短，会聚能力越强。f 是判断成像性质的统一标尺。 || Distance from optical center to focus. Shorter f means stronger converging power. f is the single yardstick for the image's nature.

↦

### 物距 u || Object Distance u

物体到透镜光心的距离。物体离透镜越远，u 越大；成像规律就是看 u 落在 f、 2f 划出的哪一段。 || Distance from the object to the lens's optical center. The farther the object, the larger u; the imaging rule comes down to which region u falls into, as marked by f and 2f.

↤

### 像距 v || Image Distance v

像到透镜光心的距离。像与物在透镜异侧时是实像，同侧时是虚像；u 一定，v 也随之确定。 || Distance from the image to the lens's optical center. A real image sits opposite the object; a virtual image sits on the same side; once u is set, v follows.

:::callout { title: "为什么盯住 f || Why Anchor on f" }
成像性质从不取决于物距的绝对厘米数，而取决于物距 u 与 f、2f 的相对位置。把 f 当作刻度，u 落在哪一段，像就长什么样——这正是举一反三的钥匙。 || The image's nature never depends on the absolute centimeters of object distance, but on where u sits relative to f and 2f. Treat f as the ruler: the region u falls into decides the image — this is the key to generalizing.
:::

## #rays 02 / The Three Principal Rays :: 三条特殊光线，任选两条定位像 || Three Principal Rays, Any Two Locate the Image

凸透镜一共有三条走向已知的特殊光线，它们是你的工具箱。但像的位置由两条光线的交点就能唯一确定，所以作图时从三条里任选两条即可，第三条只用来验证。下面的模拟器就固定用第 1、2 条（平行光线 + 过光心光线）。 || A convex lens has three rays whose paths are already known — they are your toolbox. The image position is fixed by the intersection of just two of them, so when drawing you pick any two of the three; the third only serves to verify. The simulator below always uses rays 1 and 2 (the parallel ray and the center ray).

1

### 平行光线 → 过焦点 || Parallel Ray → Through Focus

从物体顶端平行于主光轴射向透镜，折射后必过另一侧的焦点 F。 || A ray from the object's tip travels parallel to the principal axis, then after refraction passes through the focus F on the far side.

2

### 过光心光线 → 不偏折 || Ray Through Center → No Bend

从物体顶端射向光心 O 的光线，穿过透镜后方向不变，沿直线继续传播。 || A ray from the object's tip aimed at the optical center O passes straight through without changing direction.

3

### 过焦点光线 → 变平行（备用验证） || Ray Through Focus → Becomes Parallel (Backup Check)

先经过同侧焦点 F 再射向透镜的光线，折射后平行于主光轴射出，与第 1 条互为逆过程。它和前两条交于同一点，所以只作验证，作图时可不画。 || A ray passing through the near focus F before reaching the lens emerges parallel to the principal axis — the reverse of ray 1. It meets the other two at the same point, so it only confirms the result and can be left out when drawing.

:::callout { title: "实像与虚像的判断 || Real vs Virtual Image" }
折射后的光线本身相交，交点处是实像（能用光屏承接，倒立）；折射光线发散、要靠反向延长线才相交，交点处是虚像（不能用光屏承接，正立）。 || When the refracted rays themselves intersect, the meeting point is a real image (catchable on a screen, inverted). When refracted rays diverge and only their back-extensions intersect, that point is a virtual image (not catchable, upright).
:::

## #simulator 03 / The Imaging Rule :: 拖动物体，让规律自己浮现 || Drag the Object and Watch the Rule Emerge

拖动左侧蜡烛或调节焦距，光路会实时重画，下方读数同步给出物距、像距、放大率与像的性质。为保持图面清爽，模拟器统一只画两条特殊光线——平行光线和过光心光线，它们的交点（或反向延长线的交点）就是像的位置；第三条过焦点的光线只是冗余验证，这里略去。 || Drag the candle on the left or adjust the focal length; the ray paths redraw live, and the readout updates object distance, image distance, magnification, and the image's nature. To keep the diagram clean, the simulator always draws just two principal rays — the parallel ray and the center ray; their intersection (or that of their back-extensions) locates the image. The third ray through the focus is only redundant confirmation and is omitted here.

:::sandbox { id: "lens-canvas", title: "交互实验沙盒 || Interactive Simulation Sandbox" }
交互可调参数：焦距 f： || Focal length f:、提示：调焦距时透镜凹凸度同步变化，拖动蜡烛改变物距 || Tip: the lens curvature changes with f; drag the candle to change object distance。
:::

:::callout { title: "实像和虚像不会同时出现 || Real and Virtual Images Never Coexist" }
同一时刻只有一个像，三种情况互斥。物体在一倍焦距以外（u > f），折射光线真正会聚于透镜另一侧，成倒立实像；物体正好在焦点（u = f），折射光线平行射出，不成像；物体进入一倍焦距以内（u < f），折射光线发散，只能靠反向延长线在同侧相交，这时才出现正立虚像。所以 u > f 时并不存在虚像，u < f 时也不存在实像——拖动蜡烛缓慢越过焦点 F，就能看到像在这一刻从倒立实像翻成正立虚像。 || Only one image exists at any moment; the three cases are mutually exclusive. With the object beyond one focal length (u > f), the refracted rays truly converge on the far side, forming an inverted real image; right at the focus (u = f), the refracted rays leave parallel and no image forms; once the object moves inside one focal length (u < f), the refracted rays diverge and meet only along their back-extensions on the same side, and only then does an upright virtual image appear. So no virtual image exists while u > f, and no real image exists while u < f — drag the candle slowly across the focus F to watch the image flip from inverted-real to upright-virtual at that instant.
:::

:::accordion
::panel { open: true }
### 从观察到规律：完整成像表 || From Observation to the Full Imaging Table
把模拟器里五段物距的观察结果按顺序排好，规律一目了然——物距越小，像越往外、越大。 || Lay out the five object-distance regions from the simulator in order, and the rule is obvious: as the object moves closer, the image moves farther out and grows larger.

| 物距 u || Object u | 像距 v || Image v | 虚实 || Real/Virtual | 正倒 || Orientation | 大小 || Size | 应用 || Use |
| --- | --- | --- | --- | --- | --- |
| u > 2f | f < v < 2f | 实像 || Real | 倒立 || Inverted | 缩小 || Reduced | 照相机、眼睛 || Camera, eye |
| u = 2f | v = 2f | 实像 || Real | 倒立 || Inverted | 等大 || Same size | 测焦距 || Measure f |
| f < u < 2f | v > 2f | 实像 || Real | 倒立 || Inverted | 放大 || Enlarged | 投影仪、幻灯机 || Projector, slide |
| u = f | 不成像 || No image | 探照灯 || Searchlight |   |   |   |
| u < f | 同侧 || Same side | 虚像 || Virtual | 正立 || Upright | 放大 || Enlarged | 放大镜 || Magnifier |

::panel
### 两句口诀背后的物理 || The Physics Behind Two Mnemonics
口诀只是观察的压缩，不要孤立地背。结合模拟器里的边界，理解它们指的是哪条分界线。 || Mnemonics are just compressed observations — do not memorize them in isolation. Tie each to the boundary it marks in the simulator.

> **一倍焦距分虚实 || f Splits Real and Virtual**
> u 越过 f 这条线，像就从实变虚、从倒立变正立。把物体从 f 外慢慢推进到 f 内，观察像突然翻面的瞬间。 || As u crosses the f line, the image flips from real to virtual and from inverted to upright. Push the object from outside f to inside f and watch the moment it turns over.

> **二倍焦距分大小 || 2f Splits Large and Small**
> 在实像范围内，u 越过 2f 这条线，像就从缩小变放大。u=2f 时恰好等大，是测焦距的标准方法。 || Within the real-image range, as u crosses 2f the image switches from reduced to enlarged. At u=2f it is exactly the same size — the standard way to measure f.

> **物近像远像变大 || Closer Object, Farther and Larger Image**
> 对实像而言，物体靠近透镜（u 减小），像就远离透镜（v 增大）且变大。这条动态规律在模拟器里拖一次就记住了。 || For a real image, as the object approaches the lens (u decreases), the image recedes (v increases) and grows. One drag in the simulator makes this dynamic rule stick.
:::

## #applications 04 / Four Applications :: 同一规律，四种生活仪器 || One Rule, Four Everyday Instruments

照相机、投影仪、放大镜和眼睛，全部是凸透镜成像规律的特例。认出每种仪器对应哪一段物距，就能反推它的成像特点。 || Cameras, projectors, magnifiers, and the eye are all special cases of one rule. Recognize which object-distance region each uses and you can deduce its image.

:::insight-grid { cols: 2 }
::card 01
### 照相机：u > 2f || Camera: u > 2f
景物离镜头远，成倒立、缩小的实像落在底片或传感器上。拍近景时镜头前伸（增大像距）以重新对焦。 || The scene is far from the lens, forming an inverted, reduced, real image on the film or sensor. For close shots the lens extends forward (increasing image distance) to refocus.

::card 02
### 投影仪：f < u < 2f || Projector: f < u < 2f
胶片放在一倍到二倍焦距之间，成倒立、放大的实像投到屏幕上。所以胶片要倒着插，屏幕上才正。 || The slide sits between f and 2f, forming an inverted, enlarged, real image on the screen. That is why the slide is inserted upside down — so the screen shows it upright.

::card 03
### 放大镜：u < f || Magnifier: u < f
把物体放在一倍焦距以内，成正立、放大的虚像。眼睛透过透镜看到的是放大的虚像，不能用光屏承接。 || Place the object inside the focal length to get an upright, enlarged, virtual image. The eye sees an enlarged virtual image through the lens, which cannot be caught on a screen.

::card 04
### 眼睛与矫正 || The Eye and Correction
晶状体相当于可调焦凸透镜，在视网膜上成倒立缩小实像。近视像落在视网膜前，用凹透镜矫正；远视像落在后，用凸透镜矫正。 || The lens of the eye acts as a tunable convex lens, forming an inverted, reduced, real image on the retina. Myopia focuses in front of the retina (corrected by a concave lens); hyperopia focuses behind it (corrected by a convex lens).
:::

## #advanced 05 / Beyond the Syllabus :: 用公式验证你拖出来的规律 || Verify Your Dragged Rule With Formulas

中考定性即可，但会用透镜成像公式能在选择题里秒算像距，也能解释模拟器读数为何如此。 || Zhongkao only requires qualitative reasoning, but the thin-lens formula lets you compute image distance instantly in multiple choice and explains why the simulator reads what it does.

:::accordion
::panel { open: true }
### 透镜成像公式与放大率 || Thin-Lens Formula and Magnification
对薄凸透镜，物距 u、像距 v、焦距 f 满足以下关系（v 为正表示实像，为负表示虚像）： || For a thin convex lens, object distance u, image distance v, and focal length f satisfy the relation below (positive v means a real image, negative means virtual):

$$
\frac{1}{u} + \frac{1}{v} = \frac{1}{f}
$$

放大率等于像高与物高之比，也等于像距与物距之比： || Magnification equals the ratio of image height to object height, which also equals the ratio of image distance to object distance:

$$
m = \frac{h'}{h} = \frac{v}{u}
$$

> **📐 用公式解释 2f 分界 || 📐 Why 2f Marks Equal Size**
> 令 u = 2f 代入公式：1/(2f) + 1/v = 1/f，解得 v = 2f，放大率 m = v/u = 1，恰好等大。这就是模拟器里 u=2f 时像不放不缩的原因。 || Set u = 2f: 1/(2f) + 1/v = 1/f gives v = 2f, so m = v/u = 1 — exactly the same size. That is why the simulator shows neither enlargement nor reduction at u=2f.

::panel
### 凹透镜成像：永远的虚像 || Concave Lens: Always a Virtual Image
凹透镜对光发散，无论物体放在哪里，都只成正立、缩小的虚像，且像在物体与透镜之间。它没有凸透镜那样的分段规律。 || A concave lens diverges light. Wherever the object is placed, it forms only an upright, reduced, virtual image, located between the object and the lens. It has no piecewise rule like the convex lens.

> **一句话区分 || One-Line Distinction**
> 凸透镜的像随物距分五段变化；凹透镜的像永远是同一种。考试中看到凹透镜，先把像的性质写死为正立缩小虚像，再算距离。 || The convex lens image changes across five regions; the concave lens image is always the same kind. On an exam, fix the concave-lens image as upright, reduced, and virtual first, then compute distances.
:::

## #practice 06 / Enhanced Practice :: 从读图到反推 || From Reading Diagrams to Reasoning Backward

每题先用作图法或分段判断推断答案，再展开核对。能讲清理由，才算真正掌握。 || For each question, reason with ray tracing or region judgment first, then expand to check. You only master it when you can explain the reasoning.

:::accordion
::panel { open: true }
### 基础题（3 题） || Basic (3 Questions)
> **Q1**
> 某凸透镜焦距 f=10 cm。物体放在距透镜 30 cm 处，像有什么性质？对应哪种仪器？ || A convex lens has f=10 cm. An object sits 30 cm from it. What is the image like, and which instrument matches?

**📖 Q1 答案 || 📖 Q1 Answer**

u=30 cm > 2f=20 cm，落在 u>2f 段：倒立、缩小、实像，对应照相机。像距由 1/30 + 1/v = 1/10 解得 v=15 cm，满足 f<v<2f。 || u=30 cm > 2f=20 cm falls in the u>2f region: inverted, reduced, real image — a camera. Solving 1/30 + 1/v = 1/10 gives v=15 cm, satisfying f<v<2f.

> **Q2**
> 用放大镜看邮票，看到的是放大的字。这个像是实像还是虚像？能不能用光屏接到？ || Looking at a stamp through a magnifier shows enlarged text. Is this image real or virtual? Can a screen catch it?

**📖 Q2 答案 || 📖 Q2 Answer**

放大镜工作在 u<f：成正立、放大的虚像。虚像由折射光线的反向延长线相交而成，不能用光屏承接，只能用眼睛观察。 || A magnifier works at u<f, forming an upright, enlarged, virtual image. A virtual image is formed by back-extensions of the refracted rays, so a screen cannot catch it — only the eye sees it.

> **Q3**
> 投影仪把胶片放在 f 与 2f 之间，屏幕上得到放大的像。为什么胶片要倒着放？ || A projector places the slide between f and 2f to get an enlarged image. Why is the slide placed upside down?

**📖 Q3 答案 || 📖 Q3 Answer**

f<u<2f 段成的是倒立、放大的实像。胶片正放则屏幕上倒立，所以必须把胶片倒插，屏幕上的像才是正的。 || The f<u<2f region forms an inverted, enlarged, real image. If the slide is upright, the screen shows it inverted, so the slide must be inserted upside down to appear upright on the screen.

::panel
### 进阶题（3 题） || Advanced (3 Questions)
> **Q4**
> 凸透镜成一个清晰的等大的像，已知此时物距为 20 cm。求透镜的焦距。 || A convex lens forms a clear, same-size image with the object 20 cm away. Find the focal length.

**📖 Q4 答案 || 📖 Q4 Answer**

等大实像只在 u=2f 时出现，所以 2f=20 cm，f=10 cm。这正是实验测焦距的常用方法。 || A same-size real image occurs only at u=2f, so 2f=20 cm and f=10 cm. This is the common experimental method to measure focal length.

> **Q5**
> 蜡烛在光屏上成清晰倒立放大的像。现在把蜡烛靠近透镜一点，要想重新得到清晰的像，光屏应向哪个方向移动？像变大还是变小？ || A candle forms a clear inverted enlarged image on a screen. Move the candle slightly closer to the lens. Which way should the screen move to refocus, and does the image grow or shrink?

**📖 Q5 答案 || 📖 Q5 Answer**

实像遵循物近像远像变大。蜡烛靠近（u 减小），像距 v 增大，所以光屏要远离透镜；同时像变大。可在模拟器里拖动验证。 || A real image follows: closer object, farther and larger image. As the candle approaches (u decreases), v increases, so the screen must move away from the lens; the image also grows. Verify by dragging the simulator.

> **Q6**
> 把一个不透明的小纸片贴在凸透镜中央，遮住一部分透镜。光屏上原来的完整像会变成什么样？ || Stick an opaque paper patch over the center of a convex lens, blocking part of it. What happens to the complete image on the screen?

**📖 Q6 答案 || 📖 Q6 Answer**

像依然完整，不会缺一块。因为物体每一点都发出无数光线，透镜任意部分都能折射成像；遮住一部分只是减少了参与成像的光线，像变暗，但形状完整。 || The image stays complete, with no missing piece. Each point of the object emits countless rays, and any part of the lens can refract them to form the image; blocking part only reduces the light involved, so the image dims but keeps its full shape.
:::

## #roadmap 07 / Optics Series Navigation :: 把成像放回光学全景 || Place Imaging Back in the Optics Picture

凸透镜成像是折射规律的应用。想追溯折射的来源，或看光的波动一面，接着读这两篇。 || Convex lens imaging applies the law of refraction. To trace where refraction comes from, or to see the wave side of light, read these two next.

- [前置阅读 || Prerequisite：几何光学：反射与折射 || Geometric Optics](../geometric-optics/)
- **当前 || Current：凸透镜成像规律 || Convex Lens Imaging**
- [延伸阅读 || Further Reading：波动光学：干涉与衍射 || Wave Optics](../wave-optics/)
