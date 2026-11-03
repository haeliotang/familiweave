import { describe, expect, it } from 'vitest'
import { grantLocalSignalConsent } from './somatic-signal'
import { isLocalBridgeUrl, parseBridgePacket, WebSocketSignalSource } from './device-signal-source'

const consent = grantLocalSignalConsent('2026-11-01T00:00:00Z')

describe('BCI-2 device bridge contract', () => {
  it('only allows a local WebSocket bridge', () => {
    expect(isLocalBridgeUrl('ws://127.0.0.1:8765')).toBe(true)
    expect(isLocalBridgeUrl('ws://localhost:8765')).toBe(true)
    expect(isLocalBridgeUrl('wss://example.com')).toBe(false)
    expect(isLocalBridgeUrl('https://127.0.0.1:8765')).toBe(false)
    expect(() => new WebSocketSignalSource('ws://example.com:8765', '')).toThrow()
  })

  it('parses single and batched bridge samples', () => {
    const single = parseBridgePacket({ type: 'sample', kind: 'heart_rate', value: 68, tMs: 1200 }, 2000, 'bridge')
    expect(single).toEqual([{ tMs: 1200, kind: 'heart_rate', value: 68, sourceId: 'bridge' }])
    const batch = parseBridgePacket({ type: 'samples', samples: [{ kind: 'eda', value: 2.1 }, { kind: 'unknown' as never, value: 1 }] }, 5000, 'bridge')
    expect(batch).toEqual([{ tMs: 5000, kind: 'eda', value: 2.1, sourceId: 'bridge' }])
    expect(parseBridgePacket({ type: 'hello' }, 0, 'bridge')).toEqual([])
  })

  it('requires local consent before starting', () => {
    const source = new WebSocketSignalSource('ws://127.0.0.1:8765', '')
    expect(() => source.start({ ...consent, localOnly: false } as unknown as typeof consent)).toThrow()
    expect(() => source.stop()).toThrow()
  })
})
