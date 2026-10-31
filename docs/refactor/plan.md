# 核心重构与性能计划

日期：2026-11-01。状态：计划，未开始执行。目标：后续开发只基于当前内在景观核心，把旧实现迁移为可删除的兼容层，并把性能变成可测量、可回归的约束。

## 1. 当前核心

- `InnerPlan`：母题、影子、75 秒节拍、空间/声音/光/镜头提示词、安全字段。
- `WorldRenderer`：可插拔渲染器；`symbolic` 是当前默认原型。
- `CaptureProvenance`：非确定性渲染的成片、hash、模型与时间。
- consent：用途绑定的云端同意；默认不上传。
- Rust `familiweave-ops`：捕获 hash/verify、实验日志校验、Genie 配置检查。

## 2. 旧实现清单（只读，不再扩展）

- `src/director.ts` / `src/storyboard.ts` / `src/cue.ts` / `src/cue-cases.ts`：缺席关系的计划与线索。
- `src/scene.tsx` / `src/character-timeline.ts` / 六个程序场景与固定人物资产：旧三维渲染路径。
- `src/main.tsx` 中仍存在的旧方向文案、反馈、纠正、历史入口。
- `docs/direction/`、`docs/verification/`、`artifacts/acceptance/`：历史研究/验收记录，不再作为 README 主线。

这些代码暂时保留以维持兼容与回退，但**不再新增功能**。

## 3. 重构原则

1. **核心优先**：任何新功能先落到 `InnerPlan` / `WorldRenderer` / capture / consent / Rust ops，不允许在旧模块里另起分支。
2. **适配器隔离**：旧三维路径只通过 `procedural` 渲染器适配器存在；UI 不直接依赖 `DirectorPlan` 或 `CharacterTimeline`。
3. **数据单向迁移**：新 episode 记录 `innerPlan`；旧字段只读；需要回放时在读取层转换，不反向写回。
4. **删除优先**：每完成一次迁移，删除对应分支、文案、测试或资源引用；不以“以后可能用到”保留死代码。
5. **性能可测**：每阶段记录首屏、主包大小、场景分包、75 秒稳定性、捕获 hash 时间；没有测量就不写“更快”。

## 4. 阶段

### Phase R0：冻结与基线（已完成基础部分）

- 冻结旧模块，不新增功能。
- 已记录 `pnpm build` 的主包/场景包大小：见 [R0 构建基线](baseline.md)。
- 已确认 scene 分包未在 `index.html` 预加载。
- 剩余：symbolic 浏览器首屏与 75/180 秒稳定性实测。

### Phase R1：计划与 manifest 统一（基础部分已落地）

- 已引入 `EpisodePlan` 信封（`kind: 'inner' | 'procedural'`），manifest 写入 `plan`。
- `fromApi` 优先读取 `plan`；旧 `directorPlan` / `innerPlan` 在读取层转换为信封，旧字段仍可读。
- 服务端新建 procedural episode 已只写 `plan`；旧 `directorPlan` 仅在读取层兼容。
- 测试：新 episode、旧 episode、inner plan 映射。
- 剩余：inner 服务端写入路径；旧字段最终删除（R4）。

### Phase R2：渲染器与 UI 收口（已完成）

- 首页默认是内在景观输入：写下画面/感觉，选择相遇或空间，直接进入；旧三维输入已删除。
- `symbolic` 成为默认入口；`procedural` 只作为兼容渲染器。
- 已移除视图中的反馈、纠正、线索、撤回与旧方向 footer 分支；统一为“返回 / 重新进入·重新观看”。
- 主入口从 281,425 B 降到 277,079 B（−4,346 B）。
- 已删除兼容入口、旧资料准备 UI 组件与旧视图状态；前端现在是纯象征空间入口（主包 242,388 B）。

### Phase R3：性能（守卫与首轮浏览器基线已落地）

- 已新增 `pnpm check:symbolic-path`：检查 scene 分包未预加载、主入口不超过 320,000 字节；当前通过。
- 已新增 `pnpm measure:browser`：本地 headless Chrome 记录首屏与 2 秒帧采样；结果见 [R0 构建基线](baseline.md)。
- 确认 symbolic 路径不加载 Three.js、不下载模型、不初始化音频。
- 已完成本地 headless 完整 75 秒相遇与 180 秒空间帧采样；真实设备、生产构建与交互压力仍未验证。
- 主包拆分：`InnerPlan`/symbolic 与旧三维渲染器分包；旧资源按需加载。
- 资产与模型缓存策略；Rust capture hash 用于大文件时避免 Node 重复读取。
- 记录基线并设预算：首屏 JS、场景分包、75 秒内帧稳定性、捕获 hash 时间。具体数值以测量结果为准，不在计划里伪造。

### Phase R4：清理（进行中）

- 已删除 `feedback` / `evidence-correction`、旧资料准备 UI 组件与旧历史/反馈/纠正状态。
- `main.tsx` 已重写为纯象征空间入口，不再连接服务端资料准备流程。
- 剩余：旧场景/人物资产、旧 director/storyboard/cue 模块、旧服务端资料准备与相关测试；更新项目地图只保留当前核心。

## 5. 性能测量项

| 项 | 方法 | 约束 |
| --- | --- | --- |
| 主包大小 | `pnpm build` 输出 | 不因新功能无限增长；超出预算需说明 |
| symbolic 首屏 | 本地浏览器 Performance 面板 | 不加载 Three.js / 模型 |
| 75 秒稳定 | 观察帧间隔与交互响应 | 不出现明显冻结；未测不宣称 |
| 捕获 hash | Rust `capture-hash` | 大文件流式读取，不一次性进内存 |
| 旧路径回放 | 历史 episode | 只读兼容，不阻塞新主链 |

## 6. 验证

```sh
pnpm exec vitest run --maxWorkers=2
pnpm build
pnpm rust:test
pnpm eval:validate docs/evaluation/experiment-log.example.json
```

已知限制：本机缺少 `heif-convert` 时 4 项 HEIC 环境测试失败；主 CI 仍受上游 Kokoro 包校验变化影响；这些不是重构完成标准，但需要在发布前单独处理。
