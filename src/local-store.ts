import { invoke } from '@tauri-apps/api/core'
import { isTauriRuntime } from './host'
import { isMotifEntry, loadMotifs, motifStorageKey, saveMotifs } from './motif-journal'
import { isRelationshipTrigger, loadRelationshipTriggers, relationshipStorageKey, saveRelationshipTriggers } from './relationship'
import type { LocalSnapshot } from './local-dataset'

function webStorage() {
  return typeof window === 'undefined' ? null : window.localStorage
}

export function readWebSnapshot(): LocalSnapshot {
  const storage = webStorage()
  if (!storage) return { motifs: [], relationships: [] }
  return {
    motifs: loadMotifs(storage),
    relationships: loadRelationshipTriggers(storage),
  }
}

function validateSnapshot(value: unknown): LocalSnapshot {
  if (!value || typeof value !== 'object') throw new Error('invalid_local_state')
  const snapshot = value as { motifs?: unknown; relationships?: unknown }
  if (!Array.isArray(snapshot.motifs) || !Array.isArray(snapshot.relationships)) throw new Error('invalid_local_state')
  if (!snapshot.motifs.every(isMotifEntry) || !snapshot.relationships.every(isRelationshipTrigger)) throw new Error('invalid_local_state')
  return { motifs: snapshot.motifs as LocalSnapshot['motifs'], relationships: snapshot.relationships as LocalSnapshot['relationships'] }
}

export async function loadLocalSnapshot(): Promise<LocalSnapshot> {
  const fallback = readWebSnapshot()
  if (!isTauriRuntime()) return fallback
  try {
    const host = validateSnapshot(await invoke('load_local_state'))
    if (host.motifs.length === 0 && host.relationships.length === 0 && (fallback.motifs.length || fallback.relationships.length)) {
      await saveLocalSnapshot(fallback)
      return fallback
    }
    return host
  } catch {
    return fallback
  }
}

export async function saveLocalSnapshot(snapshot: LocalSnapshot): Promise<void> {
  const storage = webStorage()
  if (storage) {
    saveMotifs(storage, snapshot.motifs)
    saveRelationshipTriggers(storage, snapshot.relationships)
  }
  if (!isTauriRuntime()) return
  try { await invoke('save_local_state', { snapshot }) } catch { /* keep the local web copy */ }
}

export async function clearLocalSnapshot(): Promise<void> {
  const storage = webStorage()
  storage?.removeItem(motifStorageKey)
  storage?.removeItem(relationshipStorageKey)
  if (!isTauriRuntime()) return
  try { await invoke('clear_local_state') } catch { /* local web copy already cleared */ }
}
