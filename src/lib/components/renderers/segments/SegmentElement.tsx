import React, { useMemo } from 'react';
import type { SegmentLayoutProps } from '@lib-types/segmentLayoutTypes';
import { buildSegmentWedgePath, fillToSvgPaint } from '@utils/segmentUtils';
import type { SegmentElementProps } from './types';

function assetsEqual(
  prevAssets: SegmentElementProps['layoutAssets'],
  nextAssets: SegmentElementProps['layoutAssets']
): boolean {
  if (prevAssets === nextAssets) return true;
  const keys: Array<keyof NonNullable<SegmentElementProps['layoutAssets']>> = [
    'jackpotImageUrl',
    'purchaseImageUrl',
    'scIconUrl',
    'gcIconUrl',
    'spinsIconUrl',
    'noWinIconUrl',
  ];

  for (const key of keys) {
    if ((prevAssets?.[key] ?? undefined) !== (nextAssets?.[key] ?? undefined)) {
      return false;
    }
  }

  return true;
}

export const SegmentElement: React.FC<SegmentElementProps> = React.memo(
  ({
    segment,
    styles,
    cx,
    cy,
    outerRadius,
    segmentAngle,
    scale,
    layoutType,
    LayoutComponent,
    layoutAssets,
  }) => {
    const outerPath = useMemo(
      () => buildSegmentWedgePath(cx, cy, outerRadius, segment.startAngle, segment.endAngle),
      [cx, cy, outerRadius, segment.startAngle, segment.endAngle]
    );

    const outerFillPaint = useMemo(
      () => fillToSvgPaint(styles.outer.fill, `segment-outer-fill-${segment.index}`),
      [styles.outer.fill, segment.index]
    );

    const outerStrokePaint = useMemo(
      () =>
        styles.outer.stroke
          ? fillToSvgPaint(styles.outer.stroke.fill, `segment-outer-stroke-${segment.index}`)
          : 'none',
      [styles.outer.stroke, segment.index]
    );

    const outerStrokeWidth = useMemo(
      () => (styles.outer.stroke?.width ? styles.outer.stroke.width * scale : 0),
      [styles.outer.stroke, scale]
    );

    const {
      jackpotImageUrl,
      purchaseImageUrl,
      scIconUrl,
      gcIconUrl,
      spinsIconUrl,
      noWinIconUrl,
    } = layoutAssets ?? {};

    const layoutProps: SegmentLayoutProps = useMemo(
      () => ({
        segment,
        styles,
        cx,
        cy,
        outerRadius,
        segmentAngle,
        scale,
        jackpotImageUrl,
        purchaseImageUrl,
        scIconUrl,
        gcIconUrl,
        spinsIconUrl,
        noWinIconUrl,
      }),
      [
        segment,
        styles,
        cx,
        cy,
        outerRadius,
        segmentAngle,
        scale,
        jackpotImageUrl,
        purchaseImageUrl,
        scIconUrl,
        gcIconUrl,
        spinsIconUrl,
        noWinIconUrl,
      ]
    );

    return (
      <g key={`segment-${segment.index}`} data-layout-type={layoutType}>
        <path d={outerPath} fill={outerFillPaint} stroke={outerStrokePaint} strokeWidth={outerStrokeWidth} />
        <LayoutComponent {...layoutProps} />
      </g>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.segment.index === nextProps.segment.index &&
      prevProps.segment.startAngle === nextProps.segment.startAngle &&
      prevProps.segment.endAngle === nextProps.segment.endAngle &&
      prevProps.segment.kind === nextProps.segment.kind &&
      prevProps.segment.prizeSegment === nextProps.segment.prizeSegment &&
      prevProps.styles === nextProps.styles &&
      prevProps.cx === nextProps.cx &&
      prevProps.cy === nextProps.cy &&
      prevProps.outerRadius === nextProps.outerRadius &&
      prevProps.segmentAngle === nextProps.segmentAngle &&
      prevProps.scale === nextProps.scale &&
  prevProps.layoutType === nextProps.layoutType &&
      prevProps.LayoutComponent === nextProps.LayoutComponent &&
      assetsEqual(prevProps.layoutAssets, nextProps.layoutAssets)
    );
  }
);

SegmentElement.displayName = 'SegmentElement';
