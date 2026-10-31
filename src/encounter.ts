import type { CaptureProvenance } from './capture'
import type { InnerPlan } from './inner'
import type { EpisodePlan } from './episode-plan'

export type RendererKind = 'genie4' | 'marble' | 'captured' | 'symbolic'

export interface Encounter {
  id: string
  seed: number
  durationSec: number
  createdAt: string
  rendererKind?: RendererKind
  manifestHash?: string
  manifestVerified?: boolean
  capture?: CaptureProvenance
  innerPlan?: InnerPlan
  plan?: EpisodePlan
}
