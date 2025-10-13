import React, { useMemo } from 'react';
import {
  createDropShadowFilter,
  createSvgGradientDef,
  describeArcPath,
  TEXT_GRID_RADII_FACTORS,
} from '@utils/segmentUtils';
import type { SegmentDefinitionsProps } from './types';

const GradientDefs: React.FC<SegmentDefinitionsProps> = React.memo(
  ({ segmentData, segments }) => {
    const gradientDefs = useMemo(() => {
      const defs: React.ReactElement[] = [];

      segmentData.forEach((segment) => {
        const styles = segments[segment.kind];
        if (!styles) return;

        const segmentRotationRad = (segment.startAngle + segment.endAngle) / 2;
        const segmentRotationDeg = (segmentRotationRad * 180) / Math.PI;

        if (
          styles.outer?.fill?.type === 'gradient' &&
          styles.outer.fill.gradient?.type === 'linear'
        ) {
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

        if (
          styles.outer.stroke?.fill?.type === 'gradient' &&
          styles.outer.stroke.fill.gradient?.type === 'linear'
        ) {
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

        if (styles.text?.fill?.type === 'gradient' && styles.text.fill.gradient?.type === 'linear') {
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

        if (
          styles.text?.stroke?.fill?.type === 'gradient' &&
          styles.text.stroke.fill.gradient?.type === 'linear'
        ) {
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
  }
);

GradientDefs.displayName = 'SegmentGradientDefs';

const FilterDefs: React.FC<SegmentDefinitionsProps> = React.memo(({ segmentData, segments }) => {
  const filterDefs = useMemo(() => {
    const defs: React.ReactElement[] = [];

    segmentData.forEach((segment) => {
      const styles = segments[segment.kind];
      if (!styles?.text?.dropShadows?.length) return;

      const filterId = `segment-text-shadow-${segment.index}`;
      const filterDef = createDropShadowFilter(filterId, styles.text.dropShadows);
      defs.push(React.cloneElement(filterDef, { key: filterId }));
    });

    return defs;
  }, [segmentData, segments]);

  if (filterDefs.length === 0) return null;
  return <>{filterDefs}</>;
});

FilterDefs.displayName = 'SegmentFilterDefs';

const ArcPathDefs: React.FC<SegmentDefinitionsProps> = React.memo(
  ({ segmentData, segments, cx, cy, outerRadius, segmentAngle }) => {
    const arcPathDefs = useMemo(() => {
      const defs: React.ReactElement[] = [];

      segmentData.forEach((segment) => {
        const styles = segments[segment.kind];
        if (!styles?.text) return;

        const angleInset = Math.min(segmentAngle * 0.22, Math.PI / 12);
        const arcStart = segment.startAngle + angleInset;
        const arcEnd = segment.endAngle - angleInset;
        const textAngleSpan = arcEnd - arcStart;

        if (textAngleSpan <= 0 || outerRadius <= 0) {
          return;
        }

        const gridRadii = TEXT_GRID_RADII_FACTORS.map((factor) =>
          Math.max(outerRadius * factor, outerRadius * 0.3)
        );

        const primaryArcId = `wheel-segment-${segment.index}-primary-arc`;
        const primaryArcPath = describeArcPath(cx, cy, gridRadii[0], arcStart, arcEnd);
        defs.push(<path key={primaryArcId} id={primaryArcId} d={primaryArcPath} fill="none" />);

        const secondaryArcId = `wheel-segment-${segment.index}-secondary-arc`;
        const secondaryArcPath = describeArcPath(cx, cy, gridRadii[2], arcStart, arcEnd);
        defs.push(
          <path key={secondaryArcId} id={secondaryArcId} d={secondaryArcPath} fill="none" />
        );
      });

      return defs;
    }, [segmentData, segments, cx, cy, outerRadius, segmentAngle]);

    if (arcPathDefs.length === 0) return null;
    return <>{arcPathDefs}</>;
  }
);

ArcPathDefs.displayName = 'SegmentArcPathDefs';

export const SegmentDefinitions: React.FC<SegmentDefinitionsProps> = React.memo((props) => (
  <>
    <GradientDefs {...props} />
    <FilterDefs {...props} />
    <ArcPathDefs {...props} />
  </>
));

SegmentDefinitions.displayName = 'SegmentDefinitions';
