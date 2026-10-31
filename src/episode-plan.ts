import type { DirectorPlan } from './director'
import type { InnerPlan } from './inner'

/**
 * R1 transition envelope. New readers prefer `plan`; legacy `directorPlan` and
 * `innerPlan` fields stay readable until R4 removes them.
 */
export type EpisodePlan =
  | { version: 'episode-plan-v1'; kind: 'inner'; rendererKind: 'symbolic'; inner: InnerPlan }
  | { version: 'episode-plan-v1'; kind: 'procedural'; rendererKind: 'procedural'; director: DirectorPlan }

export interface EpisodePlanSource {
  plan?: EpisodePlan
  innerPlan?: InnerPlan
  directorPlan?: DirectorPlan
}

export function planFromManifest(source: EpisodePlanSource): EpisodePlan | undefined {
  if (source.plan) return source.plan
  if (source.innerPlan) return { version: 'episode-plan-v1', kind: 'inner', rendererKind: 'symbolic', inner: source.innerPlan }
  if (source.directorPlan) return { version: 'episode-plan-v1', kind: 'procedural', rendererKind: 'procedural', director: source.directorPlan }
  return undefined
}
