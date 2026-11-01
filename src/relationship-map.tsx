import { useState } from 'react'
import { breaths, regions, sensations, type BreathState, type SomaticRegion, type SomaticSensation } from './somatic'
import { exportRelationshipTriggers, responseLabels, responses, summarizeRelationshipTriggers, type RelationshipInput, type RelationshipResponse, type RelationshipSummary, type RelationshipTrigger } from './relationship'

function TriggerSummary({ summary }: { summary: RelationshipSummary }) {
  if (!summary.total) return null
  const groups = [
    { title: '身体位置', items: summary.regions },
    { title: '感觉', items: summary.sensations },
    { title: '自动反应', items: summary.responses },
  ]
  return <div className="trigger-summary">
    <p className="note">共 {summary.total} 条。下面只是按你选过的字段计数，不是解释，也不代表因果。</p>
    <div className="trigger-summary-grid">
      {groups.map(group => <div key={group.title}>
        <h3>{group.title}</h3>
        {group.items.slice(0, 5).map(item => <p key={item.value}>{item.label} · {item.count}</p>)}
      </div>)}
    </div>
  </div>
}

function TriggerMap({ entries }: { entries: RelationshipTrigger[] }) {
  const shown = entries.slice(0, 8)
  return <svg className="trigger-map" viewBox="0 0 360 300" role="img" aria-label="关系触发点地图，节点由用户自己命名">
    <circle cx="180" cy="150" r="118" className="trigger-orbit" />
    <circle cx="180" cy="150" r="30" className="trigger-self" />
    <text x="180" y="155" textAnchor="middle" className="trigger-self-label">我</text>
    {shown.map((entry, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(shown.length, 1) - Math.PI / 2
      const x = 180 + Math.cos(angle) * 118
      const y = 150 + Math.sin(angle) * 118
      const label = entry.role || entry.situation || entry.cue || '未命名'
      return <g key={entry.id}>
        <line x1="180" y1="150" x2={x} y2={y} className="trigger-edge" />
        <circle cx={x} cy={y} r="17" className="trigger-node" />
        <text x={x} y={y + 4} textAnchor="middle" className="trigger-node-label">{label.slice(0, 4)}</text>
      </g>
    })}
    {entries.length > 8 && <text x="180" y="288" textAnchor="middle" className="trigger-more">还有 {entries.length - 8} 条</text>}
  </svg>
}

export function RelationshipJournal({ entries, onAdd, onRemove, onClear }: { entries: RelationshipTrigger[]; onAdd: (input: RelationshipInput) => void; onRemove: (id: string) => void; onClear: () => void }) {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState('')
  const [situation, setSituation] = useState('')
  const [cue, setCue] = useState('')
  const [region, setRegion] = useState<SomaticRegion>('chest')
  const [sensation, setSensation] = useState<SomaticSensation>('tightness')
  const [intensity, setIntensity] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [breath, setBreath] = useState<BreathState>('shallow')
  const [response, setResponse] = useState<RelationshipResponse>('freeze')
  const canSave = Boolean(situation.trim() || cue.trim())
  const summary = summarizeRelationshipTriggers(entries)

  const save = () => {
    if (!canSave) return
    onAdd({ role, situation, cue, region, sensation, intensity, breath, response })
    setRole(''); setSituation(''); setCue(''); setOpen(false)
  }
  const exportAll = () => {
    if (!entries.length) return
    const blob = new Blob([exportRelationshipTriggers(entries)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'familiweave-relationship-triggers.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return <section className="relationship-journal" aria-labelledby="relationship-title">
    <div className="journal-header">
      <div>
        <h2 id="relationship-title">关系触发点</h2>
        <p className="note">只记录你自己写下的瞬间；不分析对方，不做匹配，不推断“依恋类型”。</p>
      </div>
      <div className="actions">
        <button type="button" className="quiet" onClick={() => setOpen(value => !value)}>{open ? '收起' : '添加触发点'}</button>
        {entries.length > 0 && <button type="button" className="quiet" onClick={exportAll}>导出 JSON</button>}
        {entries.length > 0 && <button type="button" className="quiet" onClick={() => { if (confirm('删除本机全部关系触发点？此操作不可撤销。')) onClear() }}>全部删除</button>}
      </div>
    </div>

    {open && <div className="relationship-form">
      <p className="step-note">请不要写对方真实姓名；用角色或化名即可。全部只保存在本机。</p>
      <label>对方角色（可留空）<input value={role} maxLength={40} onChange={event => setRole(event.target.value)} placeholder="比如：一个总在忙的人" /></label>
      <label>当时的场景<input value={situation} maxLength={100} onChange={event => setSituation(event.target.value)} placeholder="比如：对方很久没有回复" /></label>
      <label>那个瞬间<input value={cue} maxLength={100} onChange={event => setCue(event.target.value)} placeholder="比如：我看到手机屏幕暗下去" /></label>
      <div className="relationship-grid">
        <label>身体位置<select value={region} onChange={event => setRegion(event.target.value as SomaticRegion)}>{regions.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label>感觉<select value={sensation} onChange={event => setSensation(event.target.value as SomaticSensation)}>{sensations.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label>强度<select value={intensity} onChange={event => setIntensity(Number(event.target.value) as 1 | 2 | 3 | 4 | 5)}>{[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value}</option>)}</select></label>
        <label>呼吸<select value={breath} onChange={event => setBreath(event.target.value as BreathState)}>{breaths.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
      </div>
      <div className="chip-row" role="group" aria-label="自动反应">
        {responses.map(item => <button type="button" key={item.value} className={`chip ${response === item.value ? 'selected' : ''}`} aria-pressed={response === item.value} onClick={() => setResponse(item.value)}>{item.label}</button>)}
      </div>
      <div className="actions"><button type="button" disabled={!canSave} onClick={save}>保存到本机</button><span className="note">不解释、不评分、不推断。</span></div>
    </div>}

    {entries.length === 0
      ? <p className="note">还没有关系触发点。你可以记录一个让你身体先反应的瞬间。</p>
      : <>
        <TriggerMap entries={entries} />
        <TriggerSummary summary={summary} />
        <ul className="motif-list">
          {entries.map(entry => <li key={entry.id} className="motif-item">
            <div className="motif-main"><span className="motif-name">{entry.role || '未命名的角色'}</span><span className="motif-date">{new Date(entry.createdAt).toLocaleDateString('zh-CN')}</span></div>
            <p className="motif-meta">{entry.situation || '未写场景'} · {entry.cue || '未写瞬间'}<br />{regions.find(item => item.value === entry.region)?.label} · {sensations.find(item => item.value === entry.sensation)?.label} · 强度 {entry.intensity}/5 · {responseLabels[entry.response]}</p>
            <button type="button" className="quiet small" onClick={() => onRemove(entry.id)}>删除这条</button>
          </li>)}
        </ul>
      </>}
  </section>
}
