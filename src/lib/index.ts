/**
 * Wheel of Fortune Component Library
 *
 * Production-ready components for rendering themed wheel of fortune games
 * and result views. These components are designed to work with themes
 * exported from the Figma Wheel Plugin.
 *
 * @packageDocumentation
 */

// Main Components
export { ErrorBoundary } from './components/ErrorBoundary';
export { ResultViewer } from './components/ResultViewer';
export type { ResultViewMode, RewardRowData, RewardRowType } from './components/ResultViewer';
export { WheelViewer } from './components/WheelViewer';

// Renderer Components (for advanced customization)
export { BackgroundRenderer } from './components/renderers/BackgroundRenderer';
export { ButtonRenderer } from './components/renderers/ButtonRenderer';
export type { ButtonState } from './components/renderers/ButtonRenderer';
export { ButtonSpinRenderer } from './components/renderers/ButtonSpinRenderer';
export { CenterRenderer } from './components/renderers/CenterRenderer';
export { HeaderRenderer } from './components/renderers/HeaderRenderer';
export { LightsRenderer } from './components/renderers/LightsRenderer';
export { PointerRenderer } from './components/renderers/PointerRenderer';
export { SegmentRenderer } from './components/renderers/SegmentRenderer';
export { WheelBgRenderer } from './components/renderers/WheelBgRenderer';
export { WheelTopRenderer } from './components/renderers/WheelTopRenderer';

// Utility Functions
export {
  MIN_TEXT_FONT_SIZE,
  SEGMENT_KINDS,
  SEGMENT_PREVIEW_INNER_RADIUS_RATIO,
  TEXT_FONT_FAMILY,
  TEXT_GRID_RADII_FACTORS,
  buildGradientMatrix,
  buildSegmentRingPath,
  buildSegmentWedgePath,
  colorToCSS,
  computeArcFontSize,
  computeTemplateBounds,
  computeWedgeBounds,
  createDropShadowFilter,
  createSvgGradientDef,
  describeArcPath,
  fillToSvgPaint,
  formatNumber,
  gradientTransformToString,
} from './utils/segmentUtils';

// Type Definitions
export type {
  // App state
  AppState,
  ButtonSpinComponent,
  ButtonSpinState,
  CenterComponent,
  DropShadow,
  ExtractedAssets,
  // Style types
  Fill,
  Gradient,
  GradientHandle,
  GradientStop,
  GradientTransform,
  GradientVector,
  // Component types
  HeaderComponent,
  // Component state types
  HeaderState,
  // Bounds types
  ImageBounds,
  LightsComponent,
  PointerComponent,
  RewardsBackgroundStyle,
  RewardsButtonStyle,
  // Rewards types
  RewardsComponent,
  RewardsPrizeImage,
  RewardsPrizeTextStyle,
  WheelElementBounds,
  // Core types
  WheelExport,
  WheelOverlay,
  // Segment types
  WheelSegmentKind,
  WheelSegmentStrokeStyle,
  WheelSegmentStyles,
  WheelSegmentTextStyle,
  WheelSegmentTypeStyles,
  WheelSegmentVectorStyle,
} from './types';
