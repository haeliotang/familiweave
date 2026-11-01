import { useRef, useState } from 'react'
import { localDatasetFromSnapshot, parseLocalDataset, type LocalSnapshot } from './local-dataset'
import { exportLocalTimeline } from './local-timeline'

export function LocalDataPanel({ snapshot, onImport, onClear }: { snapshot: LocalSnapshot; onImport: (snapshot: LocalSnapshot) => void; onClear: () => void }) {
  const input = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState('')

  const download = (contents: string, name: string) => {
    const blob = new Blob([contents], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
    URL.revokeObjectURL(url)
  }
  const exportAll = () => download(JSON.stringify(localDatasetFromSnapshot(snapshot), null, 2), 'familiweave-local-dataset.json')
  const exportTimeline = () => download(exportLocalTimeline(localDatasetFromSnapshot(snapshot)), 'familiweave-local-timeline.json')
  const importFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const next = parseLocalDataset(await file.text())
      onImport(next)
      setStatus(`已导入 ${next.motifs.length} 个母题、${next.relationships.length} 条关系触发点。`)
    } catch {
      setStatus('导入失败：需要 familiweave 导出的 local-dataset-v1 JSON。')
    } finally {
      if (input.current) input.current.value = ''
    }
  }

  return <section className="local-data-panel" aria-labelledby="local-data-title">
    <h2 id="local-data-title">本机数据</h2>
    <p className="note">母题、关系触发点与可选声音摘要都保存在本机；不会上传。可以整体导出、导入或删除。</p>
    <div className="actions">
      <button type="button" className="quiet" onClick={exportAll}>导出全部本机数据</button>
      <button type="button" className="quiet" onClick={exportTimeline}>导出本机时间轴</button>
      <button type="button" className="quiet" onClick={() => input.current?.click()}>导入本机数据</button>
      <button type="button" className="quiet" onClick={() => { if (confirm(`删除本机全部数据？母题 ${snapshot.motifs.length} 条、关系触发点 ${snapshot.relationships.length} 条。此操作不可撤销。`)) onClear() }}>删除全部本机数据</button>
      <input ref={input} type="file" accept="application/json,.json" hidden onChange={event => void importFile(event.target.files?.[0])} />
    </div>
    {status && <p className="note" role="status">{status}</p>}
  </section>
}
