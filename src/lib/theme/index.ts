/**
 * Theme System - Cross-Platform Design Tokens
 *
 * This module exports all design tokens for the wheel component library.
 * All tokens are designed to be compatible with both React (web) and
 * React Native implementations.
 *
 * ## Usage
 *
 * Import tokens directly from the theme module:
 *
 * ```typescript
 * import { spacing, colors, borderRadius } from '@/lib/theme';
 *
 * const buttonStyle = {
 *   padding: spacing.md,
 *   backgroundColor: colors.accent.primary,
 *   borderRadius: borderRadius.lg,
 * };
 * ```
 *
 * ## Cross-Platform Compatibility
 *
 * All tokens avoid React Native incompatible features:
 * - ❌ No box-shadow (use `elevation` with borders instead)
 * - ❌ No radial/conic gradients (linear gradients only)
 * - ❌ No blur effects or CSS filters
 * - ❌ No pseudo-elements (:before, :after)
 * - ✅ Simple colors (hex, rgb, rgba)
 * - ✅ Transform-based animations only
 * - ✅ Opacity and color transitions
 *
 * ## Design Decisions
 *
 * ### Elevation System
 * Instead of box-shadow (web-only), we use a border-based elevation system.
 * This provides visual hierarchy that works consistently across platforms.
 *
 * On web, you can optionally enhance with box-shadow via platform-specific
 * styling, but the border-based approach is the baseline.
 *
 * ### Color Palette
 * Colors are defined as simple hex/rgba values. For gradients, only linear
 * gradients are supported (via react-native-linear-gradient on mobile).
 * Avoid radial and conic gradients as they're web-only.
 *
 * ### Spacing & Typography
 * Based on 8px baseline grid for consistency. All values are numeric pixels
 * that work directly in both web CSS and React Native style objects.
 *
 * @module theme
 */

export {
  spacing,
  borderRadius,
  colors,
  borderWidth,
  elevation,
  typography,
  zIndex,
  duration,
  easing,
} from './tokens';

export type {
  Spacing,
  BorderRadius,
  ColorSurface,
  ColorText,
  ColorBorder,
  ColorSemantic,
  ColorAccent,
  ColorOverlay,
  Elevation,
  Typography,
  ZIndex,
  Duration,
  Easing,
} from './tokens';
