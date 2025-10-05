/**
 * Unit tests for BackgroundRenderer
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BackgroundRenderer } from '../BackgroundRenderer';

describe('BackgroundRenderer', () => {
  const defaultProps = {
    backgroundImage: 'blob:http://localhost/background',
    scale: 1,
    frameWidth: 800,
    frameHeight: 600,
  };

  it('should render background image when provided', () => {
    render(<BackgroundRenderer {...defaultProps} />);

    const img = screen.getByAltText('Background');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', defaultProps.backgroundImage);
  });

  it('should return null when no background image provided', () => {
    const { container } = render(<BackgroundRenderer {...defaultProps} backgroundImage={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('should apply correct scale to dimensions', () => {
    const { container } = render(<BackgroundRenderer {...defaultProps} scale={0.5} />);

    const wrapper = container.querySelector('.background-component');
    expect(wrapper).toHaveStyle({
      '--bg-width': '400px', // 800 * 0.5
      '--bg-height': '300px', // 600 * 0.5
    });
  });

  it('should have correct ARIA attributes', () => {
    const { container } = render(<BackgroundRenderer {...defaultProps} />);

    const wrapper = container.querySelector('.background-component');
    expect(wrapper).toHaveAttribute('role', 'img');
    expect(wrapper).toHaveAttribute('aria-label', 'Wheel theme background');
  });

  it('should make image non-draggable', () => {
    render(<BackgroundRenderer {...defaultProps} />);

    const img = screen.getByAltText('Background');
    expect(img).toHaveAttribute('draggable', 'false');
  });

  it('should handle image load error', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    render(<BackgroundRenderer {...defaultProps} />);

    const img = screen.getByAltText('Background');
    img.dispatchEvent(new Event('error'));

    expect(consoleSpy).toHaveBeenCalledWith(
      'Background image failed to load:',
      defaultProps.backgroundImage
    );

    consoleSpy.mockRestore();
  });

  it('should scale dimensions correctly with different scales', () => {
    const { container, rerender } = render(<BackgroundRenderer {...defaultProps} scale={2} />);

    let wrapper = container.querySelector('.background-component');
    expect(wrapper).toHaveStyle({
      '--bg-width': '1600px',
      '--bg-height': '1200px',
    });

    rerender(<BackgroundRenderer {...defaultProps} scale={0.25} />);

    wrapper = container.querySelector('.background-component');
    expect(wrapper).toHaveStyle({
      '--bg-width': '200px',
      '--bg-height': '150px',
    });
  });
});
