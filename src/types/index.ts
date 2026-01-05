// Vector type for 2D coordinates
export interface Vector2D {
  x: number
  y: number
}

// Brush parameter interfaces
export interface BrushParameters {
  numberOfLines: number
  lineWeight: number
  lineAlpha: number
  easeMin: number
  easeMax: number
  speedMin: number
  speedMax: number
  verticesMin: number
  verticesMax: number
}

export interface BrushPreset {
  id: string
  name: string
  parameters: BrushParameters
}

// Layer interfaces
export interface Layer {
  id: string
  name: string
  visible: boolean
  opacity: number
  blendMode: BlendMode
  locked: boolean
  canvas: OffscreenCanvas | null
}

export type BlendMode =
  | 'source-over'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'

// Canvas settings
export interface CanvasSettings {
  width: number
  height: number
  backgroundColor: string
}

// History entry
export interface HistoryEntry {
  id: string
  timestamp: number
  layerId: string
  imageData: ImageData
}

// Project data for save/load
export interface ProjectData {
  version: string
  name: string
  createdAt: string
  updatedAt: string
  canvas: CanvasSettings
  layers: SerializedLayer[]
  brushParameters: BrushParameters
  activeLayerId: string
  activeGradientSourceId?: string
}

export interface SerializedLayer {
  id: string
  name: string
  visible: boolean
  opacity: number
  blendMode: BlendMode
  locked: boolean
  imageData: string // base64
}

// Color source gradient
export interface GradientSource {
  id: string
  name: string
  colors: string[]
}
