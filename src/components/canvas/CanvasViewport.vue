<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useNeoBrush } from '@/composables/useNeoBrush'
import { useCanvasStore } from '@/stores/canvas'

const canvasContainer = ref<HTMLElement | null>(null)
const { initialize, isInitialized, canvasManager } = useNeoBrush()
const canvasStore = useCanvasStore()
const { zoom } = storeToRefs(canvasStore)

const isPanning = ref(false)
const lastPointer = ref({ x: 0, y: 0 })
const spacePressed = ref(false)

let boundCanvas: HTMLCanvasElement | null = null

function startPan(event: MouseEvent) {
  const isMiddleButton = event.button === 1
  const isSpacePan = event.button === 0 && spacePressed.value
  if (!isMiddleButton && !isSpacePan) return

  event.preventDefault()
  event.stopPropagation()

  isPanning.value = true
  lastPointer.value = { x: event.clientX, y: event.clientY }
}

function handlePanMove(event: MouseEvent) {
  if (!isPanning.value) return
  const deltaX = event.clientX - lastPointer.value.x
  const deltaY = event.clientY - lastPointer.value.y
  lastPointer.value = { x: event.clientX, y: event.clientY }
  canvasStore.pan(deltaX, deltaY)
}

function endPan() {
  if (!isPanning.value) return
  isPanning.value = false
}

function handleWheel(event: WheelEvent) {
  if (!event.ctrlKey && !event.metaKey) return
  event.preventDefault()
  const direction = event.deltaY > 0 ? -1 : 1
  const nextZoom = zoom.value + direction * 0.1
  canvasStore.setZoom(nextZoom)
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.code === 'Space') {
    spacePressed.value = true
  }
}

function handleKeyUp(event: KeyboardEvent) {
  if (event.code === 'Space') {
    spacePressed.value = false
  }
}

function bindCanvasEvents(canvas: HTMLCanvasElement) {
  boundCanvas = canvas
  canvas.addEventListener('mousedown', startPan, { capture: true })
  canvas.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('mousemove', handlePanMove)
  window.addEventListener('mouseup', endPan)
}

function unbindCanvasEvents() {
  if (!boundCanvas) return
  boundCanvas.removeEventListener('mousedown', startPan, { capture: true } as EventListenerOptions)
  boundCanvas.removeEventListener('wheel', handleWheel as EventListener)
  boundCanvas = null
  window.removeEventListener('mousemove', handlePanMove)
  window.removeEventListener('mouseup', endPan)
}

onMounted(() => {
  if (canvasContainer.value) {
    initialize(canvasContainer.value)
  }
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
})

onUnmounted(() => {
  unbindCanvasEvents()
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
})

watch(
  () => canvasManager.value,
  (manager) => {
    unbindCanvasEvents()
    if (manager) {
      bindCanvasEvents(manager.getDisplayCanvas())
    }
  }
)
</script>

<template>
  <div class="canvas-viewport">
    <div ref="canvasContainer" class="canvas-container">
      <div v-if="!isInitialized" class="loading">
        <v-progress-circular indeterminate color="primary" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.canvas-viewport {
  flex: 1;
  background: #1a1a1a;
  overflow: hidden;
  position: relative;
}

.canvas-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
