import { createHash } from 'node:crypto'
import { expect, it } from 'vitest'
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
