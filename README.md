# NeoBrush

A generative art paintbrush that creates organic, flowing brush strokes with physics-based vertex animation.

![example](https://s3-us-west-2.amazonaws.com/the816/neobrush-1.jpg)

![example](https://s3-us-west-2.amazonaws.com/the816/neobrush-2.jpg)

![example](https://s3-us-west-2.amazonaws.com/the816/neobrush-3.jpg)

## About

NeoBrush is a creative coding tool that generates painterly effects by simulating chains of vertices that follow your cursor with physics-based easing. Colors are sampled from source images, creating unique compositions with every stroke.

**Tech Stack:** Vue 3, TypeScript, Vite, Vuetify 3, Pinia, Canvas 2D API

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## How to Use

1. **Draw**: Click and drag on the canvas to create brush strokes
2. **Adjust Parameters**: Use the right panel to tweak brush behavior:
   - Number of lines per stroke
   - Line weight and opacity
   - Easing (responsiveness)
   - Speed (damping)
   - Vertex count (smoothness)
3. **Change Colors**: Select different source images in the left panel to change the color palette
4. **Presets**: Use built-in presets (Smooth, Chaotic, Fine Lines) or adjust parameters manually

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + N` | New canvas |
| `Ctrl/Cmd + Shift + E` | Export image |
| `Tab` | Toggle UI panels |

## Project Structure

```
src/
├── components/       # Vue components (panels, canvas, menus)
├── composables/      # Vue composables (useNeoBrush)
├── engine/           # Framework-agnostic rendering engine
│   ├── brushes/      # NeoBrush, SketchLine physics
│   └── core/         # CanvasManager, Vector2D
├── stores/           # Pinia stores (brush, canvas, layers, history)
├── plugins/          # Vuetify configuration
└── types/            # TypeScript interfaces
```

## Legacy Versions

The original Processing and p5.js implementations are preserved in `archive/` for reference:
- `archive/processing/` - Processing 3 (Java) desktop version
- `archive/p5js/` - p5.js web version with Angular UI

## Author

[Chris Riebschlager](http://the816.com)

## License

MIT
