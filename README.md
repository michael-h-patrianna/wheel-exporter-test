# Wheel Theme Preview Application

A React-based preview and testing tool for wheel-of-fortune style mini-game themes exported from Figma.

## Overview

This application provides preview functionality for wheel mini-game themes created in Figma and exported for use in production "random reward" features. It allows designers and developers to:

- **Preview** Figma-exported wheel themes in a live, interactive environment
- **Test** wheel spinning animations, state transitions, and visual behavior
- **Validate** theme assets, layouts, and component configurations before deployment

## Purpose

The wheel mini-game is part of a larger "random reward" feature in a production application. Designers create themed wheel designs in Figma, export them as structured ZIP packages, and this tool provides a sandboxed environment to preview how those themes will look and behave when integrated into the main application.

**Key use cases:**
- Theme designers can validate their Figma exports work correctly
- Developers can debug theme integration issues
- QA can verify visual consistency and animation behavior
- Product can review theme designs in an interactive format

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Framer Motion** - Animation library (web-compatible with future React Native portability)
- **Vitest** - Unit and integration testing
- **Playwright** - End-to-end testing
- **JSZip** - ZIP file parsing for theme packages

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
npm install
```

### Running the Application

```bash
npm start
```

Opens the preview application at `http://localhost:3000`

### Running Tests

```bash
# Unit and integration tests
npm test

# End-to-end tests (requires app running on port 3000)
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug
```

### Using the Preview Tool

1. **Upload a theme**: Click the file upload button and select a Figma-exported `.zip` file
2. **Preview the wheel**: The wheel will render with all theme assets and components
3. **Test spinning**: Click the spin button to trigger the wheel animation
4. **Toggle components**: Use the component visibility toggles to inspect individual layers
5. **Cycle states**: Click the header to cycle through success/fail/active states

## Architecture

### Wheel Theme Export Structure

Themes are exported from Figma as ZIP files containing:
- `wheel.json` - Theme configuration and component metadata
- Image assets (backgrounds, segments, buttons, decorations)
- Layout and positioning data
- Animation timing configurations

### Component Architecture

The wheel is composed of layered renderer components:

1. **Background layer** - Main background image
2. **Wheel background overlay** - Decorative wheel background
3. **Spinning segments** - Rotatable segments with prizes/rewards
4. **Header component** - Title/status display (active/success/fail states)
5. **Wheel top layers** - Two decorative overlay layers
6. **Animated lights** - Dynamic lighting effects
7. **Spin button** - Interactive trigger for wheel spin
8. **Center circle** - Center decoration (toggleable)
9. **Pointer/indicator** - Shows selected segment

### State Management

**Deterministic State Machine** (`useWheelStateMachine`):
- States: `IDLE` → `SPINNING` → `COMPLETE`
- Single-phase animation with natural deceleration
- Supports multiple consecutive spins
- Auto-reset capability from COMPLETE state

**Animation Timing**:
- Single spin animation: 8 seconds with extreme ease-out
- Timing breakdown:
  - First 3 seconds: 80% of rotation (fast blur effect)
  - Next 4 seconds: 18% of rotation (visible "near miss" segments)
  - Last 1 second: 2% of rotation (final segments crawling to stop)

**Rotation Physics**:
- Full spins: 4-5 complete rotations (randomized)
- No overshoot or bounce-back (single smooth animation)
- Wheel stops precisely at the center of the target segment
- Extreme ease-out curve: `cubic-bezier(0.11, 0.83, 0.36, 0.97)`

**"Near Miss" Psychology**:
The animation creates excitement by making the wheel pass 6-8 segments slowly enough that players believe "it could stop on any of these!" This psychological tension is achieved through physics-based easing, not artificial mechanics.

## Project Structure

```
wheel-exporter-test/
├── src/
│   ├── lib/                      # Core library code
│   │   ├── components/           # React components
│   │   │   ├── WheelViewer.tsx        # Main wheel component
│   │   │   ├── ResultViewer.tsx       # Result display component
│   │   │   ├── renderers/             # Layer-specific renderers
│   │   │   └── reward-rows/           # Result display components
│   │   ├── hooks/                # Custom React hooks
│   │   │   └── useWheelStateMachine.ts  # Wheel state logic
│   │   ├── services/             # Business logic
│   │   │   ├── wheelLoader.ts    # ZIP parsing and theme loading
│   │   │   └── logger.ts         # Structured logging
│   │   ├── utils/                # Helper functions
│   │   ├── constants/            # Configuration constants
│   │   └── types.ts              # TypeScript type definitions
│   ├── demo/                     # Demo application
│   │   └── App.tsx               # Main demo UI
│   └── tests/                    # Test files
├── scripts/
│   ├── playwright/               # E2E test scripts
│   │   └── debug-wheel-spin.mjs  # Spin debugging test
│   └── tools/                    # Development utilities
├── docs/                         # Documentation
│   ├── meta/                     # Project meta-documentation
│   │   └── styleguide.md         # Code style guide
│   ├── TEST_MEMORY_MANAGEMENT.md # Test configuration guide
│   └── theme.zip                 # Example theme file
└── screenshots/                  # Test artifacts (gitignored)
```

## Key Features

### Deterministic Physics
- Rotation calculations use controlled randomness for repeatability
- Configurable spin counts (5-7 full rotations)
- Overshoot behavior (15-25 degrees past target)
- Smooth bounce-back settling animation

### State Machine
- Explicit state transitions prevent invalid states
- Timeout-based transitions (5s spin + 1.5s settle)
- Supports multiple consecutive spins
- Auto-reset from COMPLETE state

### Asset Management
- Automatic ZIP extraction and validation
- Base64 image encoding for browser display
- Dynamic asset URL generation
- Error handling for missing/invalid assets

### Interactive Preview
- Real-time wheel spinning with physics
- Component visibility toggles for debugging
- Dimension controls (resize wheel)
- Segment count adjustment (3-8 segments)
- Result screen preview with reward rows

## Testing Strategy

### Unit Tests (Vitest)
- Component rendering and props
- State machine transitions
- Utility function logic
- Theme loading and parsing

**Coverage:** 82.8% overall, 98%+ for core components

### Integration Tests (Vitest + React Testing Library)
- Component interactions
- Wheel spin flow
- State synchronization

### E2E Tests (Playwright)
- Full user workflows
- Visual regression testing
- Animation timing validation
- Multi-spin scenarios

**Test Commands:**
```bash
npm test                    # Run unit tests
npm run test:e2e            # Run E2E tests
npm run test:e2e:ui         # Run E2E with UI
npm run test:e2e:debug      # Debug E2E tests
```

## Development Guidelines

### Code Style

All development must follow the rules defined in `docs/meta/styleguide.md`

**Key principles:**
- Strict TypeScript (no `any` types)
- Deterministic state management
- Cross-platform compatible animations
- Comprehensive test coverage
- Clean folder structure (no scripts in project root)

### Cross-Platform Compatibility

This is a React web project with **future React Native portability** as a requirement.

**Allowed animations:**
- Transforms: `translateX`, `translateY`, `scale`, `rotate`
- Opacity transitions
- Linear gradients only
- Color transitions

**Forbidden (breaks React Native):**
- Blur effects or CSS filters
- Radial/conic gradients
- Box shadows, text shadows
- CSS pseudo-elements (`:before`, `:after`)
- backdrop-filter, clip-path

### Memory Management

The test suite is configured to prevent memory exhaustion:
- Maximum 4 workers (`maxWorkers: 4` in `vitest.config.ts`)
- Thread pool (not process forks)
- Scoped JSDOM environments (UI tests only)

See `docs/TEST_MEMORY_MANAGEMENT.md` for details.

### Folder Usage Rules

| Activity | Required Directory |
| --- | --- |
| Browser automation (Playwright scripts) | `scripts/playwright/` |
| Physics, RNG, analytics utilities | `scripts/tools/` |
| Screenshots, videos, GIFs | `screenshots/` |
| Documentation, research notes | `docs/` |
| Temporary experiments | `src/dev-tools/` |
| **Forbidden** | Project root |

Keep the project root clean - no scripts, screenshots, or temporary files.

## Debugging

### E2E Debugging
```bash
# Run the debug wheel spin test
node scripts/playwright/debug-wheel-spin.mjs
```

This test monitors:
- Wheel state transitions (IDLE → SPINNING → SETTLING → COMPLETE)
- Rotation values (current, target, overshoot)
- CSS transition timing (5s → 1.5s)
- Button enable/disable states
- Multiple spin attempts

### Component Visibility
Use the "Show Center" toggle and component visibility controls in the demo app to inspect individual layers and debug positioning issues.

### Logging
The application includes structured logging via `src/lib/services/logger.ts`. Check browser console for:
- State transitions
- Event dispatches
- Invalid state transition attempts
- Rotation calculations

## Common Issues

**Wheel gets stuck after spinning:**
- Check that `useWheelStateMachine` is not in useEffect dependency arrays
- Verify timeouts are not being cleared prematurely
- See fix in `src/lib/components/WheelViewer.tsx:122`

**Button won't click for second spin:**
- Ensure state machine allows `START_SPIN` from `COMPLETE` state
- Check `startSpin` guard allows both `IDLE` and `COMPLETE` states
- See fix in `src/lib/hooks/useWheelStateMachine.ts:145-157,237-242`

**Assets not loading:**
- Verify ZIP structure matches expected format
- Check browser console for parsing errors
- Ensure image paths in `wheel.json` match actual files in ZIP

**TypeScript errors:**
- Run `npm run type-check` to validate types
- Ensure all dependencies are installed
- Check for missing type definitions

**Tests failing:**
- Clear test cache: `npm test -- --clearCache`
- Check for port conflicts (dev server must be on port 3000 for E2E tests)
- Verify all background processes are stopped

## API Reference

### Main Components

**WheelViewer** - Main wheel rendering component
```typescript
<WheelViewer
  wheelData={wheelExportData}
  assets={extractedAssets}
  wheelWidth={400}
  wheelHeight={600}
  segmentCount={8}
  componentVisibility={visibilityConfig}
  onToggleCenter={(show) => {}}
/>
```

**ResultViewer** - Result display component
```typescript
<ResultViewer
  wheelData={wheelExportData}
  assets={extractedAssets}
  wheelWidth={400}
  wheelHeight={600}
  rewardRows={[
    { type: 'gcsc', gcValue: '25.5K', scValue: '50' },
    { type: 'freeSpins', value: '10' }
  ]}
  buttonText="COLLECT"
  onButtonClick={() => {}}
/>
```

### Type Definitions

See `src/lib/types.ts` for complete type system with JSDoc documentation:
- `WheelExport` - Theme configuration from Figma
- `ExtractedAssets` - Processed assets with URLs
- `WheelState` - State machine states
- `WheelEvent` - State transition events
- `ComponentVisibility` - Layer visibility config

## Contributing

When working on this project:

1. Follow the code style guide in `docs/meta/styleguide.md`
2. Write tests for all new functionality (maintain 100% coverage for core features)
3. Ensure all tests pass (`npm test`)
4. Run E2E tests before committing significant changes
5. Keep cross-platform constraints in mind
6. Use `TodoWrite` tool for tasks with 3+ steps
7. Document all public APIs with JSDoc

## Future Work

- React Native port for mobile preview
- Visual regression testing suite
- Theme validation tool
- Automated theme generation from Figma API
- Performance profiling dashboard
- Accessibility improvements (ARIA labels, keyboard navigation)

## Technologies

- **React** 18.2.0 - UI framework
- **TypeScript** 5.9.3 - Type safety
- **Framer Motion** 11.15.0 - Animation library
- **Vitest** 3.0.4 - Unit testing
- **Playwright** 1.56.0 - E2E testing
- **JSZip** 3.10.1 - ZIP processing

## License

[License information to be added]

## Contact

[Contact information to be added]
