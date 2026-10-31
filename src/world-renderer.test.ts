import { describe, expect, it } from 'vitest'
import type { CaptureProvenance } from './capture'
import type { RendererKind } from './director'
import { demoEncounter } from './encounter'
import { WorldRendererRegistry, worldRenderers } from './world-renderer'
import './world-renderers'

describe('world renderer registry', () => {
  it('registers the procedural renderer as available', () => {
    const renderer = worldRenderers.resolve(undefined)
    expect(renderer).toMatchObject({ kind: 'procedural', status: 'available' })
    expect(renderer?.Component).toBeTypeOf('function')
    expect(renderer?.validate?.(demoEncounter())).toBeUndefined()
  })

  it('reserves Genie 4 without calling an API and explains why', () => {
    const renderer = worldRenderers.get('genie4')
    expect(renderer).toMatchObject({ kind: 'genie4', status: 'requires_api_access', capabilities: { interactive: true, nativeAudio: true, capture: true } })
    expect(renderer?.reason).toMatch(/API/)
    expect(renderer?.Component).toBeUndefined()
  })

  it('plays captured episodes only when valid provenance and a URL exist', () => {
    const captured = worldRenderers.get('captured')!
    expect(captured).toMatchObject({ kind: 'captured', status: 'available', capabilities: { interactive: false, nativeAudio: true, capture: false } })
    expect(captured.validate!(demoEncounter())).toContain('没有可回放')
    const capture: CaptureProvenance = {
      version: 'capture-v1', captureId: 'capture-1', rendererKind: 'captured', mimeType: 'video/mp4',
      durationSec: 75, sha256: 'a'.repeat(64), url: '/synthetic-capture.mp4', synthId: true, createdAt: '2026-11-01T00:00:00Z',
    }
    expect(captured.validate!({ ...demoEncounter(), capture })).toBeUndefined()
  })

  it('uses the procedural validator for unsupported scene or performance versions', () => {
    const procedural = worldRenderers.get('procedural')!
    expect(procedural.validate!({ ...demoEncounter(), sceneVersion: 'future-scene' })).toContain('场景版本')
    expect(procedural.validate!({ ...demoEncounter(), performanceVersion: 'future-performance' })).toContain('动作版本')
  })

  it('does not silently fall back to procedural for an unavailable or unknown kind', () => {
    expect(worldRenderers.resolve('genie4')?.kind).toBe('genie4')
    expect(worldRenderers.resolve('unknown' as RendererKind)).toBeUndefined()
  })

  it('keeps every registered renderer contract-complete for future adapters', () => {
    for (const renderer of worldRenderers.list()) {
      expect(renderer.label.length).toBeGreaterThan(0)
      expect(typeof renderer.capabilities.interactive).toBe('boolean')
      expect(typeof renderer.capabilities.nativeAudio).toBe('boolean')
      expect(typeof renderer.capabilities.capture).toBe('boolean')
      if (renderer.status === 'available') {
        expect(renderer.Component).toBeTypeOf('function')
        expect(renderer.validate).toBeTypeOf('function')
      } else {
        expect(renderer.reason?.length).toBeGreaterThan(0)
      }
    }
  })

  it('keeps the latest registration for a kind so HMR can re-register descriptors', () => {
    const registry = new WorldRendererRegistry()
    const capabilities = { interactive: true, nativeAudio: false, capture: false }
    registry.register({ kind: 'procedural', label: 'first', status: 'available', capabilities })
    registry.register({ kind: 'procedural', label: 'second', status: 'available', capabilities })
    expect(registry.get('procedural')?.label).toBe('second')
  })
})
