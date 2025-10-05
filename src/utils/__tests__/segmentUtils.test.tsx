/**
 * Unit tests for segmentUtils
 */

import React from 'react';
import {
  colorToCSS,
  formatNumber,
  buildSegmentWedgePath,
  buildSegmentRingPath,
  computeWedgeBounds,
  gradientTransformToString,
  buildGradientMatrix,
  fillToSvgPaint,
  createSvgGradientDef,
  computeTemplateBounds,
  SEGMENT_KINDS,
} from '../segmentUtils';
import { createMockGradient, createMockFill } from '../testHelpers';

describe('segmentUtils', () => {
  describe('colorToCSS', () => {
    it('should pass through rgb/rgba strings unchanged', () => {
      expect(colorToCSS('rgb(255, 0, 0)')).toBe('rgb(255, 0, 0)');
      expect(colorToCSS('rgba(255, 0, 0, 0.5)')).toBe('rgba(255, 0, 0, 0.5)');
    });

    it('should return hex colors unchanged (6 chars)', () => {
      expect(colorToCSS('#FF0000')).toBe('#FF0000');
      expect(colorToCSS('#00FF00')).toBe('#00FF00');
    });

    it('should convert 8-char hex to rgba', () => {
      const result = colorToCSS('#FF000080');
      expect(result).toBe('rgba(255, 0, 0, 0.5019607843137255)');
    });

    it('should handle full opacity in 8-char hex', () => {
      const result = colorToCSS('#FF0000FF');
      expect(result).toBe('rgba(255, 0, 0, 1)');
    });

    it('should return non-hex/rgb colors as-is', () => {
      expect(colorToCSS('red')).toBe('red');
      expect(colorToCSS('transparent')).toBe('transparent');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with minimal precision', () => {
      expect(formatNumber(1.5)).toBe('1.5');
      expect(formatNumber(1.0)).toBe('1');
      expect(formatNumber(0.123456789)).toBe('0.123457');
    });

    it('should handle integers', () => {
      expect(formatNumber(42)).toBe('42');
      expect(formatNumber(0)).toBe('0');
    });

    it('should normalize -0 to 0', () => {
      expect(formatNumber(-0)).toBe('0');
    });

    it('should handle non-finite numbers', () => {
      expect(formatNumber(Infinity)).toBe('0');
      expect(formatNumber(-Infinity)).toBe('0');
      expect(formatNumber(NaN)).toBe('0');
    });

    it('should remove trailing zeros', () => {
      expect(formatNumber(1.50000)).toBe('1.5');
      expect(formatNumber(1.100000)).toBe('1.1');
    });
  });

  describe('buildSegmentWedgePath', () => {
    it('should create valid SVG path for wedge segment', () => {
      const path = buildSegmentWedgePath(100, 100, 50, 0, Math.PI / 2);
      expect(path).toContain('M 100 100'); // Start at center
      expect(path).toContain('L'); // Line to start of arc
      expect(path).toContain('A 50 50'); // Arc with radius 50
      expect(path).toContain('Z'); // Close path
    });

    it('should handle different angles', () => {
      const path = buildSegmentWedgePath(100, 100, 50, Math.PI, Math.PI * 1.5);
      expect(path).toBeDefined();
      expect(typeof path).toBe('string');
    });

    it('should use large arc flag correctly', () => {
      const largePath = buildSegmentWedgePath(100, 100, 50, 0, Math.PI * 1.5);
      expect(largePath).toContain('0 1'); // large arc flag = 1

      const smallPath = buildSegmentWedgePath(100, 100, 50, 0, Math.PI * 0.5);
      expect(smallPath).toContain('0 0'); // large arc flag = 0
    });
  });

  describe('buildSegmentRingPath', () => {
    it('should create valid SVG path for ring segment', () => {
      const path = buildSegmentRingPath(100, 100, 30, 50, 0, Math.PI / 2);
      expect(path).toContain('M'); // Move to start
      expect(path).toContain('L'); // Line commands
      expect(path).toContain('A 50 50'); // Outer arc
      expect(path).toContain('A 30 30'); // Inner arc
      expect(path).toContain('Z'); // Close path
    });

    it('should handle different radii', () => {
      const path = buildSegmentRingPath(100, 100, 20, 80, Math.PI, Math.PI * 1.5);
      expect(path).toBeDefined();
      expect(typeof path).toBe('string');
    });
  });

  describe('computeWedgeBounds', () => {
    it('should compute bounding box for wedge segment', () => {
      const bounds = computeWedgeBounds(100, 100, 50, 0, Math.PI / 2);
      expect(bounds.minX).toBeDefined();
      expect(bounds.minY).toBeDefined();
      expect(bounds.width).toBeGreaterThan(0);
      expect(bounds.height).toBeGreaterThan(0);
    });

    it('should include center point in bounds', () => {
      const bounds = computeWedgeBounds(100, 100, 50, 0, Math.PI / 4);
      expect(bounds.minX).toBeLessThanOrEqual(100);
      expect(bounds.minY).toBeLessThanOrEqual(100);
    });

    it('should handle full circle', () => {
      const bounds = computeWedgeBounds(100, 100, 50, 0, Math.PI * 2);
      expect(bounds.width).toBeCloseTo(100, 1);
      expect(bounds.height).toBeCloseTo(100, 1);
    });
  });

  describe('gradientTransformToString', () => {
    it('should convert transform matrix to SVG string', () => {
      const transform: [[number, number, number], [number, number, number]] = [
        [1, 0, 10],
        [0, 1, 20],
      ];
      const result = gradientTransformToString(transform);
      expect(result).toBe('matrix(1 0 0 1 10 20)');
    });

    it('should handle rotation matrix', () => {
      const angle = Math.PI / 4;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const transform: [[number, number, number], [number, number, number]] = [
        [cos, -sin, 0],
        [sin, cos, 0],
      ];
      const result = gradientTransformToString(transform);
      expect(result).toContain('matrix(');
      expect(result).toContain(formatNumber(cos));
      expect(result).toContain(formatNumber(sin));
    });
  });

  describe('buildGradientMatrix', () => {
    it('should build affine transform matrix from three points', () => {
      const p0 = { x: 0, y: 0 };
      const p1 = { x: 1, y: 0 };
      const p2 = { x: 0, y: 1 };
      const result = buildGradientMatrix(p0, p1, p2);
      expect(result).toBe('matrix(1 0 0 1 0 0)');
    });

    it('should handle translated points', () => {
      const p0 = { x: 10, y: 20 };
      const p1 = { x: 11, y: 20 };
      const p2 = { x: 10, y: 21 };
      const result = buildGradientMatrix(p0, p1, p2);
      expect(result).toBe('matrix(1 0 0 1 10 20)');
    });

    it('should handle scaled points', () => {
      const p0 = { x: 0, y: 0 };
      const p1 = { x: 2, y: 0 };
      const p2 = { x: 0, y: 3 };
      const result = buildGradientMatrix(p0, p1, p2);
      expect(result).toBe('matrix(2 0 0 3 0 0)');
    });
  });

  describe('fillToSvgPaint', () => {
    it('should return "none" for undefined fill', () => {
      expect(fillToSvgPaint(undefined)).toBe('none');
    });

    it('should return color for solid fill', () => {
      const fill = createMockFill('solid');
      expect(fillToSvgPaint(fill)).toBe('#FF0000');
    });

    it('should return gradient URL for gradient fill', () => {
      const fill = createMockFill('gradient');
      expect(fillToSvgPaint(fill, 'gradient-id')).toBe('url(#gradient-id)');
    });

    it('should return "none" for gradient fill without id', () => {
      const fill = createMockFill('gradient');
      expect(fillToSvgPaint(fill)).toBe('none');
    });
  });

  describe('createSvgGradientDef', () => {
    it('should create linear gradient element', () => {
      const gradient = createMockGradient();
      const result = createSvgGradientDef(gradient, 'test-gradient', 0);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('linearGradient');
      expect(result?.props.id).toBe('test-gradient');
    });

    it('should include color stops', () => {
      const gradient = createMockGradient({
        stops: [
          { color: '#FF0000', position: 0 },
          { color: '#00FF00', position: 0.5 },
          { color: '#0000FF', position: 1 },
        ],
      });
      const result = createSvgGradientDef(gradient, 'test-gradient', 0);

      expect(result?.props.children).toHaveLength(3);
    });

    it('should apply rotation transform', () => {
      const gradient = createMockGradient({ rotation: 45 });
      const result = createSvgGradientDef(gradient, 'test-gradient', 0);

      expect(result?.props.gradientTransform).toContain('rotate');
      // Should include gradient rotation + 180° flip
      expect(result?.props.gradientTransform).toContain('225'); // 45 + 180
    });

    it('should combine segment rotation with gradient rotation', () => {
      const gradient = createMockGradient({ rotation: 45 });
      const result = createSvgGradientDef(gradient, 'test-gradient', 90);

      // Should be: 45 (gradient) + 90 (segment) + 180 (flip) = 315
      expect(result?.props.gradientTransform).toContain('315');
    });

    it('should return null for non-linear gradients', () => {
      const gradient = createMockGradient({ type: 'radial' });
      const result = createSvgGradientDef(gradient, 'test-gradient', 0);

      expect(result).toBeNull();
    });

    it('should return null when no stops', () => {
      const gradient = createMockGradient({ stops: [] });
      const result = createSvgGradientDef(gradient, 'test-gradient', 0);

      expect(result).toBeNull();
    });

    it('should warn for unsupported gradient types', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const gradient = createMockGradient({ type: 'angular' });
      createSvgGradientDef(gradient, 'test-gradient', 0);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Gradient type "angular" is not supported')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('computeTemplateBounds', () => {
    it('should compute bounds for template wedge', () => {
      const bounds = computeTemplateBounds(100, 100, 50);

      expect(bounds.width).toBeGreaterThan(0);
      expect(bounds.height).toBeGreaterThan(0);
      expect(bounds.centerX).toBeDefined();
      expect(bounds.centerY).toBeDefined();
    });

    it('should scale with radius', () => {
      const bounds1 = computeTemplateBounds(100, 100, 50);
      const bounds2 = computeTemplateBounds(100, 100, 100);

      expect(bounds2.width).toBeGreaterThan(bounds1.width);
      expect(bounds2.height).toBeGreaterThan(bounds1.height);
    });
  });

  describe('SEGMENT_KINDS', () => {
    it('should have correct segment order', () => {
      expect(SEGMENT_KINDS).toEqual([
        'jackpot',
        'nowin',
        'odd',
        'even',
        'odd',
        'even',
        'odd',
        'even',
      ]);
    });

    it('should have 8 segments', () => {
      expect(SEGMENT_KINDS).toHaveLength(8);
    });
  });
});
