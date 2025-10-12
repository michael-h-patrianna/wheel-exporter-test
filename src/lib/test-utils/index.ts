/**
 * Test utilities barrel export.
 * Provides type-safe test factories for creating mock wheel component data.
 *
 * @packageDocumentation
 */

export {
  // Primitive factories
  createMockImageBounds,
  createMockWheelElementBounds,
  createMockSolidFill,
  createMockGradientFill,
  // Component factories
  createMockHeader,
  createMockWheelBg,
  createMockWheelTop,
  createMockLights,
  createMockButtonSpin,
  createMockPointer,
  createMockCenter,
  createMockWheelSegmentStyles,
  // Complex data factories
  createMockWheelExport,
  createMockExtractedAssets,
  // Partial component factories (for edge case testing)
  createMockHeaderWithMissingFailState,
  createMockWheelOverlayWithoutBounds,
  createMockLightsWithoutPositions,
  createMockButtonSpinWithMissingSpinningState,
} from './factories';
