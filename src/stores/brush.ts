import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BrushParameters, BrushPreset, GradientSource } from '@/types'

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

const defaultGradients: GradientSource[] = [
  { id: 'gradient-warm', name: 'Warm', colors: ['#f6d365', '#fda085'] },
  { id: 'gradient-cool', name: 'Cool', colors: ['#84fab0', '#8fd3f4'] },
  { id: 'gradient-neon', name: 'Neon', colors: ['#f857a6', '#ff5858'] },
  { id: 'gradient-ocean', name: 'Ocean', colors: ['#2193b0', '#6dd5ed'] },
  { id: 'gradient-forest', name: 'Forest', colors: ['#56ab2f', '#a8e063'] },
  { id: 'gradient-sunset', name: 'Sunset', colors: ['#fa709a', '#fee140'] },
  { id: 'gradient-dusk', name: 'Dusk', colors: ['#2b5876', '#4e4376'] },
  { id: 'gradient-aurora', name: 'Aurora', colors: ['#00c6ff', '#0072ff'] },
]

export const useBrushStore = defineStore('brush', () => {
  // State
  const parameters = ref<BrushParameters>({ ...defaultParameters })
  const presets = ref<BrushPreset[]>([...defaultPresets])
  const activePresetId = ref<string | null>(null)

  const gradientSources = ref<GradientSource[]>([...defaultGradients])
  const activeGradientSourceId = ref<string>('gradient-warm')

  // Custom gradient state
  const customGradientId = ref<string | null>(null)

  // Getters
  const activeGradientSource = computed(() =>
    gradientSources.value.find((s) => s.id === activeGradientSourceId.value)
  )

  const activePreset = computed(() =>
    presets.value.find((p) => p.id === activePresetId.value)
  )

  const isCustomGradient = computed(() => {
    return activeGradientSourceId.value === customGradientId.value
  })

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

  function setGradientSource(sourceId: string) {
    activeGradientSourceId.value = sourceId
  }

  function createCustomGradient() {
    // If a custom gradient already exists, just select it
    if (customGradientId.value) {
      activeGradientSourceId.value = customGradientId.value
      return
    }

    const id = `custom-gradient-${Date.now()}`
    const newGradient: GradientSource = {
      id,
      name: 'Custom',
      colors: ['#000000', '#ffffff'],
    }
    gradientSources.value.push(newGradient)
    customGradientId.value = id
    activeGradientSourceId.value = id
  }

  function updateCustomGradientColors(colors: string[]) {
    if (!customGradientId.value) return
    const index = gradientSources.value.findIndex(g => g.id === customGradientId.value)
    if (index !== -1) {
      const source = gradientSources.value[index]
      if (source) {
        source.colors = [...colors]
      }
    }
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
    gradientSources,
    activeGradientSourceId,
    customGradientId,
    // Getters
    activeGradientSource,
    activePreset,
    isCustomGradient,
    // Actions
    setParameter,
    setParameters,
    applyPreset,
    savePreset,
    deletePreset,
    setGradientSource,
    createCustomGradient,
    updateCustomGradientColors,
    resetToDefaults,
  }
})