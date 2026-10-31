import { directorPlan, type Beat, type DirectorPlan, type PromptPack } from './director'

// Provider-neutral storyboard: the same plan can be reviewed by a person, sent
// to a manual Project Genie session, or fed to a future Genie 4 adapter.

export interface Storyboard {
  version: 'storyboard-v1'
  source: DirectorPlan['version']
  cue: DirectorPlan['cue']
  durationSec: DirectorPlan['durationSec']
  beats: Beat[]
  line: DirectorPlan['line']
  prompts: PromptPack
  safety: DirectorPlan['safety']
}

export function storyboard(plan: DirectorPlan): Storyboard {
  return {
    version: 'storyboard-v1',
    source: plan.version,
    cue: plan.cue,
    durationSec: plan.durationSec,
    beats: plan.beats,
    line: plan.line,
    prompts: plan.promptPack,
    safety: plan.safety,
  }
}

export function storyboardFromMemory(memory: string): Storyboard {
  return storyboard(directorPlan({ memory }))
}

export function storyboardMarkdown(plan: DirectorPlan): string {
  const board = storyboard(plan)
  const beats = board.beats.map(beat => `| ${beat.startSec}–${beat.endSec}s | ${beat.action} | ${beat.intent} |`).join('\n')
  const negative = board.prompts.negative.map(item => `- ${item}`).join('\n')
  return [
    `# Storyboard · ${board.cue}`,
    '',
    `- 版本：${board.version}（${board.source}）`,
    `- 时长：${board.durationSec} 秒`,
    '- 本文件不包含用户记忆原文。',
    '',
    '## 节拍',
    '',
    '| 时间 | 动作 | 意图 |',
    '| --- | --- | --- |',
    beats,
    '',
    '## 台词',
    '',
    `“${board.line.text}”`,
    '',
    `来源：${board.line.source}；不得编造用户未提供的记忆。`,
    '',
    '## 世界提示词',
    '',
    `### World\n${board.prompts.world}`,
    '',
    `### Character\n${board.prompts.character}`,
    '',
    `### Behavior\n${board.prompts.behavior}`,
    '',
    `### Dialogue\n${board.prompts.dialogue}`,
    '',
    `### Ambience\n${board.prompts.ambience}`,
    '',
    `### Camera\n${board.prompts.camera}`,
    '',
    `### Reference\n${board.prompts.reference}`,
    '',
    `### Negative\n${negative}`,
    '',
    '## 安全与出处',
    '',
    `- 不做写实克隆：${board.safety.noRealPersonLikeness}`,
    `- 虚构标识：${board.safety.fictionalLabel}`,
    `- 云端上传：${board.safety.cloudUpload}`,
    `- 参考帧：${board.safety.referenceFrame}`,
    '',
  ].join('\n')
}
