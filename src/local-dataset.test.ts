import { describe, expect, it } from 'vitest'
import { buildLocalDataset, clearLocalDataset, exportLocalDataset, localDatasetFromSnapshot, parseLocalDataset } from './local-dataset'
import { addMotif, motifStorageKey } from './motif-journal'
import { addRelationshipTrigger, relationshipStorageKey } from './relationship'
import type { SomaticCapture } from './somatic'

function memoryStorage() {
  const values = new Map<string, string>()
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value) }, removeItem: (key: string) => { values.delete(key) } }
}

const capture: SomaticCapture = { region: 'chest', sensation: 'pressure', intensity: 3, breath: 'held', fragments: ['wet-corridor'] }

describe('local dataset import/export', () => {
  it('round-trips a validated local snapshot', () => {
    const storage = memoryStorage()
    addMotif(storage, { name: '旧门', capture })
    addRelationshipTrigger(storage, { situation: '很久没回复', cue: '', region: 'chest', sensation: 'tightness', intensity: 4, breath: 'shallow', response: 'freeze' })
    const snapshot = { motifs: buildLocalDataset(storage).motifs, relationships: buildLocalDataset(storage).relationships }
    const parsed = parseLocalDataset(JSON.stringify(localDatasetFromSnapshot(snapshot, '2026-11-01T00:00:00Z')))
    expect(parsed.motifs[0].name).toBe('旧门')
    expect(parsed.relationships[0].situation).toBe('很久没回复')
  })

  it('rejects a dataset with the wrong version or malformed records', () => {
    expect(() => parseLocalDataset('{}')).toThrow()
    expect(() => parseLocalDataset(JSON.stringify({ version: 'local-dataset-v1', motifs: [{ nope: true }], relationships: [] }))).toThrow()
  })
})

describe('local dataset export', () => {
  it('combines motifs and relationship triggers without a server', () => {
    const storage = memoryStorage()
    addMotif(storage, { name: '旧门', capture, now: '2026-11-01T00:00:00Z' })
    addRelationshipTrigger(storage, { role: '一个总在忙的人', situation: '很久没回复', cue: '屏幕暗下去', region: 'chest', sensation: 'tightness', intensity: 4, breath: 'shallow', response: 'freeze', now: '2026-11-01T00:00:00Z' })
    const dataset = buildLocalDataset(storage, '2026-11-01T00:00:00Z')
    expect(dataset).toMatchObject({ version: 'local-dataset-v1', motifs: [{ name: '旧门' }], relationships: [{ role: '一个总在忙的人' }] })
    expect(exportLocalDataset(storage)).not.toMatch(/audioData|rawAudio|diagnos|score/i)
  })

  it('clears both local stores explicitly', () => {
    const storage = memoryStorage()
    addMotif(storage, { capture })
    addRelationshipTrigger(storage, { situation: 'x', cue: '', region: 'chest', sensation: 'pressure', intensity: 1, breath: 'even', response: 'approach' })
    clearLocalDataset(storage)
    expect(storage.getItem(motifStorageKey)).toBeNull()
    expect(storage.getItem(relationshipStorageKey)).toBeNull()
  })
})
