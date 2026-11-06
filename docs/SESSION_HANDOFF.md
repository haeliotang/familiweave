# Session handoff — Tacitweave rename

日期：2026-11-06。  
用途：本地目录从 `familiweave` 改名为 `tacitweave` 后，在新工作区恢复上下文。

## 当前仓库状态

- GitHub：https://github.com/haeliotang/tacitweave
- 最新提交：`5265b28` — `Rename project to Tacitweave`
- 工作区：clean
- 版本：`0.1.3`
- **没有创建 v0.1.3 tag 或 Release**
- v0.1.2 仍是旧名 Familiweave 下发布的未签名 Linux/Windows 版本

## 改名已完成

- App / 产品名：Tacitweave
- bundle identifier：`com.inceptless.tacitweave`
- Rust crate：`tacitweave-ops`、`tacitweave-desktop`
- SQLite：`tacitweave.db`
- localStorage：`tacitweave.*`
- GitHub remote：`haeliotang/tacitweave`
- README、文档、截图、workflow、图标已更新
- 旧名仅保留在历史 release notes、旧资产名和迁移代码中

## 数据迁移

- Web：`src/storage-migration.ts` 把 `familiweave.*` 复制到 `tacitweave.*`
- Tauri：`lib.rs` 从旧 bundle data dir 复制 `familiweave.db` / WAL / local-files 到新目录
- 测试覆盖两层迁移

## 验证结果

- Vitest：152 passed
- Playwright：23 passed
- Rust ops：10 passed
- Rust desktop：6 passed
- 主包：305,487 B
- 主 CSS：55,036 B
- 静态产物合计：431,690 B
- Tauri app：约 8.4 MiB（strip 后）
- CI：Symbolic / Rust / Browser E2E success

## 本地目录改名步骤

```sh
# 先停掉 dev/tauri 进程
mv /Users/hao/Documents/familiweave /Users/hao/Documents/tacitweave
cd /Users/hao/Documents/tacitweave
git status
git remote -v
pnpm install --frozen-lockfile
pnpm test
```

如果 Tauri 增量编译报路径错误，删除 `apps/desktop/src-tauri/target/` 后重建。

## 新会话建议开场

```text
继续 Tacitweave。请先读取 docs/SESSION_HANDOFF.md。
本地目录已改名为 tacitweave，仓库 remote 已指向 haeliotang/tacitweave。
先验证 git 状态与测试，再决定 v0.1.3 是否发版/签名。
```

## 尚未完成

- 本地目录改名（用户执行）
- v0.1.3 tag / Release
- Windows/Linux 改名后的安装包构建
- macOS Developer ID 公证 / Windows Authenticode
- 商标与社交 handle 正式检索
