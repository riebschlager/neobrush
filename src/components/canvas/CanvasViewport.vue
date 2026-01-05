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
    <div class="floating-controls">
      <v-card class="controls-card" elevation="8">
        <div class="zoom-row">
          <v-btn icon size="small" variant="text" @click="canvasStore.zoomOut()">
            <v-icon>mdi-minus</v-icon>
          </v-btn>
          <div class="zoom-label">{{ Math.round(zoom * 100) }}%</div>
          <v-btn icon size="small" variant="text" @click="canvasStore.zoomIn()">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </div>
        <v-slider
          :model-value="zoom"
          :min="0.1"
          :max="4"
          :step="0.05"
          hide-details
          density="compact"
          @update:model-value="(value) => canvasStore.setZoom(value)"
        />
        <v-btn
          size="x-small"
          variant="outlined"
          class="fit-btn"
          @click="canvasStore.resetZoom()"
        >
          Fit to View
        </v-btn>
        <div class="pan-hint">Pan: Space + drag or middle mouse</div>
      </v-card>
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

.floating-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 3;
  pointer-events: none;
}

.controls-card {
  pointer-events: auto;
  padding: 10px 12px;
  background: rgba(32, 32, 32, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.08);
  width: 170px;
}

.zoom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.zoom-label {
  font-size: 12px;
  color: #e0e0e0;
  min-width: 52px;
  text-align: center;
}

.fit-btn {
  margin-top: 6px;
  width: 100%;
}

.pan-hint {
  margin-top: 6px;
  font-size: 10px;
  color: #9c9c9c;
  text-align: center;
}
</style>
