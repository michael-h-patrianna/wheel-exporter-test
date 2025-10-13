import type { ComponentType } from 'react';
import type { SegmentLayoutProps, SegmentLayoutType } from '@lib-types/segmentLayoutTypes';
import { CompactLayout } from './CompactLayout';
import { IconBadgeLayout } from './IconBadgeLayout';
import { OriginalLayout } from './OriginalLayout';

const layoutRegistry: Record<SegmentLayoutType, ComponentType<SegmentLayoutProps>> = {
  original: OriginalLayout,
  compact: CompactLayout,
  'icon-badge': IconBadgeLayout,
};

export function getLayoutComponent(
  layoutType: SegmentLayoutType
): ComponentType<SegmentLayoutProps> {
  return layoutRegistry[layoutType] ?? OriginalLayout;
}
