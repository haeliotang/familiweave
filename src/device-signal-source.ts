import { isSignalConsent, type SignalConsent } from './somatic-signal'
import type { SignalKind, SignalSample, SignalSource, SignalSourceCapabilities, SignalTrace } from './signal-source'

export type DeviceSourceState = 'idle' | 'connecting' | 'connected' | 'stopped' | 'error'

export interface BridgePacket {
  type: 'hello' | 'sample' | 'samples' | 'error'
  token?: string
  client?: string
  sourceId?: string
  kinds?: SignalKind[]
  sampleRateHz?: number
  tMs?: number
  kind?: SignalKind
  value?: number
  unit?: string
  label?: string
  samples?: Array<{ tMs?: number; kind: SignalKind; value?: number; unit?: string; label?: string }>
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
    .filter((sample): sample is { tMs?: number; kind: SignalKind; value?: number; unit?: string; label?: string } => Boolean(sample.kind && signalKinds.includes(sample.kind)))
    .map(sample => ({
      tMs: typeof sample.tMs === 'number' && Number.isFinite(sample.tMs) && sample.tMs >= 0 ? sample.tMs : receivedAtMs,
      kind: sample.kind,
      ...(typeof sample.value === 'number' ? { value: sample.value } : {}),
      ...(typeof sample.unit === 'string' ? { unit: sample.unit } : {}),
      ...(typeof sample.label === 'string' ? { label: sample.label } : {}),
      sourceId,
    }))
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

  constructor(private readonly url: string, private readonly token: string, private readonly onState?: (state: DeviceSourceState, message?: string) => void) {
    if (!isLocalBridgeUrl(url)) throw new Error('local_bridge_url_required')
  }

  start(consent: SignalConsent) {
    if (!isSignalConsent(consent)) throw new Error('local_signal_consent_required')
    if (this.socket) return
    this.consent = consent
    this.startedAt = new Date()
    this.samples = []
    this.onState?.('connecting')
    const socket = new WebSocket(this.url)
    this.socket = socket
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'hello', client: 'familiweave', token: this.token }))
      this.onState?.('connected')
    }
    socket.onerror = () => this.onState?.('error', 'bridge_connection_error')
    socket.onclose = () => {
      if (this.socket) this.onState?.('error', 'bridge_closed')
    }
    socket.onmessage = event => {
      try {
        const packet = JSON.parse(String(event.data)) as BridgePacket
        if (packet.type === 'error') { this.onState?.('error', packet.message ?? 'bridge_error'); return }
        const receivedAtMs = this.startedAt ? Date.now() - this.startedAt.getTime() : 0
        const samples = parseBridgePacket(packet, receivedAtMs, packet.sourceId ?? this.id)
        this.samples.push(...samples)
        for (const sample of samples) for (const listener of this.listeners) listener(sample)
      } catch {
        this.onState?.('error', 'invalid_bridge_packet')
      }
    }
  }

  stop(): SignalTrace {
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
