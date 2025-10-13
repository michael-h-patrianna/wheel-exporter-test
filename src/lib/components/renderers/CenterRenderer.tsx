import React from 'react';
import { CenterComponent } from '../../types';

/**
 * CenterRenderer Component
 *
 * PURPOSE: Displays the wheel's center with a semi-transparent filled circle
 *
 * This component renders a semi-transparent filled circle at the center of the wheel,
 * with crosshair lines (horizontal and vertical) through the center point.
 * This matches the wheel preview in figma-questline-exporter and helps visualize
 * the wheel's rotation center and boundaries.
 *
 * What this does:
 * - Displays a semi-transparent filled circle with the specified radius
 * - Shows horizontal and vertical lines through the center point
 * - Helps developers understand wheel positioning and rotation axis
 * - Always visible as part of the wheel theme
 */

interface CenterRendererProps {
  /** Center component data from ZIP file */
  center?: CenterComponent;
  /** Scale factor for responsive sizing */
  scale: number;
}

export const CenterRenderer: React.FC<CenterRendererProps> = ({ center, scale }) => {
  // ============================================================================
  // EARLY RETURNS & VALIDATION
  // ============================================================================

  if (!center) return null;

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
    '--center-left': `${center.x * scale - radius}px`,
    '--center-top': `${center.y * scale - radius}px`,

    // Dimensions
    '--center-size': `${diameter}px`,
    '--center-radius': `${radius}px`,
  };

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <div
      className="center-component"
      style={cssVariables}
      title="Wheel Center"
      role="img"
      aria-label="Wheel center circle"
    >
      {/* Semi-transparent filled circle */}
      <svg
        className="center-svg"
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
      >
        {/* Filled circle with semi-transparency */}
        <circle cx={radius} cy={radius} r={radius} fill="rgba(128, 128, 128, 0.3)" stroke="none" />

        {/* Horizontal line through center */}
        <line
          x1="0"
          y1={radius}
          x2={diameter}
          y2={radius}
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth="1"
        />

        {/* Vertical line through center */}
        <line
          x1={radius}
          y1="0"
          x2={radius}
          y2={diameter}
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth="1"
        />

        {/* Center point dot */}
        <circle cx={radius} cy={radius} r="2" fill="rgba(255, 255, 255, 0.8)" />
      </svg>
    </div>
  );
};
