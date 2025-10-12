/**
 * Design Tokens for Wheel Component Library
 *
 * These tokens are designed to be cross-platform compatible with both
 * React (web) and React Native implementations.
 *
 * IMPORTANT: All values avoid React Native incompatible features:
 * - No box-shadow (use borders for elevation instead)
 * - No radial/conic gradients (linear only)
 * - No blur effects or CSS filters
 * - Simple color values that work across platforms
 *
 * @example
 * ```typescript
 * import { spacing, borderRadius, colors } from '@/lib/theme';
 *
 * const styles = {
 *   padding: spacing.md,
 *   borderRadius: borderRadius.lg,
 *   backgroundColor: colors.surface.primary,
 * };
 * ```
 */

/**
 * Spacing scale following 8px baseline grid
 * Use these for padding, margin, gaps, and other spacing needs
 */
export const spacing = {
  /** 4px - Minimum touch target padding, tight spacing */
  xs: 4,
  /** 8px - Standard compact spacing */
  sm: 8,
  /** 16px - Default spacing for most UI elements */
  md: 16,
  /** 24px - Generous spacing for sections */
  lg: 24,
  /** 32px - Large spacing for major sections */
  xl: 32,
  /** 48px - Extra large spacing for page-level separation */
  xxl: 48,
} as const;

/**
 * Border radius scale for rounded corners
 * Consistent rounding throughout the UI
 */
export const borderRadius = {
  /** 4px - Subtle rounding for small elements */
  sm: 4,
  /** 8px - Standard rounding for buttons, cards */
  md: 8,
  /** 12px - Pronounced rounding for prominent elements */
  lg: 12,
  /** 16px - Extra rounded for special emphasis */
  xl: 16,
  /** 9999px - Fully rounded (pills, circular elements) */
  full: 9999,
} as const;

/**
 * Color palette
 * All colors are simple hex/rgb values compatible with both web and React Native
 *
 * NOTE: For gradients, only linear gradients are supported cross-platform.
 * Radial and conic gradients are web-only and should be avoided.
 */
export const colors = {
  /** Surface colors for backgrounds and containers */
  surface: {
    /** Primary background color */
    primary: '#FFFFFF',
    /** Secondary background color for contrast */
    secondary: '#F5F5F5',
    /** Tertiary background for subtle depth */
    tertiary: '#E0E0E0',
    /** Dark surface for dark mode */
    dark: '#1A1A1A',
  },

  /** Text colors for readability */
  text: {
    /** Primary text color - highest contrast */
    primary: '#000000',
    /** Secondary text color - medium contrast */
    secondary: '#666666',
    /** Tertiary text color - low contrast */
    tertiary: '#999999',
    /** Inverse text for dark backgrounds */
    inverse: '#FFFFFF',
  },

  /** Border colors for dividers and outlines */
  border: {
    /** Light border for subtle separation */
    light: '#E0E0E0',
    /** Medium border for standard separation */
    medium: '#CCCCCC',
    /** Dark border for emphasis */
    dark: '#999999',
  },

  /** Semantic colors for status and feedback */
  semantic: {
    /** Success state */
    success: '#4CAF50',
    /** Warning state */
    warning: '#FF9800',
    /** Error state */
    error: '#F44336',
    /** Info state */
    info: '#2196F3',
  },

  /** Brand/accent colors for interactive elements */
  accent: {
    /** Primary accent color */
    primary: '#6200EE',
    /** Secondary accent color */
    secondary: '#03DAC6',
  },

  /** Transparent overlays */
  overlay: {
    /** Light overlay (10% black) */
    light: 'rgba(0, 0, 0, 0.1)',
    /** Medium overlay (30% black) */
    medium: 'rgba(0, 0, 0, 0.3)',
    /** Dark overlay (50% black) */
    dark: 'rgba(0, 0, 0, 0.5)',
    /** Heavy overlay (70% black) */
    heavy: 'rgba(0, 0, 0, 0.7)',
  },
} as const;

/**
 * Border widths for consistent stroke thickness
 */
export const borderWidth = {
  /** 1px - Hair line border */
  thin: 1,
  /** 2px - Standard border */
  medium: 2,
  /** 4px - Thick border for emphasis */
  thick: 4,
} as const;

/**
 * Elevation system using borders instead of shadows
 *
 * CRITICAL: React Native does not support box-shadow consistently.
 * Instead, we use border-based elevation with subtle color shifts.
 *
 * For web, you can optionally add box-shadow via platform-specific styling,
 * but these tokens provide the cross-platform baseline.
 *
 * @example
 * ```typescript
 * // Cross-platform elevation (border-based)
 * const styles = {
 *   borderWidth: elevation.low.borderWidth,
 *   borderColor: elevation.low.borderColor,
 * };
 * ```
 */
export const elevation = {
  /** No elevation - flush with surface */
  none: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  /** Low elevation - subtle lift */
  low: {
    borderWidth: borderWidth.thin,
    borderColor: colors.border.light,
  },
  /** Medium elevation - standard lift */
  medium: {
    borderWidth: borderWidth.medium,
    borderColor: colors.border.medium,
  },
  /** High elevation - prominent lift */
  high: {
    borderWidth: borderWidth.thick,
    borderColor: colors.border.dark,
  },
} as const;

/**
 * Typography scale
 * Font sizes and line heights for text hierarchy
 */
export const typography = {
  /** Extra small text (10px/14px) */
  xs: {
    fontSize: 10,
    lineHeight: 14,
  },
  /** Small text (12px/16px) */
  sm: {
    fontSize: 12,
    lineHeight: 16,
  },
  /** Base text (14px/20px) */
  base: {
    fontSize: 14,
    lineHeight: 20,
  },
  /** Medium text (16px/24px) */
  md: {
    fontSize: 16,
    lineHeight: 24,
  },
  /** Large text (18px/28px) */
  lg: {
    fontSize: 18,
    lineHeight: 28,
  },
  /** Extra large text (24px/32px) */
  xl: {
    fontSize: 24,
    lineHeight: 32,
  },
  /** 2x large text (32px/40px) */
  xxl: {
    fontSize: 32,
    lineHeight: 40,
  },
} as const;

/**
 * Z-index scale for layering
 * Prevents z-index conflicts with predefined levels
 */
export const zIndex = {
  /** Background elements */
  background: -1,
  /** Default/base layer */
  base: 0,
  /** Slightly elevated content */
  raised: 10,
  /** Overlays and dropdowns */
  overlay: 100,
  /** Modals and dialogs */
  modal: 1000,
  /** Toasts and notifications */
  notification: 2000,
  /** Tooltips */
  tooltip: 3000,
} as const;

/**
 * Animation duration scale (in milliseconds)
 * Consistent timing for transitions and animations
 */
export const duration = {
  /** 100ms - Instant feedback */
  instant: 100,
  /** 200ms - Fast transitions */
  fast: 200,
  /** 300ms - Standard transitions */
  normal: 300,
  /** 500ms - Slow, emphasized transitions */
  slow: 500,
  /** 1000ms - Very slow, dramatic transitions */
  verySlow: 1000,
} as const;

/**
 * Animation easing functions
 * Use these for smooth, natural motion
 */
export const easing = {
  /** Linear - constant speed */
  linear: 'linear',
  /** Ease - standard easing */
  ease: 'ease',
  /** Ease In - starts slow, ends fast */
  easeIn: 'ease-in',
  /** Ease Out - starts fast, ends slow */
  easeOut: 'ease-out',
  /** Ease In Out - slow start and end, fast middle */
  easeInOut: 'ease-in-out',
  /** Cubic bezier for custom easing */
  custom: {
    /** Smooth acceleration */
    smoothIn: 'cubic-bezier(0.4, 0, 1, 1)',
    /** Smooth deceleration */
    smoothOut: 'cubic-bezier(0, 0, 0.2, 1)',
    /** Smooth both ends */
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

/**
 * Type exports for TypeScript autocompletion
 */
export type Spacing = keyof typeof spacing;
export type BorderRadius = keyof typeof borderRadius;
export type ColorSurface = keyof typeof colors.surface;
export type ColorText = keyof typeof colors.text;
export type ColorBorder = keyof typeof colors.border;
export type ColorSemantic = keyof typeof colors.semantic;
export type ColorAccent = keyof typeof colors.accent;
export type ColorOverlay = keyof typeof colors.overlay;
export type Elevation = keyof typeof elevation;
export type Typography = keyof typeof typography;
export type ZIndex = keyof typeof zIndex;
export type Duration = keyof typeof duration;
export type Easing = keyof typeof easing;
