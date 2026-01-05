import { SketchLine } from './SketchLine'
import type { BrushParameters } from '@/types'

export interface RGBA {
  r: number
  g: number
  b: number
  a: number
}

export class NeoBrush {
  private lines: SketchLine[] = []
  private sourceImageData: ImageData | null = null
  private sourceWidth: number = 0
  private sourceHeight: number = 0
  private parameters: BrushParameters

  constructor(parameters: BrushParameters) {
    this.parameters = { ...parameters }
  }

  setParameters(parameters: BrushParameters): void {
    this.parameters = { ...parameters }
  }

  setSourceImage(imageData: ImageData): void {
    this.sourceImageData = imageData
    this.sourceWidth = imageData.width
    this.sourceHeight = imageData.height
  }

  startStroke(x: number, y: number): void {
    this.lines = []

    for (let i = 0; i < this.parameters.numberOfLines; i++) {
      const easeFactor = this.randomRange(
        this.parameters.easeMin,
        this.parameters.easeMax
      )
      const speedFactor = this.randomRange(
        this.parameters.speedMin,
        this.parameters.speedMax
      )
      const numberOfVertices = Math.ceil(
        this.randomRange(
          this.parameters.verticesMin,
          this.parameters.verticesMax
        )
      )

      this.lines.push(
        new SketchLine({
          numberOfVertices,
          easeFactor,
          speedFactor,
          startX: x,
          startY: y,
        })
      )
    }
  }

  updateStroke(x: number, y: number): void {
    for (const line of this.lines) {
      line.update(x, y)
    }
  }

  endStroke(): void {
    this.lines = []
  }

  render(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    if (this.lines.length === 0) return

    ctx.lineWidth = this.parameters.lineWeight
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    for (const line of this.lines) {
      const vertices = line.getVertices()
      if (vertices.length < 2) continue

      // Sample color from the middle vertex position
      const midVertex = line.getMiddleVertex()
      const color = this.sampleColor(midVertex.x, midVertex.y)

      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${this.parameters.lineAlpha / 255})`

      ctx.beginPath()

      // Draw curve using quadratic bezier for smoothness
      // For Catmull-Rom style curves, we use the curveVertex approach
      if (vertices.length >= 4) {
        this.drawCatmullRom(ctx, vertices)
      } else {
        // Fallback for fewer vertices
        const first = vertices[0]!
        ctx.moveTo(first.x, first.y)
        for (let i = 1; i < vertices.length; i++) {
          const v = vertices[i]!
          ctx.lineTo(v.x, v.y)
        }
      }

      ctx.stroke()
    }
  }

  private drawCatmullRom(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    vertices: { x: number; y: number }[]
  ): void {
    // Catmull-Rom spline implementation
    const tension = 0.5
    const first = vertices[0]!

    ctx.moveTo(first.x, first.y)

    for (let i = 0; i < vertices.length - 1; i++) {
      const p0 = vertices[Math.max(0, i - 1)]!
      const p1 = vertices[i]!
      const p2 = vertices[Math.min(vertices.length - 1, i + 1)]!
      const p3 = vertices[Math.min(vertices.length - 1, i + 2)]!

      // Control points
      const cp1x = p1.x + ((p2.x - p0.x) * tension) / 3
      const cp1y = p1.y + ((p2.y - p0.y) * tension) / 3
      const cp2x = p2.x - ((p3.x - p1.x) * tension) / 3
      const cp2y = p2.y - ((p3.y - p1.y) * tension) / 3

      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y)
    }
  }

  private sampleColor(x: number, y: number): RGBA {
    if (!this.sourceImageData) {
      return { r: 255, g: 255, b: 255, a: 255 }
    }

    // Clamp coordinates to image bounds
    const sx = Math.max(0, Math.min(this.sourceWidth - 1, Math.floor(x)))
    const sy = Math.max(0, Math.min(this.sourceHeight - 1, Math.floor(y)))

    // Get pixel from ImageData
    const index = (sy * this.sourceWidth + sx) * 4

    return {
      r: this.sourceImageData.data[index] ?? 255,
      g: this.sourceImageData.data[index + 1] ?? 255,
      b: this.sourceImageData.data[index + 2] ?? 255,
      a: this.sourceImageData.data[index + 3] ?? 255,
    }
  }

  private randomRange(min: number, max: number): number {
    return min + Math.random() * (max - min)
  }

  getLineCount(): number {
    return this.lines.length
  }

  isActive(): boolean {
    return this.lines.length > 0
  }
}
