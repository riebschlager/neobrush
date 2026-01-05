import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { HistoryEntry } from '@/types'

const MAX_HISTORY = 50

export const useHistoryStore = defineStore('history', () => {
  // State
  const entries = ref<HistoryEntry[]>([])
  const currentIndex = ref(-1)

  // Getters
  const canUndo = computed(() => currentIndex.value > 0)
  const canRedo = computed(() => currentIndex.value < entries.value.length - 1)
  const historyLength = computed(() => entries.value.length)

  // Actions
  function pushState(layerId: string, imageData: ImageData) {
    // Remove any redo states
    if (currentIndex.value < entries.value.length - 1) {
      entries.value = entries.value.slice(0, currentIndex.value + 1)
    }

    const entry: HistoryEntry = {
      id: `history-${Date.now()}`,
      timestamp: Date.now(),
      layerId,
      imageData,
    }

    entries.value.push(entry)

    // Limit history size
    if (entries.value.length > MAX_HISTORY) {
      entries.value.shift()
    } else {
      currentIndex.value++
    }
  }

  function undo(): HistoryEntry | null {
    if (!canUndo.value) return null
    currentIndex.value--
    return entries.value[currentIndex.value] ?? null
  }

  function redo(): HistoryEntry | null {
    if (!canRedo.value) return null
    currentIndex.value++
    return entries.value[currentIndex.value] ?? null
  }

  function clear() {
    entries.value = []
    currentIndex.value = -1
  }

  function getCurrentState(): HistoryEntry | null {
    if (currentIndex.value < 0) return null
    return entries.value[currentIndex.value] ?? null
  }

  return {
    // State
    entries,
    currentIndex,
    // Getters
    canUndo,
    canRedo,
    historyLength,
    // Actions
    pushState,
    undo,
    redo,
    clear,
    getCurrentState,
  }
})
