/**
 * LightBulb Component
 *
 * Renders a single animated light bulb with configurable animation patterns.
 * Consolidates visual style from multiple animation patterns into one component.
 *
 * Cross-Platform Compatible:
 * - Uses only transforms, opacity, background-color, box-shadow
 * - No radial gradients, blur filters, or incompatible features
 * - Works with React Native (future compatibility)
 *
 * @module LightBulb
 */

import React from 'react';
import type { LightAnimationType } from './lightAnimations';
import './LightBulb.css';

export interface LightBulbProps {
  /** X position in pixels (already scaled) */
  x: number;
  /** Y position in pixels (already scaled) */
  y: number;
  /** Bulb index in the sequence (for animation delays) */
  index: number;
  /** Total number of bulbs (for animation calculations) */
  totalBulbs: number;
  /** Animation type to apply */
  animationType: LightAnimationType;
  /** Size of the bulb in pixels (default: 8) */
  size?: number;
  /** Group index for carnival-waltz (0, 1, or 2) */
  groupIndex: number;
  /** Whether bulb is in first half (for dual-convergence) */
  isFirstHalf: boolean;
}

/**
 * LightBulb renders a single animated light with glow effects
 *
 * The component consists of multiple layers:
 * 1. Outer glow (box-shadow simulation of radial gradient)
 * 2. Inner glow (brighter core glow)
 * 3. Main bulb (with background color and border)
 * 4. Filament (small bright center when lit)
 * 5. Glass shine (static overlay for realism)
 *
 * Each layer can be animated independently via CSS classes.
 */
export const LightBulb: React.FC<LightBulbProps> = ({
  x,
  y,
  index,
  totalBulbs,
  animationType,
  size = 8,
  groupIndex,
  isFirstHalf,
}) => {
  // Calculate dimensions
  // The wrapper must be sized to the largest visual layer (outer glow)
  // Outer glow is 1.5x the bulb size (12px for 8px bulb)
  const wrapperSize = size * 1.5;
  const radius = size / 2;

  // Calculate offsets for child layers to center them in wrapper
  const outerGlowOffset = 0; // Outer glow fills entire wrapper
  const innerGlowSize = size * 1.25; // 10px for 8px bulb
  const innerGlowOffset = (wrapperSize - innerGlowSize) / 2;
  const bulbOffset = (wrapperSize - size) / 2;

  // Build class names
  const classes: string[] = ['light-bulb__wrapper'];

  // Add animation class
  if (animationType !== 'none') {
    classes.push(`light-bulb__wrapper--${animationType}`);
  }

  // Add even/odd class
  const isEven = index % 2 === 0;
  classes.push(isEven ? 'light-bulb__wrapper--even' : 'light-bulb__wrapper--odd');

  // Add carnival-waltz beat class
  if (animationType === 'carnival-waltz') {
    classes.push(`light-bulb__wrapper--beat-${groupIndex + 1}`);
  }

  // Add dual-convergence half class
  if (animationType === 'dual-convergence') {
    classes.push(isFirstHalf ? 'light-bulb__wrapper--first-half' : 'light-bulb__wrapper--second-half');
  }

  // Positioning style (center-based positioning)
  // The x,y passed in represent the center point of the bulb from the theme data.
  // We use CSS transform to center the wrapper at this position.
  const positionStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    transform: 'translate(-50%, -50%)',
  };

  return (
    <div
      className={classes.join(' ')}
      style={{
        ...positionStyle,
        width: `${wrapperSize}px`,
        height: `${wrapperSize}px`,
        // CSS custom properties for animation calculations
        ['--bulb-index' as string]: index,
        ['--total-bulbs' as string]: totalBulbs,
        ['--bulb-size' as string]: `${size}px`,
        ['--bulb-radius' as string]: `${radius}px`,
        ['--wrapper-size' as string]: `${wrapperSize}px`,
        ['--outer-glow-size' as string]: `${wrapperSize}px`,
        ['--outer-glow-offset' as string]: `${outerGlowOffset}px`,
        ['--inner-glow-size' as string]: `${innerGlowSize}px`,
        ['--inner-glow-offset' as string]: `${innerGlowOffset}px`,
        ['--bulb-offset' as string]: `${bulbOffset}px`,
        // For carnival waltz, set group index CSS variable
        ...(animationType === 'carnival-waltz' && {
          ['--group-index' as string]: groupIndex,
        }),
      }}
      data-bulb-index={index}
    >
      {/* Outer glow layer - largest glow effect */}
      <div className={`light-bulb__glow-outer ${animationType !== 'none' ? `light-bulb__glow-outer--${animationType}` : ''}`} />

      {/* Inner glow layer - brighter, smaller glow */}
      <div className={`light-bulb__glow-inner ${animationType !== 'none' ? `light-bulb__glow-inner--${animationType}` : ''}`} />

      {/* Main bulb with background and border */}
      <div className={`light-bulb__bulb ${animationType !== 'none' ? `light-bulb__bulb--${animationType}` : ''}`}>
        {/* Inner filament - small bright core when lit */}
        <div className={`light-bulb__filament ${animationType !== 'none' ? `light-bulb__filament--${animationType}` : ''}`} />

        {/* Glass shine overlay - static for performance */}
        <div className="light-bulb__glass-shine" />
      </div>
    </div>
  );
};
