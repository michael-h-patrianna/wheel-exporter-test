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
    ├── LightsRenderer          (Layer 6.5: Decorative lights)
    ├── ButtonSpinRenderer      (Layer 7: Spin button)
    ├── CenterRenderer          (Layer 8: Center debug circle)
    └── PointerRenderer         (Layer 9: Winning indicator)

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
