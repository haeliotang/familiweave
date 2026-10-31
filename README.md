# Familiweave

> 用少量痕迹，生成一次诚实、有限、可退出的相遇。

Familiweave 是一个关于“缺席”的公开探索项目。它由 **Inceptless 公司**发起。

照片、视频和遗物能保存一个人的信息，却很难保存一个人被认出来的方式：走路时会不会回头、等人时站在哪里、说话停多久、修东西时先看哪一处。Familiweave 想用这些行为线索，重新做一次相遇。

## 起点：缺席不是一种题材

这个项目从逝者与告别开始，但它真正处理的结构更普遍：

- 一个人不在了；
- 一个人还在，但距离很远；
- 一个人还在，但关系已经改变；
- 一个人还在，但我们不再认识彼此。

死亡只是“缺席”最不可逆的一种形式。Familiweave 的底层问题不是“如何复活一个人”，而是：

> **关系在缺席与变化中，如何继续存在？**

## 三个判断

1. **认出比像更重要。**
   一个人真正让人认得出的，往往是行为与节奏，而不是长相或完整传记。

2. **连续性比信息量更重要。**
   我们不需要一个知道所有往事的数据库；我们需要的是“还是他/她”的一点点感觉。

3. **能动性比沉浸更重要。**
   用户可以靠近、停留、重看，也可以离开；可以核对、纠正、撤回、删除。关系不应该被产品绑架。

这三条是产品假设，不是已经验证的疗效。熟悉感是否成立、边界在哪里，仍然开放。

## 这是什么，不是什么

**它是：**

- 一个“缺席关系”的导演工具：把一句记忆、一张照片或一段录音，变成有节拍、有台词、有出处的一次相遇。
- 一个可插拔的渲染层：当前是程序场景；未来可以接 Genie 4 等生成式世界模型。
- 一个可追溯的记录系统：场景、人物、声音、表演、导演计划与捕获成片都有版本。

**它不是：**

- 不是数字复活，不声称与逝者真实沟通、传讯或“读取潜意识”。
- 不是无限聊天陪伴、社交网络或情感替代品。
- 不是治疗，也不承诺缓解哀伤。
- 不是写实克隆；不做长相、声音或人格的写实复刻。

## 一次相遇如何发生

```
一句记忆 / 照片 / 录音
        │
        ▼
导演层 DirectorPlan
行为线索 · 0–75 秒节拍 · 台词 · 分层提示词 · 隐私与出处
        │
        ▼
世界渲染器 WorldRenderer
procedural / captured / genie4（预留）
        │
        ▼
75 秒相遇 + episode 记录
manifest hash · 渲染器版本 · 捕获出处 · SynthID / 虚构标识
```

导演层决定“这次相遇发生什么”；渲染层只负责把它变成画面与声音。两者分开，意味着换世界模型时不需要重写产品逻辑。

非确定性渲染器不能靠 seed 重放，所以用 `CaptureProvenance` 保存成片、hash、模型、提示词与时间；旧 episode 仍然可以回看。

## 当前版本

| 部分 | 状态 |
| --- | --- |
| 可运行原型 | 六个程序场景、两个成人基础人物、八个动作、约 75 秒相遇 |
| 导演层 | `DirectorPlan` + `PromptPack` + 故事板导出 |
| 渲染层 | `WorldRenderer` 注册表；`procedural` / `captured` 可用，`genie4` 等待 API |
| 捕获与出处 | `CaptureProvenance` 写入 manifest；可回放有 URL 的捕获 |
| 同意与隐私 | 用途绑定 consent；真实照片/录音默认不上传；无同意参考帧会被拒绝 |
| 评估工具 | Rust `familiweave-ops`：6 个实验模板、9 项评分、实验日志校验 |
| Genie 4 | 客户端接口 + Rust 配置检查；没有网络调用 |
| 行为线索 | 27 条合成正/反例语料，覆盖等待、修理与否定/矛盾表达 |
| API 准备 | [Genie 4 开放检查清单](docs/api/genie-4-readiness.md) |
| 交付边界 | 2026-10-01 本地范围完成；真机、生产部署与量化音频验收未完成 |

可运行的是方向调整前的本地基线：程序场景、固定人物素材、骨骼动画与本地语音。新 episode 的 manifest 已记录 `rendererKind`、`directorPlan` 和可选的 `capture`；旧 episode 没有这些字段时按 `procedural` 播放。

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

当前内容为 **六个场景、两个人物、八个动作**。“拿起物件”包含拿起、停留和放回桌面；手部观感与全组合质量仍在完善。默认人物使用较小的纹理包，已有相遇绑定人物、场景、声音和表演版本，后续改动保留旧版本资源供回看。

## 技术栈

以 **TypeScript + Rust** 为主，按职责分工：

| 层 | 技术 |
| --- | --- |
| Web / 三维 | TypeScript、React、Vite、Three.js |
| API / 存储 | TypeScript、Fastify、PostgreSQL；本地开发使用 PGlite |
| 导演 / 分镜 / 业务类型 | TypeScript：`DirectorPlan`、`PromptPack`、`WorldRenderer`、manifest、consent |
| 文件与评估工具 | Rust：`familiweave-ops`（捕获 hash、实验日志校验、Genie 配置检查） |
| 模型与媒体 | Kokoro / Whisper / Silero（本地）、FFmpeg、libheif、sharp |
| 世界模型适配 | `genie4` 预留；未来 API/流式接入优先放在 Rust 侧 |

Rust 负责确定性强、文件型、无 UI 的操作；现有 Web/服务器代码不为了“换语言”而重写。等 Genie 4 API 明确后，捕获与流式适配可以继续放在 Rust 服务里。

## 隐私、伦理与边界

- **不做写实逝者克隆**：熟悉感来自行为线索与说话节奏，不追求长相或声音的写实复刻。
- **真实资料默认不出本机**：照片和录音默认不上传；只有用户明确同意时才允许进入云端生成流程，且只用于环境或布局参考。
- **不冒充真实逝者**：场景、身份和台词是创作；不声称已复原逝者的现状、记忆或传讯。生成内容保持“虚构 / AI 生成”标识。
- **不替代真实关系**：不制造“对方在等你”的推送或无限对话；不把使用时长当作成功指标。
- **不声称读懂潜意识**：即使未来做象征/梦境方向，也只提供可进入的空间，不做解释、诊断或记忆恢复。
- **当前验证边界**：以合成资料、本地浏览器和临时数据库为主；熟悉感效果尚无已验证的结论。
- **未完成项**：照片可见线索自动提取、生成式世界模型接入、真人体验与对照测试、手机真机验收、生产部署、可听清率与扬声器同步 P95 均未通过声明。
- **本地交付范围**：2026-10-01 本地项目交付完成；真机与部署已明确跳过，量化音频验收列为后续事项。完整范围与证据见 [本地交付决定](artifacts/acceptance/local-delivery-decision.md)。

## 本地运行

### 环境

- Node.js 22、pnpm 10.32.1。
- Rust stable（`cargo`；用于 `familiweave-ops` 的捕获 hash、实验校验与 Genie 配置检查）。
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

### 导演分镜

不调用任何世界模型，也可以把一句记忆导出为可评审的分镜与提示词：

```sh
pnpm storyboard --memory "他走路时总会回头等我"
pnpm storyboard --memory "他走路时总会回头等我" --json > storyboard.json
```

输出包含 0–75 秒节拍、台词、世界/人物/行为/声音/镜头/参考帧提示词、负面约束与隐私安全字段，不包含记忆原文。

### 评估日志

`docs/evaluation/experiments.md` 定义了 6 个生成实验与 9 项评分。记录后运行：

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

仓库包含 [GitHub Actions 检查](.github/workflows/ci.yml)：安装固定模型与媒体工具，使用 PostgreSQL 17 运行测试和构建；另有 [Rust 操作工具检查](.github/workflows/rust.yml)：运行 `cargo test`。自动检查覆盖工程行为，不替代动作观感、手机性能或真人效果评估。

正式 PostgreSQL 服务的环境配置、迁移、启动与回滚说明见 [部署文档](docs/deployment.md)。目前尚未完成面向公网的生产部署验证。

## 项目地图

- [`src/director.ts`](src/director.ts)：导演计划、分层提示词与隐私/同意字段。
- [`src/storyboard.ts`](src/storyboard.ts)：分镜数据与 Markdown 导出。
- [`src/world-renderer.ts`](src/world-renderer.ts)：`WorldRenderer`、`WorldRenderSession` 与能力声明。
- [`src/world-renderers.tsx`](src/world-renderers.tsx)：已注册渲染器（procedural / captured / 预留项）。
- [`src/capture.ts`](src/capture.ts)：捕获成片的出处与指纹。
- [`src/consent.ts`](src/consent.ts)：用途绑定的云端同意记录。
- [`src/genie/`](src/genie/)：Genie 4 适配器接口与未配置占位实现（不联网）。
- [`rust/`](rust/)：Rust workspace；`familiweave-ops` 负责捕获 hash、实验日志校验与 Genie 配置检查。
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

- **Phase 0（已完成）**：导演层、`WorldRenderer` 接口、manifest 接入、提示词/分镜、捕获 schema、同意记录、评估工具（Rust）、行为线索语料、Genie 适配器骨架与 API 清单。
- **Phase 1（拿到 API 访问后）**：实现 `GenieClient.createSession`，用 6 个生成实验回答人物连续、行为线索、台词、音频、交互与成本问题；通过后才把 `genie4` 改为可用。
- **Phase 2（验证通过）**：捕获回放、旧版本、删除、同意流程、成本模型与小样本体验测试。
- **Phase 3（备选）**：Marble、Reactor 托管模型或开源世界模型；如果 Genie 4 API 长期不开放，用捕获与替代渲染器维持迭代。

### 更远的一层：内在景观

“缺席关系”之外，同一套导演/渲染/捕获引擎还可以探索更象征、更联想的内在空间：反复出现的梦、地点、身体感觉与关系模式。

这是一条研究线，不是当前产品承诺；它不声称读取潜意识，不做解释、诊断或记忆恢复。如果推进，仍应保持有限、可退出、可自己解释。

## 研究问题

1. 行为与节奏是否足以产生“认出”的感觉，而不依赖长相或声音？
2. 有边界的 75 秒相遇，会让人更安心，还是更想念？
3. 可编辑、可删除、可追溯，是否会增加信任而不是破坏沉浸？
4. 谁受益、谁受伤？最近丧亲、长期哀伤、疏远关系、异地家庭可能完全不同。

这些问题没有答案前，Familiweave 更像一个研究型产品，而不是一项已经证明有效的服务。

## 参与

欢迎通过 Issues 讨论体验想法、报告可复现的问题，或提出动作、声音和场景改进。尽量附上浏览器与系统版本、复现步骤及预期表现，使用合成资料举例，避免在公开讨论中上传私人照片、录音或凭据。

## 发起方

Familiweave 由 **Inceptless 公司**发起。
