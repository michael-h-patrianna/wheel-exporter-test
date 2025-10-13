import type { ComponentType } from 'react';
import type { WheelSegmentKind, WheelSegmentStyles, WheelSegmentTypeStyles } from '@lib-types';
import type { SegmentLayoutProps, SegmentLayoutType } from '@lib-types/segmentLayoutTypes';
import type { PrizeSegment } from '@utils/prizeSegmentMapper';

/**
 * Shared segment rendering data used across renderer submodules.
 */
export interface SegmentRenderData {
  index: number;
  startAngle: number;
  endAngle: number;
  kind: WheelSegmentKind;
  prizeSegment?: PrizeSegment;
}

export interface SegmentDefinitionsProps {
  segmentData: SegmentRenderData[];
  segments: WheelSegmentStyles;
  cx: number;
  cy: number;
  outerRadius: number;
  segmentAngle: number;
}

export interface SegmentElementProps {
  segment: SegmentRenderData;
  styles: WheelSegmentTypeStyles;
  cx: number;
  cy: number;
  outerRadius: number;
  segmentAngle: number;
  scale: number;
  layoutType: SegmentLayoutType;
  LayoutComponent: ComponentType<SegmentLayoutProps>;
  layoutAssets?: SegmentLayoutAssetProps;
}

export interface SegmentLayoutAssetProps {
  jackpotImageUrl?: string;
  purchaseImageUrl?: string;
  scIconUrl?: string;
  gcIconUrl?: string;
  spinsIconUrl?: string;
  noWinIconUrl?: string;
}
