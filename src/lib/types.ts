/**
 * Core type definitions for the Wheel of Fortune component library.
 * These types define the structure of wheel data exported from the Figma plugin.
 *
 * @packageDocumentation
 */

// ============================================================================
// Component State Types
// ============================================================================

/**
 * Visual states for the header component.
 * Controls which header image is displayed to provide visual feedback.
 *
 * @example
 * ```tsx
 * const [headerState, setHeaderState] = useState<HeaderState>('active');
 * // Cycle through states: 'active' → 'success' → 'fail'
 * ```
 */
export type HeaderState = 'active' | 'success' | 'fail';

/**
 * Visual states for the spin button component.
 * Indicates whether the wheel is currently spinning.
 *
 * @example
 * ```tsx
 * const [buttonState, setButtonState] = useState<ButtonSpinState>('default');
 * // During spin: setButtonState('spinning');
 * ```
 */
export type ButtonSpinState = 'default' | 'spinning';

// ============================================================================
// Segment Types
// ============================================================================

/**
 * Segment type identifiers that define the appearance and behavior of wheel segments.
 *
 * Segment order in wheel (8 total):
 * - jackpot: Special prize segment (1 per wheel)
 * - nowin: Loss segment (1 per wheel)
 * - odd: Alternating segments (3 per wheel)
 * - even: Alternating segments (3 per wheel)
 *
 * @example
 * ```tsx
 * const segmentKinds: WheelSegmentKind[] = ['jackpot', 'nowin', 'odd', 'even', 'odd', 'even', 'odd', 'even'];
 * ```
 */
export type WheelSegmentKind = 'odd' | 'even' | 'nowin' | 'jackpot';

// ============================================================================
// Color and Gradient Types
// ============================================================================

/**
 * A single color stop in a gradient definition.
 * Defines the color at a specific position along the gradient.
 *
 * @example
 * ```tsx
 * const stop: GradientStop = {
 *   color: '#FF0000',  // Red
 *   position: 0.5      // At 50% of gradient
 * };
 * ```
 */
export interface GradientStop {
  /** Hex color (e.g., "#FF0000") or rgba string (e.g., "rgba(255, 0, 0, 1)") */
  color: string;
  /** Position along the gradient from 0 (start) to 1 (end) */
  position: number;
}

/**
 * A vector used in gradient handle-based positioning.
 * Normalized relative to the handleOrigin.
 *
 * @internal This is primarily used for advanced gradient reconstructions.
 */
export interface GradientVector {
  /** Normalized X component relative to handleOrigin */
  x: number;
  /** Normalized Y component relative to handleOrigin */
  y: number;
}

/**
 * A handle position for gradient control in normalized coordinates.
 *
 * @internal Used for advanced gradient positioning with handle-based systems.
 */
export interface GradientHandle {
  /** Normalized X position (0-1) within the bounding box */
  x: number;
  /** Normalized Y position (0-1) within the bounding box */
  y: number;
}

/**
 * Affine transformation matrix for gradients.
 * Format: [[a, c, e], [b, d, f]] representing the 2D affine transform.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform
 */
export type GradientTransform = readonly [
  readonly [number, number, number],
  readonly [number, number, number]
];

/**
 * Gradient fill definition supporting multiple gradient types.
 * Currently, only linear gradients are fully supported for cross-platform compatibility.
 *
 * **Note**: Radial, angular, and diamond gradients are not supported in React Native.
 * The library primarily uses the `rotation` property for linear gradients.
 *
 * @example
 * ```tsx
 * const linearGradient: Gradient = {
 *   type: 'linear',
 *   rotation: 45,  // 45-degree angle
 *   stops: [
 *     { color: '#FF0000', position: 0 },
 *     { color: '#0000FF', position: 1 }
 *   ],
 *   transform: [[1, 0, 0], [0, 1, 0]]
 * };
 * ```
 */
export interface Gradient {
  /** Gradient type (only 'linear' is fully supported for cross-platform compatibility) */
  type: 'linear' | 'radial' | 'angular' | 'diamond';
  /** Array of color stops defining the gradient */
  stops: GradientStop[];
  /** Affine transformation matrix for the gradient */
  transform: GradientTransform;
  /** Rotation angle in degrees (primary method for linear gradients) */
  rotation: number;
  /** Origin handle for gradient positioning (defaults to center: {x: 0.5, y: 0.5}) */
  handleOrigin?: GradientHandle;
  /** Three vectors defining gradient handles: p0 (origin), p1 (primary axis), p2 (secondary axis) */
  handleVectors?: readonly GradientVector[];
  /** @deprecated Legacy gradient handles, replaced by handleVectors */
  handles?: readonly GradientHandle[];
}

/**
 * Fill definition supporting solid colors and gradients.
 * Used throughout the library for coloring segments, text, backgrounds, etc.
 *
 * @example
 * ```tsx
 * // Solid fill
 * const solidFill: Fill = {
 *   type: 'solid',
 *   color: '#FF0000'
 * };
 *
 * // Gradient fill
 * const gradientFill: Fill = {
 *   type: 'gradient',
 *   gradient: {
 *     type: 'linear',
 *     rotation: 90,
 *     stops: [
 *       { color: '#FF0000', position: 0 },
 *       { color: '#0000FF', position: 1 }
 *     ],
 *     transform: [[1, 0, 0], [0, 1, 0]]
 *   }
 * };
 * ```
 */
export interface Fill {
  /** Fill type: solid color or gradient */
  type: 'solid' | 'gradient';
  /** Hex color (e.g., "#FF0000") or rgba string (required if type is 'solid') */
  color?: string;
  /** Gradient definition (required if type is 'gradient') */
  gradient?: Gradient;
}

/**
 * Drop shadow effect definition.
 * Can be applied to text, segments, buttons, and other visual elements.
 *
 * **Note**: Text shadows do not support the `spread` property.
 *
 * @example
 * ```tsx
 * const shadow: DropShadow = {
 *   x: 2,
 *   y: 2,
 *   blur: 4,
 *   spread: 1,
 *   color: '#00000080'  // Black with 50% opacity
 * };
 * ```
 */
export interface DropShadow {
  /** Horizontal offset in pixels */
  x: number;
  /** Vertical offset in pixels */
  y: number;
  /** Blur radius in pixels */
  blur: number;
  /** Spread radius in pixels (not supported for text shadows) */
  spread?: number;
  /** Shadow color as hex with alpha (e.g., "#0586aecc") */
  color: string;
}

// ============================================================================
// Wheel Segment Style Types
// ============================================================================

/**
 * Stroke style for segment borders.
 * Defines the width and color/gradient of segment outlines.
 *
 * @example
 * ```tsx
 * const stroke: WheelSegmentStrokeStyle = {
 *   width: 2,
 *   fill: { type: 'solid', color: '#FFFFFF' }
 * };
 * ```
 */
export interface WheelSegmentStrokeStyle {
  /** Stroke width in pixels */
  width: number;
  /** Stroke color (solid or gradient) */
  fill: Fill;
}

/**
 * Text styling for segment labels.
 * Defines fill, stroke, and shadow effects for text rendered on wheel segments.
 *
 * @example
 * ```tsx
 * // With stroke gradient
 * const textStyle: WheelSegmentTextStyle = {
 *   fill: { type: 'solid', color: '#FFFFFF' },
 *   stroke: {
 *     width: 4,
 *     fill: {
 *       type: 'gradient',
 *       gradient: {
 *         type: 'linear',
 *         rotation: 90,
 *         stops: [
 *           { color: '#3a125d', position: 0 },
 *           { color: '#7a26c3', position: 1 }
 *         ]
 *       }
 *     }
 *   },
 *   dropShadows: [{ x: 2, y: 2, blur: 4, color: '#00000080' }]
 * };
 *
 * // Backward compatible with color string
 * const legacyTextStyle: WheelSegmentTextStyle = {
 *   fill: { type: 'solid', color: '#FFFFFF' },
 *   stroke: { width: 1, color: '#000000' }
 * };
 * ```
 */
export interface WheelSegmentTextStyle {
  /** Text fill color or gradient */
  fill?: Fill;
  /** Text stroke/outline properties */
  stroke?: {
    /** Stroke width in pixels */
    width: number;
    /** Stroke color (legacy: string) or fill (solid/gradient) */
    color?: string;
    /** Stroke fill (solid or gradient) - preferred over color */
    fill?: Fill;
  };
  /** Array of drop shadow effects for text */
  dropShadows?: DropShadow[];
}

/**
 * Vector/shape styling for segment shapes.
 * Defines fill and stroke for the segment's visual appearance.
 *
 * @example
 * ```tsx
 * const vectorStyle: WheelSegmentVectorStyle = {
 *   fill: {
 *     type: 'gradient',
 *     gradient: {
 *       type: 'linear',
 *       rotation: 45,
 *       stops: [
 *         { color: '#FF0000', position: 0 },
 *         { color: '#00FF00', position: 1 }
 *       ],
 *       transform: [[1, 0, 0], [0, 1, 0]]
 *     }
 *   },
 *   stroke: { width: 2, fill: { type: 'solid', color: '#FFFFFF' } }
 * };
 * ```
 */
export interface WheelSegmentVectorStyle {
  /** Shape fill color or gradient */
  fill?: Fill;
  /** Shape stroke/border properties */
  stroke?: WheelSegmentStrokeStyle;
}

/**
 * Complete style definition for a segment type.
 * Combines shape and text styling.
 *
 * **Note**: Currently only the outer (wedge) shape is supported.
 * Inner ring rendering is not implemented.
 *
 * @example
 * ```tsx
 * const segmentType: WheelSegmentTypeStyles = {
 *   outer: {
 *     fill: { type: 'solid', color: '#FF0000' },
 *     stroke: { width: 1, fill: { type: 'solid', color: '#FFFFFF' } }
 *   },
 *   text: {
 *     fill: { type: 'solid', color: '#FFFFFF' }
 *   }
 * };
 * ```
 */
export interface WheelSegmentTypeStyles {
  /** Outer wedge shape styling (currently the only supported layer) */
  outer: WheelSegmentVectorStyle;
  /** Text styling for segment labels */
  text?: WheelSegmentTextStyle;
}

/**
 * Style definitions for all segment types in the wheel.
 * Maps each WheelSegmentKind to its visual styling.
 *
 * @example
 * ```tsx
 * const segmentStyles: WheelSegmentStyles = {
 *   jackpot: {
 *     outer: { fill: { type: 'solid', color: '#FFD700' } },
 *     text: { fill: { type: 'solid', color: '#000000' } }
 *   },
 *   odd: {
 *     outer: { fill: { type: 'solid', color: '#FF0000' } }
 *   },
 *   even: {
 *     outer: { fill: { type: 'solid', color: '#0000FF' } }
 *   }
 * };
 * ```
 */
export type WheelSegmentStyles = Partial<Record<WheelSegmentKind, WheelSegmentTypeStyles>>;

// ============================================================================
// Positioning and Bounds Types
// ============================================================================

/**
 * Bounding box for image-based components.
 * Uses center-based positioning with optional rotation.
 *
 * **Important**: x and y represent the CENTER of the element, not top-left.
 *
 * @example
 * ```tsx
 * const bounds: ImageBounds = {
 *   x: 400,      // Center X
 *   y: 300,      // Center Y
 *   w: 200,      // Width
 *   h: 100,      // Height
 *   rotation: 45 // Optional rotation in degrees
 * };
 * ```
 */
export interface ImageBounds {
  /** Center X coordinate */
  x: number;
  /** Center Y coordinate */
  y: number;
  /** Width in pixels */
  w: number;
  /** Height in pixels */
  h: number;
  /** Rotation angle in degrees (optional) */
  rotation?: number;
}

/**
 * Bounding box for wheel elements.
 * Similar to ImageBounds but specifically for wheel-related components.
 *
 * **Important**: x and y represent the CENTER of the element, not top-left.
 *
 * @example
 * ```tsx
 * const bounds: WheelElementBounds = {
 *   x: 400,  // Center X
 *   y: 300,  // Center Y
 *   w: 500,  // Width
 *   h: 500   // Height
 * };
 * ```
 */
export interface WheelElementBounds {
  /** Center X coordinate */
  x: number;
  /** Center Y coordinate */
  y: number;
  /** Width in pixels */
  w: number;
  /** Height in pixels */
  h: number;
}

// ============================================================================
// Wheel Component Types
// ============================================================================

/**
 * Header component with state-based visuals.
 * Displays different images based on game state (active, success, fail).
 *
 * @example
 * ```tsx
 * const header: HeaderComponent = {
 *   stateBounds: {
 *     active: { x: 400, y: 100, w: 300, h: 80 },
 *     success: { x: 400, y: 100, w: 300, h: 80 },
 *     fail: { x: 400, y: 100, w: 300, h: 80 }
 *   },
 *   activeImg: 'header-active.png',
 *   successImg: 'header-success.png',
 *   failImg: 'header-fail.png'
 * };
 * ```
 */
export interface HeaderComponent {
  /** Position and size bounds for each visual state */
  stateBounds: {
    /** Bounds for active/default state */
    active: ImageBounds;
    /** Bounds for success/win state */
    success: ImageBounds;
    /** Bounds for fail/loss state */
    fail: ImageBounds;
  };
  /** Filename for active state image */
  activeImg: string;
  /** Filename for success state image */
  successImg: string;
  /** Filename for fail state image */
  failImg: string;
}

/**
 * Wheel overlay component (background or top layers).
 * Provides additional visual layers over or under the spinning wheel segments.
 *
 * Used for:
 * - wheelBg: Background layer behind segments
 * - wheelTop1: First overlay layer above segments
 * - wheelTop2: Second overlay layer above segments
 *
 * @example
 * ```tsx
 * const wheelBg: WheelOverlay = {
 *   bounds: { x: 400, y: 300, w: 500, h: 500 },
 *   img: 'wheel-background.png'
 * };
 * ```
 */
export interface WheelOverlay {
  /** Position and size of the overlay */
  bounds: WheelElementBounds;
  /** Filename for overlay image */
  img: string;
}

/**
 * Spin button component with state-based visuals.
 * Displays different images for default and spinning states.
 *
 * @example
 * ```tsx
 * const buttonSpin: ButtonSpinComponent = {
 *   stateBounds: {
 *     default: { x: 400, y: 450, w: 120, h: 120 },
 *     spinning: { x: 400, y: 450, w: 120, h: 120 }
 *   },
 *   defaultImg: 'button-default.png',
 *   spinningImg: 'button-spinning.png'
 * };
 * ```
 */
export interface ButtonSpinComponent {
  /** Position and size bounds for each button state */
  stateBounds: {
    /** Bounds for default/idle state */
    default: ImageBounds;
    /** Bounds for spinning/active state */
    spinning: ImageBounds;
  };
  /** Filename for default state image */
  defaultImg: string;
  /** Filename for spinning state image */
  spinningImg: string;
}

/**
 * Center component defining the wheel's rotation axis.
 * No image is rendered; this provides positioning data for the wheel's center point.
 *
 * @example
 * ```tsx
 * const center: CenterComponent = {
 *   x: 400,      // Center X
 *   y: 300,      // Center Y
 *   radius: 250  // Outer radius of wheel
 * };
 * ```
 */
export interface CenterComponent {
  /** Center X coordinate */
  x: number;
  /** Center Y coordinate */
  y: number;
  /** Outer radius of the wheel in pixels */
  radius: number;
}

/**
 * Pointer component indicating the winning segment.
 * Typically positioned at the top of the wheel pointing to the selected segment.
 *
 * @example
 * ```tsx
 * const pointer: PointerComponent = {
 *   bounds: { x: 400, y: 50, w: 60, h: 80, rotation: 0 },
 *   img: 'pointer.png'
 * };
 * ```
 */
export interface PointerComponent {
  /** Position and size of the pointer */
  bounds: ImageBounds;
  /** Filename for pointer image */
  img: string;
}

/**
 * Lights component for decorative light elements.
 * Renders small circular lights at specified positions around the wheel.
 *
 * @example
 * ```tsx
 * const lights: LightsComponent = {
 *   color: '#FFD700',
 *   positions: [
 *     { x: 200, y: 100 },
 *     { x: 300, y: 100 },
 *     { x: 400, y: 100 }
 *   ]
 * };
 * ```
 */
export interface LightsComponent {
  /** Color of the light elements (hex or rgba) */
  color: string;
  /** Array of light positions */
  positions: Array<{
    /** X coordinate of light */
    x: number;
    /** Y coordinate of light */
    y: number;
  }>;
}

// ============================================================================
// Rewards Component Types
// ============================================================================

/**
 * Background style for reward display containers.
 * Defines the visual appearance of reward boxes (highlighted vs default).
 *
 * **Important**: If backgrounds appear transparent, check that backgroundFill
 * is not set to transparent (#00000000) in the Figma export.
 *
 * @example
 * ```tsx
 * const bgStyle: RewardsBackgroundStyle = {
 *   borderRadius: 12,
 *   backgroundFill: {
 *     type: 'gradient',
 *     gradient: {
 *       type: 'linear',
 *       rotation: 90,
 *       stops: [
 *         { color: '#FFD700', position: 0 },
 *         { color: '#FFA500', position: 1 }
 *       ],
 *       transform: [[1, 0, 0], [0, 1, 0]]
 *     }
 *   },
 *   padding: { vertical: 16, horizontal: 24 },
 *   stroke: { width: 2, color: '#FFFFFF' },
 *   dropShadows: [{ x: 0, y: 4, blur: 8, spread: 0, color: '#00000040' }]
 * };
 * ```
 */
export interface RewardsBackgroundStyle {
  /** Optional position override */
  position?: { x: number; y: number };
  /** Optional size constraints */
  dimensions?: { width: number; height: number };
  /** Corner radius in pixels */
  borderRadius: number;
  /** Background fill (solid or gradient) */
  backgroundFill: Fill;
  /** Internal padding */
  padding?: { vertical: number; horizontal: number };
  /** Drop shadow effects */
  dropShadows?: Array<{
    /** Horizontal offset in pixels */
    x: number;
    /** Vertical offset in pixels */
    y: number;
    /** Blur radius in pixels */
    blur: number;
    /** Spread radius in pixels */
    spread: number;
    /** Shadow color (hex with alpha) */
    color: string;
  }>;
  /** Border stroke properties */
  stroke?: { width: number; color: string };
}

/**
 * Text style for prize labels and values.
 * Used for displaying prize amounts, labels, and other reward text.
 *
 * @example
 * ```tsx
 * const textStyle: RewardsPrizeTextStyle = {
 *   label: 'GC Value',
 *   fill: {
 *     type: 'gradient',
 *     gradient: {
 *       type: 'linear',
 *       rotation: 180,
 *       stops: [
 *         { color: '#FFD700', position: 0 },
 *         { color: '#FFA500', position: 1 }
 *       ],
 *       transform: [[1, 0, 0], [0, 1, 0]]
 *     }
 *   },
 *   stroke: { width: 1, color: '#000000' },
 *   dropShadows: [{ x: 2, y: 2, blur: 4, color: '#00000080' }]
 * };
 * ```
 */
export interface RewardsPrizeTextStyle {
  /** Descriptive label for this text style */
  label: string;
  /** Text fill (solid or gradient) */
  fill: Fill;
  /** Text stroke/outline */
  stroke?: { width: number; color: string };
  /** Text shadow effects (no spread for text) */
  dropShadows?: Array<{
    /** Horizontal offset in pixels */
    x: number;
    /** Vertical offset in pixels */
    y: number;
    /** Blur radius in pixels */
    blur: number;
    /** Shadow color (hex with alpha) */
    color: string;
  }>;
}

/**
 * Prize image reference for icon assets.
 * Links prize types to their corresponding image files.
 *
 * @example
 * ```tsx
 * const prizeImage: RewardsPrizeImage = {
 *   label: 'Gold Coins',
 *   img: 'gc-icon.png'
 * };
 * ```
 */
export interface RewardsPrizeImage {
  /** Descriptive label for this image */
  label: string;
  /** Filename for prize icon image */
  img: string;
}

export interface RewardsButtonStyle {
  frame: {
    borderRadius: number;
    backgroundFill: Fill;
    dimensions?: { width: number; height: number };
    padding: { vertical: number; horizontal: number };
    dropShadows?: Array<{
      x: number;
      y: number;
      blur: number;
      spread: number;
      color: string;
    }>;
    stroke?: { width: number; color: string };
  };
  text: {
    fontSize: number;
    color: string;
    fontWeight: number;
    lineHeightPx?: number;
  };
}

export interface RewardsComponent {
  backgrounds?: {
    highlight?: RewardsBackgroundStyle;
    default?: RewardsBackgroundStyle;
  };
  button?: {
    stateStyles?: {
      default?: RewardsButtonStyle;
      disabled?: RewardsButtonStyle;
      hover?: RewardsButtonStyle;
      active?: RewardsButtonStyle;
    };
  };
  prizes?: {
    texts?: {
      gcTitle?: RewardsPrizeTextStyle;
      gcValue?: RewardsPrizeTextStyle;
      scTitle?: RewardsPrizeTextStyle;
      scValue?: RewardsPrizeTextStyle;
      plus?: RewardsPrizeTextStyle;
      freeSpins?: RewardsPrizeTextStyle;
      freeSpinsValue?: RewardsPrizeTextStyle;
      freeSpinsLabel?: RewardsPrizeTextStyle;
      [key: string]: RewardsPrizeTextStyle | undefined;
    };
    images?: {
      gc?: RewardsPrizeImage;
      sc?: RewardsPrizeImage;
      purchase?: RewardsPrizeImage;
      [key: string]: RewardsPrizeImage | undefined;
    };
  };
}

// Main wheel export format
export interface WheelExport {
  wheelId: string;
  frameSize: {
    width: number;
    height: number;
  };
  background: {
    exportUrl: string;
  };
  header?: HeaderComponent;
  wheelBg?: WheelOverlay;
  wheelTop1?: WheelOverlay;
  wheelTop2?: WheelOverlay;
  buttonSpin?: ButtonSpinComponent;
  center?: CenterComponent;
  pointer?: PointerComponent;
  lights?: LightsComponent;
  segments?: WheelSegmentStyles;
  rewards?: RewardsComponent;
  exportedAt: string;
  metadata: {
    exportFormat?: string;
    version: string;
  };
}

// Application state management
export interface AppState {
  headerState: HeaderState;
  isAnimating: boolean;
}

// Extracted assets from ZIP
export interface ExtractedAssets {
  wheelData: WheelExport;
  backgroundImage?: string;
  headerImages?: {
    active?: string;
    success?: string;
    fail?: string;
  };
  wheelBgImage?: string;
  wheelTop1Image?: string;
  wheelTop2Image?: string;
  buttonSpinImages?: {
    default?: string;
    spinning?: string;
  };
  pointerImage?: string;
  rewardsPrizeImages?: {
    gc?: string;
    sc?: string;
    purchase?: string;
    [key: string]: string | undefined;
  };
}