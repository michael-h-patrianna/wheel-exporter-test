/**
 * Segment rendering constants
 * Extracted from segmentUtils.tsx for better architecture
 */

import { WheelSegmentKind } from '../types';

/**
 * Default segment order for an 8-segment wheel
 * Pattern: jackpot, nowin, then alternating odd/even
 */
export const SEGMENT_KINDS: WheelSegmentKind[] = [
  'jackpot',
  'nowin',
  'odd',
  'even',
  'odd',
  'even',
  'odd',
  'even',
];

/**
 * Two times PI - full circle in radians
 */
export const TAU = Math.PI * 2;

/**
 * Inner radius as a ratio of outer radius for segment preview
 * 0.6 = 60% of outer radius
 */
export const SEGMENT_PREVIEW_INNER_RADIUS_RATIO = 0.6;

/**
 * Text grid radii as factors of outer radius (0-1 scale)
 * [0] = primary text line radius (73% of outer)
 * [1] = middle line radius (59% of outer - unused)
 * [2] = secondary text line radius (55% of outer)
 */
export const TEXT_GRID_RADII_FACTORS = [0.73, 0.59, 0.55] as const;

/**
 * Minimum font size for text rendering on wheel segments
 */
export const MIN_TEXT_FONT_SIZE = 10;

/**
 * Font family for wheel segment text
 */
export const TEXT_FONT_FAMILY = '"Inter", "Helvetica Neue", Arial, sans-serif';
