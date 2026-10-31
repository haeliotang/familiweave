import type { Encounter } from './encounter'
import { innerPlan } from './inner'

// Local, synthetic entry point for the symbolic-space prototype. It never
// contains personal material and never calls a model.
export function demoInnerEncounter(): Encounter {
  return {
    id: 'demo-inner',
    seed: 1,
    memory: '',
    cue: 'general',
    scene: 'riverside',
    durationSec: 75,
    createdAt: new Date().toISOString(),
    rendererKind: 'symbolic',
    innerPlan: innerPlan({ fragment: '我总梦见一条走廊尽头有一扇门，门外是水。', feeling: 'unease' }),
  }
}
