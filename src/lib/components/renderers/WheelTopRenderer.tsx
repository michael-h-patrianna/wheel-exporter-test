import React from 'react';
import { WheelOverlay } from '@lib-types';
import { logger } from '@services/logger';

/**
 * WheelTopRenderer Component
 *
 * PURPOSE: Displays top overlay elements on the wheel (wheelTop1, wheelTop2)
 *
 * This component renders overlay images that sit on top of the wheel.
 * These could be decorative elements, highlights, or additional graphics
 * that enhance the wheel's visual appearance.
 *
 * What this does:
 * - Displays overlay images on top of the wheel
 * - Supports multiple top layers (wheelTop1, wheelTop2)
 * - Positions using center-based x,y coordinates
 * - Scales based on provided scale factor
 */

interface WheelTopRendererProps {
  /** Wheel top overlay data from ZIP file */
  wheelTop?: WheelOverlay;
  /** Wheel top overlay image URL */
  wheelTopImage?: string;
  /** Scale factor for responsive sizing */
  scale: number;
  /** Layer identifier (1 or 2) for debugging */
  layerNumber: 1 | 2;
}

export const WheelTopRenderer: React.FC<WheelTopRendererProps> = ({
  wheelTop,
  wheelTopImage,
  scale,
  layerNumber,
}) => {
  // ============================================================================
  // EARLY RETURNS & VALIDATION
  // ============================================================================

  if (!wheelTop || !wheelTopImage) return null;

  const { bounds } = wheelTop;
  if (!bounds) return null;

  // ============================================================================
  // DIMENSION CALCULATION
  // ============================================================================

  /**
   * Calculate scaled dimensions
   * WheelElementBounds use center-based positioning
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
    [`--wheeltop${layerNumber}-left`]: `${bounds.x * scale - width / 2}px`,
    [`--wheeltop${layerNumber}-top`]: `${bounds.y * scale - height / 2}px`,

    // Scaled dimensions
    [`--wheeltop${layerNumber}-width`]: `${width}px`,
    [`--wheeltop${layerNumber}-height`]: `${height}px`,
  };

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <div
      className={`wheeltop-component wheeltop-${layerNumber}`}
      data-layer={layerNumber}
      style={cssVariables}
      title={`Wheel Top Layer ${layerNumber}`}
      role="img"
      aria-label={`Wheel top overlay layer ${layerNumber}`}
    >
      <img
        src={wheelTopImage}
        alt={`Wheel Top ${layerNumber}`}
        className="wheeltop-image"
        draggable={false}
        onError={(_e) => {
          logger.warn('WheelTop image failed to load', {
            component: 'WheelTopRenderer',
            layer: layerNumber,
            imageUrl: wheelTopImage,
            bounds: wheelTop?.bounds,
            scale,
          });
        }}
      />
    </div>
  );
};
