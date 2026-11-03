import { summarizeTimeline, type SignalKind, type SignalTimeline } from './signal-source'

export interface SignalSession {
  version: 'signal-session-v1'
  id: string
  createdAt: string
  startedAt: string
  endedAt: string
  sourceIds: string[]
  simulated: boolean
  summary: {
    durationSec: number
    sampleCount: number
    byKind: Array<{ kind: SignalKind; count: number }>
  }
}

export function createSignalSession(timeline: SignalTimeline, now = new Date().toISOString(), id: string = crypto.randomUUID()): SignalSession {
  const summary = summarizeTimeline(timeline)
  return {
    version: 'signal-session-v1',
    id,
    createdAt: now,
    startedAt: timeline.startedAt,
    endedAt: timeline.endedAt,
    sourceIds: [...timeline.sources],
    simulated: timeline.simulated,
    summary: { durationSec: summary.durationSec, sampleCount: summary.sampleCount, byKind: summary.byKind },
  }
}

export function isSignalSession(value: unknown): value is SignalSession {
  if (!value || typeof value !== 'object') return false
  const session = value as Partial<SignalSession>
  return session.version === 'signal-session-v1'
    && typeof session.id === 'string' && session.id.length > 0
    && typeof session.createdAt === 'string' && !Number.isNaN(Date.parse(session.createdAt))
    && typeof session.startedAt === 'string' && !Number.isNaN(Date.parse(session.startedAt))
    && typeof session.endedAt === 'string' && !Number.isNaN(Date.parse(session.endedAt))
    && Array.isArray(session.sourceIds) && session.sourceIds.every(source => typeof source === 'string')
    && typeof session.simulated === 'boolean'
    && Boolean(session.summary)
    && typeof session.summary?.durationSec === 'number'
    && typeof session.summary?.sampleCount === 'number'
    && Array.isArray(session.summary?.byKind)
}

export interface SignalSessionStorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export const signalSessionStorageKey = 'familiweave.signal-sessions.v1'
const maxSessions = 100

export function loadSignalSessions(storage: SignalSessionStorageLike): SignalSession[] {
  try {
    const raw = storage.getItem(signalSessionStorageKey)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isSignalSession).slice(0, maxSessions) : []
  } catch {
    return []
  }
}

export function saveSignalSessions(storage: SignalSessionStorageLike, sessions: SignalSession[]) {
  storage.setItem(signalSessionStorageKey, JSON.stringify(sessions.slice(0, maxSessions)))
}

export function clearSignalSessions(storage: SignalSessionStorageLike) {
  storage.removeItem(signalSessionStorageKey)
}
