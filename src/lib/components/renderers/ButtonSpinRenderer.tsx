import { ButtonSpinComponent, ButtonSpinState } from '@lib-types';
import React from 'react';
import styles from '../WheelViewer.module.css';

/**
 * ButtonSpinRenderer Component
 *
 * PURPOSE: Displays the spin button with interactive states
 *
 * This component renders the spin button that users click to spin the wheel.
 * It supports two visual states (default and spinning) and can trigger
 * a simulated wheel spin animation.
 *
 * What this does:
 * - Displays spin button image for current state
 * - Clicking toggles between default and spinning states
 * - Simulates a 3-second spin duration
 * - Positions using center-based x,y coordinates
 * - Scales based on provided scale factor
 */

interface ButtonSpinRendererProps {
  /** Button spin data from ZIP file */
  buttonSpin?: ButtonSpinComponent;
  /** Current button state */
  currentState: ButtonSpinState;
  /** Button image URL for current state */
  buttonImage?: string;
  /** Scale factor for responsive sizing */
  scale: number;
  /** Function called when user clicks the button */
  onSpin: () => void;
  /** Whether the wheel is currently spinning */
  isSpinning: boolean;
}

export const ButtonSpinRenderer: React.FC<ButtonSpinRendererProps> = ({
  buttonSpin,
  currentState,
  buttonImage,
  scale,
  onSpin,
  isSpinning,
}) => {
  // ============================================================================
  // EARLY RETURNS & VALIDATION
  // ============================================================================

  if (!buttonSpin || !buttonImage) return null;

  const bounds = buttonSpin.stateBounds[currentState];
  if (!bounds) return null;

  // ============================================================================
  // DIMENSION CALCULATION
  // ============================================================================

  /**
   * Calculate scaled dimensions
   * ImageBounds use center-based positioning
   */
  const width = bounds.w * scale;
  const height = bounds.h * scale;

  // ============================================================================
  // CSS VARIABLES GENERATION
  // ============================================================================

  /**
   * Create CSS positioning variables
   * x,y represent the center point - convert to top-left for CSS
   */
  const cssVariables: Record<string, string> = {
    // Position: center to top-left conversion
    '--button-left': `${bounds.x * scale - width / 2}px`,
    '--button-top': `${bounds.y * scale - height / 2}px`,

    // Scaled dimensions
    '--button-width': `${width}px`,
    '--button-height': `${height}px`,

    // Optional rotation
    '--button-transform': bounds.rotation ? `rotate(${bounds.rotation}deg)` : 'none',
  };

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <button
      className={styles.buttonSpinComponent}
      data-testid="button-spin-component"
      data-button-state={currentState}
      data-spinning={isSpinning}
      style={cssVariables}
      onClick={onSpin}
      disabled={isSpinning}
      title={isSpinning ? 'Wheel is spinning...' : 'Click to spin the wheel!'}
      aria-label={isSpinning ? 'Wheel is spinning' : 'Spin the wheel'}
    >
      <img
        src={buttonImage}
        alt={`Spin button ${currentState}`}
        className={styles.buttonSpinImage}
        data-testid="button-spin-image"
        draggable={false}
      />
    </button>
  );
};
