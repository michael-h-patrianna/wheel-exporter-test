/**
 * Comprehensive test suite for ButtonSpinRenderer
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ButtonSpinRenderer } from '../ButtonSpinRenderer';
import { ButtonSpinComponent, ButtonSpinState } from '../../../types';
import { createMockButtonSpin, createMockButtonSpinWithMissingSpinningState } from '../../../test-utils';

describe('ButtonSpinRenderer', () => {
  const mockButtonSpin = createMockButtonSpin();

  const defaultProps = {
    buttonSpin: mockButtonSpin,
    currentState: 'default' as ButtonSpinState,
    buttonImage: 'https://example.com/button-default.png',
    scale: 1,
    onSpin: jest.fn(),
    isSpinning: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render button image with correct props', () => {
    render(<ButtonSpinRenderer {...defaultProps} />);

    const img = screen.getByAltText('Spin button default');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', defaultProps.buttonImage);
  });

  it('should return null when buttonSpin is not provided', () => {
    const { container } = render(
      <ButtonSpinRenderer
        {...defaultProps}
        buttonSpin={undefined}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should return null when buttonImage is not provided', () => {
    const { container } = render(
      <ButtonSpinRenderer
        {...defaultProps}
        buttonImage={undefined}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should return null when bounds for current state are missing', () => {
    const buttonSpinWithoutBounds = createMockButtonSpinWithMissingSpinningState() as unknown as ButtonSpinComponent;

    const { container } = render(
      <ButtonSpinRenderer
        {...defaultProps}
        buttonSpin={buttonSpinWithoutBounds}
        currentState="spinning"
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should calculate correct CSS variables for positioning and dimensions', () => {
    const { container } = render(<ButtonSpinRenderer {...defaultProps} />);

    const button = container.querySelector('.button-spin-component');
    // Position: center to top-left conversion
    // left = (x * scale) - (width / 2) = 400 - 50 = 350
    // top = (y * scale) - (height / 2) = 500 - 50 = 450
    expect(button).toHaveStyle({
      '--button-left': '350px',
      '--button-top': '450px',
      '--button-width': '100px',
      '--button-height': '100px',
      '--button-transform': 'none',
    });
  });

  it('should scale dimensions correctly', () => {
    const { container } = render(
      <ButtonSpinRenderer {...defaultProps} scale={0.5} />
    );

    const button = container.querySelector('.button-spin-component');
    // width = 100 * 0.5 = 50, height = 100 * 0.5 = 50
    // left = (400 * 0.5) - (50 / 2) = 200 - 25 = 175
    // top = (500 * 0.5) - (50 / 2) = 250 - 25 = 225
    expect(button).toHaveStyle({
      '--button-left': '175px',
      '--button-top': '225px',
      '--button-width': '50px',
      '--button-height': '50px',
    });
  });

  it('should apply rotation when provided', () => {
    const buttonSpinWithRotation = createMockButtonSpin({
      stateBounds: {
        default: { x: 400, y: 500, w: 100, h: 100, rotation: 90 },
        spinning: { x: 400, y: 500, w: 100, h: 100, rotation: 90 },
      },
    });

    const { container } = render(
      <ButtonSpinRenderer {...defaultProps} buttonSpin={buttonSpinWithRotation} />
    );

    const button = container.querySelector('.button-spin-component');
    expect(button).toHaveStyle({
      '--button-transform': 'rotate(90deg)',
    });
  });

  it('should call onSpin when clicked', () => {
    const onSpin = jest.fn();
    render(<ButtonSpinRenderer {...defaultProps} onSpin={onSpin} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onSpin).toHaveBeenCalledTimes(1);
  });

  it('should not call onSpin when disabled (spinning)', () => {
    const onSpin = jest.fn();
    render(<ButtonSpinRenderer {...defaultProps} onSpin={onSpin} isSpinning={true} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onSpin).not.toHaveBeenCalled();
  });

  it('should be disabled when isSpinning is true', () => {
    render(<ButtonSpinRenderer {...defaultProps} isSpinning={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should not be disabled when isSpinning is false', () => {
    render(<ButtonSpinRenderer {...defaultProps} isSpinning={false} />);

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('should display correct state in data attributes', () => {
    const { container } = render(<ButtonSpinRenderer {...defaultProps} />);

    const button = container.querySelector('.button-spin-component');
    expect(button).toHaveAttribute('data-button-state', 'default');
    expect(button).toHaveAttribute('data-spinning', 'false');
  });

  it('should update data-spinning attribute when spinning', () => {
    const { container } = render(
      <ButtonSpinRenderer {...defaultProps} isSpinning={true} currentState="spinning" />
    );

    const button = container.querySelector('.button-spin-component');
    expect(button).toHaveAttribute('data-button-state', 'spinning');
    expect(button).toHaveAttribute('data-spinning', 'true');
  });

  it('should have correct title when not spinning', () => {
    const { container } = render(<ButtonSpinRenderer {...defaultProps} />);

    const button = container.querySelector('.button-spin-component');
    expect(button).toHaveAttribute('title', 'Click to spin the wheel!');
  });

  it('should have correct title when spinning', () => {
    const { container } = render(<ButtonSpinRenderer {...defaultProps} isSpinning={true} />);

    const button = container.querySelector('.button-spin-component');
    expect(button).toHaveAttribute('title', 'Wheel is spinning...');
  });

  it('should have correct ARIA label when not spinning', () => {
    render(<ButtonSpinRenderer {...defaultProps} />);

    const button = screen.getByRole('button', { name: 'Spin the wheel' });
    expect(button).toBeInTheDocument();
  });

  it('should have correct ARIA label when spinning', () => {
    render(<ButtonSpinRenderer {...defaultProps} isSpinning={true} />);

    const button = screen.getByRole('button', { name: 'Wheel is spinning' });
    expect(button).toBeInTheDocument();
  });

  it('should make image non-draggable', () => {
    render(<ButtonSpinRenderer {...defaultProps} />);

    const img = screen.getByAltText('Spin button default');
    expect(img).toHaveAttribute('draggable', 'false');
  });

  // Image error handling test removed - onError handler was removed from production code
  // for production readiness. Image loading is tested via visual rendering tests.

  it('should apply correct CSS class names', () => {
    const { container } = render(<ButtonSpinRenderer {...defaultProps} />);

    expect(container.querySelector('.button-spin-component')).toBeInTheDocument();
    expect(container.querySelector('.button-spin-image')).toBeInTheDocument();
  });
});
