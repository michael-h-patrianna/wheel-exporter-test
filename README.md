# Wheel of Fortune Component Library

Production-ready React components for rendering themed wheel of fortune games and result views. Designed to work with themes exported from the Figma Wheel Plugin.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start demo application
npm start

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
```

## 📦 Installation

This library provides production-ready components in `src/lib/` that can be imported into your application.

### Using the Library in Your Project

```typescript
import { WheelViewer, ResultViewer, ExtractedAssets } from './lib';

function MyGame() {
  const [assets, setAssets] = useState<ExtractedAssets | null>(null);

  return (
    <WheelViewer
      wheelData={assets.wheelData}
      assets={assets}
      wheelWidth={400}
      wheelHeight={600}
      segmentCount={8}
      componentVisibility={{
        background: true,
        header: true,
        wheelBg: true,
        wheelTop1: true,
        wheelTop2: true,
        lights: true,
        buttonSpin: true,
        center: false,
        pointer: true,
        segments: true
      }}
      onToggleCenter={(show) => {/* handle center visibility */}}
    />
  );
}
```

## 📁 Project Structure

```
wheel-exporter-test/
├── src/
│   ├── lib/                      # 📚 PRODUCTION CODE
│   │   ├── components/
│   │   │   ├── WheelViewer.tsx        # Main wheel component
│   │   │   ├── ResultViewer.tsx       # Result display component
│   │   │   └── renderers/             # Layer-specific renderers
│   │   │       ├── BackgroundRenderer.tsx
│   │   │       ├── SegmentRenderer.tsx
│   │   │       ├── HeaderRenderer.tsx
│   │   │       ├── ButtonSpinRenderer.tsx
│   │   │       ├── WheelBgRenderer.tsx
│   │   │       ├── WheelTopRenderer.tsx
│   │   │       ├── PointerRenderer.tsx
│   │   │       ├── LightsRenderer.tsx
│   │   │       └── CenterRenderer.tsx
│   │   ├── utils/
│   │   │   └── segmentUtils.tsx       # Segment generation utilities
│   │   ├── types.ts                   # TypeScript definitions
│   │   └── index.ts                   # Public API exports
│   ├── demo/                     # 🎨 DEMO APPLICATION
│   │   ├── App.tsx                    # Demo UI with controls
│   │   ├── App.css                    # Demo styling
│   │   └── utils/
│   │       └── zipExtractor.ts        # ZIP file processing for demo
│   └── index.tsx                      # Application entry point
├── scripts/
│   └── playwright/                    # E2E tests
└── docs/                              # Documentation
```

## 🏗️ Production Library (`src/lib/`)

### Core Components

#### **WheelViewer**
Main wheel rendering component with animation support.

```typescript
import { WheelViewer } from './lib';

<WheelViewer
  wheelData={wheelExportData}
  assets={extractedAssets}
  wheelWidth={400}
  wheelHeight={600}
  segmentCount={8}
  componentVisibility={visibilityConfig}
  onToggleCenter={(show) => console.log('Center toggled:', show)}
/>
```

**Props:**
- `wheelData: WheelExport` - Wheel configuration from positions.json
- `assets: ExtractedAssets` - Processed theme assets (images)
- `wheelWidth: number` - Target width in pixels
- `wheelHeight: number` - Target height in pixels
- `segmentCount: number` - Number of segments (3-8)
- `componentVisibility: ComponentVisibility` - Layer visibility controls
- `onToggleCenter: (show: boolean) => void` - Center visibility callback

**Features:**
- Smooth spin animation with physics
- State management (header: active/success/fail)
- Automatic scaling to maintain aspect ratio
- Layer-based rendering system
- Interactive spin button

#### **ResultViewer**
Result display component for showing rewards.

```typescript
import { ResultViewer, RewardRowData } from './lib';

const rewards: RewardRowData[] = [
  { type: 'gcsc', gcValue: '25.5K', scValue: '50' },
  { type: 'freeSpins', value: '10' },
  { type: 'xp', value: '100', label: 'XP' }
];

<ResultViewer
  wheelData={wheelExportData}
  assets={extractedAssets}
  wheelWidth={400}
  wheelHeight={600}
  rewardRows={rewards}
  buttonText="COLLECT"
  buttonState="default"
  onButtonClick={() => console.log('Collect clicked')}
  showButton={true}
/>
```

**Props:**
- `wheelData: ExtractedAssets['wheelData']` - Wheel configuration
- `assets: ExtractedAssets` - Asset URLs
- `wheelWidth: number` - Container width
- `wheelHeight: number` - Container height
- `rewardRows?: RewardRowData[]` - Rewards to display
- `buttonText?: string` - Button label (default: "COLLECT")
- `buttonState?: 'default' | 'disabled' | 'hover' | 'active'`
- `onButtonClick?: () => void` - Button click handler
- `iconSize?: number` - Icon size in pixels
- `showButton?: boolean` - Show/hide button

#### **Renderer Components**
Individual layer renderers for advanced customization:

```typescript
import {
  BackgroundRenderer,
  HeaderRenderer,
  SegmentRenderer,
  ButtonSpinRenderer,
  WheelBgRenderer,
  WheelTopRenderer,
  PointerRenderer,
  LightsRenderer,
  CenterRenderer
} from './lib';
```

Each renderer is a self-contained component handling a specific visual layer.

### Utility Functions

```typescript
import {
  colorToCSS,
  formatNumber,
  buildSegmentWedgePath,
  createSvgGradientDef,
  computeArcFontSize,
  SEGMENT_KINDS
} from './lib';

// Convert hex colors to CSS
const cssColor = colorToCSS('#FF0000FF'); // 'rgba(255, 0, 0, 1)'

// Build SVG wedge path
const path = buildSegmentWedgePath(400, 300, 200, 0, Math.PI / 4);

// Calculate optimal font size for arc text
const fontSize = computeArcFontSize('JACKPOT', 200, Math.PI / 4);
```

### Type Definitions

```typescript
import type {
  WheelExport,
  ExtractedAssets,
  HeaderState,
  ButtonSpinState,
  WheelSegmentKind,
  WheelSegmentStyles,
  Fill,
  Gradient,
  RewardsComponent
} from './lib';
```

All types are fully documented with JSDoc comments and usage examples.

## 🎮 Demo Application (`src/demo/`)

The demo application showcases the library functionality:

1. **File Upload** - Load wheel themes from ZIP files
2. **Component Controls** - Toggle layer visibility
3. **Dimension Controls** - Adjust wheel size
4. **Segment Controls** - Change segment count
5. **Animation Demo** - Interactive spin button
6. **Result View** - Display reward screens

**To run the demo:**
```bash
npm start
```

Then upload a ZIP file exported from the Figma Wheel Plugin.

## 🎨 Cross-Platform Compatibility

**CRITICAL:** This library is designed for future React Native portability.

### ✅ Allowed Visual Features
- Linear gradients (via rotation property)
- Transforms: `translateX`, `translateY`, `scale`, `rotate`
- Opacity animations
- Color transitions

### ❌ Forbidden (React Native Incompatible)
- Box shadows (use platform-specific elevation)
- Text shadows
- Radial/conic gradients
- CSS filters or blur effects
- backdrop-filter, clip-path
- CSS pseudo-elements (:before, :after)

All production code in `src/lib/` follows these constraints.

## 📐 Data Flow

```
1. ZIP File Upload (demo only)
   ↓
2. Extract positions.json + images
   ↓
3. Create ExtractedAssets object
   ↓
4. Pass to WheelViewer/ResultViewer
   ↓
5. Components render with scaling
   ↓
6. User interaction triggers animations
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

**Coverage:** 99%+ on renderers, 97%+ on utilities
- 230+ unit tests covering all components
- Tests in `src/lib/**/__tests__/`
- Testing utilities, renderers, and integration

### E2E Tests
```bash
npm run test:e2e        # Run E2E tests
npm run test:e2e:ui     # Run with UI
npm run test:e2e:debug  # Debug mode
```

**Coverage:**
- File upload workflow
- Wheel interaction
- Component visibility
- Dimension controls
- Animation testing

## 📝 Type System

### Main Types

```typescript
// Wheel configuration from Figma export
interface WheelExport {
  wheelId: string;
  frameSize: { width: number; height: number };
  background: { exportUrl: string };
  header?: HeaderComponent;
  wheelBg?: WheelOverlay;
  segments?: WheelSegmentStyles;
  buttonSpin?: ButtonSpinComponent;
  center?: CenterComponent;
  pointer?: PointerComponent;
  lights?: LightsComponent;
  rewards?: RewardsComponent;
  exportedAt: string;
  metadata: { version: string; exportFormat?: string };
}

// Processed assets with blob URLs
interface ExtractedAssets {
  wheelData: WheelExport;
  backgroundImage?: string;
  headerImages?: { active?: string; success?: string; fail?: string };
  wheelBgImage?: string;
  wheelTop1Image?: string;
  wheelTop2Image?: string;
  buttonSpinImages?: { default?: string; spinning?: string };
  pointerImage?: string;
  rewardsPrizeImages?: Record<string, string>;
}

// Gradient system
interface Fill {
  type: 'solid' | 'gradient';
  color?: string;
  gradient?: Gradient;
}

interface Gradient {
  type: 'linear' | 'radial' | 'angular' | 'diamond';
  stops: GradientStop[];
  rotation: number;  // Primary method for linear gradients
  transform: GradientTransform;
}
```

See `src/lib/types.ts` for complete type definitions with JSDoc documentation.

## 🔧 Animation System

### Spin Animation

```typescript
// Configured in WheelViewer:handleSpin
const animation = {
  phases: [
    { name: 'spin', duration: 5000, easing: 'cubic-bezier(0.15, 0, 0.25, 1)' },
    { name: 'bounce', duration: 1500, easing: 'cubic-bezier(0.35, 0, 0.25, 1)' }
  ],
  totalDuration: 6500,
  fullSpins: 5-7,  // Random
  overshoot: 15-25  // Degrees
};
```

**Behavior:**
1. Calculate target segment randomly
2. Add 5-7 full rotations
3. Add overshoot (15-25°)
4. Animate to overshoot position (5s)
5. Bounce back to final position (1.5s)

## 🛠️ Development

### Code Quality Standards

All production code (`src/lib/`) meets:
- ✅ TypeScript strict mode
- ✅ Comprehensive JSDoc documentation
- ✅ 99%+ test coverage
- ✅ Cross-platform compatibility
- ✅ Performance optimizations (useMemo, useCallback)
- ✅ No console.log statements
- ✅ Proper error handling

### Performance Optimizations

The library uses React performance best practices:
- `useMemo` for expensive calculations (scaling, gradients)
- `useCallback` for helper functions (ResultViewer)
- Proper dependency arrays in hooks
- Minimal re-renders

### Build

```bash
npm run build
```

Outputs to `build/` directory:
- Optimized production bundle
- Source maps
- Static assets

## 📚 API Documentation

### Public Exports

```typescript
// src/lib/index.ts

// Main Components
export { WheelViewer } from './components/WheelViewer';
export { ResultViewer } from './components/ResultViewer';

// Renderers (for customization)
export { BackgroundRenderer } from './components/renderers/BackgroundRenderer';
export { HeaderRenderer } from './components/renderers/HeaderRenderer';
// ... all 9 renderers

// Utilities
export {
  colorToCSS,
  formatNumber,
  buildSegmentWedgePath,
  buildSegmentRingPath,
  createSvgGradientDef,
  // ... all utility functions
} from './utils/segmentUtils';

// Types
export type {
  WheelExport,
  ExtractedAssets,
  HeaderState,
  ButtonSpinState,
  // ... all 40+ types
} from './types';
```

All exports are fully typed and documented.

## 🎯 Usage Patterns

### Basic Wheel

```typescript
import { WheelViewer } from './lib';

function BasicWheel({ assets }) {
  return (
    <WheelViewer
      wheelData={assets.wheelData}
      assets={assets}
      wheelWidth={400}
      wheelHeight={600}
      segmentCount={8}
      componentVisibility={{
        background: true,
        header: true,
        wheelBg: true,
        wheelTop1: true,
        wheelTop2: true,
        lights: true,
        buttonSpin: true,
        center: false,
        pointer: true,
        segments: true
      }}
      onToggleCenter={() => {}}
    />
  );
}
```

### Result Screen

```typescript
import { ResultViewer } from './lib';

function ResultScreen({ assets }) {
  const rewards = [
    { type: 'gcsc' as const, gcValue: '25.5K', scValue: '50' },
    { type: 'freeSpins' as const, value: '10' }
  ];

  return (
    <ResultViewer
      wheelData={assets.wheelData}
      assets={assets}
      wheelWidth={400}
      wheelHeight={600}
      rewardRows={rewards}
      buttonText="COLLECT"
      onButtonClick={() => console.log('Collected!')}
    />
  );
}
```

### Custom Renderer Usage

```typescript
import { SegmentRenderer } from './lib';

function CustomWheel({ segments, center, scale }) {
  return (
    <div style={{ width: 400, height: 400 }}>
      <SegmentRenderer
        segments={segments}
        center={center}
        segmentCount={8}
        scale={scale}
        isSpinning={false}
        targetRotation={0}
        rewardsPrizeImages={{}}
      />
    </div>
  );
}
```

## 🚀 Technologies

- **React** 19.2.0 - UI framework
- **TypeScript** 5.9.3 - Type safety
- **JSZip** 3.10.1 - ZIP processing (demo only)
- **Playwright** 1.56.0 - E2E testing
- **Testing Library** 16.3.0 - Component testing

## 📖 Documentation

- `src/lib/types.ts` - Complete type system with JSDoc
- `src/lib/components/ResultViewer.tsx` - Extensive inline documentation
- `CLAUDE.md` - Development guidelines and requirements
- This README - API and usage guide

## ✅ Production Readiness

The `src/lib/` directory is production-ready:
- ✅ Zero console output
- ✅ 100% cross-platform compliant
- ✅ 230+ tests passing
- ✅ 99%+ test coverage
- ✅ Performance optimized
- ✅ Fully documented
- ✅ Type-safe throughout
- ✅ Modern code style

## 🤝 Contributing

When working on this project:

1. Keep `src/lib/` production-ready (no demo code)
2. Keep `src/demo/` separate (demo UI only)
3. Maintain 100% test coverage
4. Follow cross-platform constraints
5. Add JSDoc to all public exports
6. Run all tests before committing

## 📄 License

This project is a demonstration of production-quality React component development.
