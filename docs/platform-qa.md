# Desktop platform QA

日期：2026-11-03。状态：macOS 已本机启动并截图；Windows/Linux CI 构建成功，运行时未人工验收。

## 共同

- [ ] 安装/首次启动
- [ ] 新建片段、保存、重启后恢复
- [ ] 场域节点拖拽、缩放、重置、连接/删除连线
- [ ] 导入 v1/v2、导出、删除全部
- [ ] 中英文切换与明暗主题持久化
- [ ] 本机 BCI bridge token 连接与断开
- [x] 打包应用在收紧 CSP 后正常渲染

macOS 本机截图：[desktop-tauri-dark.png](assets/desktop-tauri-dark.png)

场域拖拽、连线、时间过滤与示例场域的浏览器验证已通过；Tauri 窗口内的交互尚未逐项手测。

## macOS

- [x] 交通灯位置与侧栏拖拽区（本机截图）
- [ ] Gatekeeper 首次打开提示
- [x] app data 从旧拼写目录迁移（启动验证）
- [x] `icon.icns` 与 Dock 图标

## Windows

- [ ] NSIS 安装/卸载
- [ ] WebView2 可用性
- [ ] 原生标题栏与自定义顶栏不重叠
- [ ] 文件路径、app data、SQLite
- [ ] SmartScreen 警告与未签名说明

## Linux

- [ ] AppImage FUSE / 执行权限
- [ ] DEB 依赖安装
- [ ] WebKitGTK 4.1 环境
- [ ] 窗口装饰/拖拽区
- [ ] AppImage 在不同发行版的最小验证

运行时验收前，不应宣称 Windows/Linux 已达到与 macOS 相同的可用性。
