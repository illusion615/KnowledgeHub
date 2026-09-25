/* Purpose-built defense narrative. This is not a projection of the long article.
 * Numerical claims are checked against the three preserved result files. */
(function (root) {
  'use strict';
  var slides = [
    {
      id: 'problem-statement', layout: 'problem', label: ['原题', 'Problem Statement'],
      title: ['成绩', 'Scores'],
      sourceSection: 'problem',
      sourceTables: ['source-year-1', 'source-year-2', 'source-year-3']
    },
    {
      id: 'outline', layout: 'outline', label: ['报告目录', 'Presentation Outline'],
      title: ['四章结构与论证路径', 'Four-Chapter Structure and Argument'],
      lead: ['由问题与符号定义进入模型求解，最后归纳结论及后续验证安排。', 'Define the problem and notation, develop and assess the solution, then summarize conclusions and further validation.'],
      chapters: [
        { number: 1, title: ['问题重述', 'Problem Restatement'], summary: ['原题与数据 · 研究目标 · 可识别范围', 'Problem and data · objectives · identifiability'] },
        { number: 2, title: ['数学符号说明', 'Mathematical Notation'], summary: ['观测变量与响应量 · 模型参数与评价记号', 'Observed variables and responses · parameters and evaluation notation'] },
        { number: 3, title: ['问题求解及分析', 'Solution and Analysis'], summary: ['3.1 预处理与探索 · 3.2 候选及检验设计 · 3.3 构建与估计\n3.4 检验与参数结果 · 3.5 第一问 · 3.6 第二问\n3.7 模型修正 · 3.8 比较与稳健性', '3.1 Preprocessing and exploration · 3.2 Candidates and evaluation design · 3.3 Specification and estimation\n3.4 Evaluation and estimates · 3.5 Question 1 · 3.6 Question 2\n3.7 Model revision · 3.8 Comparison and robustness'] },
        { number: 4, title: ['结论与展望', 'Conclusions and Outlook'], summary: ['主要结论与适用范围 · 数据补充与独立验证', 'Findings and applicability · further data and independent validation'] }
      ],
      source: ['分析范围：给定阶段与难度下的成绩预测、相对优势比较及模型适用性评价。', 'Scope: conditional score prediction, relative-margin comparison, and model applicability.']
    },
    {
      id: 'notation-observations', label: ['数学符号说明', 'Mathematical Notation'],
      title: ['观测变量与响应量', 'Observed Variables and Response Quantities'],
      lead: ['区分原始分数、试卷满分、难度指标与归一化后的模型响应。', 'Distinguish raw scores, score maxima, difficulty, and normalized model responses.'],
      columns: [
        { heading: ['原始观测', 'Observed Quantities'], table: { headers: [['符号', 'Symbol'], ['含义', 'Definition']], rows: [['t', ['考试序号（1—24）', 'Exam index (1–24)']], ['Sₜ', ['个人分数', 'Student score']], ['Mₜ', ['该次满分', 'Exam maximum']], ['S̄ₜ', ['同次年级均分', 'Same-exam cohort mean']], ['dₜ', ['难题分值占比', 'Hard-question share']]] } },
        { heading: ['归一化响应', 'Normalized Responses'], math: [String.raw`\begin{aligned}y_t&=S_t/M_t,\\m_t&=\overline S_t/M_t,\\r_t&=y_t-m_t\end{aligned}`], list: ['yₜ：个人得分率|yₜ: student score rate', 'mₜ：同次年级均分率|mₜ: same-exam cohort mean rate', 'rₜ：相对均分差；乘满分后为分数差|rₜ: rate margin; multiplying by the maximum gives a point margin'] }
      ],
      takeaway: ['同次群体均分与个人历次均值是不同统计量；dₜ也不是失分率。', 'A cohort mean and a personal historical mean are different statistics; dₜ is not a score-loss rate.'],
      source: ['符号与原题计分口径一致，不新增观测数据。', 'Notation follows the original scoring definitions; no observations are added.']
    },
    {
      id: 'notation-models', label: ['数学符号说明', 'Mathematical Notation'],
      title: ['模型参数与评价记号', 'Model Parameters and Evaluation Notation'],
      lead: ['参数由训练记录估计；估计值、观测值与目标情景采用不同记号。', 'Parameters are estimated from training records; estimates, observations, and target scenarios use distinct notation.'],
      columns: [
        { heading: ['模型参数', 'Model Parameters'], table: { headers: [['符号', 'Symbol'], ['含义', 'Definition']], rows: [['a, b, c', ['个人得分率模型的截距、阶段与难度系数', 'Score-rate intercept and two slopes']], ['u, v, w', ['分差模型的独立系数组', 'Margin-model coefficients']], ['A; t₀, d₀', ['参照水平；参照阶段与难度', 'Reference mean, stage, and difficulty']], ['εₜ', ['观测值相对模型均值的偏离', 'Deviation from the model mean']]] } },
        { heading: ['估计与检验记号', 'Estimation and Evaluation'], table: { headers: [['符号', 'Symbol'], ['含义', 'Definition']], rows: [['μᵧ, μₘ; β', ['有界条件均值；参数向量', 'Bounded means; coefficient vector']], ['𝒯, n', ['训练集；记录数', 'Training set; record count']], ['ŷ, â; t̄, d̄', ['帽号表示估计；横线表示训练均值', 'Estimates; training means']], ['t*, d*; G(d)', ['目标情景；预计分差目标函数', 'Target conditions; expected margin']], ['MAE', ['平均绝对误差', 'Mean absolute error']]] } }
      ],
      takeaway: ['参数记号不代表直接测得的能力或心理量；误差指标不等于误差上限。', 'Parameter names do not denote measured ability or mindset; an error metric is not an upper error bound.'],
      source: ['仅列本演示主线使用的记号；具体损失与估计方法在第三章定义。', 'Notation covers the presentation mainline; losses and estimation methods are specified in Chapter 3.']
    },
    {
      id: 'outlook', label: ['结论与展望', 'Conclusions and Outlook'],
      title: ['研究局限与后续验证', 'Study Limitations and Further Validation'],
      lead: ['后续工作以补足可比数据和独立评价为优先，而非仅提高模型复杂度。', 'Further work prioritizes comparable data and independent evaluation rather than complexity alone.'],
      columns: [
        { heading: ['需补充的数据', 'Required Data'], list: ['考试日期、间隔、知识覆盖及限时条件|Exam dates, intervals, topic coverage, and time limits', '明确且可比较的年级或高考参考群体|A defined, comparable school or entrance-exam reference cohort', '若分析能力与心态，需独立能力与考前状态记录|Ability and mindset analysis requires independent ability and pre-exam state measures'] },
        { heading: ['验证安排', 'Validation Plan'], list: ['预先固定候选、窗口、预测跨度和评价指标|Prespecify candidates, windows, horizons, and metrics', '以新发生的考试检验，不重复使用旧结果确认|Evaluate newly occurring exams rather than reconfirm with old outcomes', '分别核对误差、边界与敏感性，必要时缩小用途|Assess error, bounds, and sensitivity separately; narrow the application where needed'] }
      ],
      takeaway: ['本文形成可复核的条件分析；更强的预测或因果结论需要新的测量与验证。', 'This study provides reproducible conditional analysis; stronger predictive or causal claims require new measurement and validation.'],
      source: ['后续研究计划，不表示已采集新数据或完成独立验证。', 'A plan for further research, not evidence of new data collection or completed independent validation.']
    },
    {
      id: 'targets', label: ['1 / 明确问题', '1 / Define the Problem'],
      title: ['研究问题与目标函数', 'Research Questions and Objective Functions'],
      lead: ['样本包含同一名学生三年共24次考试；各学年满分依次为100、100和150分。', 'The sample comprises 24 exams for one student over three years, with annual score maxima of 100, 100, and 150.'],
      columns: [
        { heading: ['目标一：个人成绩预测', 'Objective 1: Score Prediction'], math: [String.raw`d_*=0.20,\quad M_*=150`, String.raw`\widehat S_*=150\widehat y_*`], list: ['假定目标考试紧接第24次，即 t*=25|Assume the target follows exam 24: t*=25', '原题要求考虑能力与心态；现有记录没有直接测量|Ability and mindset are requested but not directly measured'] },
        { heading: ['目标二：预期分差最大化', 'Objective 2: Expected Margin Maximization'], math: [String.raw`r=y-m,\qquad G(d)=150\widehat r(25,d)`, String.raw`\max_{d\in[0.10,\,0.30]}G(d)`], list: ['本文将相对优势定义为条件期望分差|Relative advantage is defined as the conditional expected margin', '概率目标另需明确阈值和误差分布|A probability objective requires a threshold and an error distribution'] }
      ],
      takeaway: ['目标区分：个人成绩预测与相对优势优化分别建模。', 'Distinct targets: personal scores and relative margins are modeled separately.'],
      source: ['来源：原题两问与原始记录。', 'Source: the two questions and original records.']
    },
    {
      id: 'scope', label: ['1 / 任务解释', '1 / Task Interpretation'],
      title: ['原题要求与数据可识别范围', 'Problem Requirements and Identifiability'],
      lead: ['现有记录可以支持条件关联建模，但不能唯一识别能力、心态及其贡献。', 'The records support conditional-association modeling, not unique identification of ability, mindset, or their contributions.'],
      columns: [
        { heading: ['第一问：可计算部分与未识别部分', 'Question 1: Estimable and Unidentified Components'],
          list: ['已观测：总分、难题占比、群体均分与考试顺序|Observed: total scores, hard-question shares, cohort means, and exam order', '未观测：独立能力测量、考前心理状态及考试间隔|Unobserved: independent ability measures, pre-exam psychological state, and time gaps', '同一总分可由多种能力与状态组合产生|Multiple ability–state combinations can produce the same total score'],
          math: [String.raw`K+H=(K+\delta)+(H-\delta)`] },
        { heading: ['第二问：明确采用的解释', 'Question 2: Adopted Interpretation'],
          list: ['本文求解给定阶段下的条件期望分差最大化|This analysis maximizes the conditional expected margin at a given stage', '理由：该目标可由现有个人/均分记录直接构造|Rationale: personal and cohort-mean records directly define the response', '代价：不能回答超过阈值的概率；两目标不等价|Limitation: it does not answer threshold probabilities; the objectives differ'] }
      ],
      takeaway: ['答题范围：报告可复核的简化模型结果，并明确原题中仍无法确定的部分。', 'Response scope: report reproducible results for the explicit simplified task and identify what the original data cannot determine.'],
      source: ['依据：原题字段；左式仅说明总量分解不唯一，不是已拟合的心理模型。', 'Basis: recorded fields; the identity illustrates nonunique decomposition, not a fitted psychological model.']
    },
    {
      id: 'exploration', label: ['2 / 数据探索', '2 / Data Exploration'],
      title: ['分阶段散点与模型假设的依据', 'Stage-Stratified Observations and Modeling Rationale'],
      lead: ['难度与成绩的关系受到学习阶段和试卷内容共同影响，散点图用于提出候选而非证明因果。', 'Difficulty–score relationships may reflect stage and content changes; the plot motivates candidates rather than establishing causality.'],
      columns: [
        { heading: ['24条实际观测', 'The 24 Observations'], chart: { type: 'scatter' } },
        { heading: ['观测特征与判断', 'Observed Features and Implications'],
          list: ['高一/高二/高三平均得分率：0.7825 / 0.8038 / 0.8233|Year 1/2/3 mean rates: 0.7825 / 0.8038 / 0.8233', '难度覆盖随学年变化；直接比较斜率可能混入阶段差异|Difficulty coverage changes by year; unadjusted slopes may mix stage effects', '同难度记录仍有分散，难度不能完全解释成绩|Scores vary at similar difficulty, so difficulty alone is insufficient', '线性作为低参数候选；曲率须通过时序检验评价|Linearity is a low-parameter candidate; curvature requires temporal evaluation'] }
      ],
      takeaway: ['局部线性与可加性是待检验假设，不能仅由散点图确证。', 'Local linearity and additivity remain assumptions, not conclusions established by the scatterplot.'],
      source: ['来源：原题24条记录；点位按实际数值，不抖动、不删除重叠观测。', 'Source: all 24 records; points use actual values without jitter or deletion of overlaps.']
    },
    {
      id: 'normalize', label: ['2 / 数据与假设', '2 / Data and Assumptions'],
      title: ['数据归一化与变量定义', 'Data Normalization and Variable Definitions'],
      lead: ['采用得分率统一计分尺度；难度 d 定义为难题分值占全卷分值的比例。', 'Score rates provide a common scale; difficulty d is the fraction of total marks allocated to hard questions.'],
      columns: [
        { heading: ['统一定义', 'Definitions'], math: [String.raw`y_t=\frac{S_t}{M_t},\quad m_t=\frac{\overline S_t}{M_t}`, String.raw`r_t=y_t-m_t`], list: ['t 是考试编号，不是真实时间或能力|t is exam order, not elapsed time or ability', '同次年级均分是参照，不是个人历史均值|The cohort mean differs from a personal historical mean'] },
        { heading: ['代表性观测', 'Representative Observations'], table: { headers: [['考试', 'Exam'], ['个人率', 'Student'], ['均分率', 'Cohort'], ['差值', 'Margin']], rows: [[['高一首次', 'First Year 1'], '0.800', '0.630', '0.170'], [['高三首次', 'First Year 3'], '0.867', '0.733', '0.133']] }, list: ['第17次得分率提高，但相对分差由0.170降至0.133|At exam 17, the score rate is higher but the margin falls from 0.170 to 0.133'] }
      ],
      takeaway: ['可比性限制：满分归一化不能替代知识覆盖与试卷难度的等值检验。', 'Comparability limitation: normalization does not establish equivalence of content or exam difficulty.'],
      source: ['来源：原表第1、17次记录；显示值四舍五入。', 'Source: records 1 and 17; displayed rates are rounded.']
    },
    {
      id: 'baseline', label: ['3.1 / 构造模型', '3.1 / Formulate the Model'],
      title: ['近期均值基线及其局限', 'Recent-Mean Baseline and Its Limitations'],
      lead: ['以最近三次得分率的均值作为基准预测，评价后续模型的增量表现。', 'The mean of the latest three score rates serves as a benchmark for evaluating subsequent models.'],
      columns: [
        { heading: ['基线计算：第4次考试', 'Baseline Calculation: Exam 4'], math: [String.raw`\widehat y_{4,\mathrm{base}}=\frac{0.80+0.78+0.81}{3}`, String.raw`\widehat S_4\approx79.67,\qquad S_4=85`], list: ['该次预测低估5.33分，误差原因无法由单次观测识别|The forecast underestimates by 5.33 points; its cause is not identifiable from one observation'] },
        { heading: ['结构局限', 'Structural Limitations'], list: ['固定历史记录后，预测不会随目标难度变化|With history fixed, target difficulty cannot change the forecast', '滚动均值能更新水平，但没有显式阶段变化规则|A rolling mean updates level without an explicit stage rule', '时间—难度模型作为独立候选与基线比较|The time–difficulty model is evaluated as a separate candidate'] }
      ],
      takeaway: ['建模依据：引入阶段与难度变量，以描述基线未显式刻画的变化。', 'Modeling rationale: stage and difficulty represent variation not explicitly captured by the baseline.'],
      source: ['来源：原题前4次记录；近三次窗口固定。', 'Source: the first four records; the three-exam window is fixed.']
    },
    {
      id: 'selection', label: ['3.1 / 构造模型', '3.1 / Formulate the Model'],
      title: ['候选模型与选择准则', 'Candidate Models and Selection Criteria'],
      lead: ['模型选择同时考虑适用条件、预测误差与参数稳定性。', 'Model selection considers applicability, predictive error, and parameter stability.'],
      columns: [
        { heading: ['候选模型及依据', 'Candidates and Rationale'], table: { headers: [['候选', 'Candidate'], ['理由', 'Reason']], rows: [[['近期均值', 'Recent mean'], ['简单参照', 'Simple benchmark']], [['时间—难度直线', 'Time–difficulty line'], ['局部变化近似匀速', 'Approximately constant local change']], [['增加难度平方项', 'Add squared difficulty'], ['检查曲率是否有用', 'Test whether curvature helps']]] } },
        { heading: ['评价准则', 'Evaluation Criteria'], list: ['预测时点、跨度、信息集与指标一致|Matched cutoffs, horizons, information sets, and metrics', '选择依据为时序预测误差，而非训练拟合误差|Selection based on temporal forecast error rather than training fit', '同时检查适用范围、复杂度与稳定性|Additional assessment of domain, complexity, and stability'] }
      ],
      takeaway: ['选择原则：在适用约束成立且预测表现接近时，优先采用较简单、稳定的模型。', 'Selection principle: among applicable models with similar predictive performance, prefer simplicity and stability.'],
      source: ['依据：FPP3 §5.10、§7.5；候选及协议见原计算记录。', 'Basis: FPP3 §§5.10, 7.5 and the original calculation protocol.']
    },
    {
      id: 'construct', label: ['3.1 / 构造模型', '3.1 / Formulate the Model'],
      title: ['时间—难度模型的参照形式', 'Reference Form of the Time–Difficulty Model'],
      lead: ['在局部线性与可加性假设下，平均得分率由参照水平及两项调整构成。', 'Under local-linearity and additivity assumptions, the mean score rate consists of a reference level and two adjustments.'],
      columns: [
        { heading: ['模型分量', 'Model Components'], list: ['A：参照阶段 t₀、难度 d₀ 下的平均得分率|A: mean score rate at reference stage t₀ and difficulty d₀', 'b(t−t₀)：难度可比时的阶段调整|b(t−t₀): stage adjustment at comparable difficulty', 'c(d−d₀)：同一阶段的难度调整|c(d−d₀): difficulty adjustment at the same stage'] },
        { heading: ['模型表达与假设', 'Specification and Assumptions'], math: [String.raw`f(t,d)\approx A+b(t-t_0)+c(d-d_0)`], list: ['假设阶段与难度效应可加，且斜率固定|Additive stage and difficulty effects with fixed slopes', 'A、b、c联合估计，变化方向由数据确定|Joint estimation of A, b, c; directions determined by the data', '系数表示条件关联，不作因果解释|Coefficients describe conditional associations, not causal effects'] }
      ],
      takeaway: ['解释边界：考试编号仅表示阶段顺序，不能识别独立的能力效应。', 'Interpretation limit: exam order represents stage progression, not a separately identified ability effect.'],
      source: ['依据：本文明确提出的局部线性、可加性假设。', 'Basis: the stated local-linearity and additivity assumptions.']
    },
    {
      id: 'algebra', label: ['3.1 / 构造模型', '3.1 / Formulate the Model'],
      title: ['模型重参数化与观测方程', 'Reparameterization and the Observation Equation'],
      lead: ['将参照条件对应的固定项合并为截距 a，参数维数保持不变。', 'The terms fixed by the reference conditions are collected into intercept a without changing the parameter dimension.'],
      columns: [
        { heading: ['代数变换', 'Algebraic Transformation'], math: [String.raw`\begin{aligned}&A+b(t-t_0)+c(d-d_0)\\&=A+bt-bt_0+cd-cd_0\\&=(A-bt_0-cd_0)+bt+cd\end{aligned}`, String.raw`a:=A-bt_0-cd_0`] },
        { heading: ['观测方程与参数解释', 'Observation Equation and Parameter Interpretation'], math: [String.raw`y_t=a+bt+cd_t+\varepsilon_t`], list: ['t₀、d₀已选定；参数固定后，括号不随输入变|References are fixed; the bracket does not vary with inputs once parameters are set', 'a替代A，不是新增第四个系数|a replaces A; it is not a fourth coefficient', 'εₜ表示剩余偏离，不是心态分数|εₜ is remaining deviation, not a mindset score'] }
      ],
      takeaway: ['等价关系：参照形式与截距形式描述同一模型，均包含三个待估参数。', 'Equivalence: the reference and intercept forms describe the same three-parameter model.'],
      source: ['依据：乘法分配律与同一方程的代数整理。', 'Basis: distributivity and algebraic equivalence.']
    },
    {
      id: 'fit', label: ['3.2 / 参数求解', '3.2 / Estimate Parameters'],
      title: ['回归损失函数与估计过程', 'Regression Loss and Estimation Procedure'],
      lead: ['对训练样本中的全部观测联合估计 a、b、c，以残差平方和为目标函数。', 'The coefficients a, b, c are estimated jointly from all training observations by minimizing squared residuals.'],
      columns: [
        { heading: ['损失函数', 'Loss Function'], math: [String.raw`L(a,b,c)=\sum_{t\in\mathcal T}(y_t-a-bt-cd_t)^2`, String.raw`(0.800-a-b-0.25c)^2`], list: ['𝒯只包含当前可用训练记录|𝒯 contains only training records available at the cutoff'] },
        { heading: ['估计步骤', 'Estimation Steps'], list: ['训练样本中心化|Centering of training observations', '计算平方和与交叉乘积，求解斜率|Calculation of sums of squares and cross-products; slope estimation', '由均值关系恢复截距|Recovery of the intercept from the mean relation'], math: [String.raw`\widehat a=\bar y-\widehat b\,\bar t-\widehat c\,\bar d`] }
      ],
      takeaway: ['参数估计使用训练样本；预测性能另由未参与该次拟合的观测评价。', 'Parameters are estimated on training data; predictive performance is assessed on observations excluded from that fit.'],
      source: ['依据：最小二乘；完整消元及计算脚本保留在阅读版。', 'Basis: least squares; complete elimination and code remain in the reading version.']
    },
    {
      id: 'solve-coefficients', label: ['3.2 / 参数求解', '3.2 / Estimate Parameters'],
      title: ['线性模型系数的数值求解', 'Numerical Estimation of Linear Model Coefficients'],
      lead: ['以下为24条记录全量重估的计算过程；时序检验分别使用对应训练集。', 'The calculation below uses the final refit on all 24 records; temporal evaluation uses the respective training sets.'],
      columns: [
        { heading: ['中心化与正规方程', 'Centering and Normal Equations'],
          math: [String.raw`\begin{aligned}T_t&=t-\bar t,\quad D_t=d_t-\bar d,\\Y_t&=y_t-\bar y\end{aligned}`,
                 String.raw`\begin{cases}1150b+0.85c=2.615,\\0.85b+0.0789333c=-0.0949222.\end{cases}`],
          list: ['左边来自T²、TD、D²的求和；右边来自TY、DY|Left: sums of T², TD, D²; right: sums of TY, DY'] },
        { heading: ['斜率与截距估计', 'Slope and Intercept Estimates'],
          math: [String.raw`\widehat b\approx0.003188,\quad\widehat c\approx-1.236894`,
                 String.raw`\begin{aligned}\widehat a&=\bar y-\widehat b\bar t-\widehat c\bar d\\&\approx1.051951\end{aligned}`],
          list: ['均值：t̄=12.5，d̄≈0.233333，ȳ≈0.803194|Means: t̄=12.5, d̄≈0.233333, ȳ≈0.803194', '分差模型改用r作输出，重新计算右边两项|For margins, use r as the outcome and recompute the right-hand sums'] }
      ],
      takeaway: ['全量估计结果由24条记录的统计量共同决定；展示数值已作舍入。', 'The final estimates are determined by summaries of all 24 records; displayed values are rounded.'],
      source: ['来源：model-results.json的中心化统计量；运算使用未舍入值。', 'Source: centered sums in model-results.json; computations use unrounded values.']
    },
    {
      id: 'protocol', label: ['4 / 分析与评价', '4 / Analyze and Assess'],
      title: ['时序检验设计与信息约束', 'Temporal Evaluation Design and Information Constraints'],
      lead: ['按考试顺序划分训练、模型选择与最终检查阶段，目标难度作为给定条件。', 'Training, model selection, and final evaluation follow exam order, with target difficulty treated as given.'],
      columns: [
        { heading: ['原检验协议', 'Original Protocol'], list: ['1—16：初始训练|1–16: initial training', '17—20：每场重估，只预测下一场，用于选择|17–20: refit each time for one-step model selection', '21—24：选定形式后，用1—20一次预测四场|21–24: freeze the chosen form; fit 1–20 and forecast four exams together'] },
        { heading: ['误差指标与可比条件', 'Error Metric and Comparability'], math: [String.raw`e_t=S_t-\widehat S_t`, String.raw`\operatorname{MAE}=\frac{1}{n}\sum_{t=1}^n|e_t|`], list: ['误差单位统一为150分制分数|Errors expressed on the 150-point scale', '一步预测与四场批量预测分别报告|Separate reporting of one-step and four-exam batch forecasts', '最终检查数据不参与模型选择|Final evaluation outcomes excluded from model selection'] }
      ],
      takeaway: ['评价结果仅在预测时点、跨度及可用信息一致时具有直接可比性。', 'Evaluation results are directly comparable only under matching cutoffs, horizons, and information sets.'],
      source: ['来源：原计算协议；FPP3 §5.10。', 'Source: original calculation protocol; FPP3 §5.10.']
    },
    {
      id: 'evaluation', label: ['4 / 分析与评价', '4 / Analyze and Assess'],
      title: ['模型选择结果与后续检验表现', 'Model Selection Results and Subsequent Evaluation'],
      lead: ['线性模型在模型选择阶段的MAE最低；最终检查阶段二次模型的误差略低。', 'The linear model has the lowest selection-period MAE; the quadratic model has a slightly lower error in final evaluation.'],
      columns: [
        { heading: ['17—20：滚动成绩MAE', '17–20: Rolling Score MAE'], table: { headers: [['模型', 'Model'], ['MAE', 'MAE']], rows: [[['近期均值', 'Recent mean'], '12.79'], [['线性', 'Linear'], '3.15'], [['二次', 'Quadratic'], '7.61']] }, list: ['分差另行选择：均值10.13、线性5.87、二次10.65分|Separate margin selection: mean 10.13, linear 5.87, quadratic 10.65 points'] },
        { heading: ['21—24：批量成绩MAE', '21–24: Batch Score MAE'], table: { headers: [['模型', 'Model'], ['MAE', 'MAE']], rows: [[['近期均值', 'Recent mean'], '15.58'], [['已选线性', 'Selected line'], '6.60'], [['二次对照', 'Quadratic check'], '5.87']] } }
      ],
      takeaway: ['保留原协议的选择结果；当前材料不证明事先注册或外部验证，MAE也不构成误差上界。', 'Retain the selection under the original protocol; the record does not establish preregistration or external validation, and MAE is not an error bound.'],
      source: ['来源：model-results.json；不同列的预测方式不同，不跨列排名。', 'Source: model-results.json; protocols differ between columns.']
    },
    {
      id: 'score-answer', label: ['6.1 / 回答第一问', '6.1 / Answer Question 1'],
      title: ['第一问：条件成绩估计', 'Question 1: Conditional Score Estimation'],
      lead: ['采用全量重估系数，代入 t*=25、d*=0.20 与满分150分。', 'The full-sample coefficient estimates are evaluated at t*=25, d*=0.20, and a 150-point maximum.'],
      columns: [
        { heading: ['已估计的得分率方程', 'Estimated Score-Rate Equation'], math: [String.raw`\begin{aligned}\widehat y(t,d)&=1.051951+0.003188t\\&\quad-1.236894d\end{aligned}`, String.raw`\begin{aligned}\widehat y(25,0.20)&\approx0.884276,\\\widehat S_*&=150\widehat y\approx132.64.\end{aligned}`] },
        { heading: ['结果解释与适用条件', 'Interpretation and Applicability'], list: ['条件：目标紧接第24次、难度0.20、口径可比|Conditions: next exam after 24, d=0.20, comparable definitions', '约133分是时间—难度基准情景|About 133 points is a time–difficulty benchmark scenario', '并未直接测得能力或心态，不能完成心理贡献分离|Ability and mindset were not measured or separately identified'] }
      ],
      takeaway: ['132.64分为条件性基准估计；真实高考迁移能力尚未得到独立验证。', '132.64 points is a conditional benchmark estimate; transfer to the entrance exam has not been independently validated.'],
      source: ['来源：model-results.json；显示系数舍入，答案由未舍入系数计算。', 'Source: model-results.json; displayed coefficients are rounded, calculations use full precision.']
    },
    {
      id: 'margin-answer', label: ['6.2 / 回答第二问', '6.2 / Answer Question 2'],
      title: ['第二问：预期分差的区间优化', 'Question 2: Interval Optimization of the Expected Margin'],
      lead: ['以 r=y−m 为响应变量单独估计系数，在固定阶段下比较不同难度。', 'Coefficients are estimated separately for response r=y−m, and difficulty is varied at a fixed stage.'],
      columns: [
        { heading: ['目标函数', 'Objective Function'], math: [String.raw`\begin{aligned}\widehat r(t,d)&=0.235870-0.002885t\\&\quad-0.491460d\end{aligned}`, String.raw`G(d)=24.56335-73.71896d`], list: ['已固定 t*=25，分差单位为分|t*=25 is fixed; G is measured in points'] },
        { heading: ['单调性与端点解', 'Monotonicity and Endpoint Solution'], math: [String.raw`\begin{aligned}G(d_2)-G(d_1)&=-73.71896\\&\quad\times(d_2-d_1)\end{aligned}`, String.raw`\begin{aligned}d_2>d_1&\Rightarrow G(d_2)<G(d_1),\\d^\star=0.10,&\quad G(d^\star)\approx17.19.\end{aligned}`], list: ['在题设[0.10,0.30]内，直线在左端最大|On [0.10,0.30], the line is largest at the left endpoint'] }
      ],
      takeaway: ['线性模型在 d=0.10 取得区间最大预期分差；该结论依赖外推与目标定义。', 'The linear model maximizes the expected margin at d=0.10; this result depends on extrapolation and the chosen objective.'],
      source: ['来源：model-results.json；分差系数与端点代入。', 'Source: model-results.json; margin coefficients and endpoint substitution.']
    },
    {
      id: 'boundary', label: ['5 / 迭代修正', '5 / Iterate'],
      title: ['外推风险与预测可行性', 'Extrapolation Risk and Forecast Feasibility'],
      lead: ['题设区间包含未观测的低难度区域，线性模型在该区域存在越界预测。', 'The requested interval includes unobserved low-difficulty values at which the linear score model exceeds its feasible range.'],
      columns: [
        { heading: ['可行性诊断', 'Feasibility Diagnostics'], list: ['历史难度[0.15,0.40]；0.10在观测范围之外|Observed difficulty is [0.15,0.40]; 0.10 is extrapolation', '个人成绩直线在0.10给出151.19分，超过150|The score line gives 151.19 at d=0.10, above 150', '事后截断只能消除数值越界，不能验证模型|Post-hoc clipping removes numerical violations, not model uncertainty'] },
        { heading: ['观测支持范围内的条件解', 'Conditional Solution Within Observed Support'], math: [String.raw`[0.10,0.30]\cap[0.15,0.40]=[0.15,0.30]`, String.raw`G(0.15)\approx13.51`], list: ['该解增加了历史支持约束，与原区间解分别报告|This solution adds an observed-support constraint and is reported separately', '后续采用有界形式并重新评价预测性能|Subsequent revision uses bounded means and reassesses predictive performance', '难度在历史范围内也不保证第25次的联合条件可比|Difficulty within its observed range does not ensure comparable joint conditions at exam 25'] }
      ],
      takeaway: ['形式最优值缺乏观测支持，不能据此确定真实考试的最优难度。', 'The formal optimum lacks observational support and does not establish an optimal real-exam difficulty.'],
      source: ['来源：原难度范围与model-results.json的越界检查。', 'Source: observed difficulty range and the original feasibility check.']
    },
    {
      id: 'bounded-revision', label: ['5 / 迭代修正', '5 / Iterate'],
      title: ['有界条件均值模型', 'Bounded Conditional Mean Models'],
      lead: ['通过非线性映射将阶段—难度线性预测子约束于(0,1)，满足得分率边界。', 'A nonlinear mapping constrains the stage–difficulty linear predictor to (0,1), enforcing score-rate bounds.'],
      columns: [
        { heading: ['函数形式与边界', 'Functional Form and Bounds'], math: [String.raw`g(z)=\frac{1}{1+e^{-z}},\qquad0<g(z)<1`, String.raw`\mu_y=g(a_y+b_yt+c_yd)`, String.raw`\mu_m=g(a_m+b_mt+c_md)`], list: ['分别估计两条条件均值，预期分差为150(μᵧ−μₘ)|Separate conditional means yield expected margin 150(μᵧ−μₘ)'] },
        { heading: ['结构变化与解释范围', 'Structural Changes and Interpretation'], list: ['不超过满分；允许靠近边界时变化放缓|Scores stay within bounds; changes can flatten near limits', '不增加心理解释，也未建立联合概率分布|No psychological interpretation or joint probability distribution is added', '两条同形式OLS直线相减，原本等价于直接拟合分差|Subtracting two matched OLS lines already equals a direct margin fit'] }
      ],
      takeaway: ['边界可行性由函数形式保证；预测性能需通过同协议比较独立评价。', 'The functional form enforces feasible bounds; predictive performance requires a separate matched-protocol assessment.'],
      source: ['依据：Papke与Wooldridge分数响应均值；本文回顾性计算。', 'Basis: Papke and Wooldridge fractional-response means; retrospective calculations.']
    },
    {
      id: 'bounded-estimation', label: ['5 / 修正模型估计', '5 / Revised Model Estimation'],
      title: ['有界均值的拟合准则与数值求解', 'Fitting Criterion and Numerical Estimation of Bounded Means'],
      lead: ['个人与群体均分率分别拟合；不将150分视为150次独立试验。', 'Fit the two fractional responses separately; 150 marks are not independent binary trials.'],
      columns: [
        { heading: ['估计准则', 'Estimation Criterion'],
          math: [String.raw`\begin{aligned}J(\beta)=-\sum_{t\in\mathcal T}\big[&q_t\log\mu_t\\&+(1-q_t)\log(1-\mu_t)\big]\end{aligned}`, String.raw`\mu_t=g(x_t^\mathsf T\beta),\qquad q_t=y_t\ \text{or}\ m_t`],
          list: ['直接拟合分数响应均值，不变换观测值|Fit fractional-response means directly; no response transformation', '均值初始化→阻尼Newton更新→梯度收敛检查|Mean initialization → damped Newton → gradient convergence check'] },
        { heading: ['全量拟合示例：个人得分率', 'Full-Sample Illustration: Student Score Rate'],
          math: [String.raw`x_t=\left(1,\frac{t-16}{8},\frac{d_t-0.2}{0.1}\right)`, String.raw`\widehat\beta_y\approx(1.804924,\ 0.199709,\ -0.753691)`],
          list: ['中心和尺度预先固定，不依赖目标成绩|Centers and scales are fixed independently of target outcomes', '全量拟合4次迭代收敛；预测检验在每个时点重新拟合|The full fit converges in four iterations; evaluation refits at each cutoff', '此处不给出小样本显著性或置信区间结论|No small-sample significance or confidence-interval claim is made'] }
      ],
      takeaway: ['边界约束、数值收敛与预测性能是三个分别检验的条件。', 'Feasible bounds, numerical convergence, and forecast accuracy are assessed separately.'],
      source: ['来源：Papke与Wooldridge分数响应准似然；robustness-review.py及结果JSON。', 'Source: Papke and Wooldridge fractional-response quasi-likelihood; robustness-review.py and its results.']
    },
    {
      id: 'error-profile', label: ['5 / 误差诊断', '5 / Error Diagnostics'],
      title: ['逐次预测误差与比较结果的稳定性', 'Per-Exam Errors and Stability of the Comparison'],
      lead: ['在统一的一步预测协议下，两种模型的相对表现随考试变化，平均误差不足以描述全部差异。', 'Under the matched one-step protocol, relative performance varies by exam; average error does not describe the full pattern.'],
      columns: [
        { heading: ['绝对误差／分', 'Absolute Error / Points'], chart: { type: 'errors',
          linear: [1.8931, 8.2342, 1.2376, 1.2287, 9.1073, 8.3545, 1.5185, 0.5980],
          bounded: [0.7064, 6.7387, 7.2466, 3.2977, 6.6177, 6.1616, 2.4438, 4.4767] } },
        { heading: ['诊断结论', 'Diagnostic Findings'],
          list: ['线性模型在第18、21、22次出现较大误差|The linear model has larger misses at exams 18, 21, and 22', '有界模型在第19、20、24次误差较大，未形成一致优势|The bounded model has larger errors at exams 19, 20, and 24, with no consistent advantage', '8次误差来自同一学生，不能视为充分独立的大样本|Eight errors from one student do not constitute a large independent sample', '4.02与4.71用于描述本轮结果，不据此作显著性判断|4.02 and 4.71 summarize this review, not a significance test'] }
      ],
      takeaway: ['本轮结果仅作描述性比较；推广结论需要固定方案后的新记录。', 'These results are descriptive; broader claims require a fixed protocol and new records.'],
      source: ['来源：robustness-review-results.json，17—24次统一一步预测；纵轴为绝对误差。', 'Source: robustness-review-results.json, matched one-step forecasts for exams 17–24; the vertical axis shows absolute errors.']
    },
    {
      id: 'matched-evaluation', label: ['5 / 迭代修正', '5 / Iterate'],
      title: ['统一协议下的回顾性预测比较', 'Retrospective Forecast Comparison Under a Matched Protocol'],
      lead: ['第17—24次均采用逐次重估的一步预测；新增比较属于回顾性研究。', 'Exams 17–24 use one-step forecasts with sequential refitting; the additional comparison is retrospective.'],
      columns: [
        { heading: ['八次MAE／分', 'Eight-Exam MAE / Points'], table: { headers: [['模型', 'Model'], ['个人', 'Score'], ['分差', 'Margin']], rows: [[['近期均值', 'Recent mean'], '12.27', '8.56'], [['线性', 'Linear'], '4.02', '5.59'], [['二次', 'Quadratic'], '6.02', '8.04'], [['有界均值／双输出', 'Bounded mean / pair'], '4.71', '6.49']] } },
        { heading: ['比较结果与证据性质', 'Comparative Results and Evidential Status'], list: ['有界模型满足分数范围约束|The bounded model satisfies score-range constraints', '本轮成绩与分差MAE均高于线性模型|Both score and margin MAE exceed those of the linear model', '与旧批量检验MAE 6.60不具直接可比性|Not directly comparable with the original batch MAE of 6.60', '重复使用既有记录，证据性质为回顾性|Reuse of existing records makes the evidence retrospective'] }
      ],
      takeaway: ['有界模型改善了输出可行性，但本轮未观察到相对于线性模型的MAE降低。', 'The bounded model improves output feasibility but does not reduce MAE relative to the linear model in this review.'],
      source: ['来源：robustness-review-results.json；统一一步重估协议。', 'Source: robustness-review-results.json; matched one-step refitting protocol.']
    },
    {
      id: 'stability', label: ['5 / 稳定性检查', '5 / Stability Check'],
      title: ['有界双均值模型的难度优化敏感性', 'Sensitivity of Difficulty Optimization in the Bounded-Pair Model'],
      lead: ['有界全量网格的预期分差在0.12最高，比0.10仅高约0.04分，且低于历史最低难度。', 'On the full-fit grid, d=0.12 gives only 0.04 more margin points than d=0.10; both are outside observed support.'],
      columns: [
        { heading: ['难度网格：步长0.01', 'Difficulty Grid: Step 0.01'], table: { headers: [['难度', 'Difficulty'], ['预期分差', 'Expected margin']], rows: [['0.10', '11.68'], ['0.12', '11.72'], ['0.15', '11.56']] }, list: ['0.12仍低于历史最小难度0.15|0.12 is still below observed support, which begins at 0.15'] },
        { heading: ['拟合窗口敏感性', 'Sensitivity to the Fitting Window'], table: { headers: [['最近记录数', 'Last exams'], ['分数情景', 'Score scenario'], ['最高网格点', 'Grid maximum']], rows: [['24', '132.58', '0.12'], ['12', '135.95', '0.14'], ['8', '136.07', '0.16']] }, list: ['逐点影响检查中，最高位置在0.10—0.14变化|Single-record omissions move the maximum over 0.10–0.14'] }
      ],
      takeaway: ['网格最高位置尚不稳定；该结果不是连续精确最优或预测区间。', 'The maximizing grid location is unstable; it is neither an exact continuous optimum nor a prediction interval.'],
      source: ['来源：robustness-review-results.json；未删除任何原记录。', 'Source: robustness-review-results.json; original records are retained.']
    },
    {
      id: 'defense-summary', label: ['研究结论', 'Research Conclusions'],
      title: ['主要结论与研究局限', 'Principal Findings and Study Limitations'],
      lead: ['线性模型保留为条件性基准，有界模型作为可行性对照；不推荐真实高考最优难度。', 'Retain the line as a conditional benchmark and bounded means as a feasibility check; no real-exam optimum is recommended.'],
      columns: [
        { heading: ['条件结果（线性 / 有界）', 'Conditional Results (Linear / Bounded)'], table: { headers: [['任务', 'Task'], ['条件结果', 'Result'], ['决策', 'Decision']], rows: [[['成绩预测', 'Score'], '132.64 / 132.58', ['条件对照，非区间', 'Scenarios, not an interval']], [['难度优化', 'Difficulty'], '0.10 / 0.12', ['不作实际推荐', 'No operational optimum']], [['能力与心态', 'Ability / mindset'], ['未识别', 'Unidentified'], ['需独立测量', 'Direct measures needed']]] } },
        { heading: ['局限与后续验证', 'Limitations and Further Validation'], list: ['单人小样本与试卷差异限制外部有效性|Small single-student sample and unequal exams limit transfer', '需补充考试日期、内容可比性与参考群体信息|Further data are needed on dates, content comparability, and the reference cohort', '后续独立验证需固定方案并采集新考试记录|Independent validation requires a fixed protocol and newly collected exams'] }
      ],
      takeaway: ['第一问未完全识别；第二问的模型解仅针对期望分差目标。', 'Question 1 remains partly unidentified; Question 2 is solved only for the mean-margin objective.'],
      source: ['复核入口：阅读版来源[4][6]；GAIMME、FPP3及分数响应模型文献。', 'Audit trail: reading-version sources [4][6], GAIMME, FPP3, and fractional-response literature.']
    }
  ];
  // Four major chapters, not four slides. Keep the complete original problem first.
  var chapterTitles = {
    1: ['一、问题重述', 'I. Problem Restatement'],
    2: ['二、数学符号说明', 'II. Mathematical Notation'],
    3: ['三、问题求解及分析', 'III. Solution and Analysis'],
    4: ['四、结论与展望', 'IV. Conclusions and Outlook']
  };
  var structure = [
    ['problem-statement', 1, '1.1'], ['outline', 0, ''],
    ['targets', 1, '1.2'], ['scope', 1, '1.3'],
    ['notation-observations', 2, '2.1'], ['notation-models', 2, '2.2'],
    ['normalize', 3, '3.1.1'], ['exploration', 3, '3.1.2'],
    ['baseline', 3, '3.2.1'], ['selection', 3, '3.2.2'], ['protocol', 3, '3.2.3'],
    ['construct', 3, '3.3.1'], ['algebra', 3, '3.3.2'], ['fit', 3, '3.3.3'],
    ['evaluation', 3, '3.4.1'], ['solve-coefficients', 3, '3.4.2'],
    ['score-answer', 3, '3.5'], ['margin-answer', 3, '3.6'],
    ['boundary', 3, '3.7.1'], ['bounded-revision', 3, '3.7.2'], ['bounded-estimation', 3, '3.7.3'],
    ['matched-evaluation', 3, '3.8.1'], ['error-profile', 3, '3.8.2'], ['stability', 3, '3.8.3'],
    ['defense-summary', 4, '4.1'], ['outlook', 4, '4.2']
  ];
  var defense = structure.map(function (entry) {
    var slide = slides.find(function (item) { return item.id === entry[0]; });
    slide.chapter = entry[1];
    slide.subsection = entry[2];
    if (slide.chapter) {
      slide.label = chapterTitles[slide.chapter];
      slide.title = slide.title.map(function (title) { return slide.subsection + ' ' + title; });
    }
    return slide;
  });
  if (typeof module !== 'undefined' && module.exports) module.exports = defense;
  else root.ExamDefensePlan = defense;
})(typeof window === 'undefined' ? globalThis : window);
