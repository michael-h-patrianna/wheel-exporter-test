/**
 * Segment Layout Strategy Types
 *
 * Defines the different visual layout strategies for displaying prize segments on the wheel.
 * Each strategy provides a different approach to handling the varying content types and lengths.
 */

import type { PrizeSegment } from '../utils/prizeSegmentMapper';
import type { WheelSegmentTypeStyles } from '../types';

/**
 * Available segment layout strategies
 *
 * Infrastructure is ready to support multiple layout strategies.
 * Additional layouts can be added in the future.
 */
export type SegmentLayoutType =
  | 'original';     // Current implementation (mixed layouts based on prize type)

/**
 * Common props passed to all layout strategies
 */
export interface SegmentLayoutProps {
  segment: {
    index: number;
    startAngle: number;
    endAngle: number;
    kind: string;
    prizeSegment?: PrizeSegment;
  };
  styles: WheelSegmentTypeStyles;
  cx: number;
  cy: number;
  outerRadius: number;
  segmentAngle: number;
  scale: number;
  // Asset URLs
  jackpotImageUrl?: string;
  purchaseImageUrl?: string;
  scIconUrl?: string;
  gcIconUrl?: string;
  spinsIconUrl?: string;
  noWinIconUrl?: string;
}

/**
 * Layout strategy metadata for UI display
 */
export interface SegmentLayoutInfo {
  id: SegmentLayoutType;
  name: string;
  description: string;
}

/**
 * All available layout strategies with metadata
 *
 * This array is used by the UI to populate layout selection controls.
 * When new layout strategies are added, they should be registered here.
 */
export const SEGMENT_LAYOUTS: SegmentLayoutInfo[] = [
  {
    id: 'original',
    name: 'Original',
    description: 'Mixed layout with text and images based on prize type'
  }
];
