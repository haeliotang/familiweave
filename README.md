# Familiweave

> 为不可言说的内在经验，提供一个可进入、可退出、可自己解释的象征空间。

Familiweave 是一个关于内在经验的公开探索项目，由 **Inceptless 公司**发起。

有些经验很难被语言装下：反复出现的梦、说不清的地点、身体里的某种感觉、一段关系的余温、一个人不在场之后留下的空白。我们通常只能用“说不上来”来描述它们。

Familiweave 不解释这些经验，也不声称知道它们“真正意味着什么”。它的一个基本动作，是把它们变成一段象征空间——有门、走廊、水、房子、车站、镜子或田野，有一个影子般的存在，有几段声音与光。你可以进入、靠近、停留，也可以随时离开。

## 起点：不可言说

我们不是从“如何复活一个人”开始的，也不是从“如何解释一个梦”开始的。我们从一个更基础的问题开始：

> **那些还没有形成语言的内在经验，能不能有一个可以被经历、而不被定义的形式？**

梦、艺术、仪式都在做这件事。Familiweave 想用可交互的空间做一次很小的尝试：给形式，不给结论。

失去、距离与关系变化也是重要的入口——它们都会留下无法言说的东西。

## 不止一种形式

“相遇”只是其中一种时长与结构：75 秒、有起承转合、可能有一个影子。Familiweave 的底层是「象征空间」而不是「相遇产品」；同一個核心还可以是：

| 形式 | 结构 | 当前状态 |
| --- | --- | --- |
| 相遇 | 75 秒弧线，可进入/停留/离开 | 当前原型 |
| 空间 | 没有明确起承转合，可以待着 | 当前原型 |
| 仪式 | 短、可重复、有明确开始与结束 | 计划 |
| 物件 | 把一段内在经验做成可带走的视觉/声音物 | 计划 |
| 档案 | 把碎片放成一片可浏览的地形，不要求相遇 | 计划 |

详细边界见 [内在体验的形式](docs/inner/formats.md)。

## 三个原则

1. **象征，不解释。**
   系统提供空间、声音、光和节拍；不提供梦的字典、心理诊断或“你潜意识里其实……”的断言。

2. **意义归用户。**
   用户可以觉得它像什么，也可以什么都不觉得。系统不评分、不分析、不纠正用户的感受。

3. **有限，可退出。**
   一次 75 秒，不要求每天回来，不制造“对方在等你”。离开也是体验的一部分。

## 这是什么，不是什么

**它是：**

- 一个“内在经验”的导演工具：一段梦、画面或感觉，变成有母题、节拍、影子与提示词的象征空间。
- 一个可插拔的渲染层：当前是象征空间；未来可以接 Genie 4 等生成式世界模型。
- 一个可追溯的记录系统：空间、计划、安全约束与捕获成片都有版本。

**它不是：**

- 不声称与任何人真实沟通、传讯，也不声称“读取潜意识”。
- 不是梦境解释器、心理测试、治疗或诊断工具。
- 不是无限聊天陪伴、社交网络或情感替代品。
- 不是写实克隆；不做长相、声音或人格的写实复刻。

## 一种形式：内在相遇

```
一段梦 / 画面 / 感觉 / 地点
        │
        ▼
InnerPlan
母题 · 75 秒情绪弧 · 影子 · 空间/声音/光/镜头提示词 · 安全约束
        │
        ▼
世界渲染器
symbolic（本地原型） / genie4（以后）
        │
        ▼
75 秒内在相遇 + 捕获与出处
        │
        ▼
一个开放问题；不解释、不评分、不诊断
```

- **导演层决定“发生什么”**：母题、影子、节拍与提示词；不在提示词里放入用户原文。
- **渲染层决定“看起来怎样”**：象征空间或未来的世界模型。
- **捕获决定“如何留下”**：非确定性输出保存成片、hash、模型、提示词与时间。

## 当前状态

| 部分 | 状态 |
| --- | --- |
| 可运行原型 | 内在景观 · 相遇与空间两种形式（无声） |
| 内在导演层 | `InnerPlan`：母题、影子、75 秒节拍、空间/声音/光/镜头提示词、安全字段 |
| 内在分镜 | `pnpm inner:storyboard --fragment "…"`；网页示例可进入 |
| 象征渲染器 | `symbolic` 本地原型可用：75 秒、无音频、可进入/停留/离开；不解释 |
| 渲染层 | `WorldRenderer` 注册表；`symbolic` / `captured` 可用，`genie4` 等待 API |
| 捕获与出处 | `CaptureProvenance` 写入 manifest；可回放有 URL 的捕获 |
| 同意与隐私 | 用途绑定 consent；真实资料与梦/感觉默认不上传 |
| 评估工具 | Rust `familiweave-ops`：实验日志校验与汇总；`docs/inner/evaluation.md` |
| Genie 4 | 客户端接口 + Rust 配置检查；没有网络调用 |
| API 准备 | [Genie 4 开放检查清单](docs/api/genie-4-readiness.md) |
| 验证边界 | 当前为本地研究原型；真机、生产部署、量化音频、临床与真人体验未验证 |

当前可运行的是内在景观的相遇与空间示例。`innerPlan` 进入类型层，`symbolic` 程序化渲染器提供 75 秒相遇与 180 秒空间两种无声原型；捕获、同意与出处沿用同一套 episode 记录。

## 当前可以体验什么

| 部分 | 当前能力 |
| --- | --- |
| 输入 | 一段梦、画面、地点或感觉；不要求上传真实资料 |
| 空间 | 走廊、门、水、房子、森林、车站、镜子、田野等母题组合 |
| 影子 | shadow / stranger / child / animal / none；非身份、非诊断 |
| 节拍 | 75 秒：进入 → 注意 → 靠近 → 停留 → 变化 → 离开 |
| 交互 | 靠近、停留/继续、离开、重新进入；空间没有强制结束 |
| 声音 | 无声原型；声音在后续迭代加入 |
| 安全 | 不解释、不评分、不诊断；离开随时可用 |

首页现在默认是内在景观入口：写下一段梦、画面、地点或感觉，选择 **75 秒相遇** 或 **180 秒空间**，即可进入。也可以使用示例按钮快速查看两种形式。

两种形式都不解释、不诊断，也没有声音。仪式、物件与档案形式尚未实现；它们会复用同一套 `InnerPlan` / `WorldRenderer` / capture 核心。

这只是本地原型，不是治疗、不是潜意识读取，也不是已经验证有效的体验。

## 技术栈

以 **TypeScript + Rust** 为主，按职责分工：

| 层 | 技术 |
| --- | --- |
| Web / 空间渲染 | TypeScript、React、Vite、CSS/DOM（symbolic） |
| API / 存储 | TypeScript、Fastify、PostgreSQL；本地开发使用 PGlite |
| 导演 / 分镜 / 业务类型 | TypeScript：`InnerPlan`、`WorldRenderer`、manifest、consent |
| 文件与评估工具 | Rust：`familiweave-ops`（捕获 hash/verify、实验日志校验、Genie 配置检查） |
| 模型与媒体 | Kokoro / Whisper / Silero（本地）、FFmpeg、libheif、sharp |
| 世界模型适配 | `genie4` 预留；未来 API/流式接入优先放在 Rust 侧 |

Rust 负责确定性强、文件型、无 UI 的操作；现有 Web/服务器代码不为了“换语言”而重写。等 Genie 4 API 明确后，捕获与流式适配可以继续放在 Rust 服务里。

## 隐私、伦理与边界

- **不解释、不诊断**：不提供梦的字典、心理测试或“你潜意识里其实……”的断言。
- **不声称读取潜意识**：系统只提供空间与开放问题，意义由用户完成。
- **不做记忆恢复**：不暗示被压抑的记忆，不制造虚假记忆；不处理急性创伤。
- **不做写实克隆**：不做长相、声音或人格的写实复刻。
- **默认本地**：梦、感觉、照片和录音默认不上传；只有明确同意才允许云端生成，且只用于环境/布局参考。
- **不替代真实帮助**：涉及自伤、他伤或急性痛苦时，应停止体验并寻求现实中的专业帮助。
- **当前验证边界**：以合成资料、本地浏览器和临时数据库为主；内在共鸣与安全性均无已验证的结论。
- **未完成项**：可选声音、生成式世界模型接入、真人安全评审与对照测试、手机真机验收、生产部署、可听清率与扬声器同步 P95 未通过声明。
- **当前为本地研究原型**：真机、生产部署、量化音频、临床与真人体验均未验证。

## 本地运行

### 环境

- Node.js 22、pnpm 10.32.1。
- Rust stable（`cargo`；用于 `familiweave-ops` 的捕获 hash/verify、实验校验与 Genie 配置检查）。
- FFmpeg / FFprobe；HEIC / HEIF 照片转换还需要 `heif-convert`。
- 首次安装依赖和模型需要网络；模型下载后在本机推理，无需供应商账户或 API 密钥。

macOS 媒体工具：

```sh
brew install ffmpeg libheif
```

Ubuntu 24.04 媒体工具：

```sh
sudo apt-get install ffmpeg libheif-examples libheif-plugin-libde265
```

### 安装

```sh
git clone https://github.com/haeliotang/familiweave.git
cd familiweave
pnpm install --frozen-lockfile
sh scripts/install-local-voice.sh
sh scripts/install-local-asr.sh
sh scripts/install-local-vad.sh
pnpm check:local
```

安装脚本使用固定下载来源并校验 SHA-256，模型保存在 `.models/`。公开台词样本已随仓库提供。

### 启动

在一个终端启动本地 API：

```sh
pnpm dev:local-api
```

在另一个终端启动网页：

```sh
pnpm dev
```

打开网页服务显示的本机地址，通常为 `http://127.0.0.1:5173/`。本地 API 默认使用端口 3001；开发服务均绑定本机地址。

开发模式使用 PGlite，无需额外启动 PostgreSQL 或 Docker。数据库写入 `.local-db/`，上传资料写入 `.local-assets/`。这两个目录、模型缓存和本地环境配置均不纳入 Git。公开素材与合成样本位于 `public/` 和 `artifacts/`，不要将私人资料放入这些目录。

### 内在分镜

不调用任何世界模型，也可以把一段梦/画面/感觉导出为象征空间分镜：

```sh
pnpm inner:storyboard --fragment "我总梦见一条走廊尽头有一扇门，门外是水。"
pnpm inner:storyboard --fragment "一片有水的空地，远处有一扇门。" --format space
pnpm inner:storyboard --fragment "我总梦见一条走廊尽头有一扇门，门外是水。" --json > inner.json
```

输出包含形式、母题、影子、节拍（相遇 75 秒 / 空间 180 秒）、空间/声音/光/镜头提示词与安全约束，不包含输入原文，也不做解释。

### 评估日志

`docs/evaluation/experiments.md` 定义了 6 个生成实验与 9 项评分；`docs/inner/evaluation.md` 定义了内在体验的 6 个实验与 9 个安全/共鸣维度。记录后运行：

```sh
pnpm eval:validate path/to/experiment-log.json
```

### 检查与构建

```sh
pnpm check:local
pnpm exec vitest run --maxWorkers=2
pnpm build
pnpm rust:test
pnpm check:symbolic-path
```

数据库集成测试需要单独设置 `TEST_DATABASE_URL`，未设置时对应测试会跳过。请使用可丢弃的测试数据库，测试会创建、修改和清理数据。

仓库包含 [GitHub Actions 检查](.github/workflows/ci.yml)：安装固定模型与媒体工具，使用 PostgreSQL 17 运行测试和构建；另有 [Rust 操作工具检查](.github/workflows/rust.yml)：运行 `cargo test`。自动检查覆盖工程行为，不替代动作观感、手机性能、内在体验或真人效果评估。

正式 PostgreSQL 服务的环境配置、迁移、启动与回滚说明见 [部署文档](docs/deployment.md)。目前尚未完成面向公网的生产部署验证。

## 项目地图

- [`src/inner.ts`](src/inner.ts)：内在景观的 `InnerPlan`、母题/影子/节拍/提示词与安全字段。
- [`src/episode-plan.ts`](src/episode-plan.ts)：统一的 `EpisodePlan` 信封与读取适配。
- [`src/inner-encounter.ts`](src/inner-encounter.ts)：本地相遇/空间示例与用户输入工厂。
- [`src/inner-entry.tsx`](src/inner-entry.tsx)：默认的内在景观输入表单。
- [`src/main.tsx`](src/main.tsx)：纯象征空间的本地入口；不连接资料准备流程。
- [`src/symbolic-renderer.tsx`](src/symbolic-renderer.tsx)：相遇（75 秒）与空间（180 秒）的无声象征空间原型。
- [`docs/inner/`](docs/inner/)：内在景观方向说明与安全/共鸣评估。
- [`docs/refactor/`](docs/refactor/)：核心重构与性能计划。
- [`src/world-renderer.ts`](src/world-renderer.ts)：`WorldRenderer`、`WorldRenderSession` 与能力声明。
- [`src/world-renderers.tsx`](src/world-renderers.tsx)：已注册渲染器（symbolic / captured / genie4 占位）。
- [`src/capture.ts`](src/capture.ts)：捕获成片的出处与指纹。
- [`src/consent.ts`](src/consent.ts)：用途绑定的云端同意记录。
- [`src/genie/`](src/genie/)：Genie 4 适配器接口与未配置占位实现（不联网）。
- [`rust/`](rust/)：Rust workspace；`familiweave-ops` 负责捕获 hash/verify、实验日志校验与 Genie 配置检查。
- [`src/`](src/)：页面、内在景观、象征渲染与播放控制。
- [`server/`](server/)：资料处理、匿名会话、准备任务、历史、删除和数据库迁移。
- [`scripts/`](scripts/)：模型安装、素材处理、分镜与本地验证工具。
- [`public/assets/`](public/assets/)：带版本的公开人物、动作与合成语音资源。
- [`docs/evaluation/`](docs/evaluation/)：生成实验模板、评分表与日志示例。
- [`docs/api/`](docs/api/)：Genie 4 API 开放检查清单。

## 路线图

- **Phase 0（已完成）**：`InnerPlan`、`WorldRenderer` 接口、manifest 接入、提示词/分镜、捕获 schema、同意记录、Rust 评估工具、Genie 适配器骨架与 API 清单。
- **Phase 1（当前）**：`symbolic` 的相遇与空间形式已可用；下一步补安全评审、可选声音，并扩展仪式/物件/档案形式。
- **Phase 2（验证通过）**：捕获回放、删除、同意流程、成本模型与小样本体验测试。
- **Phase 3（Genie 4 / 备选）**：Genie 4 可用后用世界模型渲染梦逻辑；Marble、Reactor 或开源模型作为备选。

## 后续开发

- 新功能只从当前核心出发：`InnerPlan` → `WorldRenderer` → `CaptureProvenance`，加上 consent 与 Rust ops。
- 已有实现不再并行扩展；按 [核心重构与性能计划](docs/refactor/plan.md) 迁移、合并或删除。
- 性能以测量为准：首屏、75 秒空间稳定、资产/模型加载、捕获与 hash 时间；不以未测量的吞吐或帧率做声明。

## 研究问题

1. 象征空间能否让难以言说的经验获得形式，而不被解释？
2. 75 秒、可退出的限制，会让人更安全，还是更疏离？
3. 系统不解释时，用户会觉得被尊重，还是觉得空洞？
4. 除了 75 秒相遇，用户是否真的需要空间、仪式、物件或档案形式？
5. 谁适合、谁不适合？急性哀伤、创伤、焦虑、或只是想玩的人，反应可能完全不同。

这些问题没有答案前，Familiweave 更像一个研究型产品，而不是一项已经证明有效的服务。

## 参与

欢迎通过 Issues 讨论体验想法、报告可复现的问题，或提出空间、声音和交互改进。尽量附上浏览器与系统版本、复现步骤及预期表现，使用合成资料举例，避免在公开讨论中上传私人照片、录音、梦或情绪资料。

## 发起方

Familiweave 由 **Inceptless 公司**发起。
