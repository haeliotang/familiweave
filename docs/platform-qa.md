# Desktop platform QA

日期：2026-11-03。状态：macOS 已本机启动并截图；Windows/Linux 已在 CI 中完成当前 main 的构建与启动 smoke test。

## 共同

- [ ] 安装/首次启动
- [ ] 新建片段、保存、重启后恢复
- [ ] 场域节点拖拽、缩放、重置、连接/删除连线
- [ ] 导入 v1/v2、导出、删除全部
- [ ] 中英文切换与明暗主题持久化
- [x] 应用锁设置/错误 PIN/解锁/加密快照/重载恢复（浏览器验证）
- [x] 应用锁开启后明文 key 删除、关闭后恢复（浏览器验证）
- [ ] 本机 BCI bridge token 连接与断开
- [x] 打包应用在收紧 CSP 后正常渲染

macOS 本机截图：[desktop-tauri-dark.png](assets/desktop-tauri-dark.png)

当前 main 的 Desktop builds run `41687589049`：Linux AppImage 在 xvfb 中启动成功，Windows NSIS 安装与进程启动成功；release 上传在该次校验中按设计跳过。

场域拖拽、连线、时间过滤与示例场域的浏览器验证已通过；Tauri 窗口内的交互尚未逐项手测。

## macOS

- [x] 交通灯位置与侧栏拖拽区（本机截图）
- [ ] Gatekeeper 首次打开提示
- [x] app data 从旧拼写目录迁移（启动验证）
- [x] `icon.icns` 与 Dock 图标

## Windows

- [x] NSIS 安装（CI smoke）
- [x] WebView2 启动与进程存活（CI smoke）
- [ ] 原生标题栏与自定义顶栏不重叠（需人工）
- [ ] 文件路径、app data、SQLite（需人工）
- [ ] SmartScreen 警告与未签名说明

## Linux

- [x] AppImage 启动（xvfb smoke）
- [ ] DEB 依赖安装（需人工）
- [x] WebKitGTK 4.1 环境（CI）
- [ ] 窗口装饰/拖拽区（需人工）
- [ ] AppImage 在不同发行版的最小验证

运行时验收前，不应宣称 Windows/Linux 已达到与 macOS 相同的可用性。
