/**
 * Comprehensive test suite for WheelTopRenderer
 */

import { WheelTopRenderer } from '@components/renderers/WheelTopRenderer';
import { WheelOverlay } from '@lib-types';
import { createMockWheelOverlayWithoutBounds, createMockWheelTop } from '@test-utils';
import { render } from '@testing-library/react';
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
    const { getByTestId } = render(<WheelTopRenderer {...defaultProps} />);

    const img = getByTestId('wheeltop-image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', defaultProps.wheelTopImage);
  });

  it('should return null when wheelTop is not provided', () => {
    const { container, getByTestId } = render(<WheelTopRenderer {...defaultProps} wheelTop={undefined} />);

    expect(container.firstChild).toBeNull();
  });

  it('should return null when wheelTopImage is not provided', () => {
    const { container, getByTestId } = render(<WheelTopRenderer {...defaultProps} wheelTopImage={undefined} />);

    expect(container.firstChild).toBeNull();
  });

  it('should return null when bounds are missing', () => {
    const wheelTopWithoutBounds = createMockWheelOverlayWithoutBounds() as unknown as WheelOverlay;

    const { container, getByTestId } = render(
      <WheelTopRenderer {...defaultProps} wheelTop={wheelTopWithoutBounds} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should calculate correct CSS variables for layer 1', () => {
    const { container, getByTestId } = render(<WheelTopRenderer {...defaultProps} layerNumber={1} />);

    const wheelTopDiv = getByTestId('wheeltop-component');
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
    const { container, getByTestId } = render(<WheelTopRenderer {...defaultProps} layerNumber={2} />);

    const wheelTopDiv = getByTestId('wheeltop-component');
    expect(wheelTopDiv).toHaveStyle({
      '--wheeltop2-left': '300px',
      '--wheeltop2-top': '200px',
      '--wheeltop2-width': '200px',
      '--wheeltop2-height': '200px',
    });
  });

  it('should scale dimensions correctly', () => {
    const { container, getByTestId } = render(<WheelTopRenderer {...defaultProps} scale={0.5} />);

    const wheelTopDiv = getByTestId('wheeltop-component');
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
    const { container, getByTestId } = render(<WheelTopRenderer {...defaultProps} layerNumber={1} />);

    const wheelTopDiv = getByTestId('wheeltop-component');
    expect(wheelTopDiv).toHaveAttribute('data-layer', '1');
  });

  it('should apply correct class names for layer 2', () => {
    const { container, getByTestId } = render(<WheelTopRenderer {...defaultProps} layerNumber={2} />);

    const wheelTopDiv = getByTestId('wheeltop-component');
    expect(wheelTopDiv).toHaveAttribute('data-layer', '2');
  });

  it('should have correct ARIA attributes for layer 1', () => {
    const { getByTestId } = render(<WheelTopRenderer {...defaultProps} layerNumber={1} />);

    const wheelTopDiv = getByTestId('wheeltop-component');
    expect(wheelTopDiv).toBeInTheDocument();
    expect(wheelTopDiv).toHaveAttribute('title', 'Wheel Top Layer 1');
  });

  it('should have correct ARIA attributes for layer 2', () => {
    const { getByTestId } = render(<WheelTopRenderer {...defaultProps} layerNumber={2} />);

    const wheelTopDiv = getByTestId('wheeltop-component');
    expect(wheelTopDiv).toBeInTheDocument();
    expect(wheelTopDiv).toHaveAttribute('title', 'Wheel Top Layer 2');
  });

  it('should make image non-draggable', () => {
    const { getByTestId } = render(<WheelTopRenderer {...defaultProps} />);

    const img = getByTestId('wheeltop-image');
    expect(img).toHaveAttribute('draggable', 'false');
  });

  it('should handle image load errors gracefully for layer 1', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { getByTestId } = render(<WheelTopRenderer {...defaultProps} layerNumber={1} />);
    const img = getByTestId('wheeltop-image');

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

    const { getByTestId } = render(<WheelTopRenderer {...defaultProps} layerNumber={2} />);
    const img = getByTestId('wheeltop-image');

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
    const { container, getByTestId } = render(<WheelTopRenderer {...defaultProps} />);

    expect(getByTestId('wheeltop-image')).toBeInTheDocument();
  });
});
