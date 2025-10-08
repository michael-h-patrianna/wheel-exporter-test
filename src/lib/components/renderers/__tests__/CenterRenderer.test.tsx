/**
 * Comprehensive test suite for CenterRenderer
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { CenterRenderer } from '../CenterRenderer';
import { CenterComponent } from '../../../types';

describe('CenterRenderer', () => {
  const mockCenter: CenterComponent = {
    x: 400,
    y: 300,
    radius: 100,
  };

  const defaultProps = {
    center: mockCenter,
    scale: 1,
  };

  it('should render center component with SVG', () => {
    const { container } = render(<CenterRenderer {...defaultProps} />);

    const svg = container.querySelector('svg.center-svg');
    expect(svg).toBeInTheDocument();
  });

  it('should return null when center is not provided', () => {
    const { container } = render(
      <CenterRenderer center={undefined} scale={1} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should calculate correct CSS variables for positioning and dimensions', () => {
    const { container } = render(<CenterRenderer {...defaultProps} />);

    const centerDiv = container.querySelector('.center-component');
    // radius = 100 * 1 = 100, diameter = 200
    // left = (x * scale) - radius = 400 - 100 = 300
    // top = (y * scale) - radius = 300 - 100 = 200
    expect(centerDiv).toHaveStyle({
      '--center-left': '300px',
      '--center-top': '200px',
      '--center-size': '200px',
      '--center-radius': '100px',
    });
  });

  it('should scale dimensions correctly', () => {
    const { container } = render(
      <CenterRenderer {...defaultProps} scale={0.5} />
    );

    const centerDiv = container.querySelector('.center-component');
    // radius = 100 * 0.5 = 50, diameter = 100
    // left = (400 * 0.5) - 50 = 200 - 50 = 150
    // top = (300 * 0.5) - 50 = 150 - 50 = 100
    expect(centerDiv).toHaveStyle({
      '--center-left': '150px',
      '--center-top': '100px',
      '--center-size': '100px',
      '--center-radius': '50px',
    });
  });

  it('should render SVG with correct dimensions', () => {
    const { container } = render(<CenterRenderer {...defaultProps} />);

    const svg = container.querySelector('svg.center-svg');
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '200');
    expect(svg).toHaveAttribute('viewBox', '0 0 200 200');
  });

  it('should render main filled circle with semi-transparency', () => {
    const { container } = render(<CenterRenderer {...defaultProps} />);

    const circles = container.querySelectorAll('circle');
    const mainCircle = circles[0];

    expect(mainCircle).toHaveAttribute('cx', '100');
    expect(mainCircle).toHaveAttribute('cy', '100');
    expect(mainCircle).toHaveAttribute('r', '100');
    expect(mainCircle).toHaveAttribute('fill', 'rgba(128, 128, 128, 0.3)');
    expect(mainCircle).toHaveAttribute('stroke', 'none');
  });

  it('should render horizontal crosshair line', () => {
    const { container } = render(<CenterRenderer {...defaultProps} />);

    const lines = container.querySelectorAll('line');
    const horizontalLine = lines[0];

    expect(horizontalLine).toHaveAttribute('x1', '0');
    expect(horizontalLine).toHaveAttribute('y1', '100');
    expect(horizontalLine).toHaveAttribute('x2', '200');
    expect(horizontalLine).toHaveAttribute('y2', '100');
    expect(horizontalLine).toHaveAttribute('stroke', 'rgba(255, 255, 255, 0.5)');
    expect(horizontalLine).toHaveAttribute('stroke-width', '1');
  });

  it('should render vertical crosshair line', () => {
    const { container} = render(<CenterRenderer {...defaultProps} />);

    const lines = container.querySelectorAll('line');
    const verticalLine = lines[1];

    expect(verticalLine).toHaveAttribute('x1', '100');
    expect(verticalLine).toHaveAttribute('y1', '0');
    expect(verticalLine).toHaveAttribute('x2', '100');
    expect(verticalLine).toHaveAttribute('y2', '200');
    expect(verticalLine).toHaveAttribute('stroke', 'rgba(255, 255, 255, 0.5)');
    expect(verticalLine).toHaveAttribute('stroke-width', '1');
  });

  it('should render center point dot', () => {
    const { container } = render(<CenterRenderer {...defaultProps} />);

    const circles = container.querySelectorAll('circle');
    const centerDot = circles[1];

    expect(centerDot).toHaveAttribute('cx', '100');
    expect(centerDot).toHaveAttribute('cy', '100');
    expect(centerDot).toHaveAttribute('r', '2');
    expect(centerDot).toHaveAttribute('fill', 'rgba(255, 255, 255, 0.8)');
  });

  it('should have correct ARIA attributes', () => {
    render(<CenterRenderer {...defaultProps} />);

    const centerDiv = screen.getByRole('img', { name: 'Wheel center circle' });
    expect(centerDiv).toBeInTheDocument();
    expect(centerDiv).toHaveAttribute('title', 'Wheel Center');
  });

  it('should apply correct CSS class names', () => {
    const { container } = render(<CenterRenderer {...defaultProps} />);

    expect(container.querySelector('.center-component')).toBeInTheDocument();
    expect(container.querySelector('.center-svg')).toBeInTheDocument();
  });

  it('should scale SVG elements with different radii', () => {
    const testCases = [
      { radius: 50, expectedDiameter: 50, expectedCx: 25, expectedCy: 25 },
      { radius: 150, expectedDiameter: 150, expectedCx: 75, expectedCy: 75 },
      { radius: 200, expectedDiameter: 200, expectedCx: 100, expectedCy: 100 },
    ];

    testCases.forEach(({ radius, expectedDiameter, expectedCx, expectedCy }) => {
      const center: CenterComponent = { x: 400, y: 300, radius };
      const { container } = render(
        <CenterRenderer center={center} scale={0.5} />
      );

      const svg = container.querySelector('svg.center-svg');
      expect(svg).toHaveAttribute('width', String(expectedDiameter));
      expect(svg).toHaveAttribute('height', String(expectedDiameter));

      const circles = container.querySelectorAll('circle');
      expect(circles[0]).toHaveAttribute('cx', String(expectedCx));
      expect(circles[0]).toHaveAttribute('cy', String(expectedCy));
      expect(circles[0]).toHaveAttribute('r', String(expectedCx));
    });
  });

  it('should handle different center positions', () => {
    const testCases = [
      { x: 200, y: 150, scale: 1, expectedLeft: '100px', expectedTop: '50px' },
      { x: 800, y: 600, scale: 1, expectedLeft: '700px', expectedTop: '500px' },
      { x: 400, y: 300, scale: 2, expectedLeft: '600px', expectedTop: '400px' },
    ];

    testCases.forEach(({ x, y, scale, expectedLeft, expectedTop }) => {
      const center: CenterComponent = { x, y, radius: 100 };
      const { container } = render(
        <CenterRenderer center={center} scale={scale} />
      );

      const centerDiv = container.querySelector('.center-component');
      expect(centerDiv).toHaveStyle({
        '--center-left': expectedLeft,
        '--center-top': expectedTop,
      });
    });
  });
});
