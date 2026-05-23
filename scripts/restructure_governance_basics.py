#!/usr/bin/env python3
"""One-shot restructure for power-platform-governance:

1. Remove "A · Three-Layer Containers" details block from Task 8 references.
2. Remove "Access Practice" details block from Task 11 references and drop the
   now-empty task-references wrapper.
3. Insert a new chapter §01 "Foundations · Containers & Roles" before the
   existing #lifecycle section.
4. Renumber the existing top-level chapters: 01 Lifecycle → 02, 02 Licensing →
   03, 03 Design → 04 (incl. 03.1–03.6 → 04.1–04.6), 04 Playbook → 05,
   05 References → 06.
5. Update topbar nav and lc-anchor cross-references.

The script is idempotent-by-marker: it bails out cleanly if it cannot find an
expected marker exactly once.
"""
from __future__ import annotations
import re
import sys
from pathlib import Path

FILE = Path("posts/power-platform-governance/index.html")


def must_replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        sys.exit(f"[restructure] expected exactly one match for {label!r}, found {count}")
    return text.replace(old, new, 1)


def drop_block(text: str, start_marker: str, end_marker: str, label: str) -> str:
    si = text.find(start_marker)
    if si < 0:
        sys.exit(f"[restructure] cannot find start marker for {label!r}")
    ei = text.find(end_marker, si)
    if ei < 0:
        sys.exit(f"[restructure] cannot find end marker for {label!r}")
    ei_end = ei + len(end_marker)
    # consume trailing newline if present
    while ei_end < len(text) and text[ei_end] in "\n":
        ei_end += 1
    return text[:si] + text[ei_end:]


NEW_CHAPTER = """        <!-- ══ 01 / Foundations · Containers & Roles ══ -->
        <section id="basics" class="section" data-reveal>
          <div class="section-head">
            <p class="section-kicker" data-zh="01 / 基础概念" data-en="01 / Foundations">01 / Foundations</p>
            <h2 data-zh="容器层级与角色对应 — 谁在哪里管什么" data-en="Container Hierarchy & Role Mapping — Who Manages What, Where">Container Hierarchy &amp; Role Mapping &mdash; Who Manages What, Where</h2>
            <p data-zh="后续所有许可、环境拓扑、DLP 与签核决策都建立在同一个三层容器模型之上。每一层有自己的边界与配置入口，对应的角色也只在该层生效 &mdash; 跨层授权既不会发生，也不能省略。" data-en="Every licensing, environment, DLP, and approval decision later in this article sits on the same three-layer container model. Each layer has its own boundary and admin surface, and the matching roles only take effect at that layer &mdash; cross-layer authority neither cascades automatically nor can it be skipped.">Every licensing, environment, DLP, and approval decision later in this article sits on the same three-layer container model. Each layer has its own boundary and admin surface, and the matching roles only take effect at that layer &mdash; cross-layer authority neither cascades automatically nor can it be skipped.</p>
          </div>

          <div class="hierarchy-stack" data-present-step data-step-label="01 / Foundations" data-step-title="Three Containers and the Roles That Govern Them">
            <div class="hierarchy-tier tier-tenant">
              <h3 data-zh="1. 租户 <span class='tier-sub'>&mdash; Microsoft Entra ID 身份边界</span>" data-en="1. Tenant <span class='tier-sub'>&mdash; the Microsoft Entra ID identity boundary</span>">1. Tenant <span class="tier-sub">&mdash; the Microsoft Entra ID identity boundary</span></h3>
              <p data-zh="组织的身份边界。一个租户 = 一个组织。所有 Power Platform 资源都驻留在租户内，跨环境治理动作（创建环境、租户 DLP、容量配额、Managed Environments 启用）都在这一层完成。" data-en="The organization&#39;s identity perimeter. One tenant = one organization. All Power Platform resources live inside it, and every cross-environment governance action (create environment, tenant DLP, capacity quotas, Managed Environments enrolment) happens at this layer.">The organization's identity perimeter. One tenant = one organization. All Power Platform resources live inside it, and every cross-environment governance action (create environment, tenant DLP, capacity quotas, Managed Environments enrolment) happens at this layer.</p>
              <div class="concept-grid is-5-tiles" style="margin-top:18px">
                <article class="concept-card">
                  <span class="concept-tag tag-admin" data-zh="入口 · Microsoft Entra 管理中心" data-en="Surface · Microsoft Entra admin center">Surface &middot; Microsoft Entra admin center</span>
                  <h3>Global Administrator</h3>
                  <p data-zh="租户全局最高权限。仅作为应急账号（2&ndash;4 名指定拥有者 + MFA + PIM 即时提权），不应作为日常 Power Platform 运营角色。" data-en="Tenant-wide superuser. Reserve for break-glass use only (2&ndash;4 named owners + MFA + PIM just-in-time elevation); not a daily Power Platform operations role.">Tenant-wide superuser. Reserve for break-glass use only (2&ndash;4 named owners + MFA + PIM just-in-time elevation); not a daily Power Platform operations role.</p>
                </article>
                <article class="concept-card">
                  <span class="concept-tag tag-admin" data-zh="入口 · Microsoft Entra 管理中心" data-en="Surface · Microsoft Entra admin center">Surface &middot; Microsoft Entra admin center</span>
                  <h3>Power Platform Administrator</h3>
                  <p data-zh="日常平台运营角色。可在 Power Platform 管理中心管理所有环境、租户 DLP 策略、容量分配与 Managed Environments；不含 M365 用户/许可管理。" data-en="The day-to-day platform operations role. Manages every environment, tenant DLP policies, capacity allocation, and Managed Environments from the Power Platform admin center; does not cover M365 user or license management.">The day-to-day platform operations role. Manages every environment, tenant DLP policies, capacity allocation, and Managed Environments from the Power Platform admin center; does not cover M365 user or license management.</p>
                </article>
                <article class="concept-card">
                  <span class="concept-tag tag-admin" data-zh="入口 · Microsoft Entra 管理中心" data-en="Surface · Microsoft Entra admin center">Surface &middot; Microsoft Entra admin center</span>
                  <h3>Dynamics 365 Administrator</h3>
                  <p data-zh="作用域与 Power Platform Administrator 等同，保留给 D365 优先组织或历史授权。新部署优先使用 Power Platform Administrator。" data-en="Identical scope to Power Platform Administrator; retained for D365-first orgs and legacy assignments. Prefer Power Platform Administrator for new deployments.">Identical scope to Power Platform Administrator; retained for D365-first orgs and legacy assignments. Prefer Power Platform Administrator for new deployments.</p>
                </article>
                <article class="concept-card">
                  <span class="concept-tag tag-billing" data-zh="入口 · Microsoft 365 管理中心" data-en="Surface · Microsoft 365 admin center">Surface &middot; Microsoft 365 admin center</span>
                  <h3>License Administrator</h3>
                  <p data-zh="只负责许可：分配、移除、重新分配 Power Apps / Power Automate / Copilot Studio 等席位。不能创建环境、不能改 DLP。" data-en="License-only role: assign, remove, and reassign Power Apps / Power Automate / Copilot Studio seats. Cannot create environments or change DLP.">License-only role: assign, remove, and reassign Power Apps / Power Automate / Copilot Studio seats. Cannot create environments or change DLP.</p>
                </article>
                <article class="concept-card">
                  <span class="concept-tag tag-billing" data-zh="入口 · Microsoft 365 管理中心" data-en="Surface · Microsoft 365 admin center">Surface &middot; Microsoft 365 admin center</span>
                  <h3>User Administrator</h3>
                  <p data-zh="负责用户与安全组：创建/禁用账号、重置密码、维护用于环境与 Dataverse 角色分配的安全组。不涉及许可与环境配置。" data-en="Owns users and security groups: create/disable accounts, reset passwords, maintain the security groups used to assign environment and Dataverse roles. No license or environment authority.">Owns users and security groups: create/disable accounts, reset passwords, maintain the security groups used to assign environment and Dataverse roles. No license or environment authority.</p>
                </article>
              </div>
            </div>
            <div class="hierarchy-arrow">&#9660;</div>
            <div class="hierarchy-tier tier-env">
              <h3 data-zh="2. 环境 <span class='tier-sub'>&mdash; 隔离与治理边界</span>" data-en="2. Environment <span class='tier-sub'>&mdash; the isolation &amp; governance boundary</span>">2. Environment <span class="tier-sub">&mdash; the isolation &amp; governance boundary</span></h3>
              <p data-zh="区域型容器，承载应用、流、自定义连接器、网关，以及可选的 Dataverse 数据库。资源不会跨环境读取；DLP 策略、容量与访问角色都在单个环境内生效。" data-en="A regional container holding apps, flows, custom connectors, gateways, and optionally a Dataverse database. Resources never leak across environments; DLP policies, capacity, and access roles are scoped here.">A regional container holding apps, flows, custom connectors, gateways, and optionally a Dataverse database. Resources never leak across environments; DLP policies, capacity, and access roles are scoped here.</p>
              <div class="concept-grid" style="margin-top:18px">
                <article class="concept-card">
                  <span class="concept-tag tag-infra" data-zh="入口 · Power Platform 管理中心" data-en="Surface · Power Platform admin center">Surface &middot; Power Platform admin center</span>
                  <h3>Environment Admin</h3>
                  <p data-zh="单个环境的最高权限：管理环境设置、分配环境角色、批准 DLP 例外、回收环境资源。<strong>不</strong>自动获得环境内 Dataverse 表的数据访问。" data-en="Full control of one environment: manage settings, assign environment roles, approve DLP exceptions, reclaim resources. Does <strong>not</strong> automatically grant data access in Dataverse tables.">Full control of one environment: manage settings, assign environment roles, approve DLP exceptions, reclaim resources. Does <strong>not</strong> automatically grant data access in Dataverse tables.</p>
                </article>
                <article class="concept-card">
                  <span class="concept-tag tag-infra" data-zh="入口 · Power Platform 管理中心 / Maker Portal" data-en="Surface · Power Platform admin center / Maker portal">Surface &middot; Power Platform admin center / Maker portal</span>
                  <h3>Environment Maker</h3>
                  <p data-zh="制作者角色：在环境内创建应用、流、自定义连接器与解决方案。不能管理环境、不能授权他人，也不自动获得 Dataverse 数据访问。" data-en="Builder role: create apps, flows, custom connectors, and solutions inside the environment. Cannot administer the environment, grant roles, or access Dataverse data automatically.">Builder role: create apps, flows, custom connectors, and solutions inside the environment. Cannot administer the environment, grant roles, or access Dataverse data automatically.</p>
                </article>
              </div>
            </div>
            <div class="hierarchy-arrow">&#9660;</div>
            <div class="hierarchy-tier tier-dataverse">
              <h3 data-zh="3. Dataverse <span class='tier-sub'>&mdash; 环境内的数据存储</span>" data-en="3. Dataverse <span class='tier-sub'>&mdash; the in-environment data store</span>">3. Dataverse <span class="tier-sub">&mdash; the in-environment data store</span></h3>
              <p data-zh="环境创建时决定是否启用的云关系型数据库。一旦启用，就在环境访问之上叠加一层独立的安全角色（表 + 列 + 记录级别）；没有 Dataverse 角色就读不到表数据。" data-en="An optional cloud relational database decided at environment creation time. When present, it layers its own security roles (table + column + record level) on top of environment access &mdash; without a Dataverse role, table data is unreadable.">An optional cloud relational database decided at environment creation time. When present, it layers its own security roles (table + column + record level) on top of environment access &mdash; without a Dataverse role, table data is unreadable.</p>
              <div class="concept-grid" style="margin-top:18px">
                <article class="concept-card">
                  <span class="concept-tag tag-data" data-zh="入口 · PPAC › Environment › Users + Permissions" data-en="Surface · PPAC › Environment › Users + Permissions">Surface &middot; PPAC &rsaquo; Environment &rsaquo; Users + Permissions</span>
                  <h3>System Administrator</h3>
                  <p data-zh="环境内最高 Dataverse 权限：所有表、所有动作、组织级访问。仅用于平台运维与应急；不要分配给业务用户。" data-en="Top Dataverse privilege inside the environment: every table, every action, organization-level access. Reserve for platform operations and break-glass; never assign to business users.">Top Dataverse privilege inside the environment: every table, every action, organization-level access. Reserve for platform operations and break-glass; never assign to business users.</p>
                </article>
                <article class="concept-card">
                  <span class="concept-tag tag-data" data-zh="入口 · PPAC › Environment › Users + Permissions" data-en="Surface · PPAC › Environment › Users + Permissions">Surface &middot; PPAC &rsaquo; Environment &rsaquo; Users + Permissions</span>
                  <h3>Basic User</h3>
                  <p data-zh="最低基础角色：登录环境、读取自己创建或被共享的记录。其他业务自定义角色通常基于 Basic User 叠加。" data-en="Minimum baseline role: sign in to the environment and access records the user owns or has been shared. Most custom business roles build on top of Basic User.">Minimum baseline role: sign in to the environment and access records the user owns or has been shared. Most custom business roles build on top of Basic User.</p>
                </article>
                <article class="concept-card">
                  <span class="concept-tag tag-data" data-zh="入口 · PPAC › Environment › Users + Permissions" data-en="Surface · PPAC › Environment › Users + Permissions">Surface &middot; PPAC &rsaquo; Environment &rsaquo; Users + Permissions</span>
                  <h3>App Opener</h3>
                  <p data-zh="启动模型驱动应用所需的最小角色，仅授予打开应用 UI 的能力，不含表数据权限。需要与自定义业务角色叠加使用。" data-en="The minimum role required to launch a model-driven app; grants UI access only, not table data privileges. Pair with a custom business role for real access.">The minimum role required to launch a model-driven app; grants UI access only, not table data privileges. Pair with a custom business role for real access.</p>
                </article>
                <article class="concept-card">
                  <span class="concept-tag tag-data" data-zh="入口 · PPAC › Environment › Users + Permissions" data-en="Surface · PPAC › Environment › Users + Permissions">Surface &middot; PPAC &rsaquo; Environment &rsaquo; Users + Permissions</span>
                  <h3 data-zh="自定义安全角色" data-en="Custom Security Roles">Custom Security Roles</h3>
                  <p data-zh="按表 + 列 + 记录控制 Create / Read / Write / Delete / Append / Share / Assign 等权利，四种访问级别：User、Business Unit、Parent-Child BU、Organization。业务用户的权限基本都通过自定义角色授予。" data-en="Per-table / column / record control of Create / Read / Write / Delete / Append / Share / Assign privileges across four access levels: User, Business Unit, Parent-Child BU, Organization. Business user access is granted almost entirely through custom roles.">Per-table / column / record control of Create / Read / Write / Delete / Append / Share / Assign privileges across four access levels: User, Business Unit, Parent-Child BU, Organization. Business user access is granted almost entirely through custom roles.</p>
                </article>
              </div>
            </div>
          </div>

          <div class="insight" style="margin-top:32px">
            <p data-zh="<strong>记住三条规则：</strong>(1) 三个容器是物理边界，资源不会自动跨层；(2) 上一层的角色不会自动赋予下一层 &mdash; 给某人 <em>Environment Admin</em> 并不让他能读 Dataverse 数据；(3) 任何角色都从一个明确的管理入口分配，绕过入口的&ldquo;直接授权&rdquo;不存在。" data-en="<strong>Three rules to remember:</strong> (1) the three containers are physical boundaries &mdash; resources do not cascade; (2) a role at one layer never extends to the next &mdash; granting <em>Environment Admin</em> does not unlock Dataverse data; (3) every role is assigned from a specific admin surface &mdash; there is no &lsquo;direct grant&rsquo; that bypasses it."><strong>Three rules to remember:</strong> (1) the three containers are physical boundaries &mdash; resources do not cascade; (2) a role at one layer never extends to the next &mdash; granting <em>Environment Admin</em> does not unlock Dataverse data; (3) every role is assigned from a specific admin surface &mdash; there is no 'direct grant' that bypasses it.</p>
          </div>

          <p class="source-note" data-zh="来源：<a href='https://learn.microsoft.com/en-us/power-platform/admin/environments-overview' target='_blank' rel='noopener noreferrer'>环境概览</a>、<a href='https://learn.microsoft.com/en-us/power-platform/admin/environments-overview#environment-roles' target='_blank' rel='noopener noreferrer'>环境角色</a>、<a href='https://learn.microsoft.com/en-us/power-platform/admin/security-roles-privileges' target='_blank' rel='noopener noreferrer'>Dataverse 安全角色</a>、<a href='https://learn.microsoft.com/en-us/power-platform/admin/governance-considerations#faq---what-permissions-exist-at-a-microsoft-entra-tenant-level' target='_blank' rel='noopener noreferrer'>租户级权限</a>。" data-en="Sources: <a href='https://learn.microsoft.com/en-us/power-platform/admin/environments-overview' target='_blank' rel='noopener noreferrer'>Environments overview</a>, <a href='https://learn.microsoft.com/en-us/power-platform/admin/environments-overview#environment-roles' target='_blank' rel='noopener noreferrer'>Environment roles</a>, <a href='https://learn.microsoft.com/en-us/power-platform/admin/security-roles-privileges' target='_blank' rel='noopener noreferrer'>Dataverse security roles</a>, <a href='https://learn.microsoft.com/en-us/power-platform/admin/governance-considerations#faq---what-permissions-exist-at-a-microsoft-entra-tenant-level' target='_blank' rel='noopener noreferrer'>Tenant-level permissions</a>.">Sources: <a href="https://learn.microsoft.com/en-us/power-platform/admin/environments-overview" target="_blank" rel="noopener noreferrer">Environments overview</a>, <a href="https://learn.microsoft.com/en-us/power-platform/admin/environments-overview#environment-roles" target="_blank" rel="noopener noreferrer">Environment roles</a>, <a href="https://learn.microsoft.com/en-us/power-platform/admin/security-roles-privileges" target="_blank" rel="noopener noreferrer">Dataverse security roles</a>, <a href="https://learn.microsoft.com/en-us/power-platform/admin/governance-considerations#faq---what-permissions-exist-at-a-microsoft-entra-tenant-level" target="_blank" rel="noopener noreferrer">Tenant-level permissions</a>.</p>
        </section>

"""


def main() -> None:
    text = FILE.read_text(encoding="utf-8")
    original_len = len(text)

    # 1. Drop "A · Three-Layer Containers" details (Task 8 reference).
    text = drop_block(
        text,
        '          <!-- A. Containers -->\n          <details class="task-collapsible" data-present-step data-step-label="03 / Design &amp; Approve" data-step-title="Task 8 Reference · Three Containers">',
        '          </details>',
        'Task 8 Reference · A Three Containers',
    )

    # 2. Drop "Access Practice" details + the empty Task 11 task-references wrapper.
    #    The wrapper now contains only this one block, so remove from
    #    `<div class="task-references" data-task-refs="11">` through the wrapper close `</div>`.
    start = '          <div class="task-references" data-task-refs="11">'
    end = (
        '          <details class="task-collapsible" data-present-step '
        'data-step-label="03 / Design &amp; Approve" '
        'data-step-title="Task 11 Reference · Access Practice">'
    )
    si = text.find(start)
    if si < 0:
        sys.exit('[restructure] missing Task 11 task-references wrapper opener')
    di = text.find(end, si)
    if di < 0:
        sys.exit('[restructure] missing Access Practice opener')
    # closing of details + closing of wrapper div
    close_marker = '          </details>\n          </div>\n'
    ci = text.find(close_marker, di)
    if ci < 0:
        sys.exit('[restructure] missing close marker for Task 11 wrapper')
    end_idx = ci + len(close_marker)
    text = text[:si] + text[end_idx:]

    # 3. Insert new chapter before the existing #lifecycle section comment.
    lifecycle_marker = '        <!-- ══ 01 / End-to-End Project Process ══ -->'
    if text.count(lifecycle_marker) != 1:
        sys.exit('[restructure] expected exactly one lifecycle marker')
    text = text.replace(lifecycle_marker, NEW_CHAPTER + lifecycle_marker, 1)

    # 4a. Renumber top-level chapter comment banners.
    text = must_replace_once(
        text,
        '        <!-- ══ 01 / End-to-End Project Process ══ -->',
        '        <!-- ══ 02 / End-to-End Project Process ══ -->',
        'banner 01 Lifecycle',
    )
    text = must_replace_once(
        text,
        '        <!-- ══ 02 / Product Licensing ══ -->',
        '        <!-- ══ 03 / Product Licensing ══ -->',
        'banner 02 Licensing',
    )
    text = must_replace_once(
        text,
        '        <!-- ══ 03 / Design & Approve ══ -->',
        '        <!-- ══ 04 / Design & Approve ══ -->',
        'banner 03 Design',
    )
    text = must_replace_once(
        text,
        '        <!-- ══ 04 / Playbook ══ -->',
        '        <!-- ══ 05 / Playbook ══ -->',
        'banner 04 Playbook',
    )
    text = must_replace_once(
        text,
        '        <!-- ══ 05 / References ══ -->',
        '        <!-- ══ 06 / References ══ -->',
        'banner 05 References',
    )

    # 4b. Renumber the top-level section kickers (zh + en) — single replace each.
    kicker_renames = [
        # Lifecycle (01 → 02)
        ('data-zh="01 / 端到端项目流程" data-en="01 / End-to-End Project Process">01 / End-to-End Project Process',
         'data-zh="02 / 端到端项目流程" data-en="02 / End-to-End Project Process">02 / End-to-End Project Process'),
        # Licensing chapter overview (02 → 03)
        ('data-zh="02 / 发现与立项 · Stage 1–2" data-en="02 / Discover &amp; Qualify · Stages 1–2">02 / Discover &amp; Qualify · Stages 1–2',
         'data-zh="03 / 发现与立项 · Stage 1–2" data-en="03 / Discover &amp; Qualify · Stages 1–2">03 / Discover &amp; Qualify · Stages 1–2'),
        # Licensing sub kickers 02.1–02.6 → 03.1–03.6
        ('data-zh="02.1 · Stage 1 · 受理" data-en="02.1 · Stage 1 · Intake">02.1 · Stage 1 · Intake',
         'data-zh="03.1 · Stage 1 · 受理" data-en="03.1 · Stage 1 · Intake">03.1 · Stage 1 · Intake'),
        ('data-zh="02.2 · Stage 1 · 立项" data-en="02.2 · Stage 1 · Frame">02.2 · Stage 1 · Frame',
         'data-zh="03.2 · Stage 1 · 立项" data-en="03.2 · Stage 1 · Frame">03.2 · Stage 1 · Frame'),
        ('data-zh="02.3 · Stage 2 · 适配" data-en="02.3 · Stage 2 · Fit">02.3 · Stage 2 · Fit',
         'data-zh="03.3 · Stage 2 · 适配" data-en="03.3 · Stage 2 · Fit">03.3 · Stage 2 · Fit'),
        ('data-zh="02.4 · Stage 2 · 许可与成本估算" data-en="02.4 · Stage 2 · License &amp; Cost">02.4 · Stage 2 · License &amp; Cost',
         'data-zh="03.4 · Stage 2 · 许可与成本估算" data-en="03.4 · Stage 2 · License &amp; Cost">03.4 · Stage 2 · License &amp; Cost'),
        ('data-zh="02.5 · Stage 2 · 环境与 DLP" data-en="02.5 · Stage 2 · Env &amp; DLP">02.5 · Stage 2 · Env &amp; DLP',
         'data-zh="03.5 · Stage 2 · 环境与 DLP" data-en="03.5 · Stage 2 · Env &amp; DLP">03.5 · Stage 2 · Env &amp; DLP'),
        ('data-zh="02.6 · Stage 2 · 决策门" data-en="02.6 · Stage 2 · Gate">02.6 · Stage 2 · Gate',
         'data-zh="03.6 · Stage 2 · 决策门" data-en="03.6 · Stage 2 · Gate">03.6 · Stage 2 · Gate'),
        # Design chapter overview (03 → 04)
        ('data-zh="03 / 设计与审批 · Stage 3" data-en="03 / Design &amp; Approve · Stage 3">03 / Design &amp; Approve · Stage 3',
         'data-zh="04 / 设计与审批 · Stage 3" data-en="04 / Design &amp; Approve · Stage 3">04 / Design &amp; Approve · Stage 3'),
        # Design sub kickers 03.1–03.6 → 04.1–04.6
        ('data-zh="03.1 · Stage 3 · 数据模型" data-en="03.1 · Stage 3 · Data Model">03.1 · Stage 3 · Data Model',
         'data-zh="04.1 · Stage 3 · 数据模型" data-en="04.1 · Stage 3 · Data Model">04.1 · Stage 3 · Data Model'),
        ('data-zh="03.2 · Stage 3 · 环境拓扑" data-en="03.2 · Stage 3 · Env Topology">03.2 · Stage 3 · Env Topology',
         'data-zh="04.2 · Stage 3 · 环境拓扑" data-en="04.2 · Stage 3 · Env Topology">04.2 · Stage 3 · Env Topology'),
        ('data-zh="03.3 · Stage 3 · ALM 布局" data-en="03.3 · Stage 3 · ALM Layout">03.3 · Stage 3 · ALM Layout',
         'data-zh="04.3 · Stage 3 · ALM 布局" data-en="04.3 · Stage 3 · ALM Layout">04.3 · Stage 3 · ALM Layout'),
        ('data-zh="03.4 · Stage 3 · DLP 例外" data-en="03.4 · Stage 3 · DLP Exceptions">03.4 · Stage 3 · DLP Exceptions',
         'data-zh="04.4 · Stage 3 · DLP 例外" data-en="04.4 · Stage 3 · DLP Exceptions">04.4 · Stage 3 · DLP Exceptions'),
        ('data-zh="03.5 · Stage 3 · 角色矩阵" data-en="03.5 · Stage 3 · Role Matrix">03.5 · Stage 3 · Role Matrix',
         'data-zh="04.5 · Stage 3 · 角色矩阵" data-en="04.5 · Stage 3 · Role Matrix">04.5 · Stage 3 · Role Matrix'),
        ('data-zh="03.6 · Stage 3 · 签核" data-en="03.6 · Stage 3 · Sign-Off">03.6 · Stage 3 · Sign-Off',
         'data-zh="04.6 · Stage 3 · 签核" data-en="04.6 · Stage 3 · Sign-Off">04.6 · Stage 3 · Sign-Off'),
        # Playbook (04 → 05)
        ('data-zh="04 / 30 天落地手册" data-en="04 / 30-Day Implementation Playbook">04 / 30-Day Implementation Playbook',
         'data-zh="05 / 30 天落地手册" data-en="05 / 30-Day Implementation Playbook">05 / 30-Day Implementation Playbook'),
        # References (05 → 06)
        ('data-zh="05 / 官方参考" data-en="05 / Official References">05 / Official References',
         'data-zh="06 / 官方参考" data-en="06 / Official References">06 / Official References'),
        # Playbook H2 cross-ref §02–§03 → §03–§04
        ('data-zh="在新租户上用四周走完 &sect;02&ndash;&sect;03" data-en="Execute &sect;02&ndash;&sect;03 on a Fresh Tenant in Four Weeks">Execute &sect;02&ndash;&sect;03 on a Fresh Tenant in Four Weeks',
         'data-zh="在新租户上用四周走完 &sect;03&ndash;&sect;04" data-en="Execute &sect;03&ndash;&sect;04 on a Fresh Tenant in Four Weeks">Execute &sect;03&ndash;&sect;04 on a Fresh Tenant in Four Weeks'),
        # References lead §01–§04 → §01–§05
        ('data-zh="&sect;01&ndash;&sect;04 中所有论据的权威出处。所有 URL 均于 2026 年 5 月验证。" data-en="The authoritative sources behind every claim in &sect;01&ndash;&sect;04. All URLs verified as of May 2026.">The authoritative sources behind every claim in &sect;01&ndash;&sect;04. All URLs verified as of May 2026.',
         'data-zh="&sect;01&ndash;&sect;05 中所有论据的权威出处。所有 URL 均于 2026 年 5 月验证。" data-en="The authoritative sources behind every claim in &sect;01&ndash;&sect;05. All URLs verified as of May 2026.">The authoritative sources behind every claim in &sect;01&ndash;&sect;05. All URLs verified as of May 2026.'),
    ]
    for old, new in kicker_renames:
        text = must_replace_once(text, old, new, f'kicker rename {old[:40]!r}')

    # 4c. Bulk-rename data-step-label values: '02 / Discover' → '03 / Discover',
    #     '03 / Design' → '04 / Design'. Use regex on attribute values.
    text = re.sub(
        r'data-step-label="02 / Discover &amp; Qualify"',
        'data-step-label="03 / Discover &amp; Qualify"',
        text,
    )
    text = re.sub(
        r'data-step-label="03 / Design &amp; Approve"',
        'data-step-label="04 / Design &amp; Approve"',
        text,
    )

    # 4d. Bulk-rename lc-anchor cross-refs:
    #     &rarr;&sect;02 → &rarr;&sect;03 (licensing chapter)
    #     &rarr;&sect;03 → &rarr;&sect;04 (design chapter)
    # Need to bump 03 first then 02 to avoid double-shifting.
    text = text.replace('&rarr;&sect;03', '&rarr;&sect;04')
    text = text.replace('&rarr;&sect;02', '&rarr;&sect;03')

    # 5. Topbar nav: add new entry as first link.
    nav_old = (
        '          <nav class="nav-links" aria-label="页面章节导航" data-nav-pager>\n'
        '            <a href="#lifecycle" data-zh="项目流程" data-en="Project Process">项目流程</a>'
    )
    nav_new = (
        '          <nav class="nav-links" aria-label="页面章节导航" data-nav-pager>\n'
        '            <a href="#basics" data-zh="基础概念" data-en="Foundations">基础概念</a>\n'
        '            <a href="#lifecycle" data-zh="项目流程" data-en="Project Process">项目流程</a>'
    )
    text = must_replace_once(text, nav_old, nav_new, 'topbar nav')

    FILE.write_text(text, encoding="utf-8")
    delta = len(text) - original_len
    print(f"restructure complete · delta={delta:+d} bytes")


if __name__ == "__main__":
    main()
