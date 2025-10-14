/**
 * @vitest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { RewardsButtonStyle } from '../../../types';
import { ButtonRenderer } from '../ButtonRenderer';

describe('ButtonRenderer', () => {
  // Helper to create mock button styles
  const createMockButtonStyles = (): RewardsButtonStyle => ({
    frame: {
      borderRadius: 50,
      backgroundFill: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          rotation: 163,
          stops: [
            { color: '#47fff4', position: 0 },
            { color: '#0586ae', position: 0.93 },
          ],
          transform: [[1, 0, 0], [0, 1, 0]], // Identity transform
        },
      },
      dimensions: { width: 103.19, height: 39.89 },
      padding: { vertical: 20, horizontal: 40 },
      dropShadows: [
        { x: 0, y: 4, blur: 20, spread: 0, color: '#0586aecc' },
        { x: 0, y: -4, blur: 20, spread: 0, color: '#47fff4cc' },
      ],
      stroke: { width: 2, color: '#9ffff8' },
    },
    text: {
      fontSize: 16,
      color: '#ffffff',
      fontWeight: 900,
      lineHeightPx: 16,
    },
  });

  const createDisabledButtonStyles = (): RewardsButtonStyle => ({
    frame: {
      borderRadius: 50,
      backgroundFill: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          rotation: 163,
          stops: [
            { color: '#0586ae', position: 0 },
            { color: '#0586ae', position: 0.93 },
          ],
          transform: [[1, 0, 0], [0, 1, 0]], // Identity transform
        },
      },
      dimensions: { width: 103.19, height: 39.89 },
      padding: { vertical: 20, horizontal: 40 },
      dropShadows: [],
      stroke: { width: 2, color: '#2badd5' },
    },
    text: {
      fontSize: 16,
      color: '#ffffff66',
      fontWeight: 900,
      lineHeightPx: 16,
    },
  });

  const createHoverButtonStyles = (): RewardsButtonStyle => ({
    frame: {
      borderRadius: 50,
      backgroundFill: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          rotation: 163,
          stops: [
            { color: '#1ec0d0', position: 0 },
            { color: '#0586ae', position: 0.93 },
          ],
          transform: [[1, 0, 0], [0, 1, 0]], // Identity transform
        },
      },
      dimensions: { width: 103.19, height: 39.89 },
      padding: { vertical: 20, horizontal: 40 },
      dropShadows: [
        { x: 0, y: 4, blur: 20, spread: 0, color: '#0586aecc' },
        { x: 0, y: -4, blur: 20, spread: 0, color: '#47fff4cc' },
      ],
      stroke: { width: 2, color: '#25ecff' },
    },
    text: {
      fontSize: 16,
      color: '#ffffff',
      fontWeight: 900,
      lineHeightPx: 16,
    },
  });

  const createActiveButtonStyles = (): RewardsButtonStyle => ({
    frame: {
      borderRadius: 50,
      backgroundFill: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          rotation: 163,
          stops: [
            { color: '#026786', position: 0 },
            { color: '#0586ae', position: 0.93 },
          ],
          transform: [[1, 0, 0], [0, 1, 0]], // Identity transform
        },
      },
      dimensions: { width: 103.19, height: 39.89 },
      padding: { vertical: 20, horizontal: 40 },
      dropShadows: [{ x: 0, y: 2, blur: 10, spread: 0, color: '#0586aecc' }],
      stroke: { width: 2, color: '#0586ae' },
    },
    text: {
      fontSize: 16,
      color: '#ffffff',
      fontWeight: 900,
      lineHeightPx: 16,
    },
  });

  describe('Basic Rendering', () => {
    it('should render button with text', () => {
      const buttonStyles = {
        default: createMockButtonStyles(),
      };

      render(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="default"
          text="COLLECT"
          scale={1.0}
        />
      );

      expect(screen.getByRole('button', { name: /COLLECT/i })).toBeInTheDocument();
    });

    it('should return null when buttonStyles is undefined', () => {
      const { container, getByTestId } = render(
        <ButtonRenderer
          buttonStyles={undefined}
          currentState="default"
          text="COLLECT"
          scale={1.0}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should return null when currentState style is missing', () => {
      const buttonStyles = {
        default: createMockButtonStyles(),
      };

      const { container, getByTestId } = render(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="hover" // hover state doesn't exist in buttonStyles
          text="COLLECT"
          scale={1.0}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render with custom className', () => {
      const buttonStyles = {
        default: createMockButtonStyles(),
      };

      render(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="default"
          text="COLLECT"
          scale={1.0}
          className="custom-button"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('button-renderer');
      expect(button).toHaveClass('custom-button');
    });

    it('should apply scaled styles', () => {
      const buttonStyles = {
        default: createMockButtonStyles(),
      };

      render(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="default"
          text="COLLECT"
          scale={2.0}
        />
      );

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);

      // Border radius should be scaled: 50 * 2 = 100
      expect(styles.borderRadius).toBe('100px');
    });
  });

  describe('State Handling', () => {
    it('should render button in default state', () => {
      const buttonStyles = {
        default: createMockButtonStyles(),
      };

      render(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="default"
          text="COLLECT"
          scale={1.0}
        />
      );

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
      expect(button).toHaveAttribute('data-button-state', 'default');
    });

    it('should render button in hover state', () => {
      const buttonStyles = {
        default: createMockButtonStyles(),
        hover: createHoverButtonStyles(),
      };

      render(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="hover"
          text="COLLECT"
          scale={1.0}
        />
      );

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
      expect(button).toHaveAttribute('data-button-state', 'hover');
    });

    it('should render button in active state', () => {
      const buttonStyles = {
        default: createMockButtonStyles(),
        active: createActiveButtonStyles(),
      };

      render(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="active"
          text="COLLECT"
          scale={1.0}
        />
      );

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
      expect(button).toHaveAttribute('data-button-state', 'active');
    });

    it('should render disabled button when currentState is disabled', () => {
      const buttonStyles = {
        default: createMockButtonStyles(),
        disabled: createDisabledButtonStyles(),
      };

      render(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="disabled"
          text="COLLECT"
          scale={1.0}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('data-button-state', 'disabled');
    });

    it('should apply different styles for each state', () => {
      const buttonStyles = {
        default: createMockButtonStyles(),
        hover: createHoverButtonStyles(),
        active: createActiveButtonStyles(),
        disabled: createDisabledButtonStyles(),
      };

      // Test default state
      const { rerender } = render(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="default"
          text="COLLECT"
          scale={1.0}
        />
      );
      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-button-state', 'default');

      // Test hover state
      rerender(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="hover"
          text="COLLECT"
          scale={1.0}
        />
      );
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-button-state', 'hover');

      // Test active state
      rerender(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="active"
          text="COLLECT"
          scale={1.0}
        />
      );
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-button-state', 'active');

      // Test disabled state
      rerender(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="disabled"
          text="COLLECT"
          scale={1.0}
        />
      );
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-button-state', 'disabled');
      expect(button).toBeDisabled();
    });
  });

  describe('Click Handling', () => {
    describe('Click Handling', () => {
    it('should call onClick handler when clicked in default state', () => {
      const handleClick = vi.fn();
      const buttonStyles = {
        default: createMockButtonStyles(),
      };

      render(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="default"
          text="COLLECT"
          scale={1.0}
          onClick={handleClick}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when in disabled state', () => {
      const handleClick = vi.fn();
      const buttonStyles = {
        default: createMockButtonStyles(),
        disabled: createDisabledButtonStyles(),
      };

      render(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="disabled"
          text="COLLECT"
          scale={1.0}
          onClick={handleClick}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Button is disabled, so click handler should not be called
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should call onMouseEnter and onMouseLeave handlers', () => {
      const handleMouseEnter = vi.fn();
      const handleMouseLeave = vi.fn();
      const buttonStyles = {
        default: createMockButtonStyles(),
        hover: createHoverButtonStyles(),
      };

      render(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="default"
          text="COLLECT"
          scale={1.0}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      );

      const button = screen.getByRole('button');

      fireEvent.mouseEnter(button);
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);

      fireEvent.mouseLeave(button);
      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });
  });
  });

  describe('Inline Style Application', () => {
    it('should apply inline styles based on currentState', () => {
      const buttonStyles = {
        default: createMockButtonStyles(),
        hover: createHoverButtonStyles(),
      };

      const { rerender } = render(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="default"
          text="COLLECT"
          scale={1.0}
        />
      );

      const button = screen.getByRole('button');

      // Check that inline styles are applied
      expect(button.style.backgroundColor).toBeTruthy();
      expect(button.style.borderRadius).toBeTruthy();

      // Rerender with hover state
      rerender(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="hover"
          text="COLLECT"
          scale={1.0}
        />
      );

      // Styles should still be present (different values based on state)
      expect(button.style.backgroundColor).toBeTruthy();
    });

    it('should apply box-shadow from dropShadows array', () => {
      const buttonStyles = {
        default: {
          ...createMockButtonStyles(),
          dropShadows: [
            {
              inset: false,
              xOffset: 0,
              yOffset: 4,
              blur: 8,
              spread: 0,
              color: { r: 0, g: 0, b: 0, a: 0.25 },
            },
          ],
        },
      };

      render(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="default"
          text="COLLECT"
          scale={1.0}
        />
      );

      const button = screen.getByRole('button');
      expect(button.style.boxShadow).toBeTruthy();
    });

    it('should apply scaled styles when scale is provided', () => {
      const buttonStyles = {
        default: createMockButtonStyles(),
      };

      render(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="default"
          text="COLLECT"
          scale={0.5}
        />
      );

      const button = screen.getByRole('button');

      // Check that styles are applied (values will be scaled)
      expect(button.style.borderRadius).toBeTruthy();
      expect(button.style.fontSize).toBeTruthy();
    });

    it('should not inject style tags into document', () => {
      const buttonStyles = {
        default: createMockButtonStyles(),
        hover: createHoverButtonStyles(),
        active: createActiveButtonStyles(),
        disabled: createDisabledButtonStyles(),
      };

      render(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="default"
          text="COLLECT"
          scale={1.0}
        />
      );

      // Should NOT have any style tags (inline styles only)
      const styleTags = document.querySelectorAll('style');
      const buttonRendererStyles = Array.from(styleTags).filter((style) =>
        style.textContent?.includes('btn-')
      );
      expect(buttonRendererStyles).toHaveLength(0);
    });

    it('should update inline styles when currentState changes', () => {
      const buttonStyles = {
        default: createMockButtonStyles(),
        hover: createHoverButtonStyles(),
        active: createActiveButtonStyles(),
      };

      const { rerender } = render(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="default"
          text="COLLECT"
          scale={1.0}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-button-state', 'default');

      // Change to hover state
      rerender(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="hover"
          text="COLLECT"
          scale={1.0}
        />
      );
      expect(button).toHaveAttribute('data-button-state', 'hover');

      // Change to active state
      rerender(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="active"
          text="COLLECT"
          scale={1.0}
        />
      );
      expect(button).toHaveAttribute('data-button-state', 'active');
    });
  });

  describe('All States Together', () => {
    it('should render with all states defined', () => {
      const buttonStyles = {
        default: createMockButtonStyles(),
        hover: createHoverButtonStyles(),
        active: createActiveButtonStyles(),
        disabled: createDisabledButtonStyles(),
      };

      render(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="default"
          text="COLLECT"
          scale={1.0}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('COLLECT');
      expect(button).toHaveAttribute('data-button-state', 'default');
    });

    it('should respect custom className with all states', () => {
      const buttonStyles = {
        default: createMockButtonStyles(),
        hover: createHoverButtonStyles(),
        active: createActiveButtonStyles(),
        disabled: createDisabledButtonStyles(),
      };

      render(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="hover"
          text="COLLECT"
          scale={1.0}
          className="custom-button"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-button');
      expect(button).toHaveAttribute('data-button-state', 'hover');
    });
  });

  describe('Button Type', () => {
    it('should render as button element', () => {
      const buttonStyles = {
        default: createMockButtonStyles(),
      };

      render(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="default"
          text="COLLECT"
          scale={1.0}
        />
      );

      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveAttribute('data-button-state', 'default');
    });
  });

  describe('Text Rendering', () => {
    it('should render text content directly in button', () => {
      const buttonStyles = {
        default: createMockButtonStyles(),
      };

      render(
        <ButtonRenderer
          buttonStyles={buttonStyles}
          currentState="default"
          text="COLLECT REWARD"
          scale={1.0}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('COLLECT REWARD');

      // Text renders in a span with data-testid="button-text"
      const textSpan = button.querySelector('[data-testid="button-text"]');
      expect(textSpan).toBeInTheDocument();
      expect(textSpan).toHaveTextContent('COLLECT REWARD');
    });
  });
});
