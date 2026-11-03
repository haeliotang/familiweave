# BCI-3 本机桥接

日期：2026-11-01。状态：协议实现与鉴权已落地；真实设备未验收。

## 它是什么

`scripts/bci3-bridge.ts` 是一个只监听 `127.0.0.1` 的 WebSocket 桥接进程：

- 客户端（Familiweave）连接 `ws://127.0.0.1:8765/bci`
- 先发送 `hello`，包含 `client: "familiweave"` 和启动时打印的 token
- 桥接验证 token 后返回能力列表
- 真实设备/采集程序通过 **stdin JSONL** 送入 `sample` 或 `samples`
- 桥接只转发样本，不持久化原始信号

## 启动

```sh
pnpm bci:bridge --port 8765
# 或固定 token：
pnpm bci:bridge --port 8765 --token local-dev-token
```

然后在应用「信号实验台 → BCI-2 设备桥接」中填写地址与 token。

## 协议

客户端连接：

```json
{"type":"hello","client":"familiweave","token":"local-dev-token"}
```

桥接成功：

```json
{"type":"hello","sourceId":"bci-3-bridge","kinds":["heart_rate","eda"],"sampleRateHz":1}
```

送入样本：

```json
{"type":"sample","kind":"heart_rate","value":68,"tMs":1200}
{"type":"samples","samples":[{"kind":"eda","value":2.1},{"kind":"breath_phase","value":0.4}]}
```

`tMs` 缺省时由客户端按接收时间填充；所有输入必须来自本机。

## 安全边界

- 仅监听 `127.0.0.1`
- 必须携带 token
- 拒绝非本机与陌生 `Origin`
- 256 KB 单包上限
- 不保存原始神经数据；应用只把摘要写入本地 SQLite
- 没有真实 OpenBCI/BrainFlow/LSL 硬件验收；此 bridge 是设备 daemon 的协议接缝

下一步是把本脚本替换/扩展为读取 LSL/OpenBCI/BrainFlow 的真实 daemon；在此之前，不要声称 BCI-3 已完成。
