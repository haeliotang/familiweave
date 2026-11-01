import { breaths, fragments, regions, sensations } from './somatic'
import { exportMotifs, motifDisplayName, type MotifEntry } from './motif-journal'

export function MotifJournal({ entries, onRemove, onClear }: { entries: MotifEntry[]; onRemove: (id: string) => void; onClear: () => void }) {
  const exportAll = () => {
    if (!entries.length) return
    const blob = new Blob([exportMotifs(entries)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'familiweave-motifs.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return <section className="motif-journal" aria-labelledby="motif-journal-title">
    <div className="journal-header">
      <div>
        <h2 id="motif-journal-title">本机母题日记</h2>
        <p className="note">只保存在这个浏览器；没有解释，也没有评分。</p>
      </div>
      <div className="actions">
        {entries.length > 0 && <button type="button" className="quiet" onClick={exportAll}>导出 JSON</button>}
        {entries.length > 0 && <button type="button" className="quiet" onClick={() => { if (confirm('删除本机全部母题？此操作不可撤销。')) onClear() }}>全部删除</button>}
      </div>
    </div>
    {entries.length === 0
      ? <p className="note">还没有母题。从身体开始时，可以选择留下一个名字。</p>
      : <ul className="motif-list">
        {entries.map(entry => <li key={entry.id} className="motif-item">
          <div className="motif-main">
            <span className="motif-name">{motifDisplayName(entry)}</span>
            <span className="motif-date">{new Date(entry.createdAt).toLocaleDateString('zh-CN')}</span>
          </div>
          <p className="motif-meta">
            {regions.find(item => item.value === entry.capture.region)?.label}
            {' · '}
            {sensations.find(item => item.value === entry.capture.sensation)?.label}
            {' · 强度 '}{entry.capture.intensity}/5
            {' · '}{breaths.find(item => item.value === entry.capture.breath)?.label}呼吸
            {' · '}{entry.capture.fragments.map(id => fragments.find(fragment => fragment.id === id)?.label ?? id).join(' / ')}
          </p>
          <button type="button" className="quiet small" onClick={() => onRemove(entry.id)}>删除这条</button>
        </li>)}
      </ul>}
  </section>
}
