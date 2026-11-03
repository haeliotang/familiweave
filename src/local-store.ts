import { invoke } from '@tauri-apps/api/core'
import { isTauriRuntime } from './host'
import { isMotifEntry, loadMotifs, motifStorageKey, saveMotifs } from './motif-journal'
import { isRelationshipTrigger, loadRelationshipTriggers, relationshipStorageKey, saveRelationshipTriggers } from './relationship'
import type { LocalSnapshot } from './local-dataset'
import { clearFieldLayout, emptyFieldLayout, isFieldLayout, loadFieldLayout, saveFieldLayout } from './field'
import { clearSignalSessions, isSignalSession, loadSignalSessions, saveSignalSessions } from './signal-session'

function webStorage() {
  return typeof window === 'undefined' ? null : window.localStorage
}

export function readWebSnapshot(): LocalSnapshot {
  const storage = webStorage()
  if (!storage) return { motifs: [], relationships: [] }
  return {
    motifs: loadMotifs(storage),
    relationships: loadRelationshipTriggers(storage),
    field: loadFieldLayout(storage),
    signals: loadSignalSessions(storage),
  }
}

function validateSnapshot(value: unknown): LocalSnapshot {
  if (!value || typeof value !== 'object') throw new Error('invalid_local_state')
  const snapshot = value as { motifs?: unknown; relationships?: unknown; field?: unknown; signals?: unknown }
  if (!Array.isArray(snapshot.motifs) || !Array.isArray(snapshot.relationships)) throw new Error('invalid_local_state')
  if (!snapshot.motifs.every(isMotifEntry) || !snapshot.relationships.every(isRelationshipTrigger)) throw new Error('invalid_local_state')
  if (snapshot.field !== undefined && !isFieldLayout(snapshot.field)) throw new Error('invalid_local_state')
  if (snapshot.signals !== undefined && (!Array.isArray(snapshot.signals) || !snapshot.signals.every(isSignalSession))) throw new Error('invalid_local_state')
  return {
    motifs: snapshot.motifs as LocalSnapshot['motifs'],
    relationships: snapshot.relationships as LocalSnapshot['relationships'],
    field: snapshot.field ?? emptyFieldLayout(),
    signals: (snapshot.signals as LocalSnapshot['signals']) ?? [],
  }
}

export async function loadLocalSnapshot(): Promise<LocalSnapshot> {
  const fallback = readWebSnapshot()
  if (!isTauriRuntime()) return fallback
  try {
    const host = validateSnapshot(await invoke('load_local_state'))
    const hostHasField = Boolean(host.field && (Object.keys(host.field.positions).length || host.field.links.length))
    const fallbackHasField = Boolean(fallback.field && (Object.keys(fallback.field.positions).length || fallback.field.links.length))
    const hostHasSignals = Boolean(host.signals?.length)
    const fallbackHasSignals = Boolean(fallback.signals?.length)
    if (host.motifs.length === 0 && host.relationships.length === 0 && !hostHasField && !hostHasSignals && (fallback.motifs.length || fallback.relationships.length || fallbackHasField || fallbackHasSignals)) {
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
    saveFieldLayout(storage, snapshot.field ?? emptyFieldLayout())
    saveSignalSessions(storage, snapshot.signals ?? [])
  }
  if (!isTauriRuntime()) return
  try { await invoke('save_local_state', { snapshot }) } catch { /* keep the local web copy */ }
}

export async function clearLocalSnapshot(): Promise<void> {
  const storage = webStorage()
  storage?.removeItem(motifStorageKey)
  storage?.removeItem(relationshipStorageKey)
  if (storage) { clearFieldLayout(storage); clearSignalSessions(storage) }
  if (!isTauriRuntime()) return
  try { await invoke('clear_local_state') } catch { /* local web copy already cleared */ }
}
