import { buildLocalDataset, clearLocalDataset, exportLocalDataset } from './local-dataset'

export function LocalDataPanel() {
  const exportAll = () => {
    if (typeof window === 'undefined') return
    const blob = new Blob([exportLocalDataset(window.localStorage)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'familiweave-local-dataset.json'
    link.click()
    URL.revokeObjectURL(url)
  }
  const clearAll = () => {
    if (typeof window === 'undefined') return
    const data = buildLocalDataset(window.localStorage)
    if (!confirm(`删除本机全部数据？母题 ${data.motifs.length} 条、关系触发点 ${data.relationships.length} 条。此操作不可撤销。`)) return
    clearLocalDataset(window.localStorage)
    window.location.reload()
  }

  return <section className="local-data-panel" aria-labelledby="local-data-title">
    <h2 id="local-data-title">本机数据</h2>
    <p className="note">母题、关系触发点与可选声音摘要都保存在这个浏览器；不会上传。可以整体导出或删除。</p>
    <div className="actions">
      <button type="button" className="quiet" onClick={exportAll}>导出全部本机数据</button>
      <button type="button" className="quiet" onClick={clearAll}>删除全部本机数据</button>
    </div>
  </section>
}
