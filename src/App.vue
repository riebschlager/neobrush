<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import MenuBar from '@/components/common/MenuBar.vue'
import StatusBar from '@/components/common/StatusBar.vue'
import ToolsPanel from '@/components/panels/ToolsPanel.vue'
import RightPanels from '@/components/panels/RightPanels.vue'
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
        :show-tools="showTools"
        :show-properties="showProperties"
        :show-layers="showLayers"
        @toggle-tools="showTools = !showTools"
        @toggle-properties="showProperties = !showProperties"
        @toggle-layers="showLayers = !showLayers"
      />

      <div class="main-content">
        <CanvasViewport />

        <transition name="slide-left">
          <div v-if="showTools" class="panel-container left">
            <ToolsPanel />
          </div>
        </transition>

        <transition name="slide-right">
          <div v-if="showProperties || showLayers" class="panel-container right">
            <RightPanels
              :show-properties="showProperties"
              :show-layers="showLayers"
            />
          </div>
        </transition>
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
  position: relative; /* Ensure relative positioning for absolute children */
  overflow: hidden;
  display: block; /* Change from flex to block so CanvasViewport fills it */
}

/* Make CanvasViewport fill the entire main-content area */
:deep(.canvas-viewport) {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}

.panel-container {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 10;
  display: flex;
  background: rgba(30, 30, 30, 0.95); /* Slight transparency or solid */
  backdrop-filter: blur(10px);
  border: 1px solid #333;
}

.panel-container.left {
  left: 0;
  border-right: 1px solid #333;
}

.panel-container.right {
  right: 0;
  border-left: 1px solid #333;
}

// Transitions
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
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