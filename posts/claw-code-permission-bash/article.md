---
title: 把「能不能跑这条命令」拆成 5 个模式 × 6 阶段授权 × 6 段命令校验
eyebrow: "Claw Code · Series 05 · Permissions & Bash"
brand: 智能体 · Claw Code 系列 · 05
date: 2026-04-22
strict_i18n: false
strict_density: true
lead: "Code agent 的安全护栏不能只是「dangerous=true 弹个对话框」。Claw Code 的 5 个权限相关模块共 **2,954 行**（`permissions.rs` 683 + `permission_enforcer.rs` 546 + `bash.rs` 336 + `bash_validation.rs` 1,004 + `sandbox.rs` 385）拼出了一条「mode → policy → enforcer → bash 子模块 → sandbox」的纵深防御链：每条 bash 命令都要过 6 段校验，每个工具调用都要过 6 阶段授权，hook override 还能在任何一阶段插队。"
hero_actions:
  - "进入 5 模式 | #modes"
  - "回看 MCP 硬化 | ../claw-code-mcp-hardening/index.html"
panel_label: 核心设计原则
panel_title: 三条权限设计原则
panel:
  - deny 永远不可被推翻
  - 未知工具按最高敏感度
  - 容器内自动降配
metrics:
  - "权限模式 || Permission modes | 5 | ReadOnly / WorkspaceWrite / DangerFullAccess / Prompt / Allow，全序 || ReadOnly/WorkspaceWrite/DangerFullAccess/Prompt/Allow, totally ordered"
  - "授权评估阶段 || Authorization stages | 6 | deny → override → ask → allow → mode 比较 → 提示 || deny → override → ask → allow → mode → prompt"
  - "bash 校验子模块 || bash validation modules | 6 | readOnly / destructive / mode / sed / path / semantics"
  - "命令意图分类 || Command intents | 8 | Read/Write/Destructive/Network/Process/Package/Sysadmin/Unknown"
  - "文件系统隔离模式 || Filesystem isolation modes | 3 | off / workspace-only / allow-list"
style:
  accent: "#fb923c"
---

## #problem 01 / Problem :: 「单层确认对话框」抵不住 4 类真实事故

### 单层 dangerous=true 对话框

- echo hi > /etc/hosts 表面是 echo——命令名安全 ≠ 命令安全
- sed -i 静默修改文件——名字像「读」工具实则原地写
- rm -rf $VAR/ 当 VAR 为空时炸根目录——路径段需要启发式检测
- hook 想批准但 ask 规则也匹配——谁优先？没有显式优先级就是定时炸弹

### 5 × 6 × 6 纵深防御

- 5 种 PermissionMode 全序——升降级判断用 ≥ 而非 flag
- 6 阶段授权瀑布——deny 永远第一、override 不能突破 deny
- 6 段 bash 校验——readOnly / destructive / mode / sed / path / semantics
- sandbox 纵深——即使命令通过校验仍被文件系统隔离限制

在看具体实现之前，先理解驱动整个设计的三条不可妥协的原则。

## #philosophy 02 / Design Philosophy :: 三条权限设计原则

:::insight-grid { cols: 3 }
::card 01
### deny 永远不可被任何 override 推翻
原则 1

授权瀑布里 deny 规则永远排在第一位。即使 hook 给了 Allow override，即使 mode 是 DangerFullAccess，deny 规则命中就直接拒绝。这是安全护栏的最后一道——如果 deny 可以被绕过，那 deny 就不是 deny。

::card 02
### 未知工具按最高敏感度处理
原则 2

required_mode_for(tool_name) 查不到时返回 DangerFullAccess。这意味着任何新加的工具如果忘了登记 required_mode，就需要最高权限才能调用——强迫开发者显式声明。宁可误拦不可误放。

::card 03
### 容器内自动降低 sandbox 限制
原则 3

detect_container_environment 检测 cgroup 文件、/.dockerenv 等信号。容器内本身已被隔离，再叠 namespace 限制可能起反作用（挂载冲突、权限不足）。sandbox 据此自动降配——不是「总是加更多限制」而是「在正确的层加正确的限制」。
:::

## #modes 03 / Permission Modes :: 5 种模式 + 全序关系：为什么是枚举而非 flag

枚举只有 5 个值，但 PartialOrd 让它们可比较——升降级判断用 `current_mode >= required_mode` 而非 flag 集合。

ReadOnly

### 只读

顺序最低。调用任何写工具或写命令都被 enforcer 拒绝。bash 子模块的 `validate_read_only` 在这一模式才生效。

WorkspaceWrite

### 工作区可写

允许写工作区内文件；命令若指向 `/etc/ /usr/ /var/ /sbin/` 等系统路径，`validate_mode` 升级为 Warn 而非 Allow。

DangerFullAccess

### 全权

顺序最高。绕过 mode 维度的拦截，但 **不绕过 deny 规则与 sandbox 隔离**。供 CI / 受控运行环境使用。

Prompt

### 逐次询问

每个工具调用都触发 `PermissionPrompter::decide`。policy 在这里调出对话路径而非静默允许。

Allow

### 全部允许

special token，等价于「比 required 永远高」。区别于 DangerFullAccess 的语义在于：Allow 可被 ask 规则反向覆盖。

:::accordion { title: "升降级判断逻辑" }
::panel
### 升降级判断的关键代码 || Key code for mode escalation
```
if allow_rule.is_some()
    || current_mode == PermissionMode::Allow
    || current_mode >= required_mode
{
    return PermissionOutcome::Allow;
}

if current_mode == PermissionMode::Prompt
    || (current_mode == PermissionMode::WorkspaceWrite
        && required_mode == PermissionMode::DangerFullAccess)
{
    // 触发 prompter，由用户最终决定
    return Self::prompt_or_deny(...);
}
```

WorkspaceWrite → DangerFullAccess 这条线被显式列出来：当模型只想跑一条「需要 sudo」的命令，policy 会把它升到 prompt 而不是直接 deny，避免「全程要么放弃要么开全权」。
:::

## #authorize 04 / Authorize Waterfall :: 为什么授权是固定顺序的 6 级瀑布

`permissions.rs` 把授权写成一个固定顺序的 if-cascade。读源码看似冗长，但它的优势是**不可越权**——deny 永远在 override 前，override 内部 Deny > Ask > Allow，最后才是 mode 比较。

①

### deny 规则匹配

遍历 `deny_rules`，命中即返回 `PermissionOutcome::Deny { reason }`，把规则原文 `rule.raw` 嵌进 reason，便于排错。**deny 永远不可被任何 override 推翻**。

②

### 预解析 ask / allow 规则

提前 `find_matching_rule`，结果用于第 ③ 与第 ④ 段；这一步只是查表不下决断。

③

### hook override 分流

读取 `PermissionContext::override_decision`：Deny 直接拒；Ask 强制走 prompter；Allow 进入第 ④ 看是否仍被 ask 规则截胡。**override 不能突破 deny 但可以下调 allow**。

④

### ask 规则截胡

命中 ask 规则一律走 prompter，理由模板：`"tool '{name}' requires approval due to ask rule '{raw}'"`。这是默认安全姿态——「明显要问就一定要问」。

⑤

### allow / mode 比较

满足以下任一即放行：allow 规则命中 / current_mode == Allow / current_mode >= required_mode。

⑥

### 升级 prompt 兜底

仍未决：若 mode == Prompt 或 WorkspaceWrite→DangerFullAccess 升级路径，`prompt_or_deny` 触发用户对话；prompter 缺席则默认 Deny。

:::accordion { title: "hook override 与 ask 的优先级博弈" }
::panel { open: true }
### Allow + ask 命中 ⇒ 仍要问 || Allow + ask hit ⇒ still ask
当 hook 给了 `PermissionOverride::Allow` 但同时 ask 规则也命中：源码先在 override 分支里检查 ask_rule，命中则走 prompter，失败默认 Deny。这把「hook 想放行但仓库规则要求人工把关」的冲突解释得很清楚——**两者都不是绝对赢家，但更保守的一方决定走向**。

::panel
### prompter 缺席的安全默认 || Default deny when prompter is absent
`prompt_or_deny` 在没有 `Some(prompter)` 时直接返回 Deny。这意味着 daemon 在无人参与的非交互执行（CI、headless）路径里，遇到 ask 一律拒绝；调用方必须显式提供 prompter（比如 mock 默认拒绝）才能跑过。

::panel
### required_mode 默认 DangerFullAccess 的含义 || Why required_mode defaults to DangerFullAccess
`required_mode_for(tool_name)` 在 tool_requirements 表里查不到时返回 `DangerFullAccess`。这是一种「未知工具按最高敏感度处理」策略——任何新加的工具如果忘了登记 required_mode，就需要 DangerFullAccess 才能调用，强迫开发者显式声明。
:::

## #bash-pipeline 05 / Bash Validation :: 命令名安全不等于命令安全：6 段校验流水线

当工具调用的目标是 `bash`，光靠 mode 比较远远不够——同一条命令在不同 mode 下含义不同，重定向、sed -i、rm -rf 还要单独识别。`bash_validation` 是文件最大的安全相关模块，按照 upstream `BashTool` 的 6 个子模块一一移植。

| 子模块 | 函数 | 核心检测 | 典型结果 |
| --- | --- | --- | --- |
| readOnlyValidation | `validate_read_only` | ① WRITE_COMMANDS 黑名单 ② STATE_MODIFYING_COMMANDS ③ sudo 内部命令递归校验 ④ 写重定向 `>` `>>` `>&` ⑤ git 写命令 | Block |
| destructiveCommandWarning | `check_destructive` | 已知 destructive pattern + ALWAYS_DESTRUCTIVE_COMMANDS + 「rm + -r + -f」组合启发式 | Warn |
| modeValidation | `validate_mode` | 按 mode 分流：ReadOnly 转 readOnlyValidation；WorkspaceWrite 用 `command_targets_outside_workspace` 检查 `/etc/ /usr/ /var/` 等系统路径 | Block / Warn |
| sedValidation | `validate_sed` | 专门处理 sed：解析表达式、识别 `-i` 原地写、检查替换目标路径 | Warn |
| pathValidation | `validate_paths` | 在 workspace 上下文里检查路径段，识别 `$VAR/` 空变量、`../` 越界、绝对路径外溢 | Warn |
| commandSemantics | `classify_command` | 把命令分类成 8 种 CommandIntent，给上层 lane_events 与 hooks 提供语义标签 | 分类 |

6 段最终在 `validate_command(command, mode, workspace)` 里串起来。`ValidationResult` 三态 `Allow / Block { reason } / Warn { message }`：Block 直接拦；Warn 走 confirm 路径不静默通过；Allow 进入 sandbox 阶段。

:::accordion { title: "readOnly 的细节：sudo 与重定向" }
::panel { open: true }
### sudo 内层命令递归校验 || Recursive sudo inner-command check
第一段命令是 `sudo` 不会立即放过，`extract_sudo_inner` 把内层命令（如 `sudo rm /tmp/foo` 里的 `rm /tmp/foo`）抽出后**再调用一次 validate_read_only**。这堵住「sudo 加魔法绕过校验」的捷径。

::panel
### 重定向 vs 命令名 || Redirection vs command name
`WRITE_REDIRECTIONS = [">", ">>", ">&"]`，read-only 模式下命令包含任一即 Block。这一段处理「`echo hi > /etc/hosts` 表面是 echo」的伪装。`>&` 同样被禁——避免「fd 重定向当作覆写文件用」。

::panel
### git 子命令的特殊处理 || Special-cased git subcommands
当首命令是 git，跳到 `validate_git_read_only`。它把 `git status / log / diff / show / blame` 等放行，把 `git commit / push / reset --hard / checkout -B` 等显式拦截，避免一刀切「git 全归只读」或「git 全归写」的两种错。

::panel
### classify_command 的边界：sed -i 算 Write || classify_command boundary: sed -i is Write
`SEMANTIC_READ_ONLY_COMMANDS` 包含 sed，但 classify 时检查 `-i` 标志：含则升格为 `Write`。这是少数被显式 patch 的特例——「名字像读、行为是写」的工具必须单独建模。
:::

## #sandbox 06 / Sandbox :: 三种文件系统隔离与容器探测

即使一条命令通过了 6 段校验，仍可能被 sandbox 限定在一个更小的执行域里。`sandbox.rs`（385 行）做三件事：定义隔离级别、探测容器环境、生成 Linux sandbox-exec 命令前缀。

FilesystemIsolationMode::Off

### 不隔离

命令直接在 host 文件系统上跑，仅靠 §4 的路径校验兜底。CI 等可信环境使用。

::WorkspaceOnly

### 仅工作区可写（默认）

通过 mount overlay 让进程只能写 cwd 子树，`/etc /usr` 等其它目录变只读。`resolve_sandbox_status` 用 `SandboxConfig + cwd` 算出 status。

::AllowList

### 白名单挂载

用 `SandboxConfig.allowed_mounts` 显式声明允许写的额外目录；超出范围一律只读。

:::accordion { title: "探测、解析、命令生成" }
::panel { open: true }
### detect_container_environment：容器内自动降配 || detect_container_environment: relax inside containers
`detect_container_environment_from` 接收探测 inputs（cgroup 文件、env 变量、`/.dockerenv` 等），返回 `ContainerEnvironment`。容器内本身已被隔离，再叠一层 namespace 限制可能起反作用——sandbox 据此**自动降低** namespace_restrictions。

::panel
### resolve_request：把 SandboxConfig 折成 SandboxRequest || resolve_request: collapse SandboxConfig into SandboxRequest
`SandboxConfig` 字段全是 `Option<_>`（用户没设就用默认）。`resolve_request(config, detection_inputs, cwd)` 把可选项与运行时探测结果合并成 `SandboxRequest`（字段都是 bool/具体值），后续生成命令只看 SandboxRequest 一个数据源——让「配置默认」与「运行时事实」的混合发生在一个明确的地方。

::panel
### build_linux_sandbox_command：把 request 翻成 LinuxSandboxCommand || build_linux_sandbox_command: request → LinuxSandboxCommand
返回 `LinuxSandboxCommand { program, args }`，由调用方拼到原始命令前面执行。生成与执行解耦，便于单测——生成函数的输入输出都是纯数据。
:::

## #enforcer 07 / Defense in Depth :: 纵深防御的最后粘合剂

ConversationRuntime 不直接调 policy / bash_validation / sandbox，而是统一调 `PermissionEnforcer`。它暴露 4 个动词，让上层只关心「能不能做这件事」。

| 方法 | 签名 | 内部走过 |
| --- | --- | --- |
| `check(tool, input)` | `fn check(&self, tool_name: &str, input: &str) -> EnforcementResult` | policy.authorize → 折叠成三态 EnforcementResult（Allow / Block { reason } / NeedsApproval { request }） |
| `is_allowed(tool, input)` | `fn is_allowed(&self, tool_name: &str, input: &str) -> bool` | check 的便利包装，仅当 EnforcementResult::Allow 时返回 true |
| `check_file_write(path, root)` | `fn check_file_write(&self, path: &str, workspace_root: &str) -> EnforcementResult` | 专门给 file_ops（write/edit）用：检查 active_mode、判断 path 是否落在 workspace_root 内 |
| `check_bash(command)` | `fn check_bash(&self, command: &str) -> EnforcementResult` | 调 §4 的 `validate_command(cmd, mode, ws)`；Block→Block；Warn→NeedsApproval；Allow→Allow |

`active_mode()` 是只读 getter，方便 hooks / lane_events 在元信息里写「当前 mode」。整个 enforcer 是 immutable struct（构造后不可变），多线程共享只读。

:::accordion { title: "EnforcementResult 三态的传播" }
::panel { open: true }
### Allow → 直接执行 || Allow → execute directly
ToolExecutor 拿到 Allow 后立即调用 `execute_bash`（bash.rs）或对应 file ops。**注意**：Allow 仅代表通过 policy/bash_validation 校验，sandbox 仍可能在执行时拒绝写入——这是纵深防御的最后一道。

::panel
### Block → ToolBlocked 事件 || Block → ToolBlocked event
转译为 `WorkerEvent::ToolBlocked { reason }`（见 Series 02 §3）。lane 渲染为 inline 警示卡，模型在下一轮看到 reason 字符串。Block 不会重试——直到 mode 变化。

::panel
### NeedsApproval → 走 prompter / hook 链 || NeedsApproval → prompter / hook chain
带回 `PermissionRequest`，runtime 把它发给 hook 与 UI。Hook 可以提供 `PermissionOverride`，**但 deny 永远赢**（见 §3 第 ① 阶段）。最终决定回到 enforcer 二次 check 后才执行。
:::

## #refs 08 / References :: 参考来源

- [1] permissions.rs (683 LOC) | PermissionMode / PermissionPolicy / PermissionContext / PermissionOverride / PermissionPrompter / authorize_with_context 全套类型
- [2] permission_enforcer.rs (546 LOC) | PermissionEnforcer / EnforcementResult / check / check_file_write / check_bash
- [3] bash_validation.rs (1,004 LOC) | readOnly / destructive / mode / sed / path / semantics 6 子模块；ValidationResult; CommandIntent
- [4] bash.rs (336 LOC) | execute_bash 入口；BashCommandInput/Output
- [5] sandbox.rs (385 LOC) | FilesystemIsolationMode / SandboxConfig / SandboxRequest / detect_container_environment / build_linux_sandbox_command
- [6] config.rs::RuntimePermissionRuleConfig | allow / deny / ask 三组规则的配置侧
- [7] claw-code 上游 BashTool 子模块 | readOnlyValidation / destructiveCommandWarning / modeValidation / sedValidation / pathValidation / commandSemantics 的 TS 原版
