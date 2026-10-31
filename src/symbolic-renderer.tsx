import { useEffect, useState } from 'react'
import type { InnerAction } from './inner'
import type { Encounter } from './encounter'
import type { WorldRendererProps } from './world-renderer'

export function validateSymbolic(encounter: Encounter) {
  if (!encounter.innerPlan) return '这次相遇没有内在景观计划，暂时无法进入。'
  if (encounter.innerPlan.durationSec !== 75) return '内在景观时长不是 75 秒，暂时无法进入。'
  return undefined
}

export function symbolicPhase(seconds: number): InnerAction {
  const t = Math.max(0, Math.min(75, seconds))
  if (t < 12) return 'arrive'
  if (t < 28) return 'notice'
  if (t < 43) return 'approach'
  if (t < 55) return 'pause'
  if (t < 68) return 'transform'
  return 'leave'
}

export function SymbolicRenderer({ encounter, replay }: WorldRendererProps) {
  const plan = encounter.innerPlan
  const [seconds, setSeconds] = useState(0)
  const [paused, setPaused] = useState(false)
  const [left, setLeft] = useState(false)

  useEffect(() => {
    setSeconds(0)
    setPaused(false)
    setLeft(false)
  }, [encounter.id, replay])

  useEffect(() => {
    if (!plan || paused || left) return
    const timer = window.setInterval(() => {
      setSeconds(value => {
        if (value >= plan.durationSec) return plan.durationSec
        return Math.min(plan.durationSec, value + 0.1)
      })
    }, 100)
    return () => window.clearInterval(timer)
  }, [plan, paused, left])

  if (!plan) return <div className="scene-placeholder" role="alert">这次相遇没有内在景观计划，暂时无法进入。</div>

  if (left) {
    return (
      <div className="symbolic-episode symbolic-left">
        <div className="symbolic-left-copy">
          <p>你离开了这个空间。</p>
          <button className="quiet" onClick={() => setLeft(false)}>重新进入</button>
        </div>
      </div>
    )
  }

  const phase = symbolicPhase(seconds)
  const done = seconds >= plan.durationSec
  return (
    <div className={`symbolic-episode motif-${plan.motifs[0]} phase-${phase}`} role="img" aria-label="象征空间">
      <div className="symbolic-sky" />
      <div className="symbolic-horizon" />
      <div className="symbolic-water" />
      <div className="symbolic-door" />
      <div className={`symbolic-figure figure-${plan.figure}`} />
      <div className="symbolic-fog" />
      <div className="symbolic-progress" aria-hidden="true"><span style={{ width: `${Math.min(100, seconds / plan.durationSec * 100)}%` }} /></div>
      <div className="symbolic-controls">
        <button className="quiet" onClick={() => setSeconds(value => Math.min(plan.durationSec, value + 8))}>靠近一点</button>
        <button className="quiet" onClick={() => setPaused(value => !value)}>{paused ? '继续停留' : '停留'}</button>
        <button className="quiet" onClick={() => setLeft(true)}>离开</button>
      </div>
      {done && <div className="symbolic-end" role="status"><p>这段空间结束了。</p><button className="quiet" onClick={() => { setSeconds(0); setPaused(false) }}>再进入一次</button></div>}
    </div>
  )
}
