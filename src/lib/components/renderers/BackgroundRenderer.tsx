import React from 'react';

/**
 * BackgroundRenderer Component
 *
 * PURPOSE: Displays the main background image of the wheel theme
 *
 * This component renders the background image extracted from theme ZIP files.
 * The background serves as the base layer for all other wheel components.
 *
 * What this does:
 * - Displays the background image covering the entire wheel area
 * - Scales with the provided scale factor
 * - Provides a foundation for layering other wheel elements
 */

interface BackgroundRendererProps {
  /** Background image URL from extracted ZIP */
  backgroundImage?: string;
  /** Scale factor for responsive sizing */
  scale: number;
  /** Original frame width from wheel data */
  frameWidth: number;
  /** Original frame height from wheel data */
  frameHeight: number;
}

export const BackgroundRenderer: React.FC<BackgroundRendererProps> = ({
  backgroundImage,
  scale,
  frameWidth,
  frameHeight
}) => {
  // ============================================================================
  // EARLY RETURNS & VALIDATION
  // ============================================================================

  if (!backgroundImage) return null;

  // ============================================================================
  // CSS VARIABLES GENERATION
  // ============================================================================

  /**
   * Create CSS positioning variables for the background
   * Background always starts at top-left (0,0)
   */
  const cssVariables: Record<string, string> = {
    '--bg-width': `${frameWidth * scale}px`,
    '--bg-height': `${frameHeight * scale}px`
  };

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <div
      className="background-component"
      style={cssVariables}
      role="img"
      aria-label="Wheel theme background"
    >
      <img
        src={backgroundImage}
        alt="Background"
        className="background-image"
        draggable={false}
        onError={(e) => {
          console.warn('Background image failed to load:', backgroundImage);
        }}
      />
    </div>
  );
};