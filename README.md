# Wheel of Fortune Theme Preview

A React/TypeScript application for previewing and testing Wheel of Fortune themes exported from a Figma plugin. The app provides an interactive preview environment with real-time dimension controls, component visibility toggles, and animated spin functionality.

## Overview

This application renders fully interactive spinning wheel components from ZIP files exported by a companion Figma plugin. It extracts wheel configuration data (images, positioning information, gradients, animations) and renders a complete wheel interface with multiple layers, state management, and smooth animations.

### Key Features

- **ZIP Import**: Upload wheel theme packages containing images and configuration data
- **Interactive Preview**: Real-time rendering with adjustable dimensions and segment counts
- **Component Layering**: Visualize and toggle individual wheel layers (background, segments, overlays, buttons, pointers)
- **State Management**: Test different component states (header: active/success/fail, button: default/spinning)
- **Spin Animation**: Smooth 6.5s animation with overshoot and bounce-back effects
- **Gradient System**: Complex SVG gradient rendering with handle-based transforms supporting linear, radial, angular, and diamond gradients
- **Debug Tools**: Gradient handle visualization and center point overlay for development

## Architecture

### Data Flow

```
1. ZIP File Upload (positions.json + PNG assets)
   ↓
2. ZIP Extraction (zipExtractor.ts) → ExtractedAssets
   ↓
3. App.tsx (State Management + Controls)
   ↓
4. WheelViewer.tsx (Orchestration + Animation)
   ↓
5. Renderer Components (Individual Layers)
```

### Layer System (Z-Order)

Layers render in strict order from back to front:

1. **Background** - Full-frame background image
2. **Wheel Background** - Circular wheel background overlay
3. **Segments** - Dynamically generated SVG segments with gradients
4. **Header** - Three-state component (active/success/fail)
5. **Wheel Top Layer 1** - First decorative overlay
6. **Wheel Top Layer 2** - Second decorative overlay
7. **Spin Button** - Two-state interactive button (default/spinning)
8. **Center Overlay** - Debug circle showing exclusion zone
9. **Pointer** - Indicator showing winning segment
10. **Gradient Handles** - Debug visualization for gradient positioning

### Core Components

#### `App.tsx`
Main application container managing:
- File upload and ZIP processing
- Dimension controls (width, height, segment count)
- Component visibility toggles
- Wheel information display

#### `WheelViewer.tsx`
Core orchestrator handling:
- Component state management (header states, spin animation)
- Rotation calculations and animation timing
- Scale computation for aspect ratio maintenance
- Layer rendering and coordination

#### `zipExtractor.ts`
ZIP processing utility that:
- Parses `positions.json` configuration file
- Extracts image assets and creates blob URLs
- Validates required components
- Returns typed `ExtractedAssets` object

#### Renderer Components (`src/components/renderers/`)
Specialized components for each layer:
- `BackgroundRenderer.tsx` - Full-frame background
- `HeaderRenderer.tsx` - Three-state header with click cycling
- `WheelBgRenderer.tsx` - Wheel background overlay
- `SegmentRenderer.tsx` - Dynamic SVG segment generation with gradients
- `WheelTopRenderer.tsx` - Decorative top layers (1 & 2)
- `ButtonSpinRenderer.tsx` - Interactive spin button
- `CenterRenderer.tsx` - Debug center circle
- `PointerRenderer.tsx` - Winning segment indicator
- `GradientHandleRenderer.tsx` - Debug gradient visualization

### Type System (`src/types.ts`)

**Core Types:**
- `WheelExport` - Complete wheel definition from positions.json
- `ExtractedAssets` - ZIP contents with blob URLs
- `Fill/Gradient` - Complex gradient system with handles and transforms
- `ComponentState` - HeaderState, ButtonSpinState enums
- `ImageBounds` - Position/dimension data for image components
- `WheelElementBounds` - Center-based positioning for wheel elements

### Coordinate Systems

**Original Frame Space**
- All positions in `positions.json` are absolute pixel coordinates
- `frameSize` defines the original Figma artboard dimensions
- All components reference this coordinate space

**Scaling**
- Uniform scale maintains aspect ratio: `scale = min(targetWidth/frameWidth, targetHeight/frameHeight)`
- All renderers receive scale factor as prop
- Scale applied consistently across all layers

**Positioning**
- **Center-based**: Wheel elements (segments, overlays) use (x, y) as center point
- **Bounding box**: Background/header use top-left (x, y) + width/height

### Gradient Rendering

The gradient system (`src/utils/segmentUtils.tsx`) handles complex Figma gradient exports:

**Gradient Types:**
- Linear (only supported gradient type)
- ~~Radial~~ (not supported)
- ~~Angular~~ (not supported)
- ~~Diamond~~ (not supported)

**Handle System:**
- Gradients use normalized handle positions (0-1) in segment bounding box
- Three handles define gradient transform: p0 (origin), p1 (primary axis), p2 (secondary axis)
- Linear gradients: p1 is start (0%), p0 is end (100%)
- Radial gradients: p0 is center, distance to p1 defines radius
- Handles rotated 45° counterclockwise for gradient basis alignment

**Coordinate Space:**
- Segments use `userSpaceOnUse` coordinate space
- Gradient transforms map from unit space (0,0)-(1,0) to world space
- Gradients remain consistent across all segments regardless of rotation

### Animation System

**Spin Animation** (`WheelViewer.tsx:handleSpin`):

```javascript
1. Select random target segment (0 to segmentCount-1)
2. Calculate target angle for segment alignment
3. Add 5-7 full rotations for excitement (1800-2520°)
4. Add overshoot (15-25° past target)
5. Main spin: 5s with cubic-bezier easing
6. Bounce-back: 1.5s return to final position
7. Total duration: 6.5s
```

**State Transitions:**
- `isSpinning: true` during main animation (0-5s)
- `buttonSpinState: 'spinning'` shows spinning button image
- `isSpinning: false` during bounce-back (5-6.5s)
- `buttonSpinState: 'default'` restored at completion

**Important:** Only the segments SVG rotates during spinning. The spin button in the center remains stationary and does not rotate.

## Project Structure

```
wheel-exporter-test/
├── public/              # Static assets
├── src/
│   ├── components/
│   │   ├── renderers/   # Layer-specific renderer components
│   │   └── WheelViewer.tsx  # Main wheel orchestrator
│   ├── utils/
│   │   ├── zipExtractor.ts  # ZIP parsing and asset extraction
│   │   └── segmentUtils.tsx # Gradient calculations and SVG generation
│   ├── types.ts         # TypeScript type definitions
│   ├── App.tsx          # Main application component
│   └── App.css          # Application styles
├── docs/
│   ├── positions.json   # Example wheel configuration
│   └── test-wheel.zip   # Example wheel package
├── package.json
└── tsconfig.json
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

Opens development server at [http://localhost:3000](http://localhost:3000)

### Testing

```bash
npm test
```

Runs test suite in watch mode.

### Production Build

```bash
npm run build
```

Creates optimized production build in `build/` folder.

## Usage

### Loading a Wheel Theme

1. Click "Choose ZIP File" button
2. Select a wheel theme ZIP file (exported from Figma plugin)
3. Wheel renders automatically with default dimensions matching original frame size

### Controls

**Dimension Sliders:**
- **Wheel Width**: 200-1200px (adjusts display width)
- **Wheel Height**: 200-800px (adjusts display height)
- **Segments**: 3-8 segments (changes number of wheel slices)

**Component Toggles:**
- Click any component button to show/hide that layer
- Eye icon (👁) indicates visible, eye-with-dash (👁‍🗨) indicates hidden
- Gray/disabled buttons indicate missing components in the theme

**Debug Controls:**
- **Show Center**: Toggle center circle visualization
- **Show Gradient Handles**: Toggle gradient handle debug overlay

### Interactions

- **Click Header**: Cycles through states (active → success → fail → active)
- **Click Spin Button**: Triggers 6.5s wheel spin animation with random landing segment
- **Component Buttons**: Toggle visibility of individual layers

## Wheel Theme Format

### ZIP Structure

```
wheel-theme.zip
├── positions.json           # Configuration file
├── background.png           # Background image
├── header_active.png        # Header state images
├── header_success.png
├── header_fail.png
├── wheel_bg.png            # Wheel background overlay
├── wheel_top_1.png         # Top layer 1
├── wheel_top_2.png         # Top layer 2
├── button_spin_default.png # Spin button states
├── button_spin_spinning.png
└── pointer.png             # Pointer indicator
```

### positions.json Schema

```json
{
  "wheelId": "string",
  "frameSize": { "width": number, "height": number },
  "background": { "exportUrl": "string" },
  "header": {
    "stateBounds": {
      "active": { "x": number, "y": number, "width": number, "height": number, "rotation": number },
      "success": { ... },
      "fail": { ... }
    },
    "activeImg": "string",
    "successImg": "string",
    "failImg": "string"
  },
  "wheelBg": { "bounds": { ... }, "img": "string" },
  "segments": {
    "odd": { "inner": { "fill": {...} }, "outer": { "fill": {...}, "stroke": {...} } },
    "even": { ... },
    "nowin": { ... },
    "jackpot": { ... }
  },
  "wheelTop1": { "bounds": { ... }, "img": "string" },
  "wheelTop2": { "bounds": { ... }, "img": "string" },
  "buttonSpin": {
    "stateBounds": { "default": {...}, "spinning": {...} },
    "defaultImg": "string",
    "spinningImg": "string"
  },
  "pointer": { "bounds": { ... }, "img": "string" },
  "center": { "x": number, "y": number, "radius": number },
  "exportedAt": "string",
  "metadata": { "version": "string", "exportFormat": "string" }
}
```

## Key Implementation Details

### Segment Generation

Segments are dynamically created based on:
- `segmentCount` (3-8 segments)
- `WheelSegmentStyles` defining fill/stroke for odd/even/nowin/jackpot segment types
- Alternating pattern: odd/even/odd/even... (customizable)
- Rendered as SVG paths with gradient fills

**Segment Types:**
- **odd**: First visual style (typically colorful gradient)
- **even**: Alternate visual style
- **nowin**: Special "no win" segment style
- **jackpot**: Special "jackpot" segment style

**Fill Support:**
- **Solid colors**: Hex colors (e.g., `#FF0000`)
- **Linear gradients**: With rotation angle or handle positions

**Stroke Support:**
- **Width**: Numeric stroke width
- **Solid colors**: Hex colors for strokes
- **Linear gradients**: Linear gradients can be applied to strokes

**Gradient Consistency:**
Segments with the same fill/stroke but at different rotation angles are rendered to look identical in reality. The gradient transform system accounts for segment rotation, ensuring visual consistency across all segments of the same type.

### Image Loading

All images from ZIP are:
1. Extracted as Blob objects
2. Converted to blob URLs via `URL.createObjectURL()`
3. Passed as props to renderer components
4. Rendered as standard `<img>` elements with absolute positioning

### State Management

**Component Visibility:**
- Managed in `App.tsx` as `componentVisibility` object
- Passed to `WheelViewer` and checked before rendering each layer

**Animation State:**
- `isSpinning`: Boolean controlling main spin animation
- `targetRotation`: Target CSS rotation value
- `currentRotation`: Current rotation (persists between spins)
- `buttonSpinState`: Controls button image state

**Visual State:**
- `headerState`: Current header state (active/success/fail)
- Managed locally in `WheelViewer`

## Development Notes

### Important Patterns

1. **Always use the scale prop**: All renderers receive and must apply the scale factor
2. **Gradient consistency**: Gradients use template bounds (canonical 4-segment wheel) regardless of actual segment count
3. **Center defines exclusion zone**: The `center` component bounds define where segments don't render (not visible by default)
4. **Frame coordinates are canonical**: All positions in `positions.json` are relative to `frameSize`

### Common Gotchas

- Gradient handles need 45° rotation offset for proper alignment
- Linear gradient handles are swapped (p1 is start, p0 is end) to fix 180° reversal
- Image bounds use different conventions: center-based for wheel elements, bounding-box for static elements
- Animation state must be carefully managed during bounce-back phase

### Future Enhancements

Potential areas for expansion:
- Prize labels on segments
- Sound effects for spin/win
- Mobile touch interactions
- Theme gallery/preset selector
- Real-time Figma plugin integration
- Custom segment prize configuration
- Multiplayer/networked spins

## Browser Support

- Modern browsers with ES6+ support
- React 19.x
- TypeScript 4.9+

## Dependencies

- **React** (19.x): UI framework
- **JSZip** (3.x): ZIP file parsing
- **TypeScript** (4.9): Type safety
- **React Scripts** (5.x): Build tooling

## License

[Insert License]

## Contributing

[Insert contribution guidelines]

## Support

For questions or issues related to the Figma plugin export format, please refer to the plugin documentation.