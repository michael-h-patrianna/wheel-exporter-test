/**
 * Comprehensive test suite for PointerRenderer
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { PointerRenderer } from '@components/renderers/PointerRenderer';
import { PointerComponent } from '@lib-types';

describe('PointerRenderer', () => {
  const mockPointer: PointerComponent = {
    bounds: {
      x: 400,
      y: 100,
      w: 80,
      h: 120,
    },
    img: 'pointer.png',
  };

  const defaultProps = {
    pointer: mockPointer,
    pointerImage: 'https://example.com/pointer.png',
    scale: 1,
  };

  it('should render pointer image with correct props', () => {
    render(<PointerRenderer {...defaultProps} />);

    const img = screen.getByAltText('Wheel pointer');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', defaultProps.pointerImage);
  });

  it('should return null when pointer is not provided', () => {
    const { container } = render(<PointerRenderer {...defaultProps} pointer={undefined} />);

    expect(container.firstChild).toBeNull();
  });

  it('should return null when pointerImage is not provided', () => {
    const { container } = render(<PointerRenderer {...defaultProps} pointerImage={undefined} />);

    expect(container.firstChild).toBeNull();
  });

  it('should calculate correct positioning and dimensions', () => {
    const { container } = render(<PointerRenderer {...defaultProps} />);

    const pointerDiv = container.querySelector('.pointer-component');
    // left = (x * scale) - (width / 2) = 400 - 40 = 360
    // top = (y * scale) - (height / 2) = 100 - 60 = 40
    expect(pointerDiv).toHaveStyle({
      position: 'absolute',
      left: '360px',
      top: '40px',
      width: '80px',
      height: '120px',
      zIndex: 20,
      pointerEvents: 'none',
    });
  });

  it('should scale dimensions correctly', () => {
    const { container } = render(<PointerRenderer {...defaultProps} scale={0.5} />);

    const pointerDiv = container.querySelector('.pointer-component');
    // width = 80 * 0.5 = 40, height = 120 * 0.5 = 60
    // left = (400 * 0.5) - (40 / 2) = 200 - 20 = 180
    // top = (100 * 0.5) - (60 / 2) = 50 - 30 = 20
    expect(pointerDiv).toHaveStyle({
      left: '180px',
      top: '20px',
      width: '40px',
      height: '60px',
    });
  });

  it('should apply rotation when provided', () => {
    const pointerWithRotation: PointerComponent = {
      ...mockPointer,
      bounds: {
        ...mockPointer.bounds,
        rotation: 45,
      },
    };

    const { container } = render(
      <PointerRenderer {...defaultProps} pointer={pointerWithRotation} />
    );

    const pointerDiv = container.querySelector('.pointer-component');
    expect(pointerDiv).toHaveStyle({
      transform: 'rotate(45deg)',
      transformOrigin: 'center center',
    });
  });

  it('should not apply rotation when not provided', () => {
    const { container } = render(<PointerRenderer {...defaultProps} />);

    const pointerDiv = container.querySelector('.pointer-component');
    expect(pointerDiv).toHaveStyle({
      transform: undefined,
    });
  });

  it('should apply correct image styles', () => {
    render(<PointerRenderer {...defaultProps} />);

    const img = screen.getByAltText('Wheel pointer');
    expect(img).toHaveStyle({
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    });
  });

  it('should have pointer-events none to allow clicking through', () => {
    const { container } = render(<PointerRenderer {...defaultProps} />);

    const pointerDiv = container.querySelector('.pointer-component');
    expect(pointerDiv).toHaveStyle({ pointerEvents: 'none' });
  });

  it('should have correct z-index for layering', () => {
    const { container } = render(<PointerRenderer {...defaultProps} />);

    const pointerDiv = container.querySelector('.pointer-component');
    expect(pointerDiv).toHaveStyle({ zIndex: 20 });
  });

  it('should apply correct CSS class name', () => {
    const { container } = render(<PointerRenderer {...defaultProps} />);

    expect(container.querySelector('.pointer-component')).toBeInTheDocument();
  });

  it('should handle different scale factors correctly', () => {
    const testCases = [
      {
        scale: 0.25,
        expectedLeft: '90px',
        expectedTop: '10px',
        expectedWidth: '20px',
        expectedHeight: '30px',
      },
      {
        scale: 1.5,
        expectedLeft: '540px',
        expectedTop: '60px',
        expectedWidth: '120px',
        expectedHeight: '180px',
      },
      {
        scale: 2,
        expectedLeft: '720px',
        expectedTop: '80px',
        expectedWidth: '160px',
        expectedHeight: '240px',
      },
    ];

    testCases.forEach(({ scale, expectedLeft, expectedTop, expectedWidth, expectedHeight }) => {
      const { container } = render(<PointerRenderer {...defaultProps} scale={scale} />);

      const pointerDiv = container.querySelector('.pointer-component');
      expect(pointerDiv).toHaveStyle({
        left: expectedLeft,
        top: expectedTop,
        width: expectedWidth,
        height: expectedHeight,
      });
    });
  });
});
