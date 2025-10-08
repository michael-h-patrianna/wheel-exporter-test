/**
 * Comprehensive test suite for LightsRenderer
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { LightsRenderer } from '../LightsRenderer';
import { LightsComponent } from '../../../types';

describe('LightsRenderer', () => {
  const mockLights: LightsComponent = {
    color: '#FFFF00',
    positions: [
      { x: 100, y: 50 },
      { x: 200, y: 100 },
      { x: 300, y: 150 },
    ],
  };

  const defaultProps = {
    lights: mockLights,
    scale: 1,
  };

  // Suppress console.log output for cleaner test output
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should render lights container with correct props', () => {
    const { container } = render(<LightsRenderer {...defaultProps} />);

    const lightsDiv = container.querySelector('.lights-component');
    expect(lightsDiv).toBeInTheDocument();
  });

  it('should return null when lights is not provided', () => {
    const { container } = render(
      <LightsRenderer lights={undefined} scale={1} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should return null when positions array is not provided', () => {
    const lightsWithoutPositions = {
      color: '#FFFF00',
    } as any;

    const { container } = render(
      <LightsRenderer lights={lightsWithoutPositions} scale={1} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should return null when positions array is empty', () => {
    const lightsWithEmptyPositions: LightsComponent = {
      color: '#FFFF00',
      positions: [],
    };

    const { container } = render(
      <LightsRenderer lights={lightsWithEmptyPositions} scale={1} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render correct number of light circles', () => {
    const { container } = render(<LightsRenderer {...defaultProps} />);

    const lightCircles = container.querySelectorAll('.light-circle');
    expect(lightCircles).toHaveLength(3);
  });

  it('should apply correct color to all lights', () => {
    const { container } = render(<LightsRenderer {...defaultProps} />);

    const lightCircles = container.querySelectorAll('.light-circle');
    lightCircles.forEach((circle) => {
      expect(circle).toHaveStyle({ backgroundColor: '#FFFF00' });
    });
  });

  it('should calculate correct positions for lights', () => {
    const { container } = render(<LightsRenderer {...defaultProps} />);

    const lightCircles = container.querySelectorAll('.light-circle');

    // radius = 4 * scale = 4, diameter = 8
    // Light 1: left = 100 - 4 = 96, top = 50 - 4 = 46
    expect(lightCircles[0]).toHaveStyle({
      left: '96px',
      top: '46px',
      width: '8px',
      height: '8px',
    });

    // Light 2: left = 200 - 4 = 196, top = 100 - 4 = 96
    expect(lightCircles[1]).toHaveStyle({
      left: '196px',
      top: '96px',
      width: '8px',
      height: '8px',
    });

    // Light 3: left = 300 - 4 = 296, top = 150 - 4 = 146
    expect(lightCircles[2]).toHaveStyle({
      left: '296px',
      top: '146px',
      width: '8px',
      height: '8px',
    });
  });

  it('should scale light positions and sizes correctly', () => {
    const { container } = render(<LightsRenderer {...defaultProps} scale={0.5} />);

    const lightCircles = container.querySelectorAll('.light-circle');

    // radius = 4 * 0.5 = 2, diameter = 4
    // Light 1: left = (100 * 0.5) - 2 = 48, top = (50 * 0.5) - 2 = 23
    expect(lightCircles[0]).toHaveStyle({
      left: '48px',
      top: '23px',
      width: '4px',
      height: '4px',
    });
  });

  it('should apply circular border radius to lights', () => {
    const { container } = render(<LightsRenderer {...defaultProps} />);

    const lightCircles = container.querySelectorAll('.light-circle');
    lightCircles.forEach((circle) => {
      expect(circle).toHaveStyle({ borderRadius: '50%' });
    });
  });

  it('should set pointer-events to none for all lights', () => {
    const { container } = render(<LightsRenderer {...defaultProps} />);

    const lightsDiv = container.querySelector('.lights-component');
    expect(lightsDiv).toHaveStyle({ pointerEvents: 'none' });

    const lightCircles = container.querySelectorAll('.light-circle');
    lightCircles.forEach((circle) => {
      expect(circle).toHaveStyle({ pointerEvents: 'none' });
    });
  });

  it('should have correct z-index for layering', () => {
    const { container } = render(<LightsRenderer {...defaultProps} />);

    const lightsDiv = container.querySelector('.lights-component');
    expect(lightsDiv).toHaveStyle({ zIndex: 100 });

    const lightCircles = container.querySelectorAll('.light-circle');
    lightCircles.forEach((circle) => {
      expect(circle).toHaveStyle({ zIndex: 101 });
    });
  });

  it('should have correct ARIA attributes', () => {
    render(<LightsRenderer {...defaultProps} />);

    const lightsDiv = screen.getByRole('img', { name: 'Wheel lights' });
    expect(lightsDiv).toBeInTheDocument();
  });

  it('should apply correct title to each light', () => {
    const { container } = render(<LightsRenderer {...defaultProps} />);

    const lightCircles = container.querySelectorAll('.light-circle');
    expect(lightCircles[0]).toHaveAttribute('title', 'Light 1');
    expect(lightCircles[1]).toHaveAttribute('title', 'Light 2');
    expect(lightCircles[2]).toHaveAttribute('title', 'Light 3');
  });

  it('should apply absolute positioning to container', () => {
    const { container } = render(<LightsRenderer {...defaultProps} />);

    const lightsDiv = container.querySelector('.lights-component');
    expect(lightsDiv).toHaveStyle({
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
    });
  });

  it('should handle single light', () => {
    const singleLight: LightsComponent = {
      color: '#FF0000',
      positions: [{ x: 50, y: 50 }],
    };

    const { container } = render(<LightsRenderer lights={singleLight} scale={1} />);

    const lightCircles = container.querySelectorAll('.light-circle');
    expect(lightCircles).toHaveLength(1);
    expect(lightCircles[0]).toHaveStyle({ backgroundColor: '#FF0000' });
  });

  it('should handle many lights', () => {
    const manyLights: LightsComponent = {
      color: '#00FF00',
      positions: Array.from({ length: 20 }, (_, i) => ({ x: i * 10, y: i * 10 })),
    };

    const { container } = render(<LightsRenderer lights={manyLights} scale={1} />);

    const lightCircles = container.querySelectorAll('.light-circle');
    expect(lightCircles).toHaveLength(20);
  });

  // Debug logging test removed - console.log statements were removed from production code
  // for production readiness. Functionality is tested by other tests in this suite.

  it('should handle different scale factors', () => {
    const testCases = [
      { scale: 0.25, expectedRadius: 1, expectedDiameter: 2 },
      { scale: 1.5, expectedRadius: 6, expectedDiameter: 12 },
      { scale: 2, expectedRadius: 8, expectedDiameter: 16 },
    ];

    testCases.forEach(({ scale, expectedRadius, expectedDiameter }) => {
      const { container } = render(
        <LightsRenderer {...defaultProps} scale={scale} />
      );

      const lightCircles = container.querySelectorAll('.light-circle');
      expect(lightCircles[0]).toHaveStyle({
        width: `${expectedDiameter}px`,
        height: `${expectedDiameter}px`,
      });
    });
  });
});
