import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { Encounter } from './encounter'
import { demoInnerEncounter, demoInnerSpaceEncounter } from './inner-encounter'
import { InnerEntry } from './inner-entry'
import { SceneView } from './scene-loader'
import './style.css'

function App() {
  const [current, setCurrent] = useState<Encounter | null>(null)
  const [replay, setReplay] = useState(0)
  const isSpace = current?.innerPlan?.format === 'space'

  return <main>
    <header><span className="brand">Familiweave</span><span className="edition">体验原型 · 本地示例</span></header>
    {!current ? <section className="intro">
      <p className="eyebrow">一个象征空间 · 不解释</p>
      <h1>写下一个画面，<br />不急着解释它。</h1>
      <p className="lead">一段梦、一个地点、一种说不清的感觉。Familiweave 会把它变成一段可进入、可退出的空间；不分析，也不告诉你它“意味着什么”。</p>
      <InnerEntry onStart={setCurrent} />
      <div className="actions">
        <button className="quiet" onClick={() => setCurrent(demoInnerEncounter())}>相遇示例</button>
        <button className="quiet" onClick={() => setCurrent(demoInnerSpaceEncounter())}>空间示例</button>
      </div>
      <p className="note">当前为本地研究原型；不解释、不诊断、默认不上传。仪式、物件与档案形式尚未实现。</p>
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
