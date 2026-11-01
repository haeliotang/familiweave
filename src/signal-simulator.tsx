import { useEffect, useRef, useState } from 'react'
import { grantLocalSignalConsent } from './somatic-signal'
import { SimulatedSignalSource, summarizeTimeline, traceToTimeline, type SignalSample, type SignalTimeline } from './signal-source'

export function SignalSimulator() {
  const [consent, setConsent] = useState(false)
  const [running, setRunning] = useState(false)
  const [samples, setSamples] = useState<SignalSample[]>([])
  const [timeline, setTimeline] = useState<SignalTimeline | null>(null)
  const source = useRef<SimulatedSignalSource | null>(null)
  const timeout = useRef<number | null>(null)
  const unsubscribe = useRef<(() => void) | null>(null)

  const stop = () => {
    if (timeout.current !== null) { window.clearTimeout(timeout.current); timeout.current = null }
    unsubscribe.current?.()
    unsubscribe.current = null
    if (!source.current) return
    try {
      const trace = source.current.stop()
      setTimeline(traceToTimeline(trace))
    } catch { /* already stopped */ }
    source.current = null
    setRunning(false)
  }

  useEffect(() => () => stop(), [])

  const start = () => {
    if (!consent || running) return
    const next = new SimulatedSignalSource()
    source.current = next
    setSamples([])
    setTimeline(null)
    unsubscribe.current = next.subscribe(sample => setSamples(current => [...current, sample]))
    next.start(grantLocalSignalConsent())
    setRunning(true)
    timeout.current = window.setTimeout(stop, 15000)
  }

  const latest = (kind: SignalSample['kind']) => [...samples].reverse().find(sample => sample.kind === kind)
  const heart = latest('heart_rate')
  const eda = latest('eda')
  const summary = timeline ? summarizeTimeline(timeline) : null

  const exportTimeline = () => {
    if (!timeline) return
    const blob = new Blob([JSON.stringify(timeline, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'familiweave-simulated-timeline.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return <section className="signal-lab" aria-labelledby="signal-lab-title">
    <h2 id="signal-lab-title">BCI-1 信号实验台</h2>
    <p className="note">这里产生的是<strong>模拟数据</strong>，不是你的身体信号，也不是医疗数据。用于验证时间轴、采样与导出管线。</p>
    <label className="remember-line"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} /> 我理解这是模拟信号，不是真实采集</label>
    <div className="actions">
      <button type="button" disabled={!consent || running} onClick={start}>运行 15 秒模拟</button>
      <button type="button" className="quiet" disabled={!running} onClick={stop}>停止</button>
      {timeline && <button type="button" className="quiet" onClick={exportTimeline}>导出时间轴 JSON</button>}
    </div>
    <div className="signal-readout">
      <span>心率模拟 {heart?.value ?? '—'} bpm</span>
      <span>EDA 模拟 {eda?.value ?? '—'} uS</span>
      <span>{running ? `采样中 · ${samples.length}` : timeline ? `已停止 · ${summary?.sampleCount ?? 0} 个样本` : '未开始'}</span>
    </div>
    {summary && <p className="note">时长 {summary.durationSec}s · 来源 {timeline?.sources.join(', ')} · {summary.simulated ? '模拟' : '真实'} · 仅本地</p>}
  </section>
}
