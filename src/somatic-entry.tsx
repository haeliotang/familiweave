import { useState, type KeyboardEvent } from 'react'
import type { Encounter } from './encounter'
import { createInnerCaptureEncounter } from './inner-encounter'
import { breaths, fragments, regions, sensations, type AssociativeFragmentId, type BreathState, type SomaticCapture, type SomaticRegion, type SomaticSensation } from './somatic'

const bodyRegions: Array<{ region: SomaticRegion; x: number; y: number; rx: number; ry: number }> = [
  { region: 'head', x: 110, y: 52, rx: 27, ry: 29 },
  { region: 'jaw', x: 110, y: 86, rx: 19, ry: 10 },
  { region: 'throat', x: 110, y: 103, rx: 13, ry: 10 },
  { region: 'shoulders', x: 110, y: 124, rx: 50, ry: 13 },
  { region: 'chest', x: 110, y: 164, rx: 35, ry: 27 },
  { region: 'stomach', x: 110, y: 217, rx: 30, ry: 25 },
  { region: 'hands', x: 43, y: 256, rx: 14, ry: 18 },
  { region: 'legs', x: 110, y: 340, rx: 28, ry: 75 },
]

function BodyMap({ region, onSelect }: { region: SomaticRegion | null; onSelect: (region: SomaticRegion) => void }) {
  const key = (value: SomaticRegion) => (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(value) }
  }
  return <div className="body-map-wrap">
    <svg className="body-map" viewBox="0 0 220 420" aria-label="身体地图">
      <path className="body-outline" d="M110 20 C126 20 138 33 138 50 C138 66 129 78 118 83 L118 92 C132 95 148 101 160 110 L184 170 L168 180 L145 132 L145 275 L128 405 L108 405 L110 286 L110 286 L112 405 L92 405 L75 275 L75 132 L52 180 L36 170 L60 110 C72 101 88 95 102 92 L102 83 C91 78 82 66 82 50 C82 33 94 20 110 20 Z" />
      {bodyRegions.map(item => <ellipse
        key={item.region}
        className={`body-region ${region === item.region ? 'selected' : ''}`}
        cx={item.x}
        cy={item.y}
        rx={item.rx}
        ry={item.ry}
        role="button"
        tabIndex={0}
        aria-label={regions.find(regionItem => regionItem.value === item.region)?.label}
        aria-pressed={region === item.region}
        onClick={() => onSelect(item.region)}
        onKeyDown={key(item.region)}
      />)}
    </svg>
    <button className={`body-back ${region === 'back' ? 'selected' : ''}`} onClick={() => onSelect('back')} aria-pressed={region === 'back'}>后背</button>
  </div>
}

export function SomaticEntry({ onStart }: { onStart: (encounter: Encounter) => void }) {
  const [region, setRegion] = useState<SomaticRegion | null>(null)
  const [sensation, setSensation] = useState<SomaticSensation | null>(null)
  const [intensity, setIntensity] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [breath, setBreath] = useState<BreathState | null>(null)
  const [selectedFragments, setSelectedFragments] = useState<AssociativeFragmentId[]>([])

  const toggleFragment = (id: AssociativeFragmentId) => {
    setSelectedFragments(current => current.includes(id)
      ? current.filter(item => item !== id)
      : current.length >= 3 ? current : [...current, id])
  }
  const canEnter = Boolean(region && sensation && breath && selectedFragments.length)
  const regionLabel = regions.find(item => item.value === region)?.label
  const sensationLabel = sensations.find(item => item.value === sensation)?.label

  return <form className="somatic-entry" onSubmit={event => {
    event.preventDefault()
    if (!canEnter || !region || !sensation || !breath) return
    const capture: SomaticCapture = { region, sensation, intensity, breath, fragments: selectedFragments }
    onStart(createInnerCaptureEncounter(capture))
  }}>
    <div className="somatic-step">
      <h2><span>1</span> 此刻，身体哪里最明显？</h2>
      <p className="step-note">不用解释，也不需要用语言描述。点一下最接近的位置。</p>
      <BodyMap region={region} onSelect={setRegion} />
      {regionLabel && <p className="selection-summary">已选择：{regionLabel}</p>}
    </div>

    <div className="somatic-step">
      <h2><span>2</span> 它更像什么？</h2>
      <div className="chip-row" role="group" aria-label="身体感觉">
        {sensations.map(item => <button type="button" key={item.value} className={`chip ${sensation === item.value ? 'selected' : ''}`} aria-pressed={sensation === item.value} onClick={() => setSensation(item.value)}>{item.label}</button>)}
      </div>
      <div className="intensity-row" role="group" aria-label="强度">
        <span>强度</span>
        {[1, 2, 3, 4, 5].map(value => <button type="button" key={value} className={`chip small ${intensity === value ? 'selected' : ''}`} aria-pressed={intensity === value} onClick={() => setIntensity(value as 1 | 2 | 3 | 4 | 5)}>{value}</button>)}
      </div>
      <div className="chip-row" role="group" aria-label="呼吸">
        {breaths.map(item => <button type="button" key={item.value} className={`chip ${breath === item.value ? 'selected' : ''}`} aria-pressed={breath === item.value} onClick={() => setBreath(item.value)}>{item.label}呼吸</button>)}
      </div>
    </div>

    <div className="somatic-step">
      <h2><span>3</span> 哪一块画面更接近？</h2>
      <p className="step-note">可以选 1–3 块。它们只是意象，不是答案。</p>
      <div className="fragment-grid">
        {fragments.map(fragment => {
          const selected = selectedFragments.includes(fragment.id)
          const atLimit = !selected && selectedFragments.length >= 3
          return <button type="button" key={fragment.id} className={`fragment-card palette-${fragment.palette} ${selected ? 'selected' : ''}`} aria-pressed={selected} disabled={atLimit} onClick={() => toggleFragment(fragment.id)}>
            <span className="fragment-visual" aria-hidden="true" />
            <span className="fragment-label">{fragment.label}</span>
          </button>
        })}
      </div>
    </div>

    <div className="actions">
      <button disabled={!canEnter}>进入这段空间</button>
      <span className="note">不解释、不诊断、不上传；这不是测量，也不会替你命名。</span>
    </div>
    {regionLabel && sensationLabel && <p className="selection-summary">{regionLabel} · {sensationLabel} · 强度 {intensity}/5 · {selectedFragments.length} 块意象</p>}
  </form>
}
