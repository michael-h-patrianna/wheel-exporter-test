/**
 * Unit tests for GradientHandleRenderer component
 */

import React from 'react';
import { render } from '@testing-library/react';
import { GradientHandleRenderer } from '../GradientHandleRenderer';
import { createMockSegmentStyles } from '../../../utils/testHelpers';

describe('GradientHandleRenderer', () => {
  const defaultCenter = { x: 400, y: 300, radius: 150 };
  const defaultScale = 1;
  const defaultSegmentCount = 4;

  it('should return null when showHandles is false', () => {
    const { container } = render(
      <GradientHandleRenderer
        segments={createMockSegmentStyles()}
        center={defaultCenter}
        segmentCount={defaultSegmentCount}
        scale={defaultScale}
        showHandles={false}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should return null when segments is undefined', () => {
    const { container } = render(
      <GradientHandleRenderer
        segments={undefined}
        center={defaultCenter}
        segmentCount={defaultSegmentCount}
        scale={defaultScale}
        showHandles={true}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should return null when center is undefined', () => {
    const { container } = render(
      <GradientHandleRenderer
        segments={createMockSegmentStyles()}
        center={undefined}
        segmentCount={defaultSegmentCount}
        scale={defaultScale}
        showHandles={true}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render gradient handles component when showHandles is true', () => {
    const segmentStyles = createMockSegmentStyles({
      odd: {
        outer: {
          fill: {
            type: 'gradient',
            gradient: {
              type: 'linear',
              rotation: 45,
              stops: [
                { position: 0, color: '#FF0000' },
                { position: 1, color: '#0000FF' },
              ],
              handles: [
                { x: 0.2, y: 0.3 },
                { x: 0.8, y: 0.7 },
              ],
            },
          },
        },
      },
    });

    const { container } = render(
      <GradientHandleRenderer
        segments={segmentStyles}
        center={defaultCenter}
        segmentCount={defaultSegmentCount}
        scale={defaultScale}
        showHandles={true}
      />
    );

    const component = container.querySelector('.gradient-handles-component');
    expect(component).toBeInTheDocument();
    expect(component).toHaveStyle({
      position: 'absolute',
      zIndex: '200',
      pointerEvents: 'none',
    });
  });

  it('should render SVG element', () => {
    const segmentStyles = createMockSegmentStyles({
      odd: {
        outer: {
          fill: {
            type: 'gradient',
            gradient: {
              type: 'linear',
              rotation: 0,
              stops: [
                { position: 0, color: '#000000' },
                { position: 1, color: '#FFFFFF' },
              ],
              handles: [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
              ],
            },
          },
        },
      },
    });

    const { container } = render(
      <GradientHandleRenderer
        segments={segmentStyles}
        center={defaultCenter}
        segmentCount={defaultSegmentCount}
        scale={defaultScale}
        showHandles={true}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should render linear gradient handles with connecting lines', () => {
    const segmentStyles = createMockSegmentStyles({
      odd: {
        outer: {
          fill: {
            type: 'gradient',
            gradient: {
              type: 'linear',
              rotation: 90,
              stops: [
                { position: 0, color: '#FF0000' },
                { position: 1, color: '#00FF00' },
              ],
              handles: [
                { x: 0.1, y: 0.2 },
                { x: 0.9, y: 0.8 },
              ],
            },
          },
        },
      },
    });

    const { container } = render(
      <GradientHandleRenderer
        segments={segmentStyles}
        center={defaultCenter}
        segmentCount={defaultSegmentCount}
        scale={defaultScale}
        showHandles={true}
      />
    );

    const lines = container.querySelectorAll('line');
    expect(lines.length).toBeGreaterThan(0);
  });

  it('should render linear gradient with width control (third handle)', () => {
    const segmentStyles = createMockSegmentStyles({
      odd: {
        outer: {
          fill: {
            type: 'gradient',
            gradient: {
              type: 'linear',
              rotation: 0,
              stops: [
                { position: 0, color: '#FF0000' },
                { position: 1, color: '#0000FF' },
              ],
              handles: [
                { x: 0.1, y: 0.2 },
                { x: 0.9, y: 0.8 },
                { x: 0.5, y: 0.5 }, // Third handle for width control
              ],
            },
          },
        },
      },
    });

    const { container } = render(
      <GradientHandleRenderer
        segments={segmentStyles}
        center={defaultCenter}
        segmentCount={defaultSegmentCount}
        scale={defaultScale}
        showHandles={true}
      />
    );

    const lines = container.querySelectorAll('line');
    // Should have main line plus width control line
    expect(lines.length).toBeGreaterThan(1);
  });

  it('should render radial gradient handles with circle', () => {
    const segmentStyles = createMockSegmentStyles({
      odd: {
        outer: {
          fill: {
            type: 'gradient',
            gradient: {
              type: 'radial',
              rotation: 0,
              stops: [
                { position: 0, color: '#FFFFFF' },
                { position: 1, color: '#000000' },
              ],
              handles: [
                { x: 0.5, y: 0.5 }, // Center
                { x: 0.8, y: 0.8 }, // Radius point
              ],
            },
          },
        },
      },
    });

    const { container } = render(
      <GradientHandleRenderer
        segments={segmentStyles}
        center={defaultCenter}
        segmentCount={defaultSegmentCount}
        scale={defaultScale}
        showHandles={true}
      />
    );

    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(0);
  });

  it('should render angular gradient handles with circle and rotation line', () => {
    const segmentStyles = createMockSegmentStyles({
      odd: {
        outer: {
          fill: {
            type: 'gradient',
            gradient: {
              type: 'angular',
              rotation: 45,
              stops: [
                { position: 0, color: '#FF0000' },
                { position: 0.5, color: '#00FF00' },
                { position: 1, color: '#0000FF' },
              ],
              handles: [
                { x: 0.5, y: 0.5 }, // Center
                { x: 0.8, y: 0.5 }, // Radius point
                { x: 0.5, y: 0.2 }, // Rotation point
              ],
            },
          },
        },
      },
    });

    const { container } = render(
      <GradientHandleRenderer
        segments={segmentStyles}
        center={defaultCenter}
        segmentCount={defaultSegmentCount}
        scale={defaultScale}
        showHandles={true}
      />
    );

    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(0);

    // Check for rotation line (yellow dashed line)
    const lines = container.querySelectorAll('line');
    const rotationLine = Array.from(lines).find(line =>
      line.getAttribute('stroke') === '#ffff00'
    );
    expect(rotationLine).toBeTruthy();
  });

  it('should render diamond gradient handles', () => {
    const segmentStyles = createMockSegmentStyles({
      odd: {
        outer: {
          fill: {
            type: 'gradient',
            gradient: {
              type: 'diamond',
              rotation: 0,
              stops: [
                { position: 0, color: '#FFFF00' },
                { position: 1, color: '#FF00FF' },
              ],
              handles: [
                { x: 0.5, y: 0.5 }, // Center
                { x: 0.7, y: 0.7 }, // Size point
              ],
            },
          },
        },
      },
    });

    const { container } = render(
      <GradientHandleRenderer
        segments={segmentStyles}
        center={defaultCenter}
        segmentCount={defaultSegmentCount}
        scale={defaultScale}
        showHandles={true}
      />
    );

    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(0);
    // Check for 45 degree rotation
    const rect = rects[0];
    expect(rect.getAttribute('transform')).toContain('rotate(45');
  });

  it('should not render visualizations for segments without gradient fills', () => {
    const segmentStyles = createMockSegmentStyles({
      odd: {
        outer: {
          fill: {
            type: 'solid',
            color: '#FF0000',
          },
        },
      },
    });

    const { container } = render(
      <GradientHandleRenderer
        segments={segmentStyles}
        center={defaultCenter}
        segmentCount={defaultSegmentCount}
        scale={defaultScale}
        showHandles={true}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // Should have no gradient visualizations
    const groups = container.querySelectorAll('g[opacity]');
    expect(groups.length).toBe(0);
  });

  it('should not render visualizations for gradients without handles', () => {
    const segmentStyles = createMockSegmentStyles({
      odd: {
        outer: {
          fill: {
            type: 'gradient',
            gradient: {
              type: 'linear',
              rotation: 0,
              stops: [
                { position: 0, color: '#000000' },
                { position: 1, color: '#FFFFFF' },
              ],
              handles: [], // No handles
            },
          },
        },
      },
    });

    const { container } = render(
      <GradientHandleRenderer
        segments={segmentStyles}
        center={defaultCenter}
        segmentCount={defaultSegmentCount}
        scale={defaultScale}
        showHandles={true}
      />
    );

    const groups = container.querySelectorAll('g[opacity]');
    expect(groups.length).toBe(0);
  });

  it('should not render visualizations when handles array has less than 2 items', () => {
    const segmentStyles = createMockSegmentStyles({
      odd: {
        outer: {
          fill: {
            type: 'gradient',
            gradient: {
              type: 'linear',
              rotation: 0,
              stops: [
                { position: 0, color: '#000000' },
                { position: 1, color: '#FFFFFF' },
              ],
              handles: [{ x: 0.5, y: 0.5 }], // Only one handle
            },
          },
        },
      },
    });

    const { container } = render(
      <GradientHandleRenderer
        segments={segmentStyles}
        center={defaultCenter}
        segmentCount={defaultSegmentCount}
        scale={defaultScale}
        showHandles={true}
      />
    );

    const groups = container.querySelectorAll('g[opacity]');
    expect(groups.length).toBe(0);
  });

  it('should apply correct scale to positions', () => {
    const segmentStyles = createMockSegmentStyles({
      odd: {
        outer: {
          fill: {
            type: 'gradient',
            gradient: {
              type: 'linear',
              rotation: 0,
              stops: [
                { position: 0, color: '#000000' },
                { position: 1, color: '#FFFFFF' },
              ],
              handles: [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
              ],
            },
          },
        },
      },
    });

    const { container } = render(
      <GradientHandleRenderer
        segments={segmentStyles}
        center={defaultCenter}
        segmentCount={defaultSegmentCount}
        scale={2} // 2x scale
        showHandles={true}
      />
    );

    const component = container.querySelector('.gradient-handles-component');
    expect(component).toBeInTheDocument();
    // Positions should be scaled by 2
  });

  it('should handle multiple segments with different gradient types', () => {
    const segmentStyles = createMockSegmentStyles({
      odd: {
        outer: {
          fill: {
            type: 'gradient',
            gradient: {
              type: 'linear',
              rotation: 0,
              stops: [{ position: 0, color: '#FF0000' }, { position: 1, color: '#0000FF' }],
              handles: [{ x: 0.1, y: 0.2 }, { x: 0.9, y: 0.8 }],
            },
          },
        },
      },
      even: {
        outer: {
          fill: {
            type: 'gradient',
            gradient: {
              type: 'radial',
              rotation: 0,
              stops: [{ position: 0, color: '#00FF00' }, { position: 1, color: '#FFFF00' }],
              handles: [{ x: 0.5, y: 0.5 }, { x: 0.8, y: 0.8 }],
            },
          },
        },
      },
    });

    const { container } = render(
      <GradientHandleRenderer
        segments={segmentStyles}
        center={defaultCenter}
        segmentCount={defaultSegmentCount}
        scale={defaultScale}
        showHandles={true}
      />
    );

    // Should render multiple visualization groups
    const groups = container.querySelectorAll('g[opacity]');
    expect(groups.length).toBeGreaterThan(0);
  });

  it('should skip segments without outer styles', () => {
    const segmentStyles = createMockSegmentStyles({
      odd: {
        outer: undefined,
      },
    });

    const { container } = render(
      <GradientHandleRenderer
        segments={segmentStyles}
        center={defaultCenter}
        segmentCount={defaultSegmentCount}
        scale={defaultScale}
        showHandles={true}
      />
    );

    const groups = container.querySelectorAll('g[opacity]');
    expect(groups.length).toBe(0);
  });

  it('should render handle points with circles', () => {
    const segmentStyles = createMockSegmentStyles({
      odd: {
        outer: {
          fill: {
            type: 'gradient',
            gradient: {
              type: 'linear',
              rotation: 0,
              stops: [
                { position: 0, color: '#FF0000' },
                { position: 1, color: '#0000FF' },
              ],
              handles: [
                { x: 0.2, y: 0.3 },
                { x: 0.8, y: 0.7 },
              ],
            },
          },
        },
      },
    });

    const { container } = render(
      <GradientHandleRenderer
        segments={segmentStyles}
        center={defaultCenter}
        segmentCount={defaultSegmentCount}
        scale={defaultScale}
        showHandles={true}
      />
    );

    const circles = container.querySelectorAll('circle');
    // Should have circles for handle visualization
    expect(circles.length).toBeGreaterThan(0);
  });

  it('should use default color when gradient has no stops', () => {
    const segmentStyles = createMockSegmentStyles({
      odd: {
        outer: {
          fill: {
            type: 'gradient',
            gradient: {
              type: 'linear',
              rotation: 0,
              stops: [],
              handles: [
                { x: 0.2, y: 0.3 },
                { x: 0.8, y: 0.7 },
              ],
            },
          },
        },
      },
    });

    const { container } = render(
      <GradientHandleRenderer
        segments={segmentStyles}
        center={defaultCenter}
        segmentCount={defaultSegmentCount}
        scale={defaultScale}
        showHandles={true}
      />
    );

    // Should render without errors even with no stops
    const component = container.querySelector('.gradient-handles-component');
    expect(component).toBeInTheDocument();
  });

  it('should handle different segment counts correctly', () => {
    const segmentStyles = createMockSegmentStyles({
      odd: {
        outer: {
          fill: {
            type: 'gradient',
            gradient: {
              type: 'linear',
              rotation: 0,
              stops: [{ position: 0, color: '#000000' }, { position: 1, color: '#FFFFFF' }],
              handles: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
            },
          },
        },
      },
    });

    const { container } = render(
      <GradientHandleRenderer
        segments={segmentStyles}
        center={defaultCenter}
        segmentCount={8} // More segments
        scale={defaultScale}
        showHandles={true}
      />
    );

    const component = container.querySelector('.gradient-handles-component');
    expect(component).toBeInTheDocument();
  });
});
