import { ref, watch, effectScope, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { CanvasManager } from '@/engine/core/CanvasManager'
import { NeoBrush } from '@/engine/brushes/NeoBrush'
import { useBrushStore } from '@/stores/brush'
import { useCanvasStore } from '@/stores/canvas'
import { useHistoryStore } from '@/stores/history'
import { useLayersStore } from '@/stores/layers'
import type { Layer, ProjectData, SerializedLayer } from '@/types'

type ExportImageOptions = {
  format?: 'png' | 'jpeg'
  scale?: number
  quality?: number
  filename?: string
}

type NeoBrushInstance = ReturnType<typeof createNeoBrush>

function normalizeFileName(name: string): string {
  return name
    .trim()
    .replace(/[\s/\\?%*:|"<>]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read blob'))
    reader.readAsDataURL(blob)
  })
}

async function canvasToDataURL(
  canvas: OffscreenCanvas,
  type = 'image/png',
  quality = 1
): Promise<string> {
  const blob = await canvas.convertToBlob({ type, quality })
  return blobToDataURL(blob)
}

function loadImageFromDataURL(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image data'))
    img.src = dataUrl
  })
}

function isProjectData(data: unknown): data is ProjectData {
  if (!data || typeof data !== 'object') return false
  const project = data as ProjectData
  return (
    typeof project.version === 'string' &&
    typeof project.name === 'string' &&
    typeof project.createdAt === 'string' &&
    typeof project.updatedAt === 'string' &&
    typeof project.canvas?.width === 'number' &&
    typeof project.canvas?.height === 'number' &&
    typeof project.canvas?.backgroundColor === 'string' &&
    Array.isArray(project.layers) &&
    project.layers.length > 0 &&
    typeof project.brushParameters === 'object' &&
    typeof project.activeLayerId === 'string'
  )
}

function createNeoBrush() {
  const brushStore = useBrushStore()
  const canvasStore = useCanvasStore()
  const historyStore = useHistoryStore()
  const layersStore = useLayersStore()

  const { parameters, activeColorSource, activeColorSourceId } = storeToRefs(brushStore)
  const { settings, isDrawing, zoom, panX, panY } = storeToRefs(canvasStore)
  const { layers, activeLayerId } = storeToRefs(layersStore)

  const canvasManager = ref<CanvasManager | null>(null)
  const brush = ref<NeoBrush | null>(null)
  const sourceImage = ref<HTMLImageElement | null>(null)
  const animationFrameId = ref<number | null>(null)
  const isInitialized = ref(false)

  layersStore.initialize()

  function ensureLayerCanvas(layer: Layer): OffscreenCanvas | null {
    if (!canvasManager.value) return layer.canvas

    const width = canvasManager.value.getWidth()
    const height = canvasManager.value.getHeight()

    if (layer.canvas && layer.canvas.width === width && layer.canvas.height === height) {
      return layer.canvas
    }

    const nextCanvas = new OffscreenCanvas(width, height)
    if (layer.canvas) {
      const ctx = nextCanvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(layer.canvas, 0, 0, width, height)
      }
    }

    layersStore.setLayerCanvas(layer.id, nextCanvas)
    return nextCanvas
  }

  function ensureAllLayerCanvases(): void {
    layers.value.forEach((layer) => {
      ensureLayerCanvas(layer)
    })
  }

  function getLayerContext(layer: Layer): OffscreenCanvasRenderingContext2D | null {
    const canvas = ensureLayerCanvas(layer)
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    return ctx
  }

  function getActiveLayerContext(): OffscreenCanvasRenderingContext2D | null {
    const layer = layersStore.activeLayer
    if (!layer) return null
    return getLayerContext(layer)
  }

  function renderComposite(): void {
    if (!canvasManager.value) return

    const ctx = canvasManager.value.getDrawingContext()
    const width = canvasManager.value.getWidth()
    const height = canvasManager.value.getHeight()

    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = settings.value.backgroundColor
    ctx.fillRect(0, 0, width, height)

    for (let i = layers.value.length - 1; i >= 0; i -= 1) {
      const layer = layers.value[i]
      if (!layer.visible) continue
      const layerCanvas = ensureLayerCanvas(layer)
      if (!layerCanvas) continue
      ctx.globalAlpha = layer.opacity
      ctx.globalCompositeOperation = layer.blendMode
      ctx.drawImage(layerCanvas, 0, 0, width, height)
    }

    ctx.restore()
    canvasManager.value.render()
  }

  function initialize(container: HTMLElement): void {
    if (isInitialized.value) return

    canvasManager.value = new CanvasManager(container, {
      width: settings.value.width,
      height: settings.value.height,
      backgroundColor: settings.value.backgroundColor,
    })
    canvasManager.value.setViewTransform(zoom.value, panX.value, panY.value)

    brush.value = new NeoBrush(parameters.value)

    ensureAllLayerCanvases()
    loadSourceImage()
    renderComposite()

    const displayCanvas = canvasManager.value.getDisplayCanvas()
    displayCanvas.addEventListener('mousedown', handleMouseDown)
    displayCanvas.addEventListener('mousemove', handleMouseMove)
    displayCanvas.addEventListener('mouseup', handleMouseUp)
    displayCanvas.addEventListener('mouseleave', handleMouseUp)

    displayCanvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    displayCanvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    displayCanvas.addEventListener('touchend', handleTouchEnd)

    isInitialized.value = true
  }

  function loadSourceImage(): void {
    if (!activeColorSource.value) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      sourceImage.value = img

      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = img.width
      tempCanvas.height = img.height
      const tempCtx = tempCanvas.getContext('2d')
      if (tempCtx && brush.value && canvasManager.value) {
        tempCtx.drawImage(img, 0, 0)

        const scaledCanvas = document.createElement('canvas')
        scaledCanvas.width = canvasManager.value.getWidth()
        scaledCanvas.height = canvasManager.value.getHeight()
        const scaledCtx = scaledCanvas.getContext('2d')
        if (scaledCtx) {
          scaledCtx.drawImage(img, 0, 0, scaledCanvas.width, scaledCanvas.height)
          const imageData = scaledCtx.getImageData(0, 0, scaledCanvas.width, scaledCanvas.height)
          brush.value.setSourceImage(imageData)
        }
      }
    }
    img.src = activeColorSource.value.src
  }

  function handleMouseDown(e: MouseEvent): void {
    if (!canvasManager.value || !brush.value) return
    if (typeof e.button === 'number' && e.button !== 0) return
    const activeLayer = layersStore.activeLayer
    if (!activeLayer || activeLayer.locked) return

    const { x, y } = canvasManager.value.displayToCanvas(e.clientX, e.clientY)
    if (!canvasManager.value.isPointInCanvas(e.clientX, e.clientY)) return

    const layerCtx = getLayerContext(activeLayer)
    if (!layerCtx) return

    const imageData = layerCtx.getImageData(
      0,
      0,
      canvasManager.value.getWidth(),
      canvasManager.value.getHeight()
    )
    historyStore.pushState(activeLayer.id, imageData)

    brush.value.startStroke(x, y)
    canvasStore.setDrawing(true)
    startRenderLoop()
  }

  function handleMouseMove(e: MouseEvent): void {
    if (!isDrawing.value || !canvasManager.value || !brush.value) return

    const { x, y } = canvasManager.value.displayToCanvas(e.clientX, e.clientY)
    brush.value.updateStroke(x, y)
  }

  function handleMouseUp(): void {
    if (!brush.value) return

    brush.value.endStroke()
    canvasStore.setDrawing(false)
    stopRenderLoop()
    renderComposite()
  }

  function handleTouchStart(e: TouchEvent): void {
    e.preventDefault()
    const touch = e.touches[0]
    if (touch) {
      handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent)
    }
  }

  function handleTouchMove(e: TouchEvent): void {
    e.preventDefault()
    const touch = e.touches[0]
    if (touch) {
      handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent)
    }
  }

  function handleTouchEnd(): void {
    handleMouseUp()
  }

  function startRenderLoop(): void {
    if (animationFrameId.value !== null) return

    const loop = () => {
      if (!isDrawing.value) return

      const layerCtx = getActiveLayerContext()
      if (brush.value && canvasManager.value && layerCtx) {
        brush.value.render(layerCtx)
        renderComposite()
      }

      animationFrameId.value = requestAnimationFrame(loop)
    }

    animationFrameId.value = requestAnimationFrame(loop)
  }

  function stopRenderLoop(): void {
    if (animationFrameId.value !== null) {
      cancelAnimationFrame(animationFrameId.value)
      animationFrameId.value = null
    }
  }

  function clearCanvas(): void {
    if (!canvasManager.value) return
    const activeLayer = layersStore.activeLayer
    if (!activeLayer) return

    const layerCtx = getLayerContext(activeLayer)
    if (!layerCtx) return

    const width = canvasManager.value.getWidth()
    const height = canvasManager.value.getHeight()
    const imageData = layerCtx.getImageData(0, 0, width, height)
    historyStore.pushState(activeLayer.id, imageData)

    layers.value.forEach((layer) => {
      const ctx = getLayerContext(layer)
      if (ctx) {
        ctx.clearRect(0, 0, width, height)
      }
    })

    renderComposite()
  }

  function newProject(): void {
    if (!canvasManager.value) return
    historyStore.clear()
    layersStore.clearAllLayers()
    ensureAllLayerCanvases()
    renderComposite()
  }

  async function saveImage(): Promise<void> {
    await exportImage()
  }

  async function exportImage(options: ExportImageOptions = {}): Promise<void> {
    if (!canvasManager.value) return
    renderComposite()

    const format = options.format ?? 'png'
    const scale = options.scale ?? 1
    const quality = Math.max(0, Math.min(1, options.quality ?? 0.92))
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
    const extension = format === 'jpeg' ? 'jpg' : 'png'
    const scaleLabel = scale !== 1 ? `-${scale}x` : ''
    const filename = options.filename ?? `neobrush-${Date.now()}${scaleLabel}.${extension}`

    const blob = await canvasManager.value.toBlobScaled(mimeType, quality, scale)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  async function exportProject(name?: string): Promise<void> {
    if (!canvasManager.value) return
    ensureAllLayerCanvases()

    const projectName = name?.trim() || 'Untitled'
    const fileBase = normalizeFileName(projectName) || 'neobrush-project'
    const fileName = `${fileBase}-${Date.now()}.json`
    const now = new Date().toISOString()
    const width = canvasManager.value.getWidth()
    const height = canvasManager.value.getHeight()
    const resolvedActiveLayerId =
      activeLayerId.value ?? layers.value[0]?.id ?? 'layer-1'

    const serializedLayers: SerializedLayer[] = await Promise.all(
      layers.value.map(async (layer) => {
        const layerCanvas = ensureLayerCanvas(layer)
        const imageData = layerCanvas ? await canvasToDataURL(layerCanvas) : ''

        return {
          id: layer.id,
          name: layer.name,
          visible: layer.visible,
          opacity: layer.opacity,
          blendMode: layer.blendMode,
          locked: layer.locked,
          imageData,
        }
      })
    )

    const project: ProjectData = {
      version: '1.0',
      name: projectName,
      createdAt: now,
      updatedAt: now,
      canvas: {
        width,
        height,
        backgroundColor: settings.value.backgroundColor,
      },
      layers: serializedLayers,
      brushParameters: { ...parameters.value },
      activeLayerId: resolvedActiveLayerId,
      activeColorSourceId: activeColorSourceId.value,
    }

    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
  }

  async function importProjectFromJson(json: string): Promise<void> {
    let data: unknown
    try {
      data = JSON.parse(json)
    } catch (error) {
      throw new Error('Invalid JSON file')
    }

    if (!isProjectData(data)) {
      throw new Error('Unsupported project format')
    }

    await applyProjectData(data)
  }

  async function applyProjectData(project: ProjectData): Promise<void> {
    if (!canvasManager.value) return

    canvasStore.setDimensions(project.canvas.width, project.canvas.height)
    canvasStore.setBackgroundColor(project.canvas.backgroundColor)
    brushStore.setParameters(project.brushParameters)

    if (project.activeColorSourceId) {
      brushStore.setColorSource(project.activeColorSourceId)
    }

    canvasManager.value.resizeDrawingCanvas(
      project.canvas.width,
      project.canvas.height,
      project.canvas.backgroundColor
    )

    const newLayers: Layer[] = project.layers.map((layer) => ({
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      opacity: layer.opacity,
      blendMode: layer.blendMode,
      locked: layer.locked,
      canvas: null,
    }))

    layersStore.setLayers(newLayers, project.activeLayerId)

    const { width, height } = project.canvas
    const layerCanvases = await Promise.all(
      project.layers.map(async (layer) => {
        if (!layer.imageData) {
          return { id: layer.id, canvas: null as OffscreenCanvas | null }
        }

        const dataUrl = layer.imageData.startsWith('data:')
          ? layer.imageData
          : `data:image/png;base64,${layer.imageData}`

        try {
          const img = await loadImageFromDataURL(dataUrl)
          const offscreen = new OffscreenCanvas(width, height)
          const ctx = offscreen.getContext('2d')
          if (!ctx) {
            return { id: layer.id, canvas: null as OffscreenCanvas | null }
          }
          ctx.drawImage(img, 0, 0, width, height)
          return { id: layer.id, canvas: offscreen }
        } catch (error) {
          return { id: layer.id, canvas: null as OffscreenCanvas | null }
        }
      })
    )

    layerCanvases.forEach(({ id, canvas }) => {
      if (canvas) {
        layersStore.setLayerCanvas(id, canvas)
      }
    })

    renderComposite()
    historyStore.clear()
    loadSourceImage()
  }

  function undo(): void {
    const entry = historyStore.undo()
    if (!entry || !canvasManager.value) return

    const layer = layers.value.find((item) => item.id === entry.layerId)
    if (!layer) return

    const ctx = getLayerContext(layer)
    if (!ctx) return

    ctx.putImageData(entry.imageData, 0, 0)
    renderComposite()
  }

  function redo(): void {
    const entry = historyStore.redo()
    if (!entry || !canvasManager.value) return

    const layer = layers.value.find((item) => item.id === entry.layerId)
    if (!layer) return

    const ctx = getLayerContext(layer)
    if (!ctx) return

    ctx.putImageData(entry.imageData, 0, 0)
    renderComposite()
  }

  watch(
    parameters,
    (newParams) => {
      if (brush.value) {
        brush.value.setParameters(newParams)
      }
    },
    { deep: true }
  )

  watch(activeColorSource, () => {
    loadSourceImage()
  })

  watch(
    () => settings.value.backgroundColor,
    (color) => {
      if (!canvasManager.value) return
      canvasManager.value.setBackgroundColor(color)
      renderComposite()
    }
  )

  watch(
    [zoom, panX, panY],
    ([nextZoom, nextPanX, nextPanY]) => {
      if (!canvasManager.value) return
      canvasManager.value.setViewTransform(nextZoom, nextPanX, nextPanY)
      canvasManager.value.render()
    }
  )

  watch(
    layers,
    () => {
      if (!canvasManager.value) return
      ensureAllLayerCanvases()
      renderComposite()
    },
    { deep: true }
  )

  function destroy(): void {
    stopRenderLoop()
    if (canvasManager.value) {
      canvasManager.value.destroy()
      canvasManager.value = null
    }
    isInitialized.value = false
  }

  return {
    initialize,
    clearCanvas,
    newProject,
    saveImage,
    exportImage,
    exportProject,
    importProjectFromJson,
    undo,
    redo,
    isInitialized,
    canvasManager,
    destroy,
  }
}

let instance: NeoBrushInstance | null = null
let scope: ReturnType<typeof effectScope> | null = null
let usageCount = 0

export function useNeoBrush(): NeoBrushInstance {
  if (!instance) {
    scope = effectScope()
    scope.run(() => {
      instance = createNeoBrush()
    })
  }

  usageCount += 1

  onUnmounted(() => {
    usageCount = Math.max(0, usageCount - 1)
    if (usageCount === 0) {
      instance?.destroy()
      scope?.stop()
      instance = null
      scope = null
    }
  })

  return instance as NeoBrushInstance
}
