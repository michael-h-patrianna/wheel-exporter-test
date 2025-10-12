/**
 * Comprehensive test suite for HeaderRenderer
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeaderRenderer } from '../HeaderRenderer';
import { HeaderComponent, HeaderState } from '../../../types';
import { createMockHeader, createMockHeaderWithMissingFailState } from '../../../test-utils';

describe('HeaderRenderer', () => {
  const mockHeader = createMockHeader();

  const defaultProps = {
    header: mockHeader,
    currentState: 'active' as HeaderState,
    scale: 1,
    headerImage: 'https://example.com/header-active.png',
    onCycleState: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render header image with correct props', () => {
    render(<HeaderRenderer {...defaultProps} />);

    const img = screen.getByAltText('Header active');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', defaultProps.headerImage);
  });

  it('should return null when header is not provided', () => {
    const { container } = render(
      <HeaderRenderer
        {...defaultProps}
        header={undefined as unknown as HeaderComponent}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should return null when headerImage is not provided', () => {
    const { container } = render(
      <HeaderRenderer
        {...defaultProps}
        headerImage={undefined}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should return null when bounds for current state are missing', () => {
    const headerWithoutBounds = createMockHeaderWithMissingFailState() as unknown as HeaderComponent;

    const { container } = render(
      <HeaderRenderer
        {...defaultProps}
        header={headerWithoutBounds}
        currentState="fail" // 'fail' is missing from stateBounds
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should calculate correct CSS variables for positioning and dimensions', () => {
    const { container } = render(<HeaderRenderer {...defaultProps} />);

    const headerDiv = container.querySelector('.header-component');
    // Position: center to top-left conversion
    // left = (x * scale) - (width / 2) = 400 - 100 = 300
    // top = (y * scale) - (height / 2) = 100 - 25 = 75
    expect(headerDiv).toHaveStyle({
      '--header-left': '300px',
      '--header-top': '75px',
      '--header-width': '200px',
      '--header-height': '50px',
      '--header-transform': 'none',
    });
  });

  it('should scale dimensions correctly', () => {
    const { container } = render(
      <HeaderRenderer {...defaultProps} scale={0.5} />
    );

    const headerDiv = container.querySelector('.header-component');
    // width = 200 * 0.5 = 100, height = 50 * 0.5 = 25
    // left = (400 * 0.5) - (100 / 2) = 200 - 50 = 150
    // top = (100 * 0.5) - (25 / 2) = 50 - 12.5 = 37.5
    expect(headerDiv).toHaveStyle({
      '--header-left': '150px',
      '--header-top': '37.5px',
      '--header-width': '100px',
      '--header-height': '25px',
    });
  });

  it('should apply rotation when provided', () => {
    const headerWithRotation = createMockHeader({
      stateBounds: {
        active: { x: 400, y: 100, w: 200, h: 50, rotation: 45 },
        success: { x: 400, y: 100, w: 200, h: 50, rotation: 45 },
        fail: { x: 400, y: 100, w: 200, h: 50, rotation: 45 },
      },
    });

    const { container } = render(
      <HeaderRenderer {...defaultProps} header={headerWithRotation} />
    );

    const headerDiv = container.querySelector('.header-component');
    expect(headerDiv).toHaveStyle({
      '--header-transform': 'rotate(45deg)',
    });
  });

  it('should call onCycleState when clicked', () => {
    const onCycleState = jest.fn();
    render(<HeaderRenderer {...defaultProps} onCycleState={onCycleState} />);

    const headerDiv = screen.getByRole('button');
    fireEvent.click(headerDiv);

    expect(onCycleState).toHaveBeenCalledTimes(1);
  });

  it('should call onCycleState when Enter key is pressed', () => {
    const onCycleState = jest.fn();
    render(<HeaderRenderer {...defaultProps} onCycleState={onCycleState} />);

    const headerDiv = screen.getByRole('button');
    fireEvent.keyDown(headerDiv, { key: 'Enter' });

    expect(onCycleState).toHaveBeenCalledTimes(1);
  });

  it('should call onCycleState when Space key is pressed', () => {
    const onCycleState = jest.fn();
    render(<HeaderRenderer {...defaultProps} onCycleState={onCycleState} />);

    const headerDiv = screen.getByRole('button');
    fireEvent.keyDown(headerDiv, { key: ' ' });

    expect(onCycleState).toHaveBeenCalledTimes(1);
  });

  it('should not call onCycleState for other keys', () => {
    const onCycleState = jest.fn();
    render(<HeaderRenderer {...defaultProps} onCycleState={onCycleState} />);

    const headerDiv = screen.getByRole('button');
    fireEvent.keyDown(headerDiv, { key: 'a' });
    fireEvent.keyDown(headerDiv, { key: 'Escape' });

    expect(onCycleState).not.toHaveBeenCalled();
  });

  it('should display correct state in data attribute', () => {
    const { container, rerender } = render(<HeaderRenderer {...defaultProps} />);

    let headerDiv = container.querySelector('.header-component');
    expect(headerDiv).toHaveAttribute('data-header-state', 'active');

    rerender(<HeaderRenderer {...defaultProps} currentState="success" />);
    headerDiv = container.querySelector('.header-component');
    expect(headerDiv).toHaveAttribute('data-header-state', 'success');

    rerender(<HeaderRenderer {...defaultProps} currentState="fail" />);
    headerDiv = container.querySelector('.header-component');
    expect(headerDiv).toHaveAttribute('data-header-state', 'fail');
  });

  it('should have correct ARIA attributes', () => {
    render(<HeaderRenderer {...defaultProps} currentState="success" />);

    const headerDiv = screen.getByRole('button', {
      name: 'Header in success state. Click to change state.',
    });
    expect(headerDiv).toBeInTheDocument();
    expect(headerDiv).toHaveAttribute('tabIndex', '0');
  });

  it('should make image non-draggable', () => {
    render(<HeaderRenderer {...defaultProps} />);

    const img = screen.getByAltText('Header active');
    expect(img).toHaveAttribute('draggable', 'false');
  });

  it('should have correct title attribute', () => {
    const { container } = render(<HeaderRenderer {...defaultProps} currentState="fail" />);

    const headerDiv = container.querySelector('.header-component');
    expect(headerDiv).toHaveAttribute('title', 'Header Component (FAIL) - Click to cycle states');
  });

  it('should handle image load errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    render(<HeaderRenderer {...defaultProps} currentState="success" />);
    const img = screen.getByAltText('Header success');

    // Trigger error
    img.dispatchEvent(new Event('error'));

    // Verify logger.warn was called with structured logging
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const callArg = consoleSpy.mock.calls[0][0];
    expect(callArg).toContain('[WARN]');
    expect(callArg).toContain('Header image failed to load');
    expect(callArg).toContain(defaultProps.headerImage);

    consoleSpy.mockRestore();
  });

  it('should apply correct CSS class names', () => {
    const { container } = render(<HeaderRenderer {...defaultProps} />);

    expect(container.querySelector('.header-component')).toBeInTheDocument();
    expect(container.querySelector('.header-image')).toBeInTheDocument();
  });
});
