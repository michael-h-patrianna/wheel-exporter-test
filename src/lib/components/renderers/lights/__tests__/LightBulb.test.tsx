/**
 * Component tests for LightBulb component
 *
 * Tests the visual layer rendering and animation application:
 * - Renders with correct positioning
 * - Applies animation classes correctly
 * - Sets CSS custom properties
 * - Renders all layers (glow-outer, glow-inner, bulb, filament, glass-shine)
 * - Handles even/odd classes
 * - Different animation types
 *
 * @module LightBulb.test
 */

import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { LightBulb } from '@components/renderers/lights/LightBulb';
import type { LightAnimationType } from '@components/renderers/lights/lightAnimations';

describe('LightBulb', () => {
  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={100}
          y={100}
          index={0}
          totalBulbs={10}
          animationType="none"
        />
      );
      expect(container.firstChild).toBeTruthy();
    });

    it('should render all layer elements', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={100}
          y={100}
          index={0}
          totalBulbs={10}
          animationType="none"
        />
      );

      // Check for wrapper
      const wrapper = container.querySelector('.light-bulb__wrapper');
      expect(wrapper).toBeTruthy();

      // Check for glow layers
      const glowOuter = container.querySelector('.light-bulb__glow-outer');
      expect(glowOuter).toBeTruthy();

      const glowInner = container.querySelector('.light-bulb__glow-inner');
      expect(glowInner).toBeTruthy();

      // Check for main bulb
      const bulb = container.querySelector('.light-bulb__bulb');
      expect(bulb).toBeTruthy();

      // Check for filament
      const filament = container.querySelector('.light-bulb__filament');
      expect(filament).toBeTruthy();

      // Check for glass shine
      const glassShine = container.querySelector('.light-bulb__glass-shine');
      expect(glassShine).toBeTruthy();
    });
  });

  describe('positioning', () => {
    it('should apply correct positioning with default size', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={100}
          y={200}
          index={0}
          totalBulbs={10}
          animationType="none"
        />
      );

      const wrapper = container.querySelector('.light-bulb__wrapper') as HTMLElement;
      expect(wrapper.style.left).toBe('100px');
      expect(wrapper.style.top).toBe('200px');
      // x,y are already calculated with center offset in AnimatedLightsRenderer
      // so no transform is needed
    });

    it('should apply correct positioning with custom size', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={150}
          y={250}
          index={0}
          totalBulbs={10}
          animationType="none"
          size={24}
        />
      );

      const wrapper = container.querySelector('.light-bulb__wrapper') as HTMLElement;
      expect(wrapper.style.left).toBe('150px');
      expect(wrapper.style.top).toBe('250px');
      // x,y are already calculated with center offset in AnimatedLightsRenderer
      // so no transform is needed
    });

    it('should handle negative coordinates', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={-50}
          y={-100}
          index={0}
          totalBulbs={10}
          animationType="none"
        />
      );

      const wrapper = container.querySelector('.light-bulb__wrapper') as HTMLElement;
      expect(wrapper.style.left).toBe('-50px');
      expect(wrapper.style.top).toBe('-100px');
    });

    it('should handle zero coordinates', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={0}
          y={0}
          index={0}
          totalBulbs={10}
          animationType="none"
        />
      );

      const wrapper = container.querySelector('.light-bulb__wrapper') as HTMLElement;
      expect(wrapper.style.left).toBe('0px');
      expect(wrapper.style.top).toBe('0px');
    });
  });

  describe('CSS custom properties', () => {
    it('should set all CSS custom properties', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={100}
          y={100}
          index={5}
          totalBulbs={20}
          animationType="none"
          size={16}
        />
      );

      const wrapper = container.querySelector('.light-bulb__wrapper') as HTMLElement;
      const style = wrapper.style;

      expect(style.getPropertyValue('--bulb-index')).toBe('5');
      expect(style.getPropertyValue('--total-bulbs')).toBe('20');
      expect(style.getPropertyValue('--bulb-size')).toBe('16px');
      expect(style.getPropertyValue('--bulb-radius')).toBe('8px');
    });

    it('should set correct radius for default size', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={100}
          y={100}
          index={0}
          totalBulbs={10}
          animationType="none"
        />
      );

      const wrapper = container.querySelector('.light-bulb__wrapper') as HTMLElement;
      expect(wrapper.style.getPropertyValue('--bulb-size')).toBe('8px');
      expect(wrapper.style.getPropertyValue('--bulb-radius')).toBe('4px');
    });

    it('should set correct radius for custom size', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={100}
          y={100}
          index={0}
          totalBulbs={10}
          animationType="none"
          size={30}
        />
      );

      const wrapper = container.querySelector('.light-bulb__wrapper') as HTMLElement;
      expect(wrapper.style.getPropertyValue('--bulb-size')).toBe('30px');
      expect(wrapper.style.getPropertyValue('--bulb-radius')).toBe('15px');
    });
  });

  describe('data attributes', () => {
    it('should set data-bulb-index attribute', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={100}
          y={100}
          index={7}
          totalBulbs={10}
          animationType="none"
        />
      );

      const wrapper = container.querySelector('.light-bulb__wrapper') as HTMLElement;
      expect(wrapper.getAttribute('data-bulb-index')).toBe('7');
    });
  });

  describe('even/odd classes', () => {
    it('should apply even class for even index', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={100}
          y={100}
          index={0}
          totalBulbs={10}
          animationType="none"
        />
      );

      const wrapper = container.querySelector('.light-bulb__wrapper');
      expect(wrapper?.classList.contains('light-bulb__wrapper--even')).toBe(true);
      expect(wrapper?.classList.contains('light-bulb__wrapper--odd')).toBe(false);
    });

    it('should apply odd class for odd index', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={100}
          y={100}
          index={1}
          totalBulbs={10}
          animationType="none"
        />
      );

      const wrapper = container.querySelector('.light-bulb__wrapper');
      expect(wrapper?.classList.contains('light-bulb__wrapper--even')).toBe(false);
      expect(wrapper?.classList.contains('light-bulb__wrapper--odd')).toBe(true);
    });

    it('should handle large even index', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={100}
          y={100}
          index={100}
          totalBulbs={200}
          animationType="none"
        />
      );

      const wrapper = container.querySelector('.light-bulb__wrapper');
      expect(wrapper?.classList.contains('light-bulb__wrapper--even')).toBe(true);
    });

    it('should handle large odd index', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={100}
          y={100}
          index={99}
          totalBulbs={200}
          animationType="none"
        />
      );

      const wrapper = container.querySelector('.light-bulb__wrapper');
      expect(wrapper?.classList.contains('light-bulb__wrapper--odd')).toBe(true);
    });
  });

  describe('animation classes', () => {
    it('should not apply animation classes for "none" type', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={100}
          y={100}
          index={0}
          totalBulbs={10}
          animationType="none"
        />
      );

      const wrapper = container.querySelector('.light-bulb__wrapper');
      expect(wrapper?.className).not.toContain('light-bulb__wrapper--none');

      const glowOuter = container.querySelector('.light-bulb__glow-outer');
      expect(glowOuter?.className).not.toContain('light-bulb__glow-outer--none');
    });

    const animationTypes: LightAnimationType[] = [
      'alternating-carnival',
      'sequential-chase',
      'accelerating-spin',
      'reverse-chase-pulse',
      'random-sparkle',
      'carnival-waltz',
      'comet-trail',
      'dual-convergence',
    ];

    animationTypes.forEach((animationType) => {
      it(`should apply animation classes for "${animationType}" type`, () => {
        const { container } = render(
          <LightBulb
            groupIndex={0}
            isFirstHalf={true}
            x={100}
            y={100}
            index={0}
            totalBulbs={10}
            animationType={animationType}
          />
        );

        // Check wrapper class
        const wrapper = container.querySelector('.light-bulb__wrapper');
        expect(wrapper?.classList.contains(`light-bulb__wrapper--${animationType}`)).toBe(true);

        // Check glow-outer class
        const glowOuter = container.querySelector('.light-bulb__glow-outer');
        expect(glowOuter?.classList.contains(`light-bulb__glow-outer--${animationType}`)).toBe(
          true
        );

        // Check glow-inner class
        const glowInner = container.querySelector('.light-bulb__glow-inner');
        expect(glowInner?.classList.contains(`light-bulb__glow-inner--${animationType}`)).toBe(
          true
        );

        // Check bulb class
        const bulb = container.querySelector('.light-bulb__bulb');
        expect(bulb?.classList.contains(`light-bulb__bulb--${animationType}`)).toBe(true);

        // Check filament class
        const filament = container.querySelector('.light-bulb__filament');
        expect(filament?.classList.contains(`light-bulb__filament--${animationType}`)).toBe(true);
      });
    });

    it('should maintain even/odd classes with animation', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={100}
          y={100}
          index={1}
          totalBulbs={10}
          animationType="alternating-carnival"
        />
      );

      const wrapper = container.querySelector('.light-bulb__wrapper');
      expect(wrapper?.classList.contains('light-bulb__wrapper--odd')).toBe(true);
      expect(wrapper?.classList.contains('light-bulb__wrapper--alternating-carnival')).toBe(true);
    });
  });

  describe('layer structure', () => {
    it('should have correct DOM hierarchy', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={100}
          y={100}
          index={0}
          totalBulbs={10}
          animationType="none"
        />
      );

      const wrapper = container.querySelector('.light-bulb__wrapper');
      expect(wrapper).toBeTruthy();

      // Check children order
      const children = wrapper?.children;
      expect(children?.length).toBe(3); // glow-outer, glow-inner, bulb

      expect(children?.[0].classList.contains('light-bulb__glow-outer')).toBe(true);
      expect(children?.[1].classList.contains('light-bulb__glow-inner')).toBe(true);
      expect(children?.[2].classList.contains('light-bulb__bulb')).toBe(true);

      // Check bulb children
      const bulb = container.querySelector('.light-bulb__bulb');
      const bulbChildren = bulb?.children;
      expect(bulbChildren?.length).toBe(2); // filament, glass-shine

      expect(bulbChildren?.[0].classList.contains('light-bulb__filament')).toBe(true);
      expect(bulbChildren?.[1].classList.contains('light-bulb__glass-shine')).toBe(true);
    });

    it('should have glass-shine as static overlay', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={100}
          y={100}
          index={0}
          totalBulbs={10}
          animationType="alternating-carnival"
        />
      );

      // Glass shine should not have animation-specific class
      const glassShine = container.querySelector('.light-bulb__glass-shine');
      expect(glassShine?.className).toBe('light-bulb__glass-shine');
    });
  });

  describe('edge cases', () => {
    it('should handle index 0', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={100}
          y={100}
          index={0}
          totalBulbs={10}
          animationType="none"
        />
      );

      const wrapper = container.querySelector('.light-bulb__wrapper') as HTMLElement;
      expect(wrapper.getAttribute('data-bulb-index')).toBe('0');
    });

    it('should handle single bulb (totalBulbs = 1)', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={100}
          y={100}
          index={0}
          totalBulbs={1}
          animationType="none"
        />
      );

      const wrapper = container.querySelector('.light-bulb__wrapper') as HTMLElement;
      expect(wrapper.style.getPropertyValue('--total-bulbs')).toBe('1');
    });

    it('should handle large number of bulbs', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={100}
          y={100}
          index={99}
          totalBulbs={1000}
          animationType="none"
        />
      );

      const wrapper = container.querySelector('.light-bulb__wrapper') as HTMLElement;
      expect(wrapper.style.getPropertyValue('--total-bulbs')).toBe('1000');
      expect(wrapper.getAttribute('data-bulb-index')).toBe('99');
    });

    it('should handle very small size', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={100}
          y={100}
          index={0}
          totalBulbs={10}
          animationType="none"
          size={2}
        />
      );

      const wrapper = container.querySelector('.light-bulb__wrapper') as HTMLElement;
      expect(wrapper.style.getPropertyValue('--bulb-size')).toBe('2px');
      expect(wrapper.style.getPropertyValue('--bulb-radius')).toBe('1px');
    });

    it('should handle very large size', () => {
      const { container } = render(
        <LightBulb
          groupIndex={0}
          isFirstHalf={true}
          x={100}
          y={100}
          index={0}
          totalBulbs={10}
          animationType="none"
          size={100}
        />
      );

      const wrapper = container.querySelector('.light-bulb__wrapper') as HTMLElement;
      expect(wrapper.style.getPropertyValue('--bulb-size')).toBe('100px');
      expect(wrapper.style.getPropertyValue('--bulb-radius')).toBe('50px');
    });
  });
});
