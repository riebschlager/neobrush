<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLayersStore } from '@/stores/layers'

const props = defineProps<{
  embedded?: boolean
}>()

const layersStore = useLayersStore()
const { layers, activeLayerId } = storeToRefs(layersStore)

// Initialize layers if empty
layersStore.initialize()

const blendModes = [
  { title: 'Normal', value: 'source-over' },
  { title: 'Multiply', value: 'multiply' },
  { title: 'Screen', value: 'screen' },
  { title: 'Overlay', value: 'overlay' },
  { title: 'Darken', value: 'darken' },
  { title: 'Lighten', value: 'lighten' },
  { title: 'Color Dodge', value: 'color-dodge' },
  { title: 'Color Burn', value: 'color-burn' },
  { title: 'Difference', value: 'difference' },
]
</script>

<template>
  <div class="panel layers-panel" :class="{ embedded: props.embedded }">
    <div v-if="!props.embedded" class="panel-header">
      <span>Layers</span>
      <div class="header-actions">
        <v-btn
          icon
          variant="text"
          size="x-small"
          title="Add Layer"
          @click="layersStore.createLayer()"
        >
          <v-icon size="16">mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>
    <div class="panel-content">
      <div v-if="props.embedded" class="layer-toolbar">
        <span class="toolbar-label">Layer Stack</span>
        <v-btn
          icon
          variant="text"
          size="x-small"
          title="Add Layer"
          @click="layersStore.createLayer()"
        >
          <v-icon size="16">mdi-plus</v-icon>
        </v-btn>
      </div>
      <!-- Layer List -->
      <div class="layer-list">
        <div
          v-for="layer in layers"
          :key="layer.id"
          class="layer-item"
          :class="{ active: activeLayerId === layer.id }"
          @click="layersStore.setActiveLayer(layer.id)"
        >
          <div class="layer-visibility">
            <v-btn
              icon
              variant="text"
              size="x-small"
              @click.stop="layersStore.toggleLayerVisibility(layer.id)"
            >
              <v-icon size="16">
                {{ layer.visible ? 'mdi-eye' : 'mdi-eye-off' }}
              </v-icon>
            </v-btn>
          </div>
          <div class="layer-thumbnail">
            <div class="thumbnail-placeholder" />
          </div>
          <div class="layer-info">
            <div class="layer-name">{{ layer.name }}</div>
            <div class="layer-opacity">{{ Math.round(layer.opacity * 100) }}%</div>
          </div>
          <div class="layer-actions">
            <v-btn
              v-if="layers.length > 1"
              icon
              variant="text"
              size="x-small"
              title="Delete Layer"
              @click.stop="layersStore.deleteLayer(layer.id)"
            >
              <v-icon size="14">mdi-delete</v-icon>
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Active Layer Properties -->
      <template v-if="layersStore.activeLayer">
        <v-divider class="my-3" />

        <div class="property-group">
          <div class="label">Opacity</div>
          <v-slider
            :model-value="layersStore.activeLayer.opacity"
            :min="0"
            :max="1"
            :step="0.01"
            hide-details
            thumb-size="14"
            @update:model-value="(v) => layersStore.setLayerOpacity(layersStore.activeLayer!.id, v)"
          />
        </div>

        <div class="property-group">
          <div class="label">Blend Mode</div>
          <v-select
            :model-value="layersStore.activeLayer.blendMode"
            :items="blendModes"
            hide-details
            density="compact"
            @update:model-value="(v) => layersStore.setLayerBlendMode(layersStore.activeLayer!.id, v)"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.layers-panel {
  width: 260px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layers-panel.embedded {
  width: 100%;
  border: none;
  background: transparent;
}

.layers-panel.embedded .panel-content {
  padding: 0;
  overflow: visible;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.layer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.toolbar-label {
  font-size: 11px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.layer-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.layer-item {
  display: flex;
  align-items: center;
  padding: 6px;
  background: #323232;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease;

  &:hover {
    background: #3a3a3a;
  }

  &.active {
    border-color: rgb(var(--v-theme-primary));
    background: #3a3a3a;
  }
}

.layer-visibility {
  margin-right: 4px;
}

.layer-thumbnail {
  width: 32px;
  height: 32px;
  background: #1e1e1e;
  border-radius: 2px;
  margin-right: 8px;
  overflow: hidden;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #2a2a2a 25%, transparent 25%),
    linear-gradient(-45deg, #2a2a2a 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #2a2a2a 75%),
    linear-gradient(-45deg, transparent 75%, #2a2a2a 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
}

.layer-info {
  flex: 1;
  min-width: 0;
}

.layer-name {
  font-size: 12px;
  color: #e0e0e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layer-opacity {
  font-size: 10px;
  color: #888;
}

.layer-actions {
  opacity: 0;
  transition: opacity 0.15s ease;
}

.layer-item:hover .layer-actions {
  opacity: 1;
}

.property-group {
  margin-bottom: 12px;
}

.label {
  font-size: 11px;
  color: #999;
  margin-bottom: 4px;
  user-select: none;
}
</style>
