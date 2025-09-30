# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React/TypeScript application that renders interactive spinning wheel components from ZIP files exported by a Figma plugin. The app extracts wheel data (images, positioning, gradients) and renders fully interactive wheels with animations.

## Commands

### Development
```bash
npm start          # Start dev server on http://localhost:3000
npm test           # Run tests in watch mode
npm run build      # Production build to build/ folder
```

## Architecture

### Data Flow
1. **ZIP Extraction** (`src/utils/zipExtractor.ts`): Parses uploaded ZIP containing `positions.json` and image assets, returns `ExtractedAssets`
2. **Main App** (`src/App.tsx`): Manages file upload, dimension controls, component visibility toggles
3. **Wheel Viewer** (`src/components/WheelViewer.tsx`): Core orchestrator - manages component state (header states, spin animation, rotation) and renders all layers
4. **Renderers** (`src/components/renderers/`): Individual components for each wheel layer (background, segments, overlays, spin button)

### Layer System (Z-Order)
Layers render in strict order from back to front:
1. Background image
2. Wheel background overlay
3. Segments (generated SVG with gradients)
4. Header (3 states: active/success/fail)
5. Wheel top layer 1
6. Wheel top layer 2
7. Spin button (2 states: default/spinning)
8. Center overlay (optional debug circle)
9. Gradient handles (debug visualization)

### Type System (`src/types.ts`)
- **WheelExport**: Complete wheel definition from positions.json
- **ExtractedAssets**: ZIP contents with blob URLs
- **Fill/Gradient**: Complex gradient system supporting linear/radial/angular/diamond with handles
- **ComponentState**: HeaderState (active/success/fail), ButtonSpinState (default/spinning)

### Coordinate Systems
- **Original frame**: Absolute pixel coordinates from Figma export
- **Scaling**: Uniform scale applied to maintain aspect ratio (`scale = min(targetWidth/frameWidth, targetHeight/frameHeight)`)
- **Center-based positioning**: Wheel elements use (x, y) as center point
- **Bounding box**: Background/header use top-left (x, y) + width/height

### Gradient Rendering (`src/utils/segmentUtils.tsx`)
- Handles contain normalized positions (0-1) in segment bounding box
- Linear gradients: handle[1] is start (0%), handle[0] is end (100%) - handles are swapped to fix 180° reversal
- Radial gradients: handle[0] is center, handle[1] defines radius
- Segments use `objectBoundingBox` coordinate space
- Gradients remain consistent across all segments regardless of rotation

### Animation System
Spin animation (`WheelViewer.tsx:handleSpin`):
1. Calculate target segment and angle
2. Add 5-7 full rotations + overshoot (15-25°)
3. 5s main spin with cubic-bezier easing
4. 1.5s bounce-back to final position
5. Total: 6.5s animation

## Key Patterns

### State Management
- Component visibility controlled by `componentVisibility` object in App
- Animation state (spinning, rotation) managed in WheelViewer
- Visual state (header/button states) local to WheelViewer

### Segment Generation
Segments dynamically created from:
- `segmentCount` (3-8 segments)
- `WheelSegmentStyles` defining fill/stroke for odd/even/nowin/jackpot kinds
- Alternating pattern: odd/even/odd/even...
- Rendered as SVG paths with gradient fills

### Image Loading
All images from ZIP converted to blob URLs via `URL.createObjectURL()`
Images passed down as props to renderer components

## Important Notes

- Frame dimensions (`wheelData.frameSize`) determine the "original" coordinate space - all positions in positions.json are relative to this
- Gradients use handle positions when available, falling back to rotation angle
- The `center` component defines the circular exclusion zone (not rendered by default)
- Spin button controls wheel rotation via `targetRotation` state
- All renderers are independent React components receiving scale + data props