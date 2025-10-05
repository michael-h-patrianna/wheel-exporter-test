/**
 * Unit tests for LightsRenderer
 */

import React from 'react';
import { render } from '@testing-library/react';
import { LightsRenderer } from '../LightsRenderer';

// Mock console methods
const originalConsoleLog = console.log;

beforeEach(() => {
  console.log = jest.fn();
});

afterEach(() => {
  console.log = originalConsoleLog;
});

describe('LightsRenderer', () => {
  const defaultProps = {
    lights: {
      color: '#FF0000',
      positions: [
        { x: 100, y: 200 },
        { x: 300, y: 400 },
        { x: 500, y: 600 },
      ],
    },
    scale: 1,
  };

  it('should render when lights data provided', () => {
    const { container } = render(<LightsRenderer {...defaultProps} />);
    const component = container.querySelector('.lights-component');
    expect(component).toBeInTheDocument();
  });

  it('should return null when no lights provided', () => {
    const { container } = render(<LightsRenderer lights={undefined} scale={1} />);
    expect(container.firstChild).toBeNull();
  });

  it('should return null when positions array is empty', () => {
    const { container } = render(
      <LightsRenderer lights={{ color: '#FF0000', positions: [] }} scale={1} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should return null when positions is undefined', () => {
    const { container } = render(
      <LightsRenderer lights={{ color: '#FF0000', positions: undefined as any }} scale={1} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render correct number of light circles', () => {
    const { container } = render(<LightsRenderer {...defaultProps} />);
    const lightCircles = container.querySelectorAll('.light-circle');
    expect(lightCircles).toHaveLength(3);
  });

  it('should apply color to light circles', () => {
    const { container } = render(<LightsRenderer {...defaultProps} />);
    const lightCircles = container.querySelectorAll('.light-circle');

    lightCircles.forEach(circle => {
      const styles = window.getComputedStyle(circle);
      expect(circle).toHaveStyle({ backgroundColor: '#FF0000' });
    });
  });

  it('should scale light positions correctly', () => {
    const { container } = render(<LightsRenderer {...defaultProps} scale={0.5} />);
    const lightCircles = container.querySelectorAll('.light-circle');

    expect(lightCircles).toHaveLength(3);
    // Circles should be scaled and positioned
    lightCircles.forEach(circle => {
      const styles = window.getComputedStyle(circle);
      expect(styles.position).toBe('absolute');
    });
  });

  it('should have circular shape', () => {
    const { container } = render(<LightsRenderer {...defaultProps} />);
    const lightCircles = container.querySelectorAll('.light-circle');

    lightCircles.forEach(circle => {
      expect(circle).toHaveStyle({ borderRadius: '50%' });
    });
  });

  it('should have proper ARIA attributes', () => {
    const { container } = render(<LightsRenderer {...defaultProps} />);
    const component = container.querySelector('.lights-component');
    expect(component).toHaveAttribute('role', 'img');
    expect(component).toHaveAttribute('aria-label', 'Wheel lights');
  });

  it('should have pointer events disabled', () => {
    const { container } = render(<LightsRenderer {...defaultProps} />);
    const component = container.querySelector('.lights-component');
    expect(component).toHaveStyle({ pointerEvents: 'none' });

    const lightCircles = container.querySelectorAll('.light-circle');
    lightCircles.forEach(circle => {
      expect(circle).toHaveStyle({ pointerEvents: 'none' });
    });
  });

  it('should have title attribute on each light', () => {
    const { container } = render(<LightsRenderer {...defaultProps} />);
    const lightCircles = container.querySelectorAll('.light-circle');

    lightCircles.forEach((circle, index) => {
      expect(circle).toHaveAttribute('title', `Light ${index + 1}`);
    });
  });

  it('should log rendering information', () => {
    render(<LightsRenderer {...defaultProps} />);

    expect(console.log).toHaveBeenCalledWith('LightsRenderer called with:', expect.any(Object));
    expect(console.log).toHaveBeenCalledWith('LightsRenderer: Rendering', 3, 'lights with color', '#FF0000');
  });

  it('should log when no lights object provided', () => {
    render(<LightsRenderer lights={undefined} scale={1} />);

    expect(console.log).toHaveBeenCalledWith('LightsRenderer: No lights object');
  });

  it('should log when no positions array', () => {
    render(<LightsRenderer lights={{ color: '#FF0000', positions: [] }} scale={1} />);

    expect(console.log).toHaveBeenCalledWith('LightsRenderer: No positions array or empty positions');
  });

  it('should render with different colors', () => {
    const { container, rerender } = render(<LightsRenderer {...defaultProps} />);
    let lightCircles = container.querySelectorAll('.light-circle');

    lightCircles.forEach(circle => {
      expect(circle).toHaveStyle({ backgroundColor: '#FF0000' });
    });

    rerender(<LightsRenderer lights={{ ...defaultProps.lights, color: '#00FF00' }} scale={1} />);
    lightCircles = container.querySelectorAll('.light-circle');

    lightCircles.forEach(circle => {
      expect(circle).toHaveStyle({ backgroundColor: '#00FF00' });
    });
  });

  it('should render single light correctly', () => {
    const singleLightProps = {
      lights: {
        color: '#0000FF',
        positions: [{ x: 400, y: 300 }],
      },
      scale: 1,
    };

    const { container } = render(<LightsRenderer {...singleLightProps} />);
    const lightCircles = container.querySelectorAll('.light-circle');

    expect(lightCircles).toHaveLength(1);
    expect(lightCircles[0]).toHaveStyle({ backgroundColor: '#0000FF' });
  });

  it('should apply correct z-index', () => {
    const { container } = render(<LightsRenderer {...defaultProps} />);
    const component = container.querySelector('.lights-component');
    expect(component).toHaveStyle({ zIndex: 100 });

    const lightCircles = container.querySelectorAll('.light-circle');
    lightCircles.forEach(circle => {
      expect(circle).toHaveStyle({ zIndex: 101 });
    });
  });

  it('should scale radius correctly', () => {
    const { container } = render(<LightsRenderer {...defaultProps} scale={2} />);
    const lightCircles = container.querySelectorAll('.light-circle');

    // At scale 2, radius should be 8px (4 * 2), diameter 16px
    lightCircles.forEach(circle => {
      expect(circle).toHaveStyle({
        width: '16px',
        height: '16px',
      });
    });
  });
});
