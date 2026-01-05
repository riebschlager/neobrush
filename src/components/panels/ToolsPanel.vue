<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useBrushStore } from '@/stores/brush'
import { useNeoBrush } from '@/composables/useNeoBrush'

const brushStore = useBrushStore()
const {
  gradientSources,
  activeGradientSourceId,
  isCustomGradient,
  activeGradientSource
} = storeToRefs(brushStore)
const { clearCanvas, saveImage } = useNeoBrush()

function selectGradientSource(sourceId: string) {
  brushStore.setGradientSource(sourceId)
}

function getGradientStyle(colors: string[]) {
  if (colors.length === 0) return { background: '#000' }
  if (colors.length === 1) return { background: colors[0] }
  return { background: `linear-gradient(135deg, ${colors.join(', ')})` }
}

function addColor() {
  if (!activeGradientSource.value) return
  const colors = [...activeGradientSource.value.colors]
  // Add a new color that is a variation of the last one or white
  colors.push('#ffffff')
  brushStore.updateCustomGradientColors(colors)
}

function removeColor(index: number) {
  if (!activeGradientSource.value) return
  const colors = [...activeGradientSource.value.colors]
  if (colors.length <= 2) return // Maintain minimum 2 colors
  colors.splice(index, 1)
  brushStore.updateCustomGradientColors(colors)
}

function updateColor(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  if (!activeGradientSource.value) return
  const colors = [...activeGradientSource.value.colors]
  colors[index] = input.value
  brushStore.updateCustomGradientColors(colors)
}

const customColors = computed(() => {
  if (!isCustomGradient.value || !activeGradientSource.value) return []
  return activeGradientSource.value.colors
})
</script>

<template>
  <div class="panel tools-panel">
    <div class="panel-header">Tools</div>
    <div class="panel-content">
      <!-- Brush Tool -->
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

      <!-- Gradient Sources -->
      <div class="tool-section">
        <div class="label">Gradients</div>
        <div class="gradient-sources">
          <div
            v-for="source in gradientSources"
            :key="source.id"
            class="gradient-source"
            :class="{ active: activeGradientSourceId === source.id }"
            :style="getGradientStyle(source.colors)"
            :title="source.name"
            @click="selectGradientSource(source.id)"
          ></div>
          
          <!-- Add Custom Button -->
          <div 
            class="gradient-source add-custom"
            :class="{ active: isCustomGradient }"
            title="Create Custom Gradient"
            @click="brushStore.createCustomGradient()"
          >
            <v-icon size="small">mdi-plus</v-icon>
          </div>
        </div>
      </div>

      <!-- Custom Gradient Editor -->
      <div v-if="isCustomGradient" class="tool-section mt-3">
        <div class="label">Edit Gradient</div>
        <div class="custom-gradient-editor">
          <div 
            v-for="(color, index) in customColors" 
            :key="index"
            class="color-stop-row"
          >
            <input 
              type="color" 
              :value="color"
              class="color-input"
              @input="updateColor(index, $event)"
            >
            <span class="color-hex">{{ color }}</span>
            <v-btn
              icon="mdi-close"
              variant="text"
              size="x-small"
              color="grey"
              :disabled="customColors.length <= 2"
              @click="removeColor(index)"
            />
          </div>
          <v-btn
            block
            variant="tonal"
            size="x-small"
            class="mt-2"
            prepend-icon="mdi-plus"
            @click="addColor"
          >
            Add Stop
          </v-btn>
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

.gradient-sources {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.gradient-source {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.15s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }

  &.active {
    border-color: rgb(var(--v-theme-primary));
    transform: scale(1.1);
  }
}

.add-custom {
  background: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #666;
  
  &:hover {
    border-color: #fff;
    background: #444;
  }
}

.custom-gradient-editor {
  background: rgba(0,0,0,0.2);
  padding: 8px;
  border-radius: 4px;
}

.color-stop-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.color-input {
  width: 24px;
  height: 24px;
  border: none;
  padding: 0;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  &::-webkit-color-swatch {
    border: 1px solid #666;
    border-radius: 4px;
  }
}

.color-hex {
  font-size: 10px;
  font-family: monospace;
  color: #aaa;
  flex: 1;
}

.action-buttons {
  display: flex;
  flex-direction: column;
}
</style>