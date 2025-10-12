/**
 * Comprehensive test suite for test factories.
 * Ensures all factories produce type-safe, valid mock data.
 */

import {
  createMockImageBounds,
  createMockWheelElementBounds,
  createMockSolidFill,
  createMockGradientFill,
  createMockHeader,
  createMockWheelBg,
  createMockWheelTop,
  createMockLights,
  createMockButtonSpin,
  createMockPointer,
  createMockCenter,
  createMockWheelSegmentStyles,
  createMockWheelExport,
  createMockExtractedAssets,
  createMockHeaderWithMissingFailState,
  createMockWheelOverlayWithoutBounds,
  createMockLightsWithoutPositions,
  createMockButtonSpinWithMissingSpinningState,
} from '../factories';

describe('Test Factories', () => {
  describe('Primitive Factories', () => {
    describe('createMockImageBounds', () => {
      it('should create default ImageBounds', () => {
        const bounds = createMockImageBounds();

        expect(bounds).toEqual({
          x: 400,
          y: 300,
          w: 200,
          h: 200,
          rotation: undefined,
        });
      });

      it('should apply overrides', () => {
        const bounds = createMockImageBounds({
          x: 500,
          rotation: 45,
        });

        expect(bounds).toEqual({
          x: 500,
          y: 300,
          w: 200,
          h: 200,
          rotation: 45,
        });
      });

      it('should be type-safe', () => {
        const bounds = createMockImageBounds();
        const x: number = bounds.x;
        const rotation: number | undefined = bounds.rotation;

        expect(typeof x).toBe('number');
        expect(rotation).toBeUndefined();
      });
    });

    describe('createMockWheelElementBounds', () => {
      it('should create default WheelElementBounds', () => {
        const bounds = createMockWheelElementBounds();

        expect(bounds).toEqual({
          x: 400,
          y: 300,
          w: 600,
          h: 600,
        });
      });

      it('should apply overrides', () => {
        const bounds = createMockWheelElementBounds({
          w: 800,
          h: 800,
        });

        expect(bounds).toEqual({
          x: 400,
          y: 300,
          w: 800,
          h: 800,
        });
      });
    });

    describe('createMockSolidFill', () => {
      it('should create default solid fill', () => {
        const fill = createMockSolidFill();

        expect(fill).toEqual({
          type: 'solid',
          color: '#FF0000',
        });
      });

      it('should use custom color', () => {
        const fill = createMockSolidFill('#00FF00');

        expect(fill).toEqual({
          type: 'solid',
          color: '#00FF00',
        });
      });

      it('should be type-safe', () => {
        const fill = createMockSolidFill();
        expect(fill.type).toBe('solid');
        expect(fill.color).toBeDefined();
      });
    });

    describe('createMockGradientFill', () => {
      it('should create default gradient fill', () => {
        const fill = createMockGradientFill();

        expect(fill.type).toBe('gradient');
        expect(fill.gradient).toBeDefined();
        expect(fill.gradient?.type).toBe('linear');
        expect(fill.gradient?.rotation).toBe(90);
        expect(fill.gradient?.stops).toHaveLength(2);
      });

      it('should apply overrides', () => {
        const fill = createMockGradientFill({
          gradient: {
            type: 'linear',
            rotation: 45,
            stops: [
              { color: '#FF0000', position: 0 },
              { color: '#0000FF', position: 1 },
            ],
            transform: [
              [1, 0, 0],
              [0, 1, 0],
            ] as const,
          },
        });

        expect(fill.gradient?.rotation).toBe(45);
        expect(fill.gradient?.type).toBe('linear'); // Other properties remain
      });

      it('should be type-safe', () => {
        const fill = createMockGradientFill();
        expect(fill.type).toBe('gradient');
        expect(fill.gradient).toBeDefined();
      });
    });
  });

  describe('Component Factories', () => {
    describe('createMockHeader', () => {
      it('should create default header', () => {
        const header = createMockHeader();

        expect(header.stateBounds.active).toBeDefined();
        expect(header.stateBounds.success).toBeDefined();
        expect(header.stateBounds.fail).toBeDefined();
        expect(header.activeImg).toBe('header-active.png');
        expect(header.successImg).toBe('header-success.png');
        expect(header.failImg).toBe('header-fail.png');
      });

      it('should apply overrides to specific state', () => {
        const defaultBounds = createMockImageBounds();
        const header = createMockHeader({
          activeImg: 'custom-active.png',
          stateBounds: {
            active: { ...defaultBounds, x: 500, y: 150, w: 300, h: 100 },
            success: defaultBounds,
            fail: defaultBounds,
          },
        });

        expect(header.activeImg).toBe('custom-active.png');
        expect(header.stateBounds.active.x).toBe(500);
        expect(header.stateBounds.success.x).toBe(400); // Default unchanged
      });

      it('should be type-safe', () => {
        const header = createMockHeader();
        const activeImg: string = header.activeImg;
        const bounds = header.stateBounds.active;

        expect(typeof activeImg).toBe('string');
        expect(bounds.x).toBeDefined();
      });
    });

    describe('createMockWheelBg', () => {
      it('should create default wheel background', () => {
        const wheelBg = createMockWheelBg();

        expect(wheelBg.bounds).toEqual({
          x: 400,
          y: 300,
          w: 600,
          h: 600,
        });
        expect(wheelBg.img).toBe('wheelbg.png');
      });

      it('should apply overrides', () => {
        const wheelBg = createMockWheelBg({
          img: 'custom-bg.png',
          bounds: { w: 700, h: 700 },
        });

        expect(wheelBg.img).toBe('custom-bg.png');
        expect(wheelBg.bounds.w).toBe(700);
      });
    });

    describe('createMockWheelTop', () => {
      it('should create default wheel top', () => {
        const wheelTop = createMockWheelTop();

        expect(wheelTop.bounds).toEqual({
          x: 400,
          y: 300,
          w: 200,
          h: 200,
        });
        expect(wheelTop.img).toBe('wheeltop.png');
      });

      it('should apply overrides', () => {
        const wheelTop = createMockWheelTop({
          img: 'custom-top.png',
        });

        expect(wheelTop.img).toBe('custom-top.png');
      });
    });

    describe('createMockLights', () => {
      it('should create default lights with 3 positions', () => {
        const lights = createMockLights();

        expect(lights.color).toBe('#FFFF00');
        expect(lights.positions).toHaveLength(3);
        expect(lights.positions[0]).toEqual({ x: 100, y: 50 });
      });

      it('should apply overrides', () => {
        const lights = createMockLights({
          color: '#00FF00',
          positions: [{ x: 50, y: 50 }],
        });

        expect(lights.color).toBe('#00FF00');
        expect(lights.positions).toHaveLength(1);
      });

      it('should be type-safe', () => {
        const lights = createMockLights();
        const color: string = lights.color;
        const positions = lights.positions;

        expect(typeof color).toBe('string');
        expect(Array.isArray(positions)).toBe(true);
      });
    });

    describe('createMockButtonSpin', () => {
      it('should create default button spin', () => {
        const button = createMockButtonSpin();

        expect(button.stateBounds.default).toBeDefined();
        expect(button.stateBounds.spinning).toBeDefined();
        expect(button.defaultImg).toBe('button-default.png');
        expect(button.spinningImg).toBe('button-spinning.png');
      });

      it('should apply overrides', () => {
        const button = createMockButtonSpin({
          defaultImg: 'custom-btn.png',
          stateBounds: {
            default: { x: 450, y: 500, w: 120, h: 120 },
          },
        });

        expect(button.defaultImg).toBe('custom-btn.png');
        expect(button.stateBounds.default.w).toBe(120);
      });

      it('should be type-safe', () => {
        const button = createMockButtonSpin();
        const defaultImg: string = button.defaultImg;

        expect(typeof defaultImg).toBe('string');
      });
    });

    describe('createMockPointer', () => {
      it('should create default pointer', () => {
        const pointer = createMockPointer();

        expect(pointer.bounds).toEqual({
          x: 400,
          y: 50,
          w: 60,
          h: 80,
          rotation: 0,
        });
        expect(pointer.img).toBe('pointer.png');
      });

      it('should apply overrides', () => {
        const pointer = createMockPointer({
          img: 'custom-pointer.png',
          bounds: { rotation: 45 },
        });

        expect(pointer.img).toBe('custom-pointer.png');
        expect(pointer.bounds.rotation).toBe(45);
      });
    });

    describe('createMockCenter', () => {
      it('should create default center', () => {
        const center = createMockCenter();

        expect(center).toEqual({
          x: 400,
          y: 300,
          radius: 250,
        });
      });

      it('should apply overrides', () => {
        const center = createMockCenter({
          radius: 300,
        });

        expect(center.radius).toBe(300);
        expect(center.x).toBe(400); // Default unchanged
      });

      it('should be type-safe', () => {
        const center = createMockCenter();
        const radius: number = center.radius;

        expect(typeof radius).toBe('number');
      });
    });

    describe('createMockWheelSegmentStyles', () => {
      it('should create styles for all segment types', () => {
        const styles = createMockWheelSegmentStyles();

        expect(styles.odd).toBeDefined();
        expect(styles.even).toBeDefined();
        expect(styles.nowin).toBeDefined();
        expect(styles.jackpot).toBeDefined();
      });

      it('should have outer and text styles', () => {
        const styles = createMockWheelSegmentStyles();

        expect(styles.odd?.outer).toBeDefined();
        expect(styles.odd?.text).toBeDefined();
      });

      it('should apply overrides', () => {
        const styles = createMockWheelSegmentStyles({
          jackpot: {
            outer: { fill: { type: 'solid', color: '#GOLD' } },
          },
        });

        expect(styles.jackpot?.outer.fill?.color).toBe('#GOLD');
      });
    });
  });

  describe('Complex Data Factories', () => {
    describe('createMockWheelExport', () => {
      it('should create complete wheel export', () => {
        const wheelExport = createMockWheelExport();

        expect(wheelExport.wheelId).toBe('test-wheel-id');
        expect(wheelExport.frameSize).toBeDefined();
        expect(wheelExport.background).toBeDefined();
        expect(wheelExport.header).toBeDefined();
        expect(wheelExport.wheelBg).toBeDefined();
        expect(wheelExport.center).toBeDefined();
        expect(wheelExport.metadata).toBeDefined();
      });

      it('should include all optional components by default', () => {
        const wheelExport = createMockWheelExport();

        expect(wheelExport.header).toBeDefined();
        expect(wheelExport.wheelBg).toBeDefined();
        expect(wheelExport.wheelTop1).toBeDefined();
        expect(wheelExport.wheelTop2).toBeDefined();
        expect(wheelExport.buttonSpin).toBeDefined();
        expect(wheelExport.pointer).toBeDefined();
        expect(wheelExport.lights).toBeDefined();
        expect(wheelExport.segments).toBeDefined();
      });

      it('should apply deep overrides', () => {
        const customHeader = createMockHeader({ activeImg: 'custom-header.png' });
        const wheelExport = createMockWheelExport({
          wheelId: 'custom-id',
          header: { ...customHeader },
        });

        expect(wheelExport.wheelId).toBe('custom-id');
        expect(wheelExport.header?.activeImg).toBe('custom-header.png');
      });

      it('should be type-safe', () => {
        const wheelExport = createMockWheelExport();
        const wheelId: string = wheelExport.wheelId;
        const width: number = wheelExport.frameSize.width;

        expect(typeof wheelId).toBe('string');
        expect(typeof width).toBe('number');
      });
    });

    describe('createMockExtractedAssets', () => {
      it('should create complete extracted assets', () => {
        const assets = createMockExtractedAssets();

        expect(assets.wheelData).toBeDefined();
        expect(assets.backgroundImage).toBeDefined();
        expect(assets.headerImages).toBeDefined();
        expect(assets.wheelBgImage).toBeDefined();
        expect(assets.buttonSpinImages).toBeDefined();
      });

      it('should include all image URLs', () => {
        const assets = createMockExtractedAssets();

        expect(assets.headerImages?.active).toBe('https://example.com/header-active.png');
        expect(assets.headerImages?.success).toBe('https://example.com/header-success.png');
        expect(assets.headerImages?.fail).toBe('https://example.com/header-fail.png');
        expect(assets.buttonSpinImages?.default).toBe('https://example.com/button-default.png');
        expect(assets.buttonSpinImages?.spinning).toBe('https://example.com/button-spinning.png');
      });

      it('should apply overrides', () => {
        const assets = createMockExtractedAssets({
          backgroundImage: 'https://custom.com/bg.png',
          headerImages: {
            active: 'https://custom.com/header.png',
          },
        });

        expect(assets.backgroundImage).toBe('https://custom.com/bg.png');
        expect(assets.headerImages?.active).toBe('https://custom.com/header.png');
        expect(assets.headerImages?.success).toBe('https://example.com/header-success.png'); // Default
      });

      it('should be type-safe', () => {
        const assets = createMockExtractedAssets();
        const wheelData = assets.wheelData;
        const bgImage: string | undefined = assets.backgroundImage;

        expect(wheelData).toBeDefined();
        expect(typeof bgImage).toBe('string');
      });
    });
  });

  describe('Partial Component Factories (Edge Cases)', () => {
    describe('createMockHeaderWithMissingFailState', () => {
      it('should create header without fail state bounds', () => {
        const header = createMockHeaderWithMissingFailState();

        expect(header.stateBounds).toBeDefined();
        expect(header.stateBounds?.active).toBeDefined();
        expect(header.stateBounds?.success).toBeDefined();
        // fail should be missing
      });

      it('should be partial type', () => {
        const header = createMockHeaderWithMissingFailState();
        // This should compile without errors
        expect(header).toBeDefined();
      });
    });

    describe('createMockWheelOverlayWithoutBounds', () => {
      it('should create overlay without bounds', () => {
        const overlay = createMockWheelOverlayWithoutBounds();

        expect(overlay.img).toBe('wheelbg.png');
        expect(overlay.bounds).toBeUndefined();
      });
    });

    describe('createMockLightsWithoutPositions', () => {
      it('should create lights without positions', () => {
        const lights = createMockLightsWithoutPositions();

        expect(lights.color).toBe('#FFFF00');
        expect(lights.positions).toBeUndefined();
      });
    });

    describe('createMockButtonSpinWithMissingSpinningState', () => {
      it('should create button without spinning state bounds', () => {
        const button = createMockButtonSpinWithMissingSpinningState();

        expect(button.stateBounds).toBeDefined();
        expect(button.stateBounds?.default).toBeDefined();
        // spinning should be missing
      });
    });
  });

  describe('Factory Integration', () => {
    it('should allow composing factories together', () => {
      const header = createMockHeader();
      const wheelBg = createMockWheelBg();
      const lights = createMockLights();

      const wheelExport = createMockWheelExport({
        header: {
          activeImg: header.activeImg,
          successImg: header.successImg,
          failImg: header.failImg,
          stateBounds: header.stateBounds,
        },
        wheelBg: {
          img: wheelBg.img,
          bounds: wheelBg.bounds,
        },
        lights: {
          color: lights.color,
          positions: lights.positions,
        },
      });

      expect(wheelExport.header?.activeImg).toBe(header.activeImg);
      expect(wheelExport.wheelBg?.img).toBe(wheelBg.img);
      expect(wheelExport.lights?.color).toBe(lights.color);
    });

    it('should maintain type safety across factory composition', () => {
      const assets = createMockExtractedAssets({
        wheelData: createMockWheelExport({
          wheelId: 'composed-wheel',
        }),
      });

      expect(assets.wheelData.wheelId).toBe('composed-wheel');
    });

    it('should allow creating complete test scenarios', () => {
      // Scenario: Create a complete wheel with custom settings
      const customHeader = createMockHeader({
        activeImg: 'scenario-header.png',
      });
      const customLights = createMockLights({
        color: '#GOLD',
        positions: Array.from({ length: 10 }, (_, i) => ({
          x: i * 30,
          y: i * 30,
        })),
      });

      const customWheel = createMockWheelExport({
        wheelId: 'test-scenario-1',
        header: {
          ...customHeader,
        },
        lights: {
          ...customLights,
        },
      });

      expect(customWheel.wheelId).toBe('test-scenario-1');
      expect(customWheel.header?.activeImg).toBe('scenario-header.png');
      expect(customWheel.lights?.color).toBe('#GOLD');
      expect(customWheel.lights?.positions).toHaveLength(10);
    });
  });

  describe('Type Safety Verification', () => {
    it('should not require any type assertions', () => {
      // All of these should compile without 'as any' or type assertions
      const header = createMockHeader();
      const wheelBg = createMockWheelBg();
      const lights = createMockLights();
      const button = createMockButtonSpin();
      const pointer = createMockPointer();
      const center = createMockCenter();
      const wheelExport = createMockWheelExport();
      const assets = createMockExtractedAssets();

      // Type checks
      expect(header.activeImg).toBeDefined();
      expect(wheelBg.img).toBeDefined();
      expect(lights.color).toBeDefined();
      expect(button.defaultImg).toBeDefined();
      expect(pointer.img).toBeDefined();
      expect(center.radius).toBeDefined();
      expect(wheelExport.wheelId).toBeDefined();
      expect(assets.wheelData).toBeDefined();
    });

    it('should enforce correct property types', () => {
      const bounds = createMockImageBounds();
      const fill = createMockSolidFill();
      const header = createMockHeader();

      // These should be correct types
      const x: number = bounds.x;
      const fillType: 'solid' | 'gradient' = fill.type;
      const img: string = header.activeImg;

      expect(typeof x).toBe('number');
      expect(fillType).toBe('solid');
      expect(typeof img).toBe('string');
    });
  });
});
