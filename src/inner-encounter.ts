import type { Encounter } from './encounter'
import { innerPlan, innerSpace } from './inner'

// Local, synthetic entry points for the symbolic-space prototype. They never
// contain personal material and never call a model.
export function demoInnerEncounter(): Encounter {
  const inner = innerPlan({ fragment: '我总梦见一条走廊尽头有一扇门，门外是水。', feeling: 'unease' })
  return {
    id: 'demo-inner',
    seed: 1,
    memory: '',
    cue: 'general',
    scene: 'riverside',
    durationSec: 75,
    createdAt: new Date().toISOString(),
    rendererKind: 'symbolic',
    innerPlan: inner,
    plan: { version: 'episode-plan-v1', kind: 'inner', rendererKind: 'symbolic', inner },
  }
}

export function demoInnerSpaceEncounter(): Encounter {
  const inner = innerSpace({ fragment: '一片有水的空地，远处有一扇门。', feeling: 'calm' })
  return {
    id: 'demo-inner-space',
    seed: 2,
    memory: '',
    cue: 'general',
    scene: 'riverside',
    durationSec: 180,
    createdAt: new Date().toISOString(),
    rendererKind: 'symbolic',
    innerPlan: inner,
    plan: { version: 'episode-plan-v1', kind: 'inner', rendererKind: 'symbolic', inner },
  }
}
