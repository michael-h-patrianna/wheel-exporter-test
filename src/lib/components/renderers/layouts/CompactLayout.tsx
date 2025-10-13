import React from 'react';
import type { SegmentLayoutProps } from '@lib-types/segmentLayoutTypes';
import {
  MIN_TEXT_FONT_SIZE,
  TEXT_FONT_FAMILY,
  TEXT_GRID_RADII_FACTORS,
  computeArcFontSize,
  fillToSvgPaint,
  formatNumber,
} from '@utils/segmentUtils';

/**
 * Compact text-only layout.
 * Focuses on readability for high segment counts by keeping content within inner arcs.
 */
export const CompactLayout: React.FC<SegmentLayoutProps> = React.memo(
  ({ segment, styles, outerRadius, segmentAngle }) => {
    if (!styles.text) {
      return null;
    }

    const angleInset = Math.min(segmentAngle * 0.18, Math.PI / 16);
    const arcStart = segment.startAngle + angleInset;
    const arcEnd = segment.endAngle - angleInset;
    const textAngleSpan = arcEnd - arcStart;

    if (textAngleSpan <= 0 || outerRadius <= 0) {
      return null;
    }

    const gridRadii = TEXT_GRID_RADII_FACTORS.map((factor) =>
      Math.max(outerRadius * factor * 0.82, outerRadius * 0.28)
    );

    const prizeSegment = segment.prizeSegment;
    const displayText = prizeSegment?.displayText || '';
    const isNoWin = prizeSegment?.isNoWin || segment.kind === 'nowin';

    let textLines: [string, string];
    if (!displayText.length) {
      textLines = isNoWin ? ['NO', 'WIN'] : ['--', '--'];
    } else {
      const lines = displayText.split('\n');
      textLines = [lines[0] ?? '', lines[1] ?? ''];
    }

    const textFillPaint = fillToSvgPaint(styles.text.fill, `segment-text-fill-${segment.index}`);

    let textStroke = 'none';
    if (styles.text.stroke) {
      if (styles.text.stroke.fill) {
        textStroke = fillToSvgPaint(
          styles.text.stroke.fill,
          `segment-text-stroke-${segment.index}`
        );
      } else if (styles.text.stroke.color) {
        textStroke = styles.text.stroke.color;
      }
    }

    const textStrokeWidth = styles.text.stroke?.width || 0;

    const primaryFontSize = Math.max(
      MIN_TEXT_FONT_SIZE,
      computeArcFontSize(textLines[0], gridRadii[1], textAngleSpan) * 0.92
    );

    const secondaryFontSize = Math.max(
      MIN_TEXT_FONT_SIZE,
      computeArcFontSize(textLines[1], gridRadii[2], textAngleSpan) * 0.72
    );

    const textFilter = styles.text.dropShadows?.length
      ? `url(#segment-text-shadow-${segment.index})`
      : undefined;

    const primaryArcId = `wheel-segment-${segment.index}-primary-arc`;
    const secondaryArcId = `wheel-segment-${segment.index}-secondary-arc`;

    return (
      <>
        <text
          key={`segment-${segment.index}-compact-primary`}
          fontFamily={TEXT_FONT_FAMILY}
          fontWeight={700}
          fontSize={formatNumber(primaryFontSize)}
          fill={textFillPaint !== 'none' ? textFillPaint : undefined}
          stroke={textStroke}
          strokeWidth={textStrokeWidth ? formatNumber(textStrokeWidth) : undefined}
          strokeLinejoin="round"
          strokeLinecap="round"
          filter={textFilter}
          data-segment-kind={segment.kind}
          data-layout-variant="compact-primary"
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
            {textLines[0]}
          </textPath>
        </text>

        {textLines[1] && (
          <text
            key={`segment-${segment.index}-compact-secondary`}
            fontFamily={TEXT_FONT_FAMILY}
            fontWeight={600}
            fontSize={formatNumber(secondaryFontSize)}
            fill={textFillPaint !== 'none' ? textFillPaint : undefined}
            stroke={textStroke}
            strokeWidth={textStrokeWidth ? formatNumber(textStrokeWidth) : undefined}
            strokeLinejoin="round"
            strokeLinecap="round"
            filter={textFilter}
            data-segment-kind={segment.kind}
            data-layout-variant="compact-secondary"
            textRendering="optimizeLegibility"
          >
            <textPath
              href={`#${secondaryArcId}`}
              xlinkHref={`#${secondaryArcId}`}
              startOffset="52%"
              textAnchor="middle"
              dominantBaseline="middle"
              spacing="auto"
            >
              {textLines[1]}
            </textPath>
          </text>
        )}
      </>
    );
  }
);

CompactLayout.displayName = 'CompactLayout';
