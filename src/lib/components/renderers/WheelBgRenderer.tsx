import { WheelOverlay } from '@lib-types';
import { logger } from '@services/logger';
import React from 'react';
import styles from '../WheelViewer.module.css';

/**
 * WheelBgRenderer Component
 *
 * PURPOSE: Displays the wheel background overlay image
 *
 * This component renders the wheel background overlay that sits on top
 * of the main background but below other wheel elements. It's typically
 * used for the spinning wheel graphic itself.
 *
 * What this does:
 * - Displays wheel background overlay image
 * - Positions using center-based x,y coordinates
 * - Scales based on provided scale factor
 * - Layers between background and other wheel elements
 */

interface WheelBgRendererProps {
  /** Wheel background data from ZIP file */
  wheelBg?: WheelOverlay;
  /** Wheel background image URL */
  wheelBgImage?: string;
  /** Scale factor for responsive sizing */
  scale: number;
}

export const WheelBgRenderer: React.FC<WheelBgRendererProps> = ({
  wheelBg,
  wheelBgImage,
  scale,
}) => {
  // ============================================================================
  // EARLY RETURNS & VALIDATION
  // ============================================================================

  if (!wheelBg || !wheelBgImage) return null;

  const { bounds } = wheelBg;
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
    '--wheelbg-left': `${bounds.x * scale - width / 2}px`,
    '--wheelbg-top': `${bounds.y * scale - height / 2}px`,

    // Scaled dimensions
    '--wheelbg-width': `${width}px`,
    '--wheelbg-height': `${height}px`,
  };

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <div
      className={styles.wheelbgComponent}
      data-testid="wheelbg-component"
      style={cssVariables}
      title="Wheel Background Overlay"
      role="img"
      aria-label="Wheel background overlay"
    >
      <img
        src={wheelBgImage}
        alt="Wheel Background"
        className={styles.wheelbgImage}
        data-testid="wheelbg-image"
        draggable={false}
        onError={(_e) => {
          logger.warn('WheelBg image failed to load', {
            component: 'WheelBgRenderer',
            imageUrl: wheelBgImage,
            bounds: wheelBg?.bounds,
            scale,
          });
        }}
      />
    </div>
  );
};
