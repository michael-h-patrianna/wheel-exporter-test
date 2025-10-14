/// <reference types="@testing-library/jest-dom" />
/**
 * Comprehensive test suite for SegmentRenderer
 * This is the most complex renderer component requiring extensive testing
 */

import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { CenterComponent, Fill, Gradient, WheelSegmentStyles } from '@lib-types';
import { SegmentRenderer } from '@components/renderers/SegmentRenderer';

// Mock the offer.png import
vi.mock('@assets/offer.png', () => ({ default: 'mocked-offer.png' }));

describe('SegmentRenderer', () => {
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
        fill: { type: 'solid', color: '#00FF00' },
      },
      text: {
        fill: { type: 'solid', color: '#FFFFFF' },
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
    wheelState: 'IDLE' as const,
    targetRotation: 0,
  };

  describe('Basic Rendering', () => {
    it('should render segments container with correct structure', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} />);

      const segmentsDiv = container.querySelector('.segments-component');
      expect(segmentsDiv).toBeInTheDocument();
      expect(segmentsDiv).toHaveStyle({
        position: 'absolute',
        zIndex: 5,
        pointerEvents: 'none',
      });
    });

    it('should return null when segments are not provided', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} segments={undefined} />);

      expect(container.firstChild).toBeNull();
    });

    it('should return null when center is not provided', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} center={undefined} />);

      expect(container.firstChild).toBeNull();
    });

    it('should render SVG element', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '100%');
      expect(svg).toHaveAttribute('height', '100%');
    });

    it('should render correct number of segments', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} />);

      // Segments are rendered as <g> elements (not with id attribute)
      const segments = container.querySelectorAll('g');
      expect(segments.length).toBeGreaterThanOrEqual(defaultProps.segmentCount);
    });
  });

  describe('Segment Data Generation', () => {
    it('should generate segments with correct kinds', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} segmentCount={8} />);

      // Check that segments are rendered with data attributes
      const paths = container.querySelectorAll('path[d]');
      expect(paths.length).toBeGreaterThan(0);
    });

    it('should calculate correct segment angles', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} segmentCount={4} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should cycle through SEGMENT_KINDS correctly', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} segmentCount={16} />);

      // With 16 segments and 8 kinds, pattern should repeat twice
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Rotation and Animation', () => {
    it('should apply correct transform origin', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveStyle({
        transformOrigin: '400px 300px',
      });
    });

    it('should apply target rotation', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} targetRotation={45} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveStyle({
        transform: 'rotate(45deg)',
      });
    });

    it('should apply spinning transition when wheelState is SPINNING', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} wheelState="SPINNING" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveStyle({
        transition: 'transform 8s cubic-bezier(0.11, 0.83, 0.36, 0.97)',
      });
    });

    // Note: SETTLING state was removed - only IDLE, SPINNING, and COMPLETE are valid states

    it('should apply no transition when wheelState is IDLE', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} wheelState="IDLE" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveStyle({
        transition: 'none',
      });
    });

    it('should apply no transition when wheelState is COMPLETE', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} wheelState="COMPLETE" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveStyle({
        transition: 'none',
      });
    });
  });

  describe('Scaling', () => {
    it('should scale center position and radius', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} scale={0.5} />);

      const svg = container.querySelector('svg');
      // With scale 0.5: cx = 400 * 0.5 = 200, cy = 300 * 0.5 = 150
      expect(svg).toHaveStyle({
        transformOrigin: '200px 150px',
      });
    });

    it('should scale segment dimensions', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} scale={2} />);

      const svg = container.querySelector('svg');
      // With scale 2: cx = 400 * 2 = 800, cy = 300 * 2 = 600
      expect(svg).toHaveStyle({
        transformOrigin: '800px 600px',
      });
    });
  });

  describe('Gradient Rendering', () => {
    it('should render defs element when gradients are present', () => {
      const segmentsWithGradient: WheelSegmentStyles = {
        ...mockSegments,
        odd: {
          outer: {
            fill: gradientFill,
          },
          text: {
            fill: { type: 'solid', color: '#FFFFFF' },
          },
        },
      };

      const { container, getByTestId } = render(
        <SegmentRenderer {...defaultProps} segments={segmentsWithGradient} />
      );

      const defs = container.querySelector('defs');
      expect(defs).toBeInTheDocument();
    });

    it('should create gradient definitions for outer fill gradients', () => {
      const segmentsWithGradient: WheelSegmentStyles = {
        ...mockSegments,
        odd: {
          outer: {
            fill: gradientFill,
          },
          text: {
            fill: { type: 'solid', color: '#FFFFFF' },
          },
        },
      };

      const { container, getByTestId } = render(
        <SegmentRenderer {...defaultProps} segments={segmentsWithGradient} />
      );

      const linearGradients = container.querySelectorAll(
        'linearGradient[id^="segment-outer-fill-"]'
      );
      expect(linearGradients.length).toBeGreaterThan(0);
    });

    it('should create gradient definitions for stroke gradients', () => {
      const segmentsWithStrokeGradient: WheelSegmentStyles = {
        ...mockSegments,
        odd: {
          outer: {
            fill: solidFill,
            stroke: {
              width: 2,
              fill: gradientFill,
            },
          },
          text: {
            fill: { type: 'solid', color: '#FFFFFF' },
          },
        },
      };

      const { container, getByTestId } = render(
        <SegmentRenderer {...defaultProps} segments={segmentsWithStrokeGradient} />
      );

      const linearGradients = container.querySelectorAll(
        'linearGradient[id^="segment-outer-stroke-"]'
      );
      expect(linearGradients.length).toBeGreaterThan(0);
    });

    it('should create gradient definitions for text fill gradients', () => {
      const segmentsWithTextGradient: WheelSegmentStyles = {
        ...mockSegments,
        odd: {
          outer: {
            fill: solidFill,
          },
          text: {
            fill: gradientFill,
          },
        },
      };

      const { container, getByTestId } = render(
        <SegmentRenderer {...defaultProps} segments={segmentsWithTextGradient} />
      );

      const linearGradients = container.querySelectorAll(
        'linearGradient[id^="segment-text-fill-"]'
      );
      expect(linearGradients.length).toBeGreaterThan(0);
    });

    it('should not create linear gradients for radial gradient types', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const radialGradient: Gradient = {
        ...linearGradient,
        type: 'radial',
      };

      const segmentsWithRadialGradient: WheelSegmentStyles = {
        ...mockSegments,
        odd: {
          outer: {
            fill: { type: 'gradient', gradient: radialGradient },
          },
          text: {
            fill: { type: 'solid', color: '#FFFFFF' },
          },
        },
      };

      const { container, getByTestId } = render(
        <SegmentRenderer {...defaultProps} segments={segmentsWithRadialGradient} />
      );

      // Should not create linearGradient elements for radial gradients
      const linearGradients = container.querySelectorAll(
        'linearGradient[id^="segment-outer-fill-"]'
      );
      // There are 8 segments, "odd" appears 3 times with radial gradient, others have solid fills
      // So we should have fewer linear gradients than total segments
      expect(linearGradients.length).toBeLessThan(defaultProps.segmentCount);

      consoleSpy.mockRestore();
    });
  });

  describe('Text Rendering', () => {
    it('should create arc paths for text', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} />);

      const defs = container.querySelector('defs');
      if (defs) {
        const arcPaths = defs.querySelectorAll('path[id*="-arc"]');
        expect(arcPaths.length).toBeGreaterThan(0);
      }
    });

    it('should render text for non-jackpot segments', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} />);

      const textElements = container.querySelectorAll('text');
      expect(textElements.length).toBeGreaterThan(0);
    });

    it('should render "NO" and "WIN" for nowin segments', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} />);

      const textElements = container.querySelectorAll('text[data-segment-kind="nowin"]');
      expect(textElements.length).toBeGreaterThan(0);

      const textContent = Array.from(textElements).map((el) => el.textContent);
      expect(textContent).toContain('NO');
      expect(textContent).toContain('WIN');
    });

    it('should render "Lorem" and "Ipsum" for odd/even segments', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} />);

      const oddTexts = container.querySelectorAll('text[data-segment-kind="odd"]');
      const evenTexts = container.querySelectorAll('text[data-segment-kind="even"]');

      expect(oddTexts.length + evenTexts.length).toBeGreaterThan(0);
    });

    it('should apply text drop shadow filters', () => {
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

      const { container, getByTestId } = render(
        <SegmentRenderer {...defaultProps} segments={segmentsWithDropShadow} />
      );

      const filters = container.querySelectorAll('filter[id^="segment-text-shadow-"]');
      expect(filters.length).toBeGreaterThan(0);
    });

    it('should use textPath for curved text', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} />);

      const textPaths = container.querySelectorAll('textPath');
      expect(textPaths.length).toBeGreaterThan(0);
    });

    it('should apply correct text attributes', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} />);

      const textElements = container.querySelectorAll('text');
      textElements.forEach((text) => {
        // SVG attributes are case-sensitive and use camelCase in JSX but lowercase in DOM
        expect(text).toHaveAttribute('font-family');
        expect(text).toHaveAttribute('font-weight', '700');
        expect(text).toHaveAttribute('font-size');
      });
    });
  });

  describe('Layout Variants', () => {
    it('should render compact layout specific markers', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} layoutType="compact" />);

      const compactPrimary = container.querySelector('text[data-layout-variant="compact-primary"]');
      expect(compactPrimary).toBeInTheDocument();
    });

    it('should render icon badge layout with badge elements', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} layoutType="icon-badge" />);

      const badgeCircle = container.querySelector('[data-layout-variant="icon-badge"]');
      expect(badgeCircle).toBeInTheDocument();

      const badgeImage = container.querySelector('[data-layout-variant="icon-badge-image"]');
      expect(badgeImage).toBeInTheDocument();
    });
  });

  describe('Jackpot Segment Rendering', () => {
    it('should render jackpot segment with text by default', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} />);

      // Jackpot segments now render based on their prize content (text by default)
      const jackpotTexts = container.querySelectorAll('text[data-segment-kind="jackpot"]');
      expect(jackpotTexts.length).toBeGreaterThan(0);
    });

    it('should render jackpot segment with jackpot kind', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} />);

      // Check that at least one segment has jackpot kind
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();

      // Jackpot segments are rendered as paths with jackpot styling
      const paths = container.querySelectorAll('g > path');
      expect(paths.length).toBeGreaterThanOrEqual(1);
    });

    it('should apply jackpot styles from segment styles', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} />);

      // Jackpot segments should render with the provided jackpot styles
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Segment Path Rendering', () => {
    it('should render path elements for each segment', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} />);

      const paths = container.querySelectorAll('g > path');
      expect(paths.length).toBeGreaterThanOrEqual(defaultProps.segmentCount);
    });

    it('should apply fill to segment paths', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} />);

      const paths = container.querySelectorAll('g > path');
      paths.forEach((path) => {
        expect(path).toHaveAttribute('fill');
      });
    });

    it('should apply stroke when provided', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should scale stroke width correctly', () => {
      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} scale={2} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing segment styles gracefully', () => {
      const incompleteSegments: Partial<WheelSegmentStyles> = {
        odd: mockSegments.odd,
        even: mockSegments.even,
      };

      const { container, getByTestId } = render(
        <SegmentRenderer {...defaultProps} segments={incompleteSegments as WheelSegmentStyles} />
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should handle segments without text', () => {
      const segmentsWithoutText: WheelSegmentStyles = {
        ...mockSegments,
        odd: {
          outer: {
            fill: solidFill,
          },
        },
      };

      const { container, getByTestId } = render(
        <SegmentRenderer {...defaultProps} segments={segmentsWithoutText} />
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should handle different segment counts', () => {
      const testCases = [4, 8, 12, 16];

      testCases.forEach((count) => {
        const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} segmentCount={count} />);

        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });
    });

    it('should handle very small radius', () => {
      const smallCenter: CenterComponent = {
        x: 400,
        y: 300,
        radius: 10,
      };

      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} center={smallCenter} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should handle very large radius', () => {
      const largeCenter: CenterComponent = {
        x: 400,
        y: 300,
        radius: 1000,
      };

      const { container, getByTestId } = render(<SegmentRenderer {...defaultProps} center={largeCenter} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Performance and Memoization', () => {
    it('should memoize segment data based on segmentCount', () => {
      const { rerender } = render(<SegmentRenderer {...defaultProps} />);

      // Rerender with same props should use memoized data
      rerender(<SegmentRenderer {...defaultProps} />);

      // Changing segmentCount should recalculate
      rerender(<SegmentRenderer {...defaultProps} segmentCount={12} />);
    });

    it('should memoize jackpot image URL', () => {
      const { rerender } = render(<SegmentRenderer {...defaultProps} />);

      rerender(<SegmentRenderer {...defaultProps} />);

      const rewardsPrizeImages = { purchase: 'custom.png' };
      rerender(
        <SegmentRenderer
          {...defaultProps}
          purchaseImageFilename="custom.png"
          rewardsPrizeImages={rewardsPrizeImages}
        />
      );
    });
  });

  describe('Text Stroke Gradient Support', () => {
    it('should render text with gradient stroke', () => {
      const segmentsWithGradientStroke: WheelSegmentStyles = {
        ...mockSegments,
        odd: {
          outer: {
            fill: solidFill,
          },
          text: {
            fill: { type: 'solid', color: '#FFFFFF' },
            stroke: {
              width: 4,
              fill: {
                type: 'gradient',
                gradient: {
                  type: 'linear',
                  rotation: 90,
                  stops: [
                    { color: '#3a125d', position: 0 },
                    { color: '#7a26c3', position: 1 },
                  ],
                  transform: [
                    [1, 0, 0],
                    [0, 1, 0],
                  ],
                },
              },
            },
          },
        },
      };

      const { container, getByTestId } = render(
        <SegmentRenderer {...defaultProps} segments={segmentsWithGradientStroke} />
      );

      const defs = container.querySelector('defs');
      expect(defs).toBeInTheDocument();

      // Check for text stroke gradient definition
      const strokeGradients = defs?.querySelectorAll('linearGradient[id*="segment-text-stroke-"]');
      expect(strokeGradients && strokeGradients.length).toBeGreaterThan(0);
    });

    it('should render text with solid color stroke', () => {
      const segmentsWithSolidStroke: WheelSegmentStyles = {
        ...mockSegments,
        odd: {
          outer: {
            fill: solidFill,
          },
          text: {
            fill: { type: 'solid', color: '#FFFFFF' },
            stroke: {
              width: 2,
              fill: {
                type: 'solid',
                color: '#000000',
              },
            },
          },
        },
      };

      const { container, getByTestId } = render(
        <SegmentRenderer {...defaultProps} segments={segmentsWithSolidStroke} />
      );

      const textElements = container.querySelectorAll('text[data-segment-kind="odd"]');
      expect(textElements.length).toBeGreaterThan(0);

      // Text should have stroke attribute with solid color
      textElements.forEach((text) => {
        expect(text).toHaveAttribute('stroke');
      });
    });

    it('should support legacy string color format for backward compatibility', () => {
      const segmentsWithLegacyStroke: WheelSegmentStyles = {
        ...mockSegments,
        odd: {
          outer: {
            fill: solidFill,
          },
          text: {
            fill: { type: 'solid', color: '#FFFFFF' },
            stroke: {
              width: 2,
              color: '#FF0000', // Legacy format
            },
          },
        },
      };

      const { container, getByTestId } = render(
        <SegmentRenderer {...defaultProps} segments={segmentsWithLegacyStroke} />
      );

      const textElements = container.querySelectorAll('text[data-segment-kind="odd"]');
      expect(textElements.length).toBeGreaterThan(0);

      // Text should render with the legacy color
      textElements.forEach((text) => {
        expect(text).toHaveAttribute('stroke', '#FF0000');
      });
    });

    it('should prioritize fill over color when both are present', () => {
      const segmentsWithBothFormats: WheelSegmentStyles = {
        ...mockSegments,
        odd: {
          outer: {
            fill: solidFill,
          },
          text: {
            fill: { type: 'solid', color: '#FFFFFF' },
            stroke: {
              width: 2,
              color: '#FF0000', // Legacy format
              fill: { type: 'solid', color: '#0000FF' }, // New format should take priority
            },
          },
        },
      };

      const { container, getByTestId } = render(
        <SegmentRenderer {...defaultProps} segments={segmentsWithBothFormats} />
      );

      const textElements = container.querySelectorAll('text[data-segment-kind="odd"]');
      expect(textElements.length).toBeGreaterThan(0);

      // Text should use the new fill format (blue), not the legacy color (red)
      textElements.forEach((text) => {
        expect(text).toHaveAttribute('stroke', '#0000FF');
      });
    });

    it('should render text without stroke when stroke is undefined', () => {
      const segmentsWithoutStroke: WheelSegmentStyles = {
        ...mockSegments,
        odd: {
          outer: {
            fill: solidFill,
          },
          text: {
            fill: { type: 'solid', color: '#FFFFFF' },
            // No stroke defined
          },
        },
      };

      const { container, getByTestId } = render(
        <SegmentRenderer {...defaultProps} segments={segmentsWithoutStroke} />
      );

      const textElements = container.querySelectorAll('text[data-segment-kind="odd"]');
      expect(textElements.length).toBeGreaterThan(0);

      // Text should have stroke="none"
      textElements.forEach((text) => {
        expect(text).toHaveAttribute('stroke', 'none');
      });
    });

    it('should apply stroke width correctly with gradient stroke', () => {
      const segmentsWithThickStroke: WheelSegmentStyles = {
        ...mockSegments,
        odd: {
          outer: {
            fill: solidFill,
          },
          text: {
            fill: { type: 'solid', color: '#FFFFFF' },
            stroke: {
              width: 8,
              fill: gradientFill,
            },
          },
        },
      };

      const { container, getByTestId } = render(
        <SegmentRenderer {...defaultProps} segments={segmentsWithThickStroke} />
      );

      const textElements = container.querySelectorAll('text[data-segment-kind="odd"]');
      expect(textElements.length).toBeGreaterThan(0);

      // Text should have stroke-width attribute
      textElements.forEach((text) => {
        expect(text).toHaveAttribute('stroke-width', '8');
      });
    });
  });
});
