import React from 'react';
import offerPng from '@assets/offer.png';
import randomRewardPng from '@assets/random_reward.png';
import xpPng from '@assets/xp.png';
import type { SegmentLayoutProps } from '@lib-types/segmentLayoutTypes';
import {
  MIN_TEXT_FONT_SIZE,
  TEXT_FONT_FAMILY,
  TEXT_GRID_RADII_FACTORS,
  computeArcFontSize,
  fillToSvgPaint,
  formatNumber,
} from '@utils/segmentUtils';

const BADGE_FILL = 'rgba(0, 0, 0, 0.25)';

function resolveIcon(props: SegmentLayoutProps): string {
  const { segment, purchaseImageUrl, jackpotImageUrl, scIconUrl, gcIconUrl, spinsIconUrl, noWinIconUrl } = props;
  const prizeSegment = segment.prizeSegment;

  if (prizeSegment?.iconUrl) {
    return prizeSegment.iconUrl;
  }

  if (prizeSegment?.useRandomRewardImage) {
    return randomRewardPng;
  }

  if (prizeSegment?.usePurchaseImage) {
    return purchaseImageUrl ?? offerPng;
  }

  if (segment.kind === 'jackpot') {
    return jackpotImageUrl ?? purchaseImageUrl ?? offerPng;
  }

  if (prizeSegment?.useXpImage) {
    return xpPng;
  }

  if (prizeSegment?.isNoWin) {
    return noWinIconUrl ?? offerPng;
  }

  const displayText = prizeSegment?.displayText ?? '';
  if (displayText.includes('SC') && scIconUrl) {
    return scIconUrl;
  }
  if (displayText.includes('GC') && gcIconUrl) {
    return gcIconUrl;
  }
  if (displayText.includes('SPIN') && spinsIconUrl) {
    return spinsIconUrl;
  }

  return purchaseImageUrl ?? jackpotImageUrl ?? offerPng;
}

export const IconBadgeLayout: React.FC<SegmentLayoutProps> = React.memo((props) => {
  const { segment, styles, cx, cy, outerRadius, segmentAngle } = props;

  if (!styles.text) {
    return null;
  }

  const angleInset = Math.min(segmentAngle * 0.2, Math.PI / 14);
  const arcStart = segment.startAngle + angleInset;
  const arcEnd = segment.endAngle - angleInset;
  const textAngleSpan = arcEnd - arcStart;

  if (textAngleSpan <= 0 || outerRadius <= 0) {
    return null;
  }

  const gridRadii = TEXT_GRID_RADII_FACTORS.map((factor) =>
    Math.max(outerRadius * factor * 0.86, outerRadius * 0.32)
  );

  const prizeSegment = segment.prizeSegment;
  const displayText = prizeSegment?.displayText ?? '';
  const isNoWin = prizeSegment?.isNoWin || segment.kind === 'nowin';
  const iconUrl = resolveIcon(props);

  const lines = displayText.split('\n');
  const primaryText = lines[0] || (isNoWin ? 'NO WIN' : 'PRIZE');
  const secondaryText = lines[1] || '';

  const textFill = fillToSvgPaint(styles.text.fill, `segment-text-fill-${segment.index}`);

  let textStroke = 'none';
  if (styles.text.stroke) {
    if (styles.text.stroke.fill) {
      textStroke = fillToSvgPaint(styles.text.stroke.fill, `segment-text-stroke-${segment.index}`);
    } else if (styles.text.stroke.color) {
      textStroke = styles.text.stroke.color;
    }
  }

  const textStrokeWidth = styles.text.stroke?.width || 0;
  const textFilter = styles.text.dropShadows?.length
    ? `url(#segment-text-shadow-${segment.index})`
    : undefined;

  const primaryFontSize = Math.max(
    MIN_TEXT_FONT_SIZE,
    computeArcFontSize(primaryText, gridRadii[1], textAngleSpan) * 0.9
  );

  const secondaryFontSize = Math.max(
    MIN_TEXT_FONT_SIZE,
    computeArcFontSize(secondaryText, gridRadii[2], textAngleSpan) * 0.78
  );

  const segmentMidAngle = (segment.startAngle + segment.endAngle) / 2;
  const badgeRadius = outerRadius * 0.22;
  const badgeCenterRadius = gridRadii[0];
  const badgeCx = cx + badgeCenterRadius * Math.cos(segmentMidAngle);
  const badgeCy = cy + badgeCenterRadius * Math.sin(segmentMidAngle);
  const badgeRotation = (segmentMidAngle * 180) / Math.PI + 90;

  const primaryArcId = `wheel-segment-${segment.index}-primary-arc`;
  const secondaryArcId = `wheel-segment-${segment.index}-secondary-arc`;

  const badgeStroke = prizeSegment?.color ?? styles.outer.fill?.color ?? '#ffffff';

  return (
    <>
      <circle
        cx={badgeCx}
        cy={badgeCy}
        r={badgeRadius}
        fill={BADGE_FILL}
        stroke={badgeStroke}
        strokeWidth={Math.max(1, badgeRadius * 0.08)}
        opacity={0.92}
        data-layout-variant="icon-badge"
      />
      <image
        href={iconUrl}
        x={badgeCx - badgeRadius * 0.85}
        y={badgeCy - badgeRadius * 0.85}
        width={badgeRadius * 1.7}
        height={badgeRadius * 1.7}
        transform={`rotate(${badgeRotation} ${badgeCx} ${badgeCy})`}
        preserveAspectRatio="xMidYMid meet"
        data-layout-variant="icon-badge-image"
      />

      <text
        fontFamily={TEXT_FONT_FAMILY}
        fontWeight={700}
        fontSize={formatNumber(primaryFontSize)}
        fill={textFill !== 'none' ? textFill : undefined}
        stroke={textStroke}
        strokeWidth={textStrokeWidth ? formatNumber(textStrokeWidth) : undefined}
        strokeLinejoin="round"
        strokeLinecap="round"
        filter={textFilter}
        data-layout-variant="icon-badge-primary"
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
          {primaryText}
        </textPath>
      </text>

      {secondaryText && (
        <text
          fontFamily={TEXT_FONT_FAMILY}
          fontWeight={600}
          fontSize={formatNumber(secondaryFontSize)}
          fill={textFill !== 'none' ? textFill : undefined}
          stroke={textStroke}
          strokeWidth={textStrokeWidth ? formatNumber(textStrokeWidth) : undefined}
          strokeLinejoin="round"
          strokeLinecap="round"
          filter={textFilter}
          data-layout-variant="icon-badge-secondary"
          textRendering="optimizeLegibility"
        >
          <textPath
            href={`#${secondaryArcId}`}
            xlinkHref={`#${secondaryArcId}`}
            startOffset="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            spacing="auto"
          >
            {secondaryText}
          </textPath>
        </text>
      )}
    </>
  );
});

IconBadgeLayout.displayName = 'IconBadgeLayout';
