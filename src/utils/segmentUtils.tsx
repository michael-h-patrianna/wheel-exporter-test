import React from 'react';
import { Fill, Gradient, GradientTransform, WheelSegmentKind } from '../types';

// Constants for segment rendering
// Segment order: jackpot, nowin, then alternating odd/even
export const SEGMENT_KINDS: WheelSegmentKind[] = ['jackpot', 'nowin', 'odd', 'even', 'odd', 'even', 'odd', 'even'];
const TAU = Math.PI * 2;
export const SEGMENT_PREVIEW_INNER_RADIUS_RATIO = 0.6; // Inner radius is 60% of outer radius

/**
 * Convert hex color string to CSS color
 * Supports hex colors like "#FF0000" or "#FF0000FF" with alpha
 * Also passes through rgba() strings unchanged
 */
export function colorToCSS(color: string): string {
  // If it's already an rgba/rgb string, return as-is
  if (color.startsWith('rgb')) {
    return color;
  }

  // Handle hex colors
  if (color.startsWith('#')) {
    // Check if it has alpha channel (8 characters)
    if (color.length === 9) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      const a = parseInt(color.slice(7, 9), 16) / 255;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    // Regular hex color (6 characters)
    return color;
  }

  // Fallback to the color as-is
  return color;
}

/**
 * Format a number for SVG (removes unnecessary decimals)
 */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }
  const fixed = value.toFixed(6);
  const trimmed = fixed.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  const normalized = trimmed === '-0' ? '0' : trimmed;
  return normalized.length ? normalized : '0';
}

/**
 * Build SVG path for a wedge segment (outer part)
 */
export function buildSegmentWedgePath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const startX = cx + radius * Math.cos(startAngle);
  const startY = cy + radius * Math.sin(startAngle);
  const endX = cx + radius * Math.cos(endAngle);
  const endY = cy + radius * Math.sin(endAngle);

  let delta = endAngle - startAngle;
  while (delta < 0) {
    delta += TAU;
  }
  const largeArcFlag = delta > Math.PI ? 1 : 0;

  return `M ${cx} ${cy} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
}

/**
 * Build SVG path for a ring segment (inner part)
 */
export function buildSegmentRingPath(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  const startOuterX = cx + outerRadius * Math.cos(startAngle);
  const startOuterY = cy + outerRadius * Math.sin(startAngle);
  const endOuterX = cx + outerRadius * Math.cos(endAngle);
  const endOuterY = cy + outerRadius * Math.sin(endAngle);
  const startInnerX = cx + innerRadius * Math.cos(startAngle);
  const startInnerY = cy + innerRadius * Math.sin(startAngle);
  const endInnerX = cx + innerRadius * Math.cos(endAngle);
  const endInnerY = cy + innerRadius * Math.sin(endAngle);

  let delta = endAngle - startAngle;
  while (delta < 0) {
    delta += TAU;
  }
  const largeArcFlag = delta > Math.PI ? 1 : 0;

  return [
    `M ${startInnerX} ${startInnerY}`,
    `L ${startOuterX} ${startOuterY}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}`,
    `L ${endInnerX} ${endInnerY}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInnerX} ${startInnerY}`,
    'Z'
  ].join(' ');
}

/**
 * Compute bounding box for a wedge segment
 */
export function computeWedgeBounds(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  let normalizedStart = startAngle;
  let normalizedEnd = endAngle;
  while (normalizedEnd <= normalizedStart) {
    normalizedEnd += TAU;
  }

  const points: { x: number; y: number }[] = [
    { x: cx, y: cy }, // Center point
    { x: cx + radius * Math.cos(normalizedStart), y: cy + radius * Math.sin(normalizedStart) },
    { x: cx + radius * Math.cos(normalizedEnd), y: cy + radius * Math.sin(normalizedEnd) }
  ];

  // Check if cardinal directions (0°, 90°, 180°, 270°) are within the arc
  const cardinalAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  const epsilon = 1e-9;

  cardinalAngles.forEach((axis) => {
    let candidate = axis;
    while (candidate < normalizedStart) {
      candidate += TAU;
    }
    if (candidate <= normalizedEnd + epsilon) {
      points.push({
        x: cx + radius * Math.cos(candidate),
        y: cy + radius * Math.sin(candidate)
      });
    }
  });

  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  points.forEach((point) => {
    if (point.x < minX) minX = point.x;
    if (point.x > maxX) maxX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.y > maxY) maxY = point.y;
  });

  return {
    minX,
    minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Convert gradient transform matrix to SVG string
 */
export function gradientTransformToString(transform: GradientTransform): string {
  const [[a, c, e], [b, d, f]] = transform;
  return `matrix(${formatNumber(a)} ${formatNumber(b)} ${formatNumber(c)} ${formatNumber(d)} ${formatNumber(e)} ${formatNumber(f)})`;
}

// Removed handle reconstruction - using rotation-based gradients only

/**
 * Compute the canonical 4-segment template wedge bounds
 * Used as reference geometry for gradient reconstruction
 */
export function computeTemplateBounds(
  cx: number,
  cy: number,
  radius: number
): { width: number; height: number; centerX: number; centerY: number } {
  // Template: 90° wedge starting at -90° (top)
  const templateStartAngle = -Math.PI / 2;
  const templateSweep = Math.PI / 2; // 90°
  const templateEndAngle = templateStartAngle + templateSweep;

  const bounds = computeWedgeBounds(cx, cy, radius, templateStartAngle, templateEndAngle);

  return {
    width: bounds.width,
    height: bounds.height,
    centerX: bounds.minX + bounds.width / 2,
    centerY: bounds.minY + bounds.height / 2
  };
}

/**
 * Build gradient affine transform matrix from three reconstructed handles
 * Following Section 4 of docs/fill.md
 */
export function buildGradientMatrix(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): string {
  // Matrix form: [[p1.x - p0.x, p2.x - p0.x, p0.x], [p1.y - p0.y, p2.y - p0.y, p0.y]]
  // SVG matrix format: matrix(a b c d e f)
  const a = p1.x - p0.x;
  const b = p1.y - p0.y;
  const c = p2.x - p0.x;
  const d = p2.y - p0.y;
  const e = p0.x;
  const f = p0.y;

  return `matrix(${formatNumber(a)} ${formatNumber(b)} ${formatNumber(c)} ${formatNumber(d)} ${formatNumber(e)} ${formatNumber(f)})`;
}

/**
 * Convert fill to CSS/SVG paint value
 */
export function fillToSvgPaint(fill: Fill | undefined, gradientId?: string): string {
  if (!fill) {
    return 'none';
  }

  if (fill.type === 'solid' && fill.color) {
    return colorToCSS(fill.color);
  }

  if (fill.type === 'gradient' && fill.gradient && gradientId) {
    return `url(#${gradientId})`;
  }

  return 'none';
}

/**
 * Create SVG gradient definition using rotation angle only
 * Simplified: just use rotation and color stops, no handle transforms
 * @param segmentRotationDeg - Additional rotation in degrees to apply for segment positioning
 */
export function createSvgGradientDef(
  gradient: Gradient,
  gradientId: string,
  segmentRotationDeg: number = 0
): React.ReactElement | null {
  const stops = gradient.stops?.map((stop, index) => (
    <stop
      key={`${gradientId}-stop-${index}`}
      offset={`${formatNumber(stop.position * 100)}%`}
      stopColor={colorToCSS(stop.color)}
    />
  ));

  if (!stops?.length) {
    return null;
  }

  // Only support linear gradients
  if (gradient.type !== 'linear') {
    console.warn(`Gradient type "${gradient.type}" is not supported. Only "linear" gradients are supported.`);
    return null;
  }

  // Use objectBoundingBox with rotation
  // Combine gradient's rotation with segment's rotation
  // Add 180° to fix gradient direction (handles were originally swapped)
  const gradientRotation = gradient.rotation || 0;
  const totalRotation = gradientRotation + segmentRotationDeg + 180;

  return (
    <linearGradient
      id={gradientId}
      gradientUnits="objectBoundingBox"
      gradientTransform={`rotate(${totalRotation} 0.5 0.5)`}
      x1="0" y1="0" x2="1" y2="0"
    >
      {stops}
    </linearGradient>
  );
}