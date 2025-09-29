import React, { useMemo } from 'react';
import { WheelSegmentStyles, CenterComponent } from '../../types';
import {
  buildSegmentWedgePath,
  buildSegmentRingPath,
  fillToSvgPaint,
  createSvgGradientDef,
  SEGMENT_KINDS,
  SEGMENT_PREVIEW_INNER_RADIUS_RATIO
} from '../../utils/segmentUtils';

interface SegmentRendererProps {
  segments?: WheelSegmentStyles;
  center?: CenterComponent;
  segmentCount: number;
  scale: number;
  isSpinning?: boolean;
  targetRotation?: number;
}

export const SegmentRenderer: React.FC<SegmentRendererProps> = ({
  segments,
  center,
  segmentCount,
  scale,
  isSpinning = false,
  targetRotation = 0
}) => {
  // Calculate segment angles
  const segmentAngle = (Math.PI * 2) / segmentCount;

  // Generate segment data
  const segmentData = useMemo(() => {
    const data = [];
    for (let i = 0; i < segmentCount; i++) {
      const startAngle = i * segmentAngle - Math.PI / 2; // Start from top
      const endAngle = startAngle + segmentAngle;

      // Determine segment type
      const segmentKind = SEGMENT_KINDS[i % SEGMENT_KINDS.length];

      data.push({
        index: i,
        startAngle,
        endAngle,
        kind: segmentKind
      });
    }
    return data;
  }, [segmentCount, segmentAngle]);

  // Early return if no segments or center
  if (!segments || !center) {
    return null;
  }

  // Get center position and radius
  const cx = center.x * scale;
  const cy = center.y * scale;
  const outerRadius = center.radius * scale;
  const innerRadius = outerRadius * SEGMENT_PREVIEW_INNER_RADIUS_RATIO;

  // Collect all gradients for defs
  const gradientDefs: React.ReactElement[] = [];

  segmentData.forEach((segment) => {
    const styles = segments[segment.kind];
    if (!styles) return;

    // Process outer fill gradient
    if (styles.outer?.fill?.type === 'gradient' && styles.outer.fill.gradient) {
      const gradientId = `segment-outer-fill-${segment.index}`;
      // Calculate segment rotation angle
      const segmentRotation = (segment.startAngle + segment.endAngle) / 2 * (180 / Math.PI);
      const gradientDef = createSvgGradientDef(
        styles.outer.fill.gradient,
        gradientId,
        segmentRotation
      );
      if (gradientDef) {
        gradientDefs.push(gradientDef);
      }
    }

    // Process outer stroke gradient
    if (styles.outer?.stroke?.fill?.type === 'gradient' && styles.outer.stroke.fill.gradient) {
      const gradientId = `segment-outer-stroke-${segment.index}`;
      const segmentRotation = (segment.startAngle + segment.endAngle) / 2 * (180 / Math.PI);
      const gradientDef = createSvgGradientDef(
        styles.outer.stroke.fill.gradient,
        gradientId,
        segmentRotation
      );
      if (gradientDef) {
        gradientDefs.push(gradientDef);
      }
    }

    // Process inner fill gradient
    if (styles.inner?.fill?.type === 'gradient' && styles.inner.fill.gradient) {
      const gradientId = `segment-inner-fill-${segment.index}`;
      const segmentRotation = (segment.startAngle + segment.endAngle) / 2 * (180 / Math.PI);
      const gradientDef = createSvgGradientDef(
        styles.inner.fill.gradient,
        gradientId,
        segmentRotation
      );
      if (gradientDef) {
        gradientDefs.push(gradientDef);
      }
    }

    // Process inner stroke gradient
    if (styles.inner?.stroke?.fill?.type === 'gradient' && styles.inner.stroke.fill.gradient) {
      const gradientId = `segment-inner-stroke-${segment.index}`;
      const segmentRotation = (segment.startAngle + segment.endAngle) / 2 * (180 / Math.PI);
      const gradientDef = createSvgGradientDef(
        styles.inner.stroke.fill.gradient,
        gradientId,
        segmentRotation
      );
      if (gradientDef) {
        gradientDefs.push(gradientDef);
      }
    }
  });

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
        width="100%"
        height="100%"
        style={{
          display: 'block',
          transformOrigin: `${cx}px ${cy}px`,
          transform: `rotate(${targetRotation}deg)`,
          transition: isSpinning
            ? 'transform 5s cubic-bezier(0.15, 0, 0.25, 1)'
            : 'transform 1.5s cubic-bezier(0.35, 0, 0.25, 1)'
        }}
      >
        {/* Gradient definitions */}
        {gradientDefs.length > 0 && (
          <defs>
            {gradientDefs}
          </defs>
        )}

        {/* Render segments */}
          {segmentData.map((segment) => {
          const styles = segments[segment.kind];
          if (!styles) return null;

          // Build paths
          const outerPath = buildSegmentWedgePath(
            cx,
            cy,
            outerRadius,
            segment.startAngle,
            segment.endAngle
          );

          const innerPath = buildSegmentRingPath(
            cx,
            cy,
            innerRadius,
            outerRadius,
            segment.startAngle,
            segment.endAngle
          );

          // Get paint values
          const outerFillPaint = fillToSvgPaint(
            styles.outer?.fill,
            `segment-outer-fill-${segment.index}`
          );


          const outerStrokePaint = styles.outer?.stroke
            ? fillToSvgPaint(
                styles.outer.stroke.fill,
                `segment-outer-stroke-${segment.index}`
              )
            : 'none';

          const innerFillPaint = fillToSvgPaint(
            styles.inner?.fill,
            `segment-inner-fill-${segment.index}`
          );

          const innerStrokePaint = styles.inner?.stroke
            ? fillToSvgPaint(
                styles.inner.stroke.fill,
                `segment-inner-stroke-${segment.index}`
              )
            : 'none';

          return (
            <g key={`segment-${segment.index}`}>
              {/* Outer segment (wedge) */}
              {styles.outer && (
                <path
                  d={outerPath}
                  fill={outerFillPaint}
                  stroke={outerStrokePaint}
                  strokeWidth={styles.outer.stroke?.width ? styles.outer.stroke.width * scale : 0}
                />
              )}

              {/* Inner segment (ring) - temporarily disabled */}
              {/* {styles.inner && (
                <path
                  d={innerPath}
                  fill={innerFillPaint}
                  stroke={innerStrokePaint}
                  strokeWidth={styles.inner.stroke?.width ? styles.inner.stroke.width * scale : 0}
                />
              )} */}
            </g>
          );
        })}
      </svg>
    </div>
  );
};