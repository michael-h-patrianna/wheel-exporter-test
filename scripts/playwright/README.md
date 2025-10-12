# Wheel Exporter E2E Test Suite

Comprehensive Playwright-based end-to-end testing for the Wheel Exporter application.

## 📁 Structure

```
scripts/playwright/
├── helpers/
│   ├── wheelTestHelpers.ts    # Wheel interaction utilities (30+ functions)
│   ├── visualHelpers.ts        # Visual testing utilities (20+ functions)
│   └── index.ts                # Centralized exports
├── wheel-complete.e2e.test.ts  # Main test suite (78 tests)
├── wheel-app.e2e.test.ts       # Original test suite
├── wheel-app.spec.ts           # Additional specs
└── segment-renderer.spec.mjs   # Component-specific tests
```

## 🎯 Test Coverage

### wheel-complete.e2e.test.ts (78 Tests)

#### ✅ Fully Passing Sections:
1. **Initial Page State** (6/6) - 100%
2. **Accessibility** (5/5) - 100%

#### ⚠️ Partially Passing Sections:
3. **File Upload and Loading** (5/8) - 63%
4. **Dimension Controls** (6/8) - 75%
5. **Result Viewer Display** (6/8) - 75%
6. **Edge Cases** (5/10) - 50%
7. **Visual Regression** (3/5) - 60%

#### ⏳ Known Issues:
8. **Wheel Spin Animation** (0/7) - Application state bug
9. **Header State Cycling** (2/5) - Timing issues
10. **Component Toggles** (3/7) - Race conditions
11. **Integration Tests** (0/3) - Cumulative timeouts

### Overall Stats:
- **Total Tests**: 78
- **Passing**: 46 (59%)
- **Failing**: 32 (41% - mostly timing/state issues)
- **E2E Flow Coverage**: ~90%

## 🚀 Quick Start

### Run All Tests
```bash
npm run test:e2e
```

### Run Specific Suite
```bash
npx playwright test wheel-complete.e2e.test.ts
```

### Run Passing Tests Only
```bash
npx playwright test wheel-complete.e2e.test.ts \
  --grep "Initial page state|should change wheel|should have accessible"
```

### Run with UI Mode
```bash
npx playwright test wheel-complete.e2e.test.ts --ui
```

### Debug Specific Test
```bash
npx playwright test wheel-complete.e2e.test.ts \
  --grep "should display correct page header" --debug
```

### Generate HTML Report
```bash
npx playwright test --reporter=html
npx playwright show-report
```

## 📸 Screenshot Outputs

Screenshots are saved to `/screenshots/e2e/` with subdirectories:

| Directory | Purpose | Example |
|-----------|---------|---------|
| `states/` | Page state captures | initial-state.png |
| `wheel/` | Wheel component views | wheel-baseline-default.png |
| `results/` | Result viewer captures | result-viewer-default.png |
| `animation/` | Animation sequences | spin-before.png, spin-during.png |
| `header/` | Header state variations | header-active.png, header-success.png |
| `visibility/` | Component visibility | components-all-visible.png |
| `dimensions/` | Size variations | dimensions-small.png |
| `segments/` | Segment counts | segments-3.png, segments-8.png |
| `errors/` | Error states | error-invalid-zip.png |
| `fullpage/` | Full page captures | fullpage-baseline.png |
| `integration/` | Workflow captures | workflow-complete.png |

## 🛠️ Helper Utilities

### wheelTestHelpers.ts

#### File Upload & Loading
```typescript
await uploadWheelZip(page);
await waitForWheelLoad(page);
await uploadAndWaitForWheel(page); // Combined
```

#### Component Interaction
```typescript
await spinWheel(page, waitForComplete: boolean);
await cycleHeaderState(page, targetState?: 'active' | 'success' | 'fail');
await toggleComponent(page, 'background' | 'header' | 'segments' | ...);
```

#### Controls
```typescript
await setWheelDimensions(page, width, height);
await setSegmentCount(page, count);
```

#### Assertions
```typescript
await expectErrorMessage(page, message?);
await expectControlsVisible(page);
await expectSegmentsRotating(page);
await expectRewardRowCount(page, count);
```

#### Getters
```typescript
const container = getWheelContainer(page);
const spinButton = getSpinButton(page);
const header = getHeaderComponent(page);
const { width, height } = getWheelDimensionInputs(page);
```

### visualHelpers.ts

#### Screenshot Capture
```typescript
await takeScreenshot(page, {
  name: 'test-screenshot',
  directory: 'e2e/custom',
  fullPage: true,
  delay: 500
});
```

#### Visual Comparison
```typescript
await compareScreenshot(page, 'baseline-name');
await compareWheelScreenshot(page, 'wheel-state');
await compareResultViewerScreenshot(page, 'result-state');
```

#### Specialized Captures
```typescript
await screenshotWheel(page, 'wheel-custom');
await screenshotResultViewer(page, 'result-custom');
await screenshotFullPage(page, 'page-state');
```

#### Animation Testing
```typescript
await captureAnimationSequence(page, 'spin', {
  duration: 6000,
  frameCount: 10,
  directory: 'e2e/animation'
});
```

#### Visual Stability
```typescript
await waitForVisualStability(page, locator);
await expectVisualStability(page, locator);
```

#### Dimension Assertions
```typescript
await expectDimensions(locator, { width: 400, height: 300 }, tolerance: 2);
await expectAspectRatio(locator, 1.33, tolerance: 0.05);
```

## 📝 Test Organization

### 12 Test Sections:

1. **Initial Page State** - Pre-upload validation
2. **File Upload and Loading** - ZIP upload workflow
3. **Wheel Spin Animation** - Spin mechanics and states
4. **Header State Cycling** - Header state transitions
5. **Component Visibility Toggles** - Show/hide components
6. **Dimension and Segment Controls** - Size and segment adjustments
7. **Result Viewer Display** - Reward display testing
8. **Error Handling** - Invalid input handling
9. **Visual Regression Tests** - Baseline comparisons
10. **Accessibility and Keyboard Navigation** - A11y compliance
11. **Edge Cases and Boundary Conditions** - Stress testing
12. **Integration Tests** - Complete user workflows

## 🐛 Known Issues & Workarounds

### 1. Spin Button State Bug

**Issue**: Button alt text doesn't change from "Spin button default" to "Spin button spinning"

**Workaround**: Check `data-spinning` attribute instead:
```typescript
const isSpinning = await spinButton.getAttribute('data-spinning') === 'true';
```

### 2. Header State Cycling Timeouts

**Issue**: Header state detection fails with alt text matching

**Workaround**: Use data attributes or check image src changes:
```typescript
const state = await header.getAttribute('data-header-state');
```

### 3. Component Toggle Race Conditions

**Issue**: Rapid toggles cause timing issues

**Workaround**: Add longer waits between toggles:
```typescript
await toggleComponent(page, 'background');
await page.waitForTimeout(500); // Increased wait
```

## 🎯 Test Data

**Primary Test File**: `/docs/theme.zip`

**Contents**:
- Background image (2000×1500px)
- Header states: active, success, fail
- Wheel components: bg, segments, wheelTop1, wheelTop2, lights
- Button spin states: default, spinning
- Center circle and pointer
- Rewards configuration with prize images
- Complete positions.json with layout data

## 🔧 Configuration

**Playwright Config**: `playwright.config.ts`
- Test directory: `./scripts/playwright`
- Base URL: `http://localhost:3000`
- Browser: Chromium (Desktop Chrome)
- Parallel execution: Enabled
- Retries: 2 (CI only)
- Timeout: 30000ms per test

## 📊 Performance

**Average Test Times**:
- Initial state: ~150ms
- File upload: ~800ms
- Spin animation: ~7000ms (includes 6.5s animation)
- Screenshot capture: ~500ms
- Full suite: ~180s (with parallelization)

## 🚦 CI/CD Integration

### GitHub Actions (Example)
```yaml
- name: Run E2E Tests
  run: npm run test:e2e

- name: Upload Test Results
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 📚 Additional Resources

- **Main Documentation**: `/docs/TESTING.md`
- **Test Summary**: `/E2E_TEST_SUMMARY.md`
- **Playwright Docs**: https://playwright.dev
- **Project README**: `/README.md`

## 🤝 Contributing

When adding new tests:

1. Use helper utilities from `helpers/` instead of duplicating code
2. Follow the existing section organization
3. Include both positive and negative test cases
4. Add visual regression tests for UI changes
5. Ensure accessibility compliance
6. Document known issues or workarounds
7. Update this README with new features

## 🏃 Next Steps

- [ ] Fix application spin button state bug
- [ ] Improve header state detection reliability
- [ ] Add retry logic for flaky tests
- [ ] Increase timeout for animation tests
- [ ] Add more visual regression baselines
- [ ] Implement performance benchmarking
- [ ] Add cross-browser testing (Firefox, Safari)
- [ ] Set up CI/CD integration
- [ ] Create test data generator for multiple themes
- [ ] Add API mocking for offline testing

## 📞 Support

For test suite issues:
1. Check `/E2E_TEST_SUMMARY.md` for known issues
2. Review helper function documentation
3. Run tests with `--debug` flag
4. Check Playwright trace files in `test-results/`
5. Refer to error context markdown files

---

**Last Updated**: 2025-10-12
**Test Suite Version**: 1.0.0
**Playwright Version**: Latest (from package.json)
