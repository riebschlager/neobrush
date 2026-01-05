# NeoBrush Modernization Project Plan

## Project Overview

Modernize NeoBrush from legacy Processing/p5.js implementations into a full-featured Vue 3 single-page application with an Adobe Creative Suite-inspired interface. The app will use raw Canvas 2D API for rendering, Vuetify for UI components, and Pinia for state management.

---

## Phase 1: Project Setup & Architecture ✅ COMPLETE

### 1.1 Archive Legacy Code ✅
- [x] Create `archive/` directory at project root
- [x] Move `NeoBrush/` to `archive/processing/`
- [x] Move `NeoBrush-P5js/` to `archive/p5js/`
- [x] Update `.gitignore` for new project structure

### 1.2 Initialize Vue Project ✅
- [x] Scaffold Vite + Vue 3 + TypeScript project in root
- [x] Install core dependencies (vuetify, pinia, @mdi/font, vite-plugin-vuetify, sass)
- [x] Configure Vuetify with custom Adobe-inspired dark theme
- [x] Set up path aliases (`@/` for `src/`)

### 1.3 Project Structure ✅
- [x] Created full directory structure per plan

---

## Phase 2: Core Rendering Engine ✅ COMPLETE

### 2.1 Canvas Manager ✅
- [x] `CanvasManager` class: handles canvas element, sizing, pixel density
- [x] Render loop with requestAnimationFrame (in useNeoBrush composable)
- [x] Coordinate system utilities (screen ↔ canvas mapping)

### 2.2 Layer System (UI Ready, Engine Partial)
- [x] Layer store with CRUD operations
- [x] Layers panel UI with visibility, opacity, blend modes
- [ ] Full layer compositing engine (future enhancement)

### 2.3 History System ✅
- [x] `HistoryStore`: undo/redo stack with ImageData snapshots
- [x] Configurable history limit (50)

### 2.4 Port NeoBrush Algorithm ✅
- [x] `NeoBrush` class: port the vertex-chain physics algorithm
- [x] `SketchLine` class with vertex following behavior
- [x] `Vector2D` utility class
- [x] Ease/speed factor, vertex count parameters
- [x] Color sampling from source image
- [x] Catmull-Rom spline rendering

---

## Phase 3: State Management (Pinia) ✅ COMPLETE

- [x] Canvas Store: dimensions, zoom, pan, drawing state
- [x] Layer Store: layer array, active layer, CRUD operations
- [x] Brush Store: parameters, presets, color sources
- [x] History Store: undo/redo stack

---

## Phase 4: User Interface ✅ COMPLETE

- [x] Adobe-style dark theme layout
- [x] Three-column layout (Tools / Canvas / Properties+Layers)
- [x] Menu bar with File, Edit, View menus
- [x] Status bar (canvas size, zoom, parameters)
- [x] Tools panel (brush selector, color sources, actions)
- [x] Properties panel (all brush parameters with sliders, presets)
- [x] Layers panel (list, visibility, opacity, blend modes)
- [x] Canvas viewport with proper scaling and shadow
- [x] Keyboard shortcuts (Undo, Redo, Export, New, Tab to toggle panels)
- [x] Touch support for tablet use

---

## Phase 5: Export Features (Partial)

### 5.1 Image Export ✅
- [x] PNG export at canvas resolution

### 5.2 Project Export (Future)
- [ ] Export project as JSON (all settings, layer data as base64)
- [ ] Import project from JSON file
- [ ] High-resolution export (2x, 4x)
- [ ] JPEG export with quality setting

### 5.3 Video Recording (Future)
- [ ] MediaRecorder API integration
- [ ] Export as WebM/MP4

---

## Phase 6: Additional Brush Types (Future)

- [ ] `BaseBrush` abstract class for brush extensibility
- [ ] `ParticleBrush`: physics-based particles
- [ ] `FlowFieldBrush`: noise-based flow field following
- [ ] `SymmetryBrush`: mirrored/radial symmetry drawing
- [ ] `StampBrush`: image-based stamps with rotation/scale jitter
- [ ] Per-brush blend mode selection

---

## Phase 7: Deployment ✅ COMPLETE

- [x] Vite production build configuration
- [x] `netlify.toml` with build settings and SPA redirects
- [ ] Set up GitHub integration for auto-deploy on push
- [ ] Custom domain setup (if applicable)

---

## Technical Decisions Summary

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Framework | Vue 3 + Vite | Modern, fast dev experience, preferred by user |
| Rendering | Canvas 2D API | Full control, no abstraction overhead, sufficient for 2D |
| UI Framework | Vuetify 3 | Rich components, excellent dark theme, Material Design |
| State | Pinia | Vue official, simple API, excellent DevTools |
| Language | TypeScript | Type safety for complex engine code |
| Styling | Vuetify + custom SCSS | Adobe theme customization on top of Vuetify |
| Deployment | Netlify | GitHub integration, free tier, user-specified |

---

## Keyboard Shortcuts (Implemented)

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + N` | New canvas |
| `Ctrl/Cmd + Shift + E` | Export image |
| `Tab` | Toggle UI panels |

---

## Next Steps

1. **Connect to GitHub and deploy to Netlify**
2. **Full layer compositing** - Currently single-layer, extend to multi-layer with offscreen canvases
3. **Project save/load** - JSON export/import with layer data
4. **Additional brush types** - Extensible brush system
5. **High-res export** - Custom resolution export options
