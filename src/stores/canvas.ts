import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CanvasSettings } from '@/types'

export const useCanvasStore = defineStore('canvas', () => {
  // State
  const settings = ref<CanvasSettings>({
    width: 1920,
    height: 1080,
    backgroundColor: '#000000',
  })

  const zoom = ref(1)
  const panX = ref(0)
  const panY = ref(0)

  const isDrawing = ref(false)
  const showSourceImage = ref(false)

  // Getters
  const aspectRatio = computed(() => settings.value.width / settings.value.height)

  const displayTransform = computed(() => ({
    scale: zoom.value,
    translateX: panX.value,
    translateY: panY.value,
  }))

  // Actions
  function setDimensions(width: number, height: number) {
    settings.value.width = width
    settings.value.height = height
  }

  function setBackgroundColor(color: string) {
    settings.value.backgroundColor = color
  }

  function setZoom(level: number) {
    zoom.value = Math.max(0.1, Math.min(10, level))
  }

  function zoomIn() {
    setZoom(zoom.value * 1.25)
  }

  function zoomOut() {
    setZoom(zoom.value / 1.25)
  }

  function resetZoom() {
    zoom.value = 1
    panX.value = 0
    panY.value = 0
  }

  function pan(deltaX: number, deltaY: number) {
    panX.value += deltaX
    panY.value += deltaY
  }

  function setDrawing(drawing: boolean) {
    isDrawing.value = drawing
  }

  function toggleSourceImage() {
    showSourceImage.value = !showSourceImage.value
  }

  return {
    // State
    settings,
    zoom,
    panX,
    panY,
    isDrawing,
    showSourceImage,
    // Getters
    aspectRatio,
    displayTransform,
    // Actions
    setDimensions,
    setBackgroundColor,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    pan,
    setDrawing,
    toggleSourceImage,
  }
})
