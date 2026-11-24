---
title: "Power Platform按量付费开通指南 || Power Platform Pay-as-You-Go Billing Plan Setup Guide"
eyebrow: "Global 商业云 · 官方文档 · 仅指南 || Global Commercial · Official Docs · Guide Only"
brand: Power Platform
date: 2026-11-11
strict_i18n: true
strict_density: true
lead: "供客户团队协调开通计费计划的操作手册：按步骤交接前提、权限与范围，核对保存结果，再安排成本查看和告警。仅提供指南，不登录租户或执行开通。 || A customer handoff manual: follow one setup sequence with prerequisites, scoped permissions, saved-configuration checks, and cost monitoring. Guide only; no tenant access or provisioning."
hero_actions:
  - "准备角色交接 || Prepare the Handoff | #handoff"
  - "查看官方依据 || Review Official Sources | #references"
panel_label: "开通前先确认 || Before Setup"
panel_title: "费用、资源与使用权限分开确认 || Separate Billing, Resources, and Access"
panel:
  - "平台权限决定谁能关联环境。 || Platform authority controls environment linking."
  - "Azure 权限决定谁能创建和授权。 || Azure permissions control resource creation and delegation."
  - "财务权限决定谁能看成本、管预算。 || Financial access controls cost viewing and budget management."
metrics:
  - "权限体系 || Permission Systems | 3 | 平台管理、Azure RBAC、成本与计费。 || Platform administration, Azure RBAC, and cost/billing access."
  - "验收阶段 || Acceptance Stages | 2 | 配置已保存；正式用量后再对账。 || Saved configuration first; usage reconciliation later."
  - "官方正文核对 · UTC || Official Text Review · UTC | 2026-11-11 | 无租户登录，无收费测试。 || No tenant login or chargeable testing."
style:
  accent: "#874100"
  teal: "#165954"
---

## #handoff 00 / Prerequisite Handoff :: 先明确费用归属，再分配操作职责 || Agree on Cost Ownership before Assigning Tasks

本指南面向客户侧业务申请人、平台管理员、Azure 订阅管理员和财务负责人，适用于 Global 商业云，不代替租户审批，也不覆盖中国云或政府云。 || For customer business requesters, platform administrators, Azure subscription administrators, and financial owners in the Global commercial cloud; this guide does not replace tenant approval or cover national or government clouds.

:::flow
1. **计费关系 || Billing Relationship** — 按量付费（Pay-as-you-go，PAYG）把用量计入 Azure 订阅。计费计划（billing plan，部分文档仍称 billing policy）把一个或多个 Power Platform 环境与一个 Azure 订阅关联；每个环境同时只能关联一个计划。[1][2] || Pay-as-you-go (PAYG) bills usage to an Azure subscription. A billing plan, also called a billing policy in parts of the documentation, links one or more Power Platform environments to one subscription. An environment can belong to only one plan at a time.[1][2]
:::

:::flow
1. **Azure 账单载体 || The Azure Billing Resource** — 创建计划会在所选资源组中生成同名 Power Platform account 资源，用来归集计量费用。资源组是管理相关 Azure 资源的容器；它不是 Power Platform 环境。[1][2][9] || Creating the plan creates a same-named Power Platform account resource in the selected resource group to collect meter charges. A resource group is a container for related Azure resources, not a Power Platform environment.[1][2][9]
:::

:::flow
1. **业务申请人（协作建议） || Business Requester (Recommended Handoff)** — 产品、环境 ID、用途、批准的费用承担部门和停用联系人。 || Product, environment ID, purpose, approved cost owner, and retirement contact.
2. **平台管理员（协作建议） || Platform Administrator (Recommended Handoff)** — 环境类型与区域、现有计费关联、应用／流程负责人、执行人的平台管理权限。 || Environment type/region, existing plan, app/flow owners, and executor platform authority.
:::

:::flow
1. **Azure 订阅管理员（协作建议） || Azure Subscription Administrator (Recommended Handoff)** — 租户／订阅 ID、订阅状态和合约类型、资源组、资源创建和提供程序注册权限。 || Tenant/subscription IDs, state/agreement, resource group, and creation/registration permissions.
2. **财务负责人（协作建议） || Financial Owner (Recommended Handoff)** — 批准的费用范围、成本查看人、预算维护人、告警收件人和后续复核安排。 || Approved charge scope, cost reader, budget maintainer, alert recipients, and review schedule.
:::

## #eligibility 01 / Step 1 · Eligibility :: 确认租户、订阅和环境符合条件 || Confirm Tenant, Subscription, and Environment Eligibility

先核对身份和目标环境，再申请权限。Microsoft Entra 租户是组织的身份目录，每个 Azure 订阅都关联一个目录；当前开通向导只列出本租户内执行人有足够权限的订阅。[1][8] || Check identity and the target environment before requesting access. A Microsoft Entra tenant is the organization's identity directory, and each Azure subscription is associated with one directory; the setup picker lists subscriptions in the tenant where the executor has sufficient permissions.[1][8]

:::flow
1. **前提 || Prerequisites** — 准备已批准的产品范围、目标环境 ID、环境类型／区域、Azure 订阅 ID 及其目录 ID。使用组织账号；同一个人能登录两个目录不代表订阅和环境属于同一租户。[1][8] || Have the approved product scope, environment ID/type/region, subscription ID, and associated directory ID. Use an organizational identity. Being able to sign into two directories does not establish a same-tenant subscription/environment relationship.[1][8]
2. **执行人与权限范围 || Executor and Permission Scope** — 平台管理员核对其可管理的环境；Azure 订阅管理员提供订阅状态和目录信息。Azure Reader 可在获授的订阅范围查看资源；这不是创建计划的权限。业务申请人只整理交接资料，无需因此获得管理员角色。[1][8] || The platform admin checks environments they administer; the Azure administrator supplies subscription state and directory details. Azure Reader can inspect resources at its assigned subscription scope; it cannot provision the plan. The requester can collect the handoff without receiving an admin role.[1][8]
:::

:::flow
1. **操作与位置 || Action and Location** — 由管理员在 Azure portal 的 Subscriptions 中核对目录和 Status；在 Power Platform admin center（PPAC）核对环境 ID、类型和区域。标准开通只支持 Production 与 Sandbox；FAQ 明确 Norway 和 Korea (South) 的按量计费与报表不可用。[1][3][10] || In Azure portal > Subscriptions, verify the directory and Status. In the Power Platform admin center (PPAC), verify environment ID, type, and region. Standard setup supports Production and Sandbox only. The FAQ lists pay-as-you-go billing and reporting as unavailable in Norway and Korea (South).[1][3][10]
:::

:::flow
1. **成功判据 || Success Criteria** — 交接表中的目录一致，订阅为 Active/Enabled，目标是可选区域内的 Production 或 Sandbox。区域下拉框用于筛选环境；不能据此推定所有区域或所有环境类型都受支持。[1][3][10] || The directory IDs match, the subscription is Active/Enabled, and the target is Production or Sandbox in an available region. The region picker filters environments; it is not evidence that every region or environment type is supported.[1][3][10]
:::

:::flow
1. **缺失或不可见 || Missing or Unavailable** — 订阅不显示：先查目录与执行人权限，不要先新建订阅。Disabled、Expired 或 Warned 会限制创建／更新；Past Due 仍可能可用，但应先交财务处理。当前开通文档没有列出完整的订阅优惠类型白名单，不能承诺任意试用、赠金或学生订阅均可用。[1][10] || If the subscription is missing, check directory and executor permissions before procuring another subscription. Disabled, Expired, or Warned states restrict writes; Past Due can remain active but needs financial attention. The setup page does not publish an exhaustive offer whitelist: do not assume every trial, credit, or student offer qualifies.[1][10]
:::

:::flow
1. **区域与资源组 || Region and Resource Group** — 资源组必须属于选定的 Azure 订阅。Azure 文档允许资源与资源组处于不同区域；资源组区域用于存储元数据，不能擅自增加「必须等于环境区域」的规则。按向导实际可选范围和组织区域政策确认；不要把费用合约类型与成本可见性条件混为产品资格。[1][9][12] || The resource group must belong to the selected subscription. Azure allows resources and their resource group to be in different regions; the group location stores metadata. Do not invent an environment/group region-equality rule. Confirm the picker's available choices and organizational policy; billing-agreement cost visibility is not product-offer eligibility.[1][9][12]
:::

## #permissions 02 / Step 2 · Permissions :: 分别确认平台权限、Azure 资源权限和授权权限 || Separate Platform, Resource, and Role-Assignment Authority

平台管理角色、Azure 基于角色的访问控制（Azure RBAC）和 Azure 计费／成本权限属于不同授权体系。Global Administrator 默认没有 Azure 资源访问权；持有 Azure Owner 也不能代替环境管理权限。[1][8] || Platform admin roles, Azure role-based access control (Azure RBAC), and Azure billing/cost access are separate authorization systems. Global Administrator has no default Azure resource access; Azure Owner does not substitute for environment administration.[1][8]

:::flow
1. **前提 || Prerequisites** — 先选定计划创建人和备用维护人，并取得步骤 1 的订阅、环境与资源组信息。环境创建者或 Environment Maker 不等于开通文档要求的管理员；有 Dataverse 的环境使用 System Administrator 管理数据库权限。[1][16] || Select the plan creator and backup maintainer using the approved environment, subscription, and resource group. Environment creator or Environment Maker is not the documented billing administrator. Dataverse environments use System Administrator for full database administration.[1][16]
:::

:::flow
1. **执行人与权限范围 || Executor and Permission Scope** — 创建人须符合官方平台矩阵：Environment admin 的编辑／关联范围受本人创建的计划及本人管理的环境限制；Power Platform admin、Global admin、Dynamics 365 admin 的计费矩阵范围为租户。还必须具备 Azure 侧权限，或与持有人协作；不能只验证其中一侧。[1] || Use a role in the setup matrix: Environment admin is limited to their own plans and administered environments; Power Platform admin, Global admin, and Dynamics 365 admin have tenant-wide billing scope. Azure permissions, or coordination with their holder, are also required; validating only one side is insufficient.[1]
:::

:::flow
1. **操作与位置 || Action and Location** — Azure 管理员在目标订阅的 Access control (IAM) 核对创建人权限。开通文档要求能在订阅中创建新资源、注册资源提供程序，或与有这些权限的人协作；订阅范围的 Contributor 或 Owner 通常覆盖这些能力，Owner 不是统一必选角色。[1][6] || In the target subscription's Access control (IAM), the Azure administrator checks the executor's permissions. Setup requires resource creation and provider registration in the subscription, or working with someone who has them. Subscription-scoped Contributor or Owner usually covers these capabilities; Owner is not universally required.[1][6]
:::

:::flow
1. **注册权限与范围 || Registration Permission and Scope** — 资源提供程序用于提供特定类型的 Azure 资源。需要注册时，由具备目标订阅 `/register/action` 权限的人员在 Subscriptions > Resource providers 中完成注册；Contributor 与 Owner 包含该权限。只注册本次需要的提供程序，不批量注册所有服务。[5] || A resource provider supplies a specific type of Azure resource. When registration is needed, a holder of `/register/action` at the target subscription registers it under Subscriptions > Resource providers; Contributor and Owner include this permission. Register only required providers, not every service.[5]
:::

:::flow
1. **资源组准备 || Prepare the Resource Group** — 已有经批准的资源组时直接复用；若尚无可用资源组，由具备订阅资源创建权限的 Azure 管理员在 Resource groups > Create 填写订阅、名称和区域，执行 Review + Create > Create，刷新列表后交接资源组名称。此处仅说明客户侧获批后的操作步骤，本文未执行任何资源创建。[1][6][9] || Reuse an approved existing resource group when available. If none exists, an Azure administrator with subscription resource-creation permission opens Resource groups > Create, enters subscription, name, and region, selects Review + Create > Create, and hands off the group name after refreshing the list. These steps describe an approved customer change; no resources were created for this guide.[1][6][9]
:::

:::flow
1. **成功与缺权排障 || Success and Missing-Permission Recovery** — 记录创建资源与注册能力的持有人及范围。资源组 Contributor 不自动具备订阅注册权限，也不保证订阅下拉框可见；请订阅管理员核对。Contributor 不能分配 Azure RBAC 角色；Add role assignment 灰显时，需要在所授范围有 `Microsoft.Authorization/roleAssignments/write` 的授权人处理。[1][5][6][7] || Record who holds creation and registration permissions and at which scope. Resource-group Contributor does not automatically grant subscription registration or guarantee picker visibility. Ask the subscription administrator to check. Contributor cannot assign Azure RBAC roles; a disabled Add role assignment requires an authorized holder of `Microsoft.Authorization/roleAssignments/write` at the assignment scope.[1][5][6][7]
:::

:::flow
1. **不要扩大权限代替排查 || Do Not Replace Diagnosis with Escalation** — 先核对账号、范围、已有角色和组织审批；不要为了看见订阅直接给所有人 Global Administrator 或 Owner。本文列的是官方所需能力与内置角色示例，不提供自造的最小权限自定义策略。[1][6][7][8] || Check identity, scope, existing roles, and organizational approval before adding access. Do not assign everyone Global Administrator or Owner just to expose a picker. This guide reports official required capabilities and built-in role examples, not an invented least-privilege custom policy.[1][6][7][8]
:::

:::accordion
::panel
### 官方平台权限矩阵与角色申请 || Official Platform Matrix and Role Requests
矩阵中的「可创建」不免除 Azure 权限条件；Environment admin 的计划归属限制也适用于 Power Apps 入口。[1] || Creation rights do not waive Azure prerequisites; Environment admin ownership restrictions apply to the Power Apps route as well.[1]

1. **Environment admin** — 可创建；仅编辑本人创建的计划，只关联本人管理的环境与本人创建的计划。[1] || Can create; can edit only plans they created and link only their administered environments to their own plans.[1]

1. **Power Platform admin** — 可创建；可编辑租户内所有计划，关联租户内所有环境。[1] || Can create, edit all plans, and link all environments in the tenant.[1]

1. **Global admin** — 开通文档列为可创建、编辑全部计划、关联全部环境；不因此自动获得 Azure 资源权限。[1][8] || Setup lists creation, all-plan editing, and all-environment linking; this does not automatically grant Azure resource access.[1][8]

1. **Dynamics 365 admin** — 开通矩阵也列为租户级权限；另核对已有环境安全组的成员要求。[1][18] || Also listed with tenant-wide billing authority; check the separate environment security-group membership condition.[1][18]

需要补齐平台服务管理员角色时，按官方文档由 Privileged Role Administrator 在 Microsoft 365 admin center > Users > Active users > Account > Roles 中操作，并将服务管理角色直接授予用户。请遵循组织既有审批和按需激活流程，不要在开通向导中尝试自行提权。[18] || If a service admin role is missing, the documented route is for a Privileged Role Administrator to assign it in Microsoft 365 admin center > Users > Active users > Account > Roles; assign service roles directly to users. Follow existing approval and on-demand activation procedures, and do not attempt self-elevation in the billing wizard.[18]
:::

## #plan 03 / Step 3 · Plan Details :: 从当前 PPAC 入口填写计费计划 || Enter the Plan through the Current PPAC Route

本流程使用官方当前文档中的 Licensing > Pay-as-you-go plans。文档还保留 Billing policies 等旧称；不要把不同入口的按钮名称拼成一条未经证实的操作路径。[1] || The main route follows the current documented Licensing > Pay-as-you-go plans experience. Parts of the documentation retain the older term Billing policies. Do not combine labels from different experiences into an unverified route.[1]

:::flow
1. **前提 || Prerequisites** — 准备计划名称、已批准的订阅／已有资源组、产品清单和费用审批。Save 或 Connect subscription 前须完成[下方可见的预检](#product-preflight)；这些操作会创建 Azure 资源并关联计费，不是保存草稿。[1][2] || Have the plan name, approved subscription/resource group, product list and financial approval. Complete [the visible preflight below](#product-preflight) before Save or Connect subscription: these create the Azure resource/billing association, not a draft.[1][2]
2. **执行人与权限范围 || Executor and Permission Scope** — 由步骤 2 确认的计划创建人操作：官方平台矩阵中的创建权限，加目标订阅所需的新资源创建／提供程序注册能力，或已安排有权限者协作。范围是目标租户、目标订阅及所选资源组，不是任意 Azure 订阅。[1] || Use the approved creator: a creation role in the platform matrix plus the required Azure resource-creation/provider-registration capabilities, or arranged coordination with their holder. The permission scope is the target tenant, subscription, and selected resource group, not arbitrary Azure subscriptions.[1]
:::

:::flow
1. **产品与许可预检 || Product and License Preflight** — 此项预检无需先保存计费计划：平台管理员与产品负责人先按[适用产品分支的许可条件](#products)核对所选产品、现有用户许可／app passes 和容量。PAYG 环境不消耗 Process 许可与 unattended RPA add-on；依赖 Process 的流程须留在非 PAYG 环境。[1][3][4] || This preflight does not require a saved plan: platform and product owners first review the selected products, [the applicable product branches' licensing conditions](#products), existing user licenses/app passes, and capacity. PAYG environments do not consume Process licenses or unattended RPA add-ons; keep Process-dependent flows outside PAYG.[1][3][4]
:::

:::flow
1. **容量与存储影响 || Capacity and Storage Impact** — 财务与平台负责人在关联前核对 Dataverse 数据库、文件和审计日志存储及容量分配。Dataverse 计量默认开启；当前文档允许预分配容量，超分配部分计入 Azure。存储可能在应用使用之前收费；影响获批准前不得保存或连接。[3][4] || Finance and the platform owner review Dataverse database, file and audit-log storage and capacity allocation before attachment. Dataverse metering is on by default; current documentation permits preallocation and bills overages to Azure. Storage can incur charges before app usage; do not save or connect until the impact is approved.[3][4]
:::

:::flow
1. **操作与位置 || Action and Location** — 在 PPAC 选择 **Licensing > Pay-as-you-go plans > New billing plan > Azure subscription**。填写 **Name**；在 **Azure subscription** 选订阅，在 **Resource group** 选已有资源组，在 **Power Platform products** 选经批准的产品，然后选 **Next**。[1] || In PPAC, choose **Licensing > Pay-as-you-go plans > New billing plan > Azure subscription**. Enter **Name**, select **Azure subscription** and an existing **Resource group**, select approved **Power Platform products**, then **Next**.[1]
:::

:::flow
1. **成功判据 || Success Criteria** — 确认表单中的订阅 ID、资源组和产品范围与审批一致，并进入 Select environments。此时只完成表单，不把进入下一屏当作已开通成功。[1] || Confirm the subscription ID, group, and products match approval, then reach Select environments. Reaching that pane means the form is ready, not that billing setup has succeeded.[1]
:::

:::flow
1. **缺权或不可见 || Missing Permission or Visibility** — 订阅不显示或出现权限错误，联系订阅所有者或 Azure 管理员核对目录和官方创建／注册条件。资源组为空，先让 Azure 管理员核实组是否存在于该订阅。不要为绕过空列表而选择其他部门订阅或新建未批准资源组。[1] || For a missing subscription or a permission error, ask its owner or Azure administrator to check directory and the documented creation/registration prerequisites. For an empty group picker, verify the group exists in that subscription. Do not substitute another department's subscription or an unapproved group.[1]
:::

:::flow
1. **另一种计划不属于此主流程 || A Different Plan Type Has a Different Flow** — **Microsoft 365 Copilot Chat** 是 New billing plan 中另一个选项：官方说明保存后会自动预配或重用名为 Microsoft 365 Copilot Chat 的环境，且管理员不能删除该环境。只有目标确为该场景时才用该分支，不把它当作标准环境关联步骤。[1] || **Microsoft 365 Copilot Chat** is a separate New billing plan choice. Its documented flow automatically provisions or reuses the Microsoft 365 Copilot Chat environment, which admins cannot delete. Use that branch only for that scenario, not as the standard environment-linking workflow.[1]
:::

:::accordion
::panel
### 可选入口：从 Power Apps 应用设置发起 || Alternate Entry: Start in Power Apps App Settings
这是官方记录的另一个入口，使用相同平台／Azure 权限条件，不是当前 PPAC 菜单的别名。[1] || This is a separately documented entry point with the same platform/Azure prerequisites, not an alias for the current PPAC menu.[1]

1. **位置与操作 || Location and Action** — 在 Power Apps 选对环境，进入 Apps > 应用 > Settings；尚未开通时选 **Set up pay-as-you-go**，填计划／订阅／资源组。完成上方[产品／许可、Process 与 Dataverse 预检](#product-preflight)后，才选 **Connect subscription** 启用环境计费。支持 canvas 与 model-driven apps。[1] || In Power Apps, select the environment, then Apps > app > Settings > **Set up pay-as-you-go** if not enabled. Enter plan/subscription/group details. Only after completing [the product/license, Process and Dataverse preflight](#product-preflight), choose **Connect subscription** to enable environment billing. Canvas and model-driven apps are supported.[1]

1. **成功与边界 || Success and Boundary** — 成功后返回应用设置；通过应用入口连接仍会对环境中所有未退出该模式的应用启用按量计费，不是仅对当前应用开通。已开通时，**Edit pay-as-you-go billing** 会转到 PPAC。不要把本入口的 Connect subscription 写成 PPAC 最后一步。[1] || After success, app settings reopen. Connecting through an app enables environment-wide app billing except for apps opted out; it is not billing for that app alone. **Edit pay-as-you-go billing** opens PPAC when enabled. Connect subscription is not the PPAC final button.[1]
:::

## #environments 04 / Step 4 · Environment Attachment :: 保存前核对每个环境的计费影响 || Review Every Environment before Saving

一个计划可以关联多个环境，但一个环境同时只能关联一个计划。已有计划的环境需要走受控变更，不能假设可在多个订阅间重复计费。[2] || A plan can link multiple environments, but each environment can link to only one plan at a time. An environment with an existing plan needs a controlled change, not assumed parallel billing across subscriptions.[2]

:::flow
1. **前提 || Prerequisites** — Save 前须确认支持的环境类型／区域、现有计划和业务／财务审批，并完成[产品／许可、Process 与 Dataverse 预检](#product-preflight)。已有工作负载／存储即使不试用也可能收费。[1][3][4] || Before Save, confirm supported environment type/region, existing plan and business/financial approval; complete [the product/license, Process and Dataverse preflight](#product-preflight). Existing workloads/storage may incur charges even without a manual test.[1][3][4]
2. **执行人与权限范围 || Executor and Permission Scope** — Environment admin 只能把本人管理的环境关联到本人创建的计划；官方矩阵中的租户管理员可关联租户内环境。创建与保存仍受目标订阅 Azure 条件约束。若由接替人维护，先核对计划归属，不把环境权限当作所有计划的编辑权限。[1] || Environment admin can attach only environments they administer to plans they created; the matrix's tenant admins can link tenant environments. Creation/save still depends on target-subscription Azure prerequisites. For handover, check plan ownership: environment access does not confer editing scope over every plan.[1]
:::

:::flow
1. **操作与位置 || Action and Location** — 完成[产品／许可、Process 与 Dataverse 预检](#product-preflight)后，在 **Select environments** 选择目标 **Region**，核对环境 ID／名称，勾选经批准的环境，才选 **Save**。只使用向导有效选择，不推断未记录的跨区域组合。[1] || Only after completing [the product/license, Process and Dataverse preflight](#product-preflight), in **Select environments** choose the target **Region**, verify environment IDs/names, select approved environments and choose **Save**. Use valid wizard choices; no undocumented cross-region combination is assumed.[1]
:::

:::flow
1. **成功判据 || Success Criteria** — 重新打开计划，确认订阅、资源组、产品及环境成员均已保存。到 Azure portal 的相同订阅／资源组打开 **View hidden types**，应看到与计划同名的 Power Platform account 资源。这是配置核验，不是费用已经上报的证据。[1][11] || Reopen the plan and confirm saved subscription, group, products, and environment membership. In the same Azure subscription/group, enable **View hidden types** to find the same-named Power Platform account resource. This verifies configuration, not that usage has been reported.[1][11]
:::

:::flow
1. **缺权或不可见 || Missing Permission or Visibility** — 环境不在列表：核对当前租户、Region、Production／Sandbox 类型、受支持区域、计划归属和环境管理权限。保存失败：保留错误信息，交平台与 Azure 管理员分别核对各自范围；不要反复新建计划。Azure 资源不见时先检查隐藏类型筛选与选中的订阅／资源组。[1][2][3] || For a missing environment, check tenant, Region, Production/Sandbox type, supported geography, plan ownership, and admin rights. For a failed save, retain the error and have platform/Azure admins check their respective scopes; do not repeatedly create plans. For a missing account resource, check hidden types and the selected subscription/group.[1][2][3]
:::

:::flow
1. **交接记录 || Handoff Record** — 记录计划名称／ID、Azure 资源 ID、环境 ID、所选产品、执行人与生效时间；由平台管理员和财务负责人各保留一份。这是便于后续对账的建议记录，不是官方额外许可条件。 || Record plan name/ID, Azure resource ID, environment IDs, selected products, executor, and effective time. Share the record with platform and financial owners. This is a recommended reconciliation record, not an additional Microsoft licensing condition.
:::

## #products 05 / Step 5 · Product Checks :: 保存后核验计费选择和产品使用权限 || After Saving, Verify Billing Selection and Product Access

只有计划中选择的产品启用按量计费；FAQ 另说明 Dataverse 默认开启。计划不授予应用、数据或代理访问权，也不提高请求权益。下列许可条件须先用于保存前预检；保存后的动作只核验配置／访问。[3][4][16][17] || Only selected products are enabled for PAYG; the FAQ separately says Dataverse is on by default. A plan does not grant app, data or agent access or raise request entitlements. Use the licensing conditions below during pre-save review; the later actions verify saved configuration/access.[3][4][16][17]

:::flow
1. **前提 || Prerequisites** — 下方配置与访问核验需结合已保存的计划、对应产品负责人及预检记录进行；而产品、许可与容量预检本身无需已保存计划，但必须在点击 Save 或 Connect subscription 前完成。[3][4] || The configuration and access checks below use the saved plan, the relevant product owners, and the completed preflight record; the product, license, and capacity preflight itself requires no saved plan and must be completed before Save or Connect subscription.[3][4]
:::

:::flow
1. **执行人与权限范围 || Executor and Permission Scope** — 平台管理员按官方计划编辑范围核对产品；产品负责人只处理其有权编辑／共享的应用或流程。Dataverse 数据权限在具体环境内另授；例如为 canvas app 用户分配 Dataverse 角色需要该数据库的 System Administrator。Azure 角色不代替这些 scope。[1][16][17] || The platform admin checks products within their documented plan-editing scope. Product owners act only on apps/flows they can edit/share. Dataverse access is granted per environment; assigning Dataverse roles for canvas-app users requires System Administrator for that database. Azure roles do not replace these scopes.[1][16][17]
:::

:::flow
1. **操作与位置 || Action and Location** — 按预检记录重新打开计划，核验 **Power Platform products**。只查适用的已保存配置／访问：Power Apps 应用 Settings 计费开关；Power Automate 流程类型／许可与预检清单的一致性；Copilot Studio 作者访问和目标环境。不运行应用、流程或代理试收费。[1][4][14][19] || Using the preflight record, reopen the plan and verify **Power Platform products**. Check the relevant saved configuration/access: Power Apps billing toggle in app Settings; Power Automate flow type/licensing against the reviewed inventory; Copilot Studio author access and target environment. Do not run an app, flow or agent as a billing test.[1][4][14][19]
:::

:::flow
1. **成功判据与缺权排障 || Success and Missing-Permission Recovery** — 所选产品、默认 Dataverse 影响和用户访问前提均已由对应负责人确认。能看到计划却打不开应用时，查应用共享、数据角色或作者访问，而不是增加 Azure Owner；找不到产品项时，复核当前产品文档、预览状态和本租户实际入口，不假设每个租户界面一致。[1][3][4][16][17][19] || Product owners confirm selected meters, default Dataverse impact, and user-access prerequisites. If the plan is visible but an app is inaccessible, check sharing, data roles, or author access rather than adding Azure Owner. For a missing product choice, verify current documentation, preview status, and tenant UI instead of assuming universal availability.[1][3][4][16][17][19]
:::

:::flow
1. **缺权时联系哪一方 || Who Resolves Missing Access** — 计费选择交计划维护人；应用编辑／共享交应用所有者；Dataverse 角色交该环境管理员；Copilot Studio 作者设置交下列有权访问 Tenant settings 的管理员。不要因为开通费用而给最终用户管理员权限。[1][16][17][19] || Route billing changes to the plan maintainer, app editing/sharing to its owner, Dataverse roles to its environment administrator, and Copilot Studio author settings to the Tenant settings administrators identified below. End users do not need admin roles merely because billing is enabled.[1][16][17][19]
:::

:::flow
1. **仅在选择 Power Apps 时执行 || If Power Apps Is Selected** — 前提是环境计费已关联且应用负责人可编辑该应用；canvas app 的 Co-Owner 可编辑／共享。由具备官方计费权限的管理员与应用负责人在 Apps > 应用 > Settings 核对 PAYG 开关；环境开通默认影响所有应用，单个应用可以退出。[1][17] || Prerequisites: the environment is linked and the app owner has edit access; a canvas-app Co-Owner can edit/share. The billing-authorized admin and app owner check PAYG in Apps > app > Settings. Environment enablement affects all apps by default, with per-app opt-out available.[1][17]
:::

:::flow
1. **许可与成功判据 || Licensing and Success Criteria** — 开关及共享／数据权限符合审批才算完成。退出 PAYG 的应用需要用户许可；环境中的 per-app app passes 不会继续消耗，不能假设同环境混用。已有 per-user 许可，或具备 Microsoft 365 权益且只用标准连接器的用户，按官方条件不计入 Power Apps 计量。[1][3][4][17] || Completion requires the approved toggle state plus sharing/data access. Opted-out apps need user licenses. Per-app passes are not consumed in a PAYG environment; do not assume mixed pass usage there. Per-user licenses, or Microsoft 365 entitlements with standard connectors only, are excluded under the documented conditions.[1][3][4][17]
:::

:::flow
1. **仅在选择 Power Automate 时执行 || If Power Automate Is Selected** — 官方当前仍把 flow-run meters 标为 preview（预览，功能和条款可能变化）。平台管理员核对计划中的产品选择；流程负责人提供自动／定时／即时、云端／桌面及 attended／unattended 类型。本文不增加官方未说明的逐流程启用按钮。[4] || Current flow-run meters are still labeled preview, with potentially changing features and terms. The platform admin checks the selected product; the flow owner supplies automated/scheduled/instant, cloud/desktop, and attended/unattended classifications. This guide does not invent an undocumented per-flow enablement button.[4]
:::

:::flow
1. **许可与成功判据 || Licensing and Success Criteria** — 复核保存前已确认的许可条件：标准连接器流程不计费；独立用户许可仅在权益内豁免。PAYG 环境不消耗 Process 许可及 unattended RPA add-on；依赖 Process 的流程留在非 PAYG 环境。保存后只对照预检结论核验配置，不运行流程试收费。[3][4] || Reconcile the licensing conditions reviewed before saving: standard-connector flows are not charged; standalone user exclusions depend on entitlements. PAYG does not consume Process licenses or unattended RPA add-ons; keep Process-dependent flows outside PAYG. Compare saved configuration with the preflight, without running a flow to test charges.[3][4]
:::

:::flow
1. **仅在选择 Copilot Studio 时执行 || If Copilot Studio Is Selected** — 本分支的作者访问条件依据 standard harness 代理文档；其他运行机制及 Microsoft 365 Copilot Chat 须另行核对。当前计费单位为 **Copilot Credits**，而非旧版 messages。环境须关联含 Copilot Studio 的计费计划，且作者还需具备适用的访问配置（例如加入 Copilot Studio authors 安全组或持有作者许可）；仅持有 trial 许可无法发布代理。[4][14] || This branch follows the standard-harness maker-access guidance; verify other runtimes and Microsoft 365 Copilot Chat separately. The current billing unit is **Copilot Credits** rather than legacy messages. The environment must be linked to a plan containing Copilot Studio, and makers also need an applicable access configuration, such as the Copilot Studio authors security group or a maker license; trial-only makers cannot publish agents.[4][14]
:::

:::flow
1. **执行人、范围与成功判据 || Executor, Scope, and Success Criteria** — 在 PPAC **Manage > Tenant settings**，官方列出的 Power Platform Administrator 或 Dynamics 365 Administrator 可访问租户设置，核对 **Copilot Studio authors** 及 **Copilot Studio pay-as-you-go users**。复用已批准的安全组，确认目标作者与环境；不要把计划创建成功当成作者已获访问权。[14][19] || In PPAC **Manage > Tenant settings**, the documented Power Platform Administrator or Dynamics 365 Administrator can access tenant settings to review **Copilot Studio authors** and **Copilot Studio pay-as-you-go users**. Reuse approved groups and confirm makers/environment. Plan creation alone does not establish maker access.[14][19]
:::

:::accordion
::panel
### 可选细节：Dataverse 容量与请求计量 || Optional Detail: Dataverse Capacity and Request Metering
把存储分配和 API 请求额度分开核对；连接 Azure 不代表请求无限制。[3][4] || Check storage allocation separately from API request entitlements; linking Azure does not make requests unlimited.[3][4]

1. **Dataverse** — 当前文档允许预分配容量；超分配部分计入 Azure。PAYG 环境含首 1 GB 数据库和 1 GB 文件容量；开启审计后产生的日志存储会计费。不要沿用「租户容量绝不能分配到 PAYG 环境」的旧口径。[3][4] || Current documentation permits capacity allocation, with overages billed to Azure. PAYG includes the first 1 GB of database and 1 GB of file storage. Audit-log storage is billable when auditing is enabled. Do not reuse the older blanket claim that tenant capacity can never be allocated to PAYG.[3][4]

1. **Power Platform requests || Power Platform Requests** — 当前请求计量尚未可用，不收费；连接 Azure 不提高用户／流程请求权益。连接器、并发和 Dataverse 服务保护限制仍适用。不要把报表中有请求数量理解成已经收费。[3][4] || The request meter is currently unavailable and not billed. Linking Azure does not increase user/flow request entitlements. Connector, concurrency, and Dataverse service-protection limits still apply. Reported request quantities are not proof of charges.[3][4]

::panel
### 可选细节：已有许可与 Copilot 文档边界 || Optional Detail: Existing Licenses and Copilot Scope
产品许可要按实际使用方式核对；预付容量、作者访问和按量计费不能互相代替。[4][14][15] || Validate licensing for the actual usage pattern; prepaid capacity, maker access, and PAYG billing are not interchangeable.[4][14][15]

1. **Power Automate 计量主体 || Power Automate Licensing Identity** — 自动／定时流程按所有者权益判断，即时或 Power Apps 触发流程按运行用户判断；应用上下文内的流程另有官方规则。服务主体、无人值守和 Process 场景不能套用普通用户豁免。只把已核实的场景写入费用审批。[3][4] || Automated/scheduled flows use the owner's entitlements; instant/Power Apps-triggered flows use the runner's entitlements. In-app flows have separate rules. Do not apply ordinary user exclusions indiscriminately to service principals, unattended runs, or Process scenarios. Approve only the verified usage pattern.[3][4]

1. **Copilot 作者访问 || Copilot Maker Access** — 若选择分配作者许可的路径，由具备许可管理权限的租户管理员在 Microsoft 365 admin center > Users > Active users > Manage product licenses 中分配；该文档未在此列出唯一的最小权限管理员角色。启用 PAYG 并不一律要求先购买预付容量包；当前 billing-licensing 页面已限定为 standard harness 代理，其他运行机制与 Microsoft 365 Copilot Chat 需另行核对。[14][15] || If using the maker-license route, a tenant administrator authorized to manage licenses assigns them in Microsoft 365 admin center > Users > Active users > Manage product licenses; that page does not specify a unique least-privileged admin role. PAYG does not universally require purchasing a prepaid pack first; the current billing-licensing page is scoped to standard-harness agents, so verify other runtimes and Microsoft 365 Copilot Chat separately.[14][15]
:::

## #verify 06 / Step 6 · Configuration Verification :: 先验收配置，不用未批准的消费证明开通 || Accept Configuration without Unapproved Test Spending

「计划和关联已保存」与「业务用量已上报」是两个验收阶段。后者需要实际用量且可能收费；本指南没有登录租户、创建资源、调用模型或执行收费测试。[1][4][11] || Saved configuration and reported business usage are different acceptance stages. The latter requires real usage and may incur charges. This guide did not sign into a tenant, create resources, call a model, or run a chargeable test.[1][4][11]

:::flow
1. **前提 || Prerequisites** — 计划保存完成，产品分支前提已确认，交接记录含计划／环境／Azure 资源 ID。尚未批准正式使用时，不为核验而打开应用、触发流程或与代理对话。[1][4] || Have the saved plan, confirmed product prerequisites, and plan/environment/Azure resource IDs. Without approval for business use, do not launch an app, trigger a flow, or chat with an agent merely to verify billing.[1][4]
:::

:::flow
1. **执行人与权限范围 || Executor and Permission Scope** — 平台维护人按计划编辑／环境范围核对 PPAC；Azure 核验人可用目标订阅或资源组范围的 Reader 查看资源，无需为查看申请 Owner。若要读 PPAC 用量报表，使用有权管理该计划的管理员；用量页未声明独立的最小只读角色，不能推断 Azure Reader 自动有该权限。[1][6][8][11] || The plan maintainer reviews PPAC within their plan/environment scope. An Azure reviewer can inspect resources with Reader at the target subscription or group; Owner is unnecessary for viewing. Use a plan-authorized admin for PPAC usage reports: the usage page gives no separate minimum report-reader role, and Azure Reader does not imply PPAC access.[1][6][8][11]
:::

:::flow
1. **操作与位置 || Action and Location** — 在 PPAC 重新打开计划核对产品和环境成员；在 Azure 相同资源组启用 View hidden types，核对同名 account 资源及 ID；把它们与审批订阅、环境 ID 对照。避免依赖未记录在官方文档中的特定「已激活」状态文案。[1][2] || Reopen the PPAC plan to check products and environment membership. Enable View hidden types in the Azure group and check the same-named account and its ID. Reconcile against approved subscription/environment IDs. Do not depend on an undocumented exact activation-status label.[1][2]
:::

:::flow
1. **成功判据 || Success Criteria** — 计划、环境成员和 Azure 资源三处相互对应，产品范围与默认 Dataverse 影响已确认，财务知道账单应归集到哪个资源。记录为「配置核验完成；用量对账待正式业务发生后复核」，不要写成收费链路已经实测。[1][4][11] || The plan, environment membership, and Azure resource correspond; selected products and default Dataverse impact are understood; finance knows the billing resource. Record configuration accepted and usage reconciliation pending approved business activity, not an end-to-end billing test.[1][4][11]
:::

:::flow
1. **缺权或结果不一致 || Missing Access or Inconsistent Results** — PPAC 与 Azure 结果不一致时，先查账号／目录、资源组、隐藏类型和计划归属；把错误交给对应管理员。没有 Azure 费用记录不等于配置失败，也不能证明后续不会收费。[1][11] || For inconsistent PPAC/Azure results, check identity/directory, group, hidden types, and plan ownership, then route the error to the responsible administrator. No Azure charge yet is neither configuration failure nor proof of future zero cost.[1][11]
:::

## #costs 07 / Step 7 · Cost Handoff :: 给财务可见性和告警，不把预算当停机开关 || Provide Cost Visibility and Alerts, Not a Spending Cutoff

正式业务获批后才核对用量；配置验收不需要制造消费。Azure Cost Management 用于归集成本，PPAC 报表用于下钻到环境、应用／代理和调用方，两者权限不同。[11][12] || Reconcile usage only after approved business activity; configuration acceptance does not require generating consumption. Azure Cost Management consolidates costs, while PPAC reports drill down to environments, apps/agents, and callers. Their access requirements differ.[11][12]

:::flow
1. **前提 || Prerequisites** — 财务收到计划和 Azure 资源 ID、费用批准范围、告警收件人及复核安排。记录订阅合约是 EA、MCA 或 CSP 等，便于排查成本查看政策；这些分类不是本文对 PAYG 产品资格的承诺。[11][12] || Finance has plan/resource IDs, approved spending scope, alert recipients, and a review schedule. Record the EA, MCA, CSP, or other agreement for cost-visibility troubleshooting, not as this guide's promise of product-offer eligibility.[11][12]
:::

:::flow
1. **执行人与权限范围 || Executor and Permission Scope** — 成本查看人可获目标订阅或资源组范围的 **Cost Management Reader**。本流程以订阅预算并筛选 account 资源为例：预算维护人在该订阅范围使用 **Cost Management Contributor** 或 Contributor；官方允许创建／修改／删除本人预算，Reader 只可读其有权预算。分配角色仍需独立授权人。[7][12][13] || Use **Cost Management Reader** at the approved subscription or group scope for cost viewing. For the subscription budget filtered to the account resource used here, the maintainer needs **Cost Management Contributor** or Contributor at that subscription scope. They can create/manage their own budgets; Reader can only view authorized budgets. Role assignment still requires separate delegation authority.[7][12][13]
:::

:::flow
1. **操作与位置 || Action and Location** — 在 Azure portal 打开目标订阅的 Cost Management／Cost analysis，按与计划同名的 **Power Platform account** 资源筛选，再按 meter 查看。到该范围的 **Budgets > Add**，确认范围和资源筛选、周期、获批金额、阈值及收件人后保存；金额由客户批准，本文不提供样例价格。[11][13] || In Azure portal, open the target subscription's Cost Management/Cost analysis and filter by the plan's **Power Platform account** resource, then meter. In that scope use **Budgets > Add**, verify scope/resource filter, period, approved amount, thresholds, and recipients, then save. The customer approves amounts; this guide supplies no sample rates.[11][13]
:::

:::flow
1. **成功判据 || Success Criteria** — 成本查看人可以打开批准范围；预算维护人能看到已保存的筛选、周期和告警收件人。实际用量发生后，PPAC 管理员再下载计划的用量报表，按计划／环境／资源 ID、时间和 Status 对账；报表中有数量不必然表示已收费。[4][11][13] || The reader can open the approved scope, and the maintainer can inspect the saved filter, period, and recipients. After real usage, the PPAC admin downloads the plan's usage report and reconciles IDs, times, and Status. A reported quantity is not necessarily a billed quantity.[4][11][13]
:::

:::flow
1. **缺权或暂未上报 || Missing Access or Delayed Reporting** — 开通过后没有费用时，先看是否有获批实际用量、筛选是否正确。Power Platform 官方说明 Azure Cost Management 可能延迟最多 **24 hours**；新订阅的成本功能可能需要最多 **48 hours**。这些是文档说明，不是每个租户的时效保证；不要用反复收费测试催报表。[11][13] || For absent charges, check approved actual usage and filters first. Power Platform documents up to **24 hours** for Azure Cost Management visibility; a new subscription can need up to **48 hours** for cost features. These are documented windows, not a tenant-specific guarantee. Do not generate repeated chargeable tests to force reporting.[11][13]
:::

:::flow
1. **预算不会停止消费 || A Budget Does Not Stop Consumption** — 预算触发告警，不是硬性消费上限；官方说明消费不会自动停止。成本通常延迟上报，预算每天评估一次，通知也有延迟。达到阈值后由责任人按已批准的停用流程处理，不能把保存预算当作免超支保证。[13] || A budget triggers alerts, not a hard spending cap; consumption is not automatically stopped. Cost reporting and notifications have lag, and budgets are evaluated daily. The accountable owner must apply an approved response or disabling procedure; a saved budget cannot guarantee no overrun.[13]
:::

:::accordion
::panel
### 成本看不到时：检查合约政策，不扩大资源权限 || If Costs Are Hidden: Check Agreement Policies before Expanding Access
能管理 Azure 资源不代表合约允许你看费用，预算读取也不代表可以维护预算。[12][13] || Resource management does not guarantee agreement-level cost visibility; viewing a budget does not grant budget maintenance.[12][13]

1. **EA** — 由 Enterprise Administrator 核对 AO view charges；部门范围另有 DA view charges。订阅／资源组仍需相应 Cost Management 角色。[12] || An Enterprise Administrator checks AO view charges; department scope has DA view charges. Subscription/group access still needs the applicable Cost Management role.[12]

1. **MCA** — 由 Billing Profile Owner 在计费配置文件 Policies 核对 Azure charges = Yes；该计费角色与 Azure Owner 不同。[12] || A Billing Profile Owner checks Azure charges = Yes in billing-profile Policies. This billing role differs from Azure Owner.[12]

1. **CSP** — 由 CSP 合作伙伴确认已为客户启用 Cost Management 可见性；不把合作伙伴价格或费用显示政策推断成计量资格。[12] || The CSP partner confirms customer Cost Management visibility is enabled; partner pricing/display policies do not establish meter eligibility.[12]

1. **可看成本但不能建预算 || Can Read Costs but Not Create a Budget** — 核对预算所选范围和维护权限。订阅范围 Reader 不能创建预算；不要为了预算直接授予 Owner。若只获批资源组范围，按官方教程在该资源组建立预算。[12][13] || Check selected budget scope and maintenance access. Subscription Reader cannot create a budget; Owner is not the default remedy. If only a group scope is approved, follow the tutorial to create the budget there.[12][13]
:::

## #disable 08 / Follow-Up · Change or Disable :: 停用前安排替代许可，并保留已发生费用 || Arrange Replacement Licensing and Retain Incurred Charges

本步骤仅在需要变更或退出 PAYG 时执行，不是首次开通的必做动作。删除计划会影响该计划的环境；先核对成员与应用／流程依赖，再执行受控变更。[1][2] || This conditional follow-up is for changing or leaving PAYG, not a required setup action. Deleting a plan affects its linked environments. Review membership and app/flow dependencies before an approved change.[1][2]

:::flow
1. **前提 || Prerequisites** — 明确停用单个环境还是整个计划，安排所需替代许可／容量及业务通知，保存用量和成本记录并取得费用负责人批准。不能假设退出 PAYG 后原来依靠它的用户仍可正常访问。[1][2][3] || Decide whether to remove one environment or retire the whole plan. Arrange replacement licensing/capacity, notify affected users, retain usage/cost records, and obtain financial approval. Do not assume users relying on PAYG retain access after it is disabled.[1][2][3]
:::

:::flow
1. **执行人与权限范围 || Executor and Permission Scope** — 平台维护人按官方编辑矩阵操作：Environment admin 只处理本人创建的计划及本人管理的环境；租户级角色按矩阵范围处理。清理残留 Azure account 资源是另一项操作，需要该资源／资源组范围的删除权限，例如 Contributor；不因删除计划自动获得该权限。[1][6] || Use the documented platform editing scope: Environment admin is limited to their own plans/administered environments; tenant roles follow the matrix. Deleting a residual Azure account is a separate operation requiring deletion rights at its resource/group scope, such as Contributor; plan deletion does not grant those rights.[1][6]
:::

:::flow
1. **操作与位置 || Action and Location** — 在 PPAC 的 Pay-as-you-go plans 中编辑计划并移除目标环境，或在核对全部成员后删除整个计划。官方停用段仍使用 **Billing policies** 旧称。只迁移归属时，按官方「同一环境一次一个计划」规则变更，不同时挂到两个计划。[1][2] || In PPAC Pay-as-you-go plans, edit the plan and remove the target environment, or delete the entire plan after reviewing all members. The official disabling section still says **Billing policies**. For reassignment, follow the one-plan-per-environment rule rather than attaching two plans simultaneously.[1][2]
:::

:::flow
1. **成功判据 || Success Criteria** — 重新打开计划／环境确认关联已移除，记录生效时间；环境恢复常规计费方式，检查替代许可安排。官方说明停用后的新增用量不再计入该 Azure PAYG 关联，但已发生用量仍会向 Azure 订阅收费，可能延迟显示。[1][2][11] || Reopen the plan/environment to verify unlinking and record its effective time. The environment returns to regular billing behavior; confirm replacement licensing. The documented action stops new usage billing through that PAYG link, but incurred usage remains chargeable and can appear later.[1][2][11]
:::

:::flow
1. **权限或清理问题 || Access or Cleanup Problems** — 无权编辑时，联系计划创建人或矩阵中有权的租户管理员。删除 PPAC 计划不会自动删除 Azure Power Platform account；若组织决定清理，由有权的 Azure 管理员另在 Azure portal 操作。不要把直接删 Azure 资源当作官方环境解绑步骤。[1][6] || If editing is denied, contact the creator or an authorized tenant admin from the matrix. Deleting the PPAC plan does not automatically delete the Azure Power Platform account. An authorized Azure administrator can clean it up separately if approved. Direct Azure deletion is not the documented environment-unlinking procedure.[1][6]
:::

:::flow
1. **保留费用责任 || Retain Financial Accountability** — 解绑、删除计划或清理 Azure 资源，都不会消除已经发生的费用。请继续按计费周期核对最后一批用量与成本；预算仍是告警机制，不会替代停用操作，也不会自动撤销费用。[1][11][13] || Unlinking, deleting a plan, or cleaning up the Azure resource does not erase incurred charges. Continue reconciling the final usage and cost records through the billing cycle; budgets remain an alerting mechanism and neither replace disabling nor reverse charges automatically.[1][11][13]
:::

## #references 09 / References :: 参考来源 || References

以下页面于 2026-11-11 UTC 直接获取并核对完整正文。页面更新日期不等于功能上线日期，也不证明某租户已可用；界面名称可能因文档记录的体验而不同。未进行真实管理中心操作或生产验证。 || Complete official page bodies were retrieved directly and reviewed on November 11, 2026 UTC. A page-update date is not a rollout date or tenant-availability proof. UI labels can differ between documented experiences. No live admin-center setup or production validation was performed.

- [1] Microsoft — https://learn.microsoft.com/en-us/power-platform/admin/pay-as-you-go-set-up | 支撑当前 PPAC／Power Apps 入口、权限矩阵、保存和停用。 页面显示更新：2025-12-16。 || Supports current PPAC/Power Apps routes, role matrix, saving, and disabling. Displayed page update: 2025-12-16.
- [2] Microsoft — https://learn.microsoft.com/en-us/power-platform/admin/pay-as-you-go-overview | 支撑计费计划、account 资源和单一环境只能关联一个计划。 页面显示更新：2025-09-18。 || Defines billing plans, account resources, and one plan per environment. Displayed page update: 2025-09-18.
