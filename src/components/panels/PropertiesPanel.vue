<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useBrushStore } from '@/stores/brush'

const brushStore = useBrushStore()
const { parameters, presets, activePresetId } = storeToRefs(brushStore)

const presetItems = computed(() =>
  presets.value.map((p) => ({ title: p.name, value: p.id }))
)

const easeRange = computed({
  get: () => [parameters.value.easeMin, parameters.value.easeMax],
  set: (val: number[]) => {
    parameters.value.easeMin = val[0] ?? parameters.value.easeMin
    parameters.value.easeMax = val[1] ?? parameters.value.easeMax
  }
})

const speedRange = computed({
  get: () => [parameters.value.speedMin, parameters.value.speedMax],
  set: (val: number[]) => {
    parameters.value.speedMin = val[0] ?? parameters.value.speedMin
    parameters.value.speedMax = val[1] ?? parameters.value.speedMax
  }
})

const verticesRange = computed({
  get: () => [parameters.value.verticesMin, parameters.value.verticesMax],
  set: (val: number[]) => {
    parameters.value.verticesMin = val[0] ?? parameters.value.verticesMin
    parameters.value.verticesMax = val[1] ?? parameters.value.verticesMax
  }
})

function onPresetChange(presetId: string | null) {
  if (presetId) {
    brushStore.applyPreset(presetId)
  }
}
</script>

<template>
  <div class="panel properties-panel">
    <div class="panel-header">Brush Properties</div>
    <div class="panel-content">
      <!-- Presets -->
      <div class="property-group">
        <div class="label">Preset</div>
        <v-select
          :model-value="activePresetId"
          :items="presetItems"
          placeholder="Custom"
          clearable
          hide-details
          density="compact"
          @update:model-value="onPresetChange"
        />
      </div>

      <v-divider class="my-3" />

      <!-- Number of Lines -->
      <div class="property-group">
        <div class="property-header">
          <span class="label">Number of Lines</span>
          <span class="value">{{ parameters.numberOfLines }}</span>
        </div>
        <v-slider
          v-model="parameters.numberOfLines"
          :min="1"
          :max="300"
          :step="1"
          hide-details
          thumb-size="14"
        />
      </div>

      <!-- Line Weight -->
      <div class="property-group">
        <div class="property-header">
          <span class="label">Line Weight</span>
          <span class="value">{{ parameters.lineWeight.toFixed(1) }}</span>
        </div>
        <v-slider
          v-model="parameters.lineWeight"
          :min="0.1"
          :max="10"
          :step="0.1"
          hide-details
          thumb-size="14"
        />
      </div>

      <!-- Line Alpha -->
      <div class="property-group">
        <div class="property-header">
          <span class="label">Opacity</span>
          <span class="value">{{ Math.round(parameters.lineAlpha) }}</span>
        </div>
        <v-slider
          v-model="parameters.lineAlpha"
          :min="1"
          :max="255"
          :step="1"
          hide-details
          thumb-size="14"
        />
      </div>

      <v-divider class="my-3" />

      <!-- Ease Range -->
      <div class="property-group">
        <div class="property-header">
          <span class="label">Easing</span>
          <span class="value">{{ parameters.easeMin.toFixed(3) }} - {{ parameters.easeMax.toFixed(3) }}</span>
        </div>
        <v-range-slider
          v-model="easeRange"
          :min="0.001"
          :max="0.1"
          :step="0.001"
          hide-details
          thumb-size="14"
        />
      </div>

      <!-- Speed Range -->
      <div class="property-group">
        <div class="property-header">
          <span class="label">Speed</span>
          <span class="value">{{ parameters.speedMin.toFixed(2) }} - {{ parameters.speedMax.toFixed(2) }}</span>
        </div>
        <v-range-slider
          v-model="speedRange"
          :min="0.01"
          :max="0.9"
          :step="0.01"
          hide-details
          thumb-size="14"
        />
      </div>

      <!-- Vertices Range -->
      <div class="property-group">
        <div class="property-header">
          <span class="label">Vertices</span>
          <span class="value">{{ parameters.verticesMin }} - {{ parameters.verticesMax }}</span>
        </div>
        <v-range-slider
          v-model="verticesRange"
          :min="3"
          :max="30"
          :step="1"
          hide-details
          thumb-size="14"
        />
      </div>

      <v-divider class="my-3" />

      <!-- Reset Button -->
      <v-btn
        block
        variant="outlined"
        size="small"
        color="secondary"
        @click="brushStore.resetToDefaults()"
      >
        Reset to Defaults
      </v-btn>
    </div>
  </div>
</template>

<style scoped lang="scss">
.properties-panel {
  width: 260px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.property-group {
  margin-bottom: 12px;
}

.property-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.label {
  font-size: 11px;
  color: #999;
  user-select: none;
}

.value {
  font-size: 11px;
  color: #ccc;
  font-family: monospace;
}
</style>
