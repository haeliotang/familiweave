# Familiweave（普通朋友）

> 用少量记忆，探索一个人变化之后，我们还能不能从行为与节奏里认出熟悉感。

Familiweave 是一个关于记忆、变化与相遇的公开探索项目，由 **Inceptless 公司**发起。

如果一个人的外貌、声音和生活环境都变了，我们还能从某个动作、说话的节奏，或一个小习惯里认出熟悉的感觉吗？

Familiweave 尝试把少量记忆变成一段可以安静观看、可交互的相遇：那个人在陌生的环境里过着自己的生活，偶尔回头、停下，或说一句话。你可以靠近看看，也可以随时离开。项目借用“转世、心续”的想象来探索这种体验；场景、身份和台词属于创作，不代表逝者真实的现状、记忆或传讯。熟悉感是否成立，仍是一个开放问题。

## 当前状态

| 部分 | 状态 |
| --- | --- |
| 本地原型 | 可运行：六个程序场景、两个成人基础人物、八个动作、约 75 秒相遇 |
| 导演层 | `DirectorPlan` 已接入：记忆 → 行为线索 → 节拍 → 台词 → 世界提示词 → 安全/出处 |
| 渲染层 | 可插拔 `WorldRenderer` 注册表；`procedural` 可用，`genie4` 等待 API，`marble` / `captured` 预留 |
| Genie 4 | 2026-10-27 发布的研究预览；无公开 API、模型 ID、价格或开发者档期；Project Genie 仍是 Genie 3 |
| 真实资料 | 默认不上传；只有明确同意时才允许进入云端生成，且只用于环境/布局参考 |
| 交付边界 | 2026-10-01 本地范围完成；真机、生产部署与量化音频验收未完成 |

当前可运行的是 **2026-10 方向调整前的本地基线**：程序场景、固定人物素材、骨骼动画与本地语音。新 episode 的 manifest 已经记录 `rendererKind` 与 `directorPlan`；旧 episode 没有这些字段时按 `procedural` 播放，不需要迁移。

## 核心设计

```
一句记忆 / 照片 / 录音
        │
        ▼
导演层 DirectorPlan
证据与线索 · 行为节拍 · 台词 · 世界提示词 · 隐私与出处
        │
        ▼
世界渲染器 WorldRenderer
procedural / genie4 / marble / captured
        │
        ▼
75 秒相遇 + episode 记录（版本、提示词、hash）
```

- **导演层是核心**：把少量输入变成可版本化的计划，而不是直接堆场景或堆模型。
- **渲染层可替换**：手工三维只是当前实现；Genie 4 等生成式世界模型可用时，接入新的 `Component` 并注册，不需要改 `SceneView`、manifest 或旧 episode。
- **可追溯**：每次相遇记录场景、人物、声音、表演与导演计划的版本；非确定性渲染器以捕获成片作为版本资产。

方向调整的调研、方案对比、Phase 0–3 路线图与验证评分表见 [世界模型方向调整](docs/direction/world-model-pivot-2026-10-31.md)。

## 现在可以体验什么

当前提供本地可运行的网页原型，已有：

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

## 隐私、伦理与边界

- **不做写实逝者克隆**：熟悉感来自行为线索（回头、等待、慢步、修理）与说话节奏，不追求长相或声音的写实复刻。
- **真实资料默认不出本机**：照片和录音默认不上传；只有用户明确同意时才允许进入云端生成流程，且只用于环境或布局参考。
- **不冒充真实逝者**：场景、身份和台词是创作；不声称已复原逝者的现状、记忆或传讯。生成内容保持“虚构/AI 生成”标识。
- **当前验证边界**：以合成资料、本地浏览器和临时数据库为主，覆盖资料处理、版本稳定性、会话隔离、删除、备份恢复与实际播放流程；熟悉感效果尚无已验证的结论。
- **未完成项**：照片可见线索自动提取、生成式世界模型接入、真人体验与对照测试、手机真机验收、生产部署、可听清率与扬声器同步 P95 均未通过声明。
- **本地交付范围**：2026-10-01 本地项目交付完成；真机与部署已明确跳过，量化音频验收列为后续事项。完整范围与证据见 [本地交付决定](artifacts/acceptance/local-delivery-decision.md)。

## 快速开始

### 环境

- Node.js 22、pnpm 10.32.1。
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

### 检查与构建

```sh
pnpm check:local
pnpm exec vitest run --maxWorkers=2
pnpm build
```

数据库集成测试需要单独设置 `TEST_DATABASE_URL`，未设置时对应测试会跳过。请使用可丢弃的测试数据库，测试会创建、修改和清理数据。

仓库包含 [GitHub Actions 检查](.github/workflows/ci.yml)：安装固定模型与媒体工具，使用 PostgreSQL 17 运行测试和构建。自动检查覆盖工程行为，不替代动作观感、手机性能或真人效果评估。

正式 PostgreSQL 服务的环境配置、迁移、启动与回滚说明见 [部署文档](docs/deployment.md)。目前尚未完成面向公网的生产部署验证。

## 项目结构

- [`src/director.ts`](src/director.ts)：把一句记忆变成可版本化、带隐私约束的导演计划。
- [`src/world-renderer.ts`](src/world-renderer.ts)：`WorldRenderer` 运行时接口与注册表。
- [`src/world-renderers.tsx`](src/world-renderers.tsx)：已注册的渲染器；`procedural` 可用，`genie4` / `marble` / `captured` 预留。
- [`src/`](src/)：页面、三维场景、人物表演、声音与播放控制。
- [`server/`](server/)：资料处理、匿名会话、准备任务、历史、删除和数据库迁移。
- [`scripts/`](scripts/)：模型安装、素材处理与本地验证工具。
- [`public/assets/`](public/assets/)：带版本的公开人物、动作与合成语音资源。
- [`docs/verification/`](docs/verification/)：验证过程、截图、发现的问题及其证据边界。
- [`docs/direction/`](docs/direction/)：2026-10 世界模型方向调整的调研、方案与验证计划。
- [`artifacts/acceptance/`](artifacts/acceptance/)：合成功能集与声音实验记录；包含历史阶段的审计结论。
- [最初的产品与技术开发文档](普通朋友_产品与技术开发文档_v0.1.md)：最初的体验设想与开发方案。

## 路线图

- **Phase 0（当前，无需 Genie 4 访问）**：导演层、`WorldRenderer` 接口、episode manifest 接入、验证评分表与隐私/伦理附录；停止新增手工三维资产。
- **Phase 1（拿到 API 访问后）**：接入 Genie 4 适配器，用 6 个生成实验回答人物稳定、行为线索、台词、音频、交互与成本问题，做 go/no-go。
- **Phase 2（验证通过）**：捕获/回放/旧版本/删除、同意流程、成本模型与小样本体验测试。
- **Phase 3（备选）**：Marble、Reactor 托管模型或开源世界模型；如果 Genie 4 API 长期不开放，用捕获与替代渲染器维持迭代。

## 实现与素材

| 用途 | 当前选择 |
| --- | --- |
| 网页与三维 | TypeScript、React、Vite、Three.js |
| 渲染层 | 可插拔 `WorldRenderer` 注册表；当前 `procedural`，`genie4` 预留但尚未接入 |
| 导演层 | `DirectorPlan`：记忆 → 行为线索 → 75 秒节拍 → 台词 → 世界提示词 → 安全/出处；记录进 episode manifest |
| API 与存储 | Fastify、PostgreSQL；本地开发使用 PGlite |
| 语音合成 | Kokoro multilingual，通过 sherpa-onnx 本地运行 |
| 语音识别 | Whisper tiny |
| 语音活动检测 | Silero VAD |
| 图片与音频处理 | sharp、FFmpeg、libheif |
| 人物、服装与动画 | Quaternius 免费 Standard 素材，附来源记录与 CC0-1.0 许可；2026-10 后不再新增手工资产 |

运行版本与模型指纹见 [依赖记录](dependency-lock.md) 和锁文件。第三方代码、模型与素材各自遵循其许可证；资源目录保留对应许可和来源，不能将素材许可证直接当作本项目全部源码的许可证。

## 参与

欢迎通过 Issues 讨论体验想法、报告可复现的问题，或提出动作、声音和场景改进。尽量附上浏览器与系统版本、复现步骤及预期表现，使用合成资料举例，避免在公开讨论中上传私人照片、录音或凭据。

这个仓库会继续记录实现、失败和修正。希望每一轮改动都让“相遇”更自然，也让我们更清楚：哪些熟悉来自材料，哪些来自创作，哪些仍需要继续探索。

## 发起方

Familiweave（普通朋友）由 **Inceptless 公司**发起。
