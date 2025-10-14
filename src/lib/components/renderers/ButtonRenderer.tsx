import { RewardsButtonStyle } from '@lib-types';
import { buildGradient } from '@utils/styleBuilders';
import React from 'react';

/**
 * Helper: Build box-shadow CSS from drop shadow array
 */
function buildDropShadows(shadows: RewardsButtonStyle['frame']['dropShadows'], scale: number): string {
  if (!shadows || shadows.length === 0) return 'none';

  return shadows
    .map((shadow) => {
      const x = Math.round(shadow.x * scale);
      const y = Math.round(shadow.y * scale);
      const blur = Math.round(shadow.blur * scale);
      const spread = Math.round(shadow.spread * scale);
      return `${x}px ${y}px ${blur}px ${spread}px ${shadow.color}`;
    })
    .join(', ');
}

/**
 * ButtonRenderer Component
 *
 * PURPOSE: Renders interactive button elements using imported theme styling data
 *
 * This component creates a fully functional button that responds to user interactions
 * (hover, active, disabled) using visual styles defined in the imported theme.
 * Each state (default, hover, active, disabled) has its own styling configuration
 * that gets applied dynamically based on user interaction.
 *
 * KEY CONCEPTS:
 * - Interactive Button States: Responds to user hover, click, and disabled states
 * - Theme-Based Styling: Uses imported theme data for all visual properties
 * - Parent-Managed State: Parent component controls currentState and event handlers
 *
 * Integration Pattern (from questline-exporter-test):
 * - Parent manages button state via event handlers
 * - ButtonRenderer receives currentState and applies appropriate styling
 * - Inline styles necessary for dynamic theme data from positions.json
 *
 * @example
 * ```tsx
 * const [buttonState, setButtonState] = useState<'default' | 'hover' | 'active' | 'disabled'>('default');
 *
 * <ButtonRenderer
 *   buttonStyles={wheelData.rewards.button.stateStyles}
 *   currentState={buttonState}
 *   text="COLLECT"
 *   onMouseEnter={() => setButtonState('hover')}
 *   onMouseLeave={() => setButtonState('default')}
 *   onClick={handleCollect}
 *   scale={1.5}
 * />
 * ```
 */

export type ButtonState = 'default' | 'hover' | 'active' | 'disabled';

interface ButtonRendererProps {
  /** Button styles for all states from positions.json */
  buttonStyles?: {
    default?: RewardsButtonStyle;
    hover?: RewardsButtonStyle;
    active?: RewardsButtonStyle;
    disabled?: RewardsButtonStyle;
  };
  /** Current visual state of the button (affects styling and behavior) */
  currentState: ButtonState;
  /** Button text content */
  text: string;
  /** Handler for mouse enter events (triggers hover state in parent) */
  onMouseEnter?: () => void;
  /** Handler for mouse leave events (returns to default state in parent) */
  onMouseLeave?: () => void;
  /** Handler for button clicks (triggers actions in parent component) */
  onClick?: () => void;
  /** Scale factor for responsive sizing */
  scale: number;
  /** Optional additional CSS class */
  className?: string;
}

export const ButtonRenderer: React.FC<ButtonRendererProps> = ({
  buttonStyles,
  currentState,
  text,
  onMouseEnter,
  onMouseLeave,
  onClick,
  scale,
  className = '',
}) => {
  // ============================================================================
  // EARLY RETURNS & VALIDATION
  // ============================================================================

  if (!buttonStyles) return null;

  const stateStyle = buttonStyles[currentState];
  if (!stateStyle) return null;

  // ============================================================================
  // CSS VARIABLES GENERATION
  // ============================================================================

  const cssVariables: React.CSSProperties = {
    // Visual styling from state configuration
    background: buildGradient(stateStyle.frame.backgroundFill),
    borderRadius: `${stateStyle.frame.borderRadius * scale}px`,
    boxShadow: buildDropShadows(stateStyle.frame.dropShadows, scale),
    border: stateStyle.frame.stroke
      ? `${stateStyle.frame.stroke.width * scale}px solid ${stateStyle.frame.stroke.color}`
      : 'none',

    // Typography styling
    fontSize: `${stateStyle.text.fontSize * scale}px`,
    color: stateStyle.text.color,
    fontWeight: stateStyle.text.fontWeight,
    lineHeight: stateStyle.text.lineHeightPx ? `${stateStyle.text.lineHeightPx * scale}px` : 'normal',

    // Padding
    padding: `${stateStyle.frame.padding.vertical * scale}px ${stateStyle.frame.padding.horizontal * scale}px`,

    // Layout
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    cursor: currentState === 'disabled' ? 'not-allowed' : 'pointer',
  };

  // Dimension handling
  if (stateStyle.frame.dimensions) {
    cssVariables.width = `${stateStyle.frame.dimensions.width * scale}px`;
    cssVariables.height = `${stateStyle.frame.dimensions.height * scale}px`;
  }

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <button
      className={`button-renderer ${className}`.trim()}
      data-button-state={currentState}
      data-testid="result-button"
      style={cssVariables}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      disabled={currentState === 'disabled'}
      type="button"
      title={`Button Component (${currentState.toUpperCase()})`}
      aria-label={`${text} button`}
    >
      <span data-testid="button-text">{text}</span>
    </button>
  );
};
