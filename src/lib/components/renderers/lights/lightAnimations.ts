/**
 * Light Animation System
 *
 * Defines available light bulb animation types and their metadata.
 * Each animation pattern is implemented as a separate CSS file with keyframe animations.
 *
 * @module lightAnimations
 */

/**
 * Unique identifier for light animation types
 */
export type LightAnimationType =
  | 'none'
  | 'alternating-carnival'
  | 'sequential-chase'
  | 'accelerating-spin'
  | 'reverse-chase-pulse'
  | 'random-sparkle'
  | 'carnival-waltz'
  | 'comet-trail'
  | 'dual-convergence';

/**
 * Metadata describing a light animation
 */
export interface LightAnimationMetadata {
  /** Unique identifier for the animation */
  id: LightAnimationType;
  /** Human-readable display name */
  title: string;
  /** Description of the animation pattern */
  description: string;
  /** Duration of one complete animation cycle in seconds */
  duration: number;
  /** CSS file name (without .css extension) */
  cssFile: string;
}

/**
 * Complete catalog of available light animations
 *
 * Each animation is self-contained in its own CSS file with keyframe animations.
 * The animations use only cross-platform compatible features:
 * - Transform (translate, scale, rotate)
 * - Opacity
 * - Background-color
 * - Box-shadow (for glow effects)
 *
 * NO radial gradients, blur filters, or other incompatible features.
 */
export const LIGHT_ANIMATIONS: readonly LightAnimationMetadata[] = [
  {
    id: 'none',
    title: 'None (Static)',
    description: 'No animation - lights remain static',
    duration: 0,
    cssFile: '',
  },
  {
    id: 'alternating-carnival',
    title: 'Alternating Carnival',
    description: 'Classic carnival pattern with even/odd bulbs alternating on and off with realistic glow and fadeout',
    duration: 1.2,
    cssFile: 'alternating-carnival',
  },
  {
    id: 'sequential-chase',
    title: 'Sequential Chase',
    description: 'Single lit bulb chases around creating a smooth rotating motion effect',
    duration: 1.6,
    cssFile: 'sequential-chase',
  },
  {
    id: 'accelerating-spin',
    title: 'Accelerating Spin',
    description: 'Wheel of fortune spin: starts slow, accelerates to blur, decelerates, and settles on winner',
    duration: 5.0,
    cssFile: 'accelerating-spin',
  },
  {
    id: 'reverse-chase-pulse',
    title: 'Reverse Chase Pulse',
    description: 'Counter-clockwise chase followed by faster clockwise motion, then synchronized pulses before revealing winner',
    duration: 7.0,
    cssFile: 'reverse-chase-pulse',
  },
  {
    id: 'random-sparkle',
    title: 'Random Sparkle',
    description: 'Unpredictable twinkling creates excitement and anticipation like stars in the night sky',
    duration: 8.0,
    cssFile: 'random-sparkle',
  },
  {
    id: 'carnival-waltz',
    title: 'Carnival Waltz',
    description: 'Musical waltz pattern with groups of 3 bulbs following strong-weak-weak rhythm',
    duration: 4.5,
    cssFile: 'carnival-waltz',
  },
  {
    id: 'comet-trail',
    title: 'Comet Trail',
    description: 'A bright head with a long trailing fadeout creates a comet-like effect',
    duration: 2.5,
    cssFile: 'comet-trail',
  },
  {
    id: 'dual-convergence',
    title: 'Dual Convergence',
    description: 'Two lights chase from opposite sides, meeting with a dramatic collision flash',
    duration: 3.0,
    cssFile: 'dual-convergence',
  },
] as const;

/**
 * Get animation metadata by ID
 *
 * @param id - Animation type identifier
 * @returns Animation metadata or undefined if not found
 */
export function getAnimationById(id: LightAnimationType): LightAnimationMetadata | undefined {
  return LIGHT_ANIMATIONS.find(anim => anim.id === id);
}

/**
 * Get all animation options for UI selection
 * Useful for populating dropdown menus
 *
 * @returns Array of animation metadata for UI display
 */
export function getAllAnimations(): readonly LightAnimationMetadata[] {
  return LIGHT_ANIMATIONS;
}
