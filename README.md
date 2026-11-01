# Familiweave

**中文** | [English](README.en.md)

> 为前语言的内在经验，构建一个可进入、可退出、可自己解释的象征空间。
>
> A local-first symbolic interface for the pre-verbal layer.

![Familiweave 桌面外壳（英文界面）](docs/assets/desktop-shell-en.png)

Familiweave 由 **Inceptless** 发起，是一个关于**脑机接口与深层潜意识**的公开研究项目。

它不试图造一个“更懂心理学的聊天机器人”，也不声称能读取潜意识。它从一个更窄、更可验证的问题开始：

> 当语言还没形成时，身体、意象与关系模式能不能先被接住，并变成一段可以由本人完成的象征经验？

## 1. 为什么是脑机接口，而不是又一个聊天框

当 AI 接管了显性知识、逻辑推演、语言表达与外部执行，**“理性与语言”会通货膨胀**。人仍然会感到空虚、躯体紧绷，并在同一种关系泥潭里反复踏空；但这些经验往往先于语言：

- 胸口说不清的坠胀
- 反复出现的潮湿走廊
- 某个关系瞬间的身体冻结
- 事后才被命名的情绪

大语言模型建立在 Token 上；而内隐记忆、依恋反应与躯体感觉，更多是**前语言、联想性、情绪性**的。要求用户先“把感觉说清楚”，常常会把它压缩成“我很焦虑”这样的标签。

Familiweave 的方向不是替代语言，而是补上语言之前的入口：**身体定位、意象选择、关系触发、生理/声音信号，再到象征空间。**

## 2. 我们做什么

### 2.1 前语言捕获

- 身体地图：头、下颌、喉咙、肩、胸口、胃/腹、后背、手、腿
- 感觉、强度、呼吸
- 8 块抽象意象碎片，选择 1–3 块
- 可选 8 秒本机声音摘要（音量/停顿；不保存原始音频）
- 不做自由文本解释，不要求用户先命名

### 2.2 象征空间

把捕获变成 `InnerPlan`，再渲染成 75 秒相遇或 180 秒空间：

- 有门、走廊、水、房子、森林、车站、镜子或田野
- 有一个影子般的存在，或没有
- 可以靠近、停留、离开
- 不解释、不评分、不诊断

### 2.3 深层母题与关系

- **母题日记**：用户自己命名、自己保存、自己删除
- **关系触发点**：用户自己写下场景、瞬间、身体反应与自动反应
- 只做描述性计数，不推断对方、不做匹配、不做依恋分类
- 所有记录默认只在本机

### 2.4 BCI 信号层

- **BCI-1**：设备无关的 `SignalSource` 接口、LSL 风格模拟器、事件时间轴
- **BCI-2**：仅允许本机 WebSocket 桥接，接收 `hello/sample/samples` JSON
- 没有真实植入体、没有神经解码、没有临床声明
- 参考的是开放生态：OpenBCI、BrainFlow、LSL、MNE 等；Neuralink 目前公开的相关仓库主要是数据平台 `datarepo`，不是 N1 SDK

详见 [BCI 开源生态调研](docs/vision/bci-open-source-landscape.md)、[BCI-1](docs/vision/bci-1-signal-layer.md)、[BCI-2](docs/vision/bci-2-device-bridge.md)。

## 3. 当前原型

| 层 | 已实现 |
| --- | --- |
| v0 躯体捕获 | 身体地图 + 感觉/强度/呼吸 + 意象碎片 |
| v1 母题日记 | 本机命名、保存、删除、导出 |
| v2 关系触发点 | 自述场景/反应、地图、描述性计数 |
| v3 声音摘要 | 8 秒音量/停顿；显式同意；不保存原始音频 |
| BCI-1 | 信号源接口、模拟器、本机事件时间轴 |
| BCI-2 | 本机 WebSocket 设备桥接契约 |
| 桌面外壳 | Tauri 2 + Rust；SQLite 持久化；app data 文件沙箱 |
| 双语 | 中文 / English 界面切换 |
| 数据 | 本机 SQLite 或浏览器 localStorage；可导出/导入/删除 |

当前**没有**：

- 真实 BCI 硬件验收
- LSM 模型
- 自动关系推断
- 任何诊断、治疗或记忆恢复能力
- 临床或真人有效性证据

## 4. 架构

```text
身体 / 意象 / 关系 / 可选信号
        │
        ▼
SomaticCapture + SignalTrace
        │
        ▼
InnerPlan
母题 · 节拍 · 影子 · 空间/声音/光/镜头提示词 · 安全边界
        │
        ▼
EpisodePlan (kind: inner)
        │
        ▼
WorldRenderer（当前 symbolic；未来 Genie 4 等）
        │
        ▼
75s 相遇 / 180s 空间 + 本地记录
```

- `InnerPlan`：象征导演层。
- `EpisodePlan`：可追溯的计划信封。
- `WorldRenderer`：渲染器接缝；当前是本地 symbolic。
- `SomaticSignalSource` / `SignalTrace`：设备无关信号接缝。
- `CaptureProvenance`：非确定性成片的出处与指纹。
- Tauri Rust 宿主：文件沙箱、SQLite、打包；前端通过 `invoke` 访问。

## 5. BCI 与 LSM 路线

Familiweave 把 BCI 当作**可选的信号入口**，而不是产品前提。

| 阶段 | 内容 | 状态 |
| --- | --- | --- |
| BCI-0 | 本机声音摘要 + 自报 + 意象 | 已实现 |
| BCI-1 | 设备无关信号层 + LSL 模拟器 | 已实现 |
| BCI-2 | 本机 WebSocket 桥接 | 契约/UI 已实现；真实硬件未验收 |
| BCI-3 | 明确同意下的 OpenBCI/BrainFlow/LSL 研究 | 未开始 |
| LSM | 躯体—意象—关系的跨模态研究模型 | 方向，不是已训练模型 |
| 临床 | 与伦理/临床机构合作 | 未开始 |

**LSM 在这里是研究叙事，不是技术承诺。** 没有真实、同意、可删除的数据，就不应该谈“读懂潜意识”。

## 6. 深层潜意识怎么处理

我们不把“深层潜意识”当作可以被系统占有的对象，而当作**用户自己的、前语言的意义层**。

因此：

- 不解释：不提供梦的字典，不说“你其实是……”
- 不诊断：不是心理测试、治疗或医疗设备
- 不恢复记忆：不暗示压抑记忆，不制造虚假记忆
- 不评分：没有潜意识健康分、关系匹配分
- 不推断他人：关系触发点只画用户自己写下的部分
- 不制造依赖：没有 streak、没有“对方在等你”
- 意义归用户：系统只提供形式与开放问题

## 7. 隐私与边界

- 默认本地：没有服务端、没有账号、没有同步
- Tauri 下母题/关系触发点写入 SQLite；Web 预览回退 localStorage
- 声音只保存摘要，不保存可还原音频
- 数据可整体导出、导入、删除
- 强烈痛苦、自伤/他伤风险时，应停止体验并寻求现实支持
- 真实设备信号接入前必须完成同意、删除、断开与安全审查

## 8. 本地运行

环境：Node.js 22+、pnpm 10、Rust 工具链；macOS 上 Tauri 需要 Xcode Command Line Tools。

```sh
pnpm install
pnpm dev          # Web 预览
pnpm tauri:dev    # Tauri 2 桌面外壳
```

检查：

```sh
pnpm test
pnpm build
pnpm check:symbolic-path
pnpm rust:test
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
```

可选工具：

```sh
pnpm inner:storyboard --fragment "一条走廊尽头有一扇门" --format encounter
pnpm measure:browser
pnpm measure:browser:full
```

桌面构建：

```sh
pnpm tauri:build --bundles app
```

当前产物是 ad-hoc 签名的本机验证包；正式签名与公证需要 Apple 证书。

## 9. 项目地图

- [`src/somatic.ts`](src/somatic.ts)：身体部位、感觉、呼吸、意象碎片。
- [`src/somatic-entry.tsx`](src/somatic-entry.tsx)：v0 身体地图入口。
- [`src/inner.ts`](src/inner.ts)：`InnerPlan`、相遇/空间/捕获计划。
- [`src/symbolic-renderer.tsx`](src/symbolic-renderer.tsx)：75 秒相遇 / 180 秒空间。
- [`src/motif-journal.ts`](src/motif-journal.ts)：本机母题存储。
- [`src/relationship.ts`](src/relationship.ts)：用户自述关系触发点。
- [`src/signal-source.ts`](src/signal-source.ts)：BCI 信号层与 LSL 模拟器。
- [`src/device-signal-source.ts`](src/device-signal-source.ts)：本机设备桥接。
- [`src/local-store.ts`](src/local-store.ts)：SQLite / localStorage 快照。
- [`src/desktop-shell.tsx`](src/desktop-shell.tsx)：三栏工作台。
- [`src/i18n.tsx`](src/i18n.tsx)：中文/English。
- [`apps/desktop/src-tauri/`](apps/desktop/src-tauri/)：Tauri 2 Rust 宿主。
- [`docs/inner/`](docs/inner/)：形式、v0–v3、v0 捕获边界。
- [`docs/vision/`](docs/vision/)：BCI 生态、BCI-1/2、LSM/关系拓扑路线。
- [`docs/desktop-shell.md`](docs/desktop-shell.md)：桌面外壳、SQLite、签名边界。

## 10. 路线图

- **现在**：v0–v3 本机原型、BCI-1/2 接缝、Tauri 外壳、SQLite、双语。
- **下一步**：真实设备声音验收；真实 OpenBCI/LSL 桥接；Tauri 窗口目视验收。
- **研究**：在明确同意下做多模态小样本；先问信号与自报是否稳定对应，而不是先承诺疗效。
- **长期**：LSM 作为研究议程；关系拓扑只做用户自述；临床工作只在伦理与临床合作下进行。

## 11. 研究问题

1. 象征空间能否让前语言经验获得形式，而不被解释？
2. 当用户不用文字、只用身体与意象选择时，是否更接近“说不清”的东西？
3. 75 秒 / 180 秒的边界，会让人更安全，还是更疏离？
4. 多模态信号与自报之间，是否存在稳定、可复现的对应？
5. 谁适合、谁不适合？急性哀伤、创伤、焦虑或只是想玩的人，反应可能完全不同。

## 12. 许可证

Apache License 2.0。见 [LICENSE](LICENSE)。

## 13. 发起方

Familiweave 由 **Inceptless 公司**发起。
