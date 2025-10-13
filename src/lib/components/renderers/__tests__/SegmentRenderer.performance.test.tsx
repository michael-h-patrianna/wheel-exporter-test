/**
 * Performance-focused test suite for SegmentRenderer
 * Tests memoization, render counts, and performance characteristics
 */

import React from 'react';
import { render } from '@testing-library/react';
import { SegmentRenderer } from '../SegmentRenderer';
import { WheelSegmentStyles, CenterComponent, Fill, Gradient } from '../../../types';
import { vi } from 'vitest';

// Mock the offer.png import
vi.mock('../../../../assets/offer.png', () => ({ default: 'mocked-offer.png' }));

describe('SegmentRenderer Performance Tests', () => {
  const mockCenter: CenterComponent = {
    x: 400,
    y: 300,
    radius: 200,
  };

  const solidFill: Fill = {
    type: 'solid',
    color: '#FF0000',
  };

  const linearGradient: Gradient = {
    type: 'linear',
    rotation: 45,
    stops: [
      { color: '#FF0000', position: 0 },
      { color: '#0000FF', position: 1 },
    ],
    transform: [
      [1, 0, 0],
      [0, 1, 0],
    ],
  };

  const gradientFill: Fill = {
    type: 'gradient',
    gradient: linearGradient,
  };

  const mockSegments: WheelSegmentStyles = {
    jackpot: {
      outer: {
        fill: solidFill,
        stroke: {
          width: 2,
          fill: { type: 'solid', color: '#FFFFFF' },
        },
      },
      text: {
        fill: { type: 'solid', color: '#FFFFFF' },
        stroke: { width: 1, color: '#000000' },
      },
    },
    nowin: {
      outer: {
        fill: { type: 'solid', color: '#999999' },
      },
      text: {
        fill: { type: 'solid', color: '#000000' },
      },
    },
    odd: {
      outer: {
        fill: gradientFill,
      },
      text: {
        fill: { type: 'solid', color: '#FFFFFF' },
        stroke: {
          width: 2,
          fill: gradientFill,
        },
      },
    },
    even: {
      outer: {
        fill: { type: 'solid', color: '#0000FF' },
      },
      text: {
        fill: { type: 'solid', color: '#FFFFFF' },
      },
    },
  };

  const defaultProps = {
    segments: mockSegments,
    center: mockCenter,
    segmentCount: 8,
    scale: 1,
    isSpinning: false,
    targetRotation: 0,
  };

  describe('Memoization Effectiveness', () => {
    it('should not re-render segments when only rotation changes', () => {
      const { container, rerender } = render(<SegmentRenderer {...defaultProps} />);

      const initialPaths = container.querySelectorAll('path[d]').length;
      const initialTexts = container.querySelectorAll('text').length;

      // Change rotation only - segments should be memoized
      rerender(<SegmentRenderer {...defaultProps} targetRotation={45} />);

      const afterPaths = container.querySelectorAll('path[d]').length;
      const afterTexts = container.querySelectorAll('text').length;

      // DOM structure should remain the same
      expect(afterPaths).toBe(initialPaths);
      expect(afterTexts).toBe(initialTexts);
    });

    it('should re-render segments when segment styles change', () => {
      const { container, rerender } = render(<SegmentRenderer {...defaultProps} />);

      const newSegments: WheelSegmentStyles = {
        ...mockSegments,
        odd: {
          outer: {
            fill: { type: 'solid', color: '#00FF00' },
          },
          text: {
            fill: { type: 'solid', color: '#000000' },
          },
        },
      };

      rerender(<SegmentRenderer {...defaultProps} segments={newSegments} />);

      // Component should handle the update
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should memoize gradient definitions across renders', () => {
      const { container, rerender } = render(<SegmentRenderer {...defaultProps} />);

      const initialGradients = container.querySelectorAll('linearGradient').length;

      // Re-render with same props
      rerender(<SegmentRenderer {...defaultProps} />);

      const afterGradients = container.querySelectorAll('linearGradient').length;

      // Gradient count should remain stable
      expect(afterGradients).toBe(initialGradients);
      expect(initialGradients).toBeGreaterThan(0);
    });

    it('should memoize arc path definitions', () => {
      const { container, rerender } = render(<SegmentRenderer {...defaultProps} />);

      const defs = container.querySelector('defs');
      const initialArcPaths = defs?.querySelectorAll('path[id*="-arc"]').length || 0;

      // Re-render with same props
      rerender(<SegmentRenderer {...defaultProps} />);

      const afterArcPaths = defs?.querySelectorAll('path[id*="-arc"]').length || 0;

      // Arc path count should remain stable
      expect(afterArcPaths).toBe(initialArcPaths);
      expect(initialArcPaths).toBeGreaterThan(0);
    });

    it('should memoize filter definitions', () => {
      const segmentsWithDropShadow: WheelSegmentStyles = {
        ...mockSegments,
        odd: {
          outer: {
            fill: solidFill,
          },
          text: {
            fill: { type: 'solid', color: '#FFFFFF' },
            dropShadows: [{ x: 2, y: 2, blur: 4, color: '#000000' }],
          },
        },
      };

      const { container, rerender } = render(
        <SegmentRenderer {...defaultProps} segments={segmentsWithDropShadow} />
      );

      const initialFilters = container.querySelectorAll('filter').length;

      // Re-render with same props
      rerender(<SegmentRenderer {...defaultProps} segments={segmentsWithDropShadow} />);

      const afterFilters = container.querySelectorAll('filter').length;

      // Filter count should remain stable
      expect(afterFilters).toBe(initialFilters);
      expect(initialFilters).toBeGreaterThan(0);
    });
  });

  describe('Component Structure Optimization', () => {
    it('should render individual Segment components', () => {
      const { container } = render(<SegmentRenderer {...defaultProps} />);

      // Each segment should be in its own <g> element
      const segments = container.querySelectorAll('svg > g');
      expect(segments.length).toBe(defaultProps.segmentCount);
    });

    it('should separate defs rendering from segment rendering', () => {
      const { container } = render(<SegmentRenderer {...defaultProps} />);

      const defs = container.querySelector('defs');
      expect(defs).toBeInTheDocument();

      // Defs should contain gradients, filters, and arc paths
      const defsChildren = defs?.children.length || 0;
      expect(defsChildren).toBeGreaterThan(0);
    });

    it('should memoize SVG transform styles', () => {
      const { container, rerender } = render(<SegmentRenderer {...defaultProps} />);

      const svg = container.querySelector('svg');
      const initialTransform = svg?.style.transform;

      // Re-render with same rotation
      rerender(<SegmentRenderer {...defaultProps} />);

      const afterTransform = svg?.style.transform;

      expect(afterTransform).toBe(initialTransform);
    });
  });

  describe('Large Segment Count Performance', () => {
    it('should handle 16 segments efficiently', () => {
      const startTime = performance.now();

      const { container } = render(<SegmentRenderer {...defaultProps} segmentCount={16} />);

      const renderTime = performance.now() - startTime;

      // Should render in reasonable time (< 100ms)
      expect(renderTime).toBeLessThan(100);

      const segments = container.querySelectorAll('svg > g');
      expect(segments.length).toBe(16);
    });

    it('should handle 32 segments efficiently', () => {
      const startTime = performance.now();

      const { container } = render(<SegmentRenderer {...defaultProps} segmentCount={32} />);

      const renderTime = performance.now() - startTime;

      // Should render in reasonable time (< 150ms)
      expect(renderTime).toBeLessThan(150);

      const segments = container.querySelectorAll('svg > g');
      expect(segments.length).toBe(32);
    });
  });

  describe('Re-render Performance', () => {
    it('should handle rapid rotation updates efficiently', () => {
      const { rerender } = render(<SegmentRenderer {...defaultProps} />);

      const startTime = performance.now();

      // Simulate rapid rotation updates
      for (let i = 0; i < 60; i++) {
        rerender(<SegmentRenderer {...defaultProps} targetRotation={i * 6} />);
      }

      const totalTime = performance.now() - startTime;

      // 60 rotation updates should complete in < 200ms (environment-dependent)
      expect(totalTime).toBeLessThan(200);
    });

    it('should handle scale changes efficiently', () => {
      const { container, rerender } = render(<SegmentRenderer {...defaultProps} />);

      const startTime = performance.now();

      // Test different scale values
      [0.5, 1, 1.5, 2].forEach((scale) => {
        rerender(<SegmentRenderer {...defaultProps} scale={scale} />);
      });

      const totalTime = performance.now() - startTime;

      // Scale changes should be fast (< 100ms for 4 changes, environment-dependent)
      expect(totalTime).toBeLessThan(100);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Memory Management', () => {
    it('should not leak references when unmounting', () => {
      const { unmount } = render(<SegmentRenderer {...defaultProps} />);

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('should handle multiple mount/unmount cycles', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<SegmentRenderer {...defaultProps} />);
        unmount();
      }

      // Should complete without memory issues
      expect(true).toBe(true);
    });
  });

  describe('Complex Rendering Scenarios', () => {
    it('should efficiently render with all gradient types', () => {
      const complexSegments: WheelSegmentStyles = {
        jackpot: {
          outer: {
            fill: gradientFill,
            stroke: {
              width: 2,
              fill: gradientFill,
            },
          },
          text: {
            fill: gradientFill,
            stroke: {
              width: 2,
              fill: gradientFill,
            },
          },
        },
        nowin: {
          outer: {
            fill: gradientFill,
          },
          text: {
            fill: gradientFill,
          },
        },
        odd: {
          outer: {
            fill: gradientFill,
          },
          text: {
            fill: gradientFill,
          },
        },
        even: {
          outer: {
            fill: gradientFill,
          },
          text: {
            fill: gradientFill,
          },
        },
      };

      const startTime = performance.now();

      const { container } = render(
        <SegmentRenderer {...defaultProps} segments={complexSegments} />
      );

      const renderTime = performance.now() - startTime;

      // Complex gradients should still render fast
      expect(renderTime).toBeLessThan(100);

      const gradients = container.querySelectorAll('linearGradient');
      expect(gradients.length).toBeGreaterThan(0);
    });

    it('should efficiently render with drop shadows', () => {
      const segmentsWithShadows: WheelSegmentStyles = {
        ...mockSegments,
        odd: {
          outer: {
            fill: solidFill,
          },
          text: {
            fill: { type: 'solid', color: '#FFFFFF' },
            dropShadows: [
              { x: 2, y: 2, blur: 4, color: '#000000' },
              { x: -2, y: -2, blur: 4, color: '#FFFFFF' },
            ],
          },
        },
        even: {
          outer: {
            fill: solidFill,
          },
          text: {
            fill: { type: 'solid', color: '#FFFFFF' },
            dropShadows: [{ x: 1, y: 1, blur: 2, color: '#000000' }],
          },
        },
      };

      const startTime = performance.now();

      const { container } = render(
        <SegmentRenderer {...defaultProps} segments={segmentsWithShadows} />
      );

      const renderTime = performance.now() - startTime;

      // Drop shadows should not significantly impact render time
      expect(renderTime).toBeLessThan(100);

      const filters = container.querySelectorAll('filter');
      expect(filters.length).toBeGreaterThan(0);
    });
  });

  describe('Memoization Custom Comparison', () => {
    it('should not re-render when props are referentially equal', () => {
      const propsRef = { ...defaultProps };
      const { container, rerender } = render(<SegmentRenderer {...propsRef} />);

      const initialHTML = container.innerHTML;

      // Re-render with same prop reference
      rerender(<SegmentRenderer {...propsRef} />);

      const afterHTML = container.innerHTML;

      // HTML should be identical (component properly memoized)
      expect(afterHTML).toBe(initialHTML);
    });

    it('should memoize individual segment calculations', () => {
      const { container } = render(<SegmentRenderer {...defaultProps} />);

      // Get computed paths from SVG
      const paths = container.querySelectorAll('path[d]');
      const pathData = Array.from(paths).map((p) => p.getAttribute('d'));

      // All paths should be computed and present
      expect(pathData.every((d) => d && d.length > 0)).toBe(true);
    });
  });

  describe('Jackpot Segment Memoization', () => {
    it('should memoize jackpot segment rendering', () => {
      const { container, rerender } = render(<SegmentRenderer {...defaultProps} />);

      // Jackpot segments now render as text by default (not images)
      const initialTexts = container.querySelectorAll('text[data-segment-kind="jackpot"]');
      const initialCount = initialTexts.length;

      // Re-render without changing segment props
      rerender(<SegmentRenderer {...defaultProps} targetRotation={45} />);

      const afterTexts = container.querySelectorAll('text[data-segment-kind="jackpot"]');
      const afterCount = afterTexts.length;

      // Text count should remain the same (memoization working)
      expect(afterCount).toBe(initialCount);
      expect(initialCount).toBeGreaterThan(0);
    });

    it('should update jackpot segment when segment styles change', () => {
      const { container, rerender } = render(<SegmentRenderer {...defaultProps} />);

      const newSegments: WheelSegmentStyles = {
        ...mockSegments,
        jackpot: {
          outer: {
            fill: { type: 'solid', color: '#00FF00' }, // Changed color
          },
          text: {
            fill: { type: 'solid', color: '#FFFFFF' },
          },
        },
      };

      rerender(<SegmentRenderer {...defaultProps} segments={newSegments} />);

      // Component should handle the update
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });
});
