# 开发方向调整：从手工建模转向「导演 + 生成式世界模型」

日期：2026-10-31。状态：方向已确认（2026-10-31）：不做写实逝者克隆；等待 Genie 4 API 开放；隐私默认不上传真实照片/录音，仅在明确同意下上传。本文件只调整研发方向与验证计划；不改变 2026-10-01 本地交付决定的结论，也不声称任何尚未取得的访问、价格或效果。

## 摘要

1. 「靠手工建模太传统」的判断成立。当前六个程序场景、两个基础人物、八个动作依赖固定素材库、重定向和手工编排，迭代慢、近景表演上限低，离「像一个真实的人住在那里」还有明显距离。
2. Google DeepMind 于 2026-10-27 发布 **Genie 4**：实时、可交互、照片级的世界生成，首次原生生成环境声、音乐和即兴对话；多家上手报道称单次连贯约 2 分钟、约 24fps（官方未公布正式规格）。这个时长正好覆盖本项目的 75 秒相遇。
3. 但 Genie 4 目前**没有公开 API、模型 ID、价格和开发者档期**，只有研究预览与等待名单；消费者入口是 Google AI Ultra 订阅里的 Project Genie（尼泊尔可订阅 Ultra，$99.99/月起，但当前 Project Genie 还是 Genie 3）。身份一致性、台词可控性、云端隐私、成本都未解决。
4. 因此建议的调整不是「推翻重做」，而是：**把手工 3D 渲染降级为可插拔 fallback，把「导演层」升级为核心资产**——记忆与证据、行为线索、75 秒节拍、台词与节奏、世界规格、出处与安全约束。Genie 4 可用时用它渲染；不可用时当前本地原型仍能跑。
5. 推荐路线：**双轨 + 可插拔渲染器**。立即做 Phase 0 的免费/本地部分：申请等待名单、冻结现有基线、抽出渲染器接口、搭导演提示管线并准备验证评分表；拿到 API 访问后再做 go/no-go。

## 已确认的决定（2026-10-31）

- **不做写实逝者克隆**：熟悉感只来自行为线索（回头、等待、慢步、修理）与说话节奏，不追求长相或声音的写实复刻。
- **访问策略**：只申请免费等待名单，等待 Genie 4 API / AI Studio 早期访问开放；**暂不订阅 Ultra、暂不做付费生成式样片**。
- **隐私默认**：真实照片/录音默认不上传云端；只有用户明确同意时才允许上传，且只用于环境/布局参考，不用于人物克隆。
- **待定**：是否保留 procedural 3D 作为离线 fallback（建议保留）；目标形态与时间窗口；Phase 0 代码改造的启动时间。

## 一、Genie 4 调研

### 1.1 能做什么

- **实时交互世界**：键盘控制移动与视角，自然语言实时改变天气、镜头、人物与物体；输入间隙世界继续演进。
- **人**：自然移动、对环境作出反应、可实时操控的角色；微表情与镜面反射等细节明显提升。
- **原生音频**：环境声、音乐和角色对话与画面对齐生成；角色会根据用户输入或场景事件即兴对话。
- **参考图**：可用一张参考图作为世界的第一帧；生成的是世界外观，不等于锁定某个人的长相或声音。
- **多步事件**：Gemini 3.8 Flash 在回路里拆步骤、看画面、验证并重规划；Gemini 4 Argon 可把复杂任务拆成细动作，驱动 Genie 4 渲染。
- **受信任测试者的用法**：影视团队把它当实时的「草稿模式」，在同一场景里连续试拍并调整机位、灯光、台词与动作；新闻摄影用一张档案照片变成可走动的环境模拟；游戏团队用它从想法直接到可探索原型。
- **混合世界模型**：Google 自己把方向描述为「Gemini 规划结构与叙事时间线，Genie 渲染即时的物理现实」——这正是本文件推荐的「导演 + 渲染器」分工。
- **时长与帧率**：Google 官方模型页称可维持「几分钟的连续交互」而非长时间会话；截至 2026-10-29 没有公布分辨率、fps、延迟或评测数据。Genie 3 为 720p/24fps；测试者称世界创建通常少于 30 秒、画面约 24fps（偶有掉到 17fps）、单次连贯约 2 分钟（媒体报道）。
- **安全与溯源**：研究预览先给受信任测试者；所有生成视频与音频带 SynthID 水印；Google 称有与其它模型一致的安全护栏。

### 1.2 怎么用上、要多少钱

- 当前：**研究预览**，面向影视、新闻、教育、游戏、工程等受信任测试者；消费者与开发者访问尚未开放。
- 消费者路径：Google AI Ultra 订阅中的 **Project Genie**（18+），需申请等待名单。**尼泊尔在 Google 官方的 Pro/Ultra 与 Project Genie 支持列表中**；Gemini 订阅页显示 Ultra 起价 **$99.99/月**（5x 用量）或 **$199.99/月**（20x），并把 Project Genie 列为 Ultra 功能；Project Genie 当前仍是 **Genie 3**，Genie 4 尚未上线。App Store 内购地区列表可能不同，实际购买前以网页结账页为准。
- Project Genie（Genie 3 阶段）已记录的交互问题：输入延迟、角色反向跑动、偶发失去控制、画面变暗、世界与输入图不一致。这些是上一代问题，不能直接推断 Genie 4，但说明交互稳定性仍是风险。
- 开发者路径：Google 称将向 **Gemini API / Google AI Studio 早期访问合作伙伴**开放，但没有申请表单、日期、模型 ID、价格或配额；截至 2026-10-29 没有公开 API 文档。
- 已确认可用：Gemini API 与 AI Studio 的官方区域列表包含**尼泊尔**（2026-10-22 更新）；因此导演层的 Gemini 3.8 Flash 规划/验证可以立刻开发，`gemini-3.8-flash` 有免费层，付费价约 $0.75/百万输入 token、$3.75/百万输出 token（2026-12-31 前）。
- 所有 Genie 4 视频与音频带 **SynthID** 水印。

### 1.3 明确限制（Google 自己的措辞）

- 官方措辞：环境只在**短会话**内保持连贯；画面细节与物体恒常性会随时间推移、多次复杂提示词编辑或场景内导航而**偏移或漂移**。
- 复杂物理交互、实时音频准确性、画面文字可读性、空间准确性、长期一致性仍在研究中；官方称文字只有在输入描述里才可能清晰，真实地点不保证准确。
- 角色可以「被实时操控」，但没有公开证据表明能锁定特定人物的长相、声音或行为习惯；参考图是「世界第一帧」，不是身份克隆。
- 对话是即兴生成；能否用提示词稳定说出指定台词、指定语言与指定语气，未经验证。
- 非确定性输出；没有公开的 seed、导出、音频分轨或回放接口（Project Genie 是消费级界面）。
- 截至 2026-10-31 没有公开的独立 Genie 4 上手评测，只有 Google 演示与受信任测试者片段。
- 数据与训练：Google Labs 的隐私说明称交互与输出会用于改进和开发 Google 产品与机器学习（含训练）、可能人工审核、默认最多保存 18 个月；Workspace 账户不用于训练。Genie 4 的测试者/API 条款尚未公布。
- 内容政策：Google 生成式 AI 禁止使用政策涵盖未经披露地冒充生者或逝者、未经同意的隐私与生物特征信息等；Project Genie 称对上传的人物照片有保护措施，但没有公开专用的 Genie 4 人脸/声音克隆规则。
- 安全与溯源：研究预览先给受信任测试者；所有生成视频与音频带 SynthID 水印。

### 1.4 对 Familiweave 意味着什么

| 项目需求 | Genie 4 现状 | 判断与动作 |
| --- | --- | --- |
| 75 秒安静相遇 | 约 2 分钟连贯窗口 | 时长匹配；需实测 75 秒内的漂移与人物稳定 |
| 熟悉感来自行为线索（回头、等待、慢步、修理） | 可用提示词引导，但不保证稳定复现 | 最高优先级验证项；设计节拍提示词并多次采样 |
| 台词有来源、不编造具体往事 | 对话即兴，难以逐字控制 | 高风险；需实验「提示词锁定台词」「外部 TTS 替换」「只保留开放台词」三条路线 |
| 语速与停顿来自参考录音 | 无公开音频输入/分轨控制 | 可能失去现有节奏迁移能力；评估是否保留本地语音层 |
| 特定人物形象 | 无身份锁定证据 | 产品本来就允许形象变化；建议**不做写实逝者克隆**，把熟悉感放在行为与节奏 |
| 本地可运行、私人资料不出本机 | 纯云端 | 需隐私分层：真实照片/录音默认不上传；用合成或风格化参考图 |
| 可追溯、可回放、可删除 | 非确定性；消费级界面 | 以「生成后录制 + 提示词/模型/时间/水印」作为新的出处记录 |
| 可复现的旧版本 | 无 seed/版本 API | 以捕获的成片作为 episode 资产，保留旧片可回看 |
| 成本 | Ultra 订阅 + 未知 API/生成成本 | 先做成本模型，不承诺免费或低成本 |

## 二、横向对比

| 方案 | 形态 | 访问 | 音频 | 控制 | 本地/硬件 | 许可与成本 | 对本项目的适配度 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Genie 4** | 实时交互视频世界，原生音视频 | 研究预览/等待名单；Ultra 与早期 API 伙伴 | 环境声、音乐、对话 | 键盘 + 文本 + 参考图 | 云端 | 未公布；Ultra $99.99/$199.99 每月 | 目标上限最高；当前不可用；身份/台词不可控 |
| **Project Genie（Genie 3）** | 交互世界，照片或提示词创建 | Ultra 18+，140+ 国家，等待名单 | 无原生音频 | 键盘 + 文本 | 云端 | 含在 Ultra；单次约 60 秒 | 今天可手动上手的高质量方案；有输入延迟、反向跑等已知问题 |
| **Matrix-Game 4.0** | 游戏引擎 + 流式神经渲染（混合） | 开源代码与权重 | 无模型音频 | 引擎 WASD/鼠标；固定三场景 | Linux + NVIDIA；864×480，60fps RTX 5090 | Apache-2.0；云 GPU 租金 | 可控但场景固定；Mac 不能跑 |
| **HY-World 1.5（WorldPlay）** | 流式视频扩散世界 | 开源权重 + 在线体验 | 无 | 键盘/鼠标动作 | NVIDIA 28–72GB；480p 24fps | 腾讯社区许可：排除欧盟/英国/韩国，尼泊尔在内，≤1M MAU | 长时几何一致；工程与硬件门槛高 |
| **LingBot-World 2（Reactor 托管）** | 实时生成世界 | Reactor API（有免费起始额度） | 无 | WASD + 相机 + 提示词 | 云端；1664×960@48fps | 约 $0.42/分钟（75 秒约 $0.53）；自重部署为非商用许可 | 便宜、今天可用；无音频、不是剧情编排 |
| **Marble（World Labs）** | 生成可探索 3D 世界，导出 splat/mesh/collider | 网页 + API；免费层 | 无 | 探索 + Chisel 编辑 | 导出后可在 Three.js/Spark 播放 | 免费约 4 个世界/月且不可导出/商用；Pro $35/月含商用与导出；API 约 $1.20/世界 | 环境资产与确定性回放最佳；人物表演仍需自建 |
| **Runway GWM Worlds 2** | 实时交互视频 + 48kHz 音频/唇形 | 研究预览/等待名单；无公开 API | 原生音频与语音 | 文本动作 + 相机 | 云端 | 未公布 | 最接近 Genie 4 的备选；规格来自第三方，待验证 |
| **Decart Oasis 3** | 实时世界模型 | 公开 API/SDK | 无 | 交互控制 | 云端；<200ms | $0.02/秒（75 秒约 $1.50） | 便宜、可编程；非叙事、无音频 |
| **Odyssey** | 实时世界模型，物理表现强 | API/私有 beta | 无 | 交互控制 | 云端 | 未公布 | 物理最好；无音频、无公开价格 |
| **当前 procedural 3D** | 手工场景 + 骨骼动画 + 本地语音 | 本地 | 脚本化 TTS/环境声 | 预设观看位置 | 是 | 已有 | 本地/离线/隐私 fallback 与对照基线 |

> 说明：Genie 4 的 2 分钟/24fps、Ultra 价格、Marble/Reactor 计费等来自媒体报道、第三方整理或 API 文档，最终以官方页面为准；本项目尚未取得 Genie 4 实测。没有公开的 Genie 4 与上述方案的横向基准；WorldMark 等基准早于 Genie 4，不能替代实测。

### 2.1 现在就能做的生成式实验（不依赖 Genie 4 访问）

> 已确认决定：**等 Genie 4 API 开放，暂不投入付费实验**。以下方案保留为备选，预算或访问策略变化时可启动。

如果不想空等 Genie 4，可以用现有预算先验证「导演层 + 生成式画面」是否成立：

1. **Marble Pro（$35/月）**：生成环境并导出 splat/mesh，接到现有 Three.js/Spark 播放器；确定性、可回放、无音频，人物仍用现有人物/动画。这是环境层的生成式升级，不是最终方向。
2. **Reactor + LingBot-World 2（约 $0.42/分钟）**：录一段 75 秒生成世界作为背景/分镜参考；它能验证「生成式世界的观感 + 导演节拍」是否协调，但只有 WASD 导航、没有剧情编排与语音。
3. **Decart Oasis 3（$0.02/秒）**：测试 API 延迟与交互控制；无音频，偏驾驶/物理场景。
4. **不要在 Mac 上自托管开源世界模型**：全部需要 NVIDIA CUDA，没有 Apple Silicon 路径；租用 A100/RTX 5090/H100 按小时计费，HY-World 权重约 190GB，环境准备本身就是成本。
5. **音频缺口**：开源与托管替代方案普遍不生成语音；在 Genie 4 可用前，台词与环境声仍需本地 TTS/录制方案补齐。

## 三、方向选项

- **A. 全量押注 Genie 4**：等访问开放后重写渲染层与交互。上限最高，但当前无 API、无日期、无价格，身份/台词/隐私未验证，且会失去本地可运行能力。不建议作为唯一路线。
- **B. 导演层 + 可插拔渲染器（推荐）**：现在抽接口；先用当前 procedural 渲染器跑通新导演层；Genie 4/Project Genie/Marble/Reactor 托管模型都作为可替换后端。风险最低、迁移成本可控，也符合 Google 自己「Gemini 规划 + Genie 渲染」的混合架构。预算允许时先做 2.1 的两个生成式样片。
- **C. 开源世界模型优先**：Matrix-Game 4.0 / HY-World 1.5，租云 GPU 先跑起来。可立即动手、无等待，但全部需要 NVIDIA、无原生音频、场景与控制受限、工程量大；适合作为并行实验，不作为产品主线。
- **D. 生成式 3D 环境过渡**：用 Marble（需 Pro 才有商用与导出）生成场景，保留现有人物、动作与语音。环境升级最快，但人物表演仍是手工/重定向，不能解决「建模太传统」的核心问题。可作为 Phase 0/1 的桥。

**推荐：B 为主；先用 2.1 的低成本生成式实验验证观感，再决定是否投入 A/C；D 只作为过渡。**

## 四、目标架构

```
记忆/照片/录音（私有）
        │
        ▼
┌───────────────────────────────┐
│ 导演层 Director（本地/私有）   │
│ 证据与线索 → 行为节拍 → 台词/  │
│ 节奏 → 世界规格 → 安全/出处    │
└───────────────┬───────────────┘
                │ DirectorPlan（可版本化）
                ▼
┌───────────────────────────────┐
│ 世界渲染器 WorldRenderer       │
│ procedural / genie4 / genie3 / │
│ marble / captured / 开源模型   │
└───────────────┬───────────────┘
                │ 画面 + 音频 + 状态
                ▼
┌───────────────────────────────┐
│ 捕获与回放 EpisodeArtifact     │
│ 成片/分段、提示词、模型版本、  │
│ 时间、SynthID、manifest hash   │
└───────────────┬───────────────┘
                ▼
        观看、靠近、坐下、离开
        纠正、反馈、删除、回看
```

### 4.1 需要新增/调整的契约

- `RendererKind`：`procedural | genie4 | genie3 | marble | captured | open-source`。
- `DirectorPlan`：记忆证据、线索、节拍（0–75 秒）、台词计划、节奏计划、镜头/交互建议、世界提示词、参考图策略、安全与出处字段。
- `WorldRenderer`（已落地为运行时注册表）：`kind / label / status / validate / Component`；Genie 适配器后续可在此基础上增加流式会话（`start / input / frames / audio / capture`）。
- `EpisodeArtifact`：渲染器与模型版本、提示词、捕获文件/分段、SynthID、生成时间、审核状态、旧版本保留。
- 现有 `Encounter`/manifest 保留；新增渲染器与捕获字段，旧 episode 继续按 `procedural` 解析。**不在没有迁移测试的情况下删除现有版本字段。**

### 4.2 可先落地的「无 API」适配

Genie 4 没有 API 时，先做 **operator-assisted** 适配：导演层生成世界提示词与参考帧 → 人工在 Project Genie 运行 → 录屏/录音 → 上传为 `captured` episode。这样在等待 API 期间就能验证体验，而不是空等。

## 五、路线图

### Phase 0：现在–约 2 周（不需要 Genie 4 访问）

当前进展（2026-10-31）：已新增 `src/director.ts` / `src/cue.ts` 与测试，定义 `DirectorPlan` / `RendererKind` / 安全字段（默认不上传、无写实克隆、`user_photo` 无明确同意会被拒绝）；新增 `src/world-renderer.ts` + `src/world-renderers.tsx` 运行时注册表（`procedural` 可用，`genie4` 标记为等待 API，`marble` / `captured` 预留）；manifest 与客户端 `Encounter` 已带 `rendererKind` / `directorPlan`，`SceneView` 按注册表分发并执行 procedural 版本校验，字幕读取已记录的导演台词；旧 episode 无字段时按 procedural 处理。尚未接入真实 Genie/其他渲染器。构建、相关测试与既有准备/发布测试通过。

1. 免费申请 Genie 4 / Project Genie 等待名单；按已确认决定，**暂不订阅 Ultra、不做付费样片**，持续监控 Gemini API / AI Studio 的早期访问入口。
2. 冻结当前版本为 `v0.1-local` 基线（提交/打标签），保留可运行 fallback；**停止新增手工场景/人物/动作资产**，现有资产只作为 fallback 与对照基线。
3. 抽出 `RendererKind` / `WorldRenderer` 接口与当前 procedural 适配器；现有测试保持全绿。
4. 搭建导演提示管线：一句记忆 → 节拍 + 台词 + 世界提示词 + 参考帧策略；先用本地确定性实现，接入 Gemini 3.8 Flash 只作为可选增强。
5. **暂缓（等 API 或另行批准预算）**：Marble Pro 环境样片与 Reactor/LingBot 75 秒样片；保留为预算变化时的备选。
6. 写 9 项验证评分表（见第六节）；先用 procedural 渲染器做「提示词→分镜」纸上验证。
7. 更新隐私与伦理附录：默认不上传真实照片/录音；只有明确同意才允许上传；不做写实逝者克隆。

### Phase 1：拿到访问后（Project Genie/Ultra 或 API）

1. 跑 6 个生成实验（每个至少 3 次采样），按 9 项评分表记录提示词、版本与失败模式。
2. 重点回答：75 秒内人物是否稳定；行为线索能否复现；指定台词能否说出；音频是否可接受；交互是否可用；成本与时长。
3. 形成 go/no-go 结论：若核心线索不可复现，退回 B 的 procedural 主线或等 API；若可用，进入 Phase 2。

### Phase 2：产品化（go 之后）

1. 导演层 → Genie 4 的正式管线（API 或 operator 流程）。
2. 捕获/回放/旧版本/删除/纠正；SynthID 与「AI 生成/虚构」标识。
3. 隐私分层与同意流程；成本模型；10 人小样本体验测试。
4. 保留 procedural 作为离线/隐私/降级模式。

### Phase 3：备选与并行

- Marble（Pro 才有商用与导出）：生成环境，保留现有人物/音频，做视觉升级桥。
- Matrix-Game 4.0 / HY-World 1.5：云 GPU 实验，评估无音频条件下的可用性；两者都没有 Mac 路径。
- Reactor 托管的 LingBot-World 2 / Decart Oasis 3：按分钟计费的低成本生成式实验，适合验证交互与观感，不适合作为叙事主线。
- 如果 Genie 4 API 长期不开放：以 operator 捕获 + Marble/Reactor 组合维持体验更新。

## 六、验证评分表（Phase 1 必须回答）

| 编号 | 指标 | 方法 | 通过标准（建议，待定） |
| --- | --- | --- | --- |
| E1 | 熟悉感线索 | 3 个线索 × 3 次采样 | 至少 2/3 次能稳定看出「回头等」「慢下脚步」「修理」之一 |
| E2 | 人物连续 | 75 秒内多视角观察 | 不出现换脸、肢体崩坏、突然换声；可接受的风格变化由产品定义 |
| E3 | 台词来源 | 提示词锁定 vs 即兴 | 不编造用户未提供的具体往事；指定台词可复现或明确降级为开放对话 |
| E4 | 音频 | 环境声/对话/同步 | 对话可听清；与画面无明显不同步；可接受的水印与混音 |
| E5 | 世界连贯 | 75 秒 + 靠近/坐下/转身 | 无穿地、浮空、明显漂移；交互后能恢复 |
| E6 | 交互 | 键盘/文本控制 | 能完成靠近、坐下、离开；不出现失控或卡死 |
| E7 | 出处与回放 | 捕获与重放 | 提示词/模型/时间/水印可追溯；成片可回看与删除 |
| E8 | 隐私与伦理 | 资料流向审查 | 真实照片/录音默认不出本机；有同意、删除、虚构标识 |
| E9 | 成本与时长 | 每次生成记录 | 可估算单次相遇成本与准备时间，写清未测量项 |

## 七、风险与未决问题

- **访问风险**：Genie 4 可能长期停留在研究预览；无 API 就无法产品化。缓解：等待名单 + operator 捕获 + 备选渲染器。
- **基准风险**：Genie 4 没有公开量化基准，所有「对比」都是定性；WorldMark 等基准早于 Genie 4，且发现视觉质量与控制响应存在负相关（ρ≈−0.82）。必须用本项目自己的评分表实测，不能用演示代替。
- **身份风险**：无法锁定特定人物；写实生成逝者形象可能造成误导或不适。建议产品坚持「形象可变、行为熟悉」的既有立场，不做写实克隆。
- **台词风险**：即兴对话可能违背「来源可追溯」；需要实验或保留本地语音层。开源与托管替代方案普遍不生成语音，音频是 Genie 4 目前唯一真正的独占能力。
- **隐私风险**：云端生成与「本地私有」冲突；Google Labs 说明交互与输出会用于改进/训练、可能人工审核、默认最多保存 18 个月。需要明确的同意与不上传默认。
- **复现风险**：非确定性使旧 episode 不能重跑；以捕获成片作为版本资产。
- **成本风险**：Ultra 订阅（$99.99/$199.99 每月）与 API 计价未知；Marble Pro $35、Reactor 按分钟、云 GPU 按小时；先做上限预算与降级方案。
- **许可风险**：Genie 4 输出商用条款与 SynthID 未公布；HY-World 排除欧盟/英国/韩国；LingBot 权重为非商用；Marble 免费层不可商用/导出。
- **工程风险**：渲染器抽象会增加一层复杂度；用接口测试与旧 episode 回归控制。

## 八、已确认与待确认

**已确认（2026-10-31）**

1. 不做写实逝者克隆；熟悉感放在行为与节奏上。
2. 等待 Genie 4 API / AI Studio 访问开放；暂不订阅 Ultra、暂不做付费生成式样片。
3. 隐私默认：真实照片/录音不上传；只有明确同意时才上传，且只用于环境/布局参考。

**仍待确认**

1. 是否保留当前 procedural 3D 作为本地/离线 fallback（建议保留）。
2. 目标是什么：研究演示、可邀请试用，还是可发布产品？时间窗口？
3. 是否在等待 API 期间继续细化导演层（更细的节拍、提示词模板、额外的隐私/安全回归），还是保持当前最小实现。

## 参考资料

- [Genie 4 官方发布](https://deepmind.google/blog/genie-4-a-new-generation-of-world-simulation/)（Google DeepMind，2026-10-27）
- [Genie 模型页](https://deepmind.google/models/genie/)
- [Project Genie 官方介绍](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/project-genie/)
- [Genie 4 上手与限制整理（TestingCatalog）](https://www.testingcatalog.com/icymi-google-deepmind-previews-genie-4-with-native-audio/)
- [Genie 4 功能与访问整理（Apidog）](https://apidog.com/blog/google-genie-4/)
- [Genie 4 API 访问现状（APIdog）](https://apidog.com/blog/genie-4-api/)
- [Project Genie 是否免费与价格（DEV/APIdog）](https://dev.to/hassann/is-project-genie-free-genie-4-access-cost-and-every-free-option-1lg9)
- [Project Genie 照片/提示词创建世界（Ars Technica，2026-01）](https://arstechnica.com/google/2026/01/google-project-genie-lets-you-create-interactive-worlds-from-a-photo-or-prompt/)
- [Gemini API / AI Studio 可用区域（含尼泊尔）](https://ai.google.dev/gemini-api/docs/available-regions)
- [Gemini API 价格](https://ai.google.dev/gemini-api/docs/pricing)
- [Gemini Apps 计划与 Ultra 支持国家](https://support.google.com/gemini/answer/16275805)
- [Project Genie 已知交互问题（Genie 3 阶段）](https://support.google.com/labs/answer/16875695)
- [Google Labs 隐私说明（训练/保留）](https://labs.google/fx/privacy)
- [Google 生成式 AI 禁止使用政策](https://policies.google.com/terms/generative-ai/use-policy)
- [Genie 4 等待名单](https://forms.gle/WQnSNEM3omF7Uruu7)
- [Matrix-Game 4.0（Apache-2.0，开源权重）](https://github.com/SkyworkAI/Matrix-Game)
- [HY-World 1.5 / WorldPlay（社区许可）](https://huggingface.co/tencent/HY-WorldPlay)
- [Marble 文档与计费](https://docs.worldlabs.ai/marble/support/account-billing)
- [Marble API 价格](https://docs.worldlabs.ai/api/pricing)
- [Reactor 实时模型托管价格（LingBot 等）](https://api.reactor.inc/pricing)
- [Decart Oasis 3 定价](https://docs.platform.decart.ai/getting-started/pricing)
- [WorldMark 世界模型控制/记忆/质量基准](https://alayalab.github.io/WorldMark/)
- [Runway GWM Worlds 2](https://runway.com/research/introducing-gwm-worlds-2)
- [Project Genie 网页入口](https://labs.google/projectgenie)
