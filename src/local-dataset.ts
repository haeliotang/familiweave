import { isMotifEntry, loadMotifs, motifStorageKey, type MotifEntry, type StorageLike } from './motif-journal'
import { isRelationshipTrigger, loadRelationshipTriggers, relationshipStorageKey, type RelationshipStorageLike, type RelationshipTrigger } from './relationship'

export interface LocalDataset {
  version: 'local-dataset-v1'
  exportedAt: string
  motifs: MotifEntry[]
  relationships: RelationshipTrigger[]
}

type DatasetStorage = StorageLike & RelationshipStorageLike

export function buildLocalDataset(storage: DatasetStorage, now = new Date().toISOString()): LocalDataset {
  return {
    version: 'local-dataset-v1',
    exportedAt: now,
    motifs: loadMotifs(storage),
    relationships: loadRelationshipTriggers(storage),
  }
}

export function exportLocalDataset(storage: DatasetStorage) {
  return JSON.stringify(buildLocalDataset(storage), null, 2)
}

export function clearLocalDataset(storage: DatasetStorage) {
  storage.removeItem(motifStorageKey)
  storage.removeItem(relationshipStorageKey)
}

export interface LocalSnapshot {
  motifs: MotifEntry[]
  relationships: RelationshipTrigger[]
}

export function localDatasetFromSnapshot(snapshot: LocalSnapshot, now = new Date().toISOString()): LocalDataset {
  return { version: 'local-dataset-v1', exportedAt: now, motifs: snapshot.motifs, relationships: snapshot.relationships }
}

export function parseLocalDataset(text: string): LocalSnapshot {
  const parsed: unknown = JSON.parse(text)
  if (!parsed || typeof parsed !== 'object') throw new Error('invalid_local_dataset')
  const data = parsed as { version?: unknown; motifs?: unknown; relationships?: unknown }
  if (data.version !== 'local-dataset-v1' || !Array.isArray(data.motifs) || !Array.isArray(data.relationships)) throw new Error('invalid_local_dataset')
  if (!data.motifs.every(isMotifEntry) || !data.relationships.every(isRelationshipTrigger)) throw new Error('invalid_local_dataset')
  return { motifs: data.motifs, relationships: data.relationships }
}
