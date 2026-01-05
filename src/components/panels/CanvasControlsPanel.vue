<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCanvasStore } from '@/stores/canvas'

const canvasStore = useCanvasStore()
const { zoom } = storeToRefs(canvasStore)
</script>

<template>
  <div class="canvas-controls">
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
    <div class="zoom-actions">
      <v-btn size="x-small" variant="outlined" @click="canvasStore.resetZoom()">
        Fit to View
      </v-btn>
    </div>
    <div class="pan-hint">Pan: Space + drag or middle mouse</div>
  </div>
</template>

<style scoped lang="scss">
.canvas-controls {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.zoom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.zoom-label {
  font-size: 12px;
  color: #e0e0e0;
  min-width: 52px;
  text-align: center;
}

.zoom-actions {
  display: flex;
  justify-content: center;
}

.pan-hint {
  font-size: 10px;
  color: #9c9c9c;
  text-align: center;
}
</style>
