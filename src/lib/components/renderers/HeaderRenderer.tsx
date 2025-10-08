import React from 'react';
import { HeaderState, HeaderComponent } from '../../types';

/**
 * HeaderRenderer Component
 *
 * PURPOSE: Displays header images with state cycling for wheel themes
 *
 * This component renders header images extracted from theme ZIP files.
 * Users can click to cycle through different visual states to preview
 * how the header looks in each state.
 *
 * What this does:
 * - Displays header image for current visual state
 * - Clicking cycles through: active → success → fail → active
 * - Positions using x,y coordinates from ZIP data (center-based)
 * - Scales image based on provided scale factor
 * - Supports optional rotation
 */

interface HeaderRendererProps {
  /** Header data from ZIP file including position and bounds for each state */
  header: HeaderComponent;
  /** Current visual state being displayed */
  currentState: HeaderState;
  /** Scale factor for responsive sizing */
  scale: number;
  /** Header image URL for current state */
  headerImage?: string;
  /** Function called when user clicks to cycle to next state */
  onCycleState: () => void;
}

export const HeaderRenderer: React.FC<HeaderRendererProps> = ({
  header,
  currentState,
  scale,
  headerImage,
  onCycleState
}) => {
  // ============================================================================
  // EARLY RETURNS & VALIDATION
  // ============================================================================

  if (!header || !headerImage) return null;

  const bounds = header.stateBounds[currentState];
  if (!bounds) return null;

  // ============================================================================
  // DIMENSION CALCULATION
  // ============================================================================

  /**
   * Calculate scaled dimensions directly from bounds
   * All scaling happens here for clarity
   */
  const width = bounds.w * scale;
  const height = bounds.h * scale;

  // ============================================================================
  // CSS VARIABLES GENERATION
  // ============================================================================

  /**
   * Create CSS positioning variables
   * Headers use x,y coordinates as center point from ZIP data
   * Convert to top-left for CSS positioning
   */
  const cssVariables: Record<string, string> = {
    // Position: x,y represent center - convert to top-left
    '--header-left': `${(bounds.x * scale) - (width / 2)}px`,
    '--header-top': `${(bounds.y * scale) - (height / 2)}px`,

    // Scaled dimensions
    '--header-width': `${width}px`,
    '--header-height': `${height}px`,

    // Optional rotation
    '--header-transform': bounds.rotation ? `rotate(${bounds.rotation}deg)` : 'none'
  };

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <div
      className="header-component"
      data-header-state={currentState}
      style={cssVariables}
      onClick={onCycleState}
      title={`Header Component (${currentState.toUpperCase()}) - Click to cycle states`}
      role="button"
      aria-label={`Header in ${currentState} state. Click to change state.`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCycleState();
        }
      }}
    >
      <img
        src={headerImage}
        alt={`Header ${currentState}`}
        className="header-image"
        draggable={false}
        onError={(e) => {
          console.warn(`Header image failed to load for state ${currentState}:`, headerImage);
        }}
      />
    </div>
  );
};