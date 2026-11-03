# Local data schema v2

日期：2026-11-01。状态：已实现；无服务端。

## 导出格式

`local-dataset-v2`：

```json
{
  "version": "local-dataset-v2",
  "exportedAt": "2026-11-01T00:00:00.000Z",
  "motifs": [],
  "relationships": [],
  "field": {
    "version": "field-layout-v1",
    "positions": { "motif:<uuid>": { "x": 0.34, "y": 0.38 } },
    "links": [{ "id": "motif:a->motif:b", "from": "motif:a", "to": "motif:b", "createdAt": "..." }]
  },
  "signals": []
}
```

- `v1` 数据集仍可导入；缺失的 `field` / `signals` 按空处理。
- `field.positions` 使用 0–1 归一化坐标，节点 key 为 `motif:<id>` 或 `relationship:<id>`。
- `field.links` **只由用户主动连接**，不是系统推断。
- `signals` 只保存 session 摘要（时长、样本数、按 kind 计数），不保存原始信号。
- 不保存原始音频、原始神经数据、服务端账号或云同步。

## SQLite

Tauri 宿主在 app data 的 `familiweave.db` 中写入 `local_state`：

| key | value |
| --- | --- |
| `motifs` | 母题数组 |
| `relationships` | 关系触发点数组 |
| `field` | 场域布局（位置与用户连接） |
| `signals` | 信号 session 摘要数组 |

- 读取时缺失 key 返回空数组/空布局。
- 清除本机数据会清空 `local_state`，并清空 Web 回退 localStorage。
- 旧的拼写标识 app data 目录仍会在启动时迁移，不覆盖新目录数据。

## 导出与删除

- 设置页可导出完整 v2、导出时间轴、导入 v1/v2、删除全部。
- 删除是显式覆盖，不是隐藏；浏览器 localStorage 与 Tauri SQLite 都会清除。
- 后续 schema 变更必须保留旧版本导入路径，并写迁移说明。

## 边界

字段是用户自述与摘要，不是诊断、风险评分或对第三方的推断。`signals` 不含原始数据，因此不能从导出中重建神经/音频信号。
