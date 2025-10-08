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
export { WheelViewer } from './components/WheelViewer';
export { ResultViewer } from './components/ResultViewer';
export type { RewardRowData, RewardRowType } from './components/ResultViewer';

// Renderer Components (for advanced customization)
export { BackgroundRenderer } from './components/renderers/BackgroundRenderer';
export { HeaderRenderer } from './components/renderers/HeaderRenderer';
export { WheelBgRenderer } from './components/renderers/WheelBgRenderer';
export { WheelTopRenderer } from './components/renderers/WheelTopRenderer';
export { ButtonSpinRenderer } from './components/renderers/ButtonSpinRenderer';
export { CenterRenderer } from './components/renderers/CenterRenderer';
export { SegmentRenderer } from './components/renderers/SegmentRenderer';
export { PointerRenderer } from './components/renderers/PointerRenderer';
export { LightsRenderer } from './components/renderers/LightsRenderer';

// Utility Functions
export {
  colorToCSS,
  formatNumber,
  buildSegmentWedgePath,
  buildSegmentRingPath,
  computeWedgeBounds,
  gradientTransformToString,
  computeTemplateBounds,
  buildGradientMatrix,
  fillToSvgPaint,
  createSvgGradientDef,
  describeArcPath,
  computeArcFontSize,
  createDropShadowFilter,
  SEGMENT_KINDS,
  SEGMENT_PREVIEW_INNER_RADIUS_RATIO,
  TEXT_GRID_RADII_FACTORS,
  MIN_TEXT_FONT_SIZE,
  TEXT_FONT_FAMILY,
} from './utils/segmentUtils';

// Type Definitions
export type {
  // Core types
  WheelExport,
  ExtractedAssets,

  // Component state types
  HeaderState,
  ButtonSpinState,

  // Segment types
  WheelSegmentKind,
  WheelSegmentStyles,
  WheelSegmentTypeStyles,
  WheelSegmentVectorStyle,
  WheelSegmentTextStyle,
  WheelSegmentStrokeStyle,

  // Style types
  Fill,
  Gradient,
  GradientStop,
  GradientVector,
  GradientHandle,
  GradientTransform,
  DropShadow,

  // Component types
  HeaderComponent,
  WheelOverlay,
  ButtonSpinComponent,
  CenterComponent,
  PointerComponent,
  LightsComponent,

  // Rewards types
  RewardsComponent,
  RewardsBackgroundStyle,
  RewardsPrizeTextStyle,
  RewardsPrizeImage,
  RewardsButtonStyle,

  // Bounds types
  ImageBounds,
  WheelElementBounds,

  // App state
  AppState,
} from './types';
