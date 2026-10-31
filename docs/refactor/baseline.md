# R0 构建基线

日期：2026-11-01。命令：`pnpm build && pnpm measure:build`。

## 本次测量

| 文件 | 字节 | 说明 |
| --- | ---: | --- |
| `scene-BRK6_ZGy.js` | 610,979 | 三维场景分包；`dist/index.html` 未预加载 |
| `index-HME2wX4n.js` | 279,190 | 主入口（R1 后） |
| `index-C8-aiCn_.css` | 8,318 | 样式 |
| 合计 | 898,487 | 三个产物 |

- `sceneChunk.preloadedInHtml = false`：symbolic 路径不应要求下载 Three.js 场景分包。
- 文件名带 hash，会随构建变化；以本次字节数为基线，不把文件名当稳定契约。
- 尚未测量首屏时间、75/180 秒内帧间隔或交互延迟；这些需要浏览器 Performance 面板实测，当前不作数值声明。

## R0 检查

- [x] 记录构建体积
- [x] 确认 scene 分包未被 `index.html` 预加载
- [ ] symbolic 路径的浏览器首屏/交互实测
- [ ] 75 秒相遇与 180 秒空间的帧稳定性实测

## 性能预算（暂定，待实测）

- 主入口不因新增 symbolic 功能无上限增长；超出 5% 时在 PR/commit 说明原因。
- symbolic 路径不加载 `scene-*.js`，不加载模型，不初始化音频。
- 场景分包保持 lazy；旧三维路径按需加载。
- 捕获 hash 使用 Rust 流式读取大文件，避免 Node 重复读入内存。

测量脚本：[`scripts/measure-baseline.ts`](../../scripts/measure-baseline.ts)。
