import { cueFromMemory, spokenLine, type Cue } from './cue'

// Phase 0 foundation for the "director + world renderer" direction.
// This module does not call any network service. It turns a small memory input
// into a versioned, privacy-aware plan that is recorded in the episode manifest
// and consumed by the procedural renderer; a future Genie 4 / Marble / captured
// renderer can consume the same plan.

export type RendererKind = 'procedural' | 'genie4' | 'marble' | 'captured'

export type BeatAction = 'idle' | 'walk' | 'turn_back' | 'look' | 'repair' | 'pickup' | 'talk'

export interface Beat {
  startSec: number
  endSec: number
  action: BeatAction
  intent: string
}

export interface DirectorInput {
  memory: string
  rendererKind?: RendererKind
  /** Explicit consent is required before any real photo/recording leaves the device. */
  cloudUploadConsent?: boolean
  /** `user_photo` is rejected unless `cloudUploadConsent` is true. */
  referenceFrame?: 'none' | 'synthetic' | 'user_photo'
}

export interface PromptPack {
  world: string
  character: string
  behavior: string
  dialogue: string
  ambience: string
  camera: string
  reference: string
  negative: string[]
}

export interface DirectorPlan {
  version: 'director-v1'
  rendererKind: RendererKind
  cue: Cue
  durationSec: 75
  beats: Beat[]
  line: { cue: Cue; text: string; source: 'template'; mustNotInventMemory: true }
  promptPack: PromptPack
  worldPrompt: string
  safety: {
    noRealPersonLikeness: true
    fictionalLabel: true
    cloudUpload: 'disabled' | 'explicit_consent'
    referenceFrame: 'none' | 'synthetic' | 'user_photo_with_consent'
  }
}

const cueBeats: Record<Cue, Beat[]> = {
  wait: [
    { startSec: 28, endSec: 30, action: 'turn_back', intent: '回头看向身后，像在等同行的人' },
    { startSec: 30, endSec: 43, action: 'look', intent: '停一下，再慢慢继续' },
  ],
  repair: [
    { startSec: 28, endSec: 33.2, action: 'repair', intent: '蹲下查看并修一件小东西' },
    { startSec: 33.2, endSec: 43, action: 'look', intent: '检查结果，平静地站起身' },
  ],
  general: [
    { startSec: 28, endSec: 33.2, action: 'pickup', intent: '拿起一个安静的小物件' },
    { startSec: 33.2, endSec: 43, action: 'look', intent: '把物件放回，抬头看看四周' },
  ],
}

function behaviorFor(cue: Cue) {
  if (cue === 'wait') return 'walks slowly, then pauses and looks back as though waiting for someone to catch up'
  if (cue === 'repair') return 'kneels to inspect and patiently repair a small everyday object'
  return 'walks slowly, picks up a small object, then looks toward the viewer'
}

export function promptPackFor(cue: Cue, safety: DirectorPlan['safety']): PromptPack {
  const reference = safety.referenceFrame === 'none'
    ? 'No reference image is provided; use a text-only prompt.'
    : safety.referenceFrame === 'synthetic'
      ? 'A synthetic, non-identifying reference frame is provided for environment and layout.'
      : 'A reference image is provided with explicit consent; use it only for environment and layout. Do not reproduce the real person’s face, body, or voice, and keep the character fictional.'
  return {
    world: 'A quiet, stylized encounter in a neutral outdoor place at late afternoon, about 75 seconds.',
    character: 'One adult character with a fictional appearance that is not a likeness of any real person. Keep the same fictional character for the whole session.',
    behavior: `The character ${behaviorFor(cue)}.`,
    dialogue: `The character may say one short line in Mandarin: “${spokenLine(cue)}” No other dialogue, and do not invent memories or past events.`,
    ambience: 'Ambient wind, soft footsteps and cloth movement; no music.',
    camera: 'A single continuous third-person shot at human eye level; the viewer may approach, look around, sit, or leave.',
    reference,
    negative: ['no real-person likeness or voice cloning', 'no invented memories or claims about a deceased person', 'no on-screen text', 'no face morphing or duplicate character'],
  }
}

function combinePrompts(prompts: PromptPack) {
  return [prompts.world, prompts.character, prompts.behavior, prompts.dialogue, prompts.ambience, prompts.camera, prompts.reference, ...prompts.negative].join(' ')
}

export type DirectorOptions = Omit<DirectorInput, 'memory'>

export function directorPlanForCue(cue: Cue, input: DirectorOptions = {}): DirectorPlan {
  const consent = input.cloudUploadConsent === true
  const requested = input.referenceFrame ?? 'none'
  if (requested === 'user_photo' && !consent) throw new Error('user_photo_requires_explicit_consent')
  const referenceFrame: DirectorPlan['safety']['referenceFrame'] = !consent || requested === 'none'
    ? 'none'
    : requested === 'user_photo' ? 'user_photo_with_consent' : 'synthetic'
  const safety: DirectorPlan['safety'] = {
    noRealPersonLikeness: true,
    fictionalLabel: true,
    cloudUpload: consent ? 'explicit_consent' : 'disabled',
    referenceFrame,
  }
  const promptPack = promptPackFor(cue, safety)
  return {
    version: 'director-v1',
    rendererKind: input.rendererKind ?? 'procedural',
    cue,
    durationSec: 75,
    beats: [
      { startSec: 0, endSec: 12, action: 'idle', intent: '在新的地方站定，先听环境声' },
      { startSec: 12, endSec: 28, action: 'walk', intent: '不紧不慢地走向有光的地方' },
      ...cueBeats[cue],
      { startSec: 43, endSec: 55, action: 'talk', intent: '说一句短的话，不解释太多' },
      { startSec: 55, endSec: 72, action: 'walk', intent: '继续走自己的路' },
      { startSec: 72, endSec: 75, action: 'idle', intent: '慢慢离开画面' },
    ],
    line: { cue, text: spokenLine(cue), source: 'template', mustNotInventMemory: true },
    promptPack,
    worldPrompt: combinePrompts(promptPack),
    safety,
  }
}

export function directorPlan(input: DirectorInput): DirectorPlan {
  return directorPlanForCue(cueFromMemory(input.memory), input)
}
