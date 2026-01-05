import { ref, watch, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { CanvasManager } from '@/engine/core/CanvasManager'
import { NeoBrush } from '@/engine/brushes/NeoBrush'
import { useBrushStore } from '@/stores/brush'
import { useCanvasStore } from '@/stores/canvas'
import { useHistoryStore } from '@/stores/history'

export function useNeoBrush() {
  const brushStore = useBrushStore()
  const canvasStore = useCanvasStore()
  const historyStore = useHistoryStore()

  const { parameters, activeColorSource } = storeToRefs(brushStore)
  const { settings, isDrawing } = storeToRefs(canvasStore)

  const canvasManager = ref<CanvasManager | null>(null)
  const brush = ref<NeoBrush | null>(null)
  const sourceImage = ref<HTMLImageElement | null>(null)
  const animationFrameId = ref<number | null>(null)
  const isInitialized = ref(false)

  function initialize(container: HTMLElement): void {
    if (isInitialized.value) return

    // Create canvas manager
    canvasManager.value = new CanvasManager(container, {
      width: settings.value.width,
      height: settings.value.height,
      backgroundColor: settings.value.backgroundColor,
    })

    // Create brush
    brush.value = new NeoBrush(parameters.value)

    // Load initial source image
    loadSourceImage()

    // Set up event listeners
    const displayCanvas = canvasManager.value.getDisplayCanvas()
    displayCanvas.addEventListener('mousedown', handleMouseDown)
    displayCanvas.addEventListener('mousemove', handleMouseMove)
    displayCanvas.addEventListener('mouseup', handleMouseUp)
    displayCanvas.addEventListener('mouseleave', handleMouseUp)

    // Touch support
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

      // Extract image data for color sampling
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = img.width
      tempCanvas.height = img.height
      const tempCtx = tempCanvas.getContext('2d')
      if (tempCtx && brush.value && canvasManager.value) {
        tempCtx.drawImage(img, 0, 0)

        // Scale image data to match canvas dimensions for proper sampling
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

    const { x, y } = canvasManager.value.displayToCanvas(e.clientX, e.clientY)
    if (!canvasManager.value.isPointInCanvas(e.clientX, e.clientY)) return

    // Save state for undo
    const imageData = canvasManager.value.getImageData()
    historyStore.pushState('main', imageData)

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

    // Final render
    if (canvasManager.value) {
      canvasManager.value.render()
    }
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

      if (brush.value && canvasManager.value) {
        brush.value.render(canvasManager.value.getDrawingContext())
        canvasManager.value.render()
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

    // Save state for undo
    const imageData = canvasManager.value.getImageData()
    historyStore.pushState('main', imageData)

    canvasManager.value.clear()
  }

  async function saveImage(): Promise<void> {
    if (!canvasManager.value) return

    const blob = await canvasManager.value.toBlob('image/png')
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `neobrush-${Date.now()}.png`
    link.click()
    URL.revokeObjectURL(url)
  }

  function undo(): void {
    const entry = historyStore.undo()
    if (entry && canvasManager.value) {
      canvasManager.value.putImageData(entry.imageData)
    }
  }

  function redo(): void {
    const entry = historyStore.redo()
    if (entry && canvasManager.value) {
      canvasManager.value.putImageData(entry.imageData)
    }
  }

  // Watch for parameter changes
  watch(
    parameters,
    (newParams) => {
      if (brush.value) {
        brush.value.setParameters(newParams)
      }
    },
    { deep: true }
  )

  // Watch for source image changes
  watch(activeColorSource, () => {
    loadSourceImage()
  })

  // Cleanup
  onUnmounted(() => {
    stopRenderLoop()
    if (canvasManager.value) {
      canvasManager.value.destroy()
    }
  })

  return {
    initialize,
    clearCanvas,
    saveImage,
    undo,
    redo,
    isInitialized,
    canvasManager,
  }
}
