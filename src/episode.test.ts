import { createHash } from 'node:crypto'
import { expect, it } from 'vitest'
import type { CaptureProvenance } from './capture'
import { directorPlanForCue } from './director'
import { innerPlan } from './inner'
import { fromApi, type ApiEpisode } from './episode'
import { manifestContent } from './manifest'

it('retains saved versions and seed, verifies the complete server manifest, and rejects changed content', async () => {
  const manifest: ApiEpisode['manifest'] = { cue: 'wait', sceneId: 'riverside', durationSec: 75, seed: 12345, sceneVersion: 'procedural-path-v1', avatarVersion: 'adult-peasant-male-webp-v1', performanceVersion: 'character-timeline-v2', audioPlan: { voiceVersion: 'kokoro-zh-zm009-v1' } }
  manifest.manifestHash = createHash('sha256').update(manifestContent(manifest)).digest('hex')
  const episode = { episodeId: 'synthetic-episode', status: 'prototype', createdAt: '2026-09-30', manifest }
  expect(await fromApi(episode)).toMatchObject({ seed: 12345, sceneVersion: 'procedural-path-v1', performanceVersion: 'character-timeline-v2', manifestVerified: true })
  expect(await fromApi({ ...episode, manifest: { ...manifest, seed: 12346 } })).toMatchObject({ manifestVerified: false })
  expect(await fromApi({ ...episode, manifest: { ...manifest, audioPlan: { voiceVersion: 'changed' } } })).toMatchObject({ manifestVerified: false })
})

it('retains the recorded renderer and director plan and verifies them in the manifest hash', async () => {
  const directorPlan = directorPlanForCue('wait')
  const manifest: ApiEpisode['manifest'] = { cue: 'wait', sceneId: 'riverside', durationSec: 75, seed: 7, rendererKind: 'procedural', directorPlan }
  manifest.manifestHash = createHash('sha256').update(manifestContent(manifest)).digest('hex')
  const result = await fromApi({ episodeId: 'directed', status: 'prototype', createdAt: '2026-10-31', manifest })
  expect(result.rendererKind).toBe('procedural')
  expect(result.directorPlan).toEqual(directorPlan)
  expect(result.plan).toMatchObject({ version: 'episode-plan-v1', kind: 'procedural', rendererKind: 'procedural' })
  expect(result.manifestVerified).toBe(true)
})

it('retains a valid capture but drops malformed capture metadata', async () => {
  const capture: CaptureProvenance = {
    version: 'capture-v1', captureId: 'capture-1', rendererKind: 'captured', mimeType: 'video/mp4',
    durationSec: 75, sha256: 'a'.repeat(64), url: '/synthetic-capture.mp4', synthId: true, createdAt: '2026-11-01T00:00:00Z',
  }
  const manifest: ApiEpisode['manifest'] = { cue: 'wait', sceneId: 'riverside', durationSec: 75, rendererKind: 'captured', capture }
  const result = await fromApi({ episodeId: 'captured', status: 'prototype', createdAt: '2026-11-01', manifest })
  expect(result.capture).toEqual(capture)
  expect((await fromApi({ episodeId: 'broken', status: 'prototype', createdAt: '2026-11-01', manifest: { ...manifest, capture: { version: 'capture-v1' } as never } })).capture).toBeUndefined()
})

it('maps an inner plan into the unified episode envelope', async () => {
  const inner = innerPlan({ fragment: '一条走廊尽头有一扇门，门外是水。' })
  const plan = { version: 'episode-plan-v1' as const, kind: 'inner' as const, rendererKind: 'symbolic' as const, inner }
  const result = await fromApi({ episodeId: 'inner', status: 'prototype', createdAt: '2026-11-01', manifest: { cue: 'general', sceneId: 'riverside', durationSec: 75, rendererKind: 'symbolic', innerPlan: inner, plan } })
  expect(result.plan).toEqual(plan)
  expect(result.innerPlan).toEqual(inner)
})

it('preserves a legacy record without inventing a seed, version or fingerprint', async () => {
  const result = await fromApi({ episodeId: 'legacy', status: 'prototype', createdAt: '2026-09-30', manifest: { cue: 'general', sceneId: 'courtyard', durationSec: 75 } })
  expect(result.seed).toBeNaN()
  expect(result.sceneVersion).toBeUndefined()
  expect(result.manifestVerified).toBe(false)
})

it.each(['generic', 'memory_based', 'audio_rate_based', 'memory_and_audio_rate_based'] as const)('retains %s personalization when opening or restoring an episode', async personalizationLevel => {
  const result = await fromApi({ episodeId: 'synthetic-photo', status: 'prototype', createdAt: '2026-10-01', manifest: { cue: 'general', sceneId: 'riverside', durationSec: 75, personalizationLevel } })
  expect(result).toHaveProperty('personalizationLevel', personalizationLevel)
})

it('retains the recorded audio degradation and signal status for user-facing explanation', async () => {
  const result = await fromApi({ episodeId: 'synthetic-audio', status: 'prototype', createdAt: '2026-09-30', manifest: { cue: 'general', sceneId: 'riverside', durationSec: 75, degraded: true, degradationReason: 'audio_analysis_unavailable', audioObservation: { signalStatus: 'clipped' } } })
  expect(result).toMatchObject({ degraded: true, degradationReason: 'audio_analysis_unavailable', audioSignalStatus: 'clipped' })
})
