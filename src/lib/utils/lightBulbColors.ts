/**
 * Light Bulb Color Calculation Utilities
 *
 * Generates color palettes for animated light bulb effects from a single base color.
 * Adapted from the animations project to work with arbitrary wheel light positions.
 *
 * Cross-Platform Compatible:
 * - Only uses solid colors and RGBA values
 * - No radial gradients (uses box-shadow instead)
 * - Works with React Native via react-native-linear-gradient
 *
 * @module lightBulbColors
 */

/**
 * Parses a color string (hex or rgba) and returns RGB values
 *
 * @param color - Color string in hex (#RRGGBB) or rgba format
 * @returns Object with r, g, b values (0-255)
 */
function parseColor(color: string): { r: number; g: number; b: number } {
  // Handle rgba format: rgba(r, g, b, a)
  if (color.startsWith('rgba(')) {
    const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
    if (match) {
      return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
      };
    }
  }

  // Handle hex format: #rrggbb
  return {
    r: parseInt(color.slice(1, 3), 16),
    g: parseInt(color.slice(3, 5), 16),
    b: parseInt(color.slice(5, 7), 16),
  };
}

/**
 * Blends two colors together at a given percentage
 * Works in both web and React Native environments
 * Supports both hex (#rrggbb) and rgba (rgba(r,g,b,a)) formats
 *
 * @param color1 - First color (e.g., '#ffd700' or 'rgba(255, 215, 0, 0.7)')
 * @param color2 - Second color (e.g., '#666666' or 'rgba(102, 102, 102, 0.5)')
 * @param percentage - Percentage of color1 to use (0-100)
 * @returns Blended hex color
 */
export function blendColors(color1: string, color2: string, percentage: number): string {
  // Parse colors
  const c1 = parseColor(color1);
  const c2 = parseColor(color2);

  // Blend
  const r = Math.round(c1.r * (percentage / 100) + c2.r * (1 - percentage / 100));
  const g = Math.round(c1.g * (percentage / 100) + c2.g * (1 - percentage / 100));
  const b = Math.round(c1.b * (percentage / 100) + c2.b * (1 - percentage / 100));

  // Return hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Adds transparency to a hex or rgba color
 * Works in both web and React Native environments
 *
 * @param color - Hex color (e.g., '#ffd700') or rgba color (e.g., 'rgba(255, 215, 0, 0.7)')
 * @param alpha - Transparency (0-100)
 * @returns RGBA color string
 */
export function addTransparency(color: string, alpha: number): string {
  const parsed = parseColor(color);
  return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${alpha / 100})`;
}

/**
 * Shifts color temperature warmer (adds orange/yellow tones) or cooler (adds blue tones)
 * Works in both web and React Native environments
 *
 * @param color - Hex color (e.g., '#ffd700')
 * @param shift - Positive for warm, negative for cool (-50 to 50)
 * @returns Shifted hex color
 */
export function shiftColorTemperature(color: string, shift: number): string {
  let r = parseInt(color.slice(1, 3), 16);
  let g = parseInt(color.slice(3, 5), 16);
  let b = parseInt(color.slice(5, 7), 16);

  if (shift > 0) {
    // Warm shift: increase red and green (orange/yellow tones)
    r = Math.min(255, Math.round(r + shift * 0.8));
    g = Math.min(255, Math.round(g + shift * 0.5));
    b = Math.max(0, Math.round(b - shift * 0.3));
  } else {
    // Cool shift: increase blue, reduce red
    const coolShift = Math.abs(shift);
    r = Math.max(0, Math.round(r - coolShift * 0.4));
    g = Math.max(0, Math.round(g - coolShift * 0.2));
    b = Math.min(255, Math.round(b + coolShift * 0.6));
  }

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Pre-calculates color steps for light bulb animations
 * Generates intermediate colors between onColor and derived offColor
 * The offColor is automatically derived by darkening onColor to 20% brightness with 70% opacity
 *
 * This function creates a comprehensive color palette for animating light bulbs,
 * including blend steps, transparency variations, and temperature-shifted variants.
 * All colors are cross-platform compatible (no radial gradients).
 *
 * @param onColor - Color when bulb is lit (e.g., '#ffd700')
 * @returns Object with pre-calculated color steps for animations
 *
 * @example
 * ```typescript
 * const colors = calculateBulbColors('#ffd700');
 * // Use colors.on for fully lit state
 * // Use colors.off for unlit state
 * // Use colors.blend70 for 70% transition
 * // Use colors.onGlow80 for 80% opacity glow effects (box-shadow)
 * ```
 */
export function calculateBulbColors(onColor: string) {
  // Apply warm temperature shift to onColor for more inviting glow
  const warmOnColor = shiftColorTemperature(onColor, 15);

  // Derive off color by darkening the on color to 20% brightness with 70% opacity
  let r = Math.round(parseInt(onColor.slice(1, 3), 16) * 0.2);
  let g = Math.round(parseInt(onColor.slice(3, 5), 16) * 0.2);
  let b = Math.round(parseInt(onColor.slice(5, 7), 16) * 0.2);

  // Desaturate by moving RGB values closer to their average
  const avg = (r + g + b) / 3;
  const desaturationFactor = 0.6; // 60% closer to gray
  r = Math.round(r + (avg - r) * desaturationFactor);
  g = Math.round(g + (avg - g) * desaturationFactor);
  b = Math.round(b + (avg - b) * desaturationFactor);

  const offColorBase = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

  // Apply cool temperature shift to offColor for more muted appearance
  const coolOffColor = shiftColorTemperature(offColorBase, -10);
  const offColor = `rgba(${parseInt(coolOffColor.slice(1, 3), 16)}, ${parseInt(coolOffColor.slice(3, 5), 16)}, ${parseInt(coolOffColor.slice(5, 7), 16)}, 0.7)`;

  // Pre-calculate color for box-shadow (replaces radial gradient)
  const onGradientColor = blendColors(warmOnColor, '#000000', 85);

  // Additional color-mix replacements for animations
  const offBlend10On = blendColors(offColor, warmOnColor, 90);  // 90% off + 10% on
  const onBlend5Off = blendColors(warmOnColor, offColor, 95);    // 95% on + 5% off
  const onBlend10Off = blendColors(warmOnColor, offColor, 90);   // 90% on + 10% off

  return {
    // Base colors with temperature shifts
    on: warmOnColor,
    off: offColor,

    // Blended intermediate steps (use warm color for blending)
    blend90: blendColors(warmOnColor, offColor, 90),
    blend80: blendColors(warmOnColor, offColor, 80),
    blend70: blendColors(warmOnColor, offColor, 70),
    blend60: blendColors(warmOnColor, offColor, 60),
    blend40: blendColors(warmOnColor, offColor, 40),
    blend30: blendColors(warmOnColor, offColor, 30),
    blend20: blendColors(warmOnColor, offColor, 20),
    blend10: blendColors(warmOnColor, offColor, 10),

    // Off color with slight on color tint
    offTint30: blendColors(offColor, warmOnColor, 70),
    offTint20: blendColors(offColor, warmOnColor, 80),

    // Additional blends for specific animation patterns
    offBlend10On,   // 90% off + 10% on
    onBlend5Off,    // 95% on + 5% off
    onBlend10Off,   // 90% on + 10% off

    // Color for simulating radial gradient effect (85% of on color blended with transparent)
    onGradient: onGradientColor,

    // Transparency variations for glows and shadows (use warm color)
    // These are used for box-shadow effects to replace radial gradients
    onGlow100: addTransparency(warmOnColor, 100),
    onGlow95: addTransparency(warmOnColor, 95),
    onGlow90: addTransparency(warmOnColor, 90),
    onGlow80: addTransparency(warmOnColor, 80),
    onGlow75: addTransparency(warmOnColor, 75),
    onGlow70: addTransparency(warmOnColor, 70),
    onGlow65: addTransparency(warmOnColor, 65),
    onGlow60: addTransparency(warmOnColor, 60),
    onGlow55: addTransparency(warmOnColor, 55),
    onGlow50: addTransparency(warmOnColor, 50),
    onGlow45: addTransparency(warmOnColor, 45),
    onGlow40: addTransparency(warmOnColor, 40),
    onGlow35: addTransparency(warmOnColor, 35),
    onGlow30: addTransparency(warmOnColor, 30),

    // White glow for special effects (#fff transparency)
    whiteGlow100: 'rgba(255, 255, 255, 1)',

    offGlow40: addTransparency(offColor, 40),
    offGlow35: addTransparency(offColor, 35),
    offGlow30: addTransparency(offColor, 30),
  };
}

/**
 * Type definition for the color palette returned by calculateBulbColors
 * Use this type when working with bulb colors in components
 */
export type BulbColors = ReturnType<typeof calculateBulbColors>;
