import { useEffect, useRef, useState } from 'react'
import { grantLocalSignalConsent } from './somatic-signal'
import { WebSocketSignalSource, type DeviceSourceState } from './device-signal-source'
import { summarizeTimeline, traceToTimeline, type SignalSample, type SignalTimeline } from './signal-source'
import { useLanguage } from './i18n'

export function DeviceSignalPanel() {
  const { t } = useLanguage()
  const [url, setUrl] = useState('ws://127.0.0.1:8765')
  const [consent, setConsent] = useState(false)
  const [state, setState] = useState<DeviceSourceState>('idle')
  const [message, setMessage] = useState('')
  const [samples, setSamples] = useState<SignalSample[]>([])
  const [timeline, setTimeline] = useState<SignalTimeline | null>(null)
  const source = useRef<WebSocketSignalSource | null>(null)
  const unsubscribe = useRef<(() => void) | null>(null)

  const stop = () => {
    unsubscribe.current?.()
    unsubscribe.current = null
    if (!source.current) return
    try {
      const trace = source.current.stop()
      setTimeline(traceToTimeline(trace))
    } catch { /* no trace */ }
    source.current = null
    setState('stopped')
  }

  useEffect(() => () => stop(), [])

  const start = () => {
    if (!consent) return
    stop()
    setSamples([])
    setTimeline(null)
    setMessage('')
    try {
      const next = new WebSocketSignalSource(url, (nextState, nextMessage) => {
        setState(nextState)
        if (nextMessage) setMessage(nextMessage)
      })
      source.current = next
      unsubscribe.current = next.subscribe(sample => setSamples(current => [...current, sample]))
      next.start(grantLocalSignalConsent())
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : '无法连接本机桥接')
    }
  }

  const exportTimeline = () => {
    if (!timeline) return
    const blob = new Blob([JSON.stringify(timeline, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'familiweave-device-timeline.json'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const summary = timeline ? summarizeTimeline(timeline) : null
  return <section className="device-lab" aria-labelledby="device-lab-title">
    <h2 id="device-lab-title">{t('BCI-2 设备桥接（实验）')}</h2>
    <p className="note">{t('连接')}<strong>{t('本机')}</strong>{t(' WebSocket 桥接，接收 JSON 样本。浏览器不直接读 LSL，也不上传数据；原始信号默认不保存。')}</p>
    <label className="device-url">{t('本机桥接地址')}
      <input value={url} onChange={event => setUrl(event.target.value)} placeholder="ws://127.0.0.1:8765" />
    </label>
    <label className="remember-line"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} /> {t('我同意连接本机设备桥接，并理解这不是临床数据')}</label>
    <div className="actions">
      <button type="button" disabled={!consent || state === 'connecting' || state === 'connected'} onClick={start}>{state === 'connecting' ? t('连接中…') : t('连接桥接')}</button>
      <button type="button" className="quiet" disabled={!source.current} onClick={stop}>{t('断开')}</button>
      {timeline && <button type="button" className="quiet" onClick={exportTimeline}>{t('导出设备时间轴')}</button>}
    </div>
    <div className="signal-readout">
      <span>{t('状态')}：{state}</span>
      <span>{t('样本')}：{timeline ? summary?.sampleCount ?? 0 : samples.length}</span>
      {message && <span role="status">{t('错误')}：{message}</span>}
    </div>
    {source.current && <p className="note">{t('等待本机桥接发送 hello / sample / samples JSON 包；不会保存原始信号。')}</p>}
  </section>
}
