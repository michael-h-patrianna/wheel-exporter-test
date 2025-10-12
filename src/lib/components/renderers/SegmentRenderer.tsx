import React, { useMemo, useEffect, useRef } from 'react';
import { WheelSegmentStyles, CenterComponent } from '../../types';
import { WheelState } from '../../hooks/useWheelStateMachine';
import {
  buildSegmentWedgePath,
  fillToSvgPaint,
  createSvgGradientDef,
  SEGMENT_KINDS,
  describeArcPath,
  computeArcFontSize,
  createDropShadowFilter,
  TEXT_GRID_RADII_FACTORS,
  MIN_TEXT_FONT_SIZE,
  TEXT_FONT_FAMILY,
  formatNumber
} from '../../utils/segmentUtils';
import offerPng from '../../../assets/offer.png';
import type { PrizeProviderResult } from '../../services/prizeProvider';
import { mapPrizesToSegments, type PrizeSegment } from '../../utils/prizeSegmentMapper';
import type { SegmentLayoutType } from '../../types/segmentLayoutTypes';
import { OriginalLayout } from './layouts/OriginalLayout';

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

// Memoized gradient definitions component
interface GradientDefsProps {
  segmentData: Array<{
    index: number;
    startAngle: number;
    endAngle: number;
    kind: string;
  }>;
  segments: WheelSegmentStyles;
}

const GradientDefs: React.FC<GradientDefsProps> = React.memo(({ segmentData, segments }) => {
  const gradientDefs = useMemo(() => {
    const defs: React.ReactElement[] = [];

    segmentData.forEach((segment) => {
      const styles = segments[segment.kind as import('../../types').WheelSegmentKind];
      if (!styles) return;

      // Calculate segment rotation in degrees (midpoint of segment)
      const segmentRotationRad = (segment.startAngle + segment.endAngle) / 2;
      const segmentRotationDeg = (segmentRotationRad * 180) / Math.PI;

      // Process outer fill gradient (only linear)
      if (styles.outer?.fill?.type === 'gradient' &&
          styles.outer.fill.gradient &&
          styles.outer.fill.gradient.type === 'linear') {
        const gradientId = `segment-outer-fill-${segment.index}`;
        const gradientDef = createSvgGradientDef(
          styles.outer.fill.gradient,
          gradientId,
          segmentRotationDeg
        );
        if (gradientDef) {
          defs.push(React.cloneElement(gradientDef, { key: gradientId }));
        }
      }

      // Process outer stroke gradient (if type is gradient and linear)
      if (styles.outer.stroke?.fill?.type === 'gradient' &&
          styles.outer.stroke.fill.gradient &&
          styles.outer.stroke.fill.gradient.type === 'linear') {
        const gradientId = `segment-outer-stroke-${segment.index}`;
        const gradientDef = createSvgGradientDef(
          styles.outer.stroke.fill.gradient,
          gradientId,
          segmentRotationDeg
        );
        if (gradientDef) {
          defs.push(React.cloneElement(gradientDef, { key: gradientId }));
        }
      }

      // Process text fill gradient (only linear)
      if (styles.text?.fill?.type === 'gradient' &&
          styles.text.fill.gradient &&
          styles.text.fill.gradient.type === 'linear') {
        const gradientId = `segment-text-fill-${segment.index}`;
        const gradientDef = createSvgGradientDef(
          styles.text.fill.gradient,
          gradientId,
          segmentRotationDeg
        );
        if (gradientDef) {
          defs.push(React.cloneElement(gradientDef, { key: gradientId }));
        }
      }

      // Process text stroke gradient (only linear)
      if (styles.text?.stroke?.fill?.type === 'gradient' &&
          styles.text.stroke.fill.gradient &&
          styles.text.stroke.fill.gradient.type === 'linear') {
        const gradientId = `segment-text-stroke-${segment.index}`;
        const gradientDef = createSvgGradientDef(
          styles.text.stroke.fill.gradient,
          gradientId,
          segmentRotationDeg
        );
        if (gradientDef) {
          defs.push(React.cloneElement(gradientDef, { key: gradientId }));
        }
      }
    });

    return defs;
  }, [segmentData, segments]);

  if (gradientDefs.length === 0) return null;
  return <>{gradientDefs}</>;
});

GradientDefs.displayName = 'GradientDefs';

// Memoized filter definitions component
interface FilterDefsProps {
  segmentData: Array<{
    index: number;
    startAngle: number;
    endAngle: number;
    kind: string;
  }>;
  segments: WheelSegmentStyles;
}

const FilterDefs: React.FC<FilterDefsProps> = React.memo(({ segmentData, segments }) => {
  const filterDefs = useMemo(() => {
    const defs: React.ReactElement[] = [];

    segmentData.forEach((segment) => {
      const styles = segments[segment.kind as import('../../types').WheelSegmentKind];
      if (!styles) return;

      // Process text drop shadow filter
      if (styles.text?.dropShadows && styles.text.dropShadows.length > 0) {
        const filterId = `segment-text-shadow-${segment.index}`;
        const filterDef = createDropShadowFilter(filterId, styles.text.dropShadows);
        defs.push(React.cloneElement(filterDef, { key: filterId }));
      }
    });

    return defs;
  }, [segmentData, segments]);

  if (filterDefs.length === 0) return null;
  return <>{filterDefs}</>;
});

FilterDefs.displayName = 'FilterDefs';

// Memoized arc path definitions component
interface ArcPathDefsProps {
  segmentData: Array<{
    index: number;
    startAngle: number;
    endAngle: number;
    kind: string;
  }>;
  segments: WheelSegmentStyles;
  cx: number;
  cy: number;
  outerRadius: number;
  segmentAngle: number;
}

const ArcPathDefs: React.FC<ArcPathDefsProps> = React.memo(({
  segmentData,
  segments,
  cx,
  cy,
  outerRadius,
  segmentAngle
}) => {
  const arcPathDefs = useMemo(() => {
    const defs: React.ReactElement[] = [];

    segmentData.forEach((segment) => {
      const styles = segments[segment.kind as import('../../types').WheelSegmentKind];
      if (!styles || !styles.text) return;

      const angleInset = Math.min(segmentAngle * 0.22, Math.PI / 12);
      const arcStart = segment.startAngle + angleInset;
      const arcEnd = segment.endAngle - angleInset;
      const textAngleSpan = arcEnd - arcStart;

      if (textAngleSpan > 0 && outerRadius > 0) {
        const gridRadii = TEXT_GRID_RADII_FACTORS.map((factor) =>
          Math.max(outerRadius * factor, outerRadius * 0.3)
        );

        // Primary text arc (Lorem / NO)
        const primaryArcId = `wheel-segment-${segment.index}-primary-arc`;
        const primaryArcPath = describeArcPath(cx, cy, gridRadii[0], arcStart, arcEnd);
        defs.push(<path key={primaryArcId} id={primaryArcId} d={primaryArcPath} fill="none" />);

        // Secondary text arc (Ipsum / WIN)
        const secondaryArcId = `wheel-segment-${segment.index}-secondary-arc`;
        const secondaryArcPath = describeArcPath(cx, cy, gridRadii[2], arcStart, arcEnd);
        defs.push(<path key={secondaryArcId} id={secondaryArcId} d={secondaryArcPath} fill="none" />);
      }
    });

    return defs;
  }, [segmentData, segments, cx, cy, outerRadius, segmentAngle]);

  if (arcPathDefs.length === 0) return null;
  return <>{arcPathDefs}</>;
});

ArcPathDefs.displayName = 'ArcPathDefs';

// Layout Component 1: Image Only (purchase offers, random rewards)
interface SegmentImageOnlyProps {
  segment: {
    index: number;
    startAngle: number;
    endAngle: number;
    kind: string;
  };
  cx: number;
  cy: number;
  outerRadius: number;
  imageUrl: string;
}

const SegmentImageOnly: React.FC<SegmentImageOnlyProps> = React.memo(({
  segment,
  cx,
  cy,
  outerRadius,
  imageUrl
}) => {
  const segmentMidAngle = (segment.startAngle + segment.endAngle) / 2;
  const imageRadius = outerRadius * 0.62;
  const imageCenterX = cx + imageRadius * Math.cos(segmentMidAngle);
  const imageCenterY = cy + imageRadius * Math.sin(segmentMidAngle);
  const imageSize = outerRadius * 0.55;
  const rotationDeg = (segmentMidAngle * 180) / Math.PI + 90;

  return (
    <image
      key={`wheel-segment-${segment.index}-image`}
      href={imageUrl}
      x={imageCenterX - imageSize / 2}
      y={imageCenterY - imageSize / 2}
      width={imageSize}
      height={imageSize}
      preserveAspectRatio="xMidYMid meet"
      transform={`rotate(${rotationDeg} ${imageCenterX} ${imageCenterY})`}
      data-segment-kind={segment.kind}
    />
  );
});

SegmentImageOnly.displayName = 'SegmentImageOnly';

// Layout Component 2: Text with Image Below (XP prizes)
interface SegmentTextWithImageProps {
  segment: {
    index: number;
    startAngle: number;
    endAngle: number;
    kind: string;
    prizeSegment?: PrizeSegment;
  };
  styles: import('../../types').WheelSegmentTypeStyles;
  cx: number;
  cy: number;
  outerRadius: number;
  segmentAngle: number;
  imageUrl: string;
}

const SegmentTextWithImage: React.FC<SegmentTextWithImageProps> = React.memo(({
  segment,
  styles,
  cx,
  cy,
  outerRadius,
  segmentAngle,
  imageUrl
}) => {
  const elements: React.ReactElement[] = [];

  if (!styles.text) return null;

  const angleInset = Math.min(segmentAngle * 0.22, Math.PI / 12);
  const arcStart = segment.startAngle + angleInset;
  const arcEnd = segment.endAngle - angleInset;
  const textAngleSpan = arcEnd - arcStart;

  if (textAngleSpan > 0 && outerRadius > 0) {
    const gridRadii = TEXT_GRID_RADII_FACTORS.map((factor) =>
      Math.max(outerRadius * factor, outerRadius * 0.3)
    );

    // Get text from prize data
    const prizeSegment = segment.prizeSegment;
    const displayText = prizeSegment?.displayText || '';

    // Text on primary arc (top position)
    const primaryArcId = `wheel-segment-${segment.index}-primary-arc`;
    const lineRadius = gridRadii[0];
    const baseFontSize = computeArcFontSize(displayText, lineRadius, textAngleSpan);
    const fontSize = Math.max(MIN_TEXT_FONT_SIZE, baseFontSize);

    const textFillPaint = fillToSvgPaint(
      styles.text?.fill,
      `segment-text-fill-${segment.index}`
    );

    let textStroke = 'none';
    if (styles.text?.stroke) {
      if (styles.text.stroke.fill) {
        textStroke = fillToSvgPaint(
          styles.text.stroke.fill,
          `segment-text-stroke-${segment.index}`
        );
      } else if (styles.text.stroke.color) {
        textStroke = styles.text.stroke.color;
      }
    }
    const textStrokeWidth = styles.text?.stroke?.width || 0;

    const textFilter = styles.text?.dropShadows && styles.text.dropShadows.length > 0
      ? `url(#segment-text-shadow-${segment.index})`
      : undefined;

    elements.push(
      <text
        key={`wheel-segment-${segment.index}-text`}
        fontFamily={TEXT_FONT_FAMILY}
        fontWeight={700}
        fontSize={formatNumber(fontSize)}
        fill={textFillPaint !== 'none' ? textFillPaint : undefined}
        stroke={textStroke}
        strokeWidth={textStrokeWidth ? formatNumber(textStrokeWidth) : undefined}
        strokeLinejoin="round"
        strokeLinecap="round"
        filter={textFilter}
        data-segment-kind={segment.kind}
        data-segment-line="primary"
        textRendering="optimizeLegibility"
      >
        <textPath
          href={`#${primaryArcId}`}
          xlinkHref={`#${primaryArcId}`}
          startOffset="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          spacing="auto"
        >
          {displayText}
        </textPath>
      </text>
    );

    // Image below text (at secondary arc position)
    const segmentMidAngle = (segment.startAngle + segment.endAngle) / 2;
    const imageRadius = gridRadii[2]; // Use secondary arc radius
    const imageCenterX = cx + imageRadius * Math.cos(segmentMidAngle);
    const imageCenterY = cy + imageRadius * Math.sin(segmentMidAngle);
    const imageSize = outerRadius * 0.25; // Smaller than image-only size
    const rotationDeg = (segmentMidAngle * 180) / Math.PI + 90;

    elements.push(
      <image
        key={`wheel-segment-${segment.index}-xp-image`}
        href={imageUrl}
        x={imageCenterX - imageSize / 2}
        y={imageCenterY - imageSize / 2}
        width={imageSize}
        height={imageSize}
        preserveAspectRatio="xMidYMid meet"
        transform={`rotate(${rotationDeg} ${imageCenterX} ${imageCenterY})`}
        data-segment-kind={segment.kind}
      />
    );
  }

  return <>{elements}</>;
});

SegmentTextWithImage.displayName = 'SegmentTextWithImage';

// Layout Component 3: Two Line Text (all other prizes)
interface SegmentTwoLineTextProps {
  segment: {
    index: number;
    startAngle: number;
    endAngle: number;
    kind: string;
    prizeSegment?: PrizeSegment;
  };
  styles: import('../../types').WheelSegmentTypeStyles;
  cx: number;
  cy: number;
  outerRadius: number;
  segmentAngle: number;
}

const SegmentTwoLineText: React.FC<SegmentTwoLineTextProps> = React.memo(({
  segment,
  styles,
  cx: _cx,
  cy: _cy,
  outerRadius,
  segmentAngle
}) => {
  const elements: React.ReactElement[] = [];

  if (!styles.text) return null;

  const angleInset = Math.min(segmentAngle * 0.22, Math.PI / 12);
  const arcStart = segment.startAngle + angleInset;
  const arcEnd = segment.endAngle - angleInset;
  const textAngleSpan = arcEnd - arcStart;

  if (textAngleSpan > 0 && outerRadius > 0) {
    const gridRadii = TEXT_GRID_RADII_FACTORS.map((factor) =>
      Math.max(outerRadius * factor, outerRadius * 0.3)
    );

    // Get text from prize data
    const prizeSegment = segment.prizeSegment;
    const displayText = prizeSegment?.displayText || '';
    const isNoWin = prizeSegment?.isNoWin || segment.kind === 'nowin';

    // Split text on newline for two-line display
    const textLines = displayText.includes('\n')
      ? displayText.split('\n')
      : [displayText];

    const lineDefinitions: Array<{
      key: 'primary' | 'secondary';
      label: string;
      radius: number;
      fontScale: number;
    }> = [
      {
        key: 'primary',
        label: textLines[0] || (isNoWin ? 'NO' : 'Lorem'),
        radius: gridRadii[0],
        fontScale: 1,
      },
      {
        key: 'secondary',
        label: textLines[1] || (isNoWin ? 'WIN' : 'Ipsum'),
        radius: gridRadii[2],
        fontScale: 0.92,
      },
    ];

    lineDefinitions.forEach((line) => {
      const { label, radius: lineRadius, fontScale, key } = line;
      const trimmed = label.trim();
      if (!trimmed.length || lineRadius <= 0) {
        return;
      }

      const arcPathId = `wheel-segment-${segment.index}-${key}-arc`;
      const baseFontSize = computeArcFontSize(trimmed, lineRadius, textAngleSpan) * fontScale;
      const fontSize = Math.max(MIN_TEXT_FONT_SIZE, baseFontSize);

      const textFillPaint = fillToSvgPaint(
        styles.text?.fill,
        `segment-text-fill-${segment.index}`
      );

      let textStroke = 'none';
      if (styles.text?.stroke) {
        if (styles.text.stroke.fill) {
          textStroke = fillToSvgPaint(
            styles.text.stroke.fill,
            `segment-text-stroke-${segment.index}`
          );
        } else if (styles.text.stroke.color) {
          textStroke = styles.text.stroke.color;
        }
      }
      const textStrokeWidth = styles.text?.stroke?.width || 0;

      const textFilter = styles.text?.dropShadows && styles.text.dropShadows.length > 0
        ? `url(#segment-text-shadow-${segment.index})`
        : undefined;

      elements.push(
        <text
          key={`wheel-segment-${segment.index}-${key}-text`}
          fontFamily={TEXT_FONT_FAMILY}
          fontWeight={700}
          fontSize={formatNumber(fontSize)}
          fill={textFillPaint !== 'none' ? textFillPaint : undefined}
          stroke={textStroke}
          strokeWidth={textStrokeWidth ? formatNumber(textStrokeWidth) : undefined}
          strokeLinejoin="round"
          strokeLinecap="round"
          filter={textFilter}
          data-segment-kind={segment.kind}
          data-segment-line={key}
          textRendering="optimizeLegibility"
        >
          <textPath
            href={`#${arcPathId}`}
            xlinkHref={`#${arcPathId}`}
            startOffset="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            spacing="auto"
          >
            {trimmed}
          </textPath>
        </text>
      );
    });
  }

  return <>{elements}</>;
});

SegmentTwoLineText.displayName = 'SegmentTwoLineText';

// Memoized individual segment component
interface SegmentProps {
  segment: {
    index: number;
    startAngle: number;
    endAngle: number;
    kind: string;
    prizeSegment?: PrizeSegment;
  };
  styles: import('../../types').WheelSegmentTypeStyles;
  cx: number;
  cy: number;
  outerRadius: number;
  segmentAngle: number;
  scale: number;
  jackpotImageUrl?: string;
  purchaseImageUrl?: string;
  layoutType: SegmentLayoutType;
}

const Segment: React.FC<SegmentProps> = React.memo(({
  segment,
  styles,
  cx,
  cy,
  outerRadius,
  segmentAngle,
  scale,
  jackpotImageUrl,
  purchaseImageUrl,
  layoutType
}) => {
  // Memoize outer path calculation
  const outerPath = useMemo(() =>
    buildSegmentWedgePath(
      cx,
      cy,
      outerRadius,
      segment.startAngle,
      segment.endAngle
    ),
    [cx, cy, outerRadius, segment.startAngle, segment.endAngle]
  );

  // Memoize paint values
  const outerFillPaint = useMemo(() =>
    fillToSvgPaint(
      styles.outer.fill,
      `segment-outer-fill-${segment.index}`
    ),
    [styles.outer.fill, segment.index]
  );

  const outerStrokePaint = useMemo(() =>
    styles.outer.stroke
      ? fillToSvgPaint(
          styles.outer.stroke.fill,
          `segment-outer-stroke-${segment.index}`
        )
      : 'none',
    [styles.outer.stroke, segment.index]
  );

  const outerStrokeWidth = useMemo(() =>
    styles.outer.stroke?.width ? styles.outer.stroke.width * scale : 0,
    [styles.outer.stroke?.width, scale]
  );

  // Memoize content elements - use strategy pattern based on layoutType
  const contentElements = useMemo(() => {
    const layoutProps = {
      segment,
      styles,
      cx,
      cy,
      outerRadius,
      segmentAngle,
      scale,
      jackpotImageUrl,
      purchaseImageUrl
    };

    // Route to appropriate layout strategy
    // Currently only 'original' is supported, but infrastructure
    // is ready for additional layout strategies to be added
    switch (layoutType) {
      case 'original':
      default:
        return <OriginalLayout {...layoutProps} />;
    }
  }, [segment, styles, cx, cy, outerRadius, segmentAngle, scale, jackpotImageUrl, purchaseImageUrl, layoutType]);

  return (
    <g key={`segment-${segment.index}`}>
      {/* Outer segment (wedge) */}
      <path
        d={outerPath}
        fill={outerFillPaint}
        stroke={outerStrokePaint}
        strokeWidth={outerStrokeWidth}
      />
      {/* Content elements (text/images based on layout) */}
      {contentElements}
    </g>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  // Only re-render if props that affect appearance change
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
    prevProps.jackpotImageUrl === nextProps.jackpotImageUrl &&
    prevProps.purchaseImageUrl === nextProps.purchaseImageUrl &&
    prevProps.layoutType === nextProps.layoutType
  );
});

Segment.displayName = 'Segment';

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
  layoutType = 'original'
}) => {
  // Map prizes to segments if prizeSession is available
  const prizeSegments = useMemo<PrizeSegment[] | null>(() => {
    if (prizeSession && prizeSession.prizes.length === segmentCount) {
      return mapPrizesToSegments(prizeSession.prizes);
    }
    return null;
  }, [prizeSession, segmentCount]);

  // Calculate segment angles
  const segmentAngle = useMemo(() =>
    (Math.PI * 2) / segmentCount,
    [segmentCount]
  );

  // Generate segment data with prize mapping
  const segmentData = useMemo(() => {
    const data = [];
    for (let i = 0; i < segmentCount; i++) {
      const startAngle = i * segmentAngle - Math.PI / 2; // Start from top
      const endAngle = startAngle + segmentAngle;

      // Use prize segment kind if available, otherwise default pattern
      const prizeSegment = prizeSegments?.[i];
      const segmentKind = prizeSegment?.kind || SEGMENT_KINDS[i % SEGMENT_KINDS.length];

      data.push({
        index: i,
        startAngle,
        endAngle,
        kind: segmentKind,
        prizeSegment // Include prize segment data
      });
    }
    return data;
  }, [segmentCount, segmentAngle, prizeSegments]);

  // Get jackpot image URL (purchase image or fallback to offer.png)
  const jackpotImageUrl = useMemo(() => {
    if (purchaseImageFilename && rewardsPrizeImages?.purchase) {
      return rewardsPrizeImages.purchase;
    }
    return offerPng;
  }, [purchaseImageFilename, rewardsPrizeImages]);

  // Get purchase offer image URL (from theme or fallback to offer.png)
  const purchaseImageUrl = useMemo(() => {
    if (rewardsPrizeImages?.purchase) {
      return rewardsPrizeImages.purchase;
    }
    return offerPng;
  }, [rewardsPrizeImages]);

  // Get center position and radius - memoized (with null checks)
  const { cx, cy, outerRadius } = useMemo(() => ({
    cx: center ? center.x * scale : 0,
    cy: center ? center.y * scale : 0,
    outerRadius: center ? center.radius * scale : 0
  }), [center, scale]);

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
      transition
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
        pointerEvents: 'none'
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
          <GradientDefs segmentData={segmentData} segments={segments} />
          <FilterDefs segmentData={segmentData} segments={segments} />
          <ArcPathDefs
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
          const styles = segments[segment.kind as import('../../types').WheelSegmentKind];
          if (!styles) return null;

          return (
            <Segment
              key={`segment-${segment.index}`}
              segment={segment}
              styles={styles}
              cx={cx}
              cy={cy}
              outerRadius={outerRadius}
              segmentAngle={segmentAngle}
              scale={scale}
              jackpotImageUrl={jackpotImageUrl}
              purchaseImageUrl={purchaseImageUrl}
              layoutType={layoutType}
            />
          );
        })}
      </svg>
    </div>
  );
};
