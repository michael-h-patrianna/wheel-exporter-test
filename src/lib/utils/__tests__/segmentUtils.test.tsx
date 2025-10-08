/**
 * Comprehensive test suite for segmentUtils.tsx
 * Tests all utility functions for 100% coverage
 */

import React from 'react';
import { render } from '@testing-library/react';
import {
  SEGMENT_KINDS,
  SEGMENT_PREVIEW_INNER_RADIUS_RATIO,
  TEXT_GRID_RADII_FACTORS,
  MIN_TEXT_FONT_SIZE,
  TEXT_FONT_FAMILY,
  colorToCSS,
  formatNumber,
  buildSegmentWedgePath,
  buildSegmentRingPath,
  computeWedgeBounds,
  gradientTransformToString,
  computeTemplateBounds,
  buildGradientMatrix,
  fillToSvgPaint,
  createSvgGradientDef,
  describeArcPath,
  computeArcFontSize,
  createDropShadowFilter,
} from '../segmentUtils';
import { Fill, Gradient, GradientTransform, DropShadow } from '../../types';

describe('segmentUtils', () => {
  // ============================================================================
  // Constants Tests
  // ============================================================================

  describe('Constants', () => {
    it('should export correct SEGMENT_KINDS array', () => {
      expect(SEGMENT_KINDS).toEqual(['jackpot', 'nowin', 'odd', 'even', 'odd', 'even', 'odd', 'even']);
      expect(SEGMENT_KINDS).toHaveLength(8);
    });

    it('should export correct SEGMENT_PREVIEW_INNER_RADIUS_RATIO', () => {
      expect(SEGMENT_PREVIEW_INNER_RADIUS_RATIO).toBe(0.6);
    });

    it('should export correct TEXT_GRID_RADII_FACTORS', () => {
      expect(TEXT_GRID_RADII_FACTORS).toEqual([0.73, 0.59, 0.55]);
    });

    it('should export correct MIN_TEXT_FONT_SIZE', () => {
      expect(MIN_TEXT_FONT_SIZE).toBe(10);
    });

    it('should export correct TEXT_FONT_FAMILY', () => {
      expect(TEXT_FONT_FAMILY).toBe('"Inter", "Helvetica Neue", Arial, sans-serif');
    });
  });

  // ============================================================================
  // colorToCSS Tests
  // ============================================================================

  describe('colorToCSS', () => {
    it('should pass through rgb() strings unchanged', () => {
      expect(colorToCSS('rgb(255, 0, 0)')).toBe('rgb(255, 0, 0)');
    });

    it('should pass through rgba() strings unchanged', () => {
      expect(colorToCSS('rgba(255, 0, 0, 0.5)')).toBe('rgba(255, 0, 0, 0.5)');
    });

    it('should convert 6-character hex colors as-is', () => {
      expect(colorToCSS('#FF0000')).toBe('#FF0000');
      expect(colorToCSS('#00FF00')).toBe('#00FF00');
      expect(colorToCSS('#0000FF')).toBe('#0000FF');
    });

    it('should convert 8-character hex colors with alpha to rgba', () => {
      expect(colorToCSS('#FF0000FF')).toBe('rgba(255, 0, 0, 1)');
      expect(colorToCSS('#FF000080')).toBe('rgba(255, 0, 0, 0.5019607843137255)');
      expect(colorToCSS('#00FF0000')).toBe('rgba(0, 255, 0, 0)');
    });

    it('should return non-standard colors as-is', () => {
      expect(colorToCSS('red')).toBe('red');
      expect(colorToCSS('transparent')).toBe('transparent');
    });
  });

  // ============================================================================
  // formatNumber Tests
  // ============================================================================

  describe('formatNumber', () => {
    it('should format integers without decimals', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(1)).toBe('1');
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber(-5)).toBe('-5');
    });

    it('should format decimals with precision', () => {
      expect(formatNumber(1.5)).toBe('1.5');
      expect(formatNumber(1.123456)).toBe('1.123456');
      expect(formatNumber(0.000001)).toBe('0.000001');
    });

    it('should remove trailing zeros', () => {
      expect(formatNumber(1.5000)).toBe('1.5');
      expect(formatNumber(1.100000)).toBe('1.1');
    });

    it('should normalize negative zero to zero', () => {
      expect(formatNumber(-0)).toBe('0');
    });

    it('should handle infinite values', () => {
      expect(formatNumber(Infinity)).toBe('0');
      expect(formatNumber(-Infinity)).toBe('0');
    });

    it('should handle NaN values', () => {
      expect(formatNumber(NaN)).toBe('0');
    });

    it('should round to 6 decimal places', () => {
      expect(formatNumber(1.123456789)).toBe('1.123457');
    });
  });

  // ============================================================================
  // buildSegmentWedgePath Tests
  // ============================================================================

  describe('buildSegmentWedgePath', () => {
    const cx = 100;
    const cy = 100;
    const radius = 50;

    it('should build a valid SVG path for a wedge', () => {
      const path = buildSegmentWedgePath(cx, cy, radius, 0, Math.PI / 2);
      expect(path).toContain('M 100 100');
      expect(path).toContain('L');
      expect(path).toContain('A');
      expect(path).toContain('Z');
    });

    it('should use large arc flag for angles > PI', () => {
      const path = buildSegmentWedgePath(cx, cy, radius, 0, Math.PI + 0.1);
      expect(path).toContain('1 1'); // large arc flag = 1
    });

    it('should use small arc flag for angles <= PI', () => {
      const path = buildSegmentWedgePath(cx, cy, radius, 0, Math.PI - 0.1);
      expect(path).toContain('0 1'); // large arc flag = 0
    });

    it('should handle negative angles', () => {
      const path = buildSegmentWedgePath(cx, cy, radius, -Math.PI / 2, Math.PI / 2);
      expect(path).toContain('M');
      expect(path).toContain('Z');
    });

    it('should handle full circle (TAU)', () => {
      const path = buildSegmentWedgePath(cx, cy, radius, 0, Math.PI * 2);
      expect(path).toContain('1 1'); // large arc flag = 1
    });
  });

  // ============================================================================
  // buildSegmentRingPath Tests
  // ============================================================================

  describe('buildSegmentRingPath', () => {
    const cx = 100;
    const cy = 100;
    const innerRadius = 30;
    const outerRadius = 50;

    it('should build a valid SVG path for a ring segment', () => {
      const path = buildSegmentRingPath(cx, cy, innerRadius, outerRadius, 0, Math.PI / 2);
      expect(path).toContain('M');
      expect(path).toContain('L');
      expect(path).toContain('A');
      expect(path).toContain('Z');
    });

    it('should use large arc flag for angles > PI', () => {
      const path = buildSegmentRingPath(cx, cy, innerRadius, outerRadius, 0, Math.PI + 0.1);
      expect(path).toContain('1 1'); // large arc flag for outer arc
      expect(path).toContain('1 0'); // large arc flag for inner arc (reversed)
    });

    it('should use small arc flag for angles <= PI', () => {
      const path = buildSegmentRingPath(cx, cy, innerRadius, outerRadius, 0, Math.PI - 0.1);
      expect(path).toContain('0 1'); // small arc flag
    });

    it('should handle negative angles', () => {
      const path = buildSegmentRingPath(cx, cy, innerRadius, outerRadius, -Math.PI / 2, Math.PI / 2);
      expect(path).toContain('M');
      expect(path).toContain('Z');
    });

    it('should create path with both inner and outer arcs', () => {
      const path = buildSegmentRingPath(cx, cy, innerRadius, outerRadius, 0, Math.PI / 4);
      const arcCount = (path.match(/A /g) || []).length;
      expect(arcCount).toBe(2); // One outer arc, one inner arc
    });
  });

  // ============================================================================
  // computeWedgeBounds Tests
  // ============================================================================

  describe('computeWedgeBounds', () => {
    const cx = 100;
    const cy = 100;
    const radius = 50;

    it('should compute bounds for a simple wedge', () => {
      const bounds = computeWedgeBounds(cx, cy, radius, 0, Math.PI / 2);
      expect(bounds.minX).toBeLessThanOrEqual(cx);
      expect(bounds.minY).toBeLessThanOrEqual(cy);
      expect(bounds.width).toBeGreaterThan(0);
      expect(bounds.height).toBeGreaterThan(0);
    });

    it('should include center point in bounds', () => {
      const bounds = computeWedgeBounds(cx, cy, radius, 0, Math.PI / 4);
      expect(bounds.minX).toBeLessThanOrEqual(cx);
      expect(bounds.minY).toBeLessThanOrEqual(cy);
    });

    it('should handle wedge crossing cardinal angles', () => {
      // Wedge from -PI/4 to PI/4 crosses 0° (right)
      const bounds = computeWedgeBounds(cx, cy, radius, -Math.PI / 4, Math.PI / 4);
      expect(bounds.width).toBeGreaterThan(0);
      expect(bounds.height).toBeGreaterThan(0);
    });

    it('should handle full circle', () => {
      const bounds = computeWedgeBounds(cx, cy, radius, 0, Math.PI * 2);
      expect(bounds.minX).toBeCloseTo(cx - radius, 5);
      expect(bounds.minY).toBeCloseTo(cy - radius, 5);
      expect(bounds.width).toBeCloseTo(radius * 2, 5);
      expect(bounds.height).toBeCloseTo(radius * 2, 5);
    });

    it('should normalize angles when endAngle < startAngle', () => {
      const bounds = computeWedgeBounds(cx, cy, radius, Math.PI, 0);
      expect(bounds.width).toBeGreaterThan(0);
      expect(bounds.height).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // gradientTransformToString Tests
  // ============================================================================

  describe('gradientTransformToString', () => {
    it('should convert gradient transform to SVG matrix string', () => {
      const transform: GradientTransform = [
        [1, 0, 0],
        [0, 1, 0],
      ];
      const result = gradientTransformToString(transform);
      expect(result).toBe('matrix(1 0 0 1 0 0)');
    });

    it('should format numbers correctly', () => {
      const transform: GradientTransform = [
        [1.5, 0.25, 10],
        [0.75, 2.0, 20],
      ];
      const result = gradientTransformToString(transform);
      expect(result).toBe('matrix(1.5 0.75 0.25 2 10 20)');
    });

    it('should handle negative values', () => {
      const transform: GradientTransform = [
        [-1, 0, 0],
        [0, -1, 0],
      ];
      const result = gradientTransformToString(transform);
      expect(result).toBe('matrix(-1 0 0 -1 0 0)');
    });
  });

  // ============================================================================
  // computeTemplateBounds Tests
  // ============================================================================

  describe('computeTemplateBounds', () => {
    it('should compute template bounds for standard configuration', () => {
      const bounds = computeTemplateBounds(100, 100, 50);
      expect(bounds.width).toBeGreaterThan(0);
      expect(bounds.height).toBeGreaterThan(0);
      // Center X should be approximately at the center of the wedge bounds
      expect(bounds.centerX).toBeGreaterThan(90);
      expect(bounds.centerX).toBeLessThan(130);
      // Center Y calculation depends on the template wedge geometry
      expect(bounds.centerY).toBeGreaterThan(60);
      expect(bounds.centerY).toBeLessThan(90);
    });

    it('should scale with radius', () => {
      const bounds1 = computeTemplateBounds(100, 100, 50);
      const bounds2 = computeTemplateBounds(100, 100, 100);
      expect(bounds2.width).toBeGreaterThan(bounds1.width);
      expect(bounds2.height).toBeGreaterThan(bounds1.height);
    });
  });

  // ============================================================================
  // buildGradientMatrix Tests
  // ============================================================================

  describe('buildGradientMatrix', () => {
    it('should build gradient matrix from three points', () => {
      const p0 = { x: 0, y: 0 };
      const p1 = { x: 1, y: 0 };
      const p2 = { x: 0, y: 1 };
      const matrix = buildGradientMatrix(p0, p1, p2);
      expect(matrix).toBe('matrix(1 0 0 1 0 0)');
    });

    it('should handle translated points', () => {
      const p0 = { x: 10, y: 20 };
      const p1 = { x: 11, y: 20 };
      const p2 = { x: 10, y: 21 };
      const matrix = buildGradientMatrix(p0, p1, p2);
      expect(matrix).toBe('matrix(1 0 0 1 10 20)');
    });

    it('should handle scaled points', () => {
      const p0 = { x: 0, y: 0 };
      const p1 = { x: 2, y: 0 };
      const p2 = { x: 0, y: 3 };
      const matrix = buildGradientMatrix(p0, p1, p2);
      expect(matrix).toBe('matrix(2 0 0 3 0 0)');
    });
  });

  // ============================================================================
  // fillToSvgPaint Tests
  // ============================================================================

  describe('fillToSvgPaint', () => {
    it('should return "none" for undefined fill', () => {
      expect(fillToSvgPaint(undefined)).toBe('none');
    });

    it('should return color for solid fill', () => {
      const fill: Fill = {
        type: 'solid',
        color: '#FF0000',
      };
      expect(fillToSvgPaint(fill)).toBe('#FF0000');
    });

    it('should convert hex with alpha for solid fill', () => {
      const fill: Fill = {
        type: 'solid',
        color: '#FF0000FF',
      };
      expect(fillToSvgPaint(fill)).toBe('rgba(255, 0, 0, 1)');
    });

    it('should return url reference for gradient fill with gradientId', () => {
      const fill: Fill = {
        type: 'gradient',
        gradient: {
          type: 'linear',
          rotation: 0,
          stops: [
            { color: '#FF0000', position: 0 },
            { color: '#0000FF', position: 1 },
          ],
          transform: [[1, 0, 0], [0, 1, 0]],
        },
      };
      expect(fillToSvgPaint(fill, 'gradient-1')).toBe('url(#gradient-1)');
    });

    it('should return "none" for gradient fill without gradientId', () => {
      const fill: Fill = {
        type: 'gradient',
        gradient: {
          type: 'linear',
          rotation: 0,
          stops: [
            { color: '#FF0000', position: 0 },
            { color: '#0000FF', position: 1 },
          ],
          transform: [[1, 0, 0], [0, 1, 0]],
        },
      };
      expect(fillToSvgPaint(fill)).toBe('none');
    });

    it('should return "none" for solid fill without color', () => {
      const fill: Fill = {
        type: 'solid',
      };
      expect(fillToSvgPaint(fill)).toBe('none');
    });

    it('should return "none" for gradient fill without gradient', () => {
      const fill: Fill = {
        type: 'gradient',
      };
      expect(fillToSvgPaint(fill, 'gradient-1')).toBe('none');
    });
  });

  // ============================================================================
  // createSvgGradientDef Tests
  // ============================================================================

  describe('createSvgGradientDef', () => {
    it('should create a linear gradient definition', () => {
      const gradient: Gradient = {
        type: 'linear',
        rotation: 0,
        stops: [
          { color: '#FF0000', position: 0 },
          { color: '#0000FF', position: 1 },
        ],
        transform: [[1, 0, 0], [0, 1, 0]],
      };
      const element = createSvgGradientDef(gradient, 'test-gradient', 0);
      expect(element).not.toBeNull();

      const { container } = render(<svg>{element}</svg>);
      const linearGradient = container.querySelector('linearGradient');
      expect(linearGradient).toBeTruthy();
      expect(linearGradient?.getAttribute('id')).toBe('test-gradient');
    });

    it('should apply rotation correctly', () => {
      const gradient: Gradient = {
        type: 'linear',
        rotation: 45,
        stops: [
          { color: '#FF0000', position: 0 },
          { color: '#0000FF', position: 1 },
        ],
        transform: [[1, 0, 0], [0, 1, 0]],
      };
      const element = createSvgGradientDef(gradient, 'test-gradient', 0);
      const { container } = render(<svg>{element}</svg>);
      const linearGradient = container.querySelector('linearGradient');

      // Rotation should be: gradient rotation + segment rotation + 180
      // 45 + 0 + 180 = 225
      expect(linearGradient?.getAttribute('gradientTransform')).toBe('rotate(225 0.5 0.5)');
    });

    it('should combine gradient and segment rotations', () => {
      const gradient: Gradient = {
        type: 'linear',
        rotation: 30,
        stops: [
          { color: '#FF0000', position: 0 },
          { color: '#0000FF', position: 1 },
        ],
        transform: [[1, 0, 0], [0, 1, 0]],
      };
      const element = createSvgGradientDef(gradient, 'test-gradient', 60);
      const { container } = render(<svg>{element}</svg>);
      const linearGradient = container.querySelector('linearGradient');

      // 30 + 60 + 180 = 270
      expect(linearGradient?.getAttribute('gradientTransform')).toBe('rotate(270 0.5 0.5)');
    });

    it('should create correct color stops', () => {
      const gradient: Gradient = {
        type: 'linear',
        rotation: 0,
        stops: [
          { color: '#FF0000', position: 0 },
          { color: '#00FF00', position: 0.5 },
          { color: '#0000FF', position: 1 },
        ],
        transform: [[1, 0, 0], [0, 1, 0]],
      };
      const element = createSvgGradientDef(gradient, 'test-gradient', 0);
      const { container } = render(<svg>{element}</svg>);
      const stops = container.querySelectorAll('stop');

      expect(stops).toHaveLength(3);
      expect(stops[0].getAttribute('offset')).toBe('0%');
      expect(stops[0].getAttribute('stop-color')).toBe('#FF0000');
      expect(stops[1].getAttribute('offset')).toBe('50%');
      expect(stops[1].getAttribute('stop-color')).toBe('#00FF00');
      expect(stops[2].getAttribute('offset')).toBe('100%');
      expect(stops[2].getAttribute('stop-color')).toBe('#0000FF');
    });

    it('should return null for gradient without stops', () => {
      const gradient: Gradient = {
        type: 'linear',
        rotation: 0,
        stops: [],
        transform: [[1, 0, 0], [0, 1, 0]],
      };
      const element = createSvgGradientDef(gradient, 'test-gradient', 0);
      expect(element).toBeNull();
    });

    it('should warn and return null for non-linear gradients', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const gradient: Gradient = {
        type: 'radial',
        rotation: 0,
        stops: [
          { color: '#FF0000', position: 0 },
          { color: '#0000FF', position: 1 },
        ],
        transform: [[1, 0, 0], [0, 1, 0]],
      };
      const element = createSvgGradientDef(gradient, 'test-gradient', 0);

      expect(element).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Gradient type "radial" is not supported. Only "linear" gradients are supported.'
      );

      consoleSpy.mockRestore();
    });

    it('should use objectBoundingBox units', () => {
      const gradient: Gradient = {
        type: 'linear',
        rotation: 0,
        stops: [
          { color: '#FF0000', position: 0 },
          { color: '#0000FF', position: 1 },
        ],
        transform: [[1, 0, 0], [0, 1, 0]],
      };
      const element = createSvgGradientDef(gradient, 'test-gradient', 0);
      const { container } = render(<svg>{element}</svg>);
      const linearGradient = container.querySelector('linearGradient');

      expect(linearGradient?.getAttribute('gradientUnits')).toBe('objectBoundingBox');
      expect(linearGradient?.getAttribute('x1')).toBe('0');
      expect(linearGradient?.getAttribute('y1')).toBe('0');
      expect(linearGradient?.getAttribute('x2')).toBe('1');
      expect(linearGradient?.getAttribute('y2')).toBe('0');
    });
  });

  // ============================================================================
  // describeArcPath Tests
  // ============================================================================

  describe('describeArcPath', () => {
    const cx = 100;
    const cy = 100;
    const radius = 50;

    it('should create an arc path', () => {
      const path = describeArcPath(cx, cy, radius, 0, Math.PI / 2);
      expect(path).toContain('M');
      expect(path).toContain('A');
      expect(path).not.toContain('Z'); // Arc path should not close
    });

    it('should use large arc flag for angles > PI', () => {
      const path = describeArcPath(cx, cy, radius, 0, Math.PI + 0.1);
      expect(path).toContain('1 1'); // large arc flag = 1
    });

    it('should use small arc flag for angles <= PI', () => {
      const path = describeArcPath(cx, cy, radius, 0, Math.PI - 0.1);
      expect(path).toContain('0 1'); // large arc flag = 0
    });

    it('should handle negative angles', () => {
      const path = describeArcPath(cx, cy, radius, -Math.PI / 2, Math.PI / 2);
      expect(path).toContain('M');
      expect(path).toContain('A');
    });
  });

  // ============================================================================
  // computeArcFontSize Tests
  // ============================================================================

  describe('computeArcFontSize', () => {
    it('should compute font size based on arc length and text', () => {
      const fontSize = computeArcFontSize('Hello', 100, Math.PI / 2);
      expect(fontSize).toBeGreaterThan(MIN_TEXT_FONT_SIZE);
      expect(fontSize).toBeLessThanOrEqual(36); // 100 * 0.36
    });

    it('should return MIN_TEXT_FONT_SIZE for empty text', () => {
      expect(computeArcFontSize('', 100, Math.PI / 2)).toBe(MIN_TEXT_FONT_SIZE);
    });

    it('should return MIN_TEXT_FONT_SIZE for zero radius', () => {
      expect(computeArcFontSize('Hello', 0, Math.PI / 2)).toBe(MIN_TEXT_FONT_SIZE);
    });

    it('should return MIN_TEXT_FONT_SIZE for zero angle', () => {
      expect(computeArcFontSize('Hello', 100, 0)).toBe(MIN_TEXT_FONT_SIZE);
    });

    it('should enforce minimum font size', () => {
      const fontSize = computeArcFontSize('Very long text that should be small', 20, Math.PI / 8);
      expect(fontSize).toBeGreaterThanOrEqual(Math.max(MIN_TEXT_FONT_SIZE, 20 * 0.1));
    });

    it('should enforce maximum font size', () => {
      const fontSize = computeArcFontSize('A', 100, Math.PI * 2);
      expect(fontSize).toBeLessThanOrEqual(36); // 100 * 0.36
    });

    it('should scale font size with radius', () => {
      const fontSize1 = computeArcFontSize('Test', 50, Math.PI / 2);
      const fontSize2 = computeArcFontSize('Test', 100, Math.PI / 2);
      expect(fontSize2).toBeGreaterThan(fontSize1);
    });

    it('should scale font size with angle span', () => {
      const fontSize1 = computeArcFontSize('Test', 100, Math.PI / 4);
      const fontSize2 = computeArcFontSize('Test', 100, Math.PI / 2);
      expect(fontSize2).toBeGreaterThan(fontSize1);
    });
  });

  // ============================================================================
  // createDropShadowFilter Tests
  // ============================================================================

  describe('createDropShadowFilter', () => {
    it('should create filter with single drop shadow', () => {
      const shadows: DropShadow[] = [
        { x: 2, y: 2, blur: 4, color: '#000000' },
      ];
      const element = createDropShadowFilter('shadow-filter', shadows);
      const { container } = render(<svg>{element}</svg>);

      const filter = container.querySelector('filter');
      expect(filter?.getAttribute('id')).toBe('shadow-filter');

      const blur = container.querySelector('feGaussianBlur');
      expect(blur?.getAttribute('stdDeviation')).toBe('2'); // blur / 2
    });

    it('should create filter with multiple drop shadows', () => {
      const shadows: DropShadow[] = [
        { x: 2, y: 2, blur: 4, color: '#000000' },
        { x: 1, y: 1, blur: 2, color: '#FF0000' },
      ];
      const element = createDropShadowFilter('shadow-filter', shadows);
      const { container } = render(<svg>{element}</svg>);

      const blurs = container.querySelectorAll('feGaussianBlur');
      expect(blurs).toHaveLength(2);

      const mergeNodes = container.querySelectorAll('feMergeNode');
      expect(mergeNodes).toHaveLength(3); // 2 shadows + source graphic
    });

    it('should create empty filter for no shadows', () => {
      const element = createDropShadowFilter('shadow-filter', []);
      const { container } = render(<svg>{element}</svg>);

      const filter = container.querySelector('filter');
      expect(filter?.getAttribute('id')).toBe('shadow-filter');
      expect(filter?.children).toHaveLength(0);
    });

    it('should set correct filter region', () => {
      const shadows: DropShadow[] = [
        { x: 2, y: 2, blur: 4, color: '#000000' },
      ];
      const element = createDropShadowFilter('shadow-filter', shadows);
      const { container } = render(<svg>{element}</svg>);

      const filter = container.querySelector('filter');
      expect(filter?.getAttribute('x')).toBe('-50%');
      expect(filter?.getAttribute('y')).toBe('-50%');
      expect(filter?.getAttribute('width')).toBe('200%');
      expect(filter?.getAttribute('height')).toBe('200%');
    });

    it('should create correct shadow pipeline', () => {
      const shadows: DropShadow[] = [
        { x: 3, y: 4, blur: 6, color: '#FF0000FF' },
      ];
      const element = createDropShadowFilter('shadow-filter', shadows);
      const { container } = render(<svg>{element}</svg>);

      // Check blur
      const blur = container.querySelector('feGaussianBlur');
      expect(blur?.getAttribute('stdDeviation')).toBe('3'); // 6 / 2
      expect(blur?.getAttribute('result')).toBe('blur-0');

      // Check offset
      const offset = container.querySelector('feOffset');
      expect(offset?.getAttribute('dx')).toBe('3');
      expect(offset?.getAttribute('dy')).toBe('4');
      expect(offset?.getAttribute('result')).toBe('offset-0');

      // Check flood (color)
      const flood = container.querySelector('feFlood');
      expect(flood?.getAttribute('flood-color')).toBe('rgba(255, 0, 0, 1)');
      expect(flood?.getAttribute('result')).toBe('color-0');

      // Check composite
      const composite = container.querySelector('feComposite');
      expect(composite?.getAttribute('operator')).toBe('in');
      expect(composite?.getAttribute('result')).toBe('shadow-0');

      // Check merge includes source graphic
      const mergeNodes = container.querySelectorAll('feMergeNode');
      expect(mergeNodes[mergeNodes.length - 1].getAttribute('in')).toBe('SourceGraphic');
    });
  });
});
