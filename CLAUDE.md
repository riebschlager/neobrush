# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NeoBrush is a modern Vue 3 + TypeScript generative art application with an Adobe Creative Suite-inspired interface. It creates organic, flowing brush strokes using physics-based vertex animation that samples colors from source images.

**Tech Stack:** Vue 3, Vite, TypeScript, Vuetify 3 (dark theme), Pinia, Canvas 2D API

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production (includes type checking)
npm run preview  # Preview production build
```

## Project Structure

```
src/
├── components/
│   ├── canvas/         # CanvasViewport - main drawing surface
│   ├── panels/         # ToolsPanel, PropertiesPanel, LayersPanel
│   └── common/         # MenuBar, StatusBar
├── composables/        # useNeoBrush - connects engine to Vue
├── engine/             # Framework-agnostic rendering engine
│   ├── brushes/        # NeoBrush, SketchLine classes
│   └── core/           # CanvasManager, Vector2D
├── stores/             # Pinia stores (brush, canvas, layers, history)
├── types/              # TypeScript interfaces
└── plugins/            # Vuetify configuration with Adobe-dark theme
```

## Architecture

### Rendering Engine (`src/engine/`)

The engine is framework-agnostic and handles all canvas rendering:

- **CanvasManager**: Manages display canvas (DOM) and drawing canvas (OffscreenCanvas). Handles coordinate mapping between display and canvas space, device pixel ratio scaling.
- **NeoBrush**: Core brush algorithm. Creates multiple `SketchLine` instances on mouse down, updates them each frame, clears on mouse up.
- **SketchLine**: Chain of vertices with physics simulation. Each vertex follows the previous one (or cursor for first) with configurable ease and speed factors.

### Physics Model

Each `SketchLine` updates vertices using:
1. Calculate distance vector from previous vertex (or cursor)
2. Multiply by ease factor (responsiveness)
3. Add to endpoint accumulator (momentum)
4. Move vertex toward endpoint
5. Multiply endpoint by speed factor (damping)

Color is sampled from source image at the middle vertex position, rendered using Catmull-Rom splines.

### State Management (Pinia)

- **brushStore**: Parameters (numberOfLines, ease/speed ranges, vertices, alpha), presets, color sources
- **canvasStore**: Dimensions, zoom/pan, drawing state
- **layersStore**: Layer stack with visibility, opacity, blend modes
- **historyStore**: Undo/redo with ImageData snapshots

### Vue Integration (`src/composables/useNeoBrush.ts`)

The composable bridges the engine and Vue:
- Initializes CanvasManager and NeoBrush on mount
- Handles mouse/touch events → engine methods
- Watches store changes → updates engine parameters
- Manages render loop with requestAnimationFrame

## Keyboard Shortcuts

- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z`: Redo
- `Ctrl/Cmd + Shift + E`: Export image
- `Ctrl/Cmd + N`: New canvas
- `Tab`: Toggle all panels

## Deployment

Configured for Netlify via `netlify.toml`. Auto-deploys from GitHub on push.

## Legacy Code

Original Processing and p5.js implementations are preserved in `archive/` for reference:
- `archive/processing/`: Processing 3 (Java) version
- `archive/p5js/`: p5.js + Angular version
