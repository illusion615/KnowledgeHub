---
title: Dataverse Security Role 完全指南
eyebrow: Dataverse Security Guide
brand: Power Apps
date: 2026-04-16
strict_i18n: false
strict_density: true
lead: Microsoft Dataverse 使用基于角色的安全模型（RBAC）控制对环境中数据和资源的访问。本文面向初学者梳理安全角色的核心概念、8 种表权限、5 个访问级别与 15+ 预定义角色的作用域，并附上常见场景的角色配置速查表。所有内容均源自 Microsoft Learn 官方文档。
hero_actions:
  - "查看预定义角色 | #predefined-roles"
  - "场景速查 | #scenarios"
panel_label: 安全模型五层防线
panel_title: 从环境隔离到列级安全的纵深防御体系
panel:
  - 环境级：Environment 隔离 + Security Group 准入
  - 角色级：Security Role 控制表操作权限
  - 记录级：Business Unit + Ownership + Sharing
  - 列级：Column Security Profile 保护敏感字段
  - 层级：Hierarchy Security 打通上下级数据可见性
metrics:
  - "安全模型 | RBAC | 基于角色的访问控制"
  - "表权限类型 | 8 种 | Create / Read / Write / Delete / Append / Append To / Assign / Share"
  - "访问级别 | 5 级 | None → User → BU → Parent:Child → Org"
  - "预定义角色 | 15+ | 从 App Opener 到 System Administrator"
style:
  accent: "#a855f7"
---

## #overview 01 / Security Overview :: Dataverse 安全模型概览

Dataverse 的安全模型旨在以最小阻力保护数据——既保障用户顺畅处理日常业务，又严格拦截越权的数据访问与操作。

:::accordion
::panel { open: true }
### 什么是 Dataverse？
Microsoft Dataverse 是 Power Platform（Power Apps、Power Automate、Copilot Studio）的底层数据平台，内置标准化的数据存储、业务逻辑层和安全控制层，支撑组织安全地存储和管理业务数据。

关键特性：

- **标准化数据模型**：预置 Account、Contact、Activity 等核心业务表，也可创建自定义表。
- **内置安全层**：认证交由 Microsoft Entra ID 处理，授权由 Security Role、Business Unit、Team 等安全模块协同控制。
- **多租户隔离**：以 Environment 划定安全边界，不同环境可配置独立的安全策略。

::panel
### 安全模型的整体架构
Dataverse 安全模型支持从简单的"宽松访问"一路细化到"记录+字段级别控制"，整体架构由八道防线逐层叠加：

1. **Licensing（许可证）**：第一道闸门——用户必须拥有正确的许可证（如 Power Apps Premium）才能访问 Dataverse 环境。
2. **Environment Security Group**：通过 Microsoft Entra Security Group 控制谁可以进入环境。
3. **Security Role**：在环境内控制用户对数据表的操作权限。
4. **Business Unit**：将用户和数据分区，配合 Security Role 的访问级别控制跨部门可见性。
5. **Team**：将用户分组，统一授权——Owner Team 和 Access Team 分别解决不同场景。
6. **Record Sharing**：点对点的记录共享机制，处理不在角色/BU 覆盖范围内的例外访问。
7. **Column Security Profile**：保护单个列（如身份证号、薪资），独立于记录级权限。
8. **Hierarchy Security**：Manager 或 Position 层级继承，让上级可以看到下属的数据。

**核心原则**：所有权限授予都是**累加式的（Additive）**——系统取用户所有角色的最大权限范围。授予了组织级（Organization）读取权限后，无法通过其他设置再"收回"单条记录的可见性。

::panel
### 记录访问判定流程
当用户试图对一条记录执行操作（如 Read、Write、Delete）时，Dataverse 分两个阶段依次判定：

**第一阶段：Privilege Check（权限检查）**

确认用户（直接或通过 Team）是否拥有对该表的操作权限。如果没有任何角色包含该权限，直接拒绝。此阶段不关心访问级别（Access Level）。

**第二阶段：Access Check（访问范围检查）**

确认用户是否有权操作*这条具体记录*。系统会依次检查四种途径：

1. **Ownership（所有权）**：用户是记录的 Owner，或用户所在 Team 是记录的 Owner。
2. **Role Access（角色范围）**：用户角色的访问级别覆盖了该记录所在的 Business Unit。
3. **Shared Access（共享）**：记录被直接或通过 Team 共享给了用户。
4. **Hierarchy Access（层级继承）**：用户是记录拥有者的上级（Manager / Position hierarchy）。

任意一条途径命中，即授予访问权限。
:::

## #core-concepts 02 / Core Concepts :: Security Role 核心概念

理解 Security Role 需要掌握三个维度：权限类型（Privilege）、访问级别（Access Level）和权限归属（Owner vs. Org-owned）。

:::accordion
::panel { open: true }
### 8 种表权限（Table Privileges）
每个 Security Role 可针对 Dataverse 中的每张表分别配置 8 种操作权限：

| 权限 | 英文 | 说明 |
| --- | --- | --- |
| 创建 | Create | 允许新建记录。 |
| 读取 | Read | 允许打开记录查看内容。 |
| 更新 | Write | 允许修改记录字段值。 |
| 删除 | Delete | 允许永久移除记录。 |
| 附加 | Append | 将当前记录关联到另一条记录。例如：将 Note 附加到 Opportunity。多对多关系时需双方表都有 Append 权限。 |
| 附加到 | Append To | 允许别的记录关联到当前记录。例如：允许 Note 附加到此 Opportunity。 |
| 分配 | Assign | 将记录的所有权转移给另一个用户或团队。 |
| 共享 | Share | 将记录的访问权限授予另一个用户，同时保留自己的访问权。 |

此外，Security Role 还有两类特殊权限：

- **Miscellaneous Privileges（杂项权限）**：非记录级的任务权限，如"发布文章""激活业务规则"。
- **Privacy-related Privileges（隐私权限）**：控制数据能否被导出到 Excel、打印或集成到外部系统。

::panel
### 表的所有权类型
Dataverse 表有两种所有权类型，决定了权限控制的粒度：

- **User/Team Owned（用户/团队拥有）**：支持完整的 5 级访问控制。每条记录有明确的 Owner，可以是用户或 Owner Team。大多数业务表（Account、Contact 等）采用此类型。
- **Organization Owned（组织拥有）**：只有两个选项——有权限或没权限。不支持 BU 级、User 级的细粒度控制。典型场景是配置数据表。

所有权类型在创建表时确定，之后**无法更改**。

::panel
### Security Role 的权限累加原则
Dataverse 的权限计算遵循**加法原则**：

- 一个用户可以拥有**多个** Security Role。
- 用户也可以是多个 Team 的成员，Team 上的 Security Role 同样累加到用户身上。
- 系统取所有来源中**最大（最宽松）**的权限范围。
- 一旦授予了高级别权限（如 Organization 级 Read），无法通过其他角色"减少"该权限。

**常见错误**：管理员因调试权限问题而临时授予 Organization 级访问，之后忘记收回——这会导致安全模型像"瑞士奶酪"一样到处是洞。

::panel
### Member's Privilege Inheritance
创建或编辑 Security Role 时，可以设置 **Member's privilege inheritance** 选项：

- **Team privileges only**：用户仅在 Team 上下文中获得权限。没有个人权限的成员可以创建记录，但记录归 Team 所有。仅在拥有 User 级 Create / Read 权限时才能访问 Team 拥有的记录。
- **Direct User (Basic) access level and Team privileges**（默认值）：角色直接赋予用户个人权限。用户可以以自己的名义创建记录并访问自己拥有/创建的记录。
:::

## #access-levels 03 / Access Levels :: 5 个访问级别详解

每个权限都可以设置一个访问级别，决定用户能够在多大范围内执行该操作。级别从窄到宽排列。

✕

### None（无）

不允许任何访问。用户不能对该表执行此操作。

U

### User（用户级）

用户只能访问**自己拥有的**记录，以及与自己/自己所在 Team 共享的记录。适合普通业务人员。

BU

### Business Unit（业务单元级）

用户能访问**所在 Business Unit** 中所有用户的记录。自动包含 User 级访问。适合部门经理。

P

### Parent: Child BU（父子 BU 级）

用户能访问本 BU 及**所有下属 BU** 的记录。自动包含 BU 级和 User 级。适合分管多个部门的管理者。

O

### Organization（组织级）

用户能访问组织内**所有**记录，无论属于哪个 BU。权限最高，通常仅授予管理员。自动包含所有其他级别。

:::accordion
::panel
### Organization-owned 表的特殊性
如果表的所有权是 Organization-owned（而非 User/Team-owned），则访问级别只有两个选项：Organization 或 None。不支持 User、BU、Parent:Child 级别——因为记录没有个人所有者。

::panel
### Permission Settings（权限预设组）
为简化表权限配置，Dataverse 内置了 6 档权限预设组合，可一键应用到目标表：

| 预设名称 | 含义 |
| --- | --- |
| No Access | 该角色的用户对此表完全无权限。 |
| Full Access | 用户可以查看和编辑组织内所有记录。 |
| Collaborate | 用户可以查看所有记录，但只能编辑自己的。 |
| Private | 用户只能查看和编辑自己的记录。 |
| Reference | 用户只能查看记录，不能编辑。 |
| Custom | 表示权限已被手动修改，不匹配任何预设。 |
:::

## #predefined-roles 04 / Predefined Roles :: 预定义 Security Role 详解

Dataverse 环境内置了多个预定义角色，覆盖从最小权限到完全管理权限的各种需求。预定义角色**不可编辑**——自定义需求请复制后修改。

:::accordion
::panel { open: true }
### 无 Dataverse 数据库环境的角色
没有 Dataverse 数据库的 Power Platform 环境仅有两个预定义角色：

| 角色名称 | 关键能力 |
| --- | --- |
| Environment Admin | 可以执行所有环境管理操作：添加/移除用户、配置 Dataverse 数据库、创建 DLP 策略、查看和管理该环境中创建的所有资源。 |
| Environment Maker | 可以创建 App、Connection、Custom API、Flow 等资源，并分享给组织内用户。但**不能访问环境中的数据**。 |

::panel
### 含 Dataverse 数据库环境的角色
当环境挂载 Dataverse 数据库后，安全模型会扩展出完整的预定义角色矩阵：

| 角色名称 | 定位与权限 |
| --- | --- |
| System Administrator | **最高权限**。可以完全自定义或管理环境，包括创建、修改、分配 Security Role；可以查看环境中的所有数据。环境配置 Dataverse 后，应使用此角色代替 Environment Admin。 |
| System Customizer | 可以完全自定义环境（创建/修改表、字段、视图等）。可以查看所有**自定义表**的数据。但对 Account、Contact、Activity 等核心表，**只能查看自己创建的记录**。 |
| Basic User | 可以运行 App 并对自己拥有的记录执行常规操作。拥有核心业务表（Account、Contact、Activity、Process）的权限。*（前称 Common Data Service User）* |
| Environment Maker | 可以创建 App、Connection、Custom API、Flow 等资源。但**没有数据访问权限**。创建连接 Dataverse 的 App 需额外分配 System Customizer 角色。 |
| App Opener | **最小权限模板**。仅有运行 Model-driven App 的基础权限。不包含核心业务表权限。主要用途是作为创建自定义角色的基础模板——复制后按需添加权限。 |
| Delegate | 允许代码以另一个用户的身份执行操作（Impersonate）。通常与其他角色配合使用。 |
| Global Administrator | Microsoft 365 全局管理员角色。必须**自我提升**（self-elevate）为 System Administrator 后才能管理 Dataverse。 |
| Power Platform Administrator | Power Platform 服务管理员。需自我提升为 System Administrator 后才能执行管理操作。 |
| Dynamics 365 Administrator | Dynamics 365 服务管理员。同样需要自我提升为 System Administrator。 |
| Support User | 拥有自定义设置和业务管理设置的完全读取权限，便于支持人员排查配置问题。**不能访问核心记录**。不可分配给用户。 |
| Service Reader | 对所有表（含自定义表）拥有完全 Read 权限。供服务使用，**不可分配给用户或 Team**。 |
| Service Writer | 对所有表拥有 Create、Read、Write 权限。供服务使用，**不可分配给用户或 Team**。 |
| Service Deleted | 对所有表拥有完全 Delete 权限。供服务使用，**不可分配给用户或 Team**。 |
| Office Collaborator | 对组织内共享的记录拥有 Read 权限。不能访问其他核心/自定义表记录。分配给 Office Collaborators Owner Team，而非个人用户。 |
| Website App Owner | 拥有 Azure Portal 中网站应用程序注册的用户。 |
| Website Owner | 创建 Power Pages 网站的用户。受管角色，不可更改。 |

::panel
### 各角色可创建的资源对比
不同预定义角色对 Power Platform 资源的创建能力：

| 资源类型 | Environment Maker | Basic User | System Customizer | System Admin |
| --- | --- | --- | --- | --- |
| Canvas App | ✓ | ✓ | ✓ | ✓ |
| Cloud Flow | ✓（非 Solution） | ✓ | ✓ | ✓ |
| Connector | ✓（非 Solution） | ✓ | ✓ | ✓ |
| Connection | ✓ | ✓ | ✓ | ✓ |
| Data Gateway | — | ✓ | — | ✓ |
| Dataflow | ✓ | ✓ | ✓ | ✓ |
| Dataverse Tables | — | — | ✓ | ✓ |
| Model-driven App | ✓ | — | ✓ | ✓ |
| Solution Framework | ✓ | — | ✓ | ✓ |
| Desktop Flow | — | — | ✓ | ✓ |
| AI Builder | — | — | ✓ | ✓ |

::panel
### 应用专属角色（Dynamics 365）
部署 Dynamics 365 应用后，环境中会自动添加更多角色：

- **Dynamics 365 Sales**：Sales Manager、Salesperson 等预定义角色。
- **Dynamics 365 Customer Service**：Omnichannel 相关角色。
- **Dynamics 365 Field Service**：Field Service 相关角色定义。
- **Dynamics 365 Marketing**：Marketing 自动化相关角色。
- **Dynamics 365 Finance**：公共部门安全角色。

这些角色由各应用包带入，一般不需要手动创建。
:::

## #scenarios 05 / Quick Reference :: 常见场景的角色配置速查

按用户的实际业务职责，直接对号入座所需角色组合。

:::insight-grid { cols: 3 }
::card 01
### 运行一个 Model-driven App
用户只需要打开并使用已构建好的应用，查看和编辑自己的数据。

Basic User

+ App 的 Share 权限

::card 02
### 运行一个 Canvas App（连接 Dataverse）
用户使用 Canvas App 读写 Dataverse 数据。

Basic User

或自定义角色

::card 03
### 创建/修改 Canvas App 或 Flow
Maker 需要在环境中构建应用或自动化流程。

Environment Maker

::card 04
### 创建/修改 Dataverse 自定义表
需要创建或修改表结构、字段、关系、视图、表单。

System Customizer

+ Environment Maker

::card 05
### 管理 Security Role 和用户权限
需要创建/修改安全角色、分配角色给用户、管理 BU 和 Team。

System Administrator

::card 06
### 管理整个环境（DLP、审计、备份）
执行环境级别的管理操作：数据丢失防护策略、审计配置、环境备份与恢复。

System Administrator

或 Power Platform Admin

::card 07
### 代码中以其他用户身份操作
Plugin 或后端服务需要 Impersonate 其他用户来执行数据操作。

Delegate

+ 目标操作权限

::card 08
### 创建最小权限的自定义角色
需要为特定应用场景创建一个权限精确控制的角色。

复制 App Opener

按需添加权限

::card 09
### 查看所有部门的数据（只读）
高管或审计人员需要跨部门查看所有数据但不需要编辑。

自定义角色

Organization 级 Read
:::

## #security-layers 06 / Security Layers :: 超越 Security Role 的安全分层

Security Role 只是 Dataverse 安全体系的一层。完整的数据保护需要理解所有安全构建模块。

:::accordion
::panel { open: true }
### Business Unit（业务单元）
Business Unit（BU）是**安全边界**，而非组织架构的直接映射。每个 Dataverse 环境有一个**根 BU**（不可更改），可以创建子 BU 形成树状层级。

关键规则：

- 每个用户**必须属于且仅属于一个** BU。
- 用户创建的记录默认归属其所在 BU。
- Security Role 的访问级别与 BU 层级联动：User 级仅限自己；BU 级覆盖同 BU 所有用户；Parent:Child 级覆盖本 BU 及所有子 BU。

**现代化 BU（Modernized Business Units）**：开启后，用户可同时持有不同 BU 的 Security Role，支撑矩阵式权限管理——同一用户得以跨多个 BU 访问数据。

::panel
### Team（团队）
Team 是另一个重要的安全构建模块，归属于 Business Unit：

- **Default Team**：每个 BU 自动创建，包含该 BU 的所有用户，成员由系统动态管理。
- **Owner Team**：可以拥有记录（Record Owner）。给 Team 赋予 Security Role 后，所有成员自动获得该权限。是批量授权的高效方式。
- **Access Team**：不能拥有记录或被赋予 Security Role。通过 Record Sharing 机制工作，用户因记录被共享给 Access Team 而获得访问权限。性能更优。
- **Microsoft Entra Group Team**：与 Entra Security Group 绑定的 Dataverse Team，成员列表与 Entra ID 自动同步——在 Entra 中增删成员即可同步更新 Dataverse 权限。

::panel
### Record Sharing（记录共享）
当 Security Role + BU 的组合无法覆盖某个特殊的访问需求时，可以逐条共享记录。共享支持 5 种途径：

1. 直接与用户共享。
2. 通过关联记录继承共享（相关记录的共享传递到关联记录）。
3. 与 Team 共享（Team 成员获得访问权）。
4. 通过关联记录与 Team 的共享关系继承。
5. 与整个 Organization 共享。

**注意**：Sharing 应作为**例外机制**使用，因为它的性能不如 Role-based 访问控制，且更难审计和排查问题。

::panel
### Column Security Profile（列级安全）
当记录级权限控制不够精细时，可以启用**列级安全**来保护敏感字段（如身份证号、薪资、手机号）。

工作原理：

1. 在目标列上启用 Column-level Security。
2. 创建 Column Security Profile，指定该列的 Create / Read / Update 权限。
3. 将 Profile 关联到用户或 Team。

**重要**：列级安全与记录级安全完全独立——用户必须**先有记录的访问权限**，Column Security Profile 才会生效。不要过度使用列级安全，它会增加系统开销。

::panel
### Hierarchy Security（层级安全）
Hierarchy Security 允许上级自动看到下属的数据，无需逐条共享。两种模型：

- **Manager Hierarchy**：基于用户表的 Manager 字段。直属上级可以 Read/Write/Append/AppendTo 下属数据；间接上级只有 Read 权限。管理链必须在同一 BU 或父 BU 中。
- **Position Hierarchy**：基于自定义的职位层级。与 Manager 关系无关，可以跨 BU 访问。适合需要跨部门数据可见性的场景（如客服组织）。

可以通过 **Depth** 参数限制上级的可见层数。例如 Depth=2 意味着 CEO 只能看到直属下级和再下一级的数据。

Hierarchy Security 默认禁用，需在 Power Platform admin center → Settings → Users + Permissions → Hierarchy security 中开启。
:::

## #best-practices 07 / Best Practices :: 配置 Security Role 的最佳实践

来自官方文档和社区经验的安全角色配置建议。

:::accordion
::panel { open: true }
### 最小权限原则
- **从 App Opener 或 Basic User 复制**：创建自定义角色时，从预定义的最小权限角色出发，逐步添加所需权限。不要从 System Administrator 删减——容易遗漏。
- **区分 Maker 和 User**：构建 App 的人需要 Environment Maker + System Customizer；使用 App 的人只需要 Basic User 或自定义角色。
- **避免 Organization 级别**：除非业务确实需要全组织数据可见性，否则优先使用 User 或 BU 级。
- **审计"临时提权"**：排查问题时临时授予高权限，问题解决后必须立即回收。

::panel
### 角色设计策略
- **按应用拆分角色**：为每个 App 创建专用角色，而非用一个"大角色"覆盖所有 App。这样用户只有其使用的 App 需要的权限。
- **利用 Team 批量授权**：将 Security Role 赋给 Owner Team，然后管理 Team 成员——比逐人分配角色更高效、更易管理。
- **结合 Entra Security Group**：将 BU 与 Entra Security Group 关联，直接在 Entra 中增删成员来控制 Dataverse 权限——收拢为单一身份管理入口。
- **减少 BU 数量**：优先使用较少的 BU + Hierarchy Security 组合。大量 BU 会增加维护成本和复杂度。
- **描述性命名**：角色名称和描述应清晰说明用途（如"销售代表 - 读写客户和商机"），方便后续审计和交接。

::panel
### 常见陷阱与排查
- **"瑞士奶酪"式权限**：因反复调试而随意提升权限级别，导致安全模型千疮百孔。建议定期审视所有自定义角色的权限配置。
- **Append 和 Append To 的混淆**：Append 赋给"被附加的记录"（如 Note），Append To 赋给"接收附加的记录"（如 Opportunity）。两者方向相反。
- **忘记 Sharing 的性能代价**：大量使用 Record Sharing 会降低查询性能。如果发现需要频繁共享，应考虑调整 Security Role 或 BU 结构。
- **Solution 导入的副作用**：如果 Solution 中包含已重命名的预定义角色，导入时可能会恢复原名。导入前检查 Solution 中的角色定义。
- **使用 Check Access 功能**：在记录的命令栏中使用 Check Access，可以查看用户通过哪条途径获得了对该记录的访问权限——是 Role、Sharing 还是 Hierarchy。

::panel
### 跨环境安全管理
Security Role 和 Column Security Profile 可通过 **Dataverse Solution**（解决方案）打包并在环境间迁移；但四类组织与归属配置**不会随包迁移**，需在目标环境中单独设定：

- Business Unit 结构
- Team 定义和成员
- 用户的角色分配
- Record Sharing 配置

建议在 Dev → Test → Prod 的 ALM 流程中，统一管理 Security Role 的 Solution，但在每个环境中单独配置用户分配和 BU 映射。
:::

## #references 08 / References :: 参考资料

- [1] Microsoft Learn — https://learn.microsoft.com/en-us/power-platform/admin/security-roles-privileges | Security Role 的创建、编辑、权限配置和用户分配。
- [2] Microsoft Learn — https://learn.microsoft.com/en-us/power-platform/admin/database-security | 预定义角色列表及各角色可创建的资源对比。
- [3] Microsoft Learn — https://learn.microsoft.com/en-us/power-platform/admin/wp-security-cds | 安全模型核心概念：RBAC、Business Unit、Team、Record Sharing、Column Security。
- [4] Microsoft Learn — https://learn.microsoft.com/en-us/power-platform/admin/how-record-access-determined | 记录访问判定流程：Privilege Check → Access Check（Ownership / Role / Sharing / Hierarchy）。
- [5] Microsoft Learn — https://learn.microsoft.com/en-us/power-platform/admin/hierarchy-security | Manager Hierarchy 和 Position Hierarchy 的配置与使用。
- [6] Microsoft Learn — https://learn.microsoft.com/en-us/power-platform/admin/wp-security | Dataverse 安全体系总览：从认证到授权的完整链路。
- [7] Microsoft Learn — https://learn.microsoft.com/en-us/training/modules/get-started-security-roles/ | 官方交互式培训模块：Security Role 入门。
