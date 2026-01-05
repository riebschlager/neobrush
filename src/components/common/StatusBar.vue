<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCanvasStore } from '@/stores/canvas'
import { useBrushStore } from '@/stores/brush'

const canvasStore = useCanvasStore()
const brushStore = useBrushStore()
const { settings, zoom } = storeToRefs(canvasStore)
const { parameters } = storeToRefs(brushStore)
</script>

<template>
  <div class="status-bar">
    <div class="status-left">
      <span class="status-item">
        <v-icon size="12">mdi-image-size-select-large</v-icon>
        {{ settings.width }} × {{ settings.height }}
      </span>
      <span class="status-item">
        <v-icon size="12">mdi-magnify</v-icon>
        {{ Math.round(zoom * 100) }}%
      </span>
    </div>
    <div class="status-right">
      <span class="status-item">
        Lines: {{ parameters.numberOfLines }}
      </span>
      <span class="status-item">
        Vertices: {{ parameters.verticesMin }}-{{ parameters.verticesMax }}
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.status-bar {
  height: 24px;
  background: #2d2d2d;
  border-top: 1px solid #404040;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  font-size: 11px;
  color: #888;
  user-select: none;
}

.status-left,
.status-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
