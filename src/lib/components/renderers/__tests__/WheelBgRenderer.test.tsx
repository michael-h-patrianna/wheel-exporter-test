/**
 * Comprehensive test suite for WheelBgRenderer
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { WheelBgRenderer } from '../WheelBgRenderer';
import { WheelOverlay } from '../../../types';

describe('WheelBgRenderer', () => {
  const mockWheelBg: WheelOverlay = {
    bounds: {
      x: 400,
      y: 300,
      w: 600,
      h: 600,
    },
    img: 'wheelbg.png',
  };

  const defaultProps = {
    wheelBg: mockWheelBg,
    wheelBgImage: 'https://example.com/wheelbg.png',
    scale: 1,
  };

  it('should render wheel background image with correct props', () => {
    render(<WheelBgRenderer {...defaultProps} />);

    const img = screen.getByAltText('Wheel Background');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', defaultProps.wheelBgImage);
  });

  it('should return null when wheelBg is not provided', () => {
    const { container } = render(
      <WheelBgRenderer
        {...defaultProps}
        wheelBg={undefined}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should return null when wheelBgImage is not provided', () => {
    const { container } = render(
      <WheelBgRenderer
        {...defaultProps}
        wheelBgImage={undefined}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should return null when bounds are missing', () => {
    const wheelBgWithoutBounds = {
      img: 'wheelbg.png',
    } as any;

    const { container } = render(
      <WheelBgRenderer
        {...defaultProps}
        wheelBg={wheelBgWithoutBounds}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should calculate correct CSS variables for positioning and dimensions', () => {
    const { container } = render(<WheelBgRenderer {...defaultProps} />);

    const wheelBgDiv = container.querySelector('.wheelbg-component');
    // left = (x * scale) - (width / 2) = 400 - 300 = 100
    // top = (y * scale) - (height / 2) = 300 - 300 = 0
    expect(wheelBgDiv).toHaveStyle({
      '--wheelbg-left': '100px',
      '--wheelbg-top': '0px',
      '--wheelbg-width': '600px',
      '--wheelbg-height': '600px',
    });
  });

  it('should scale dimensions correctly', () => {
    const { container } = render(
      <WheelBgRenderer {...defaultProps} scale={0.5} />
    );

    const wheelBgDiv = container.querySelector('.wheelbg-component');
    // width = 600 * 0.5 = 300, height = 600 * 0.5 = 300
    // left = (400 * 0.5) - (300 / 2) = 200 - 150 = 50
    // top = (300 * 0.5) - (300 / 2) = 150 - 150 = 0
    expect(wheelBgDiv).toHaveStyle({
      '--wheelbg-left': '50px',
      '--wheelbg-top': '0px',
      '--wheelbg-width': '300px',
      '--wheelbg-height': '300px',
    });
  });

  it('should have correct ARIA attributes', () => {
    render(<WheelBgRenderer {...defaultProps} />);

    const wheelBgDiv = screen.getByRole('img', { name: 'Wheel background overlay' });
    expect(wheelBgDiv).toBeInTheDocument();
    expect(wheelBgDiv).toHaveAttribute('title', 'Wheel Background Overlay');
  });

  it('should make image non-draggable', () => {
    render(<WheelBgRenderer {...defaultProps} />);

    const img = screen.getByAltText('Wheel Background');
    expect(img).toHaveAttribute('draggable', 'false');
  });

  it('should handle image load errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    render(<WheelBgRenderer {...defaultProps} />);
    const img = screen.getByAltText('Wheel Background');

    img.dispatchEvent(new Event('error'));

    expect(consoleSpy).toHaveBeenCalledWith(
      'WheelBg image failed to load:',
      defaultProps.wheelBgImage
    );

    consoleSpy.mockRestore();
  });

  it('should apply correct CSS class names', () => {
    const { container } = render(<WheelBgRenderer {...defaultProps} />);

    expect(container.querySelector('.wheelbg-component')).toBeInTheDocument();
    expect(container.querySelector('.wheelbg-image')).toBeInTheDocument();
  });
});
