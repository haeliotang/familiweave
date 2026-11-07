import { describe, expect, it } from 'vitest'
import { researchCaptureSessionSchema } from './research-capture'

const base = {
  version: 'research-capture-v1' as const,
  participantCode: 'P01',
  sessionId: 's1',
  collectedAt: '2026-11-07T00:00:00.000Z',
  device: { manufacturer: 'OpenBCI', model: 'Cyton', firmware: '3.0.0', sdkVersion: '1.0.0', serialHash: 'a'.repeat(64), channels: [{ name: 'ch1', kind: 'heart_rate' as const, unit: 'bpm' }] },
  clock: { source: 'device' as const, deviceEpochMs: 0, hostEpochMs: 0, offsetMs: 0 },
  consent: { scope: 'features_only' as const, version: 'consent-v1', grantedAt: '2026-11-07T00:00:00.000Z' },
  capture: { rawFormat: 'none' as const, sampleCount: 10, featureVersion: 'features-v1', features: [], quality: { maxGapMs: 1000, gapsOverOneSecond: 0, droppedSamples: 0, reconnects: 0 } },
  retention: { until: '2027-11-07T00:00:00.000Z', access: 'local_encrypted' as const, policy: 'delete on withdrawal' },
  deletion: { status: 'not_requested' as const },
}

describe('research capture schema', () => {
  it('accepts features-only capture without raw signal', () => {
    expect(researchCaptureSessionSchema.safeParse(base).success).toBe(true)
  })

  it('requires raw provenance when raw_signal consent is granted', () => {
    expect(researchCaptureSessionSchema.safeParse({ ...base, consent: { ...base.consent, scope: 'raw_signal' } }).success).toBe(false)
    const raw = { ...base, consent: { ...base.consent, scope: 'raw_signal' as const }, capture: { ...base.capture, rawFormat: 'jsonl' as const, rawSha256: 'b'.repeat(64), rawBytes: 100 } }
    expect(researchCaptureSessionSchema.safeParse(raw).success).toBe(true)
  })

  it('rejects raw bytes under features-only consent and missing device firmware', () => {
    expect(researchCaptureSessionSchema.safeParse({ ...base, capture: { ...base.capture, rawFormat: 'jsonl' as const } }).success).toBe(false)
    const { firmware: _firmware, ...device } = base.device
    expect(researchCaptureSessionSchema.safeParse({ ...base, device }).success).toBe(false)
  })
})
