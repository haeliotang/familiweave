import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import type { Encounter } from './encounter'
import { createInnerCaptureEncounter } from './inner-encounter'
import { InnerEntry } from './inner-entry'
import { SomaticEntry } from './somatic-entry'
import { MotifJournal } from './motif-journal-view'
import { RelationshipJournal } from './relationship-map'
import { SignalSimulator } from './signal-simulator'
import { DeviceSignalPanel } from './device-signal-panel'
import { LocalDataPanel } from './local-data-panel'
import { SceneView } from './scene-loader'
import { createMotif, loadMotifs, type MotifEntry } from './motif-journal'
import { createRelationshipTrigger, loadRelationshipTriggers, type RelationshipInput, type RelationshipTrigger } from './relationship'
import { clearLocalSnapshot, loadLocalSnapshot, saveLocalSnapshot } from './local-store'
import type { LocalSnapshot } from './local-dataset'
import { useLanguage, type Language } from './i18n'
import { useTheme } from './theme'
import { getDbStatus, getHostInfo, isTauriRuntime, type DbStatus, type HostInfo } from './host'
import { fragments, regions, sensations, breaths } from './somatic'
import { addFieldLink, clampFieldPosition, emptyFieldLayout, fieldNodeKey, loadFieldLayout, removeFieldLink, removeFieldNode, resetFieldPositions, setFieldPosition, type FieldLayout } from './field'
import { createSignalSession, loadSignalSessions, type SignalSession } from './signal-session'

type View = 'field' | 'new' | 'motif' | 'journal' | 'relationship' | 'lab' | 'settings' | 'space'
type FieldLens = 'constellation' | 'body' | 'imagery' | 'relations'
type FieldRange = 'all' | '30d' | '90d'
type DetailTab = 'overview' | 'body' | 'imagery' | 'relationship'

const navItems: Array<{ id: Exclude<View, 'motif' | 'space'>; label: string; icon: string }> = [
  { id: 'field', label: '场域', icon: '◌' },
  { id: 'journal', label: '母题日记', icon: '◫' },
  { id: 'relationship', label: '关系触发点', icon: '◇' },
  { id: 'lab', label: '信号实验台', icon: '◉' },
  { id: 'settings', label: '本机与设置', icon: '⚙' },
]

function dateLabel(iso: string, lang: Language) {
  return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function localizedLabel(items: ReadonlyArray<{ value: string; label: string; labelEn: string }>, value: string, lang: Language) {
  const item = items.find(entry => entry.value === value)
  return lang === 'en' ? item?.labelEn : item?.label
}

function hostLabel(host: HostInfo | null, db: DbStatus | null, lang: Language) {
  if (!host) return lang === 'en' ? 'Web preview · localStorage' : 'Web 预览 · localStorage'
  const database = db?.ready ? (lang === 'en' ? `SQLite ${db.tables} tables` : `SQLite ${db.tables} 表`) : (lang === 'en' ? 'SQLite ready' : 'SQLite 已就绪')
  return `${host.platform} · Tauri 2 · ${database}`
}

function checkItem(label: string, present: boolean, detail?: string) {
  return <li key={label} className={`check-item ${present ? 'present' : 'absent'}`}>
    <span className="check-mark">{present ? '✓' : '—'}</span>
    <span><strong>{label}</strong>{detail && <small>{detail}</small>}</span>
  </li>
}

function WorkspaceHeader({ eyebrow, title, meta, action }: { eyebrow: string; title: string; meta?: string; action?: ReactNode }) {
  return <header className="workspace-header">
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {meta && <p className="workspace-meta">{meta}</p>}
    </div>
    {action}
  </header>
}

function MotifDetail({ motif, tab, setTab, onEnter }: { motif: MotifEntry; tab: DetailTab; setTab: (tab: DetailTab) => void; onEnter: () => void }) {
  const { lang, t } = useLanguage()
  const voice = motif.signals?.voice
  return <>
    <WorkspaceHeader
      eyebrow={t('母题')}
      title={motif.name || '未命名'}
      meta={`${dateLabel(motif.createdAt, lang)} · ${t('本机保存')} · ${motif.capture.fragments.length} ${t('块意象')}`}
      action={<button className="primary-button" onClick={onEnter}>{t('进入空间')}</button>}
    />
    {tab === 'overview' && <div className="detail-grid">
      <section className="paper-card span-2">
        <p className="card-label">{t('身体线索')}</p>
        <h2>{localizedLabel(regions, motif.capture.region, lang)} · {localizedLabel(sensations, motif.capture.sensation, lang)}</h2>
        <p className="muted">{t('强度')} {motif.capture.intensity}/5 · {localizedLabel(breaths, motif.capture.breath, lang)} {t('呼吸')}</p>
      </section>
      <section className="paper-card">
        <p className="card-label">{t('意象碎片')}</p>
        <p>{motif.capture.fragments.map(id => { const fragment = fragments.find(item => item.id === id); return fragment ? fragment[lang === 'en' ? 'labelEn' : 'label'] : id }).join(' / ')}</p>
      </section>
      <section className="paper-card">
        <p className="card-label">{t('可选声音摘要')}</p>
        <p>{voice ? `${t('音量均值')} ${voice.rmsMean.toFixed(3)} · ${t('停顿比例')} ${voice.pauseRatio.toFixed(2)}` : t('这次没有声音摘要')}</p>
      </section>
      <section className="paper-card span-2">
        <p className="card-label">{t('可以做什么')}</p>
        <p className="muted">{t('进入一段 75 秒象征空间；系统不解释这个母题，也不替它命名。离开随时可用。')}</p>
      </section>
    </div>}
    {tab === 'body' && <section className="paper-card">
      <p className="card-label">{t('身体线索')}</p>
      <div className="detail-rows">
        <div><span>{t('位置')}</span><strong>{localizedLabel(regions, motif.capture.region, lang)}</strong></div>
        <div><span>{t('感觉')}</span><strong>{localizedLabel(sensations, motif.capture.sensation, lang)}</strong></div>
        <div><span>{t('强度')}</span><strong>{motif.capture.intensity} / 5</strong></div>
        <div><span>{t('呼吸')}</span><strong>{localizedLabel(breaths, motif.capture.breath, lang)}</strong></div>
      </div>
    </section>}
    {tab === 'imagery' && <section className="paper-card">
      <p className="card-label">{t('意象碎片')}</p>
      <div className="imagery-list">{motif.capture.fragments.map(id => {
        const fragment = fragments.find(item => item.id === id)
        return <div className="imagery-tile" key={id}><span className={`imagery-swatch palette-${fragment?.palette}`} /><span>{fragment ? fragment[lang === 'en' ? 'labelEn' : 'label'] : id}</span></div>
      })}</div>
    </section>}
    {tab === 'relationship' && <section className="paper-card">
      <p className="card-label">{t('关系')}</p>
      <p>{t('关系触发点单独保存在「关系触发点」里；这里不推断它们与当前母题的因果关系。')}</p>
      <p className="muted">{t('这是有意的边界：并列可以，解释不行。')}</p>
    </section>}
  </>
}

function FieldView({ motifs, relationships, selectedId, lens, range, layout, onChange, onSelect, onNew, onDemo, onRangeChange }: { motifs: MotifEntry[]; relationships: RelationshipTrigger[]; selectedId: string | null; lens: FieldLens; range: FieldRange; layout: FieldLayout; onChange: (layout: FieldLayout) => void; onSelect: (id: string) => void; onNew: () => void; onDemo: () => void; onRangeChange: (range: FieldRange) => void }) {
  const { lang, t } = useLanguage()
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [linkMode, setLinkMode] = useState(false)
  const [linkSource, setLinkSource] = useState<string | null>(null)
  const [drag, setDrag] = useState<{ key: string; dx: number; dy: number } | null>(null)
  const [draft, setDraft] = useState<FieldLayout['positions'] | null>(null)
  const center = { x: 380, y: 268 }
  const showRelations = lens === 'relations'
  const motifLimit = motifs.slice(0, 14)
  const relationLimit = relationships.slice(0, 10)
  const fallback = (index: number, count: number, inner = false) => {
    const angle = (Math.PI * 2 * index) / Math.max(count, 1) + (inner ? Math.PI / 7 : -Math.PI / 2)
    const radiusX = inner ? 0.12 : 0.22
    const radiusY = inner ? 0.1 : 0.2
    return { x: 0.5 + Math.cos(angle) * radiusX, y: 0.5 + Math.sin(angle) * radiusY }
  }
  const positionOf = (key: string, fallbackPosition: { x: number; y: number }) => draft?.[key] ?? layout.positions[key] ?? fallbackPosition
  const motifNodes = motifLimit.map((motif, index) => ({ motif, key: fieldNodeKey('motif', motif.id), position: positionOf(fieldNodeKey('motif', motif.id), fallback(index, motifLimit.length)) }))
  const relationNodes = relationLimit.map((entry, index) => ({ entry, key: fieldNodeKey('relationship', entry.id), position: positionOf(fieldNodeKey('relationship', entry.id), fallback(index, relationLimit.length, true)) }))
  const nodeMap = new Map<string, { x: number; y: number; kind: 'motif' | 'relationship'; id: string; label: string }>()
  motifNodes.forEach(node => nodeMap.set(node.key, { x: node.position.x * 760, y: node.position.y * 536, kind: 'motif', id: node.motif.id, label: node.motif.name || t('未命名') }))
  relationNodes.forEach(node => nodeMap.set(node.key, { x: node.position.x * 760, y: node.position.y * 536, kind: 'relationship', id: node.entry.id, label: node.entry.role || t('关系触发点') }))
  const visibleLinks = layout.links.filter(link => nodeMap.has(link.from) && nodeMap.has(link.to) && (showRelations || (!link.from.startsWith('relationship:') && !link.to.startsWith('relationship:'))))

  const pointToField = (clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return { x: center.x, y: center.y }
    const x = ((clientX - rect.left) / rect.width) * 760
    const y = ((clientY - rect.top) / rect.height) * 536
    return { x: center.x + (x - center.x) / zoom, y: center.y + (y - center.y) / zoom }
  }

  const startDrag = (key: string, event: ReactPointerEvent<SVGGElement>) => {
    if (event.button !== 0) return
    event.stopPropagation()
    if (linkMode) {
      if (linkSource === key) setLinkSource(null)
      else if (!linkSource) setLinkSource(key)
      else {
        onChange(addFieldLink(layout, linkSource, key))
        setLinkSource(null)
        setLinkMode(false)
      }
      return
    }
    const node = nodeMap.get(key)
    if (!node) return
    const point = pointToField(event.clientX, event.clientY)
    setDrag({ key, dx: node.x - point.x, dy: node.y - point.y })
    svgRef.current?.setPointerCapture?.(event.pointerId)
  }

  const moveDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!drag) return
    const point = pointToField(event.clientX, event.clientY)
    const next = clampFieldPosition({ x: (point.x + drag.dx) / 760, y: (point.y + drag.dy) / 536 })
    setDraft(current => ({ ...(current ?? {}), [drag.key]: next }))
  }

  const endDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!drag) return
    if (draft) {
      let next = layout
      for (const [key, position] of Object.entries(draft)) next = setFieldPosition(next, key, position)
      onChange(next)
    }
    setDrag(null)
    setDraft(null)
    svgRef.current?.releasePointerCapture?.(event.pointerId)
  }

  const activateNode = (key: string) => {
    if (linkMode) return
    const node = nodeMap.get(key)
    if (node?.kind === 'motif') onSelect(node.id)
  }

  const resetLayout = () => {
    if (drag || linkMode) return
    onChange(resetFieldPositions(layout))
  }

  return <div className={`field-view lens-${lens}`}>
    <div className="field-heading">
      <div><p className="eyebrow">{t('场域')}</p><h1>{t('你的内在地形')}</h1><p className="workspace-meta">{t('母题、意象与关系触发点并列在这里；没有解释，只有你写下的结构。')}</p></div>
      <button className="primary-button" onClick={onNew}>{t('新建片段')}</button>
    </div>
    {motifs.length === 0 && relationships.length === 0
      ? <div className="field-empty"><p>{t('场域还是空的。先从一个身体位置开始。')}</p><div className="field-empty-actions"><button className="primary-button" onClick={onNew}>{t('开始捕获')}</button><button className="quiet-button" onClick={onDemo}>{t('载入示例场域')}</button></div></div>
      : <>
        <div className="field-tools" role="toolbar" aria-label={t('场域工具')}>
          <select value={range} onChange={event => onRangeChange(event.target.value as FieldRange)} aria-label={t('时间范围')}>
            <option value="all">{t('全部时间')}</option>
            <option value="30d">{t('近 30 天')}</option>
            <option value="90d">{t('近 90 天')}</option>
          </select>
          <span className="field-tool-sep" />
          <button type="button" className={linkMode ? 'active' : ''} aria-pressed={linkMode} onClick={() => { setLinkMode(value => !value); setLinkSource(null) }}>{linkMode ? t('取消连接') : t('连接')}</button>
          <button type="button" onClick={() => setZoom(value => Math.min(1.6, Math.round((value + 0.1) * 10) / 10))} aria-label={t('放大')}>＋</button>
          <span className="field-zoom">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom(value => Math.max(0.7, Math.round((value - 0.1) * 10) / 10))} aria-label={t('缩小')}>−</button>
          <button type="button" onClick={resetLayout}>{t('重置布局')}</button>
          <span className="field-tool-hint">{linkMode ? (linkSource ? t('再选择一个节点') : t('先选择一个节点')) : t('拖动节点排列；点击连线删除')}</span>
        </div>
        <div className="field-canvas">
          <svg ref={svgRef} viewBox="0 0 760 536" role="img" aria-label={t('内在场域地图')} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
            <defs><radialGradient id="field-glow"><stop offset="0%" stopColor="currentColor" stopOpacity=".16" /><stop offset="100%" stopColor="currentColor" stopOpacity="0" /></radialGradient></defs>
            <g transform={`translate(${center.x} ${center.y}) scale(${zoom}) translate(-${center.x} -${center.y})`}>
              <circle cx={center.x} cy={center.y} r="210" className="field-orbit" />
              <circle cx={center.x} cy={center.y} r="136" className="field-orbit inner" />
              <circle cx={center.x} cy={center.y} r="220" fill="url(#field-glow)" className="field-glow" />
              {motifNodes.map(node => <line key={`e-${node.motif.id}`} x1={center.x} y1={center.y} x2={node.position.x * 760} y2={node.position.y * 536} className="field-edge" />)}
              {showRelations && relationNodes.map(node => <line key={`re-${node.entry.id}`} x1={center.x} y1={center.y} x2={node.position.x * 760} y2={node.position.y * 536} className="field-edge relation-edge" />)}
              {visibleLinks.map(link => {
                const from = nodeMap.get(link.from)
                const to = nodeMap.get(link.to)
                if (!from || !to) return null
                return <line key={link.id} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="field-user-link" onClick={event => { event.stopPropagation(); onChange(removeFieldLink(layout, link.id)) }}><title>{t('点击删除连接')}</title></line>
              })}
              <circle cx={center.x} cy={center.y} r="34" className="field-self" />
              <text x={center.x} y={center.y + 4} textAnchor="middle" className="field-self-label">{t('我')}</text>
              {motifNodes.map(node => <g key={node.key} role="button" tabIndex={0} className={`field-node region-${node.motif.capture.region} ${selectedId === node.motif.id ? 'selected' : ''} ${linkSource === node.key ? 'link-source' : ''} ${drag?.key === node.key ? 'dragging' : ''}`} onPointerDown={event => startDrag(node.key, event)} onClick={() => activateNode(node.key)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activateNode(node.key) } }}>
                <circle cx={node.position.x * 760} cy={node.position.y * 536} r={lens === 'imagery' ? 14 + node.motif.capture.fragments.length * 2 : 17} />
                <text x={node.position.x * 760} y={node.position.y * 536 + 34} textAnchor="middle" className="field-node-label">{node.motif.name ? node.motif.name.slice(0, 14) : t('未命名')}</text>
                {lens === 'body' && <text x={node.position.x * 760} y={node.position.y * 536 + 48} textAnchor="middle" className="field-node-sub">{localizedLabel(regions, node.motif.capture.region, lang)}</text>}
              </g>)}
              {showRelations && relationNodes.map(node => <g key={node.key} role="button" tabIndex={0} className={`field-relation-node ${linkSource === node.key ? 'link-source' : ''}`} transform={`translate(${node.position.x * 760},${node.position.y * 536}) rotate(45)`} onPointerDown={event => startDrag(node.key, event)} onClick={() => activateNode(node.key)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activateNode(node.key) } }}>
                <rect x="-9" y="-9" width="18" height="18" rx="3" />
              </g>)}
            </g>
          </svg>
        </div>
        <div className="field-legend">
          <span><i className="legend-dot motif" />{t('母题')} · {motifs.length}</span>
          <span><i className="legend-dot relation" />{t('关系触发点')} · {relationships.length}</span>
          <span className="field-signal"><i className="signal-pulse" />{t('信号')}{lang === 'en' ? ': ' : '：'}{t('本机信号层')} · BCI-1/2</span>
          <span className="field-lens-note">{t('镜头')}：{t(lens === 'constellation' ? '星座' : lens === 'body' ? '身体' : lens === 'imagery' ? '意象' : '关系')}</span>
        </div>
      </>}
  </div>
}

function TimelineRail({ motifs, relationships, onSelect }: { motifs: MotifEntry[]; relationships: RelationshipTrigger[]; onSelect: (id: string) => void }) {
  const { lang, t } = useLanguage()
  const items = [...motifs.map(entry => ({ kind: 'motif' as const, id: entry.id, at: entry.createdAt, name: entry.name || t('未命名') })), ...relationships.map(entry => ({ kind: 'relation' as const, id: entry.id, at: entry.createdAt, name: entry.role || t('关系触发点') }))]
    .sort((left, right) => Date.parse(left.at) - Date.parse(right.at)).slice(-12)
  return <div className="timeline-rail">
    <span className="timeline-label">{t('时间轴')}</span>
    <div className="timeline-track">
      {items.length === 0 && <span className="timeline-empty">{t('还没有记录')}</span>}
      {items.map(item => <button key={`${item.kind}-${item.id}`} className={`timeline-item ${item.kind}`} disabled={item.kind === 'relation'} onClick={() => item.kind === 'motif' && onSelect(item.id)} title={item.name}>
        <span className="timeline-dot" /><span className="timeline-name">{item.name}</span><span className="timeline-date">{dateLabel(item.at, lang)}</span>
      </button>)}
    </div>
    <span className="timeline-now">{t('现在')}</span>
  </div>
}

function ContextPanel({ motif, encounter, onEnter, onBack, onDetail }: { motif: MotifEntry | null; encounter: Encounter | null; onEnter: () => void; onBack: () => void; onDetail: () => void }) {
  const { lang, t } = useLanguage()
  if (encounter) {
    return <aside className="context-panel">
      <div className="context-heading"><span>{t('当前空间')}</span><span className="local-badge">{t('本地')}</span></div>
      <p className="context-lead">{t('空间在中间运行。你可以靠近、停留或离开；离开也是体验的一部分。')}</p>
      <button className="primary-button wide" onClick={onBack}>{t('返回工作台')}</button>
      <div className="context-section">
        <p className="card-label">{t('这次的空间')}</p>
        <p className="muted">{encounter.innerPlan?.format === 'space' ? t('180 秒空间') : t('75 秒相遇')} · {t('无声')} · symbolic</p>
      </div>
      <div className="context-note">
        <p className="card-label">{t('不解释')}</p>
        <p>{t('空间不提供梦的字典，也不声称知道它“意味着什么”。')}</p>
      </div>
    </aside>
  }
  const voice = motif?.signals?.voice
  return <aside className="context-panel">
    <div className="context-heading"><span>{t('空间将收到的内容')}</span><span className="local-badge">{t('不上传')}</span></div>
    <ul className="check-list">
      {checkItem(t('身体位置'), Boolean(motif), motif ? localizedLabel(regions, motif.capture.region, lang) : t('先选择一个母题'))}
      {checkItem(t('感觉与强度'), Boolean(motif), motif ? `${localizedLabel(sensations, motif.capture.sensation, lang)} · ${motif.capture.intensity}/5` : undefined)}
      {checkItem(t('意象碎片'), Boolean(motif), motif ? `${motif.capture.fragments.length} ${t('块')}` : undefined)}
      {checkItem(t('可选声音摘要'), Boolean(voice), voice ? t('仅摘要，不含原始音频') : t('这次没有'))}
      {checkItem(t('关系触发点'), false, t('不进入空间；保持独立'))}
    </ul>
    <button className="primary-button wide" disabled={!motif} onClick={onEnter}>{t('进入 75 秒空间')}</button>
    {motif && <button className="quiet-button wide" onClick={onDetail}>{t('打开母题详情')}</button>}
    <div className="context-section">
      <p className="card-label">{t('事件流')}</p>
      <p className="muted">{t('还没有活动。进入空间后，这里会显示当前会话。')}</p>
    </div>
    <div className="context-note">
      <p className="card-label">{t('下一步')}</p>
      <p>{motif ? t('进入空间，看看它如何变化；也可以回到母题日记继续记录。') : t('先从身体开始，选一个最明显的位置。')}</p>
    </div>
    <p className="context-privacy">{t('不解释、不诊断、默认不上传。所有母题与关系记录只在本机。')}</p>
  </aside>
}

export function DesktopShell() {
  const { lang, setLang, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const [view, setView] = useState<View>('field')
  const [fieldLens, setFieldLens] = useState<FieldLens>('constellation')
  const [fieldRange, setFieldRange] = useState<FieldRange>('all')
  const [fieldLayout, setFieldLayout] = useState<FieldLayout>(() => typeof window === 'undefined' ? emptyFieldLayout() : loadFieldLayout(window.localStorage))
  const [signalSessions, setSignalSessions] = useState<SignalSession[]>(() => typeof window === 'undefined' ? [] : loadSignalSessions(window.localStorage))
  const [detailTab, setDetailTab] = useState<DetailTab>('overview')
  const [motifs, setMotifs] = useState<MotifEntry[]>(() => typeof window === 'undefined' ? [] : loadMotifs(window.localStorage))
  const [relationships, setRelationships] = useState<RelationshipTrigger[]>(() => typeof window === 'undefined' ? [] : loadRelationshipTriggers(window.localStorage))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [encounter, setEncounter] = useState<Encounter | null>(null)
  const [replay, setReplay] = useState(0)
  const [textMode, setTextMode] = useState(false)
  const [search, setSearch] = useState('')
  const [host, setHost] = useState<HostInfo | null>(null)
  const [db, setDb] = useState<DbStatus | null>(null)

  useEffect(() => {
    void (async () => {
      const info = await getHostInfo()
      setHost(info)
      if (info) setDb(await getDbStatus())
    })()
  }, [])

  useEffect(() => {
    let active = true
    void loadLocalSnapshot().then(snapshot => {
      if (!active) return
      setMotifs(snapshot.motifs)
      setRelationships(snapshot.relationships)
      setFieldLayout(snapshot.field ?? emptyFieldLayout())
      setSignalSessions(snapshot.signals ?? [])
      setSelectedId(current => current && snapshot.motifs.some(motif => motif.id === current) ? current : null)
    })
    return () => { active = false }
  }, [])

  const rangeDays = fieldRange === 'all' ? Infinity : fieldRange === '90d' ? 90 : 30
  const rangeStart = Number.isFinite(rangeDays) ? Date.now() - rangeDays * 86_400_000 : 0
  const visibleMotifs = rangeStart ? motifs.filter(motif => Date.parse(motif.createdAt) >= rangeStart) : motifs
  const visibleRelationships = rangeStart ? relationships.filter(entry => Date.parse(entry.createdAt) >= rangeStart) : relationships
  const selected = motifs.find(motif => motif.id === selectedId) ?? null
  const filtered = useMemo(() => motifs.filter(motif => !search.trim() || (motif.name || '未命名').includes(search.trim())), [motifs, search])

  const openNew = () => { setEncounter(null); setSelectedId(null); setView('field'); setDetailTab('overview') }
  const openMotif = (id: string) => { setSelectedId(id); setEncounter(null); setView('field'); setDetailTab('overview') }
  const start = (next: Encounter) => { setEncounter(next); setView('space') }
  const enterSelected = () => { if (selected) start(createInnerCaptureEncounter(selected.capture)) }
  const backFromSpace = () => { setEncounter(null); setView(selected ? 'field' : 'new') }
  const persist = (nextMotifs: MotifEntry[], nextRelationships: RelationshipTrigger[], nextField = fieldLayout, nextSignals = signalSessions) => {
    void saveLocalSnapshot({ motifs: nextMotifs, relationships: nextRelationships, field: nextField, signals: nextSignals })
  }
  const remember = (capture: Parameters<typeof createMotif>[0]['capture'], name: string, signals?: Parameters<typeof createMotif>[0]['signals']) => {
    const entry = createMotif({ capture, name, signals })
    const next = [entry, ...motifs]
    setMotifs(next)
    setSelectedId(entry.id)
    persist(next, relationships, fieldLayout, signalSessions)
  }
  const remove = (id: string) => {
    const next = motifs.filter(motif => motif.id !== id)
    setMotifs(next)
    if (selectedId === id) setSelectedId(null)
    const nextField = removeFieldNode(fieldLayout, fieldNodeKey('motif', id))
    setFieldLayout(nextField)
    persist(next, relationships, nextField, signalSessions)
  }
  const addRelationship = (input: RelationshipInput) => {
    const next = [createRelationshipTrigger(input), ...relationships]
    setRelationships(next)
    persist(motifs, next, fieldLayout, signalSessions)
  }
  const removeRelationship = (id: string) => {
    const next = relationships.filter(entry => entry.id !== id)
    setRelationships(next)
    const nextField = removeFieldNode(fieldLayout, fieldNodeKey('relationship', id))
    setFieldLayout(nextField)
    persist(motifs, next, nextField, signalSessions)
  }
  const importSnapshot = (snapshot: LocalSnapshot) => {
    setMotifs(snapshot.motifs)
    setRelationships(snapshot.relationships)
    setFieldLayout(snapshot.field ?? emptyFieldLayout())
    setSignalSessions(snapshot.signals ?? [])
    setSelectedId(null)
    void saveLocalSnapshot({ ...snapshot, field: snapshot.field ?? emptyFieldLayout(), signals: snapshot.signals ?? [] })
  }
  const clearAll = () => {
    setMotifs([])
    setRelationships([])
    setFieldLayout(emptyFieldLayout())
    setSignalSessions([])
    setSelectedId(null)
    void clearLocalSnapshot()
  }

  const updateFieldLayout = (next: FieldLayout) => {
    setFieldLayout(next)
    void saveLocalSnapshot({ motifs, relationships, field: next, signals: signalSessions })
  }

  const recordSignalSession = (session: SignalSession) => {
    const next = [session, ...signalSessions].slice(0, 100)
    setSignalSessions(next)
    void saveLocalSnapshot({ motifs, relationships, field: fieldLayout, signals: next })
  }

  const loadDemo = () => {
    const demoMotifs = [
      createMotif({ name: lang === 'en' ? 'Demo · door in the chest' : '示例 · 胸口的旧门', capture: { region: 'chest', sensation: 'pressure', intensity: 4, breath: 'held', fragments: ['wet-corridor', 'dusk-stairs'] } }),
      createMotif({ name: lang === 'en' ? 'Demo · empty platform' : '示例 · 空站台', capture: { region: 'stomach', sensation: 'hollowness', intensity: 3, breath: 'shallow', fragments: ['empty-platform'] } }),
    ]
    const demoRelationship = createRelationshipTrigger({ role: lang === 'en' ? 'Someone busy' : '一个总在忙的人', situation: lang === 'en' ? 'No reply for days' : '很久没有回复', cue: lang === 'en' ? 'The screen goes dark' : '屏幕暗下去', region: 'chest', sensation: 'tightness', intensity: 3, breath: 'shallow', response: 'freeze' })
    const layout = { ...emptyFieldLayout(), positions: {
      [fieldNodeKey('motif', demoMotifs[0].id)]: { x: 0.34, y: 0.38 },
      [fieldNodeKey('motif', demoMotifs[1].id)]: { x: 0.68, y: 0.68 },
      [fieldNodeKey('relationship', demoRelationship.id)]: { x: 0.46, y: 0.7 },
    }, links: [] as FieldLayout['links'] }
    const linked = addFieldLink(addFieldLink(layout, fieldNodeKey('motif', demoMotifs[0].id), fieldNodeKey('motif', demoMotifs[1].id)), fieldNodeKey('motif', demoMotifs[1].id), fieldNodeKey('relationship', demoRelationship.id))
    setMotifs(demoMotifs)
    setRelationships([demoRelationship])
    setFieldLayout(linked)
    setSelectedId(demoMotifs[0].id)
    setFieldLens('relations')
    persist(demoMotifs, [demoRelationship], linked, signalSessions)
  }

  const navView = view === 'motif' || view === 'space' ? 'field' : view

  const topTabs = view === 'field'
    ? (['constellation', 'body', 'imagery', 'relations'] as FieldLens[]).map(lens => ({ id: lens, label: t(lens === 'constellation' ? '星座' : lens === 'body' ? '身体' : lens === 'imagery' ? '意象' : '关系'), active: fieldLens === lens, onClick: () => setFieldLens(lens) }))
    : view === 'new'
    ? [
        { id: 'somatic', label: t('从身体开始'), active: !textMode, onClick: () => setTextMode(false) },
        { id: 'text', label: t('用文字'), active: textMode, onClick: () => setTextMode(true) },
      ]
    : view === 'motif' && selected
      ? ([['overview', t('总览')], ['body', t('身体')], ['imagery', t('意象')], ['relationship', t('关系')]] as Array<[DetailTab, string]>).map(([id, label]) => ({ id, label, active: detailTab === id, onClick: () => setDetailTab(id) }))
      : []

  return <div className="desktop-shell">
    <div className="shell-body">
      <aside className="sidebar">
        <div className="sidebar-top" data-tauri-drag-region>
          {!isTauriRuntime() && <div className="traffic-lights" aria-hidden="true"><span /><span /><span /></div>}
          <div className="sidebar-brand">Familiweave</div>
          <label className="search-box"><span>⌕</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder={t('搜索母题')} /></label>
          <button className="new-button" onClick={openNew}><span>＋</span> {t('新建内在片段')}</button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => <button key={item.id} className={navView === item.id ? 'active' : ''} onClick={() => { if (item.id === 'new') openNew(); else { setEncounter(null); setView(item.id) } }}>
            <span className="nav-icon">{item.icon}</span>{t(item.label)}
          </button>)}
        </nav>
        <div className="sidebar-recent">
          <p className="section-label">{t('最近母题')}</p>
          {filtered.length === 0
            ? <p className="empty-copy">{t('还没有母题。从身体开始，留下第一个名字。')}</p>
            : filtered.map(motif => <button key={motif.id} className={`recent-item ${selectedId === motif.id && view === 'motif' ? 'active' : ''}`} onClick={() => openMotif(motif.id)}>
              <span className="recent-title">{motif.name || t('未命名')}</span>
              <span className="recent-meta">{dateLabel(motif.createdAt, lang)} · {localizedLabel(regions, motif.capture.region, lang)}</span>
            </button>)}
        </div>
        <div className="sidebar-footer">
          <span className={`host-dot ${host ? 'native' : ''}`} />
          <div><strong>{hostLabel(host, db, lang)}</strong><small>{host ? t('文件与 SQLite 位于 app data，受沙箱限制') : t('数据只存于浏览器 localStorage')}</small></div>
        </div>
      </aside>

      <main className="workspace">
        <div className="workspace-topbar" data-tauri-drag-region>
          <div className="workspace-tabs" role="tablist">
            {topTabs.length
              ? topTabs.map(tab => <button key={tab.id} role="tab" aria-selected={tab.active} className={tab.active ? 'active' : ''} onClick={tab.onClick}>{tab.label}</button>)
              : <span className="top-label">{view === 'space' ? (encounter?.innerPlan?.format === 'space' ? '空间' : '相遇') : t(navItems.find(item => item.id === navView)?.label ?? '')}</span>}
          </div>
          <div className="ui-controls">
            <button className="ui-toggle" onClick={toggleTheme} aria-label={theme === 'dark' ? t('切换到浅色') : t('切换到深色')} title={theme === 'dark' ? t('切换到浅色') : t('切换到深色')}>{theme === 'dark' ? '☀' : '☾'}</button>
            <button className="lang-toggle" onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}>{lang === 'en' ? '中文' : 'EN'}</button>
          </div>
          <span className="workspace-path">{view === 'space' ? t('内在景观') : view === 'motif' ? (selected?.name || t('未命名')) : t('本地研究原型')}</span>
        </div>
        <div className="workspace-scroll">
          {view === 'space' && encounter
            ? <div className="scene-workspace">
              <div className="scene-toolbar"><button className="text-button" onClick={backFromSpace}>← 返回工作台</button><span>{encounter.innerPlan?.format === 'space' ? `${t('内在景观')} · ${t('空间')}` : `${t('内在景观')} · ${t('相遇')}`}</span><span className="local-badge">{t('无声 · 本地')}</span></div>
              <SceneView encounter={encounter} replay={replay} />
              <div className="scene-footer"><span>{t('不解释、不诊断；离开随时可用。')}</span><button className="quiet-button" onClick={() => setReplay(value => value + 1)}>{t('重新进入')}</button></div>
            </div>
            : <>
              {view === 'field' && <FieldView motifs={visibleMotifs} relationships={visibleRelationships} selectedId={selectedId} lens={fieldLens} range={fieldRange} layout={fieldLayout} onChange={updateFieldLayout} onSelect={openMotif} onNew={openNew} onDemo={loadDemo} onRangeChange={setFieldRange} />}
              {(view === 'new' || view === 'motif') && <>
                {view === 'new' && <WorkspaceHeader eyebrow={t('内在工作台')} title={t('先感觉，不用急着命名。')} meta={t('从身体、意象与关系开始；不解释，也不替你下结论。')} action={<span className="status-pill">{t('本地研究原型')}</span>} />}
                {view === 'new' && (textMode
                  ? <div className="capture-wrap"><InnerEntry onStart={start} /></div>
                  : <div className="capture-wrap"><SomaticEntry onStart={start} onRemember={remember} /></div>)}
                {view === 'motif' && selected && <MotifDetail motif={selected} tab={detailTab} setTab={setDetailTab} onEnter={enterSelected} />}
                {view === 'motif' && !selected && <div className="empty-state"><h2>这个母题不在了</h2><p>它可能已被删除。可以从左侧新建一个片段。</p><button className="primary-button" onClick={openNew}>新建片段</button></div>}
              </>}
              {view === 'journal' && <>
                <WorkspaceHeader eyebrow={t('本机母题日记')} title={t('反复出现的东西，先放在一起。')} meta={t('不推断因果，只做并列、回看与导出。')} />
                <MotifJournal entries={motifs} onRemove={remove} onClear={() => { setMotifs([]); setSelectedId(null); persist([], relationships) }} />
              </>}
              {view === 'relationship' && <>
                <WorkspaceHeader eyebrow={t('关系触发点')} title={t('只画你自己的地图。')} meta={t('不推断对方，不做匹配，也不把关系变成评分。')} />
                <RelationshipJournal entries={relationships} onAdd={addRelationship} onRemove={removeRelationship} onClear={() => { setRelationships([]); persist(motifs, []) }} />
              </>}
              {view === 'lab' && <>
                <WorkspaceHeader eyebrow={t('实验台')} title={t('先把信号管线立住。')} meta={t('模拟数据和设备桥接都明确标注；没有真实神经数据。')} />
                <SignalSimulator onSession={recordSignalSession} />
                <DeviceSignalPanel onSession={recordSignalSession} />
              </>}
              {view === 'settings' && <>
                <WorkspaceHeader eyebrow={t('本机与设置')} title={t('数据留在本机。')} meta={host ? `${host.platform} · ${host.app_data_dir}` : '浏览器预览：数据在 localStorage'} />
                <div className="paper-card host-card">
                  <p className="card-label">{t('宿主')}</p>
                  <p>{host ? `Tauri 2 · ${host.platform} · 沙箱 ${host.sandbox}` : 'Web 预览 · 没有 Tauri 宿主'}</p>
                  <p className="muted">{host ? `SQLite: ${host.database_path}` : t('启动 Tauri 外壳后，文件与数据库句柄由 Rust 宿主管理。')}</p>
                </div>
                <LocalDataPanel snapshot={{ motifs, relationships, field: fieldLayout, signals: signalSessions }} onImport={importSnapshot} onClear={clearAll} />
              </>}
            </>}
        </div>
        {view !== 'space' && <TimelineRail motifs={visibleMotifs} relationships={visibleRelationships} onSelect={openMotif} />}
      </main>

      <ContextPanel motif={selected} encounter={encounter} onEnter={enterSelected} onBack={backFromSpace} onDetail={() => setView('motif')} />
    </div>
  </div>

}
