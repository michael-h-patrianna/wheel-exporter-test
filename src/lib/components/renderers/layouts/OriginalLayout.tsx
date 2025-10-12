import React, { useMemo } from 'react';
import type { SegmentLayoutProps } from '../../../types/segmentLayoutTypes';
import offerPng from '../../../../assets/offer.png';
import randomRewardPng from '../../../../assets/random_reward.png';
import xpPng from '../../../../assets/xp.png';
import {
  fillToSvgPaint,
  computeArcFontSize,
  TEXT_GRID_RADII_FACTORS,
  MIN_TEXT_FONT_SIZE,
  TEXT_FONT_FAMILY,
  formatNumber
} from '../../../utils/segmentUtils';

/**
 * Original Layout Strategy
 *
 * This is the current implementation extracted from SegmentRenderer.
 * It uses three different layouts based on prize type:
 * 1. Image Only (purchase offers, random rewards, jackpot)
 * 2. Text with Image Below (XP prizes)
 * 3. Two Line Text (all other prizes)
 */

// Layout Component 1: Image Only
const SegmentImageOnly: React.FC<{
  segment: SegmentLayoutProps['segment'];
  cx: number;
  cy: number;
  outerRadius: number;
  imageUrl: string;
}> = React.memo(({ segment, cx, cy, outerRadius, imageUrl }) => {
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

// Layout Component 2: Text with Image Below
const SegmentTextWithImage: React.FC<{
  segment: SegmentLayoutProps['segment'];
  styles: SegmentLayoutProps['styles'];
  cx: number;
  cy: number;
  outerRadius: number;
  segmentAngle: number;
  imageUrl: string;
}> = React.memo(({ segment, styles, cx, cy, outerRadius, segmentAngle, imageUrl }) => {
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

    const prizeSegment = segment.prizeSegment;
    const displayText = prizeSegment?.displayText || '';

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

    const segmentMidAngle = (segment.startAngle + segment.endAngle) / 2;
    const imageRadius = gridRadii[2];
    const imageCenterX = cx + imageRadius * Math.cos(segmentMidAngle);
    const imageCenterY = cy + imageRadius * Math.sin(segmentMidAngle);
    const imageSize = outerRadius * 0.25;
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

// Layout Component 3: Two Line Text
const SegmentTwoLineText: React.FC<{
  segment: SegmentLayoutProps['segment'];
  styles: SegmentLayoutProps['styles'];
  cx: number;
  cy: number;
  outerRadius: number;
  segmentAngle: number;
}> = React.memo(({ segment, styles, cx: _cx, cy: _cy, outerRadius, segmentAngle }) => {
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

    const prizeSegment = segment.prizeSegment;
    const displayText = prizeSegment?.displayText || '';
    const isNoWin = prizeSegment?.isNoWin || segment.kind === 'nowin';

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

/**
 * Original Layout Strategy
 * Chooses between three layouts based on prize type
 */
export const OriginalLayout: React.FC<SegmentLayoutProps> = (props) => {
  const {
    segment,
    styles,
    cx,
    cy,
    outerRadius,
    segmentAngle,
    jackpotImageUrl,
    purchaseImageUrl
  } = props;

  const contentElements = useMemo(() => {
    const prizeSegment = segment.prizeSegment;

    // Layout 1: Image Only (purchase offers, random rewards, jackpot)
    if (prizeSegment?.usePurchaseImage) {
      return (
        <SegmentImageOnly
          segment={segment}
          cx={cx}
          cy={cy}
          outerRadius={outerRadius}
          imageUrl={purchaseImageUrl || offerPng}
        />
      );
    }

    if (prizeSegment?.useRandomRewardImage) {
      return (
        <SegmentImageOnly
          segment={segment}
          cx={cx}
          cy={cy}
          outerRadius={outerRadius}
          imageUrl={randomRewardPng}
        />
      );
    }

    // Note: We removed the jackpot image-only logic here
    // Jackpot now just uses the jackpot segment styles (colors, etc.)
    // but displays the prize content normally (text layout below)

    // Layout 2: Text with Image Below (XP prizes)
    if (prizeSegment?.useXpImage) {
      return (
        <SegmentTextWithImage
          segment={segment}
          styles={styles}
          cx={cx}
          cy={cy}
          outerRadius={outerRadius}
          segmentAngle={segmentAngle}
          imageUrl={xpPng}
        />
      );
    }

    // Layout 3: Two Line Text (all other prizes)
    return (
      <SegmentTwoLineText
        segment={segment}
        styles={styles}
        cx={cx}
        cy={cy}
        outerRadius={outerRadius}
        segmentAngle={segmentAngle}
      />
    );
  }, [segment, styles, cx, cy, outerRadius, segmentAngle, jackpotImageUrl, purchaseImageUrl]);

  return <>{contentElements}</>;
};
