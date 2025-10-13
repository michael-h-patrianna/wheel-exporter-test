/**
 * Comprehensive test suite for WheelTopRenderer
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { WheelTopRenderer } from '../WheelTopRenderer';
import { WheelOverlay } from '../../../types';
import { createMockWheelTop, createMockWheelOverlayWithoutBounds } from '../../../test-utils';
import { vi } from 'vitest';

describe('WheelTopRenderer', () => {
  const mockWheelTop = createMockWheelTop();

  const defaultProps = {
    wheelTop: mockWheelTop,
    wheelTopImage: 'https://example.com/wheeltop1.png',
    scale: 1,
    layerNumber: 1 as 1 | 2,
  };

  it('should render wheel top image with correct props', () => {
    render(<WheelTopRenderer {...defaultProps} />);

    const img = screen.getByAltText('Wheel Top 1');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', defaultProps.wheelTopImage);
  });

  it('should return null when wheelTop is not provided', () => {
    const { container } = render(<WheelTopRenderer {...defaultProps} wheelTop={undefined} />);

    expect(container.firstChild).toBeNull();
  });

  it('should return null when wheelTopImage is not provided', () => {
    const { container } = render(<WheelTopRenderer {...defaultProps} wheelTopImage={undefined} />);

    expect(container.firstChild).toBeNull();
  });

  it('should return null when bounds are missing', () => {
    const wheelTopWithoutBounds = createMockWheelOverlayWithoutBounds() as unknown as WheelOverlay;

    const { container } = render(
      <WheelTopRenderer {...defaultProps} wheelTop={wheelTopWithoutBounds} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should calculate correct CSS variables for layer 1', () => {
    const { container } = render(<WheelTopRenderer {...defaultProps} layerNumber={1} />);

    const wheelTopDiv = container.querySelector('.wheeltop-component');
    // left = (x * scale) - (width / 2) = 400 - 100 = 300
    // top = (y * scale) - (height / 2) = 300 - 100 = 200
    expect(wheelTopDiv).toHaveStyle({
      '--wheeltop1-left': '300px',
      '--wheeltop1-top': '200px',
      '--wheeltop1-width': '200px',
      '--wheeltop1-height': '200px',
    });
  });

  it('should calculate correct CSS variables for layer 2', () => {
    const { container } = render(<WheelTopRenderer {...defaultProps} layerNumber={2} />);

    const wheelTopDiv = container.querySelector('.wheeltop-component');
    expect(wheelTopDiv).toHaveStyle({
      '--wheeltop2-left': '300px',
      '--wheeltop2-top': '200px',
      '--wheeltop2-width': '200px',
      '--wheeltop2-height': '200px',
    });
  });

  it('should scale dimensions correctly', () => {
    const { container } = render(<WheelTopRenderer {...defaultProps} scale={0.5} />);

    const wheelTopDiv = container.querySelector('.wheeltop-component');
    // width = 200 * 0.5 = 100, height = 200 * 0.5 = 100
    // left = (400 * 0.5) - (100 / 2) = 200 - 50 = 150
    // top = (300 * 0.5) - (100 / 2) = 150 - 50 = 100
    expect(wheelTopDiv).toHaveStyle({
      '--wheeltop1-left': '150px',
      '--wheeltop1-top': '100px',
      '--wheeltop1-width': '100px',
      '--wheeltop1-height': '100px',
    });
  });

  it('should apply correct class names for layer 1', () => {
    const { container } = render(<WheelTopRenderer {...defaultProps} layerNumber={1} />);

    const wheelTopDiv = container.querySelector('.wheeltop-component');
    expect(wheelTopDiv).toHaveClass('wheeltop-component');
    expect(wheelTopDiv).toHaveClass('wheeltop-1');
    expect(wheelTopDiv).toHaveAttribute('data-layer', '1');
  });

  it('should apply correct class names for layer 2', () => {
    const { container } = render(<WheelTopRenderer {...defaultProps} layerNumber={2} />);

    const wheelTopDiv = container.querySelector('.wheeltop-component');
    expect(wheelTopDiv).toHaveClass('wheeltop-component');
    expect(wheelTopDiv).toHaveClass('wheeltop-2');
    expect(wheelTopDiv).toHaveAttribute('data-layer', '2');
  });

  it('should have correct ARIA attributes for layer 1', () => {
    render(<WheelTopRenderer {...defaultProps} layerNumber={1} />);

    const wheelTopDiv = screen.getByRole('img', { name: 'Wheel top overlay layer 1' });
    expect(wheelTopDiv).toBeInTheDocument();
    expect(wheelTopDiv).toHaveAttribute('title', 'Wheel Top Layer 1');
  });

  it('should have correct ARIA attributes for layer 2', () => {
    render(<WheelTopRenderer {...defaultProps} layerNumber={2} />);

    const wheelTopDiv = screen.getByRole('img', { name: 'Wheel top overlay layer 2' });
    expect(wheelTopDiv).toBeInTheDocument();
    expect(wheelTopDiv).toHaveAttribute('title', 'Wheel Top Layer 2');
  });

  it('should make image non-draggable', () => {
    render(<WheelTopRenderer {...defaultProps} />);

    const img = screen.getByAltText('Wheel Top 1');
    expect(img).toHaveAttribute('draggable', 'false');
  });

  it('should handle image load errors gracefully for layer 1', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<WheelTopRenderer {...defaultProps} layerNumber={1} />);
    const img = screen.getByAltText('Wheel Top 1');

    img.dispatchEvent(new Event('error'));

    // Verify logger.warn was called with structured logging
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const callArg = consoleSpy.mock.calls[0][0];
    expect(callArg).toContain('[WARN]');
    expect(callArg).toContain('WheelTop image failed to load');
    expect(callArg).toContain(defaultProps.wheelTopImage);

    consoleSpy.mockRestore();
  });

  it('should handle image load errors gracefully for layer 2', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<WheelTopRenderer {...defaultProps} layerNumber={2} />);
    const img = screen.getByAltText('Wheel Top 2');

    img.dispatchEvent(new Event('error'));

    // Verify logger.warn was called with structured logging
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const callArg = consoleSpy.mock.calls[0][0];
    expect(callArg).toContain('[WARN]');
    expect(callArg).toContain('WheelTop image failed to load');
    expect(callArg).toContain(defaultProps.wheelTopImage);

    consoleSpy.mockRestore();
  });

  it('should apply correct CSS class for image', () => {
    const { container } = render(<WheelTopRenderer {...defaultProps} />);

    expect(container.querySelector('.wheeltop-image')).toBeInTheDocument();
  });
});
