/**
 * Unit tests for SegmentRenderer component
 */

import React from 'react';
import { render } from '@testing-library/react';
import { SegmentRenderer } from '../SegmentRenderer';
import { createMockSegmentStyles } from '../../../utils/testHelpers';

describe('SegmentRenderer', () => {
  const defaultProps = {
    segments: createMockSegmentStyles(),
    center: { x: 400, y: 300, radius: 150 },
    segmentCount: 6,
    scale: 1,
  };

  it('should render segments with gradient fills', () => {
    const { container } = render(<SegmentRenderer {...defaultProps} />);
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('should return null when segments is undefined', () => {
    const { container } = render(
      <SegmentRenderer {...defaultProps} segments={undefined} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should return null when center is undefined', () => {
    const { container } = render(
      <SegmentRenderer {...defaultProps} center={undefined} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render segments with gradient stroke fills', () => {
    const segmentsWithGradientStrokes = createMockSegmentStyles({
      odd: {
        outer: {
          fill: {
            type: 'solid',
            color: '#FF0000',
          },
          stroke: {
            width: 3,
            fill: {
              type: 'gradient',
              gradient: {
                type: 'linear',
                rotation: 45,
                stops: [
                  { position: 0, color: '#FF0000' },
                  { position: 1, color: '#0000FF' },
                ],
                transform: [
                  [1, 0, 0],
                  [0, 1, 0],
                ] as const,
                handleOrigin: { x: 0.5, y: 0.5 },
                handleVectors: [
                  { x: 0.5, y: 0.5 },
                  { x: 0.5, y: 0 },
                  { x: 1, y: 0.5 },
                ] as const,
              },
            },
          },
        },
      },
    });

    const { container } = render(
      <SegmentRenderer {...defaultProps} segments={segmentsWithGradientStrokes} />
    );

    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();

    // Check that gradient defs were created
    const defs = container.querySelector('defs');
    expect(defs).toBeInTheDocument();
  });

  it('should handle different segment counts', () => {
    const { container } = render(<SegmentRenderer {...defaultProps} segmentCount={8} />);
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('should apply correct scaling', () => {
    const { container } = render(<SegmentRenderer {...defaultProps} scale={0.5} />);
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });
});
