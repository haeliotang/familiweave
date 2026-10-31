import { Component, Suspense, type ReactNode } from 'react'
import type { Encounter } from './encounter'
import { worldRenderers } from './world-renderer'
import './world-renderers'

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <div className="scene-placeholder" role="alert"><p>暂时无法打开场景。可以返回，或重新加载页面。</p><button onClick={() => window.location.reload()}>重新加载</button></div>
    return this.props.children
  }
}

export function SceneView({ encounter, replay }: { encounter: Encounter; replay: number }) {
  const renderer = worldRenderers.resolve(encounter.rendererKind)
  if (!renderer) return <div className="scene-placeholder" role="alert">{`这次相遇使用了未知的渲染器（${encounter.rendererKind}），请更新后再打开。`}</div>
  if (renderer.status !== 'available' || !renderer.Component) return <div className="scene-placeholder" role="alert">{`${renderer.label} 尚未就绪：${renderer.reason ?? '当前版本不支持该渲染器。'}`}</div>
  if (encounter.id !== 'demo' && !encounter.manifestVerified) return <div className="scene-placeholder" role="alert">这次相遇的记录校验未通过，暂时无法播放。</div>
  const invalid = renderer.validate?.(encounter)
  if (invalid) return <div className="scene-placeholder" role="alert">{invalid}</div>
  const Renderer = renderer.Component
  return <SceneBoundary key={encounter.id}><Suspense fallback={<div className="scene-placeholder" role="status">正在打开场景…</div>}>
    <Renderer key={`${encounter.id}-${replay}-${encounter.retracted}`} encounter={encounter} replay={replay} />
  </Suspense></SceneBoundary>
}
