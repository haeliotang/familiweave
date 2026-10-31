import type { InnerPlan } from './inner'

/** A single plan envelope for symbolic episodes. */
export type EpisodePlan = {
  version: 'episode-plan-v1'
  kind: 'inner'
  rendererKind: 'symbolic'
  inner: InnerPlan
}
