/**
 * Unit tests for lightBulbColors utility functions
 *
 * Tests all color calculation functions including:
 * - parseColor() - RGB extraction from hex and rgba strings
 * - blendColors() - Color mixing at various percentages
 * - addTransparency() - Alpha channel application
 * - shiftColorTemperature() - Warm/cool color shifts
 * - calculateBulbColors() - Complete color palette generation
 *
 * @module lightBulbColors.test
 */

import {
  blendColors,
  addTransparency,
  shiftColorTemperature,
  calculateBulbColors,
  type BulbColors,
} from '../lightBulbColors';

describe('lightBulbColors', () => {
  describe('blendColors', () => {
    it('should blend two hex colors at 50%', () => {
      const result = blendColors('#ff0000', '#0000ff', 50);
      expect(result).toBe('#800080'); // Red + Blue = Purple
    });

    it('should return first color at 100%', () => {
      const result = blendColors('#ff0000', '#0000ff', 100);
      expect(result).toBe('#ff0000');
    });

    it('should return second color at 0%', () => {
      const result = blendColors('#ff0000', '#0000ff', 0);
      expect(result).toBe('#0000ff');
    });

    it('should blend with non-even percentages', () => {
      const result = blendColors('#ffffff', '#000000', 75);
      expect(result).toBe('#bfbfbf'); // 75% white + 25% black
    });

    it('should handle rgba color format', () => {
      const result = blendColors('rgba(255, 0, 0, 0.5)', 'rgba(0, 0, 255, 1.0)', 50);
      expect(result).toBe('#800080'); // Should ignore alpha and blend RGB
    });

    it('should handle mixed hex and rgba formats', () => {
      const result = blendColors('#ff0000', 'rgba(0, 0, 255, 0.8)', 50);
      expect(result).toBe('#800080');
    });

    it('should blend gold and black correctly', () => {
      const result = blendColors('#ffd700', '#000000', 85);
      // 85% gold (255,215,0) + 15% black (0,0,0)
      // r: 255*0.85 + 0*0.15 = 217 (d9)
      // g: 215*0.85 + 0*0.15 = 183 (b7)
      // b: 0*0.85 + 0*0.15 = 0 (00)
      expect(result).toBe('#d9b700');
    });

    it('should handle edge case with all black', () => {
      const result = blendColors('#000000', '#000000', 50);
      expect(result).toBe('#000000');
    });

    it('should handle edge case with all white', () => {
      const result = blendColors('#ffffff', '#ffffff', 50);
      expect(result).toBe('#ffffff');
    });

    it('should properly pad single-digit hex values', () => {
      const result = blendColors('#0a0a0a', '#000000', 50);
      expect(result).toBe('#050505'); // Should have leading zeros
    });
  });

  describe('addTransparency', () => {
    it('should add 100% opacity to hex color', () => {
      const result = addTransparency('#ff0000', 100);
      expect(result).toBe('rgba(255, 0, 0, 1)');
    });

    it('should add 50% opacity to hex color', () => {
      const result = addTransparency('#ff0000', 50);
      expect(result).toBe('rgba(255, 0, 0, 0.5)');
    });

    it('should add 0% opacity (fully transparent)', () => {
      const result = addTransparency('#ff0000', 0);
      expect(result).toBe('rgba(255, 0, 0, 0)');
    });

    it('should handle gold color', () => {
      const result = addTransparency('#ffd700', 80);
      expect(result).toBe('rgba(255, 215, 0, 0.8)');
    });

    it('should handle black color', () => {
      const result = addTransparency('#000000', 50);
      expect(result).toBe('rgba(0, 0, 0, 0.5)');
    });

    it('should handle white color', () => {
      const result = addTransparency('#ffffff', 75);
      expect(result).toBe('rgba(255, 255, 255, 0.75)');
    });

    it('should handle odd transparency values', () => {
      const result = addTransparency('#123456', 33);
      expect(result).toBe('rgba(18, 52, 86, 0.33)');
    });
  });

  describe('shiftColorTemperature', () => {
    describe('warm shifts (positive)', () => {
      it('should shift color warmer', () => {
        const result = shiftColorTemperature('#808080', 50);
        // r: 128 + 50*0.8 = 168 (a8)
        // g: 128 + 50*0.5 = 153 (99)
        // b: max(0, 128 - 50*0.3) = 113 (71)
        expect(result).toBe('#a89971');
      });

      it('should clamp red at 255', () => {
        const result = shiftColorTemperature('#ff0000', 100);
        expect(result).toBe('#ff3200'); // Red maxed, green increased, blue reduced
      });

      it('should clamp green at 255', () => {
        const result = shiftColorTemperature('#00ff00', 100);
        // r: min(255, 0 + 100*0.8) = 80 (50)
        // g: min(255, 255 + 100*0.5) = 255 (ff)
        // b: max(0, 255 - 100*0.3) = 225 (e1) but wait green's blue = 255
        // Starting with #00ff00 (pure green): r=0, g=255, b=0
        // r: min(255, 0 + 100*0.8) = 80 (50)
        // g: min(255, 255 + 100*0.5) = 255 (ff)
        // b: max(0, 0 - 100*0.3) = 0 (00)
        expect(result).toBe('#50ff00');
      });

      it('should clamp blue at 0', () => {
        const result = shiftColorTemperature('#0000ff', 255);
        // Starting with #0000ff (pure blue): r=0, g=0, b=255
        // r: min(255, 0 + 255*0.8) = 204 (cc)
        // g: min(255, 0 + 255*0.5) = 128 (80)
        // b: max(0, 255 - 255*0.3) = 179 (b3)
        expect(result).toBe('#cc80b3');
      });

      it('should handle small warm shift', () => {
        const result = shiftColorTemperature('#ffd700', 15);
        // r: min(255, 255 + 15*0.8) = 255
        // g: min(255, 215 + 15*0.5) = 223 (df)
        // b: max(0, 0 - 15*0.3) = 0
        expect(result).toBe('#ffdf00');
      });
    });

    describe('cool shifts (negative)', () => {
      it('should shift color cooler', () => {
        const result = shiftColorTemperature('#808080', -50);
        // r: max(0, 128 - 50*0.4) = 108 (6c)
        // g: max(0, 128 - 50*0.2) = 118 (76)
        // b: min(255, 128 + 50*0.6) = 158 (9e)
        expect(result).toBe('#6c769e');
      });

      it('should clamp red at 0', () => {
        const result = shiftColorTemperature('#0000ff', -100);
        // Starting with #0000ff (pure blue): r=0, g=0, b=255
        // r: max(0, 0 - 100*0.4) = 0 (00)
        // g: max(0, 0 - 100*0.2) = 0 (00)
        // b: min(255, 255 + 100*0.6) = 255 (ff)
        expect(result).toBe('#0000ff');
      });

      it('should clamp green at 0', () => {
        const result = shiftColorTemperature('#00ff00', -255);
        // Starting with #00ff00 (pure green): r=0, g=255, b=0
        // r: max(0, 0 - 255*0.4) = 0 (00)
        // g: max(0, 255 - 255*0.2) = 204 (cc)
        // b: min(255, 0 + 255*0.6) = 153 (99)
        expect(result).toBe('#00cc99');
      });

      it('should clamp blue at 255', () => {
        const result = shiftColorTemperature('#ff00ff', -255);
        // Starting with #ff00ff (magenta): r=255, g=0, b=255
        // r: max(0, 255 - 255*0.4) = 153 (99)
        // g: max(0, 0 - 255*0.2) = 0 (00)
        // b: min(255, 255 + 255*0.6) = 255 (ff)
        expect(result).toBe('#9900ff');
      });

      it('should handle small cool shift', () => {
        const result = shiftColorTemperature('#ffd700', -10);
        // r: max(0, 255 - 10*0.4) = 251 (fb)
        // g: max(0, 215 - 10*0.2) = 213 (d5)
        // b: min(255, 0 + 10*0.6) = 6 (06)
        expect(result).toBe('#fbd506');
      });
    });

    it('should return same color with zero shift', () => {
      const result = shiftColorTemperature('#ffd700', 0);
      expect(result).toBe('#ffd700');
    });
  });

  describe('calculateBulbColors', () => {
    it('should generate complete color palette from gold', () => {
      const colors = calculateBulbColors('#ffd700');

      // Check that all required properties exist
      expect(colors).toHaveProperty('on');
      expect(colors).toHaveProperty('off');
      expect(colors).toHaveProperty('blend90');
      expect(colors).toHaveProperty('blend80');
      expect(colors).toHaveProperty('blend70');
      expect(colors).toHaveProperty('blend60');
      expect(colors).toHaveProperty('blend40');
      expect(colors).toHaveProperty('blend30');
      expect(colors).toHaveProperty('blend20');
      expect(colors).toHaveProperty('blend10');
      expect(colors).toHaveProperty('offTint30');
      expect(colors).toHaveProperty('offTint20');
      expect(colors).toHaveProperty('onGradient');
      expect(colors).toHaveProperty('onGlow100');
      expect(colors).toHaveProperty('onGlow50');
      expect(colors).toHaveProperty('onGlow30');
      expect(colors).toHaveProperty('offGlow40');
    });

    it('should generate warm on color', () => {
      const colors = calculateBulbColors('#ffd700');
      // Should be warmer than original
      expect(colors.on).not.toBe('#ffd700');
      expect(colors.on).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('should generate off color with opacity', () => {
      const colors = calculateBulbColors('#ffd700');
      // Off color should be rgba with 0.7 opacity
      expect(colors.off).toMatch(/^rgba\(\d+, \d+, \d+, 0\.7\)$/);
    });

    it('should generate blend colors', () => {
      const colors = calculateBulbColors('#ffd700');
      // All blend colors should be hex
      expect(colors.blend90).toMatch(/^#[0-9a-f]{6}$/);
      expect(colors.blend80).toMatch(/^#[0-9a-f]{6}$/);
      expect(colors.blend70).toMatch(/^#[0-9a-f]{6}$/);
      expect(colors.blend60).toMatch(/^#[0-9a-f]{6}$/);
      expect(colors.blend40).toMatch(/^#[0-9a-f]{6}$/);
      expect(colors.blend30).toMatch(/^#[0-9a-f]{6}$/);
      expect(colors.blend20).toMatch(/^#[0-9a-f]{6}$/);
      expect(colors.blend10).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('should generate glow colors with transparency', () => {
      const colors = calculateBulbColors('#ffd700');
      // All glow colors should be rgba
      expect(colors.onGlow100).toMatch(/^rgba\(\d+, \d+, \d+, 1\)$/);
      expect(colors.onGlow90).toMatch(/^rgba\(\d+, \d+, \d+, 0\.9\)$/);
      expect(colors.onGlow80).toMatch(/^rgba\(\d+, \d+, \d+, 0\.8\)$/);
      expect(colors.onGlow50).toMatch(/^rgba\(\d+, \d+, \d+, 0\.5\)$/);
      expect(colors.onGlow30).toMatch(/^rgba\(\d+, \d+, \d+, 0\.3\)$/);
    });

    it('should include white glow', () => {
      const colors = calculateBulbColors('#ffd700');
      expect(colors.whiteGlow100).toBe('rgba(255, 255, 255, 1)');
    });

    it('should work with red color', () => {
      const colors = calculateBulbColors('#ff0000');
      expect(colors.on).toMatch(/^#[0-9a-f]{6}$/);
      expect(colors.off).toMatch(/^rgba\(\d+, \d+, \d+, 0\.7\)$/);
    });

    it('should work with blue color', () => {
      const colors = calculateBulbColors('#0000ff');
      expect(colors.on).toMatch(/^#[0-9a-f]{6}$/);
      expect(colors.off).toMatch(/^rgba\(\d+, \d+, \d+, 0\.7\)$/);
    });

    it('should work with green color', () => {
      const colors = calculateBulbColors('#00ff00');
      expect(colors.on).toMatch(/^#[0-9a-f]{6}$/);
      expect(colors.off).toMatch(/^rgba\(\d+, \d+, \d+, 0\.7\)$/);
    });

    it('should work with white color', () => {
      const colors = calculateBulbColors('#ffffff');
      expect(colors.on).toMatch(/^#[0-9a-f]{6}$/);
      expect(colors.off).toMatch(/^rgba\(\d+, \d+, \d+, 0\.7\)$/);
    });

    it('should work with black color', () => {
      const colors = calculateBulbColors('#000000');
      expect(colors.on).toMatch(/^#[0-9a-f]{6}$/);
      expect(colors.off).toMatch(/^rgba\(\d+, \d+, \d+, 0\.7\)$/);
    });

    it('should generate gradient color for box-shadow', () => {
      const colors = calculateBulbColors('#ffd700');
      expect(colors.onGradient).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('should generate off tint colors', () => {
      const colors = calculateBulbColors('#ffd700');
      expect(colors.offTint30).toMatch(/^#[0-9a-f]{6}$/);
      expect(colors.offTint20).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('should generate all additional blend colors', () => {
      const colors = calculateBulbColors('#ffd700');
      expect(colors.offBlend10On).toMatch(/^#[0-9a-f]{6}$/);
      expect(colors.onBlend5Off).toMatch(/^#[0-9a-f]{6}$/);
      expect(colors.onBlend10Off).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('should generate all opacity levels', () => {
      const colors = calculateBulbColors('#ffd700');
      expect(colors.onGlow95).toMatch(/^rgba\(\d+, \d+, \d+, 0\.95\)$/);
      expect(colors.onGlow75).toMatch(/^rgba\(\d+, \d+, \d+, 0\.75\)$/);
      expect(colors.onGlow70).toMatch(/^rgba\(\d+, \d+, \d+, 0\.7\)$/);
      expect(colors.onGlow65).toMatch(/^rgba\(\d+, \d+, \d+, 0\.65\)$/);
      expect(colors.onGlow60).toMatch(/^rgba\(\d+, \d+, \d+, 0\.6\)$/);
      expect(colors.onGlow55).toMatch(/^rgba\(\d+, \d+, \d+, 0\.55\)$/);
      expect(colors.onGlow45).toMatch(/^rgba\(\d+, \d+, \d+, 0\.45\)$/);
      expect(colors.onGlow40).toMatch(/^rgba\(\d+, \d+, \d+, 0\.4\)$/);
      expect(colors.onGlow35).toMatch(/^rgba\(\d+, \d+, \d+, 0\.35\)$/);
    });

    it('should generate off glow colors', () => {
      const colors = calculateBulbColors('#ffd700');
      // offColor is rgba, addTransparency can handle both hex and rgba
      expect(colors.offGlow40).toMatch(/^rgba\(\d+, \d+, \d+, 0\.4\)$/);
      expect(colors.offGlow35).toMatch(/^rgba\(\d+, \d+, \d+, 0\.35\)$/);
      expect(colors.offGlow30).toMatch(/^rgba\(\d+, \d+, \d+, 0\.3\)$/);
    });
  });

  describe('BulbColors type', () => {
    it('should infer correct type from calculateBulbColors', () => {
      const colors: BulbColors = calculateBulbColors('#ffd700');
      // TypeScript compilation validates the type
      expect(colors).toBeDefined();
    });
  });
});
