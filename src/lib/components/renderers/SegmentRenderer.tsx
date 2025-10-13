import React, { useEffect, useMemo, useRef } from 'react';
import offerPng from '@assets/offer.png';
import { WheelState } from '@hooks/useWheelStateMachine';
import type { PrizeProviderResult } from '@services/prizeProvider';
import { CenterComponent, WheelSegmentStyles } from '@lib-types';
import type { SegmentLayoutType } from '@lib-types/segmentLayoutTypes';
import { mapPrizesToSegments, type PrizeSegment } from '@utils/prizeSegmentMapper';
import { getLayoutComponent } from './layouts/layoutRegistry';
import { SegmentDefinitions } from './segments/SegmentDefs';
import { SegmentElement } from './segments/SegmentElement';
import { useSegmentAngle, useSegmentData } from './segments/segmentData';
import type { SegmentLayoutAssetProps } from './segments/types';

interface SegmentRendererProps {
  segments?: WheelSegmentStyles;
  center?: CenterComponent;
  segmentCount: number;
  scale: number;
  wheelState?: WheelState;
  targetRotation?: number;
  rewardsPrizeImages?: {
    gc?: string;
    sc?: string;
    purchase?: string;
    [key: string]: string | undefined;
  };
  purchaseImageFilename?: string;
  prizeSession?: PrizeProviderResult | null;
  layoutType?: SegmentLayoutType;
}

function buildLayoutAssets(
  rewardsPrizeImages: SegmentRendererProps['rewardsPrizeImages'],
  purchaseImageFilename?: string
): SegmentLayoutAssetProps {
  const purchaseImage = rewardsPrizeImages?.purchase ?? offerPng;
  const jackpotImage =
    purchaseImageFilename && rewardsPrizeImages?.purchase
      ? rewardsPrizeImages.purchase
      : purchaseImage;

  return {
    jackpotImageUrl: jackpotImage,
    purchaseImageUrl: purchaseImage,
    scIconUrl: rewardsPrizeImages?.sc,
    gcIconUrl: rewardsPrizeImages?.gc,
    spinsIconUrl: rewardsPrizeImages?.spins ?? rewardsPrizeImages?.freeSpins,
    noWinIconUrl: rewardsPrizeImages?.nowin ?? rewardsPrizeImages?.noWin,
  };
}

export const SegmentRenderer: React.FC<SegmentRendererProps> = ({
  segments,
  center,
  segmentCount,
  scale,
  wheelState = 'IDLE',
  targetRotation = 0,
  rewardsPrizeImages,
  purchaseImageFilename,
  prizeSession,
  layoutType = 'original',
}) => {
  // Map prizes to segments if prizeSession is available
  const prizeSegments = useMemo<PrizeSegment[] | null>(() => {
    if (prizeSession && prizeSession.prizes.length === segmentCount) {
      return mapPrizesToSegments(prizeSession.prizes);
    }
    return null;
  }, [prizeSession, segmentCount]);

  // Calculate segment angles
  const segmentAngle = useSegmentAngle(segmentCount);

  const segmentData = useSegmentData(segmentCount, segmentAngle, prizeSegments);

  const layoutAssets = useMemo(
    () => buildLayoutAssets(rewardsPrizeImages, purchaseImageFilename),
    [rewardsPrizeImages, purchaseImageFilename]
  );

  const LayoutComponent = useMemo(
    () => getLayoutComponent(layoutType),
    [layoutType]
  );

  // Get center position and radius - memoized (with null checks)
  const { cx, cy, outerRadius } = useMemo(
    () => ({
      cx: center ? center.x * scale : 0,
      cy: center ? center.y * scale : 0,
      outerRadius: center ? center.radius * scale : 0,
    }),
    [center, scale]
  );

  // Use ref to track SVG element for direct DOM manipulation
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Memoize base SVG style - transition only, transform applied via useEffect
  const svgStyle = useMemo(() => {
    let transition: string;

    switch (wheelState) {
      case 'SPINNING':
        // Exciting single-phase animation - 8 seconds with extreme ease-out
        // cubic-bezier(0.11, 0.83, 0.36, 0.97) creates natural "near miss" excitement:
        //
        // Timing breakdown:
        // - First 3 seconds (37.5%): Covers ~80% of rotation (fast blur)
        // - Next 4 seconds (50%): Covers ~18% of rotation (6-8 segments visible - "near misses!")
        // - Last 1 second (12.5%): Covers ~2% of rotation (final 1-2 segments crawling)
        //
        // This mimics real friction physics while creating psychological tension.
        // Players see segments pass slowly enough to believe "it could stop now!"
        // but the wheel keeps going, building excitement until the final stop.
        transition = 'transform 8s cubic-bezier(0.11, 0.83, 0.36, 0.97)';
        break;
      case 'IDLE':
      case 'COMPLETE':
      default:
        // No transition for idle/complete states
        transition = 'none';
        break;
    }

    return {
      display: 'block' as const,
      transformOrigin: `${cx}px ${cy}px`,
      transition,
    };
  }, [cx, cy, wheelState]);

  // Apply transform separately to ensure proper timing with transition changes
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;

    // Apply the rotation transform
    svg.style.transform = `rotate(${targetRotation}deg)`;
  }, [targetRotation]);

  // Early return after all hooks have been called
  if (!segments || !center) {
    return null;
  }

  return (
    <div
      className="segments-component"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        zIndex: 5, // Between wheelBg (z-index: 2) and wheelTop1 (z-index: 15)
        pointerEvents: 'none',
      }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={svgStyle}
        data-wheel-state={wheelState}
        data-target-rotation={targetRotation}
      >
        {/* Definitions */}
        <defs>
          <SegmentDefinitions
            segmentData={segmentData}
            segments={segments}
            cx={cx}
            cy={cy}
            outerRadius={outerRadius}
            segmentAngle={segmentAngle}
          />
        </defs>

        {/* Render segments */}
        {segmentData.map((segment) => {
          const styles = segments[segment.kind as import('@lib-types').WheelSegmentKind];
          if (!styles) return null;

          return (
            <SegmentElement
              key={`segment-${segment.index}`}
              segment={segment}
              styles={styles}
              cx={cx}
              cy={cy}
              outerRadius={outerRadius}
              segmentAngle={segmentAngle}
              scale={scale}
              layoutType={layoutType}
              LayoutComponent={LayoutComponent}
              layoutAssets={layoutAssets}
            />
          );
        })}
      </svg>
    </div>
  );
};
