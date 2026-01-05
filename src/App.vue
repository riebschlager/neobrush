<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import MenuBar from '@/components/common/MenuBar.vue'
import StatusBar from '@/components/common/StatusBar.vue'
import ToolsPanel from '@/components/panels/ToolsPanel.vue'
import PropertiesPanel from '@/components/panels/PropertiesPanel.vue'
import LayersPanel from '@/components/panels/LayersPanel.vue'
import CanvasViewport from '@/components/canvas/CanvasViewport.vue'
import { useNeoBrush } from '@/composables/useNeoBrush'

const showTools = ref(true)
const showProperties = ref(true)
const showLayers = ref(true)

const { undo, redo, newProject, saveImage } = useNeoBrush()

function handleKeydown(e: KeyboardEvent) {
  const isMod = e.metaKey || e.ctrlKey

  // Undo: Ctrl+Z
  if (isMod && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    undo()
    return
  }

  // Redo: Ctrl+Shift+Z
  if (isMod && e.key === 'z' && e.shiftKey) {
    e.preventDefault()
    redo()
    return
  }

  // Save: Ctrl+Shift+E
  if (isMod && e.key === 'e' && e.shiftKey) {
    e.preventDefault()
    saveImage()
    return
  }

  // New: Ctrl+N
  if (isMod && e.key === 'n') {
    e.preventDefault()
    if (confirm('Create a new canvas? This will clear the current artwork.')) {
      newProject()
    }
    return
  }

  // Toggle panels: Tab
  if (e.key === 'Tab' && !isMod) {
    e.preventDefault()
    const allVisible = showTools.value && showProperties.value && showLayers.value
    showTools.value = !allVisible
    showProperties.value = !allVisible
    showLayers.value = !allVisible
    return
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <v-app>
    <div class="app-layout">
      <MenuBar
        @toggle-tools="showTools = !showTools"
        @toggle-properties="showProperties = !showProperties"
        @toggle-layers="showLayers = !showLayers"
      />

      <div class="main-content">
        <transition name="slide-left">
          <ToolsPanel v-if="showTools" />
        </transition>

        <CanvasViewport />

        <div class="right-panels">
          <transition name="slide-right">
            <PropertiesPanel v-if="showProperties" />
          </transition>
          <transition name="slide-right">
            <LayersPanel v-if="showLayers" />
          </transition>
        </div>
      </div>

      <StatusBar />
    </div>
  </v-app>
</template>

<style scoped lang="scss">
.app-layout {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #1e1e1e;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.right-panels {
  display: flex;
  flex-direction: column;

  .panel {
    flex: 1;
    min-height: 0;
  }
}

// Transitions
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.2s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
