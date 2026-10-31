import { describe, expect, it } from 'vitest'
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
    expect(renderer).toMatchObject({ kind: 'genie4', status: 'requires_api_access' })
    expect(renderer?.reason).toMatch(/API/)
    expect(renderer?.Component).toBeUndefined()
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
    registry.register({ kind: 'procedural', label: 'first', status: 'available' })
    registry.register({ kind: 'procedural', label: 'second', status: 'available' })
    expect(registry.get('procedural')?.label).toBe('second')
  })
})
