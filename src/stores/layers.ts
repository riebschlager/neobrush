import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Layer, BlendMode } from '@/types'

function createLayerId(): string {
  return `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const useLayersStore = defineStore('layers', () => {
  // State
  const layers = ref<Layer[]>([])
  const activeLayerId = ref<string | null>(null)

  // Getters
  const activeLayer = computed(() =>
    layers.value.find((l) => l.id === activeLayerId.value) ?? null
  )

  const visibleLayers = computed(() =>
    layers.value.filter((l) => l.visible)
  )

  const layerCount = computed(() => layers.value.length)

  // Actions
  function createLayer(name?: string): Layer {
    const id = createLayerId()
    const layer: Layer = {
      id,
      name: name ?? `Layer ${layers.value.length + 1}`,
      visible: true,
      opacity: 1,
      blendMode: 'source-over',
      locked: false,
      canvas: null,
    }
    layers.value.unshift(layer) // Add to top
    activeLayerId.value = id
    return layer
  }

  function deleteLayer(layerId: string) {
    const index = layers.value.findIndex((l) => l.id === layerId)
    if (index === -1 || layers.value.length <= 1) return

    layers.value.splice(index, 1)

    // Select another layer if the active one was deleted
    if (activeLayerId.value === layerId) {
      activeLayerId.value = layers.value[Math.min(index, layers.value.length - 1)]?.id ?? null
    }
  }

  function duplicateLayer(layerId: string): Layer | null {
    const source = layers.value.find((l) => l.id === layerId)
    if (!source) return null

    const id = createLayerId()
    const index = layers.value.findIndex((l) => l.id === layerId)

    const duplicate: Layer = {
      ...source,
      id,
      name: `${source.name} copy`,
      canvas: null, // Will be populated by the engine
    }

    layers.value.splice(index, 0, duplicate)
    activeLayerId.value = id
    return duplicate
  }

  function setActiveLayer(layerId: string) {
    if (layers.value.some((l) => l.id === layerId)) {
      activeLayerId.value = layerId
    }
  }

  function setLayerVisibility(layerId: string, visible: boolean) {
    const layer = layers.value.find((l) => l.id === layerId)
    if (layer) layer.visible = visible
  }

  function toggleLayerVisibility(layerId: string) {
    const layer = layers.value.find((l) => l.id === layerId)
    if (layer) layer.visible = !layer.visible
  }

  function setLayerOpacity(layerId: string, opacity: number) {
    const layer = layers.value.find((l) => l.id === layerId)
    if (layer) layer.opacity = Math.max(0, Math.min(1, opacity))
  }

  function setLayerBlendMode(layerId: string, blendMode: BlendMode) {
    const layer = layers.value.find((l) => l.id === layerId)
    if (layer) layer.blendMode = blendMode
  }

  function setLayerLocked(layerId: string, locked: boolean) {
    const layer = layers.value.find((l) => l.id === layerId)
    if (layer) layer.locked = locked
  }

  function renameLayer(layerId: string, name: string) {
    const layer = layers.value.find((l) => l.id === layerId)
    if (layer) layer.name = name
  }

  function reorderLayer(fromIndex: number, toIndex: number) {
    if (
      fromIndex < 0 ||
      fromIndex >= layers.value.length ||
      toIndex < 0 ||
      toIndex >= layers.value.length
    ) {
      return
    }
    const [layer] = layers.value.splice(fromIndex, 1)
    if (layer) {
      layers.value.splice(toIndex, 0, layer)
    }
  }

  function moveLayerUp(layerId: string) {
    const index = layers.value.findIndex((l) => l.id === layerId)
    if (index > 0) {
      reorderLayer(index, index - 1)
    }
  }

  function moveLayerDown(layerId: string) {
    const index = layers.value.findIndex((l) => l.id === layerId)
    if (index < layers.value.length - 1) {
      reorderLayer(index, index + 1)
    }
  }

  function setLayerCanvas(layerId: string, canvas: OffscreenCanvas) {
    const layer = layers.value.find((l) => l.id === layerId)
    if (layer) layer.canvas = canvas
  }

  function clearAllLayers() {
    layers.value = []
    activeLayerId.value = null
    createLayer('Layer 1')
  }

  // Initialize with one layer
  function initialize() {
    if (layers.value.length === 0) {
      createLayer('Layer 1')
    }
  }

  return {
    // State
    layers,
    activeLayerId,
    // Getters
    activeLayer,
    visibleLayers,
    layerCount,
    // Actions
    createLayer,
    deleteLayer,
    duplicateLayer,
    setActiveLayer,
    setLayerVisibility,
    toggleLayerVisibility,
    setLayerOpacity,
    setLayerBlendMode,
    setLayerLocked,
    renameLayer,
    reorderLayer,
    moveLayerUp,
    moveLayerDown,
    setLayerCanvas,
    clearAllLayers,
    initialize,
  }
})
