<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useBrushStore } from '@/stores/brush'
import { useNeoBrush } from '@/composables/useNeoBrush'

const brushStore = useBrushStore()
const { colorSources, activeColorSourceId } = storeToRefs(brushStore)
const { clearCanvas, saveImage } = useNeoBrush()

function selectColorSource(sourceId: string) {
  brushStore.setColorSource(sourceId)
}
</script>

<template>
  <div class="panel tools-panel">
    <div class="panel-header">Tools</div>
    <div class="panel-content">
      <!-- Brush Tool (currently only one) -->
      <div class="tool-section">
        <div class="label">Brush</div>
        <div class="tool-grid">
          <v-btn
            icon
            variant="flat"
            size="small"
            color="primary"
            title="NeoBrush"
          >
            <v-icon>mdi-brush</v-icon>
          </v-btn>
        </div>
      </div>

      <v-divider class="my-3" />

      <!-- Color Sources -->
      <div class="tool-section">
        <div class="label">Color Source</div>
        <div class="color-sources">
          <div
            v-for="source in colorSources"
            :key="source.id"
            class="color-source"
            :class="{ active: activeColorSourceId === source.id }"
            :title="source.name"
            @click="selectColorSource(source.id)"
          >
            <img :src="source.src" :alt="source.name" />
          </div>
        </div>
      </div>

      <v-divider class="my-3" />

      <!-- Actions -->
      <div class="tool-section">
        <div class="label">Actions</div>
        <div class="action-buttons">
          <v-btn
            block
            variant="tonal"
            size="small"
            class="mb-2"
            prepend-icon="mdi-content-save"
            @click="saveImage"
          >
            Save Image
          </v-btn>
          <v-btn
            block
            variant="outlined"
            size="small"
            color="warning"
            prepend-icon="mdi-delete"
            @click="clearCanvas"
          >
            Clear Canvas
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tools-panel {
  width: 180px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.tool-section {
  margin-bottom: 8px;
}

.label {
  font-size: 11px;
  color: #999;
  margin-bottom: 8px;
  user-select: none;
}

.tool-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.color-sources {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-source {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
  }

  &.active {
    border-color: rgb(var(--v-theme-primary));
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
}
</style>
