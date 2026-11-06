import { isSignalConsent, type SignalConsent } from './somatic-signal'
import type { SignalKind, SignalSample, SignalSource, SignalSourceCapabilities, SignalTrace } from './signal-source'

export type DeviceSourceState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'stopped' | 'error'

export interface BridgePacket {
  type: 'hello' | 'sample' | 'samples' | 'error'
  token?: string
  client?: string
  sourceId?: string
  kinds?: SignalKind[]
  sampleRateHz?: number
  seq?: number
  streamId?: string
  tMs?: number
  kind?: SignalKind
  value?: number
  unit?: string
  label?: string
  samples?: Array<{ tMs?: number; seq?: number; kind: SignalKind; value?: number; unit?: string; label?: string }>
  message?: string
}

const signalKinds: SignalKind[] = ['heart_rate', 'eda', 'breath_phase', 'voice_energy', 'body_event', 'imagery_event', 'relationship_event']

export function isLocalBridgeUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'ws:' && ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
  } catch {
    return false
  }
}

export function parseBridgePacket(packet: unknown, receivedAtMs: number, sourceId: string): SignalSample[] {
  if (!packet || typeof packet !== 'object') return []
  const data = packet as BridgePacket
  if (data.type !== 'sample' && data.type !== 'samples') return []
  const raw: Array<{ tMs?: number; kind?: SignalKind; value?: number; unit?: string; label?: string }> = data.type === 'sample'
    ? [{ tMs: data.tMs, kind: data.kind, value: data.value, unit: data.unit, label: data.label }]
    : (data.samples ?? [])
  return raw
    .filter((sample): sample is { tMs?: number; seq?: number; kind: SignalKind; value?: number; unit?: string; label?: string } => Boolean(sample.kind && signalKinds.includes(sample.kind)))
    .map(sample => ({
      tMs: typeof sample.tMs === 'number' && Number.isFinite(sample.tMs) && sample.tMs >= 0 ? sample.tMs : receivedAtMs,
      kind: sample.kind,
      ...(typeof sample.value === 'number' && Number.isFinite(sample.value) ? { value: sample.value } : {}),
      ...(typeof sample.unit === 'string' ? { unit: sample.unit } : {}),
      ...(typeof sample.label === 'string' ? { label: sample.label } : {}),
      sourceId,
    }))
}

export interface BridgeHealth {
  samples: number
  reconnects: number
  rejected: number
  expectedIntervalMs: number | null
  meanIntervalMs: number | null
  maxGapMs: number | null
  jitterPercent: number | null
}

/** Deterministic exponential backoff used by the local bridge client. */
export function reconnectDelay(attempt: number): number {
  return Math.min(5_000, 250 * 2 ** Math.max(0, attempt - 1))
}

/**
 * BCI-2 bridge contract. The browser only connects to a localhost WebSocket
 * bridge; it does not speak LSL directly and never uploads samples.
 */
export class WebSocketSignalSource implements SignalSource {
  readonly id = 'local-bridge'
  readonly label = '本机 LSL/设备桥接'
  readonly capabilities: SignalSourceCapabilities = {
    kinds: ['heart_rate', 'eda', 'breath_phase', 'voice_energy', 'body_event', 'imagery_event', 'relationship_event'],
    requiresPermission: true,
    rawSignal: true,
    localOnly: true,
    simulated: false,
  }

  private socket: WebSocket | null = null
  private consent: SignalConsent | null = null
  private startedAt: Date | null = null
  private samples: SignalSample[] = []
  private listeners = new Set<(sample: SignalSample) => void>()
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private stopped = false
  private expectedIntervalMs: number | null = null
  private sampleTimes: number[] = []
  private rejected = 0
  private reconnects = 0

  constructor(private readonly url: string, private readonly token: string, private readonly onState?: (state: DeviceSourceState, message?: string) => void) {
    if (!isLocalBridgeUrl(url)) throw new Error('local_bridge_url_required')
  }

  start(consent: SignalConsent) {
    if (!isSignalConsent(consent)) throw new Error('local_signal_consent_required')
    if (this.socket) return
    this.consent = consent
    this.startedAt = new Date()
    this.samples = []
    this.sampleTimes = []
    this.rejected = 0
    this.reconnects = 0
    this.reconnectAttempts = 0
    this.stopped = false
    this.clearReconnect()
    this.open()
  }

  private clearReconnect() {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private open() {
    if (this.stopped) return
    const socket = new WebSocket(this.url)
    this.socket = socket
    this.onState?.(this.reconnects ? 'reconnecting' : 'connecting')
    socket.onopen = () => {
      this.reconnectAttempts = 0
      socket.send(JSON.stringify({ type: 'hello', client: 'tacitweave', token: this.token }))
      this.onState?.('connected')
    }
    socket.onerror = () => this.onState?.('error', 'bridge_connection_error')
    socket.onclose = () => {
      if (this.socket !== socket) return
      this.socket = null
      if (this.stopped) return
      this.scheduleReconnect()
    }
    socket.onmessage = event => {
      try {
        const packet = JSON.parse(String(event.data)) as BridgePacket
        if (packet.type === 'hello') {
          if (typeof packet.sampleRateHz === 'number' && Number.isFinite(packet.sampleRateHz) && packet.sampleRateHz > 0) this.expectedIntervalMs = 1000 / packet.sampleRateHz
          return
        }
        if (packet.type === 'error') { this.onState?.('error', packet.message ?? 'bridge_error'); return }
        const receivedAtMs = this.startedAt ? Date.now() - this.startedAt.getTime() : 0
        const samples = parseBridgePacket(packet, receivedAtMs, packet.sourceId ?? this.id)
        this.rejected += samples.length ? 0 : 1
        this.samples.push(...samples)
        this.sampleTimes.push(...samples.map(sample => sample.tMs))
        for (const sample of samples) for (const listener of this.listeners) listener(sample)
      } catch {
        this.rejected += 1
        this.onState?.('error', 'invalid_bridge_packet')
      }
    }
  }

  private scheduleReconnect() {
    if (this.stopped || this.reconnectTimer !== null) return
    this.reconnectAttempts += 1
    this.reconnects += 1
    if (this.reconnectAttempts > 8) {
      this.onState?.('error', 'bridge_reconnect_exhausted')
      return
    }
    this.onState?.('reconnecting', `bridge_reconnect_${this.reconnectAttempts}`)
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.open()
    }, reconnectDelay(this.reconnectAttempts))
  }

  health(): BridgeHealth {
    const ordered = [...this.sampleTimes].sort((left, right) => left - right)
    const gaps = ordered.slice(1).map((value, index) => value - ordered[index]).filter(value => value > 0)
    const meanIntervalMs = gaps.length ? gaps.reduce((sum, value) => sum + value, 0) / gaps.length : null
    const jitterMs = meanIntervalMs === null || this.expectedIntervalMs === null
      ? null
      : Number(gaps.reduce((sum, value) => sum + Math.abs(value - this.expectedIntervalMs!), 0) / gaps.length / this.expectedIntervalMs! * 100).toFixed(2)
    return {
      samples: this.samples.length,
      reconnects: this.reconnects,
      rejected: this.rejected,
      expectedIntervalMs: this.expectedIntervalMs,
      meanIntervalMs: meanIntervalMs === null ? null : Number(meanIntervalMs.toFixed(2)),
      maxGapMs: gaps.length ? Math.max(...gaps) : null,
      jitterPercent: jitterMs === null ? null : Number(jitterMs),
    }
  }

  stop(): SignalTrace {
    this.stopped = true
    this.clearReconnect()
    const socket = this.socket
    this.socket = null
    socket?.close()
    this.onState?.('stopped')
    if (!this.consent || !this.startedAt) throw new Error('signal_source_not_started')
    return {
      version: 'signal-trace-v1',
      sourceId: this.id,
      startedAt: this.startedAt.toISOString(),
      endedAt: new Date().toISOString(),
      consent: this.consent,
      samples: [...this.samples],
      simulated: false,
    }
  }

  subscribe(listener: (sample: SignalSample) => void) {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }
}
