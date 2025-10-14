/**
 * Shared utility functions for renderer components
 * Consolidates common positioning, scaling, and styling logic
 */

import { ImageBounds, WheelElementBounds } from '../types';

/**
 * Convert center-based coordinates to top-left coordinates for CSS positioning
 *
 * ImageBounds and WheelElementBounds use center-based positioning (x, y = center point)
 * but CSS positioning requires top-left coordinates
 *
 * @param centerX - Center X coordinate
 * @param centerY - Center Y coordinate
 * @param width - Element width
 * @param height - Element height
 * @param scale - Scale factor to apply
 * @returns Object with left and top CSS positions in pixels
 */
export function centerToTopLeft(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  scale: number
): { left: string; top: string } {
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  return {
    left: `${(centerX * scale) - (scaledWidth / 2)}px`,
    top: `${(centerY * scale) - (scaledHeight / 2)}px`,
  };
}

/**
 * Calculate scaled dimensions from bounds
 *
 * @param bounds - Bounds with width and height
 * @param scale - Scale factor
 * @returns Scaled width and height in pixels as strings
 */
export function scaledDimensions(
  bounds: { w: number; h: number },
  scale: number
): { width: string; height: string } {
  return {
    width: `${bounds.w * scale}px`,
    height: `${bounds.h * scale}px`,
  };
}

/**
 * Generate CSS variables for positioning an element with center-based bounds
 *
 * @param prefix - CSS variable prefix (e.g., 'wheelbg', 'header')
 * @param bounds - Bounds with center position and dimensions
 * @param scale - Scale factor
 * @returns CSS variables object
 */
export function generatePositionCssVars(
  prefix: string,
  bounds: ImageBounds | WheelElementBounds,
  scale: number
): Record<string, string> {
  const width = bounds.w * scale;
  const height = bounds.h * scale;
  const position = centerToTopLeft(bounds.x, bounds.y, bounds.w, bounds.h, scale);

  const vars: Record<string, string> = {
    [`--${prefix}-left`]: position.left,
    [`--${prefix}-top`]: position.top,
    [`--${prefix}-width`]: `${width}px`,
    [`--${prefix}-height`]: `${height}px`,
  };

  // Add rotation (ImageBounds only) - only if rotation is explicitly set
  if ('rotation' in bounds && bounds.rotation !== undefined) {
    vars[`--${prefix}-transform`] = `rotate(${bounds.rotation}deg)`;
  }

  return vars;
}

/**
 * Create standard error handler for image loading failures
 *
 * @param componentName - Name of the component for logging
 * @param imageUrl - URL of the image that failed
 */
export function createImageErrorHandler(componentName: string, imageUrl: string) {
  return () => {
    console.warn(`${componentName} image failed to load:`, imageUrl);
  };
}

/**
 * Generate standard image props for renderer components
 *
 * @param src - Image source URL
 * @param alt - Alt text
 * @param className - CSS class name
 * @param errorHandler - Optional custom error handler
 * @returns Props object for img element
 */
export function generateImageProps(
  src: string,
  alt: string,
  className: string,
  errorHandler?: () => void
) {
  return {
    src,
    alt,
    className,
    draggable: false,
    onError: errorHandler,
  };
}
