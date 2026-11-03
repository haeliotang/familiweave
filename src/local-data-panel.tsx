import { useRef, useState } from 'react'
import { localDatasetFromSnapshot, parseLocalDataset, type LocalSnapshot } from './local-dataset'
import { exportLocalTimeline } from './local-timeline'
import { useLanguage } from './i18n'
import { decryptBackup, encryptBackup, isSecureBackup } from './secure-backup'

export function LocalDataPanel({ snapshot, onImport, onClear }: { snapshot: LocalSnapshot; onImport: (snapshot: LocalSnapshot) => void; onClear: () => void }) {
  const { t } = useLanguage()
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
  const exportEncrypted = async () => {
    const passphrase = window.prompt(t('设置备份口令（至少 8 位）'))
    if (!passphrase) return
    if (passphrase.length < 8) { setStatus(t('备份口令至少 8 位')); return }
    if (window.prompt(t('再次输入备份口令')) !== passphrase) { setStatus(t('两次口令不一致')); return }
    try {
      download(JSON.stringify(await encryptBackup(localDatasetFromSnapshot(snapshot), passphrase), null, 2), 'familiweave-encrypted-backup.json')
      setStatus(t('已生成加密备份；口令无法找回。'))
    } catch { setStatus(t('加密备份失败')) }
  }
  const exportTimeline = () => download(exportLocalTimeline(localDatasetFromSnapshot(snapshot)), 'familiweave-local-timeline.json')
  const importFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const text = await file.text()
      const parsed: unknown = JSON.parse(text)
      let next
      if (isSecureBackup(parsed)) {
        const passphrase = window.prompt(t('输入加密备份口令'))
        if (!passphrase) throw new Error('backup_passphrase_cancelled')
        next = parseLocalDataset(JSON.stringify(await decryptBackup(parsed, passphrase)))
      } else {
        next = parseLocalDataset(text)
      }
      onImport(next)
      setStatus(`${t('已导入')} ${next.motifs.length} ${t('个母题')}、${next.relationships.length} ${t('条关系触发点')}。`)
    } catch {
      setStatus(t('导入失败：需要 familiweave 导出的 local-dataset-v1/v2 或加密备份 JSON。'))
    } finally {
      if (input.current) input.current.value = ''
    }
  }

  return <section className="local-data-panel" aria-labelledby="local-data-title">
    <h2 id="local-data-title">{t('本机数据')}</h2>
    <p className="note">{t('母题、关系触发点与可选声音摘要都保存在本机；不会上传。可以整体导出、导入或删除。')}</p>
    <div className="actions">
      <button type="button" className="quiet" onClick={exportAll}>{t('导出全部本机数据')}</button>
      <button type="button" className="quiet" onClick={() => void exportEncrypted()}>{t('导出加密备份')}</button>
      <button type="button" className="quiet" onClick={exportTimeline}>{t('导出本机时间轴')}</button>
      <button type="button" className="quiet" onClick={() => input.current?.click()}>{t('导入本机数据')}</button>
      <button type="button" className="quiet" onClick={() => { if (confirm(t('删除本机全部数据？此操作不可撤销。'))) onClear() }}>{t('删除全部本机数据')}</button>
      <input ref={input} type="file" accept="application/json,.json" hidden onChange={event => void importFile(event.target.files?.[0])} />
    </div>
    {status && <p className="note" role="status">{status}</p>}
  </section>
}
