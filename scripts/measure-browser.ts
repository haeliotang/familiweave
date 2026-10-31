// Local-only browser measurement. Requires `pnpm dev`, `pnpm dev:local-api`
// and a Chrome instance started with --remote-debugging-port=9222.
const cdp = 'http://127.0.0.1:9222'
const targets = await (await fetch(`${cdp}/json`)).json() as Array<{ type: string; webSocketDebuggerUrl: string; url: string }>
const page = targets.find(target => target.type === 'page')
if (!page) throw new Error('no page target; start Chrome with --remote-debugging-port=9222')
const socket = new WebSocket(page.webSocketDebuggerUrl)
await new Promise<void>((resolve, reject) => { socket.onopen = () => resolve(); socket.onerror = () => reject(new Error('CDP websocket failed')) })
let nextId = 0
const pending = new Map<number, (message: any) => void>()
socket.onmessage = event => {
  const message = JSON.parse(String(event.data))
  if (message.id && pending.has(message.id)) { pending.get(message.id)!(message); pending.delete(message.id) }
}
function send(method: string, params: Record<string, unknown> = {}) {
  return new Promise<any>((resolve, reject) => {
    const id = ++nextId
    pending.set(id, message => message.error ? reject(new Error(`${method}: ${message.error.message}`)) : resolve(message.result))
    socket.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression: string, awaitPromise = false) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text ?? 'evaluation failed')
  return result.result.value
}
await send('Page.enable')
await send('Network.enable')
await send('Network.setCacheDisabled', { cacheDisabled: true })
await send('Runtime.enable')
await send('Page.navigate', { url: 'http://127.0.0.1:5173/' })
await new Promise(resolve => setTimeout(resolve, 2500))
const navigation = await evaluate(`(() => {
  const nav = performance.getEntriesByType('navigation')[0]
  return nav ? { domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd), loadMs: Math.round(nav.loadEventEnd), transferSize: nav.transferSize } : null
})()`)
const paints = await evaluate(`performance.getEntriesByType('paint').map(entry => ({ name: entry.name, startTime: Math.round(entry.startTime) }))`)
const initialText = await evaluate(`document.body.innerText.slice(0, 120)`)
const clicked = await evaluate(`(() => {
  const button = [...document.querySelectorAll('button')].find(item => item.textContent?.includes('空间示例'))
  button?.click()
  return Boolean(button)
})()`)
await new Promise(resolve => setTimeout(resolve, 1200))
const symbolic = await evaluate(`Boolean(document.querySelector('.symbolic-episode'))`)
const frames = await evaluate(`new Promise(resolve => {
  const intervals = []
  let last = performance.now()
  const start = last
  function tick(now) {
    intervals.push(now - last)
    last = now
    if (now - start < 2000) requestAnimationFrame(tick)
    else {
      const sorted = [...intervals].sort((a, b) => a - b)
      resolve({ samples: intervals.length, avgMs: Number((intervals.reduce((sum, value) => sum + value, 0) / intervals.length).toFixed(2)), p95Ms: Number(sorted[Math.floor(sorted.length * .95)].toFixed(2)) })
    }
  }
  requestAnimationFrame(tick)
})`, true)
process.stdout.write(`${JSON.stringify({ navigation, paints, initialText, clickedSpaceDemo: clicked, symbolicMounted: symbolic, frameSample: frames }, null, 2)}\n`)
socket.close()
