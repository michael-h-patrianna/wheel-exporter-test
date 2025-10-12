# Wheel of Fortune - Architecture Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Principles](#architecture-principles)
3. [Directory Structure](#directory-structure)
4. [Core Components](#core-components)
5. [State Management](#state-management)
6. [Data Flow](#data-flow)
7. [Rendering Architecture](#rendering-architecture)
8. [Prize System](#prize-system)
9. [Utilities & Services](#utilities--services)
10. [Testing Strategy](#testing-strategy)
11. [Cross-Platform Considerations](#cross-platform-considerations)
12. [Key Design Decisions](#key-design-decisions)

---

## Project Overview

This is a **production-ready React component library** for rendering themed Wheel of Fortune games. It's designed to work with themes exported from a Figma plugin, providing a complete wheel spinning experience with prize mechanics, animations, and result displays.

### Technology Stack

- **React 19.2.0** with TypeScript 5.9.3
- **React Scripts 5.0.1** (Create React App)
- **Testing**: React Testing Library + Playwright
- **Build Tool**: Webpack (via CRA)
- **Package Manager**: npm

### Key Features

- Theme-driven rendering from Figma exports (ZIP files)
- Deterministic wheel physics with state machine
- Weighted prize selection with configurable probabilities
- Cross-platform architecture (React Native compatible)
- Comprehensive test coverage (unit + E2E)

---

## Architecture Principles

### 1. Separation of Concerns
- **Components**: UI rendering only, no business logic
- **Hooks**: Encapsulate state and behavior logic
- **Services**: External integrations and data loading
- **Utilities**: Pure functions for calculations and transformations

### 2. Type Safety
- Comprehensive TypeScript definitions in `src/lib/types.ts`
- No `any` types allowed (strict mode enabled)
- Explicit interfaces for all data structures

### 3. Deterministic Behavior
- Prize selection uses seeded RNG (Mulberry32)
- Wheel physics follow predictable state machine
- All randomness can be overridden for testing

### 4. Cross-Platform Compatibility
- Linear gradients only (no radial/conic)
- Transform-based animations (no filters/blur)
- Platform-specific adapters for crypto operations

### 5. Performance Optimization
- Memoized style calculations
- Efficient segment rendering (SVG paths)
- Memory-conscious test configuration

---

## Directory Structure

```
wheel-exporter-test/
├── src/
│   ├── lib/                          # Component library (published package)
│   │   ├── components/               # React components
│   │   │   ├── renderers/            # Individual layer renderers
│   │   │   │   ├── layouts/          # Segment layout strategies
│   │   │   │   └── __tests__/        # Component unit tests
│   │   │   ├── reward-rows/          # Result view row components
│   │   │   ├── prize/                # Prize display components
│   │   │   ├── WheelViewer.tsx       # Main wheel component
│   │   │   ├── ResultViewer.tsx      # Result display component
│   │   │   └── ErrorBoundary.tsx     # Error handling wrapper
│   │   ├── hooks/                    # React hooks
│   │   │   ├── useWheelStateMachine.ts   # Wheel spin logic
│   │   │   └── useRewardStyles.ts        # Style generation
│   │   ├── services/                 # External services
│   │   │   ├── wheelLoader.ts        # ZIP extraction
│   │   │   ├── prizeProvider.ts      # Prize table generation
│   │   │   └── logger.ts             # Structured logging
│   │   ├── utils/                    # Utility functions
│   │   │   ├── segmentUtils.tsx      # SVG path generation
│   │   │   ├── prizeSegmentMapper.ts # Prize to segment mapping
│   │   │   ├── prizeUtils.ts         # Prize validation/formatting
│   │   │   ├── rng.ts                # Deterministic RNG
│   │   │   ├── styleBuilders.ts      # CSS style generation
│   │   │   └── platform/             # Platform adapters
│   │   ├── config/                   # Configuration
│   │   │   └── prizeTable.ts         # Default prize configurations
│   │   ├── constants/                # Constants
│   │   ├── types/                    # Type definitions
│   │   │   ├── prizeTypes.ts         # Prize-related types
│   │   │   └── segmentLayoutTypes.ts # Layout types
│   │   ├── theme/                    # Theme system
│   │   ├── test-utils/               # Testing utilities
│   │   └── index.ts                  # Public API exports
│   ├── demo/                         # Demo application
│   │   ├── App.tsx                   # Demo UI
│   │   └── utils/                    # Demo utilities
│   ├── tests/                        # Additional test files
│   └── index.tsx                     # Demo entry point
├── scripts/
│   ├── playwright/                   # E2E test scripts
│   └── tools/                        # Build/utility scripts
├── docs/
│   ├── adr/                          # Architecture Decision Records
│   ├── theme/                        # Theme documentation
│   ├── TESTING.md                    # Testing guide
│   └── SEGMENT_RENDERER_PERFORMANCE.md
├── public/                           # Static assets
├── screenshots/                      # Visual test artifacts
└── CLAUDE.md                         # AI agent instructions
```

---

## Core Components

### Component Hierarchy

```
App (Demo)
└── WheelViewer
    ├── BackgroundRenderer       (Layer 1: Main background)
    ├── WheelBgRenderer         (Layer 2: Wheel background overlay)
    ├── SegmentRenderer         (Layer 3: Spinning wheel segments)
    │   └── OriginalLayout      (Layout strategy for segments)
    ├── HeaderRenderer          (Layer 4: Header with state images)
    ├── WheelTopRenderer x2     (Layers 5-6: Top overlays)
    ├── ButtonSpinRenderer      (Layer 7: Spin button)
    ├── AnimatedLightsRenderer  (Layer 8: Animated decorative lights)
    │   └── LightBulb[]         (Individual light bulbs with animations)
    ├── CenterRenderer          (Layer 9: Center debug circle)
    └── PointerRenderer         (Layer 10: Winning indicator - top layer)

ResultViewer
├── HeaderRenderer (success state)
├── RewardRow[] (prize display rows)
│   ├── GCSCRow (Gold + Sweeps coins)
│   ├── FreeSpinsRow
│   ├── XPRow
│   ├── RRRow (Random reward)
│   └── FailRow
└── Button (collect/continue)
```

### Key Component Files

#### 1. **WheelViewer** (`src/lib/components/WheelViewer.tsx`)
- **Role**: Main orchestrator for wheel display
- **Responsibilities**:
  - Manages component visibility
  - Scales rendering based on container size
  - Coordinates header and button states
  - Integrates with wheel state machine
- **Key Props**:
  - `wheelData`: Theme data from Figma export
  - `assets`: Extracted images from ZIP
  - `prizeSession`: Current prize session with winning segment
  - `segmentCount`: Number of wheel segments
  - `layoutType`: Segment layout strategy

#### 2. **SegmentRenderer** (`src/lib/components/renderers/SegmentRenderer.tsx`)
- **Role**: Renders spinning wheel segments with prizes
- **Responsibilities**:
  - Generates SVG paths for each segment
  - Applies styles from theme data
  - Handles rotation animations
  - Renders prize text and icons
- **Key Features**:
  - Supports multiple segment kinds (odd, even, jackpot, nowin)
  - Text with gradients and strokes
  - Layout strategy pattern for different segment designs
- **Location**: `src/lib/components/renderers/SegmentRenderer.tsx:1`

#### 3. **ResultViewer** (`src/lib/components/ResultViewer.tsx`)
- **Role**: Displays winning results with themed styling
- **Responsibilities**:
  - Renders reward rows based on prize type
  - Applies background styles (highlight vs default)
  - Generates button with state styles
- **Key Features**:
  - Automatic background selection based on prize type
  - Text gradients with stroke support
  - Scaled rendering based on container size
- **Location**: `src/lib/components/ResultViewer.tsx:1`

#### 4. **Renderer Components** (`src/lib/components/renderers/`)
Each renderer is responsible for a single visual layer:
- **BackgroundRenderer**: Full-screen background image
- **HeaderRenderer**: State-based header (active/success/fail)
- **WheelBgRenderer**: Wheel background layer
- **WheelTopRenderer**: Top overlay layers (supports 2 layers)
- **ButtonSpinRenderer**: Spin button with click handling
- **PointerRenderer**: Winning segment indicator
- **LightsRenderer**: Decorative light elements
- **CenterRenderer**: Debug visualization of wheel center

---

## State Management

### State Machine Architecture

The wheel uses a **finite state machine** to manage spin behavior, implemented in `useWheelStateMachine.ts:196`.

#### States

```typescript
type WheelState = 'IDLE' | 'SPINNING' | 'COMPLETE';
```

- **IDLE**: Wheel at rest, ready to spin
- **SPINNING**: 8-second animation in progress
- **COMPLETE**: Spin finished, displaying result

#### Events

```typescript
type WheelEvent =
  | { type: 'START_SPIN'; targetSegment: number; finalRotation: number }
  | { type: 'SPIN_COMPLETE' }
  | { type: 'RESET' };
```

#### State Transitions

```
IDLE → START_SPIN → SPINNING
SPINNING → SPIN_COMPLETE → COMPLETE
COMPLETE → RESET → IDLE
COMPLETE → START_SPIN → SPINNING (auto-reset)
```

#### Animation Strategy

The wheel uses a **single 8-second animation** with extreme ease-out curve to create excitement:

1. **Initial Phase (0-4s)**: Fast rotation through multiple spins (4-5 full rotations)
2. **Deceleration Phase (4-7s)**: Gradual slowdown creating "near miss" excitement
3. **Final Phase (7-8s)**: Crawl to exact target segment

This creates natural anticipation as the wheel visibly slows past several segments before stopping.

**Implementation**: `src/lib/hooks/useWheelStateMachine.ts:196`

### Component State

#### WheelViewer State
```typescript
const [headerState, setHeaderState] = useState<HeaderState>('active');
const [buttonSpinState, setButtonSpinState] = useState<ButtonSpinState>('default');
```

#### State Hook Interface
```typescript
interface UseWheelStateMachineReturn {
  state: WheelState;              // Current state
  rotation: number;               // Current rotation angle
  targetRotation: number;         // Target rotation for animation
  isSpinning: boolean;            // Convenience flag
  startSpin: () => void;          // Trigger spin
  reset: () => void;              // Reset to IDLE
}
```

---

## Data Flow

### 1. Theme Loading Flow

```
User uploads ZIP file
    ↓
wheelLoader.loadWheelFromZip()
    ↓
Extract positions.json (WheelExport)
    ↓
Load all images as Blob URLs
    ↓
Return ExtractedAssets
    ↓
Pass to WheelViewer/ResultViewer
```

**Implementation**: `src/lib/services/wheelLoader.ts:73`

### 2. Prize Session Flow

```
PrizeProvider.load()
    ↓
Generate prize table (createValidatedProductionPrizeSet)
    ↓
Select winner (selectPrize with RNG)
    ↓
Validate result
    ↓
Return PrizeProviderResult { prizes, winningIndex, seed }
    ↓
Map prizes to segments (mapPrizesToSegments)
    ↓
Pass to WheelViewer (prizeSession prop)
    ↓
useWheelStateMachine uses winningIndex for targeting
```

**Key Files**:
- Prize generation: `src/lib/services/prizeProvider.ts:44`
- Prize selection: `src/lib/utils/rng.ts:60`
- Prize mapping: `src/lib/utils/prizeSegmentMapper.ts:30`

### 3. Spin Flow

```
User clicks spin button
    ↓
ButtonSpinRenderer.onSpin()
    ↓
WheelViewer.handleSpin()
    ↓
wheelStateMachine.startSpin()
    ↓
Calculate target rotation (calculateRotation)
    ↓
Dispatch START_SPIN event
    ↓
SegmentRenderer receives targetRotation
    ↓
CSS animation runs (8 seconds)
    ↓
Timeout fires SPIN_COMPLETE
    ↓
onSpinComplete callback
    ↓
Update button state to 'default'
```

**Implementation**: `src/lib/hooks/useWheelStateMachine.ts:225`

### 4. Rendering Flow

```
WheelViewer receives props
    ↓
Calculate scale factor (min of width/height ratios)
    ↓
Pass scale to all child renderers
    ↓
Each renderer:
  - Positions elements using scaled bounds
  - Applies theme styles (fills, strokes, shadows)
  - Renders images or SVG content
    ↓
SegmentRenderer:
  - Builds SVG paths (buildSegmentWedgePath)
  - Generates text layout (computeArcFontSize)
  - Applies rotation transform
  - Renders prize icons/text
```

**Key Utilities**:
- Path generation: `src/lib/utils/segmentUtils.tsx:94`
- Style building: `src/lib/utils/styleBuilders.ts:1`

---

## Rendering Architecture

### Layered Rendering System

The wheel uses a **z-index layered approach** where each component renders at a specific layer:

```
Layer 9: Pointer (top, indicates winner)
Layer 8: Center circle (debug)
Layer 7: Spin button (interactive)
Layer 6.5: Lights (decorative)
Layer 6: Wheel Top 2 (overlay)
Layer 5: Wheel Top 1 (overlay)
Layer 4: Header (state-based)
Layer 3: Segments (spinning)
Layer 2: Wheel BG (static background)
Layer 1: Background (full frame)
```

Each layer is absolutely positioned and scaled independently.

### SVG Path Generation

Segments are rendered as SVG paths with precise mathematical calculations:

#### Wedge Path Algorithm
```typescript
// src/lib/utils/segmentUtils.tsx:94
buildSegmentWedgePath(
  centerX, centerY,      // Wheel center
  innerRadius,           // Inner radius (for donut shape)
  outerRadius,           // Outer radius
  startAngle,            // Start angle (degrees)
  endAngle               // End angle (degrees)
)
```

Generates SVG path string using:
1. Move to inner start point
2. Line to outer start point
3. Arc to outer end point
4. Line to inner end point
5. Arc back to start (if innerRadius > 0)
6. Close path

#### Text Layout Algorithm
```typescript
// src/lib/utils/segmentUtils.tsx:632
computeArcFontSize(
  text,                  // Text to render
  availableArc,          // Arc width in pixels
  maxHeight,             // Max height constraint
  minFontSize            // Minimum font size
)
```

Uses binary search to find optimal font size that fits text within segment bounds.

### Gradient System

#### Linear Gradients Only
Per cross-platform requirements, only linear gradients are supported:

```typescript
interface Gradient {
  type: 'linear';                    // Only linear supported
  rotation: number;                  // Angle in degrees
  stops: GradientStop[];             // Color stops
  transform: GradientTransform;      // Affine transform matrix
}
```

#### CSS Generation
```typescript
// src/lib/utils/styleBuilders.ts
linear-gradient(${rotation}deg, ${stops.map(s =>
  `${s.color} ${s.position * 100}%`
).join(', ')})
```

#### Text Gradients
Text gradients use background-clip technique:
```css
background-image: linear-gradient(...);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

### Scaling System

All dimensions from Figma are scaled proportionally:

```typescript
const scale = Math.min(
  wheelWidth / frameSize.width,
  wheelHeight / frameSize.height
);
```

Scaled properties:
- Positions (x, y)
- Dimensions (width, height)
- Border radius
- Padding
- Stroke widths
- Shadow offsets/blur/spread
- Font sizes

---

## Light Animation System

### Overview

The wheel includes a sophisticated **decorative light bulb animation system** that provides visual feedback based on the wheel's state. The system supports 8 distinct animation patterns and automatically switches animations based on the wheel state machine.

**Components**:
- `AnimatedLightsRenderer`: Container that manages light positioning and timing
- `LightBulb`: Individual light bulb with glow effects and animations

**Files**:
- `src/lib/components/renderers/lights/AnimatedLightsRenderer.tsx`
- `src/lib/components/renderers/lights/LightBulb.tsx`
- `src/lib/components/renderers/lights/LightBulb.css`
- `src/lib/components/renderers/lights/animations/*.css` (8 animation files)

### Architecture

#### Layer Positioning

Lights render at **Layer 8** (z-index: 17):
- Above wheelTop2 (z-index: 16), wheelTop1 (z-index: 15), buttonSpin, and segments
- Below pointer (z-index: 20) and center (z-index: 100)
- This ensures lights are visible on top of the wheel decorations but don't obscure the winning indicator

#### Component Structure

```
AnimatedLightsRenderer (Container)
├── Calculates bulb positions from wheel data
├── Reorders positions so 12 o'clock is first
├── Computes animation timing (delay per bulb)
├── Maps wheel state to animation type
└── Renders LightBulb[] (one per position)
    └── LightBulb (Individual bulb)
        ├── Wrapper div (position, classes)
        ├── Bulb element (8px circle, colored)
        ├── Inner glow (10px, medium intensity)
        └── Outer glow (12px, diffused)
```

#### Position Reordering

Lights are reordered so the **topmost bulb (minimum y coordinate)** becomes first in the array. This ensures animations start at the **12 o'clock position** instead of wherever the first bulb happens to be in the data.

```typescript
// Find bulb with minimum y (topmost)
let topIndex = 0;
let minY = positions[0].y;
for (let i = 1; i < positions.length; i++) {
  if (positions[i].y < minY) {
    minY = positions[i].y;
    topIndex = i;
  }
}

// Reorder: [top, top+1, ..., end, 0, ..., top-1]
const reordered = [
  ...positions.slice(topIndex),
  ...positions.slice(0, topIndex)
];
```

**Location**: `src/lib/components/renderers/lights/AnimatedLightsRenderer.tsx:77`

### Animation Patterns

The system supports **8 distinct animation patterns**, each with unique timing and visual characteristics:

#### 1. **Alternating Carnival** (Default/IDLE state)
- **Duration**: 1.2s
- **Pattern**: Even/odd bulbs alternate in a classic carnival marquee style
- **Timing**: Synchronized (no stagger)
- **Use Case**: Wheel at rest, attracting attention

#### 2. **Sequential Chase** (SPINNING state)
- **Duration**: 1.6s
- **Pattern**: Lights chase around the wheel one by one
- **Timing**: Synchronized (no stagger)
- **Use Case**: Wheel spinning, creating sense of motion

#### 3. **Accelerating Spin** (COMPLETE state)
- **Duration**: 5.0s
- **Pattern**: Lights chase with increasing speed
- **Timing**: 0.08 stagger multiplier
- **Special**: Winner bulb (first in array) gets extra flash effect
- **Use Case**: Wheel stopped, celebrating the win

#### 4. **Reverse Chase Pulse**
- **Duration**: 7.0s
- **Pattern**: Chase animation running in reverse direction
- **Timing**: 0.12 stagger multiplier
- **Visual**: Smooth pulse with longer fade

#### 5. **Random Sparkle**
- **Duration**: 4.0s
- **Pattern**: Bulbs light up in semi-random sequence
- **Timing**: 0.37 stagger multiplier (creates pseudo-random effect)
- **Visual**: Quick sparkles with varied intensity

#### 6. **Carnival Waltz**
- **Duration**: 4.8s
- **Pattern**: Groups of 3 in waltz rhythm (ONE-two-three)
- **Timing**: Delay per group (4.8s / numGroups)
- **Special**: Beat-based intensity (strong, weak, weak)
- **Delay Offsets**: Beat 1 (0ms), Beat 2 (+150ms), Beat 3 (+300ms)

#### 7. **Comet Trail**
- **Duration**: 3.0s
- **Pattern**: Bright head with long trailing fadeout
- **Timing**: Synchronized (no stagger)
- **Visual**: Quick flash (1%) followed by gradual 30% fadeout

#### 8. **Dual Convergence**
- **Duration**: 4.0s
- **Pattern**: Two lights from opposite sides collide at center
- **Timing**: Delay per half (4.0s / halfBulbs)
- **Special**: Collision flash at meeting point (white burst)
- **Groups**: First half vs second half

### State-Based Animation Mapping

Animations automatically switch based on the **wheel state machine**:

```typescript
const getLightAnimation = (): LightAnimationType => {
  // Manual override takes precedence
  if (lightAnimationType && lightAnimationType !== 'none') {
    return lightAnimationType;
  }

  // Map wheel state to animation
  switch (wheelStateMachine.state) {
    case 'IDLE':      return 'alternating-carnival';  // At rest
    case 'SPINNING':  return 'sequential-chase';      // Spinning
    case 'COMPLETE':  return 'accelerating-spin';     // Winner displayed
    default:          return 'alternating-carnival';
  }
};
```

**States**:
- **IDLE**: Wheel loaded or reset → **Alternating Carnival** (attracts attention)
- **SPINNING**: Wheel spinning → **Sequential Chase** (motion feedback)
- **COMPLETE**: Spin finished → **Accelerating Spin** (winner celebration)

**Location**: `src/lib/components/WheelViewer.tsx:142`

### Animation Timing System

#### Delay Calculation

Each animation has specific timing requirements:

```typescript
// Standard calculation
delayPerBulb = (duration / totalBulbs) * stagger

// Special cases
if (animationType === 'carnival-waltz') {
  const numGroups = Math.ceil(totalBulbs / 3);
  delayPerBulb = 4.8 / numGroups;  // Delay per group, not per bulb
}

if (animationType === 'dual-convergence') {
  const halfBulbs = Math.floor(totalBulbs / 2);
  delayPerBulb = 4.0 / halfBulbs;  // Delay for each half
}
```

#### Stagger Multipliers

| Animation | Duration | Stagger | Delay (16 bulbs) |
|-----------|----------|---------|------------------|
| Alternating Carnival | 1.2s | 1.0 | 75ms |
| Sequential Chase | 1.6s | 1.0 | 100ms |
| Accelerating Spin | 5.0s | **0.08** | 25ms |
| Reverse Chase Pulse | 7.0s | **0.12** | 52.5ms |
| Random Sparkle | 4.0s | **0.37** | 92.5ms |
| Carnival Waltz | 4.8s | 1.0 | 900ms (per group) |
| Comet Trail | 3.0s | 1.0 | 187.5ms |
| Dual Convergence | 4.0s | 1.0 | 500ms (per half) |

**Location**: `src/lib/components/renderers/lights/AnimatedLightsRenderer.tsx:142`

### Visual Design

#### Bulb Structure

Each light bulb consists of **three layers**:

1. **Bulb Core** (8px × 8px)
   - Solid circle with color from theme data
   - Off state: `--bulb-off` color (dim base color)
   - On state: `--bulb-on` color (bright accent color)

2. **Inner Glow** (10px × 10px)
   - Transparent background with box-shadow
   - Medium intensity glow (opacity 0.5 static)
   - Box-shadow: `0 0 4px var(--bulb-on-glow65), 0 0 8px var(--bulb-on-glow45)`

3. **Outer Glow** (12px × 12px)
   - Transparent background with box-shadow
   - Diffused glow (opacity 0.35 static)
   - Box-shadow: `0 0 6px var(--bulb-on-glow50), 0 0 12px var(--bulb-on-glow30)`

#### Color System

Colors are defined using **CSS custom properties**:

```css
.light-bulb__wrapper {
  --bulb-on: /* Bright color from theme */;
  --bulb-off: /* Dim base color */;

  /* Pre-computed color mixes for smooth transitions */
  --bulb-on-glow80: color-mix(in srgb, var(--bulb-on) 80%, transparent);
  --bulb-on-glow70: color-mix(in srgb, var(--bulb-on) 70%, transparent);
  --bulb-on-glow50: color-mix(in srgb, var(--bulb-on) 50%, transparent);
  --bulb-on-glow30: color-mix(in srgb, var(--bulb-on) 30%, transparent);

  --bulb-off-glow30: color-mix(in srgb, var(--bulb-off) 30%, transparent);
  --bulb-off-tint30: color-mix(in srgb, var(--bulb-off) 70%, var(--bulb-on) 30%);

  /* Blend states for gradual transitions */
  --bulb-blend70: color-mix(in srgb, var(--bulb-on) 70%, var(--bulb-off) 30%);
  --bulb-blend40: color-mix(in srgb, var(--bulb-on) 40%, var(--bulb-off) 60%);
}
```

This system allows smooth color transitions without recalculating colors during animations.

#### Cross-Platform Compatibility

The light system follows **strict cross-platform requirements**:

**✅ Allowed (React Native compatible)**:
- Box-shadow for glow effects (web) → will map to shadow props (React Native)
- Transform animations (opacity only)
- Linear gradients (not currently used in lights)
- Solid color fills

**❌ Forbidden (web-only)**:
- Radial gradients (would be perfect for glows, but not RN-compatible)
- Blur filters (no CSS filters in React Native)
- Text shadows (not used in bulbs)

**Implementation**: Uses `box-shadow` with multiple spreads to approximate radial glow.

### Dynamic Class Assignment

Each bulb receives dynamic CSS classes based on animation requirements:

```typescript
const classes: string[] = ['light-bulb__wrapper'];

// Add animation class
if (animationType !== 'none') {
  classes.push(`light-bulb__wrapper--${animationType}`);
}

// Add even/odd class (for alternating animations)
const isEven = index % 2 === 0;
classes.push(isEven ? 'light-bulb__wrapper--even' : 'light-bulb__wrapper--odd');

// Add carnival-waltz beat class (1, 2, or 3)
if (animationType === 'carnival-waltz') {
  classes.push(`light-bulb__wrapper--beat-${groupIndex + 1}`);
}

// Add dual-convergence half class
if (animationType === 'dual-convergence') {
  classes.push(isFirstHalf ? 'light-bulb__wrapper--first-half' : 'light-bulb__wrapper--second-half');
}
```

**Location**: `src/lib/components/renderers/lights/LightBulb.tsx:69`

### CSS Animation Structure

Each animation pattern is defined in a separate CSS file:

```
animations/
├── alternating-carnival.css    # Even/odd alternation
├── sequential-chase.css        # One-by-one chase
├── accelerating-spin.css       # Winner celebration with flash
├── reverse-chase-pulse.css     # Reverse direction chase
├── random-sparkle.css          # Pseudo-random sparkles
├── carnival-waltz.css          # Waltz rhythm (1-2-3)
├── comet-trail.css             # Bright head + long tail
└── dual-convergence.css        # Two-sided collision
```

#### Animation Keyframe Pattern

All animations follow a similar structure:

```css
/* Bulb animation (background-color + box-shadow) */
@keyframes animation-name-bulb {
  0%, 80% { /* Off state (most of cycle) */ }
  1% { /* Transition start */ }
  3% { /* Peak brightness */ }
  8% { /* Hold bright */ }
  10% { /* Fade start */ }
  12% { /* Nearly off */ }
  14%, 100% { /* Off state */ }
}

/* Glow animation (opacity) */
@keyframes animation-name-glow {
  0%, 80% { opacity: 0; }
  1% { opacity: 0.3; }
  3% { opacity: 1; }
  8% { opacity: 1; }
  10% { opacity: 0.6; }
  12% { opacity: 0.2; }
  14%, 100% { opacity: 0; }
}
```

**Pattern**:
- 80% off time ensures bulbs aren't always lit
- 1-3%: Quick ramp up (creates urgency)
- 3-8%: Hold at peak (visible brightness)
- 8-14%: Gradual fadeout (smooth transition)

### Performance Optimizations

#### CSS Optimizations

```css
.light-bulb__wrapper {
  /* GPU acceleration */
  will-change: opacity, transform;

  /* Prevent paint flashing */
  backface-visibility: hidden;

  /* Smooth animations */
  transform: translateZ(0);
}
```

#### React Optimizations

```typescript
// Memoize position reordering
const positions = useMemo(() => {
  // Reordering logic
}, [rawPositions]);

// Memoize delay calculation
const delayPerBulb = useMemo(() => {
  // Timing logic
}, [animationType, totalBulbs]);

// Memoize CSS variables
const cssVariables = useMemo(() => ({
  '--bulb-on': onColor,
  '--bulb-off': offColor,
  '--bulb-index': index,
  '--delay-per-bulb': `${delayPerBulb}s`,
}), [onColor, offColor, index, delayPerBulb]);
```

### Integration with Wheel State

The light animation system is tightly integrated with the wheel state machine:

```typescript
// In WheelViewer.tsx
const wheelStateMachine = useWheelStateMachine({
  segmentCount,
  winningSegmentIndex: prizeSession?.winningIndex,
  jackpotSegmentIndex,
  onSpinComplete: useCallback(() => {
    setButtonSpinState('default');
  }, []),
});

// Animation automatically switches based on state
<AnimatedLightsRenderer
  lights={wheelData.lights}
  scale={scale}
  animationType={getLightAnimation()}  // Maps state to animation
/>
```

**Flow**:
1. Wheel loads → State: IDLE → Animation: Alternating Carnival
2. User clicks spin → State: SPINNING → Animation: Sequential Chase
3. Spin completes → State: COMPLETE → Animation: Accelerating Spin
4. User resets → State: IDLE → Animation: Alternating Carnival

### Manual Override

The automatic animation mapping can be overridden by passing a `lightAnimationType` prop to `WheelViewer`:

```typescript
<WheelViewer
  // ... other props
  lightAnimationType="comet-trail"  // Force specific animation
/>
```

This is useful for:
- Testing individual animations
- Custom game states
- Special events or promotions

**Location**: `src/lib/components/WheelViewer.tsx:58`

---

## Prize System

### Prize Data Model

```typescript
interface Prize {
  type: 'free' | 'purchase' | 'no_win';
  probability: number;              // Must sum to 1.0 across all prizes
  slotColor: string;                // Segment background color
  slotIcon?: string;                // Optional icon URL

  // Free reward data
  freeReward?: {
    sc?: number;                    // Sweeps Coins
    gc?: number;                    // Gold Coins
    spins?: number;                 // Free spins
    xp?: { amount: number; config: XPConfig };
    randomReward?: RandomRewardConfig;
  };

  // Purchase offer data
  purchaseOffer?: {
    price: number;
    gc: number;
    sc?: number;
  };
}
```

**Location**: `src/lib/types/prizeTypes.ts`

### Prize Table Generation

#### Default Configuration
```typescript
// src/lib/config/prizeTable.ts
const DEFAULT_PRODUCTION_PRIZE_COUNT = 8;

createValidatedProductionPrizeSet({
  count: 8,              // Number of segments
  seed: 1234567890       // Optional seed for determinism
})
```

Returns array of 8 prizes with:
- 1 jackpot (high value SC)
- 1 no-win segment
- 6 varied rewards (GC, SC, free spins, XP, combos)

#### Prize Selection Algorithm

**Weighted Random Selection (Roulette Wheel)**:
```typescript
// src/lib/utils/rng.ts:60
selectPrize(prizes, seed?) → {
  selectedIndex,         // Winner index (0-7)
  seedUsed,              // RNG seed used
  cumulativeWeights      // Cumulative probability distribution
}
```

Algorithm:
1. Build cumulative probability array: `[0.1, 0.3, 0.5, 0.7, 0.85, 0.95, 0.99, 1.0]`
2. Generate random value [0, 1) using seeded RNG
3. Find first cumulative value >= random value
4. Return corresponding index

**Deterministic**: Same seed always produces same result.

### Prize to Segment Mapping

```typescript
// src/lib/utils/prizeSegmentMapper.ts:30
mapPrizesToSegments(prizes) → PrizeSegment[]
```

Transforms prize data into renderable segments:
- Determines segment kind (odd/even/jackpot/nowin)
- Generates display text with formatting
- Calculates combo flags
- Maps to appropriate icons

**Segment Kind Logic**:
- No-win prize → `'nowin'`
- First high-value SC (≥500) → `'jackpot'`
- Others alternate → `'odd'` / `'even'`

---

## Utilities & Services

### Core Utilities

#### 1. **RNG System** (`src/lib/utils/rng.ts`)
- **Mulberry32 PRNG**: Fast, deterministic, 32-bit seeded generator
- **Crypto Adapter**: Platform-specific secure random for production seeds
- **Prize Selection**: Weighted random selection with validation

#### 2. **Segment Utils** (`src/lib/utils/segmentUtils.tsx`)
- **Path Generation**: SVG path builders for wedges, rings, arcs
- **Text Layout**: Arc-based text positioning and sizing
- **Gradient Transforms**: Matrix-based gradient positioning
- **Shadow Filters**: SVG drop shadow filter generation

#### 3. **Style Builders** (`src/lib/utils/styleBuilders.ts`)
- **Gradient CSS**: Convert Fill objects to CSS gradients
- **Text Styles**: Generate text styles with gradients/strokes/shadows
- **Box Styles**: Build container styles with backgrounds/borders/shadows
- **Scaling**: Apply scale factor to all dimensions

#### 4. **Prize Utils** (`src/lib/utils/prizeUtils.ts`)
- **Number Formatting**: Abbreviate numbers (1000 → "1K")
- **Validation**: Validate prize tables (probabilities sum to 1.0)
- **Display Text**: Generate human-readable prize descriptions

### Core Services

#### 1. **Wheel Loader** (`src/lib/services/wheelLoader.ts`)
```typescript
loadWheelFromZip(zipFile: File): Promise<ExtractedAssets>
```
- Extracts positions.json and all images
- Validates ZIP structure
- Generates Blob URLs for images
- Error handling with typed errors

#### 2. **Prize Provider** (`src/lib/services/prizeProvider.ts`)
```typescript
interface PrizeProvider {
  load(context?: PrizeProviderContext): Promise<PrizeProviderResult>
}
```
- **Default Provider**: Generates prizes from configuration
- **Fixture Provider**: Uses pre-defined test fixtures
- Handles seed overrides for deterministic behavior

#### 3. **Logger** (`src/lib/services/logger.ts`)
Structured logging system with:
- Log levels: debug, info, warn, error
- Contextual metadata
- Environment-based filtering
- Nested context support

---

## Testing Strategy

### Test Architecture

#### 1. **Unit Tests** (React Testing Library + Vitest)
- **Location**: `src/lib/**/__tests__/*.test.{ts,tsx}`
- **Coverage Target**: 100%
- **Test Types**:
  - Component rendering tests
  - Hook behavior tests
  - Utility function tests
  - Service integration tests

**Configuration**: Vitest with JSDOM environment
- `maxWorkers: 4` to prevent memory exhaustion
- `pool: 'threads'` for efficiency
- Environment matching: JSDOM only for `.tsx` files

#### 2. **Integration Tests**
- **Location**: `src/lib/components/__tests__/*.integration.test.tsx`
- **Focus**: Multi-component interactions
  - Full wheel spin flow
  - Prize session integration
  - State machine transitions

#### 3. **E2E Tests** (Playwright)
- **Location**: `scripts/playwright/*.spec.ts`
- **Focus**: Real browser interactions
  - Visual regression testing
  - User workflows
  - Cross-browser compatibility

### Test Utilities

#### Factories (`src/lib/test-utils/factories.ts`)
```typescript
createMockWheelData()        // Generate test wheel data
createMockExtractedAssets()  // Generate test assets
createMockPrizeSession()     // Generate test prize session
```

#### Test Helpers
- `renderWithWrapper()`: Render components with providers
- `waitForAnimation()`: Wait for CSS animations
- `mockPrizeProvider()`: Mock prize generation

### Memory Management

**CRITICAL**: Tests must avoid memory exhaustion.

**Guidelines**:
- Use `maxWorkers: 4` in Vitest config
- Batch large data generation (100 items per batch)
- Clean up timers/listeners in `afterEach`
- Use `.test.ts` for logic tests (no JSDOM)
- Use `.test.tsx` only for component tests

**Documentation**: `docs/TEST_MEMORY_MANAGEMENT.md`

---

## Cross-Platform Considerations

### React Native Compatibility

The codebase is designed for **future React Native portability**:

#### Allowed Features
- Transform animations (translate, rotate, scale)
- Opacity animations
- **Linear gradients only** (via react-native-linear-gradient)
- Color transitions
- Layout animations

#### Forbidden Features
- Blur animations or CSS filters
- Radial/conic gradients
- Box shadows, text shadows
- backdrop-filter, clip-path
- CSS pseudo-elements (::before, ::after)
- Complex CSS selectors

#### Platform Adapters

**Crypto Adapter** (`src/lib/utils/platform/crypto.ts`):
```typescript
interface CryptoAdapter {
  generateSecureRandomSeed(): number;
}

// Web implementation
crypto.getRandomValues()

// React Native implementation (future)
expo-random or react-native-get-random-values
```

#### Animation Strategy

Current: Framer Motion (web)
Future: Moti + Reanimated (React Native)

Both use transform-based animations ensuring compatibility.

---

## Key Design Decisions

### 1. State Machine Pattern
**Decision**: Use explicit state machine for wheel spin logic

**Rationale**:
- Predictable state transitions
- Easy to test deterministically
- Clear separation of states and events
- Prevents invalid state combinations

**Implementation**: `src/lib/hooks/useWheelStateMachine.ts`

### 2. Layered Renderer Architecture
**Decision**: Split rendering into independent layer components

**Rationale**:
- Single responsibility per component
- Easy to enable/disable layers
- Clear z-index hierarchy
- Testable in isolation

**Implementation**: `src/lib/components/renderers/`

### 3. Deterministic RNG
**Decision**: Use Mulberry32 PRNG with seeded generation

**Rationale**:
- Reproducible results for testing
- Cross-platform consistency
- Fast performance (no crypto overhead in tests)
- Option for secure random in production

**Implementation**: `src/lib/utils/rng.ts`

### 4. SVG-Based Segments
**Decision**: Generate segments as SVG paths vs images

**Rationale**:
- Infinite scalability
- Dynamic styling from theme data
- Gradient and stroke support
- Small file size
- Easy text integration

**Trade-off**: More complex rendering logic

### 5. Theme-Driven Design
**Decision**: All styling comes from Figma export

**Rationale**:
- Design-first approach
- No hardcoded styles
- Easy theme swapping
- Designer control over visuals

**Trade-off**: Requires well-formed Figma exports

### 6. Single 8-Second Animation
**Decision**: One smooth animation vs multi-phase

**Rationale**:
- Simpler state management
- Smoother visual experience
- Extreme ease-out creates excitement naturally
- No jarring transitions

**Implementation**: `src/lib/hooks/useWheelStateMachine.ts:31`

### 7. Linear Gradients Only
**Decision**: Restrict to linear gradients

**Rationale**:
- React Native compatibility
- Consistent cross-platform rendering
- Sufficient for most designs
- Avoids complex gradient transformations

**Documentation**: `CLAUDE.md` CIB-001.5

---

## Public API

### Exported Components

```typescript
// Main components
export { WheelViewer } from './components/WheelViewer';
export { ResultViewer } from './components/ResultViewer';
export { ErrorBoundary } from './components/ErrorBoundary';

// Renderer components (advanced)
export { BackgroundRenderer } from './components/renderers/BackgroundRenderer';
export { HeaderRenderer } from './components/renderers/HeaderRenderer';
export { SegmentRenderer } from './components/renderers/SegmentRenderer';
// ... etc
```

### Exported Types

```typescript
// Core types
export type { WheelExport, ExtractedAssets, AppState };

// Component types
export type { HeaderState, ButtonSpinState };

// Segment types
export type { WheelSegmentKind, WheelSegmentStyles };

// Style types
export type { Fill, Gradient, DropShadow };

// Reward types
export type { RewardRowData, RewardRowType };
```

### Exported Utilities

```typescript
// Segment utilities
export {
  buildSegmentWedgePath,
  buildSegmentRingPath,
  computeArcFontSize,
  fillToSvgPaint,
  // ... etc
};

// Constants
export { SEGMENT_KINDS, TEXT_FONT_FAMILY };
```

**Entry Point**: `src/lib/index.ts`

---

## Getting Started

### For Developers

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run dev server**:
   ```bash
   npm start
   ```

3. **Run tests**:
   ```bash
   npm test          # Unit tests
   npm run test:e2e  # E2E tests
   ```

4. **Build library**:
   ```bash
   npm run build
   ```

### For Integrators

1. **Import components**:
   ```typescript
   import { WheelViewer, ResultViewer } from 'wheel-exporter-test';
   ```

2. **Load wheel theme**:
   ```typescript
   import { loadWheelFromZip } from 'wheel-exporter-test';

   const assets = await loadWheelFromZip(zipFile);
   ```

3. **Generate prizes**:
   ```typescript
   import { createDefaultPrizeProvider } from 'wheel-exporter-test';

   const provider = createDefaultPrizeProvider({ count: 8 });
   const session = await provider.load();
   ```

4. **Render wheel**:
   ```typescript
   <WheelViewer
     wheelData={assets.wheelData}
     assets={assets}
     prizeSession={session}
     segmentCount={8}
     // ... other props
   />
   ```

---

## Additional Documentation

- **Testing Guide**: `docs/TESTING.md`
- **Performance Analysis**: `docs/SEGMENT_RENDERER_PERFORMANCE.md`
- **Architecture Decisions**: `docs/adr/`
- **Theme Documentation**: `docs/theme/`
- **Project Instructions**: `CLAUDE.md`
- **E2E Test Summary**: `E2E_TEST_SUMMARY.md`

---

## Contact & Support

For questions, issues, or contributions:
- GitHub Issues: [Project Repository]
- Documentation: `docs/` directory
- Code Comments: Inline JSDoc throughout codebase
