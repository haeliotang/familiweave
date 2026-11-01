import { loadMotifs, motifStorageKey, type MotifEntry, type StorageLike } from './motif-journal'
import { loadRelationshipTriggers, relationshipStorageKey, type RelationshipStorageLike, type RelationshipTrigger } from './relationship'

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
