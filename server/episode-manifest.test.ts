import { createHash } from 'node:crypto'
import { expect, it } from 'vitest'
import type { CaptureProvenance } from '../src/capture'
import { manifestContent } from '../src/manifest'
import { episodeManifest } from './episode-manifest'

it('records the procedural renderer and a privacy-preserving director plan in the hashed manifest', () => {
  const manifest = episodeManifest('synthetic', 1, null, 'wait', 0)
  expect(manifest.rendererKind).toBe('procedural')
  expect(manifest.directorPlan).toMatchObject({
    version: 'director-v1',
    rendererKind: 'procedural',
    cue: 'wait',
    durationSec: 75,
    safety: { noRealPersonLikeness: true, fictionalLabel: true, cloudUpload: 'disabled', referenceFrame: 'none' },
  })
  expect(manifest.directorPlan.line.text).toBe('不用急，我走慢一点。')
  expect(manifest.directorPlan.beats[0].startSec).toBe(0)
  expect(manifest.directorPlan.beats.at(-1)!.endSec).toBe(75)
  expect(manifest.manifestHash).toBe(createHash('sha256').update(manifestContent(manifest)).digest('hex'))
})

it('records a provider-neutral capture for non-deterministic renderers', () => {
  const capture: CaptureProvenance = {
    version: 'capture-v1', captureId: 'capture-1', rendererKind: 'captured', mimeType: 'video/mp4',
    durationSec: 75, sha256: 'a'.repeat(64), url: '/synthetic-capture.mp4', model: 'synthetic-model',
    synthId: true, createdAt: '2026-11-01T00:00:00Z',
  }
  const manifest = episodeManifest('synthetic', 1, null, 'wait', 0, undefined, { rendererKind: 'captured', capture })
  expect(manifest.rendererKind).toBe('captured')
  expect(manifest.directorPlan.rendererKind).toBe('captured')
  expect(manifest.capture).toEqual(capture)
  expect(manifest.manifestHash).toBe(createHash('sha256').update(manifestContent(manifest)).digest('hex'))
})

it('rejects malformed capture provenance before publishing', () => {
  expect(() => episodeManifest('synthetic', 1, null, 'wait', 0, undefined, { capture: { version: 'capture-v1' } as never })).toThrow('invalid_capture_provenance')
  const capture: CaptureProvenance = {
    version: 'capture-v1', captureId: 'capture-1', rendererKind: 'captured', mimeType: 'video/mp4',
    durationSec: 75, sha256: 'a'.repeat(64), url: '/synthetic-capture.mp4', synthId: true, createdAt: '2026-11-01T00:00:00Z',
  }
  expect(() => episodeManifest('synthetic', 1, null, 'wait', 0, undefined, { rendererKind: 'genie4', capture })).toThrow('capture_renderer_mismatch')
})
