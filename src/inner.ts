export type InnerMotif = 'corridor' | 'door' | 'water' | 'house' | 'forest' | 'station' | 'mirror' | 'field'

export type InnerFeeling = 'longing' | 'unease' | 'calm' | 'grief' | 'anger' | 'numbness'

export type InnerFigure = 'shadow' | 'stranger' | 'child' | 'animal' | 'none'

export type InnerAction = 'arrive' | 'notice' | 'approach' | 'pause' | 'transform' | 'leave'

export interface InnerBeat {
  startSec: number
  endSec: number
  action: InnerAction
  intent: string
}

export interface InnerPromptPack {
  space: string
  figure: string
  sound: string
  light: string
  camera: string
  negative: string[]
}

export interface InnerPlan {
  version: 'inner-v1'
  durationSec: 75
  motifs: InnerMotif[]
  figure: InnerFigure
  beats: InnerBeat[]
  prompts: InnerPromptPack
  safety: {
    notDiagnosis: true
    noInterpretation: true
    userOwnsMeaning: true
    exitAlwaysAvailable: true
    noMemoriesClaimed: true
  }
}

const motifWords: Record<InnerMotif, RegExp> = {
  water: /水|河|海|湖|雨|潮/,
  door: /门|入口|出口|门槛/,
  house: /房|屋|家|房间|窗/,
  forest: /林|树|森|枝叶/,
  station: /车站|站台|火车|列车|月台/,
  mirror: /镜|反射|倒影/,
  corridor: /走廊|通道|隧道|楼梯/,
  field: /田野|草地|草原|空地/,
}

const figureWords: Array<[InnerFigure, RegExp]> = [
  ['child', /孩子|小孩|童年|少年/],
  ['animal', /动物|狗|猫|鸟|鹿|马/],
  ['stranger', /陌生人|路人|旅人/],
  ['shadow', /影子|阴影|轮廓/],
]

export function innerPlan(input: { fragment: string; feeling?: InnerFeeling }): InnerPlan {
  const fragment = input.fragment.trim()
  if (!fragment) throw new Error('请先写下一段梦、画面、感觉或反复出现的片段。')
  const motifs = (Object.entries(motifWords) as Array<[InnerMotif, RegExp]>)
    .filter(([, pattern]) => pattern.test(fragment))
    .map(([motif]) => motif)
  const selected = motifs.length ? motifs.slice(0, 3) : ['corridor', 'door', 'water'] as InnerMotif[]
  const figure = figureWords.find(([, pattern]) => pattern.test(fragment))?.[0] ?? 'shadow'
  const feeling = input.feeling ?? 'unease'
  return {
    version: 'inner-v1',
    durationSec: 75,
    motifs: selected,
    figure,
    beats: [
      { startSec: 0, endSec: 12, action: 'arrive', intent: '进入空间，先听与看，不急着理解' },
      { startSec: 12, endSec: 28, action: 'notice', intent: '注意到一个反复出现的细节' },
      { startSec: 28, endSec: 43, action: 'approach', intent: '靠近，但不强迫自己靠近' },
      { startSec: 43, endSec: 55, action: 'pause', intent: '停留一会儿，允许矛盾同时存在' },
      { startSec: 55, endSec: 68, action: 'transform', intent: '空间或影子发生变化，不解释变化' },
      { startSec: 68, endSec: 75, action: 'leave', intent: '可以离开；离开也是这段经验的一部分' },
    ],
    prompts: {
      space: `A symbolic, dreamlike space built from: ${selected.join(', ')}. Not a literal location; no readable text, no maps, no labels.`,
      figure: `A ${figure} presence at the edge of the space; it does not speak, judge, or explain. No real-person likeness, no identity, no diagnosis.`,
      sound: 'Low ambient sound, distant water/air/room tone; no music with a clear emotional instruction; no voice-over.',
      light: feeling === 'calm' ? 'Soft, even light with long shadows.' : feeling === 'grief' ? 'Low, warm light; some areas stay dark.' : feeling === 'anger' ? 'Hard directional light and deep contrast.' : feeling === 'numbness' ? 'Flat, almost colorless light.' : 'Unsteady light, as if weather is changing indoors.',
      camera: 'Slow first-person drift; the viewer may stop, look, approach, or leave at any time. No jump cuts.',
      negative: ['no diagnosis or psychological interpretation', 'no claims about the unconscious or repressed memories', 'no real-person likeness or voice cloning', 'no on-screen text', 'no engagement prompts or notifications'],
    },
    safety: {
      notDiagnosis: true,
      noInterpretation: true,
      userOwnsMeaning: true,
      exitAlwaysAvailable: true,
      noMemoriesClaimed: true,
    },
  }
}

export function innerStoryboardMarkdown(plan: InnerPlan): string {
  const beats = plan.beats.map(beat => `| ${beat.startSec}–${beat.endSec}s | ${beat.action} | ${beat.intent} |`).join('\n')
  return [
    '# Inner storyboard',
    '',
    `- 版本：${plan.version}`,
    `- 时长：${plan.durationSec} 秒`,
    `- 母题：${plan.motifs.join(' / ')}`,
    `- 影子：${plan.figure}`,
    '- 本文件不包含输入原文，也不对输入做解释。',
    '',
    '## 节拍',
    '',
    '| 时间 | 动作 | 意图 |',
    '| --- | --- | --- |',
    beats,
    '',
    '## 提示词',
    '',
    `### Space\n${plan.prompts.space}`,
    '',
    `### Figure\n${plan.prompts.figure}`,
    '',
    `### Sound\n${plan.prompts.sound}`,
    '',
    `### Light\n${plan.prompts.light}`,
    '',
    `### Camera\n${plan.prompts.camera}`,
    '',
    `### Negative\n${plan.prompts.negative.map(item => `- ${item}`).join('\n')}`,
    '',
    '## 安全',
    '',
    `- 不是诊断：${plan.safety.notDiagnosis}`,
    `- 不做解释：${plan.safety.noInterpretation}`,
    `- 意义归用户：${plan.safety.userOwnsMeaning}`,
    `- 随时可离开：${plan.safety.exitAlwaysAvailable}`,
    `- 不声称恢复记忆：${plan.safety.noMemoriesClaimed}`,
    '',
  ].join('\n')
}
