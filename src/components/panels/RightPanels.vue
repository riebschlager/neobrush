<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CanvasControlsPanel from '@/components/panels/CanvasControlsPanel.vue'
import PropertiesPanel from '@/components/panels/PropertiesPanel.vue'
import LayersPanel from '@/components/panels/LayersPanel.vue'

const props = defineProps<{
  showProperties: boolean
  showLayers: boolean
}>()

const activePanel = ref(0)

const panelCount = computed(
  () => 1 + (props.showProperties ? 1 : 0) + (props.showLayers ? 1 : 0)
)

watch(panelCount, (count) => {
  if (activePanel.value >= count) {
    activePanel.value = 0
  }
})
</script>

<template>
  <div class="right-panels">
    <v-expansion-panels v-model="activePanel" class="right-accordion">
      <v-expansion-panel>
        <v-expansion-panel-title>Canvas View</v-expansion-panel-title>
        <v-expansion-panel-text>
          <CanvasControlsPanel />
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel v-if="showProperties">
        <v-expansion-panel-title>Brush Properties</v-expansion-panel-title>
        <v-expansion-panel-text>
          <PropertiesPanel embedded />
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel v-if="showLayers">
        <v-expansion-panel-title>Layers</v-expansion-panel-title>
        <v-expansion-panel-text>
          <LayersPanel embedded />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<style scoped lang="scss">
.right-panels {
  width: 280px;
  display: flex;
  flex-direction: column;
  background: #252525;
  border-left: 1px solid #404040;
  overflow: hidden;
}

.right-accordion {
  flex: 1;
  overflow-y: auto;
  background: #252525;
}

:deep(.v-expansion-panel) {
  background: #2d2d2d;
  border-bottom: 1px solid #404040;
  box-shadow: none;
}

:deep(.v-expansion-panel-title) {
  background: #323232;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #b0b0b0;
  padding: 8px 12px;
  min-height: 36px;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 12px;
}
</style>
