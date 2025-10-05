// Core types for the wheel format

// Component state types
export type HeaderState = 'active' | 'success' | 'fail';
export type ButtonSpinState = 'default' | 'spinning';

// Segment types
export type WheelSegmentKind = 'odd' | 'even' | 'nowin' | 'jackpot';

// Color and gradient types
export interface GradientStop {
  color: string; // Hex color like "#FF0000" or rgba string
  position: number; // 0-1
}

export interface GradientVector {
  x: number; // Normalized vector relative to handleOrigin
  y: number; // Normalized vector relative to handleOrigin
}

export interface GradientHandle {
  x: number; // Normalized position (0-1)
  y: number; // Normalized position (0-1)
}

export type GradientTransform = readonly [
  readonly [number, number, number],
  readonly [number, number, number]
];

export interface Gradient {
  type: 'linear' | 'radial' | 'angular' | 'diamond';
  stops: GradientStop[];
  transform: GradientTransform;
  rotation: number; // Degrees (legacy, use handleVectors instead)
  handleOrigin?: GradientHandle; // Defaults to { x: 0.5, y: 0.5 }
  handleVectors?: readonly GradientVector[]; // Three vectors: p0 (origin), p1 (primary axis), p2 (secondary axis)
  handles?: readonly GradientHandle[]; // Legacy, replaced by handleVectors
}

export interface Fill {
  type: 'solid' | 'gradient';
  color?: string; // Hex color like "#FF0000" or rgba string
  gradient?: Gradient;
}

export interface DropShadow {
  x: number;
  y: number;
  blur: number;
  spread?: number;
  color: string; // Hex color with alpha like "#0586aecc"
}

export interface WheelSegmentStrokeStyle {
  width: number;
  fill: Fill;
}

export interface WheelSegmentTextStyle {
  fill?: Fill;
  stroke?: {
    width: number;
    color: string;
  };
  dropShadows?: DropShadow[];
}

export interface WheelSegmentVectorStyle {
  fill?: Fill;
  stroke?: WheelSegmentStrokeStyle;
}

export interface WheelSegmentTypeStyles {
  outer: WheelSegmentVectorStyle; // Only outer is supported now
  text?: WheelSegmentTextStyle;
}

export type WheelSegmentStyles = Partial<Record<WheelSegmentKind, WheelSegmentTypeStyles>>;

// Base interface for image-based component positioning
export interface ImageBounds {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
}

// Wheel element bounds (center-based positioning)
export interface WheelElementBounds {
  x: number; // center X
  y: number; // center Y
  w: number;
  h: number;
}

// Header component
export interface HeaderComponent {
  stateBounds: {
    active: ImageBounds;
    success: ImageBounds;
    fail: ImageBounds;
  };
  activeImg: string;
  successImg: string;
  failImg: string;
}

// Wheel background overlay
export interface WheelOverlay {
  bounds: WheelElementBounds;
  img: string;
}

// Button spin component with two states
export interface ButtonSpinComponent {
  stateBounds: {
    default: ImageBounds;
    spinning: ImageBounds;
  };
  defaultImg: string;
  spinningImg: string;
}

// Center component (no image, just position data)
export interface CenterComponent {
  x: number;
  y: number;
  radius: number;
}

// Pointer component
export interface PointerComponent {
  bounds: ImageBounds;
  img: string;
}

// Lights component
export interface LightsComponent {
  color: string;
  positions: Array<{
    x: number;
    y: number;
  }>;
}

// Rewards data structures
export interface RewardsBackgroundStyle {
  position?: { x: number; y: number };
  dimensions?: { width: number; height: number };
  borderRadius: number;
  backgroundFill: Fill;
  padding?: { vertical: number; horizontal: number };
  dropShadows?: Array<{
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: string;
  }>;
  stroke?: { width: number; color: string };
}

export interface RewardsPrizeTextStyle {
  label: string;
  fill: Fill;
  stroke?: { width: number; color: string };
  dropShadows?: Array<{
    x: number;
    y: number;
    blur: number;
    color: string;
  }>;
}

export interface RewardsPrizeImage {
  label: string;
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