import { createServer } from 'node:http'
import { createInterface } from 'node:readline'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { WebSocketServer, type WebSocket } from 'ws'

const args = process.argv.slice(2)
const valueAfter = (flag: string) => {
  const index = args.indexOf(flag)
  return index >= 0 ? args[index + 1] : undefined
}
const port = Number(valueAfter('--port') ?? 8765)
const token = valueAfter('--token') ?? randomBytes(18).toString('base64url')
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('invalid --port')

function tokenMatches(expected: string, received: unknown) {
  if (typeof received !== 'string') return false
  const left = Buffer.from(expected)
  const right = Buffer.from(received)
  return left.length === right.length && timingSafeEqual(left, right)
}

function allowedOrigin(origin: string | undefined) {
  if (!origin) return true
  if (origin === 'tauri://localhost' || origin === 'http://tauri.localhost') return true
  try {
    const url = new URL(origin)
    return ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
  } catch {
    return false
  }
}

const server = createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ ok: true, bridge: 'bci-3', clients: wss.clients.size }))
    return
  }
  response.writeHead(404, { 'content-type': 'text/plain' })
  response.end('Familiweave BCI-3 local bridge\n')
})
const wss = new WebSocketServer({ server, path: '/bci', maxPayload: 256 * 1024 })
const authenticated = new Set<WebSocket>()

function send(socket: WebSocket, packet: unknown) {
  if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(packet))
}

function broadcast(packet: unknown) {
  for (const socket of authenticated) send(socket, packet)
}

wss.on('connection', (socket, request) => {
  if (!allowedOrigin(request.headers.origin)) {
    socket.close(1008, 'origin_not_allowed')
    return
  }
  const timeout = setTimeout(() => {
    send(socket, { type: 'error', message: 'bridge_hello_timeout' })
    socket.close(1008, 'hello_timeout')
  }, 5000)
  socket.on('message', raw => {
    let packet: { type?: string; token?: string; client?: string } | null = null
    try { packet = JSON.parse(String(raw)) } catch { packet = null }
    if (!packet || packet.type !== 'hello') {
      if (!authenticated.has(socket)) send(socket, { type: 'error', message: 'bridge_hello_required' })
      return
    }
    if (!tokenMatches(token, packet.token) || packet.client !== 'familiweave') {
      send(socket, { type: 'error', message: 'bridge_auth_failed' })
      socket.close(1008, 'auth_failed')
      return
    }
    clearTimeout(timeout)
    authenticated.add(socket)
    send(socket, {
      type: 'hello',
      sourceId: 'bci-3-bridge',
      kinds: ['heart_rate', 'eda', 'breath_phase', 'voice_energy', 'body_event', 'imagery_event', 'relationship_event'],
      sampleRateHz: 1,
    })
  })
  socket.on('close', () => { clearTimeout(timeout); authenticated.delete(socket) })
  socket.on('error', () => { clearTimeout(timeout); authenticated.delete(socket) })
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Familiweave BCI-3 local bridge listening on ws://127.0.0.1:${port}/bci`)
  console.log(`Token: ${token}`)
  console.log('Health: http://127.0.0.1:' + port + '/health')
  console.log('Pipe JSONL sample/samples packets via stdin; no raw samples are stored by this process.')
})

const input = createInterface({ input: process.stdin, crlfDelay: Infinity })
input.on('line', line => {
  if (!line.trim()) return
  try {
    const packet = JSON.parse(line) as { type?: string; sourceId?: string }
    if (packet.type !== 'sample' && packet.type !== 'samples') {
      console.error('Ignoring packet: expected type sample or samples')
      return
    }
    broadcast({ ...packet, sourceId: packet.sourceId ?? 'bci-3-bridge' })
  } catch (error) {
    console.error('Invalid JSONL packet:', error instanceof Error ? error.message : String(error))
  }
})

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    for (const socket of wss.clients) socket.close(1001, 'bridge_shutdown')
    server.close(() => process.exit(0))
  })
}
