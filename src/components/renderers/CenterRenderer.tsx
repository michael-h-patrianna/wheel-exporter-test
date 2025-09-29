import React from 'react';
import { CenterComponent } from '../../types';

/**
 * CenterRenderer Component
 *
 * PURPOSE: Displays a visual indicator for the wheel's center point
 *
 * This component renders a circular indicator at the center of the wheel.
 * It's primarily used for development/debugging to show the exact center
 * point and rotation axis of the wheel. Unlike other components, the center
 * doesn't have an image - it's just position and radius data.
 *
 * What this does:
 * - Displays a semi-transparent circle at the wheel's center
 * - Shows the rotation point of the wheel
 * - Useful for developers to understand wheel positioning
 * - Can be toggled on/off for debugging purposes
 */

interface CenterRendererProps {
  /** Center component data from ZIP file */
  center?: CenterComponent;
  /** Scale factor for responsive sizing */
  scale: number;
  /** Whether to show the center indicator (for debugging) */
  showCenter?: boolean;
}

export const CenterRenderer: React.FC<CenterRendererProps> = ({
  center,
  scale,
  showCenter = true
}) => {
  // ============================================================================
  // EARLY RETURNS & VALIDATION
  // ============================================================================

  if (!center || !showCenter) return null;

  // ============================================================================
  // DIMENSION CALCULATION
  // ============================================================================

  /**
   * Calculate scaled dimensions
   * Center uses x,y as the center point and radius for size
   */
  const radius = center.radius * scale;
  const diameter = radius * 2;

  // ============================================================================
  // CSS VARIABLES GENERATION
  // ============================================================================

  /**
   * Create CSS positioning variables
   * x,y represent the center point - convert to top-left for CSS
   */
  const cssVariables: Record<string, string> = {
    // Position: center to top-left conversion
    '--center-left': `${(center.x * scale) - radius}px`,
    '--center-top': `${(center.y * scale) - radius}px`,

    // Dimensions
    '--center-size': `${diameter}px`,
    '--center-radius': `${radius}px`
  };

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <div
      className="center-component"
      style={cssVariables}
      title="Wheel Center Point"
      role="img"
      aria-label="Wheel center indicator"
    >
      <div className="center-indicator">
        {/* Outer ring */}
        <div className="center-ring" />
        {/* Inner dot */}
        <div className="center-dot" />
      </div>
    </div>
  );
};