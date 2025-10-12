/**
 * Tests for style builder utility functions
 */

import { buildGradient, buildTextStyle, buildBoxStyle, buildButtonStyle } from '../../lib/utils/styleBuilders';
import { Fill, RewardsPrizeTextStyle, RewardsBackgroundStyle, RewardsButtonStyle } from '../../lib/types';

describe('styleBuilders', () => {
  describe('buildGradient', () => {
    it('returns transparent for undefined fill', () => {
      expect(buildGradient(undefined)).toBe('transparent');
    });

    it('handles solid color fill', () => {
      const fill: Fill = { type: 'solid', color: '#ff0000' };
      expect(buildGradient(fill)).toBe('#ff0000');
    });

    it('handles invalid NaN colors in solid fill', () => {
      const fill: Fill = { type: 'solid', color: '#NaNNaNNaNNaN' };
      expect(buildGradient(fill)).toBe('transparent');
    });

    it('builds linear gradient correctly', () => {
      const fill: Fill = {
        type: 'gradient',
        gradient: {
          type: 'linear',
          rotation: 90,
          stops: [
            { color: '#ff0000', position: 0 },
            { color: '#0000ff', position: 1 },
          ],
          transform: [[1, 0, 0], [0, 1, 0]],
        },
      };
      expect(buildGradient(fill)).toBe('linear-gradient(90deg, #ff0000 0%, #0000ff 100%)');
    });

    it('handles gradient with multiple stops', () => {
      const fill: Fill = {
        type: 'gradient',
        gradient: {
          type: 'linear',
          rotation: 45,
          stops: [
            { color: '#ff0000', position: 0 },
            { color: '#00ff00', position: 0.5 },
            { color: '#0000ff', position: 1 },
          ],
          transform: [[1, 0, 0], [0, 1, 0]],
        },
      };
      expect(buildGradient(fill)).toBe('linear-gradient(45deg, #ff0000 0%, #00ff00 50%, #0000ff 100%)');
    });

    it('handles invalid NaN colors in gradient stops', () => {
      const fill: Fill = {
        type: 'gradient',
        gradient: {
          type: 'linear',
          rotation: 180,
          stops: [
            { color: '#NaNNaNNaNNaN', position: 0 },
            { color: '#0000ff', position: 1 },
          ],
          transform: [[1, 0, 0], [0, 1, 0]],
        },
      };
      expect(buildGradient(fill)).toBe('linear-gradient(180deg, transparent 0%, #0000ff 100%)');
    });

    it('returns transparent for gradient without gradient property', () => {
      const fill: Fill = { type: 'gradient' };
      expect(buildGradient(fill)).toBe('transparent');
    });
  });

  describe('buildTextStyle', () => {
    it('returns empty object for undefined textStyle', () => {
      expect(buildTextStyle(undefined, 16, 1)).toEqual({});
    });

    it('builds basic text style with solid fill', () => {
      const textStyle: RewardsPrizeTextStyle = {
        label: 'Test',
        fill: { type: 'solid', color: '#ffffff' },
      };
      const result = buildTextStyle(textStyle, 16, 1);
      expect(result.fontSize).toBe('16px');
      expect(result.lineHeight).toBe('16px');
      expect(result.color).toBe('#ffffff');
      expect(result.fontWeight).toBe(600);
      expect(result.textAlign).toBe('center');
    });

    it('builds text style with gradient fill', () => {
      const textStyle: RewardsPrizeTextStyle = {
        label: 'Test',
        fill: {
          type: 'gradient',
          gradient: {
            type: 'linear',
            rotation: 90,
            stops: [
              { color: '#ff0000', position: 0 },
              { color: '#0000ff', position: 1 },
            ],
            transform: [[1, 0, 0], [0, 1, 0]],
          },
        },
      };
      const result = buildTextStyle(textStyle, 20, 1);
      expect(result.backgroundImage).toBe('linear-gradient(90deg, #ff0000 0%, #0000ff 100%)');
      expect(result.WebkitBackgroundClip).toBe('text');
      expect(result.WebkitTextFillColor).toBe('transparent');
      expect(result.backgroundClip).toBe('text');
      expect(result.color).toBe('transparent');
    });

    it('applies stroke with scaling', () => {
      const textStyle: RewardsPrizeTextStyle = {
        label: 'Test',
        fill: { type: 'solid', color: '#ffffff' },
        stroke: { width: 2, color: '#000000' },
      };
      const result = buildTextStyle(textStyle, 16, 2);
      expect(result.WebkitTextStroke).toBe('4px #000000');
    });

    it('scales fontSize correctly', () => {
      const textStyle: RewardsPrizeTextStyle = {
        label: 'Test',
        fill: { type: 'solid', color: '#ffffff' },
      };
      const result = buildTextStyle(textStyle, 24, 0.5);
      expect(result.fontSize).toBe('24px'); // fontSize is passed pre-scaled
    });

    it('does not add text shadows (cross-platform compatibility)', () => {
      const textStyle: RewardsPrizeTextStyle = {
        label: 'Test',
        fill: { type: 'solid', color: '#ffffff' },
        dropShadows: [{ x: 2, y: 2, blur: 4, color: '#000000' }],
      };
      const result = buildTextStyle(textStyle, 16, 1);
      expect(result.textShadow).toBeUndefined();
    });
  });

  describe('buildBoxStyle', () => {
    it('returns empty object for undefined bgStyle', () => {
      expect(buildBoxStyle(undefined, 1)).toEqual({});
    });

    it('builds basic box style', () => {
      const bgStyle: RewardsBackgroundStyle = {
        borderRadius: 8,
        backgroundFill: { type: 'solid', color: '#1a1a1a' },
      };
      const result = buildBoxStyle(bgStyle, 1);
      expect(result.borderRadius).toBe('8px');
      expect(result.background).toBe('#1a1a1a');
      expect(result.width).toBe('100%');
      expect(result.display).toBe('flex');
    });

    it('applies padding with scaling', () => {
      const bgStyle: RewardsBackgroundStyle = {
        borderRadius: 4,
        backgroundFill: { type: 'solid', color: '#000000' },
        padding: { vertical: 16, horizontal: 24 },
      };
      const result = buildBoxStyle(bgStyle, 2);
      expect(result.padding).toBe('32px 48px');
    });

    it('applies dimensions with scaling', () => {
      const bgStyle: RewardsBackgroundStyle = {
        borderRadius: 4,
        backgroundFill: { type: 'solid', color: '#000000' },
        dimensions: { width: 200, height: 100 },
      };
      const result = buildBoxStyle(bgStyle, 2);
      expect(result.minHeight).toBe('200px');
    });

    it('applies stroke with scaling', () => {
      const bgStyle: RewardsBackgroundStyle = {
        borderRadius: 4,
        backgroundFill: { type: 'solid', color: '#000000' },
        stroke: { width: 2, color: '#ffffff' },
      };
      const result = buildBoxStyle(bgStyle, 2);
      expect(result.border).toBe('4px solid #ffffff');
    });

    it('applies single drop shadow with scaling', () => {
      const bgStyle: RewardsBackgroundStyle = {
        borderRadius: 4,
        backgroundFill: { type: 'solid', color: '#000000' },
        dropShadows: [{ x: 10, y: 10, blur: 20, spread: 5, color: '#00000080' }],
      };
      const result = buildBoxStyle(bgStyle, 2);
      expect(result.boxShadow).toBe('20px 20px 40px 10px #00000080');
    });

    it('applies multiple drop shadows with scaling', () => {
      const bgStyle: RewardsBackgroundStyle = {
        borderRadius: 4,
        backgroundFill: { type: 'solid', color: '#000000' },
        dropShadows: [
          { x: 5, y: 5, blur: 10, spread: 2, color: '#ff000080' },
          { x: -5, y: -5, blur: 10, spread: 2, color: '#0000ff80' },
        ],
      };
      const result = buildBoxStyle(bgStyle, 1);
      expect(result.boxShadow).toBe('5px 5px 10px 2px #ff000080, -5px -5px 10px 2px #0000ff80');
    });
  });

  describe('buildButtonStyle', () => {
    it('returns empty styles for undefined btnStyle', () => {
      const result = buildButtonStyle(undefined, 'default', 1);
      expect(result.container).toEqual({});
      expect(result.text).toEqual({});
    });

    it('builds basic button container style', () => {
      const btnStyle: RewardsButtonStyle = {
        frame: {
          borderRadius: 8,
          backgroundFill: { type: 'solid', color: '#ff0000' },
          padding: { vertical: 12, horizontal: 24 },
        },
        text: {
          fontSize: 16,
          color: '#ffffff',
          fontWeight: 700,
        },
      };
      const result = buildButtonStyle(btnStyle, 'default', 1);
      expect(result.container.borderRadius).toBe('8px');
      expect(result.container.background).toBe('#ff0000');
      expect(result.container.padding).toBe('12px 24px');
      expect(result.container.cursor).toBe('pointer');
    });

    it('sets cursor to not-allowed for disabled state', () => {
      const btnStyle: RewardsButtonStyle = {
        frame: {
          borderRadius: 8,
          backgroundFill: { type: 'solid', color: '#cccccc' },
          padding: { vertical: 12, horizontal: 24 },
        },
        text: {
          fontSize: 16,
          color: '#666666',
          fontWeight: 700,
        },
      };
      const result = buildButtonStyle(btnStyle, 'disabled', 1);
      expect(result.container.cursor).toBe('not-allowed');
    });

    it('applies button dimensions with scaling', () => {
      const btnStyle: RewardsButtonStyle = {
        frame: {
          borderRadius: 8,
          backgroundFill: { type: 'solid', color: '#ff0000' },
          padding: { vertical: 12, horizontal: 24 },
          dimensions: { width: 200, height: 50 },
        },
        text: {
          fontSize: 16,
          color: '#ffffff',
          fontWeight: 700,
        },
      };
      const result = buildButtonStyle(btnStyle, 'default', 2);
      expect(result.container.width).toBe('400px');
      expect(result.container.height).toBe('100px');
    });

    it('applies button stroke with scaling', () => {
      const btnStyle: RewardsButtonStyle = {
        frame: {
          borderRadius: 8,
          backgroundFill: { type: 'solid', color: '#ff0000' },
          padding: { vertical: 12, horizontal: 24 },
          stroke: { width: 2, color: '#ffffff' },
        },
        text: {
          fontSize: 16,
          color: '#ffffff',
          fontWeight: 700,
        },
      };
      const result = buildButtonStyle(btnStyle, 'default', 2);
      expect(result.container.border).toBe('4px solid #ffffff');
    });

    it('applies button drop shadows with scaling', () => {
      const btnStyle: RewardsButtonStyle = {
        frame: {
          borderRadius: 8,
          backgroundFill: { type: 'solid', color: '#ff0000' },
          padding: { vertical: 12, horizontal: 24 },
          dropShadows: [{ x: 5, y: 5, blur: 10, spread: 2, color: '#00000080' }],
        },
        text: {
          fontSize: 16,
          color: '#ffffff',
          fontWeight: 700,
        },
      };
      const result = buildButtonStyle(btnStyle, 'default', 2);
      expect(result.container.boxShadow).toBe('10px 10px 20px 4px #00000080');
    });

    it('builds button text style with scaling', () => {
      const btnStyle: RewardsButtonStyle = {
        frame: {
          borderRadius: 8,
          backgroundFill: { type: 'solid', color: '#ff0000' },
          padding: { vertical: 12, horizontal: 24 },
        },
        text: {
          fontSize: 16,
          color: '#ffffff',
          fontWeight: 700,
          lineHeightPx: 20,
        },
      };
      const result = buildButtonStyle(btnStyle, 'default', 2);
      expect(result.text.fontSize).toBe('32px');
      expect(result.text.color).toBe('#ffffff');
      expect(result.text.fontWeight).toBe(700);
      expect(result.text.lineHeight).toBe('40px');
    });

    it('handles missing lineHeightPx', () => {
      const btnStyle: RewardsButtonStyle = {
        frame: {
          borderRadius: 8,
          backgroundFill: { type: 'solid', color: '#ff0000' },
          padding: { vertical: 12, horizontal: 24 },
        },
        text: {
          fontSize: 16,
          color: '#ffffff',
          fontWeight: 700,
        },
      };
      const result = buildButtonStyle(btnStyle, 'default', 1);
      expect(result.text.lineHeight).toBe('normal');
    });
  });
});
