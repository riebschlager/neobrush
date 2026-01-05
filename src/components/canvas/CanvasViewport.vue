<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNeoBrush } from '@/composables/useNeoBrush'

const canvasContainer = ref<HTMLElement | null>(null)
const { initialize, isInitialized } = useNeoBrush()

onMounted(() => {
  if (canvasContainer.value) {
    initialize(canvasContainer.value)
  }
})
</script>

<template>
  <div class="canvas-viewport">
    <div ref="canvasContainer" class="canvas-container">
      <div v-if="!isInitialized" class="loading">
        <v-progress-circular indeterminate color="primary" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.canvas-viewport {
  flex: 1;
  background: #1a1a1a;
  overflow: hidden;
  position: relative;
}

.canvas-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
