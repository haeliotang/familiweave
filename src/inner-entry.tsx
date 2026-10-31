import { useState } from 'react'
import { createInnerEncounter } from './inner-encounter'
import type { InnerFeeling, InnerFormat } from './inner'
import type { Encounter } from './encounter'

const feelings: Array<{ value: InnerFeeling; label: string }> = [
  { value: 'unease', label: '说不清的不安' },
  { value: 'longing', label: '想念' },
  { value: 'calm', label: '平静' },
  { value: 'grief', label: '失落' },
  { value: 'anger', label: '愤怒' },
  { value: 'numbness', label: '麻木' },
]

export function InnerEntry({ onStart }: { onStart: (encounter: Encounter) => void }) {
  const [fragment, setFragment] = useState('')
  const [feeling, setFeeling] = useState<InnerFeeling | ''>('')
  const [format, setFormat] = useState<InnerFormat>('encounter')

  return (
    <form className="inner-entry" onSubmit={event => {
      event.preventDefault()
      if (!fragment.trim()) return
      onStart(createInnerEncounter({ fragment, feeling: feeling || undefined, format }))
    }}>
      <label htmlFor="inner-fragment">一段梦、一个画面、一个地点，或一种说不清的感觉</label>
      <textarea
        id="inner-fragment"
        value={fragment}
        onChange={event => setFragment(event.target.value)}
        placeholder="比如：一条走廊尽头有一扇门，门外是水。"
      />
      <div className="inner-options">
        <label>形式
          <select value={format} onChange={event => setFormat(event.target.value as InnerFormat)}>
            <option value="encounter">75 秒相遇</option>
            <option value="space">180 秒空间</option>
          </select>
        </label>
        <label>感觉（可选）
          <select value={feeling} onChange={event => setFeeling(event.target.value as InnerFeeling | '')}>
            <option value="">不选择</option>
            {feelings.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
      </div>
      <div className="actions">
        <button disabled={!fragment.trim()}>进入</button>
        <span className="note">不解释、不诊断、不上传；随时可以离开。</span>
      </div>
    </form>
  )
}
