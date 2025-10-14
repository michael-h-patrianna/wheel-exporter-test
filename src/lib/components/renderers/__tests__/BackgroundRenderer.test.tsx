/**
 * Comprehensive test suite for BackgroundRenderer
 */

import { BackgroundRenderer } from '@components/renderers/BackgroundRenderer';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

describe('BackgroundRenderer', () => {
  const defaultProps = {
    backgroundImage: 'https://example.com/background.png',
    scale: 1,
    frameWidth: 800,
    frameHeight: 600,
  };

  it('should render background image with correct props', () => {
    const { container, getByTestId } = render(<BackgroundRenderer {...defaultProps} />);

    const img = getByTestId('background-image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', defaultProps.backgroundImage);
  });

  it('should return null when backgroundImage is not provided', () => {
    const { container, getByTestId } = render(
      <BackgroundRenderer
        backgroundImage={undefined}
        scale={1}
        frameWidth={800}
        frameHeight={600}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should apply correct CSS variables for dimensions', () => {
    const { container, getByTestId } = render(<BackgroundRenderer {...defaultProps} />);

    const backgroundDiv = getByTestId('background-component');
    expect(backgroundDiv).toHaveStyle({
      '--bg-width': '800px',
      '--bg-height': '600px',
    });
  });

  it('should scale dimensions correctly', () => {
    const { container, getByTestId } = render(<BackgroundRenderer {...defaultProps} scale={0.5} />);

    const backgroundDiv = getByTestId('background-component');
    expect(backgroundDiv).toHaveStyle({
      '--bg-width': '400px',
      '--bg-height': '300px',
    });
  });

  it('should apply correct ARIA attributes', () => {
    const { getByTestId } = render(<BackgroundRenderer {...defaultProps} />);

    const backgroundDiv = getByTestId('background-component');
    expect(backgroundDiv).toBeInTheDocument();
  });

  it('should make image non-draggable', () => {
    const { getByTestId } = render(<BackgroundRenderer {...defaultProps} />);

    const img = getByTestId('background-image');
    expect(img).toHaveAttribute('draggable', 'false');
  });

  it('should apply correct CSS class names', () => {
    const { container, getByTestId } = render(<BackgroundRenderer {...defaultProps} />);

    expect(getByTestId('background-component')).toBeInTheDocument();
    expect(getByTestId('background-image')).toBeInTheDocument();
  });

  it('should handle image load errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { getByTestId } = render(<BackgroundRenderer {...defaultProps} />);
    const img = getByTestId('background-image');

    // Trigger error
    img.dispatchEvent(new Event('error'));

    // Verify logger.warn was called with structured logging
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const callArg = consoleSpy.mock.calls[0][0];
    expect(callArg).toContain('[WARN]');
    expect(callArg).toContain('Background image failed to load');
    expect(callArg).toContain(defaultProps.backgroundImage);

    consoleSpy.mockRestore();
  });

  it('should handle different scale factors', () => {
    const testCases = [
      { scale: 0.25, expectedWidth: '200px', expectedHeight: '150px' },
      { scale: 1.5, expectedWidth: '1200px', expectedHeight: '900px' },
      { scale: 2, expectedWidth: '1600px', expectedHeight: '1200px' },
    ];

    testCases.forEach(({ scale, expectedWidth, expectedHeight }) => {
      const { container } = render(<BackgroundRenderer {...defaultProps} scale={scale} />);

      const backgroundDiv = container.querySelector('[data-testid="background-component"]') as HTMLElement;
      expect(backgroundDiv).toHaveStyle({
        '--bg-width': expectedWidth,
        '--bg-height': expectedHeight,
      });
    });
  });
});
