/**
 * AnimatedLightsRenderer Component
 *
 * Renders animated light bulbs at arbitrary positions from the wheel theme.
 * Replaces the simple LightsRenderer with a fully-featured animation system.
 *
 * Features:
 * - Variable number of lights (works with any count)
 * - 8 different animation patterns + static mode
 * - Color calculation from single theme color
 * - Cross-platform compatible (React Native ready)
 *
 * @module AnimatedLightsRenderer
 */

import React, { useMemo } from 'react';
import { LightsComponent } from '../../../types';
import { LightBulb } from './LightBulb';
import type { LightAnimationType } from './lightAnimations';
import { calculateBulbColors } from '../../../utils/lightBulbColors';

// Import all animation CSS files
import './animations/alternating-carnival.css';
import './animations/sequential-chase.css';
import './animations/accelerating-spin.css';
import './animations/reverse-chase-pulse.css';
import './animations/random-sparkle.css';
import './animations/carnival-waltz.css';
import './animations/comet-trail.css';
import './animations/dual-convergence.css';

export interface AnimatedLightsRendererProps {
  /** Lights configuration from wheel theme */
  lights?: LightsComponent;
  /** Scale factor for positioning and sizing */
  scale: number;
  /** Selected animation type */
  animationType?: LightAnimationType;
  /** Optional size override in pixels (default: 8) */
  bulbSize?: number;
}

/**
 * AnimatedLightsRenderer renders a collection of animated light bulbs
 *
 * This component:
 * 1. Calculates color palette from theme color
 * 2. Positions bulbs at arbitrary x,y coordinates
 * 3. Applies selected animation pattern
 * 4. Handles variable number of lights
 *
 * Cross-Platform Compatible:
 * - Uses only transforms, opacity, background-color, box-shadow
 * - No radial gradients or web-only features
 * - Works with React Native (future compatibility)
 */
export const AnimatedLightsRenderer: React.FC<AnimatedLightsRendererProps> = ({
  lights,
  scale,
  animationType = 'none',
  bulbSize = 8,
}) => {
  const { color, positions: rawPositions } = lights || { color: '#ffffff', positions: [] };

  // Reorder positions so the bulb at 12 o'clock (top, minimum y) is first
  // This ensures the animation starts at the top for sequential animations
  const positions = useMemo(() => {
    if (!rawPositions || rawPositions.length === 0) return rawPositions || [];

    // Find the index of the bulb with minimum y coordinate (topmost bulb)
    let topIndex = 0;
    let minY = rawPositions[0].y;

    for (let i = 1; i < rawPositions.length; i++) {
      if (rawPositions[i].y < minY) {
        minY = rawPositions[i].y;
        topIndex = i;
      }
    }

    // If the topmost bulb is already first, no need to reorder
    if (topIndex === 0) return rawPositions;

    // Reorder: put topmost bulb first, then continue in circular order
    return [...rawPositions.slice(topIndex), ...rawPositions.slice(0, topIndex)];
  }, [rawPositions]);

  const totalBulbs = positions.length;

  // Calculate color palette from theme color
  const colors = useMemo(() => calculateBulbColors(color), [color]);

  // Calculate delay per bulb for sequential animations
  const delayPerBulb = useMemo(() => {
    // Special handling for carnival-waltz (groups of 3) and dual-convergence (half bulbs)
    if (animationType === 'carnival-waltz') {
      const numGroups = Math.ceil(totalBulbs / 3);
      return 4.8 / numGroups; // Delay per group, not per bulb
    }

    if (animationType === 'dual-convergence') {
      const halfBulbs = Math.floor(totalBulbs / 2);
      return halfBulbs > 0 ? 4.0 / halfBulbs : 0; // Delay based on half the bulbs
    }

    // Standard animations with duration and stagger multiplier
    const config: Record<LightAnimationType, { duration: number; stagger: number }> = {
      none: { duration: 0, stagger: 1 },
      'alternating-carnival': { duration: 1.2, stagger: 1 },
      'sequential-chase': { duration: 1.6, stagger: 1 },
      'accelerating-spin': { duration: 5.0, stagger: 0.08 }, // Small stagger for rapid chase effect
      'reverse-chase-pulse': { duration: 7.0, stagger: 0.12 }, // Small stagger for reverse chase
      'random-sparkle': { duration: 4.0, stagger: 0.37 }, // Prime number for pseudo-random pattern
      'carnival-waltz': { duration: 4.8, stagger: 1 }, // Fallback, won't be used
      'comet-trail': { duration: 3.0, stagger: 1 }, // Fixed duration
      'dual-convergence': { duration: 4.0, stagger: 1 }, // Fallback, won't be used
    };

    const { duration, stagger } = config[animationType] || { duration: 0, stagger: 1 };
    return duration > 0 ? (duration / totalBulbs) * stagger : 0;
  }, [animationType, totalBulbs]);

  // Early return if no lights configured (after all hooks are called)
  if (!lights || !lights.positions || lights.positions.length === 0) {
    return null;
  }

  // Calculate group index for carnival waltz (groups of 3)
  const getGroupIndex = (index: number): number => {
    return index % 3;
  };

  // Determine if bulb is in first or second half for dual convergence
  const isFirstHalf = (index: number): boolean => {
    return index < Math.ceil(totalBulbs / 2);
  };

  // Container style with CSS custom properties for colors
  const containerStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 17, // Below pointer (20) but above wheelTop2 (16)
    pointerEvents: 'none' as const,
    // Set CSS custom properties for all bulbs to use
    ['--bulb-on' as string]: colors.on,
    ['--bulb-off' as string]: colors.off,
    ['--bulb-blend90' as string]: colors.blend90,
    ['--bulb-blend80' as string]: colors.blend80,
    ['--bulb-blend70' as string]: colors.blend70,
    ['--bulb-blend60' as string]: colors.blend60,
    ['--bulb-blend40' as string]: colors.blend40,
    ['--bulb-blend30' as string]: colors.blend30,
    ['--bulb-blend20' as string]: colors.blend20,
    ['--bulb-blend10' as string]: colors.blend10,
    ['--bulb-off-tint30' as string]: colors.offTint30,
    ['--bulb-off-tint20' as string]: colors.offTint20,
    ['--bulb-on-glow100' as string]: colors.onGlow100,
    ['--bulb-on-glow95' as string]: colors.onGlow95,
    ['--bulb-on-glow90' as string]: colors.onGlow90,
    ['--bulb-on-glow80' as string]: colors.onGlow80,
    ['--bulb-on-glow75' as string]: colors.onGlow75,
    ['--bulb-on-glow70' as string]: colors.onGlow70,
    ['--bulb-on-glow65' as string]: colors.onGlow65,
    ['--bulb-on-glow60' as string]: colors.onGlow60,
    ['--bulb-on-glow55' as string]: colors.onGlow55,
    ['--bulb-on-glow50' as string]: colors.onGlow50,
    ['--bulb-on-glow45' as string]: colors.onGlow45,
    ['--bulb-on-glow40' as string]: colors.onGlow40,
    ['--bulb-on-glow35' as string]: colors.onGlow35,
    ['--bulb-on-glow30' as string]: colors.onGlow30,
    ['--bulb-off-glow40' as string]: colors.offGlow40,
    ['--bulb-off-glow35' as string]: colors.offGlow35,
    ['--bulb-off-glow30' as string]: colors.offGlow30,
    ['--delay-per-bulb' as string]: `${delayPerBulb}s`,
  };

  return (
    <div
      className="animated-lights-renderer"
      role="img"
      aria-label="Animated wheel lights"
      style={containerStyle}
    >
      {positions.map((position, index) => (
        <LightBulb
          key={index}
          x={position.x * scale}
          y={position.y * scale}
          index={index}
          totalBulbs={totalBulbs}
          animationType={animationType}
          size={bulbSize * scale}
          groupIndex={getGroupIndex(index)}
          isFirstHalf={isFirstHalf(index)}
        />
      ))}
    </div>
  );
};
