import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { Encounter } from './encounter'
import { demoInnerEncounter, demoInnerSpaceEncounter } from './inner-encounter'
import { InnerEntry } from './inner-entry'
import { SomaticEntry } from './somatic-entry'
import { MotifJournal } from './motif-journal-view'
import { RelationshipJournal } from './relationship-map'
import { addMotif, clearMotifs, loadMotifs, removeMotif, type MotifEntry } from './motif-journal'
import { SceneView } from './scene-loader'
import './style.css'

function App() {
  const [current, setCurrent] = useState<Encounter | null>(null)
  const [replay, setReplay] = useState(0)
  const [entryMode, setEntryMode] = useState<'somatic' | 'text'>('somatic')
  const [motifs, setMotifs] = useState<MotifEntry[]>(() => typeof window === 'undefined' ? [] : loadMotifs(window.localStorage))
  const isSpace = current?.innerPlan?.format === 'space'

  return <main>
    <header><span className="brand">Familiweave</span><span className="edition">体验原型 · 本地示例</span></header>
    {!current ? <section className="intro">
      <p className="eyebrow">一个象征空间 · 不解释</p>
      <h1>先感觉，<br />不用急着命名。</h1>
      <p className="lead">你可以从身体开始：点按一个位置，选几块更接近此刻的意象。系统不分析，也不告诉你它“意味着什么”。</p>
      <div className="entry-switch" role="tablist" aria-label="输入方式">
        <button role="tab" aria-selected={entryMode === 'somatic'} className={entryMode === 'somatic' ? 'selected' : ''} onClick={() => setEntryMode('somatic')}>从身体开始</button>
        <button role="tab" aria-selected={entryMode === 'text'} className={entryMode === 'text' ? 'selected' : ''} onClick={() => setEntryMode('text')}>用文字</button>
      </div>
      {entryMode === 'somatic'
        ? <SomaticEntry onStart={setCurrent} onRemember={(capture, name, signals) => setMotifs(addMotif(window.localStorage, { capture, name, signals }))} />
        : <InnerEntry onStart={setCurrent} />}
      <div className="actions">
        <button className="quiet" onClick={() => setCurrent(demoInnerEncounter())}>相遇示例</button>
        <button className="quiet" onClick={() => setCurrent(demoInnerSpaceEncounter())}>空间示例</button>
      </div>
      <p className="note">当前为本地研究原型；不解释、不诊断、默认不上传。仪式、物件与档案形式尚未实现。</p>
      <MotifJournal entries={motifs} onRemove={id => setMotifs(removeMotif(window.localStorage, id))} onClear={() => setMotifs(clearMotifs(window.localStorage))} />
      <RelationshipJournal />
    </section> : <section className="view">
      <div className="view-header">
        <button className="quiet" onClick={() => setCurrent(null)}>← 返回</button>
        <span>{isSpace ? '内在景观 · 空间' : '内在景观 · 相遇'}</span>
      </div>
      <SceneView encounter={current} replay={replay} />
      <div className="view-footer">
        <span>{isSpace ? '一个可以待着的空间 · 不解释、不诊断' : '一段象征空间 · 不解释、不诊断'}</span>
        <div className="actions"><button className="quiet" onClick={() => setReplay(value => value + 1)}>重新进入</button></div>
      </div>
      <p className="note">{isSpace ? '这是一个可以待着的空间；没有必须发生的事，随时可以离开。' : '这是无声的象征空间原型；不解释、不诊断，随时可以离开。'}</p>
    </section>}
  </main>
}

createRoot(document.getElementById('root')!).render(<App />)
