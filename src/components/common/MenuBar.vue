<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useNeoBrush } from '@/composables/useNeoBrush'
import { useHistoryStore } from '@/stores/history'
import { useCanvasStore } from '@/stores/canvas'

const props = defineProps<{
  showTools: boolean
  showProperties: boolean
  showLayers: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-tools'): void
  (e: 'toggle-properties'): void
  (e: 'toggle-layers'): void
}>()

const {
  clearCanvas,
  newProject,
  saveImage,
  exportImage,
  exportProject,
  importProjectFromJson,
  undo,
  redo,
} = useNeoBrush()

const historyStore = useHistoryStore()
const { canUndo, canRedo } = storeToRefs(historyStore)

const canvasStore = useCanvasStore()
const { zoom } = storeToRefs(canvasStore)

const projectFileInput = ref<HTMLInputElement | null>(null)

function handleNew() {
  if (confirm('Create a new canvas? This will clear the current artwork.')) {
    newProject()
  }
}

function handleImportProject() {
  projectFileInput.value?.click()
}

async function handleProjectFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const json = await file.text()
    await importProjectFromJson(json)
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Failed to import project.')
  } finally {
    input.value = ''
  }
}

async function handleExportProject() {
  const name = prompt('Project name', 'Untitled')
  if (name === null) return
  await exportProject(name)
}

async function handleExportPng(scale: number) {
  await exportImage({ format: 'png', scale })
}

async function handleExportJpeg() {
  const input = prompt('JPEG quality (1-100)', '90')
  if (input === null) return

  const value = Number(input)
  if (!Number.isFinite(value)) {
    alert('Please enter a number between 1 and 100.')
    return
  }

  const clamped = Math.min(100, Math.max(1, value))
  await exportImage({ format: 'jpeg', quality: clamped / 100 })
}

function zoomIn() {
  canvasStore.setZoom(zoom.value + 0.1)
}

function zoomOut() {
  canvasStore.setZoom(Math.max(0.1, zoom.value - 0.1))
}

function zoomReset() {
  canvasStore.setZoom(1.0)
}
</script>

<template>
  <div class="menu-bar">
    <div class="menu-left">
      <div class="app-title">NeoBrush</div>

      <!-- File Menu -->
      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="text" size="small">File</v-btn>
        </template>
        <v-list density="compact" class="menu-list">
          <v-list-item @click="handleNew">
            <template #prepend>
              <v-icon size="18">mdi-file-plus</v-icon>
            </template>
            <v-list-item-title>New</v-list-item-title>
            <template #append>
              <span class="shortcut">Ctrl+N</span>
            </template>
          </v-list-item>
          <v-divider />
          <v-list-item @click="handleImportProject">
            <template #prepend>
              <v-icon size="18">mdi-file-import</v-icon>
            </template>
            <v-list-item-title>Import Project</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleExportProject">
            <template #prepend>
              <v-icon size="18">mdi-file-export</v-icon>
            </template>
            <v-list-item-title>Export Project</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item @click="saveImage">
            <template #prepend>
              <v-icon size="18">mdi-content-save</v-icon>
            </template>
            <v-list-item-title>Export PNG (1x)</v-list-item-title>
            <template #append>
              <span class="shortcut">Ctrl+Shift+E</span>
            </template>
          </v-list-item>
          <v-list-item @click="handleExportPng(2)">
            <template #prepend>
              <v-icon size="18">mdi-image-size-select-large</v-icon>
            </template>
            <v-list-item-title>Export PNG (2x)</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleExportPng(4)">
            <template #prepend>
              <v-icon size="18">mdi-image-size-select-large</v-icon>
            </template>
            <v-list-item-title>Export PNG (4x)</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleExportJpeg">
            <template #prepend>
              <v-icon size="18">mdi-image</v-icon>
            </template>
            <v-list-item-title>Export JPEG...</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- Edit Menu -->
      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="text" size="small">Edit</v-btn>
        </template>
        <v-list density="compact" class="menu-list">
          <v-list-item :disabled="!canUndo" @click="undo">
            <template #prepend>
              <v-icon size="18">mdi-undo</v-icon>
            </template>
            <v-list-item-title>Undo</v-list-item-title>
            <template #append>
              <span class="shortcut">Ctrl+Z</span>
            </template>
          </v-list-item>
          <v-list-item :disabled="!canRedo" @click="redo">
            <template #prepend>
              <v-icon size="18">mdi-redo</v-icon>
            </template>
            <v-list-item-title>Redo</v-list-item-title>
            <template #append>
              <span class="shortcut">Ctrl+Shift+Z</span>
            </template>
          </v-list-item>
          <v-divider />
          <v-list-item @click="clearCanvas">
            <template #prepend>
              <v-icon size="18">mdi-delete</v-icon>
            </template>
            <v-list-item-title>Clear Canvas</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- View Menu -->
      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="text" size="small">View</v-btn>
        </template>
        <v-list density="compact" class="menu-list">
          <!-- Panels -->
          <v-list-item @click="emit('toggle-tools')">
            <template #prepend>
              <v-icon size="18">{{ props.showTools ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
            </template>
            <v-list-item-title>{{ props.showTools ? 'Hide' : 'Show' }} Tools Panel</v-list-item-title>
          </v-list-item>
          <v-list-item @click="emit('toggle-properties')">
            <template #prepend>
              <v-icon size="18">{{ props.showProperties ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
            </template>
            <v-list-item-title>{{ props.showProperties ? 'Hide' : 'Show' }} Properties Panel</v-list-item-title>
          </v-list-item>
          <v-list-item @click="emit('toggle-layers')">
            <template #prepend>
              <v-icon size="18">{{ props.showLayers ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
            </template>
            <v-list-item-title>{{ props.showLayers ? 'Hide' : 'Show' }} Layers Panel</v-list-item-title>
          </v-list-item>
          
          <v-divider />
          
          <!-- Zoom -->
          <v-list-item @click="zoomIn">
            <template #prepend>
              <v-icon size="18">mdi-magnify-plus</v-icon>
            </template>
            <v-list-item-title>Zoom In</v-list-item-title>
          </v-list-item>
          <v-list-item @click="zoomOut">
            <template #prepend>
              <v-icon size="18">mdi-magnify-minus</v-icon>
            </template>
            <v-list-item-title>Zoom Out</v-list-item-title>
          </v-list-item>
          <v-list-item @click="zoomReset">
            <template #prepend>
              <v-icon size="18">mdi-magnify</v-icon>
            </template>
            <v-list-item-title>Zoom 100%</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <div class="menu-right">
      <v-btn
        icon
        variant="text"
        size="small"
        href="https://github.com/riebschlager/neobrush"
        target="_blank"
        title="View on GitHub"
      >
        <v-icon>mdi-github</v-icon>
      </v-btn>
    </div>

    <input
      ref="projectFileInput"
      type="file"
      accept="application/json"
      class="file-input"
      @change="handleProjectFileChange"
    />
  </div>
</template>

<style scoped lang="scss">
.menu-bar {
  height: 36px;
  background: #2d2d2d;
  border-bottom: 1px solid #404040;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  user-select: none;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.app-title {
  font-size: 13px;
  font-weight: 600;
  color: #e0e0e0;
  margin-right: 16px;
  letter-spacing: 0.5px;
}

.menu-list {
  background: #323232 !important;
  min-width: 200px;
}

.shortcut {
  font-size: 11px;
  color: #888;
  margin-left: 24px;
}

.file-input {
  display: none;
}
</style>