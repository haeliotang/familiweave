import { describe, expect, it } from 'vitest'
import { validateCaptured } from './captured-renderer'
import { demoEncounter } from './encounter'

describe('captured renderer', () => {
  it('requires a published capture before rendering', () => {
    expect(validateCaptured(demoEncounter())).toContain('没有可回放')
  })

  it('accepts a valid capture with a playback URL', () => {
    expect(validateCaptured({
      ...demoEncounter(),
      capture: {
        version: 'capture-v1', captureId: 'capture-1', rendererKind: 'captured', mimeType: 'video/mp4',
        durationSec: 75, sha256: 'a'.repeat(64), url: '/synthetic-capture.mp4', synthId: true, createdAt: '2026-11-01T00:00:00Z',
      },
    })).toBeUndefined()
  })
})
