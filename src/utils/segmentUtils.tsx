import React from 'react';
import { Fill, Gradient, GradientTransform, WheelSegmentKind } from '../types';

// Constants for segment rendering
export const SEGMENT_KINDS: WheelSegmentKind[] = ['odd', 'even', 'nowin', 'jackpot'];
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

/**
 * Reconstruct absolute handle positions from gradient vectors
 * Following the algorithm in docs/fill.md (Section 3)
 *
 * Key points:
 * - Gradients are authored on a canonical 4-segment wheel (90° wedges)
 * - Must use TEMPLATE bounds (90° wedge), not runtime segment bounds
 * - Gradient basis is rotated 45° counterclockwise relative to template wedge
 * - Then rotate entire gradient to target segment position
 */
export function reconstructHandles(
  gradient: Gradient,
  templateCenterX: number,
  templateCenterY: number,
  templateWidth: number,
  templateHeight: number,
  segmentRotationRad: number
): [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }] | null {
  const vectors = gradient.handleVectors;

  if (!vectors || vectors.length < 3) {
    // Fallback to legacy handles if handleVectors not present
    if (gradient.handles && gradient.handles.length >= 3) {
      console.warn('Using legacy handles - export may be outdated');
      const handles = gradient.handles;
      return [
        { x: handles[0].x, y: handles[0].y },
        { x: handles[1].x, y: handles[1].y },
        { x: handles[2].x, y: handles[2].y }
      ];
    }
    return null;
  }

  // 45° counterclockwise offset for gradient basis (per docs/fill.md section 3)
  const gradientBasisOffset = -Math.PI / 4; // -45° in radians
  const totalRotation = segmentRotationRad + gradientBasisOffset;

  const cos = Math.cos(totalRotation);
  const sin = Math.sin(totalRotation);

  return vectors.slice(0, 3).map((vector) => {
    // Convert vector to local space using TEMPLATE bounds
    const localX = vector.x * templateWidth;
    const localY = vector.y * templateHeight;

    // Apply total rotation (segment rotation + 45° gradient basis offset)
    const rotatedX = cos * localX - sin * localY;
    const rotatedY = sin * localX + cos * localY;

    // Translate to world space
    return {
      x: templateCenterX + rotatedX,
      y: templateCenterY + rotatedY,
    };
  }) as [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }];
}

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
 * Create SVG gradient definition element with proper handle-based transforms
 * Now uses userSpaceOnUse and reconstructed handles
 */
export function createSvgGradientDef(
  gradient: Gradient,
  gradientId: string,
  reconstructedHandles: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }] | null
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

  // Use userSpaceOnUse for absolute positioning with handle-based transform
  const commonProps: Record<string, any> = {
    id: gradientId,
    gradientUnits: 'userSpaceOnUse'
  };

  // If we have reconstructed handles, build the gradient transform matrix
  if (reconstructedHandles) {
    const [p0, p1, p2] = reconstructedHandles;
    commonProps.gradientTransform = buildGradientMatrix(p0, p1, p2);
  }

  if (gradient.type === 'radial') {
    // Radial gradient: p0 is center, distance to p1 defines radius
    if (reconstructedHandles) {
      return (
        <radialGradient {...commonProps} cx={0} cy={0} r={1} fx={0} fy={0}>
          {stops}
        </radialGradient>
      );
    }
    // Fallback without handles
    return (
      <radialGradient {...commonProps} cx={0} cy={0} r={1}>
        {stops}
      </radialGradient>
    );
  }

  if (gradient.type === 'angular') {
    // Angular (conic) gradients - SVG doesn't support natively
    // Approximate with radial gradient
    console.warn('Angular gradients not fully supported in SVG, using radial approximation');
    return (
      <radialGradient {...commonProps} cx={0} cy={0} r={1} spreadMethod="repeat">
        {stops}
      </radialGradient>
    );
  }

  if (gradient.type === 'diamond') {
    // Diamond gradients - approximate with radial
    console.warn('Diamond gradients not fully supported in SVG, using radial approximation');
    return (
      <radialGradient {...commonProps} cx={0} cy={0} r={1}>
        {stops}
      </radialGradient>
    );
  }

  // Linear gradient (most common)
  // In gradient space: (0, 0) to (1, 0) defines the gradient axis
  // The transform matrix maps this to world space
  return (
    <linearGradient {...commonProps} x1={0} y1={0} x2={1} y2={0}>
      {stops}
    </linearGradient>
  );
}