# 项目进度对齐（2026-10-31）

对象：`main` `f971dc0`。改动前工作区干净，且与 `origin/main` 同步。本次只做状态核对与整理，不重新声明交付或验收结论。

## 远端与自动检查

- GitHub 仓库现名为 `haeliotang/familiweave`（原 `familiar` 地址会重定向）。本次已把本地 `origin` 改为新地址，并同步更新 README 的克隆命令；历史验证文档中的旧链接保留，仍可重定向访问。
- 当前提交 `f971dc0` 的 GitHub Actions 运行 [37111433064](https://github.com/haeliotang/familiweave/actions/runs/37111433064)（2026-10-03）全部步骤成功，包含 `pnpm check:local`、`vitest`（PostgreSQL 17）与 `pnpm build`。
- 交付记录引用的代码基线 `22c889a` 的运行 [36800477428](https://github.com/haeliotang/familiweave/actions/runs/36800477428) 同样成功，且 `head_sha` 与记录一致。
- `22c889a..f971dc0` 的差异仅为 README、交付决定与验证文档，没有运行时代码变化，与交付记录一致。

## 本地复核（2026-10-31）

环境：macOS，Node 24.11.0，pnpm 10.32.1，FFmpeg/FFprobe 8.1；本地模型与人物、声音资源齐全。

- `pnpm build`：通过，保留已知的大体积 chunk 警告。
- `pnpm check:local`：38 项中 37 项通过，仅 `heif-convert` 缺失（`missing_or_unusable`）。
- `pnpm exec vitest run --maxWorkers=2`：67 个测试文件，64 通过、1 跳过、2 失败；380 项中 328 通过、48 跳过（未设置 `TEST_DATABASE_URL`）、4 失败。
- 4 项失败全部为 HEIC 相关（`server/index.test.ts` 2 项、`server/preparation-matrix.test.ts` 的 photo-4 与 composite-4），原因均为本机未安装 `heif-convert`，不是代码回归。
- 与 README 对照：六个程序场景、两个成人基础人物、八个动作、75 秒相遇时长均在代码与资源中核对一致。

## 进度状态

| 范围 | 状态 |
| --- | --- |
| M0 内容与声音路线 | 本次本地方案内完成 |
| M1 资料与业务骨架 | 完成 |
| M2 自动化主链与纠正 | 完成 |
| M3 内容扩展与观测 | 完成 |
| M4 本地交付闭环 | 完成（2026-10-01 交付决定） |
| M5 VR | 未开始，不开放入口 |
| 量化音频验收 | 后续事项；可听清率与同步 P95 未测 |
| 照片自动可见线索提取、Marble/Spark | 后续探索 |
| 真人体验与 20 人对照测试 | 后续事项，未验证 |
| 手机真机验收与生产部署 | 已跳过/未验证 |
| 手部接触与全组合观感 | 仍待改进 |

## 待处理对齐项

1. 本机安装 `heif-convert`（`brew install libheif`）后重跑 `check:local` 与测试；当前的依赖检查和 4 项 HEIC 失败均由此引起。
2. 本地完整复现 CI 需 PostgreSQL 17 并设置 `TEST_DATABASE_URL`；否则 48 项数据库用例跳过（CI 已覆盖）。
3. 历史验证文档中的旧仓库地址仍会重定向，未改动；只更新了 README 与本地 `origin`。

## 边界

本次核对不改变 2026-10-01 的本地交付决定，不把跳过或后续事项写成通过，也不代表真机、生产部署或真人熟悉感效果已验证。
