import { lazy } from 'react'
import { CapturedRenderer, validateCaptured } from './captured-renderer'
import { SymbolicRenderer, validateSymbolic } from './symbolic-renderer'
import type { Encounter } from './encounter'
import { resolvePerformanceVersion } from './performance-catalog'
import { sceneLayout } from './scene-catalog'
import { worldRenderers, type WorldRendererProps } from './world-renderer'

const Scene = lazy(() => import('./scene').then(module => ({ default: module.Scene })))

function ProceduralRenderer({ encounter }: WorldRendererProps) {
  return <Scene encounter={encounter} />
}

function validateProcedural(encounter: Encounter) {
  try { sceneLayout(encounter.sceneVersion, encounter.scene, encounter.seed) }
  catch { return encounter.sceneVersion ? '这次相遇的场景版本暂不支持，无法还原。' : '这次旧相遇未保存场景版本，无法还原当时的场景。' }
  try { resolvePerformanceVersion(encounter.performanceVersion) }
  catch { return '这次相遇的动作版本暂不支持，无法还原。' }
  return undefined
}

worldRenderers.register({
  kind: 'procedural',
  label: '本地程序场景',
  status: 'available',
  capabilities: { interactive: true, nativeAudio: false, capture: false },
  validate: validateProcedural,
  Component: ProceduralRenderer,
})

worldRenderers.register({
  kind: 'genie4',
  label: 'Google Genie 4',
  status: 'requires_api_access',
  capabilities: { interactive: true, nativeAudio: true, capture: true },
  reason: '等待 Genie 4 API / Project Genie 访问；当前不调用任何外部服务。',
})

worldRenderers.register({
  kind: 'marble',
  label: 'World Labs Marble',
  status: 'not_configured',
  capabilities: { interactive: true, nativeAudio: false, capture: false },
  reason: '保留为环境生成备选，尚未接入。',
})

worldRenderers.register({
  kind: 'symbolic',
  label: '象征空间',
  status: 'available',
  capabilities: { interactive: true, nativeAudio: false, capture: false },
  validate: validateSymbolic,
  Component: SymbolicRenderer,
})

worldRenderers.register({
  kind: 'captured',
  label: '捕获回放',
  status: 'available',
  capabilities: { interactive: false, nativeAudio: true, capture: false },
  validate: validateCaptured,
  Component: CapturedRenderer,
})
