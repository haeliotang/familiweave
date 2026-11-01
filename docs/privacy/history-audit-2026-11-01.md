# Git 历史大文件与音频审计

日期：2026-11-01。范围：当前仓库所有可达提交（`git rev-list --objects --all`）。

## 结论

**没有发现真人语音证据。** 大文件主要是早期 3D 角色资产；历史音频全部是本地合成测试素材或合成 fixture。

因此本轮**没有重写 Git 历史**。清理历史会改变所有提交哈希、需要 force-push，并影响已有 clone；在隐私风险不成立时不应做这种破坏性操作。

## 大文件

大于 1 MB 的 blob 共 **22 个**，合计 **153.52 MB**，全部位于：

- `public/assets/quaternius/**/*.glb`
- `public/assets/quaternius/**/animations.json`

这些是早期 3D 人物/动画资产，不是音频，也不包含真人照片。

## 历史音频

历史中的音频共 **88 个**，合计 **9.54 MB**：

| 路径 | 数量 | 说明 |
| --- | ---: | --- |
| `artifacts/acceptance/M0/**` | 82 | Kokoro / speaker 3 / speaker 58 的本地合成验收 WAV |
| `public/assets/sample-voices/**` | 2 | `provenance.json` 明确写有 `locally generated synthetic sample lines; no user recordings` |
| `public/assets/sample-voices-female/**` | 2 | 同上，Kokoro speaker 3 |
| `server/fixtures/**` | 2 | 合成 WebM 测试 fixture |

- 最大的音频 blob 为 **183,154 B**，没有超过 1 MB 的音频。
- `docs/verification/audio-upload-retry.md` 明确记录「使用已发布通用 Kokoro 合成 general.wav，无真实录音」。
- `docs/verification/direct-recording.md` 明确记录「没有授权实际采集麦克风声音，本轮未点击录制按钮或接受麦克风权限」。
- 旧版直接录音验证页只生成 440 Hz 合成音；截图中的「本人录音」是 UI 占位，不是已提交的真人音频。

## 可选的后续清理

如果目标从「隐私」变成「减小仓库体积」，可以另行决定是否用 `git filter-repo` 删除 Quaternius 资产与历史验收音频；这会重写历史，必须单独确认并协调所有 clone。本轮不做。
