import { captureIssue } from './capture'
import type { Encounter } from './encounter'
import type { WorldRendererProps } from './world-renderer'

export function validateCaptured(encounter: Encounter) {
  return captureIssue(encounter.capture)
}

export function CapturedRenderer({ encounter }: WorldRendererProps) {
  const capture = encounter.capture
  const issue = captureIssue(capture)
  if (issue || !capture?.url) return <div className="scene-placeholder" role="alert">{issue ?? '捕获文件尚未提供回放入口。'}</div>
  return (
    <div className="captured-episode">
      <video className="captured-video" src={capture.url} controls playsInline preload="metadata" aria-label="捕获的相遇回放" />
      <p className="captured-caption">
        捕获回放 · {capture.model ?? capture.rendererKind} · {capture.durationSec} 秒
        {capture.synthId ? ' · 含 SynthID 水印' : ' · 未标记水印'}
        {' · AI 生成 / 虚构'}
      </p>
    </div>
  )
}
