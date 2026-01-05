import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BrushParameters, BrushPreset, ColorSource } from '@/types'

const defaultParameters: BrushParameters = {
  numberOfLines: 100,
  lineWeight: 1,
  lineAlpha: 100,
  easeMin: 0.01,
  easeMax: 0.05,
  speedMin: 0.25,
  speedMax: 0.5,
  verticesMin: 5,
  verticesMax: 10,
}

const defaultPresets: BrushPreset[] = [
  {
    id: 'smooth',
    name: 'Smooth',
    parameters: {
      numberOfLines: 50,
      lineWeight: 1,
      lineAlpha: 80,
      easeMin: 0.02,
      easeMax: 0.04,
      speedMin: 0.3,
      speedMax: 0.4,
      verticesMin: 8,
      verticesMax: 12,
    },
  },
  {
    id: 'chaotic',
    name: 'Chaotic',
    parameters: {
      numberOfLines: 150,
      lineWeight: 0.5,
      lineAlpha: 60,
      easeMin: 0.01,
      easeMax: 0.08,
      speedMin: 0.1,
      speedMax: 0.6,
      verticesMin: 4,
      verticesMax: 15,
    },
  },
  {
    id: 'fine',
    name: 'Fine Lines',
    parameters: {
      numberOfLines: 200,
      lineWeight: 0.5,
      lineAlpha: 40,
      easeMin: 0.03,
      easeMax: 0.05,
      speedMin: 0.4,
      speedMax: 0.5,
      verticesMin: 6,
      verticesMax: 8,
    },
  },
]

export const useBrushStore = defineStore('brush', () => {
  // State
  const parameters = ref<BrushParameters>({ ...defaultParameters })
  const presets = ref<BrushPreset[]>([...defaultPresets])
  const activePresetId = ref<string | null>(null)

  const colorSources = ref<ColorSource[]>([
    { id: 'source-0', name: 'Warm', src: '/images/source-0.jpg' },
    { id: 'source-1', name: 'Cool', src: '/images/source-1.jpg' },
    { id: 'source-2', name: 'Vibrant', src: '/images/source-2.jpg' },
    { id: 'source-3', name: 'Earth', src: '/images/source-3.jpg' },
    { id: 'source-4', name: 'Neon', src: '/images/source-4.jpg' },
    { id: 'source-5', name: 'Pastel', src: '/images/source-5.jpg' },
    { id: 'source-6', name: 'Sunset', src: '/images/source-6.jpg' },
    { id: 'source-7', name: 'Ocean', src: '/images/source-7.jpg' },
    { id: 'source-8', name: 'Forest', src: '/images/source-8.jpg' },
  ])
  const activeColorSourceId = ref<string>('source-0')

  // Getters
  const activeColorSource = computed(() =>
    colorSources.value.find((s) => s.id === activeColorSourceId.value)
  )

  const activePreset = computed(() =>
    presets.value.find((p) => p.id === activePresetId.value)
  )

  // Actions
  function setParameter<K extends keyof BrushParameters>(
    key: K,
    value: BrushParameters[K]
  ) {
    parameters.value[key] = value
    activePresetId.value = null // Deselect preset when manually changing
  }

  function setParameters(params: Partial<BrushParameters>) {
    Object.assign(parameters.value, params)
    activePresetId.value = null
  }

  function applyPreset(presetId: string) {
    const preset = presets.value.find((p) => p.id === presetId)
    if (preset) {
      parameters.value = { ...preset.parameters }
      activePresetId.value = presetId
    }
  }

  function savePreset(name: string): BrushPreset {
    const id = `custom-${Date.now()}`
    const preset: BrushPreset = {
      id,
      name,
      parameters: { ...parameters.value },
    }
    presets.value.push(preset)
    activePresetId.value = id
    return preset
  }

  function deletePreset(presetId: string) {
    const index = presets.value.findIndex((p) => p.id === presetId)
    if (index !== -1 && presetId.startsWith('custom-')) {
      presets.value.splice(index, 1)
      if (activePresetId.value === presetId) {
        activePresetId.value = null
      }
    }
  }

  function setColorSource(sourceId: string) {
    activeColorSourceId.value = sourceId
  }

  function resetToDefaults() {
    parameters.value = { ...defaultParameters }
    activePresetId.value = null
  }

  return {
    // State
    parameters,
    presets,
    activePresetId,
    colorSources,
    activeColorSourceId,
    // Getters
    activeColorSource,
    activePreset,
    // Actions
    setParameter,
    setParameters,
    applyPreset,
    savePreset,
    deletePreset,
    setColorSource,
    resetToDefaults,
  }
})
