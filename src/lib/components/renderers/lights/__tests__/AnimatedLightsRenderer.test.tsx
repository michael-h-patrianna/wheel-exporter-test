/**
 * Component tests for AnimatedLightsRenderer component
 *
 * Tests the main renderer component:
 * - Renders correct number of bulbs
 * - Positions bulbs correctly with scale
 * - Calculates colors from theme
 * - Applies selected animation type
 * - Handles empty positions array
 * - Sets all CSS custom properties
 * - Calculates delay per bulb correctly
 *
 * @module AnimatedLightsRenderer.test
 */

import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { AnimatedLightsRenderer } from '@components/renderers/lights/AnimatedLightsRenderer';
import type { LightsComponent } from '@lib-types';

describe('AnimatedLightsRenderer', () => {
  afterEach(() => {
    cleanup();
  });

  const mockLights: LightsComponent = {
    color: '#ffd700',
    positions: [
      { x: 100, y: 50 },
      { x: 200, y: 100 },
      { x: 300, y: 150 },
    ],
  };

  describe('rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<AnimatedLightsRenderer lights={mockLights} scale={1} />);
      expect(container.firstChild).toBeTruthy();
    });

    it('should render correct number of bulbs', () => {
      const { container } = render(<AnimatedLightsRenderer lights={mockLights} scale={1} />);

      const bulbs = container.querySelectorAll('.light-bulb__wrapper');
      expect(bulbs.length).toBe(3);
    });

    it('should render with multiple bulbs', () => {
      const manyLights: LightsComponent = {
        color: '#ff0000',
        positions: Array.from({ length: 20 }, (_, i) => ({ x: i * 10, y: i * 10 })),
      };

      const { container } = render(<AnimatedLightsRenderer lights={manyLights} scale={1} />);

      const bulbs = container.querySelectorAll('.light-bulb__wrapper');
      expect(bulbs.length).toBe(20);
    });

    it('should return null when no lights provided', () => {
      const { container } = render(<AnimatedLightsRenderer lights={undefined} scale={1} />);

      expect(container.firstChild).toBeNull();
    });

    it('should return null when positions array is empty', () => {
      const emptyLights: LightsComponent = {
        color: '#ffd700',
        positions: [],
      };

      const { container } = render(<AnimatedLightsRenderer lights={emptyLights} scale={1} />);

      expect(container.firstChild).toBeNull();
    });

    it('should return null when positions is undefined', () => {
      const noPositions = {
        color: '#ffd700',
        positions: undefined,
      } as unknown as LightsComponent;

      const { container } = render(<AnimatedLightsRenderer lights={noPositions} scale={1} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('positioning and scaling', () => {
    it('should apply scale to bulb positions', () => {
      const { container } = render(
        <AnimatedLightsRenderer lights={mockLights} scale={2} bulbSize={10} />
      );

      const bulbs = container.querySelectorAll('.light-bulb__wrapper');
      const firstBulb = bulbs[0] as HTMLElement;

      // Original position is 100, 50
      // With scale 2: position.x * scale = 100 * 2 = 200
      expect(firstBulb.style.left).toBe('200px');
      expect(firstBulb.style.top).toBe('100px');
    });

    it('should apply scale 1 correctly', () => {
      const { container } = render(
        <AnimatedLightsRenderer lights={mockLights} scale={1} bulbSize={10} />
      );

      const bulbs = container.querySelectorAll('.light-bulb__wrapper');
      const firstBulb = bulbs[0] as HTMLElement;

      // position.x * 1 = 100
      expect(firstBulb.style.left).toBe('100px');
      expect(firstBulb.style.top).toBe('50px');
    });

    it('should apply fractional scale', () => {
      const { container } = render(
        <AnimatedLightsRenderer lights={mockLights} scale={0.5} bulbSize={10} />
      );

      const bulbs = container.querySelectorAll('.light-bulb__wrapper');
      const firstBulb = bulbs[0] as HTMLElement;

      // position.x * 0.5 = 50
      expect(firstBulb.style.left).toBe('50px');
      expect(firstBulb.style.top).toBe('25px');
    });

    it('should scale bulb size', () => {
      const { container } = render(
        <AnimatedLightsRenderer lights={mockLights} scale={2} bulbSize={12} />
      );

      const bulbs = container.querySelectorAll('.light-bulb__wrapper');
      const firstBulb = bulbs[0] as HTMLElement;

      // Default bulbSize is 12, with scale 2 = 24
      expect(firstBulb.style.getPropertyValue('--bulb-size')).toBe('24px');
    });

    it('should use custom bulb size', () => {
      const { container } = render(
        <AnimatedLightsRenderer lights={mockLights} scale={1} bulbSize={20} />
      );

      const bulbs = container.querySelectorAll('.light-bulb__wrapper');
      const firstBulb = bulbs[0] as HTMLElement;

      expect(firstBulb.style.getPropertyValue('--bulb-size')).toBe('20px');
    });
  });

  describe('CSS custom properties', () => {
    it('should set color CSS properties on container', () => {
      const { container } = render(<AnimatedLightsRenderer lights={mockLights} scale={1} />);

      const rendererContainer = container.querySelector('.animated-lights-renderer') as HTMLElement;
      const style = rendererContainer.style;

      // Check that color properties are set (values are calculated, so just check they exist)
      expect(style.getPropertyValue('--bulb-on')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-off')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-blend90')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-blend80')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-blend70')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-on-glow100')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-on-glow50')).toBeTruthy();
    });

    it('should set all blend color properties', () => {
      const { container } = render(<AnimatedLightsRenderer lights={mockLights} scale={1} />);

      const rendererContainer = container.querySelector('.animated-lights-renderer') as HTMLElement;
      const style = rendererContainer.style;

      expect(style.getPropertyValue('--bulb-blend90')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-blend80')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-blend70')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-blend60')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-blend40')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-blend30')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-blend20')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-blend10')).toBeTruthy();
    });

    it('should set all glow color properties', () => {
      const { container } = render(<AnimatedLightsRenderer lights={mockLights} scale={1} />);

      const rendererContainer = container.querySelector('.animated-lights-renderer') as HTMLElement;
      const style = rendererContainer.style;

      expect(style.getPropertyValue('--bulb-on-glow100')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-on-glow95')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-on-glow90')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-on-glow80')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-on-glow75')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-on-glow70')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-on-glow65')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-on-glow60')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-on-glow55')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-on-glow50')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-on-glow45')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-on-glow40')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-on-glow35')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-on-glow30')).toBeTruthy();
    });

    it('should set off glow properties', () => {
      const { container } = render(<AnimatedLightsRenderer lights={mockLights} scale={1} />);

      const rendererContainer = container.querySelector('.animated-lights-renderer') as HTMLElement;
      const style = rendererContainer.style;

      expect(style.getPropertyValue('--bulb-off-glow40')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-off-glow35')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-off-glow30')).toBeTruthy();
    });

    it('should set off tint properties', () => {
      const { container } = render(<AnimatedLightsRenderer lights={mockLights} scale={1} />);

      const rendererContainer = container.querySelector('.animated-lights-renderer') as HTMLElement;
      const style = rendererContainer.style;

      expect(style.getPropertyValue('--bulb-off-tint30')).toBeTruthy();
      expect(style.getPropertyValue('--bulb-off-tint20')).toBeTruthy();
    });
  });

  describe('delay calculation', () => {
    it('should calculate delay for alternating-carnival', () => {
      const { container } = render(
        <AnimatedLightsRenderer
          lights={mockLights}
          scale={1}
          animationType="alternating-carnival"
        />
      );

      const rendererContainer = container.querySelector('.animated-lights-renderer') as HTMLElement;
      const delay = rendererContainer.style.getPropertyValue('--delay-per-bulb');

      // Duration is 1.2s, 3 bulbs = ~0.4s per bulb (allowing for floating point precision)
      expect(parseFloat(delay)).toBeCloseTo(1.2 / 3, 2);
    });

    it('should calculate delay for sequential-chase', () => {
      const { container } = render(
        <AnimatedLightsRenderer lights={mockLights} scale={1} animationType="sequential-chase" />
      );

      const rendererContainer = container.querySelector('.animated-lights-renderer') as HTMLElement;
      const delay = rendererContainer.style.getPropertyValue('--delay-per-bulb');

      // Duration is 1.6s, 3 bulbs = ~0.533s per bulb
      expect(parseFloat(delay)).toBeCloseTo(1.6 / 3, 2);
    });

    it('should set delay to 0 for "none" animation', () => {
      const { container } = render(
        <AnimatedLightsRenderer lights={mockLights} scale={1} animationType="none" />
      );

      const rendererContainer = container.querySelector('.animated-lights-renderer') as HTMLElement;
      const delay = rendererContainer.style.getPropertyValue('--delay-per-bulb');

      expect(delay).toBe('0s');
    });

    it('should calculate delay for many bulbs', () => {
      const manyLights: LightsComponent = {
        color: '#ffd700',
        positions: Array.from({ length: 100 }, (_, i) => ({ x: i * 10, y: i * 10 })),
      };

      const { container } = render(
        <AnimatedLightsRenderer lights={manyLights} scale={1} animationType="comet-trail" />
      );

      const rendererContainer = container.querySelector('.animated-lights-renderer') as HTMLElement;
      const delay = rendererContainer.style.getPropertyValue('--delay-per-bulb');

      // Duration is 3s (comet-trail), 100 bulbs = 0.03s per bulb
      expect(delay).toBe('0.03s');
    });
  });

  describe('animation types', () => {
    it('should apply "none" animation type', () => {
      const { container } = render(
        <AnimatedLightsRenderer lights={mockLights} scale={1} animationType="none" />
      );

      const bulbs = container.querySelectorAll('.light-bulb__wrapper');
      expect(bulbs[0].className).not.toContain('light-bulb__wrapper--none');
    });

    it('should apply "alternating-carnival" animation type', () => {
      const { container } = render(
        <AnimatedLightsRenderer
          lights={mockLights}
          scale={1}
          animationType="alternating-carnival"
        />
      );

      const bulbs = container.querySelectorAll('.light-bulb__wrapper');
      expect(bulbs[0].classList.contains('light-bulb__wrapper--alternating-carnival')).toBe(true);
    });

    it('should apply "sequential-chase" animation type', () => {
      const { container } = render(
        <AnimatedLightsRenderer lights={mockLights} scale={1} animationType="sequential-chase" />
      );

      const bulbs = container.querySelectorAll('.light-bulb__wrapper');
      expect(bulbs[0].classList.contains('light-bulb__wrapper--sequential-chase')).toBe(true);
    });

    it('should default to "none" when not specified', () => {
      const { container } = render(<AnimatedLightsRenderer lights={mockLights} scale={1} />);

      const rendererContainer = container.querySelector('.animated-lights-renderer') as HTMLElement;
      const delay = rendererContainer.style.getPropertyValue('--delay-per-bulb');
      expect(delay).toBe('0s');
    });
  });

  describe('carnival waltz groups', () => {
    it('should add group classes for carnival-waltz', () => {
      const { container } = render(
        <AnimatedLightsRenderer lights={mockLights} scale={1} animationType="carnival-waltz" />
      );

      const wrappers = container.querySelectorAll('[class*="light-bulb__wrapper--beat-"]');
      // Each bulb should have a beat class
      expect(wrappers.length).toBe(3);
    });

    it('should set group index for carnival-waltz', () => {
      const sixLights: LightsComponent = {
        color: '#ffd700',
        positions: Array.from({ length: 6 }, (_, i) => ({ x: i * 10, y: i * 10 })),
      };

      const { container } = render(
        <AnimatedLightsRenderer lights={sixLights} scale={1} animationType="carnival-waltz" />
      );

      const beat1 = container.querySelectorAll('.light-bulb__wrapper--beat-1');
      const beat2 = container.querySelectorAll('.light-bulb__wrapper--beat-2');
      const beat3 = container.querySelectorAll('.light-bulb__wrapper--beat-3');

      // 6 bulbs / 3 groups = 2 of each
      expect(beat1.length).toBe(2);
      expect(beat2.length).toBe(2);
      expect(beat3.length).toBe(2);
    });

    it('should not add group classes for other animations', () => {
      const { container } = render(
        <AnimatedLightsRenderer lights={mockLights} scale={1} animationType="sequential-chase" />
      );

      const wrappers = container.querySelectorAll('[class*="light-bulb__wrapper--beat-"]');
      expect(wrappers.length).toBe(0);
    });
  });

  describe('dual convergence halves', () => {
    it('should add half classes for dual-convergence', () => {
      const { container } = render(
        <AnimatedLightsRenderer lights={mockLights} scale={1} animationType="dual-convergence" />
      );

      const firstHalf = container.querySelectorAll('.light-bulb__wrapper--first-half');
      const secondHalf = container.querySelectorAll('.light-bulb__wrapper--second-half');

      // 3 bulbs: ceil(3/2) = 2 in first half, 1 in second half
      expect(firstHalf.length).toBe(2);
      expect(secondHalf.length).toBe(1);
    });

    it('should split even number of bulbs evenly', () => {
      const fourLights: LightsComponent = {
        color: '#ffd700',
        positions: Array.from({ length: 4 }, (_, i) => ({ x: i * 10, y: i * 10 })),
      };

      const { container } = render(
        <AnimatedLightsRenderer lights={fourLights} scale={1} animationType="dual-convergence" />
      );

      const firstHalf = container.querySelectorAll('.light-bulb__wrapper--first-half');
      const secondHalf = container.querySelectorAll('.light-bulb__wrapper--second-half');

      expect(firstHalf.length).toBe(2);
      expect(secondHalf.length).toBe(2);
    });

    it('should not add half classes for other animations', () => {
      const { container } = render(
        <AnimatedLightsRenderer lights={mockLights} scale={1} animationType="sequential-chase" />
      );

      const halves = container.querySelectorAll('[class*="light-bulb__wrapper--"][class*="-half"]');
      expect(halves.length).toBe(0);
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const { container } = render(<AnimatedLightsRenderer lights={mockLights} scale={1} />);

      const rendererContainer = container.querySelector('.animated-lights-renderer');
      expect(rendererContainer?.getAttribute('role')).toBe('img');
      expect(rendererContainer?.getAttribute('aria-label')).toBe('Animated wheel lights');
    });

    it('should have pointer-events none', () => {
      const { container } = render(<AnimatedLightsRenderer lights={mockLights} scale={1} />);

      const rendererContainer = container.querySelector('.animated-lights-renderer') as HTMLElement;
      expect(rendererContainer.style.pointerEvents).toBe('none');
    });
  });

  describe('container styling', () => {
    it('should have correct positioning styles', () => {
      const { container } = render(<AnimatedLightsRenderer lights={mockLights} scale={1} />);

      const rendererContainer = container.querySelector('.animated-lights-renderer') as HTMLElement;
      expect(rendererContainer.style.position).toBe('absolute');
      expect(rendererContainer.style.top).toBe('0px');
      expect(rendererContainer.style.left).toBe('0px');
      expect(rendererContainer.style.width).toBe('100%');
      expect(rendererContainer.style.height).toBe('100%');
    });

    it('should have correct z-index', () => {
      const { container } = render(<AnimatedLightsRenderer lights={mockLights} scale={1} />);

      const rendererContainer = container.querySelector('.animated-lights-renderer') as HTMLElement;
      expect(rendererContainer.style.zIndex).toBe('17');
    });
  });

  describe('color calculation', () => {
    it('should recalculate colors when theme color changes', () => {
      const { container, rerender } = render(
        <AnimatedLightsRenderer lights={mockLights} scale={1} />
      );

      const firstColor = (
        container.querySelector('.animated-lights-renderer') as HTMLElement
      ).style.getPropertyValue('--bulb-on');

      // Change color
      const newLights = { ...mockLights, color: '#ff0000' };
      rerender(<AnimatedLightsRenderer lights={newLights} scale={1} />);

      const secondColor = (
        container.querySelector('.animated-lights-renderer') as HTMLElement
      ).style.getPropertyValue('--bulb-on');

      expect(firstColor).not.toBe(secondColor);
    });
  });

  describe('edge cases', () => {
    it('should handle single light', () => {
      const singleLight: LightsComponent = {
        color: '#ffd700',
        positions: [{ x: 100, y: 100 }],
      };

      const { container } = render(<AnimatedLightsRenderer lights={singleLight} scale={1} />);

      const bulbs = container.querySelectorAll('.light-bulb__wrapper');
      expect(bulbs.length).toBe(1);
    });

    it('should handle very large number of lights', () => {
      const manyLights: LightsComponent = {
        color: '#ffd700',
        positions: Array.from({ length: 1000 }, (_, i) => ({ x: i, y: i })),
      };

      const { container } = render(<AnimatedLightsRenderer lights={manyLights} scale={1} />);

      const bulbs = container.querySelectorAll('.light-bulb__wrapper');
      expect(bulbs.length).toBe(1000);
    });
  });
});
