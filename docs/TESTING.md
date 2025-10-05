# Testing Documentation

Comprehensive test suite for the Wheel Exporter Test application covering unit, integration, and end-to-end testing.

## Test Coverage Summary

- **Unit Tests**: 58%+ coverage across utilities and renderers
- **Integration Tests**: WheelViewer and App component workflows
- **E2E Tests**: Full user flows with Playwright
- **Total Tests**: 118 tests (72+ passing)

## Running Tests

### Unit & Integration Tests (Jest)

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with detailed coverage report
npm run test:coverage
```

### End-to-End Tests (Playwright)

```bash
# Run e2e tests
npm run test:e2e

# Run e2e tests with UI
npm run test:e2e:ui

# Debug e2e tests
npm run test:e2e:debug
```

### Run All Tests

```bash
npm run test:all
```

## Test Structure

```
src/
├── utils/
│   ├── testHelpers.ts                    # Shared test utilities & mocks
│   └── __tests__/
│       ├── zipExtractor.test.ts          # ZIP extraction tests
│       └── segmentUtils.test.tsx         # Segment generation tests
├── components/
│   ├── __tests__/
│   │   ├── WheelViewer.test.tsx          # Integration tests for WheelViewer
│   └── renderers/__tests__/
│       ├── BackgroundRenderer.test.tsx   # Background component tests
│       ├── HeaderRenderer.test.tsx       # Header component tests
│       └── SimpleRenderers.test.tsx      # Tests for multiple simple renderers
├── App.test.tsx                          # App integration tests
└── scripts/playwright/
    └── wheel-app.e2e.test.ts             # Full e2e user flows
```

## Test Categories

### Unit Tests

#### Utility Functions (`src/utils/__tests__/`)

**zipExtractor.test.ts**
- ZIP file parsing
- Image extraction and blob URL creation
- Error handling for missing/invalid files
- Rewards prize image extraction
- Console logging verification

**segmentUtils.test.tsx**
- Color conversion (hex, rgba)
- Number formatting for SVG
- SVG path generation (wedge, ring)
- Bounding box calculations
- Gradient transforms and matrix building
- Fill to SVG paint conversion
- Gradient definition creation

#### Renderer Components (`src/components/renderers/__tests__/`)

**BackgroundRenderer.test.tsx**
- Image rendering
- Scale application
- ARIA attributes
- Error handling
- Non-draggable images

**HeaderRenderer.test.tsx**
- State-based rendering (active/success/fail)
- Click interaction (state cycling)
- Positioning and dimensions
- Rotation support
- Scale factor application

**SimpleRenderers.test.tsx**
- WheelBgRenderer (center-based positioning)
- WheelTopRenderer (layer names)
- PointerRenderer (rotation support)
- CenterRenderer (debug circle)
- ButtonSpinRenderer (state toggling, clicks)

### Integration Tests

#### WheelViewer (`src/components/__tests__/WheelViewer.test.tsx`)

- Component visibility toggling
- Scale calculation
- Header state cycling
- Spin animation triggering
- Segment rendering
- Missing component handling
- Multi-spin rotation state
- Container dimensions

#### App Component (`src/App.test.tsx`)

- Initial render state
- File upload workflow
- Loading states
- Error handling
- Auto-dimension setting
- Dimension controls
- Component visibility toggles
- Wheel information display
- Accessibility features

### End-to-End Tests (`scripts/playwright/wheel-app.e2e.test.ts`)

#### Initial Page Load
- App header display
- Upload button visibility
- No wheel viewer before upload
- No controls before upload

#### File Upload Workflow
- ZIP file upload
- Loading state
- Wheel display
- Information display
- Auto-dimension setting

#### Wheel Controls
- Dimension changes (width/height)
- Segment count changes (3-8)
- Dimension limits enforcement
- Render updates on dimension change

#### Component Visibility Toggles
- Toggle button display
- Single component toggle
- Multiple independent toggles

#### Wheel Interactions
- Header state cycling
- Spin animation
- Segment rotation
- Multi-spin prevention

#### Visual Rendering
- Background image loading
- Segments SVG rendering
- Layer order verification

#### Error Handling
- Invalid ZIP file handling

#### Responsive Behavior
- Aspect ratio maintenance

#### Accessibility
- File input accessibility
- Keyboard navigation
- ARIA labels

## Mock Data & Test Helpers

### testHelpers.ts

Provides factory functions for creating test data:

**Mock Creators**
- `createMockGradient()` - Gradient objects with handles
- `createMockFill()` - Solid or gradient fills
- `createMockSegmentStyles()` - Wheel segment styling
- `createMockWheelData()` - Complete WheelExport objects
- `createMockExtractedAssets()` - Assets with blob URLs
- `createMockZipFile()` - File objects for upload tests
- `createMockBlob()` - Generic blob objects

**Utilities**
- `waitFor()` - Async operation helper
- `mockImageLoad()` - Image loading mock

## Writing New Tests

### Unit Test Example

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent prop="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Integration Test Example

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react';
import { createMockExtractedAssets } from '../utils/testHelpers';

describe('MyIntegrationTest', () => {
  it('should handle user interaction', async () => {
    const mockAssets = createMockExtractedAssets();
    const { container } = render(<App assets={mockAssets} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(container.querySelector('.result')).toBeVisible();
    });
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should complete user flow', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Button').click();
  await expect(page.getByText('Result')).toBeVisible();
});
```

## Coverage Goals

- **Utilities**: 90%+ coverage
- **Components**: 70%+ coverage
- **Integration**: 60%+ coverage
- **E2E**: Critical user paths

## Current Test Metrics

```
File                         | % Stmts | % Branch | % Funcs | % Lines
-----------------------------|---------|----------|---------|--------
All files                    |   58.00 |    37.28 |   44.08 |   59.50
  src/utils                  |   90.54 |    85.71 |   71.42 |   90.81
  src/components/renderers   |   58.01 |    38.81 |   56.00 |   60.37
  src/components             |   23.38 |    25.68 |   31.57 |   24.57
  src                        |   17.85 |     4.80 |    4.76 |   18.86
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npx playwright install chromium
      - run: npm run test:e2e
```

## Troubleshooting

### Common Issues

**Jest Mock Timing**
- Use `jest.useFakeTimers()` for animation tests
- Advance timers with `jest.advanceTimersByTime()`

**Async Tests**
- Always use `waitFor()` for async assertions
- Mock promises with controlled resolution

**Playwright Timeouts**
- Increase timeout for slow operations
- Use `{ timeout: 10000 }` on expect statements

**Coverage Not Updating**
- Clear Jest cache: `npm test -- --clearCache`
- Delete `coverage/` directory

## Best Practices

1. **Always test user-facing behavior**, not implementation details
2. **Use descriptive test names** that explain what's being tested
3. **Mock external dependencies** (APIs, file system)
4. **Test error states** as well as happy paths
5. **Keep tests isolated** - no shared state between tests
6. **Use test helpers** to reduce duplication
7. **Follow AAA pattern**: Arrange, Act, Assert

## Future Improvements

- [ ] Increase coverage to 80%+
- [ ] Add visual regression tests
- [ ] Add performance tests
- [ ] Add accessibility automated tests
- [ ] Add mutation testing
- [ ] Add contract tests for ZIP format
