import { describe, expect, it } from 'vitest'
import { grantLocalSignalConsent } from './somatic-signal'
import { mergeSignalTraces, SimulatedSignalSource, summarizeTimeline, traceToTimeline, type SignalTrace } from './signal-source'

const consent = grantLocalSignalConsent('2026-11-01T00:00:00Z')

function trace(sourceId: string, startedAt: string, endedAt: string, tMs: number[]): SignalTrace {
  return {
    version: 'signal-trace-v1', sourceId, startedAt, endedAt, consent, simulated: true,
    samples: tMs.map(value => ({ tMs: value, kind: 'heart_rate', value: 60, unit: 'bpm', sourceId })),
  }
}

describe('signal source layer', () => {
  it('exposes a clearly simulated LSL-like source', () => {
    const source = new SimulatedSignalSource()
    expect(source.capabilities).toMatchObject({ simulated: true, localOnly: true, requiresPermission: false })
    expect(source.capabilities.kinds).toContain('heart_rate')
    expect(() => source.start({ ...consent, localOnly: false } as unknown as typeof consent)).toThrow()
  })

  it('aligns samples from traces with different starts', () => {
    const timeline = mergeSignalTraces([
      trace('a', '2026-11-01T00:00:00Z', '2026-11-01T00:00:02Z', [0, 1000, 2000]),
      trace('b', '2026-11-01T00:00:01Z', '2026-11-01T00:00:03Z', [0, 1000]),
    ])
    expect(timeline.samples.map(sample => sample.tMs)).toEqual([0, 1000, 1000, 2000, 2000])
    expect(timeline.sources).toEqual(['a', 'b'])
    expect(timeline.simulated).toBe(true)
    expect(summarizeTimeline(traceToTimeline(trace('a', '2026-11-01T00:00:00Z', '2026-11-01T00:00:02Z', [0, 1000, 2000])))).toMatchObject({ sampleCount: 3, durationSec: 2, simulated: true })
  })
})
