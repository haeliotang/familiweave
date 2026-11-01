import { useEffect, useMemo, useState, type ReactNode } from 'react'
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
import { getDbStatus, getHostInfo, type DbStatus, type HostInfo } from './host'
import { fragments, regions, sensations, breaths } from './somatic'

type View = 'new' | 'motif' | 'journal' | 'relationship' | 'lab' | 'settings' | 'space'
type DetailTab = 'overview' | 'body' | 'imagery' | 'relationship'

const navItems: Array<{ id: Exclude<View, 'motif' | 'space'>; label: string; icon: string }> = [
  { id: 'new', label: '新建片段', icon: '＋' },
  { id: 'journal', label: '母题日记', icon: '◫' },
  { id: 'relationship', label: '关系触发点', icon: '◇' },
  { id: 'lab', label: '信号实验台', icon: '◉' },
  { id: 'settings', label: '本机与设置', icon: '⚙' },
]

function dateLabel(iso: string) {
  return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function hostLabel(host: HostInfo | null, db: DbStatus | null) {
  if (!host) return 'Web 预览 · localStorage'
  const database = db?.ready ? `SQLite ${db.tables} 表` : 'SQLite 已就绪'
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
  const voice = motif.signals?.voice
  return <>
    <WorkspaceHeader
      eyebrow="母题"
      title={motif.name || '未命名'}
      meta={`${dateLabel(motif.createdAt)} · 本机保存 · ${motif.capture.fragments.length} 块意象`}
      action={<button className="primary-button" onClick={onEnter}>进入空间</button>}
    />
    <div className="workspace-tabs" role="tablist">
      {([['overview', '总览'], ['body', '身体'], ['imagery', '意象'], ['relationship', '关系']] as Array<[DetailTab, string]>).map(([id, label]) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>)}
    </div>
    {tab === 'overview' && <div className="detail-grid">
      <section className="paper-card span-2">
        <p className="card-label">身体线索</p>
        <h2>{regions.find(item => item.value === motif.capture.region)?.label} · {sensations.find(item => item.value === motif.capture.sensation)?.label}</h2>
        <p className="muted">强度 {motif.capture.intensity}/5 · {breaths.find(item => item.value === motif.capture.breath)?.label}呼吸</p>
      </section>
      <section className="paper-card">
        <p className="card-label">意象碎片</p>
        <p>{motif.capture.fragments.map(id => fragments.find(fragment => fragment.id === id)?.label ?? id).join(' / ')}</p>
      </section>
      <section className="paper-card">
        <p className="card-label">可选声音</p>
        <p>{voice ? `音量均值 ${voice.rmsMean.toFixed(3)} · 停顿比例 ${voice.pauseRatio.toFixed(2)}` : '这次没有声音摘要'}</p>
      </section>
      <section className="paper-card span-2">
        <p className="card-label">可以做什么</p>
        <p className="muted">进入一段 75 秒象征空间；系统不解释这个母题，也不替它命名。离开随时可用。</p>
      </section>
    </div>}
    {tab === 'body' && <section className="paper-card">
      <p className="card-label">身体线索</p>
      <div className="detail-rows">
        <div><span>位置</span><strong>{regions.find(item => item.value === motif.capture.region)?.label}</strong></div>
        <div><span>感觉</span><strong>{sensations.find(item => item.value === motif.capture.sensation)?.label}</strong></div>
        <div><span>强度</span><strong>{motif.capture.intensity} / 5</strong></div>
        <div><span>呼吸</span><strong>{breaths.find(item => item.value === motif.capture.breath)?.label}</strong></div>
      </div>
    </section>}
    {tab === 'imagery' && <section className="paper-card">
      <p className="card-label">意象碎片</p>
      <div className="imagery-list">{motif.capture.fragments.map(id => {
        const fragment = fragments.find(item => item.id === id)
        return <div className="imagery-tile" key={id}><span className={`imagery-swatch palette-${fragment?.palette}`} /><span>{fragment?.label ?? id}</span></div>
      })}</div>
    </section>}
    {tab === 'relationship' && <section className="paper-card">
      <p className="card-label">关系</p>
      <p>关系触发点单独保存在「关系触发点」里；这里不推断它们与当前母题的因果关系。</p>
      <p className="muted">这是有意的边界：并列可以，解释不行。</p>
    </section>}
  </>
}

function ContextPanel({ motif, encounter, onEnter, onBack }: { motif: MotifEntry | null; encounter: Encounter | null; onEnter: () => void; onBack: () => void }) {
  if (encounter) {
    return <aside className="context-panel">
      <div className="context-heading"><span>当前空间</span><span className="local-badge">本地</span></div>
      <p className="context-lead">空间在中间运行。你可以靠近、停留或离开；离开也是体验的一部分。</p>
      <button className="primary-button wide" onClick={onBack}>返回工作台</button>
      <div className="context-section">
        <p className="card-label">这次的空间</p>
        <p className="muted">{encounter.innerPlan?.format === 'space' ? '180 秒空间' : '75 秒相遇'} · 无声 · symbolic</p>
      </div>
      <div className="context-note">
        <p className="card-label">不解释</p>
        <p>空间不提供梦的字典，也不声称知道它“意味着什么”。</p>
      </div>
    </aside>
  }
  const voice = motif?.signals?.voice
  return <aside className="context-panel">
    <div className="context-heading"><span>空间将收到的内容</span><span className="local-badge">不上传</span></div>
    <ul className="check-list">
      {checkItem('身体位置', Boolean(motif), motif ? regions.find(item => item.value === motif.capture.region)?.label : '先选择一个母题')}
      {checkItem('感觉与强度', Boolean(motif), motif ? `${sensations.find(item => item.value === motif.capture.sensation)?.label} · ${motif.capture.intensity}/5` : undefined)}
      {checkItem('意象碎片', Boolean(motif), motif ? `${motif.capture.fragments.length} 块` : undefined)}
      {checkItem('可选声音摘要', Boolean(voice), voice ? '仅摘要，不含原始音频' : '这次没有')}
      {checkItem('关系触发点', false, '不进入空间；保持独立')}
    </ul>
    <button className="primary-button wide" disabled={!motif} onClick={onEnter}>进入 75 秒空间</button>
    <div className="context-section">
      <p className="card-label">事件流</p>
      <p className="muted">还没有活动。进入空间后，这里会显示当前会话。</p>
    </div>
    <div className="context-note">
      <p className="card-label">下一步</p>
      <p>{motif ? '进入空间，看看它如何变化；也可以回到母题日记继续记录。' : '先从身体开始，选一个最明显的位置。'}</p>
    </div>
    <p className="context-privacy">不解释、不诊断、默认不上传。所有母题与关系记录只在本机。</p>
  </aside>
}

export function DesktopShell() {
  const [view, setView] = useState<View>('new')
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
      setSelectedId(current => current && snapshot.motifs.some(motif => motif.id === current) ? current : null)
    })
    return () => { active = false }
  }, [])

  const selected = motifs.find(motif => motif.id === selectedId) ?? null
  const filtered = useMemo(() => motifs.filter(motif => !search.trim() || (motif.name || '未命名').includes(search.trim())), [motifs, search])

  const openNew = () => { setEncounter(null); setSelectedId(null); setView('new'); setDetailTab('overview') }
  const openMotif = (id: string) => { setSelectedId(id); setEncounter(null); setView('motif'); setDetailTab('overview') }
  const start = (next: Encounter) => { setEncounter(next); setView('space') }
  const enterSelected = () => { if (selected) start(createInnerCaptureEncounter(selected.capture)) }
  const backFromSpace = () => { setEncounter(null); setView(selected ? 'motif' : 'new') }
  const persist = (nextMotifs: MotifEntry[], nextRelationships: RelationshipTrigger[]) => {
    void saveLocalSnapshot({ motifs: nextMotifs, relationships: nextRelationships })
  }
  const remember = (capture: Parameters<typeof createMotif>[0]['capture'], name: string, signals?: Parameters<typeof createMotif>[0]['signals']) => {
    const entry = createMotif({ capture, name, signals })
    const next = [entry, ...motifs]
    setMotifs(next)
    setSelectedId(entry.id)
    persist(next, relationships)
  }
  const remove = (id: string) => {
    const next = motifs.filter(motif => motif.id !== id)
    setMotifs(next)
    if (selectedId === id) setSelectedId(null)
    persist(next, relationships)
  }
  const addRelationship = (input: RelationshipInput) => {
    const next = [createRelationshipTrigger(input), ...relationships]
    setRelationships(next)
    persist(motifs, next)
  }
  const removeRelationship = (id: string) => {
    const next = relationships.filter(entry => entry.id !== id)
    setRelationships(next)
    persist(motifs, next)
  }
  const importSnapshot = (snapshot: LocalSnapshot) => {
    setMotifs(snapshot.motifs)
    setRelationships(snapshot.relationships)
    setSelectedId(null)
    void saveLocalSnapshot(snapshot)
  }
  const clearAll = () => {
    setMotifs([])
    setRelationships([])
    setSelectedId(null)
    void clearLocalSnapshot()
  }

  const navView = view === 'motif' || view === 'space' ? (selected ? 'journal' : 'new') : view

  return <div className="desktop-shell">
    <div className="window-bar" data-tauri-drag-region>
      <div className="window-title" data-tauri-drag-region><span className="window-mark" />Familiweave</div>
      <div className="window-path" data-tauri-drag-region>{view === 'space' ? '空间' : view === 'motif' ? (selected?.name || '未命名') : navItems.find(item => item.id === navView)?.label}</div>
      <div className="window-meta">{host ? 'Tauri 2 外壳' : 'Web 预览'}</div>
    </div>
    <div className="shell-body">
      <aside className="sidebar">
        <div className="sidebar-top">
          <button className="new-button" onClick={openNew}><span>＋</span> 新建内在片段</button>
          <label className="search-box"><span>⌕</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="搜索母题" /></label>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => <button key={item.id} className={navView === item.id ? 'active' : ''} onClick={() => { if (item.id === 'new') openNew(); else { setEncounter(null); setView(item.id) } }}>
            <span className="nav-icon">{item.icon}</span>{item.label}
          </button>)}
        </nav>
        <div className="sidebar-recent">
          <p className="section-label">最近母题</p>
          {filtered.length === 0
            ? <p className="empty-copy">还没有母题。从身体开始，留下第一个名字。</p>
            : filtered.map(motif => <button key={motif.id} className={`recent-item ${selectedId === motif.id && view === 'motif' ? 'active' : ''}`} onClick={() => openMotif(motif.id)}>
              <span className="recent-title">{motif.name || '未命名'}</span>
              <span className="recent-meta">{dateLabel(motif.createdAt)} · {regions.find(item => item.value === motif.capture.region)?.label}</span>
            </button>)}
        </div>
        <div className="sidebar-footer">
          <span className={`host-dot ${host ? 'native' : ''}`} />
          <div><strong>{hostLabel(host, db)}</strong><small>{host ? '文件与 SQLite 位于 app data，受沙箱限制' : '数据只存于浏览器 localStorage'}</small></div>
        </div>
      </aside>

      <main className="workspace">
        {view === 'space' && encounter
          ? <div className="scene-workspace">
            <div className="scene-toolbar"><button className="text-button" onClick={backFromSpace}>← 返回工作台</button><span>{encounter.innerPlan?.format === 'space' ? '内在景观 · 空间' : '内在景观 · 相遇'}</span><span className="local-badge">无声 · 本地</span></div>
            <SceneView encounter={encounter} replay={replay} />
            <div className="scene-footer"><span>不解释、不诊断；离开随时可用。</span><button className="quiet-button" onClick={() => setReplay(value => value + 1)}>重新进入</button></div>
          </div>
          : <>
            {(view === 'new' || view === 'motif') && <>
              {view === 'new' && <WorkspaceHeader eyebrow="内在工作台" title="先感觉，不用急着命名。" meta="从身体、意象与关系开始；不解释，也不替你下结论。" action={<span className="status-pill">本地研究原型</span>} />}
              {view === 'new' && <div className="workspace-tabs mode-tabs" role="tablist">
                <button role="tab" aria-selected={!textMode} className={!textMode ? 'active' : ''} onClick={() => setTextMode(false)}>从身体开始</button>
                <button role="tab" aria-selected={textMode} className={textMode ? 'active' : ''} onClick={() => setTextMode(true)}>用文字</button>
              </div>}
              {view === 'new' && (textMode
                ? <div className="capture-wrap"><InnerEntry onStart={start} /></div>
                : <div className="capture-wrap"><SomaticEntry onStart={start} onRemember={remember} /></div>)}
              {view === 'motif' && selected && <MotifDetail motif={selected} tab={detailTab} setTab={setDetailTab} onEnter={enterSelected} />}
              {view === 'motif' && !selected && <div className="empty-state"><h2>这个母题不在了</h2><p>它可能已被删除。可以从左侧新建一个片段。</p><button className="primary-button" onClick={openNew}>新建片段</button></div>}
            </>}
            {view === 'journal' && <>
              <WorkspaceHeader eyebrow="本机母题日记" title="反复出现的东西，先放在一起。" meta="不推断因果，只做并列、回看与导出。" />
              <MotifJournal entries={motifs} onRemove={remove} onClear={() => { setMotifs([]); setSelectedId(null); persist([], relationships) }} />
            </>}
            {view === 'relationship' && <>
              <WorkspaceHeader eyebrow="关系触发点" title="只画你自己的地图。" meta="不推断对方，不做匹配，也不把关系变成评分。" />
              <RelationshipJournal entries={relationships} onAdd={addRelationship} onRemove={removeRelationship} onClear={() => { setRelationships([]); persist(motifs, []) }} />
            </>}
            {view === 'lab' && <>
              <WorkspaceHeader eyebrow="实验台" title="先把信号管线立住。" meta="模拟数据和设备桥接都明确标注；没有真实神经数据。" />
              <SignalSimulator />
              <DeviceSignalPanel />
            </>}
            {view === 'settings' && <>
              <WorkspaceHeader eyebrow="本机与设置" title="数据留在本机。" meta={host ? `${host.platform} · ${host.app_data_dir}` : '浏览器预览：数据在 localStorage'} />
              <div className="paper-card host-card">
                <p className="card-label">宿主</p>
                <p>{host ? `Tauri 2 · ${host.platform} · 沙箱 ${host.sandbox}` : 'Web 预览 · 没有 Tauri 宿主'}</p>
                <p className="muted">{host ? `SQLite: ${host.database_path}` : '启动 Tauri 外壳后，文件与数据库句柄由 Rust 宿主管理。'}</p>
              </div>
              <LocalDataPanel snapshot={{ motifs, relationships }} onImport={importSnapshot} onClear={clearAll} />
            </>}
          </>}
      </main>

      <ContextPanel motif={selected} encounter={encounter} onEnter={enterSelected} onBack={backFromSpace} />
    </div>
  </div>
}
