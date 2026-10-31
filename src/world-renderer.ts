import type { ComponentType } from 'react'
import type { RendererKind } from './director'
import type { Encounter } from './encounter'

// Runtime seam for the "director + world renderer" direction. The procedural
// renderer is implemented today; Genie 4 / Marble / captured renderers can be
// registered without changing SceneView or the episode manifest.

export type RendererStatus = 'available' | 'requires_api_access' | 'not_configured' | 'unavailable'

export interface WorldRendererProps {
  encounter: Encounter
  replay: number
}

export interface WorldRenderer {
  kind: RendererKind
  label: string
  status: RendererStatus
  /** Shown in the UI when the renderer cannot be used yet. */
  reason?: string
  /** Returns a user-facing error when this episode cannot be rendered. */
  validate?: (encounter: Encounter) => string | undefined
  /** React entry point; only required when status is `available`. */
  Component?: ComponentType<WorldRendererProps>
}

export class WorldRendererRegistry {
  private readonly renderers = new Map<RendererKind, WorldRenderer>()

  register(renderer: WorldRenderer) {
    // Last registration wins so Vite HMR can re-run the descriptor module safely.
    this.renderers.set(renderer.kind, renderer)
    return this
  }

  get(kind: RendererKind) {
    return this.renderers.get(kind)
  }

  /** Old episodes without a renderer field fall back to the local procedural renderer. */
  resolve(kind: RendererKind | undefined) {
    return this.renderers.get(kind ?? 'procedural')
  }

  list() {
    return [...this.renderers.values()]
  }
}

export const worldRenderers = new WorldRendererRegistry()
