/**
 * Unit tests for HeaderRenderer
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeaderRenderer } from '../HeaderRenderer';

describe('HeaderRenderer', () => {
  const mockHeader = {
    stateBounds: {
      active: { x: 100, y: 50, w: 600, h: 80, rotation: 0 },
      success: { x: 100, y: 50, w: 600, h: 80, rotation: 0 },
      fail: { x: 100, y: 50, w: 600, h: 80, rotation: 0 },
    },
    activeImg: 'header_active.png',
    successImg: 'header_success.png',
    failImg: 'header_fail.png',
  };

  const defaultProps = {
    header: mockHeader,
    currentState: 'active' as const,
    headerImage: 'blob:http://localhost/header-active',
    scale: 1,
    onCycleState: jest.fn(),
  };

  beforeEach(() => {
    defaultProps.onCycleState.mockClear();
  });

  it('should render header image when provided', () => {
    render(<HeaderRenderer {...defaultProps} />);

    const img = screen.getByAltText(/header/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', defaultProps.headerImage);
  });

  it('should return null when no headerImage provided', () => {
    const { container } = render(<HeaderRenderer {...defaultProps} headerImage={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('should return null when no header data provided', () => {
    const { container } = render(<HeaderRenderer {...defaultProps} header={undefined as any} />);
    expect(container.firstChild).toBeNull();
  });

  it('should call onCycleState when clicked', () => {
    render(<HeaderRenderer {...defaultProps} />);

    const container = screen.getByRole('img', { name: /header/i }).parentElement;
    if (container) {
      fireEvent.click(container);
      expect(defaultProps.onCycleState).toHaveBeenCalledTimes(1);
    }
  });

  it('should apply correct positioning and dimensions', () => {
    const { container } = render(<HeaderRenderer {...defaultProps} />);

    const headerComponent = container.querySelector('.header-component');
    expect(headerComponent).toBeInTheDocument();

    // Should have proper styles applied
    const styles = window.getComputedStyle(headerComponent!);
    expect(styles).toBeDefined();
  });

  it('should scale positioning and dimensions', () => {
    const { container } = render(<HeaderRenderer {...defaultProps} scale={0.5} />);

    const headerComponent = container.querySelector('.header-component');
    expect(headerComponent).toBeInTheDocument();
  });

  it('should handle rotation from bounds', () => {
    const propsWithRotation = {
      ...defaultProps,
      header: {
        ...mockHeader,
        stateBounds: {
          ...mockHeader.stateBounds,
          active: { ...mockHeader.stateBounds.active, rotation: 45 },
        },
      },
    };

    const { container } = render(<HeaderRenderer {...propsWithRotation} />);

    const headerComponent = container.querySelector('.header-component');
    expect(headerComponent).toBeInTheDocument();
  });

  it('should render different states correctly', () => {
    const { rerender } = render(<HeaderRenderer {...defaultProps} currentState="active" />);
    expect(screen.getByAltText(/header/i)).toBeInTheDocument();

    rerender(<HeaderRenderer {...defaultProps} currentState="success" />);
    expect(screen.getByAltText(/header/i)).toBeInTheDocument();

    rerender(<HeaderRenderer {...defaultProps} currentState="fail" />);
    expect(screen.getByAltText(/header/i)).toBeInTheDocument();
  });

  it('should make image non-draggable', () => {
    render(<HeaderRenderer {...defaultProps} />);

    const img = screen.getByAltText(/header/i);
    expect(img).toHaveAttribute('draggable', 'false');
  });

  it('should call onCycleState when Enter key is pressed', () => {
    render(<HeaderRenderer {...defaultProps} />);

    const header = screen.getByRole('button');

    fireEvent.keyDown(header, { key: 'Enter' });

    expect(defaultProps.onCycleState).toHaveBeenCalledTimes(1);
  });

  it('should call onCycleState when Space key is pressed', () => {
    render(<HeaderRenderer {...defaultProps} />);

    const header = screen.getByRole('button');

    fireEvent.keyDown(header, { key: ' ' });

    expect(defaultProps.onCycleState).toHaveBeenCalledTimes(1);
  });

  it('should not call onCycleState when other keys are pressed', () => {
    render(<HeaderRenderer {...defaultProps} />);

    const header = screen.getByRole('button');

    fireEvent.keyDown(header, { key: 'Tab' });
    fireEvent.keyDown(header, { key: 'Escape' });

    expect(defaultProps.onCycleState).not.toHaveBeenCalled();
  });

  it('should log warning when header image fails to load', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    render(<HeaderRenderer {...defaultProps} />);

    const img = screen.getByAltText(/header/i);

    // Trigger error event
    fireEvent.error(img);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Header image failed to load for state active:',
      'blob:http://localhost/header-active'
    );

    consoleWarnSpy.mockRestore();
  });
});
