# NeoBrush

NeoBrush is a generative art application built with Vue 3 and TypeScript. It simulates organic, flowing brush strokes using a physics-based vertex animation system. The application features an Adobe-like interface and allows users to create unique compositions by sampling colors from source images.

## Environment & Commands

The project uses `npm` for dependency management and `vite` for building.

| Command | Description |
| :--- | :--- |
| `npm install` | Install dependencies. |
| `npm run dev` | Start the development server (usually at `http://localhost:5173`). |
| `npm run build` | Build the application for production (includes type checking via `vue-tsc`). |
| `npm run preview` | Preview the production build locally. |

## Architecture

The project follows a clean separation between the rendering engine and the UI framework.

### 1. Rendering Engine (`src/engine/`)
*   **Framework-Agnostic:** The core logic is pure TypeScript and does not depend on Vue.
*   **CanvasManager:** Wraps the HTML Canvas API, handling coordinate spaces (display vs. canvas), high-DPI scaling, and offscreen rendering.
*   **NeoBrush:** The main brush controller. It spawns and manages multiple `SketchLine` instances.
*   **SketchLine:** Represents a single strand of the brush. It implements the physics model (ease/speed factors) to follow the cursor or the previous vertex.

### 2. State Management (`src/stores/`)
*   Uses **Pinia** for global state.
*   `brush.ts`: Stores brush parameters (line count, opacity, physics ranges) and the active color source.
*   `canvas.ts`: Manages canvas dimensions, zoom, pan, and drawing state.
*   `layers.ts`: Handles the layer stack, visibility, blending modes, and offscreen canvases for each layer.
*   `history.ts`: Implements Undo/Redo functionality using `ImageData` snapshots.

### 3. Integration (`src/composables/`)
*   `useNeoBrush.ts`: The bridge between the Vue/Pinia world and the Engine.
    *   Initializes the `CanvasManager`.
    *   Binds DOM events (mouse/touch) to engine methods.
    *   Watches Pinia stores to update engine parameters in real-time.
    *   Manages the `requestAnimationFrame` render loop.

### 4. User Interface (`src/components/`)
*   Built with **Vue 3** and **Vuetify 3**.
*   **Layout:** Follows a classic desktop app layout (Menubar, Toolbar, Canvas, Side Panels).
*   **Theme:** customized "Adobe-dark" theme.

## Key Files & Directories

*   `src/main.ts`: Application entry point.
*   `src/App.vue`: Root component, defines the main layout structure.
*   `src/engine/brushes/NeoBrush.ts`: Core brush implementation.
*   `src/composables/useNeoBrush.ts`: Main logic controller connecting UI and Engine.
*   `src/stores/`: Directory containing all Pinia state modules.
*   `CLAUDE.md`: Contains useful context and legacy documentation rules.

## Development Conventions

*   **Language:** TypeScript.
*   **Component Style:** Vue 3 Composition API (`<script setup lang="ts">`).
*   **Engine Style:** Class-based Object-Oriented Programming (OOP).
*   **Formatting:**
    *   No semicolons (ASI).
    *   Single quotes for strings.
    *   2-space indentation.
*   **Naming:**
    *   **Components/Classes:** PascalCase (e.g., `NeoBrush`, `CanvasViewport`).
    *   **Functions/Variables:** camelCase (e.g., `startStroke`, `isDrawing`).
    *   **Files:** Match the export (PascalCase for components/classes, camelCase for composables).
