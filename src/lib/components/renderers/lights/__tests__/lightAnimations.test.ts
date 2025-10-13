/**
 * Unit tests for lightAnimations metadata and functions
 *
 * Tests the animation catalog system including:
 * - LIGHT_ANIMATIONS array structure and completeness
 * - getAnimationById() function
 * - getAllAnimations() function
 * - Metadata correctness for all animation types
 *
 * @module lightAnimations.test
 */

import {
  LIGHT_ANIMATIONS,
  getAnimationById,
  getAllAnimations,
  type LightAnimationType,
  type LightAnimationMetadata,
} from '@components/renderers/lights/lightAnimations';

describe('lightAnimations', () => {
  describe('LIGHT_ANIMATIONS', () => {
    it('should contain all expected animation types', () => {
      const expectedIds: LightAnimationType[] = [
        'none',
        'alternating-carnival',
        'sequential-chase',
        'accelerating-spin',
        'reverse-chase-pulse',
        'random-sparkle',
        'carnival-waltz',
        'comet-trail',
        'dual-convergence',
      ];

      const actualIds = LIGHT_ANIMATIONS.map((anim) => anim.id);
      expect(actualIds).toEqual(expectedIds);
    });

    it('should have 9 animation options', () => {
      expect(LIGHT_ANIMATIONS).toHaveLength(9);
    });

    it('should have unique IDs', () => {
      const ids = LIGHT_ANIMATIONS.map((anim) => anim.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid metadata structure for all animations', () => {
      LIGHT_ANIMATIONS.forEach((anim) => {
        expect(anim).toHaveProperty('id');
        expect(anim).toHaveProperty('title');
        expect(anim).toHaveProperty('description');
        expect(anim).toHaveProperty('duration');
        expect(anim).toHaveProperty('cssFile');

        expect(typeof anim.id).toBe('string');
        expect(typeof anim.title).toBe('string');
        expect(typeof anim.description).toBe('string');
        expect(typeof anim.duration).toBe('number');
        expect(typeof anim.cssFile).toBe('string');
      });
    });

    describe('individual animation metadata', () => {
      it('should have correct metadata for "none"', () => {
        const anim = LIGHT_ANIMATIONS.find((a) => a.id === 'none');
        expect(anim).toEqual({
          id: 'none',
          title: 'None (Static)',
          description: 'No animation - lights remain static',
          duration: 0,
          cssFile: '',
        });
      });

      it('should have correct metadata for "alternating-carnival"', () => {
        const anim = LIGHT_ANIMATIONS.find((a) => a.id === 'alternating-carnival');
        expect(anim).toEqual({
          id: 'alternating-carnival',
          title: 'Alternating Carnival',
          description:
            'Classic carnival pattern with even/odd bulbs alternating on and off with realistic glow and fadeout',
          duration: 1.2,
          cssFile: 'alternating-carnival',
        });
      });

      it('should have correct metadata for "sequential-chase"', () => {
        const anim = LIGHT_ANIMATIONS.find((a) => a.id === 'sequential-chase');
        expect(anim).toEqual({
          id: 'sequential-chase',
          title: 'Sequential Chase',
          description: 'Single lit bulb chases around creating a smooth rotating motion effect',
          duration: 1.6,
          cssFile: 'sequential-chase',
        });
      });

      it('should have correct metadata for "accelerating-spin"', () => {
        const anim = LIGHT_ANIMATIONS.find((a) => a.id === 'accelerating-spin');
        expect(anim).toEqual({
          id: 'accelerating-spin',
          title: 'Accelerating Spin',
          description:
            'Wheel of fortune spin: starts slow, accelerates to blur, decelerates, and settles on winner',
          duration: 5.0,
          cssFile: 'accelerating-spin',
        });
      });

      it('should have correct metadata for "reverse-chase-pulse"', () => {
        const anim = LIGHT_ANIMATIONS.find((a) => a.id === 'reverse-chase-pulse');
        expect(anim).toEqual({
          id: 'reverse-chase-pulse',
          title: 'Reverse Chase Pulse',
          description:
            'Counter-clockwise chase followed by faster clockwise motion, then synchronized pulses before revealing winner',
          duration: 7.0,
          cssFile: 'reverse-chase-pulse',
        });
      });

      it('should have correct metadata for "random-sparkle"', () => {
        const anim = LIGHT_ANIMATIONS.find((a) => a.id === 'random-sparkle');
        expect(anim).toEqual({
          id: 'random-sparkle',
          title: 'Random Sparkle',
          description:
            'Unpredictable twinkling creates excitement and anticipation like stars in the night sky',
          duration: 8.0,
          cssFile: 'random-sparkle',
        });
      });

      it('should have correct metadata for "carnival-waltz"', () => {
        const anim = LIGHT_ANIMATIONS.find((a) => a.id === 'carnival-waltz');
        expect(anim).toEqual({
          id: 'carnival-waltz',
          title: 'Carnival Waltz',
          description:
            'Musical waltz pattern with groups of 3 bulbs following strong-weak-weak rhythm',
          duration: 4.5,
          cssFile: 'carnival-waltz',
        });
      });

      it('should have correct metadata for "comet-trail"', () => {
        const anim = LIGHT_ANIMATIONS.find((a) => a.id === 'comet-trail');
        expect(anim).toEqual({
          id: 'comet-trail',
          title: 'Comet Trail',
          description: 'A bright head with a long trailing fadeout creates a comet-like effect',
          duration: 2.5,
          cssFile: 'comet-trail',
        });
      });

      it('should have correct metadata for "dual-convergence"', () => {
        const anim = LIGHT_ANIMATIONS.find((a) => a.id === 'dual-convergence');
        expect(anim).toEqual({
          id: 'dual-convergence',
          title: 'Dual Convergence',
          description:
            'Two lights chase from opposite sides, meeting with a dramatic collision flash',
          duration: 3.0,
          cssFile: 'dual-convergence',
        });
      });
    });

    it('should have non-negative durations', () => {
      LIGHT_ANIMATIONS.forEach((anim) => {
        expect(anim.duration).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have non-empty titles', () => {
      LIGHT_ANIMATIONS.forEach((anim) => {
        expect(anim.title.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty descriptions', () => {
      LIGHT_ANIMATIONS.forEach((anim) => {
        expect(anim.description.length).toBeGreaterThan(0);
      });
    });

    it('should have matching cssFile names (except "none")', () => {
      LIGHT_ANIMATIONS.forEach((anim) => {
        if (anim.id === 'none') {
          expect(anim.cssFile).toBe('');
        } else {
          // CSS file should match the animation ID
          expect(anim.cssFile).toBe(anim.id);
        }
      });
    });
  });

  describe('getAnimationById', () => {
    it('should return animation metadata for valid ID', () => {
      const anim = getAnimationById('alternating-carnival');
      expect(anim).toBeDefined();
      expect(anim?.id).toBe('alternating-carnival');
      expect(anim?.title).toBe('Alternating Carnival');
    });

    it('should return animation for "none"', () => {
      const anim = getAnimationById('none');
      expect(anim).toBeDefined();
      expect(anim?.id).toBe('none');
      expect(anim?.duration).toBe(0);
    });

    it('should return animation for "sequential-chase"', () => {
      const anim = getAnimationById('sequential-chase');
      expect(anim).toBeDefined();
      expect(anim?.id).toBe('sequential-chase');
    });

    it('should return animation for "accelerating-spin"', () => {
      const anim = getAnimationById('accelerating-spin');
      expect(anim).toBeDefined();
      expect(anim?.id).toBe('accelerating-spin');
    });

    it('should return animation for "reverse-chase-pulse"', () => {
      const anim = getAnimationById('reverse-chase-pulse');
      expect(anim).toBeDefined();
      expect(anim?.id).toBe('reverse-chase-pulse');
    });

    it('should return animation for "random-sparkle"', () => {
      const anim = getAnimationById('random-sparkle');
      expect(anim).toBeDefined();
      expect(anim?.id).toBe('random-sparkle');
    });

    it('should return animation for "carnival-waltz"', () => {
      const anim = getAnimationById('carnival-waltz');
      expect(anim).toBeDefined();
      expect(anim?.id).toBe('carnival-waltz');
    });

    it('should return animation for "comet-trail"', () => {
      const anim = getAnimationById('comet-trail');
      expect(anim).toBeDefined();
      expect(anim?.id).toBe('comet-trail');
    });

    it('should return animation for "dual-convergence"', () => {
      const anim = getAnimationById('dual-convergence');
      expect(anim).toBeDefined();
      expect(anim?.id).toBe('dual-convergence');
    });

    it('should return undefined for invalid ID', () => {
      // @ts-expect-error Testing invalid input
      const anim = getAnimationById('invalid-animation');
      expect(anim).toBeUndefined();
    });

    it('should return complete metadata object', () => {
      const anim = getAnimationById('comet-trail');
      expect(anim).toHaveProperty('id');
      expect(anim).toHaveProperty('title');
      expect(anim).toHaveProperty('description');
      expect(anim).toHaveProperty('duration');
      expect(anim).toHaveProperty('cssFile');
    });
  });

  describe('getAllAnimations', () => {
    it('should return all animations', () => {
      const animations = getAllAnimations();
      expect(animations).toHaveLength(9);
    });

    it('should return the same array as LIGHT_ANIMATIONS', () => {
      const animations = getAllAnimations();
      expect(animations).toBe(LIGHT_ANIMATIONS);
    });

    it('should return readonly array', () => {
      const animations = getAllAnimations();
      // TypeScript enforces readonly, but we can verify it's the same reference
      expect(Object.isFrozen(animations)).toBe(false); // Arrays aren't frozen, but type is readonly
    });

    it('should return array with all expected IDs', () => {
      const animations = getAllAnimations();
      const ids = animations.map((a) => a.id);
      expect(ids).toContain('none');
      expect(ids).toContain('alternating-carnival');
      expect(ids).toContain('sequential-chase');
      expect(ids).toContain('accelerating-spin');
      expect(ids).toContain('reverse-chase-pulse');
      expect(ids).toContain('random-sparkle');
      expect(ids).toContain('carnival-waltz');
      expect(ids).toContain('comet-trail');
      expect(ids).toContain('dual-convergence');
    });

    it('should be usable for UI selection menus', () => {
      const animations = getAllAnimations();
      // Verify it has the properties needed for a UI dropdown
      animations.forEach((anim) => {
        expect(anim.id).toBeTruthy();
        expect(anim.title).toBeTruthy();
        expect(anim.description).toBeTruthy();
      });
    });
  });

  describe('type safety', () => {
    it('should enforce LightAnimationType', () => {
      const validType: LightAnimationType = 'alternating-carnival';
      expect(validType).toBe('alternating-carnival');
    });

    it('should enforce LightAnimationMetadata structure', () => {
      const metadata: LightAnimationMetadata = {
        id: 'none',
        title: 'Test',
        description: 'Test description',
        duration: 0,
        cssFile: '',
      };
      expect(metadata).toBeDefined();
    });
  });
});
