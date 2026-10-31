import type { CaptureProvenance } from './capture'
import { cueFromMemory, type Cue } from './cue'
import { directorPlanForCue, type DirectorPlan, type RendererKind } from './director'
import { limitMemoryText } from './memory-text'
import { currentPerformanceVersion } from './performance-catalog'
import { currentSceneVersion, sceneForEncounter, type SceneId } from './scene-catalog'
import { currentAvatarVersion, avatarVersionForEncounter } from './avatar-catalog'

export { cueFromMemory, spokenLine } from './cue'
export type { Cue } from './cue'

export interface Encounter {
  id: string
  seed: number
  memory: string
  cue: Cue
  scene: SceneId
  durationSec: 75
  createdAt: string
  sceneVersion?: string
  manifestHash?: string
  manifestVerified?: boolean
  performanceVersion?: string
  avatarVersion?: string
  evidenceId?: string
  retracted?: boolean
  degraded?: boolean
  degradationReason?: string
  audioSignalStatus?: string
  personalizationLevel?: 'generic' | 'memory_based' | 'audio_rate_based' | 'memory_and_audio_rate_based'
  rendererKind?: RendererKind
  directorPlan?: DirectorPlan
  capture?: CaptureProvenance
}

export function createEncounter(memory: string, previous: Encounter[] = []): Encounter {
  const normalized = limitMemoryText(memory.trim())
  if (!normalized) throw new Error('请先写下一句记忆，或进入示例体验。')
  const seed = Math.floor(Math.random() * 0xffffffff)
  const cue = cueFromMemory(normalized)
  return {
    id: crypto.randomUUID(), seed, memory: normalized,
    cue,
    scene: sceneForEncounter(previous.length),
    performanceVersion: currentPerformanceVersion,
    sceneVersion: currentSceneVersion,
    avatarVersion: avatarVersionForEncounter(previous.length),
    durationSec: 75,
    createdAt: new Date().toISOString(),
    rendererKind: 'procedural',
    directorPlan: directorPlanForCue(cue),
  }
}

export function demoEncounter(): Encounter {
  return {
    id: 'demo', seed: 1, memory: '', cue: 'general', scene: 'riverside',
    performanceVersion: currentPerformanceVersion,
    sceneVersion: currentSceneVersion,
    avatarVersion: currentAvatarVersion,
    durationSec: 75, createdAt: new Date().toISOString(),
    rendererKind: 'procedural',
    directorPlan: directorPlanForCue('general'),
  }
}
