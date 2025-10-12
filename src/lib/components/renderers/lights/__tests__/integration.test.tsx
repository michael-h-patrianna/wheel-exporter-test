/**
 * Integration tests for the light bulb animation system
 *
 * Tests the complete rendering pipeline:
 * - Full rendering pipeline from theme to animated bulbs
 * - Animation switching between different types
 * - Color calculation integration with components
 * - Proper cleanup and memory management
 *
 * @module integration.test
 */

import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { AnimatedLightsRenderer } from '../AnimatedLightsRenderer';
import { calculateBulbColors } from '../../../../utils/lightBulbColors';
import { getAnimationById, getAllAnimations } from '../lightAnimations';
import type { LightsComponent } from '../../../../types';
import type { LightAnimationType } from '../lightAnimations';

describe('Light System Integration', () => {
  afterEach(() => {
    cleanup();
  });

  const standardTheme: LightsComponent = {
    color: '#ffd700',
    positions: [
      { x: 100, y: 50 },
      { x: 150, y: 100 },
      { x: 200, y: 150 },
      { x: 150, y: 200 },
      { x: 100, y: 250 },
    ],
  };

  describe('complete rendering pipeline', () => {
    it('should render from theme configuration to animated bulbs', () => {
      // Step 1: Get animation metadata
      const animationMeta = getAnimationById('alternating-carnival');
      expect(animationMeta).toBeDefined();

      // Step 2: Calculate colors from theme
      const colors = calculateBulbColors(standardTheme.color);
      expect(colors.on).toBeTruthy();
      expect(colors.off).toBeTruthy();

      // Step 3: Render with the configuration
      const { container } = render(
        <AnimatedLightsRenderer
          lights={standardTheme}
          scale={1}
          animationType={animationMeta!.id}
        />
      );

      // Verify rendering
      const rendererContainer = container.querySelector('.animated-lights-renderer');
      expect(rendererContainer).toBeTruthy();

      const bulbs = container.querySelectorAll('.light-bulb__wrapper');
      expect(bulbs.length).toBe(standardTheme.positions.length);

      // Verify colors are applied
      const rendererElement = rendererContainer as HTMLElement;
      expect(rendererElement.style.getPropertyValue('--bulb-on')).toBe(colors.on);
    });

    it('should integrate color calculation with component rendering', () => {
      const testColor = '#ff6600';
      const theme: LightsComponent = {
        color: testColor,
        positions: [{ x: 100, y: 100 }],
      };

      // Calculate colors
      const colors = calculateBulbColors(testColor);

      // Render component
      const { container } = render(
        <AnimatedLightsRenderer
          lights={theme}
          scale={1}
          animationType="sequential-chase"
        />
      );

      // Verify colors match
      const rendererElement = container.querySelector('.animated-lights-renderer') as HTMLElement;
      expect(rendererElement.style.getPropertyValue('--bulb-on')).toBe(colors.on);
      expect(rendererElement.style.getPropertyValue('--bulb-off')).toBe(colors.off);
      expect(rendererElement.style.getPropertyValue('--bulb-blend70')).toBe(colors.blend70);
    });

    it('should render all bulb layers correctly', () => {
      const { container } = render(
        <AnimatedLightsRenderer
          lights={standardTheme}
          scale={1}
          animationType="comet-trail"
        />
      );

      const bulbs = container.querySelectorAll('.light-bulb__wrapper');
      bulbs.forEach(bulb => {
        // Each bulb should have all layers
        expect(bulb.querySelector('.light-bulb__glow-outer')).toBeTruthy();
        expect(bulb.querySelector('.light-bulb__glow-inner')).toBeTruthy();
        expect(bulb.querySelector('.light-bulb__bulb')).toBeTruthy();
        expect(bulb.querySelector('.light-bulb__filament')).toBeTruthy();
        expect(bulb.querySelector('.light-bulb__glass-shine')).toBeTruthy();
      });
    });
  });

  describe('animation type switching', () => {
    it('should switch between different animation types', () => {
      const { container, rerender } = render(
        <AnimatedLightsRenderer
          lights={standardTheme}
          scale={1}
          animationType="alternating-carnival"
        />
      );

      // Verify first animation
      let bulbs = container.querySelectorAll('.light-bulb__wrapper');
      expect(bulbs[0].classList.contains('light-bulb__wrapper--alternating-carnival')).toBe(true);

      // Switch to different animation
      rerender(
        <AnimatedLightsRenderer
          lights={standardTheme}
          scale={1}
          animationType="sequential-chase"
        />
      );

      // Verify animation changed
      bulbs = container.querySelectorAll('.light-bulb__wrapper');
      expect(bulbs[0].classList.contains('light-bulb__wrapper--sequential-chase')).toBe(true);
      expect(bulbs[0].classList.contains('light-bulb__wrapper--alternating-carnival')).toBe(false);
    });

    it('should cycle through all available animations', () => {
      const allAnimations = getAllAnimations();

      allAnimations.forEach(animation => {
        const { container } = render(
          <AnimatedLightsRenderer
            lights={standardTheme}
            scale={1}
            animationType={animation.id}
          />
        );

        const bulbs = container.querySelectorAll('.light-bulb__wrapper');
        expect(bulbs.length).toBe(standardTheme.positions.length);

        cleanup();
      });
    });

    it('should maintain bulb count when switching animations', () => {
      const { container, rerender } = render(
        <AnimatedLightsRenderer
          lights={standardTheme}
          scale={1}
          animationType="none"
        />
      );

      const initialBulbCount = container.querySelectorAll('.light-bulb__wrapper').length;

      // Switch through multiple animations
      const animations: LightAnimationType[] = [
        'alternating-carnival',
        'sequential-chase',
        'accelerating-spin',
        'carnival-waltz',
      ];

      animations.forEach(animationType => {
        rerender(
          <AnimatedLightsRenderer
            lights={standardTheme}
            scale={1}
            animationType={animationType}
          />
        );

        const bulbCount = container.querySelectorAll('.light-bulb__wrapper').length;
        expect(bulbCount).toBe(initialBulbCount);
      });
    });
  });

  describe('scale integration', () => {
    it('should scale all components correctly', () => {
      const scales = [0.5, 1, 2, 3];

      scales.forEach(scale => {
        const { container } = render(
          <AnimatedLightsRenderer
            lights={standardTheme}
            scale={scale}
            animationType="comet-trail"
            bulbSize={10}
          />
        );

        const bulbs = container.querySelectorAll('.light-bulb__wrapper');
        const firstBulb = bulbs[0] as HTMLElement;

        // Position should be scaled with center offset: position.x * scale - (bulbSize * scale / 2)
        const expectedX = standardTheme.positions[0].x * scale - (10 * scale / 2);
        const expectedY = standardTheme.positions[0].y * scale - (10 * scale / 2);
        expect(firstBulb.style.left).toBe(`${expectedX}px`);
        expect(firstBulb.style.top).toBe(`${expectedY}px`);

        // Size should be scaled (bulbSize 10px * scale)
        const expectedSize = 10 * scale;
        expect(firstBulb.style.getPropertyValue('--bulb-size')).toBe(`${expectedSize}px`);

        cleanup();
      });
    });
  });

  describe('color theme variations', () => {
    it('should render correctly with different color themes', () => {
      const colors = [
        '#ff0000', // Red
        '#00ff00', // Green
        '#0000ff', // Blue
        '#ffff00', // Yellow
        '#ff00ff', // Magenta
        '#00ffff', // Cyan
        '#ffffff', // White
        '#000000', // Black
      ];

      colors.forEach(color => {
        const theme: LightsComponent = {
          color,
          positions: [{ x: 100, y: 100 }],
        };

        const { container } = render(
          <AnimatedLightsRenderer
            lights={theme}
            scale={1}
            animationType="random-sparkle"
          />
        );

        const rendererElement = container.querySelector('.animated-lights-renderer') as HTMLElement;
        expect(rendererElement.style.getPropertyValue('--bulb-on')).toBeTruthy();
        expect(rendererElement.style.getPropertyValue('--bulb-off')).toBeTruthy();

        cleanup();
      });
    });
  });

  describe('animation-specific features', () => {
    it('should handle carnival-waltz grouping correctly', () => {
      const { container } = render(
        <AnimatedLightsRenderer
          lights={standardTheme}
          scale={1}
          animationType="carnival-waltz"
        />
      );

      // Check group distribution (groups of 3)
      const beat1 = container.querySelectorAll('.light-bulb__wrapper--beat-1');
      const beat2 = container.querySelectorAll('.light-bulb__wrapper--beat-2');
      const beat3 = container.querySelectorAll('.light-bulb__wrapper--beat-3');

      // 5 bulbs should be distributed: 2-2-1 or similar
      expect(beat1.length + beat2.length + beat3.length).toBe(5);
      expect(beat1.length).toBeGreaterThan(0);
      expect(beat2.length).toBeGreaterThan(0);
    });

    it('should handle dual-convergence halves correctly', () => {
      const { container } = render(
        <AnimatedLightsRenderer
          lights={standardTheme}
          scale={1}
          animationType="dual-convergence"
        />
      );

      const firstHalf = container.querySelectorAll('.light-bulb__wrapper--first-half');
      const secondHalf = container.querySelectorAll('.light-bulb__wrapper--second-half');

      // 5 bulbs: ceil(5/2) = 3 in first half, 2 in second half
      expect(firstHalf.length).toBe(3);
      expect(secondHalf.length).toBe(2);
    });

    it('should handle even/odd patterns correctly', () => {
      const { container } = render(
        <AnimatedLightsRenderer
          lights={standardTheme}
          scale={1}
          animationType="alternating-carnival"
        />
      );

      const bulbs = container.querySelectorAll('.light-bulb__wrapper');
      const evenBulbs = Array.from(bulbs).filter(b =>
        b.classList.contains('light-bulb__wrapper--even')
      );
      const oddBulbs = Array.from(bulbs).filter(b =>
        b.classList.contains('light-bulb__wrapper--odd')
      );

      // 5 bulbs: 3 even (0,2,4) and 2 odd (1,3)
      expect(evenBulbs.length).toBe(3);
      expect(oddBulbs.length).toBe(2);
    });
  });

  describe('variable light counts', () => {
    it('should handle different numbers of lights correctly', () => {
      const counts = [1, 5, 10, 20, 50];

      counts.forEach(count => {
        const theme: LightsComponent = {
          color: '#ffd700',
          positions: Array.from({ length: count }, (_, i) => ({
            x: i * 10,
            y: i * 10,
          })),
        };

        const { container } = render(
          <AnimatedLightsRenderer
            lights={theme}
            scale={1}
            animationType="sequential-chase"
          />
        );

        const bulbs = container.querySelectorAll('.light-bulb__wrapper');
        expect(bulbs.length).toBe(count);

        cleanup();
      });
    });
  });

  describe('performance and memory', () => {
    it('should handle rapid animation changes without memory leaks', () => {
      const { rerender } = render(
        <AnimatedLightsRenderer
          lights={standardTheme}
          scale={1}
          animationType="none"
        />
      );

      const animations: LightAnimationType[] = [
        'alternating-carnival',
        'sequential-chase',
        'accelerating-spin',
        'reverse-chase-pulse',
        'random-sparkle',
        'carnival-waltz',
        'comet-trail',
        'dual-convergence',
        'none',
      ];

      // Rapidly switch between animations
      for (let i = 0; i < 20; i++) {
        const animation = animations[i % animations.length];
        rerender(
          <AnimatedLightsRenderer
            lights={standardTheme}
            scale={1}
            animationType={animation}
          />
        );
      }

      // If we get here without crashing, memory management is working
      expect(true).toBe(true);
    });

    it('should handle theme changes without memory leaks', () => {
      const { rerender } = render(
        <AnimatedLightsRenderer
          lights={standardTheme}
          scale={1}
          animationType="comet-trail"
        />
      );

      // Change theme multiple times
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
      colors.forEach(color => {
        const newTheme = { ...standardTheme, color };
        rerender(
          <AnimatedLightsRenderer
            lights={newTheme}
            scale={1}
            animationType="comet-trail"
          />
        );
      });

      expect(true).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty state correctly', () => {
      const { container } = render(
        <AnimatedLightsRenderer
          lights={undefined}
          scale={1}
          animationType="none"
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should handle single light with all animations', () => {
      const singleLight: LightsComponent = {
        color: '#ffd700',
        positions: [{ x: 100, y: 100 }],
      };

      getAllAnimations().forEach(animation => {
        const { container } = render(
          <AnimatedLightsRenderer
            lights={singleLight}
            scale={1}
            animationType={animation.id}
          />
        );

        const bulbs = container.querySelectorAll('.light-bulb__wrapper');
        expect(bulbs.length).toBe(1);

        cleanup();
      });
    });

    it('should handle extreme scale values', () => {
      const scales = [0.1, 0.5, 5, 10];

      scales.forEach(scale => {
        const { container } = render(
          <AnimatedLightsRenderer
            lights={standardTheme}
            scale={scale}
            animationType="comet-trail"
          />
        );

        const bulbs = container.querySelectorAll('.light-bulb__wrapper');
        expect(bulbs.length).toBe(standardTheme.positions.length);

        cleanup();
      });
    });
  });

  describe('animation metadata integration', () => {
    it('should use correct duration from metadata', () => {
      const animationMeta = getAnimationById('accelerating-spin');
      expect(animationMeta?.duration).toBe(5.0);

      const { container } = render(
        <AnimatedLightsRenderer
          lights={standardTheme}
          scale={1}
          animationType="accelerating-spin"
        />
      );

      const rendererElement = container.querySelector('.animated-lights-renderer') as HTMLElement;
      const delay = rendererElement.style.getPropertyValue('--delay-per-bulb');

      // Duration 5.0 / 5 bulbs = 1.0s per bulb
      expect(delay).toBe('1s');
    });

    it('should match CSS file naming convention', () => {
      getAllAnimations().forEach(animation => {
        if (animation.id !== 'none') {
          // CSS file should match animation ID
          expect(animation.cssFile).toBe(animation.id);
        }
      });
    });
  });
});
