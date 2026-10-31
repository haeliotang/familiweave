# Familiweave

> 为不可言说的内在经验，提供一个可进入、可退出、可自己解释的象征空间。

Familiweave 是一个关于内在经验的公开探索项目，由 **Inceptless 公司**发起。

有些经验很难被语言装下：反复出现的梦、说不清的地点、身体里的某种感觉、一段关系的余温、一个人不在场之后留下的空白。我们通常只能用“说不上来”来描述它们。

Familiweave 不解释这些经验，也不声称知道它们“真正意味着什么”。它只做一件事：把它们变成一段 75 秒的象征空间——有门、走廊、水、房子、车站、镜子或田野，有一个影子般的存在，有几段声音与光。你可以进入、靠近、停留，也可以随时离开。

## 起点：不可言说

我们不是从“如何复活一个人”开始的，也不是从“如何解释一个梦”开始的。我们从一个更基础的问题开始：

> **那些还没有形成语言的内在经验，能不能有一个可以被经历、而不被定义的形式？**

梦、艺术、仪式都在做这件事。Familiweave 想用可交互的空间做一次很小的尝试：给形式，不给结论。

“缺席的人”仍然是重要的入口之一——一个人不在了、关系变了、距离远了，都会留下无法言说的东西。但它不是全部。

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
- 一个可插拔的渲染层：当前是程序场景；未来可以接 Genie 4 等生成式世界模型。
- 一个可追溯的记录系统：场景、计划、安全约束与捕获成片都有版本。

**它不是：**

- 不是数字复活，不声称与逝者真实沟通、传讯或“读取潜意识”。
- 不是梦境解释器、心理测试、治疗或诊断工具。
- 不是无限聊天陪伴、社交网络或情感替代品。
- 不是写实克隆；不做长相、声音或人格的写实复刻。

## 一次内在相遇如何发生

```
一段梦 / 画面 / 感觉 / 地点
        │
        ▼
InnerPlan
母题 · 75 秒情绪弧 · 影子 · 空间/声音/光/镜头提示词 · 安全约束
        │
        ▼
世界渲染器
symbolic（本地原型） / procedural / genie4（以后）
        │
        ▼
75 秒内在相遇 + 捕获与出处
        │
        ▼
一个开放问题；不解释、不评分、不诊断
```

- **导演层决定“发生什么”**：母题、影子、节拍与提示词；不在提示词里放入用户原文。
- **渲染层决定“看起来怎样”**：象征空间、程序场景或未来的世界模型。
- **捕获决定“如何留下”**：非确定性输出保存成片、hash、模型、提示词与时间。

## 与“缺席关系”的关系

Familiweave 的前一个版本围绕“一个不在场的人”展开：用行为线索与节奏，让用户重新遇见一个缺席的人。

现在它退后一步：缺席只是内在经验的一种来源。项目仍然保留那条体验线，但主方向变成“象征空间”——不解释一个人，也不解释一个梦，只提供一个可以自己完成意义的形式。

## 当前状态

| 部分 | 状态 |
| --- | --- |
| 可运行原型 | 六个程序场景、两个成人基础人物、八个动作、约 75 秒相遇（旧方向基线） |
| 内在导演层 | `InnerPlan`：母题、影子、75 秒节拍、空间/声音/光/镜头提示词、安全字段 |
| 内在分镜 | `pnpm inner:storyboard --fragment "…"`；网页示例可进入 |
| 象征渲染器 | `symbolic` 本地原型可用：75 秒、无音频、可进入/停留/离开；不解释 |
| 渲染层 | `WorldRenderer` 注册表；`procedural` / `captured` 可用，`genie4` 等待 API |
| 捕获与出处 | `CaptureProvenance` 写入 manifest；可回放有 URL 的捕获 |
| 同意与隐私 | 用途绑定 consent；真实资料与梦/感觉默认不上传 |
| 评估工具 | Rust `familiweave-ops`：实验日志校验与汇总；`docs/inner/evaluation.md` |
| Genie 4 | 客户端接口 + Rust 配置检查；没有网络调用 |
| API 准备 | [Genie 4 开放检查清单](docs/api/genie-4-readiness.md) |
| 交付边界 | 2026-10-01 本地范围完成；真机、生产部署、临床与真人体验未验证 |

当前可运行两条线：旧方向的本地三维基线，以及新的“内在景观”示例。新 episode 的 manifest 已记录 `rendererKind`、`directorPlan` 和可选的 `capture`；内在景观的 `innerPlan` 已进入类型层，`symbolic` 程序化渲染器提供 75 秒的无声原型。

## 现在可以体验什么

| 部分 | 当前能力 |
| --- | --- |
| 场景 | 河岸小路、旧时庭院、农庄边缘、木工角落、山间小屋、集市收摊时六个风格化小场景 |
| 人物与表演 | 两个成人基础人物；坐下、坐着休息、起身、行走、待机、说话、跪姿查看木箱、拿取物件八个动画片段，以及回头等待的编排 |
| 观看 | 开启或关闭声音、暂停、继续、重看、转动视角、靠近或坐下看、退出 |
| 记忆 | 文字输入；记忆录音本地转写、核对后使用；有限规则识别等待同行者、修补物件等线索 |
| 照片 | 上传与格式处理；仅提供照片时询问一个可跳过的小习惯，跳过后进入明确标注的一般想象 |
| 声音 | 本地预设中文音色；核对参考录音后，有限地调整新声音的语速与短句间停顿 |
| 记录 | 准备进度、失败重试、历史回看、再次相遇、线索纠正、可跳过的反馈与资料删除 |

也可以直接进入无个人资料的示例。建议从合成记忆开始，例如：“他走路时总会回头等我。”

页面上的 **“进入内在景观（示例）”** 会打开一段合成的象征空间：走廊、门、水、一个影子，以及“靠近/停留/离开”。它不解释、不诊断，也没有声音。

当前内容为 **六个场景、两个人物、八个动作**。“拿起物件”包含拿起、停留和放回桌面；手部观感与全组合质量仍在完善。默认人物使用较小的纹理包，已有相遇绑定人物、场景、声音和表演版本，后续改动保留旧版本资源供回看。

## 技术栈

以 **TypeScript + Rust** 为主，按职责分工：

| 层 | 技术 |
| --- | --- |
| Web / 三维 | TypeScript、React、Vite、Three.js |
| API / 存储 | TypeScript、Fastify、PostgreSQL；本地开发使用 PGlite |
| 导演 / 分镜 / 业务类型 | TypeScript：`DirectorPlan`、`InnerPlan`、`WorldRenderer`、manifest、consent |
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
- **当前验证边界**：以合成资料、本地浏览器和临时数据库为主；熟悉感、内在共鸣与安全性均无已验证的结论。
- **未完成项**：象征渲染器、生成式世界模型接入、真人体验与对照测试、手机真机验收、生产部署、可听清率与扬声器同步 P95 未通过声明。
- **本地交付范围**：2026-10-01 本地项目交付完成；真机与部署已明确跳过，量化音频验收列为后续事项。完整范围与证据见 [本地交付决定](artifacts/acceptance/local-delivery-decision.md)。

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
pnpm inner:storyboard --fragment "我总梦见一条走廊尽头有一扇门，门外是水。" --json > inner.json
```

输出包含母题、影子、75 秒节拍、空间/声音/光/镜头提示词与安全约束，不包含输入原文，也不做解释。

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
```

数据库集成测试需要单独设置 `TEST_DATABASE_URL`，未设置时对应测试会跳过。请使用可丢弃的测试数据库，测试会创建、修改和清理数据。

仓库包含 [GitHub Actions 检查](.github/workflows/ci.yml)：安装固定模型与媒体工具，使用 PostgreSQL 17 运行测试和构建；另有 [Rust 操作工具检查](.github/workflows/rust.yml)：运行 `cargo test`。自动检查覆盖工程行为，不替代动作观感、手机性能、内在体验或真人效果评估。

正式 PostgreSQL 服务的环境配置、迁移、启动与回滚说明见 [部署文档](docs/deployment.md)。目前尚未完成面向公网的生产部署验证。

## 项目地图

- [`src/inner.ts`](src/inner.ts)：内在景观的 `InnerPlan`、母题/影子/节拍/提示词与安全字段。
- [`src/inner-encounter.ts`](src/inner-encounter.ts)：合成的内在景观示例入口。
- [`src/symbolic-renderer.tsx`](src/symbolic-renderer.tsx)：75 秒无声象征空间原型（可进入/停留/离开）。
- [`docs/inner/`](docs/inner/)：内在景观方向说明与安全/共鸣评估。
- [`src/director.ts`](src/director.ts)：缺席关系的导演计划、分层提示词与隐私/同意字段。
- [`src/storyboard.ts`](src/storyboard.ts)：缺席关系的分镜导出。
- [`src/world-renderer.ts`](src/world-renderer.ts)：`WorldRenderer`、`WorldRenderSession` 与能力声明。
- [`src/world-renderers.tsx`](src/world-renderers.tsx)：已注册渲染器（procedural / captured / symbolic）。
- [`src/capture.ts`](src/capture.ts)：捕获成片的出处与指纹。
- [`src/consent.ts`](src/consent.ts)：用途绑定的云端同意记录。
- [`src/genie/`](src/genie/)：Genie 4 适配器接口与未配置占位实现（不联网）。
- [`rust/`](rust/)：Rust workspace；`familiweave-ops` 负责捕获 hash/verify、实验日志校验与 Genie 配置检查。
- [`src/cue-cases.ts`](src/cue-cases.ts)：行为线索正/反例语料。
- [`src/`](src/)：页面、三维场景、人物表演、声音与播放控制。
- [`server/`](server/)：资料处理、匿名会话、准备任务、历史、删除和数据库迁移。
- [`scripts/`](scripts/)：模型安装、素材处理、分镜与本地验证工具。
- [`public/assets/`](public/assets/)：带版本的公开人物、动作与合成语音资源。
- [`docs/verification/`](docs/verification/)：验证过程、截图、发现的问题及其证据边界。
- [`docs/direction/`](docs/direction/)：世界模型方向调研、方案与路线图。
- [`docs/evaluation/`](docs/evaluation/)：生成实验模板、评分表与日志示例。
- [`docs/api/`](docs/api/)：Genie 4 API 开放检查清单。
- [`artifacts/acceptance/`](artifacts/acceptance/)：历史验收证据与审计结论。

## 路线图

- **Phase 0（已完成）**：导演层、`InnerPlan`、`WorldRenderer` 接口、manifest 接入、提示词/分镜、捕获 schema、同意记录、Rust 评估工具、行为线索语料、Genie 适配器骨架与 API 清单。
- **Phase 1（当前）**：`symbolic` 程序化渲染器与内在景观入口已可用；下一步补充安全评审、可选声音与更完整的非解释性交互。
- **Phase 2（验证通过）**：捕获回放、旧版本、删除、同意流程、成本模型与小样本体验测试。
- **Phase 3（Genie 4 / 备选）**：Genie 4 可用后用世界模型渲染梦逻辑；Marble、Reactor 或开源模型作为备选。

## 研究问题

1. 象征空间能否让难以言说的经验获得形式，而不被解释？
2. 75 秒、可退出的限制，会让人更安全，还是更疏离？
3. 系统不解释时，用户会觉得被尊重，还是觉得空洞？
4. 谁适合、谁不适合？急性哀伤、创伤、焦虑、或只是想玩的人，反应可能完全不同。

这些问题没有答案前，Familiweave 更像一个研究型产品，而不是一项已经证明有效的服务。

## 参与

欢迎通过 Issues 讨论体验想法、报告可复现的问题，或提出空间、声音和交互改进。尽量附上浏览器与系统版本、复现步骤及预期表现，使用合成资料举例，避免在公开讨论中上传私人照片、录音、梦或情绪资料。

## 发起方

Familiweave 由 **Inceptless 公司**发起。
