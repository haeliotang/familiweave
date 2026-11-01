import { isSomaticCapture, type SomaticCapture } from './somatic'
import { isSignalConsent, isVoiceTrace, type MotifSignals } from './somatic-signal'

export interface MotifEntry {
  version: 'motif-v1'
  id: string
  createdAt: string
  name: string
  capture: SomaticCapture
  signals?: MotifSignals
}

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export const motifStorageKey = 'familiweave.motifs.v1'
const maxEntries = 200

function normalizeName(name: string) {
  return name.trim().slice(0, 60)
}

function isMotifEntry(value: unknown): value is MotifEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Partial<MotifEntry>
  return entry.version === 'motif-v1'
    && typeof entry.id === 'string' && entry.id.length > 0
    && typeof entry.createdAt === 'string' && !Number.isNaN(Date.parse(entry.createdAt))
    && typeof entry.name === 'string'
    && isSomaticCapture(entry.capture)
    && (entry.signals === undefined || (isSignalConsent(entry.signals.consent) && (entry.signals.voice === undefined || isVoiceTrace(entry.signals.voice))))
}

export function loadMotifs(storage: StorageLike): MotifEntry[] {
  try {
    const raw = storage.getItem(motifStorageKey)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isMotifEntry).slice(0, maxEntries) : []
  } catch {
    return []
  }
}

export function saveMotifs(storage: StorageLike, entries: MotifEntry[]) {
  storage.setItem(motifStorageKey, JSON.stringify(entries.slice(0, maxEntries)))
}

export function addMotif(storage: StorageLike, input: { name?: string; capture: SomaticCapture; signals?: MotifSignals; now?: string }): MotifEntry[] {
  if (!isSomaticCapture(input.capture)) throw new Error('capture is incomplete')
  if (input.signals && (!isSignalConsent(input.signals.consent) || (input.signals.voice && !isVoiceTrace(input.signals.voice)))) throw new Error('signals are incomplete')
  const entry: MotifEntry = {
    version: 'motif-v1',
    id: crypto.randomUUID(),
    createdAt: input.now ?? new Date().toISOString(),
    name: normalizeName(input.name ?? ''),
    capture: input.capture,
    ...(input.signals ? { signals: input.signals } : {}),
  }
  const entries = [entry, ...loadMotifs(storage)].slice(0, maxEntries)
  saveMotifs(storage, entries)
  return entries
}

export function removeMotif(storage: StorageLike, id: string): MotifEntry[] {
  const entries = loadMotifs(storage).filter(entry => entry.id !== id)
  saveMotifs(storage, entries)
  return entries
}

export function clearMotifs(storage: StorageLike): MotifEntry[] {
  storage.removeItem(motifStorageKey)
  return []
}

export function exportMotifs(entries: MotifEntry[]) {
  return JSON.stringify({ version: 'motif-export-v1', exportedAt: new Date().toISOString(), entries }, null, 2)
}

export function motifDisplayName(entry: MotifEntry) {
  return entry.name || '未命名'
}
