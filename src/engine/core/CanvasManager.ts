export interface CanvasManagerOptions {
  width: number
  height: number
  backgroundColor?: string
}

export class CanvasManager {
  private displayCanvas: HTMLCanvasElement
  private displayCtx: CanvasRenderingContext2D
  private drawingCanvas: OffscreenCanvas
  private drawingCtx: OffscreenCanvasRenderingContext2D
  private width: number
  private height: number
  private backgroundColor: string
  private devicePixelRatio: number

  constructor(container: HTMLElement, options: CanvasManagerOptions) {
    this.width = options.width
    this.height = options.height
    this.backgroundColor = options.backgroundColor ?? '#000000'
    this.devicePixelRatio = window.devicePixelRatio || 1

    // Create display canvas (visible in DOM)
    this.displayCanvas = document.createElement('canvas')
    this.displayCanvas.style.width = '100%'
    this.displayCanvas.style.height = '100%'
    this.displayCanvas.style.display = 'block'
    container.appendChild(this.displayCanvas)

    const ctx = this.displayCanvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get 2D context')
    this.displayCtx = ctx

    // Create offscreen drawing canvas at full resolution
    this.drawingCanvas = new OffscreenCanvas(this.width, this.height)
    const drawCtx = this.drawingCanvas.getContext('2d')
    if (!drawCtx) throw new Error('Failed to get offscreen 2D context')
    this.drawingCtx = drawCtx

    // Initialize
    this.clear()
    this.resize()

    // Handle window resize
    window.addEventListener('resize', () => this.resize())
  }

  private resize(): void {
    const container = this.displayCanvas.parentElement
    if (!container) return

    const rect = container.getBoundingClientRect()
    const displayWidth = rect.width
    const displayHeight = rect.height

    // Set canvas size with device pixel ratio for sharpness
    this.displayCanvas.width = displayWidth * this.devicePixelRatio
    this.displayCanvas.height = displayHeight * this.devicePixelRatio

    // Scale context to account for device pixel ratio
    this.displayCtx.setTransform(this.devicePixelRatio, 0, 0, this.devicePixelRatio, 0, 0)

    this.render()
  }

  clear(): void {
    this.drawingCtx.fillStyle = this.backgroundColor
    this.drawingCtx.fillRect(0, 0, this.width, this.height)
    this.render()
  }

  getDrawingContext(): OffscreenCanvasRenderingContext2D {
    return this.drawingCtx
  }

  getDisplayCanvas(): HTMLCanvasElement {
    return this.displayCanvas
  }

  getDrawingCanvas(): OffscreenCanvas {
    return this.drawingCanvas
  }

  render(): void {
    const container = this.displayCanvas.parentElement
    if (!container) return

    const rect = container.getBoundingClientRect()
    const displayWidth = rect.width
    const displayHeight = rect.height

    // Clear display
    this.displayCtx.fillStyle = '#1a1a1a'
    this.displayCtx.fillRect(0, 0, displayWidth, displayHeight)

    // Calculate fit
    const scale = Math.min(
      displayWidth / this.width,
      displayHeight / this.height
    ) * 0.9 // 90% to leave some padding

    const scaledWidth = this.width * scale
    const scaledHeight = this.height * scale
    const offsetX = (displayWidth - scaledWidth) / 2
    const offsetY = (displayHeight - scaledHeight) / 2

    // Draw shadow
    this.displayCtx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    this.displayCtx.shadowBlur = 20
    this.displayCtx.shadowOffsetX = 0
    this.displayCtx.shadowOffsetY = 5

    // Draw drawing canvas to display
    this.displayCtx.drawImage(
      this.drawingCanvas,
      offsetX,
      offsetY,
      scaledWidth,
      scaledHeight
    )

    // Reset shadow
    this.displayCtx.shadowColor = 'transparent'
    this.displayCtx.shadowBlur = 0
  }

  // Convert display coordinates to drawing canvas coordinates
  displayToCanvas(displayX: number, displayY: number): { x: number; y: number } {
    const container = this.displayCanvas.parentElement
    if (!container) return { x: 0, y: 0 }

    const rect = container.getBoundingClientRect()
    const displayWidth = rect.width
    const displayHeight = rect.height

    const scale = Math.min(
      displayWidth / this.width,
      displayHeight / this.height
    ) * 0.9

    const scaledWidth = this.width * scale
    const scaledHeight = this.height * scale
    const offsetX = (displayWidth - scaledWidth) / 2
    const offsetY = (displayHeight - scaledHeight) / 2

    // Get position relative to canvas element
    const canvasRect = this.displayCanvas.getBoundingClientRect()
    const relX = displayX - canvasRect.left
    const relY = displayY - canvasRect.top

    // Convert to drawing canvas coordinates
    const x = (relX - offsetX) / scale
    const y = (relY - offsetY) / scale

    return { x, y }
  }

  isPointInCanvas(displayX: number, displayY: number): boolean {
    const { x, y } = this.displayToCanvas(displayX, displayY)
    return x >= 0 && x <= this.width && y >= 0 && y <= this.height
  }

  setBackgroundColor(color: string): void {
    this.backgroundColor = color
  }

  getImageData(): ImageData {
    return this.drawingCtx.getImageData(0, 0, this.width, this.height)
  }

  putImageData(imageData: ImageData): void {
    this.drawingCtx.putImageData(imageData, 0, 0)
    this.render()
  }

  toDataURL(type = 'image/png', quality = 1): Promise<string> {
    return new Promise((resolve) => {
      this.drawingCanvas.convertToBlob({ type, quality }).then((blob) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      })
    })
  }

  async toBlob(type = 'image/png', quality = 1): Promise<Blob> {
    return this.drawingCanvas.convertToBlob({ type, quality })
  }

  async toBlobScaled(type = 'image/png', quality = 1, scale = 1): Promise<Blob> {
    const safeScale = Math.max(0.1, scale)
    if (safeScale === 1) {
      return this.toBlob(type, quality)
    }

    const scaledWidth = Math.max(1, Math.round(this.width * safeScale))
    const scaledHeight = Math.max(1, Math.round(this.height * safeScale))
    const scaledCanvas = new OffscreenCanvas(scaledWidth, scaledHeight)
    const scaledCtx = scaledCanvas.getContext('2d')
    if (!scaledCtx) throw new Error('Failed to get scaled 2D context')

    scaledCtx.imageSmoothingEnabled = true
    scaledCtx.imageSmoothingQuality = 'high'
    scaledCtx.drawImage(this.drawingCanvas, 0, 0, scaledWidth, scaledHeight)

    return scaledCanvas.convertToBlob({ type, quality })
  }

  resizeDrawingCanvas(width: number, height: number, backgroundColor?: string): void {
    this.width = width
    this.height = height
    if (backgroundColor) {
      this.backgroundColor = backgroundColor
    }

    this.drawingCanvas = new OffscreenCanvas(this.width, this.height)
    const drawCtx = this.drawingCanvas.getContext('2d')
    if (!drawCtx) throw new Error('Failed to get offscreen 2D context')
    this.drawingCtx = drawCtx

    this.clear()
  }

  getWidth(): number {
    return this.width
  }

  getHeight(): number {
    return this.height
  }

  destroy(): void {
    window.removeEventListener('resize', () => this.resize())
    this.displayCanvas.remove()
  }
}
