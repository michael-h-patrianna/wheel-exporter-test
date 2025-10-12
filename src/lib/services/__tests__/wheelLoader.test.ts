/**
 * Comprehensive test suite for wheelLoader service
 * Tests ZIP loading, asset extraction, error handling, and all error types
 */

import JSZip from 'jszip';
import { loadWheelFromZip, WheelLoadError, WheelLoadErrorType } from '../wheelLoader';
import { WheelExport } from '../../types';

// Mock the logger module
jest.mock('../logger');

// Import after mock
import { logger } from '../logger';

describe('wheelLoader', () => {
  let mockZip: JSZip;
  let mockFile: File;

  beforeEach(() => {
    jest.clearAllMocks();
    mockZip = new JSZip();
    mockFile = new File([''], 'test-wheel.zip', { type: 'application/zip' });

    // Set up all mocks AFTER clearAllMocks
    (logger.withContext as jest.Mock).mockReturnValue({
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    });

    // Also mock the direct logger methods used by loadImageAsset
    (logger.debug as jest.Mock).mockImplementation(() => {});
    (logger.info as jest.Mock).mockImplementation(() => {});
    (logger.warn as jest.Mock).mockImplementation(() => {});
    (logger.error as jest.Mock).mockImplementation(() => {});

    // Mock URL methods AFTER clearAllMocks
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url-123');
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful ZIP loading with all assets', () => {
    it('should successfully load a complete wheel ZIP with all assets', async () => {
      const wheelData: WheelExport = {
        wheelId: 'test-wheel-123',
        frameSize: { width: 800, height: 600 },
        background: { exportUrl: 'background.png' },
        header: {
          stateBounds: {
            active: { x: 400, y: 100, w: 200, h: 50 },
            success: { x: 400, y: 100, w: 200, h: 50 },
            fail: { x: 400, y: 100, w: 200, h: 50 },
          },
          activeImg: 'header-active.png',
          successImg: 'header-success.png',
          failImg: 'header-fail.png',
        },
        wheelBg: {
          bounds: { x: 400, y: 300, w: 600, h: 600 },
          img: 'wheelbg.png',
        },
        wheelTop1: {
          bounds: { x: 400, y: 300, w: 200, h: 200 },
          img: 'wheeltop1.png',
        },
        wheelTop2: {
          bounds: { x: 400, y: 300, w: 200, h: 200 },
          img: 'wheeltop2.png',
        },
        buttonSpin: {
          stateBounds: {
            default: { x: 400, y: 500, w: 100, h: 100 },
            spinning: { x: 400, y: 500, w: 100, h: 100 },
          },
          defaultImg: 'button-default.png',
          spinningImg: 'button-spinning.png',
        },
        pointer: {
          bounds: { x: 400, y: 50, w: 60, h: 80 },
          img: 'pointer.png',
        },
        center: { x: 400, y: 300, radius: 250 },
        segments: {},
        rewards: {
          prizes: {
            images: {
              gc: { label: 'Gold Coins', img: 'gc-prize.png' },
              sc: { label: 'Sweeps Coins', img: 'sc-prize.png' },
              purchase: { label: 'Purchase', img: 'purchase-prize.png' },
            },
          },
        },
        exportedAt: new Date().toISOString(),
        metadata: {
          exportFormat: 'figma-plugin-v1',
          version: '1.0.0',
        },
      };

      // Add positions.json to ZIP
      mockZip.file('positions.json', JSON.stringify(wheelData));

      // Add all image files as blobs
      const mockBlob = new Blob(['mock-image-data'], { type: 'image/png' });
      mockZip.file('background.png', mockBlob);
      mockZip.file('header-active.png', mockBlob);
      mockZip.file('header-success.png', mockBlob);
      mockZip.file('header-fail.png', mockBlob);
      mockZip.file('wheelbg.png', mockBlob);
      mockZip.file('wheeltop1.png', mockBlob);
      mockZip.file('wheeltop2.png', mockBlob);
      mockZip.file('button-default.png', mockBlob);
      mockZip.file('button-spinning.png', mockBlob);
      mockZip.file('pointer.png', mockBlob);
      mockZip.file('gc-prize.png', mockBlob);
      mockZip.file('sc-prize.png', mockBlob);
      mockZip.file('purchase-prize.png', mockBlob);

      // Generate ZIP file
      const zipBlob = await mockZip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], 'test-wheel.zip', { type: 'application/zip' });

      const result = await loadWheelFromZip(zipFile);

      // Verify all assets were loaded
      expect(result.wheelData).toEqual(wheelData);
      expect(result.backgroundImage).toBe('blob:mock-url-123');
      expect(result.headerImages?.active).toBe('blob:mock-url-123');
      expect(result.headerImages?.success).toBe('blob:mock-url-123');
      expect(result.headerImages?.fail).toBe('blob:mock-url-123');
      expect(result.wheelBgImage).toBe('blob:mock-url-123');
      expect(result.wheelTop1Image).toBe('blob:mock-url-123');
      expect(result.wheelTop2Image).toBe('blob:mock-url-123');
      expect(result.buttonSpinImages?.default).toBe('blob:mock-url-123');
      expect(result.buttonSpinImages?.spinning).toBe('blob:mock-url-123');
      expect(result.pointerImage).toBe('blob:mock-url-123');
      expect(result.rewardsPrizeImages?.gc).toBe('blob:mock-url-123');
      expect(result.rewardsPrizeImages?.sc).toBe('blob:mock-url-123');
      expect(result.rewardsPrizeImages?.purchase).toBe('blob:mock-url-123');
    });

    it('should load minimal wheel with only required fields', async () => {
      const minimalWheelData: WheelExport = {
        wheelId: 'minimal-wheel',
        frameSize: { width: 800, height: 600 },
        background: { exportUrl: '' },
        center: { x: 400, y: 300, radius: 250 },
        segments: {},
        exportedAt: new Date().toISOString(),
        metadata: {
          exportFormat: 'figma-plugin-v1',
          version: '1.0.0',
        },
      };

      mockZip.file('positions.json', JSON.stringify(minimalWheelData));

      const zipBlob = await mockZip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], 'minimal-wheel.zip', { type: 'application/zip' });

      const result = await loadWheelFromZip(zipFile);

      expect(result.wheelData).toEqual(minimalWheelData);
      expect(result.backgroundImage).toBeUndefined();
      expect(result.headerImages).toBeUndefined();
      expect(result.wheelBgImage).toBeUndefined();
      expect(result.buttonSpinImages).toBeUndefined();
      expect(result.pointerImage).toBeUndefined();
    });
  });

  describe('Missing positions.json error', () => {
    it('should throw MISSING_POSITIONS error when positions.json is not in ZIP', async () => {
      mockZip.file('some-other-file.txt', 'content');

      const zipBlob = await mockZip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], 'no-positions.zip', { type: 'application/zip' });

      await expect(loadWheelFromZip(zipFile)).rejects.toThrow(WheelLoadError);
      await expect(loadWheelFromZip(zipFile)).rejects.toMatchObject({
        type: WheelLoadErrorType.MISSING_POSITIONS,
        message: expect.stringContaining('No positions.json file found'),
      });
    });

    it('should include available files in MISSING_POSITIONS error details', async () => {
      mockZip.file('file1.png', 'content');
      mockZip.file('file2.png', 'content');

      const zipBlob = await mockZip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      try {
        await loadWheelFromZip(zipFile);
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(WheelLoadError);
        const wheelError = error as WheelLoadError;
        expect(wheelError.details?.availableFiles).toEqual(['file1.png', 'file2.png']);
      }
    });
  });

  describe('Invalid JSON format error', () => {
    it('should throw INVALID_FORMAT error when positions.json has invalid JSON', async () => {
      mockZip.file('positions.json', 'invalid json content {{{');

      const zipBlob = await mockZip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], 'invalid-json.zip', { type: 'application/zip' });

      await expect(loadWheelFromZip(zipFile)).rejects.toThrow(WheelLoadError);
      await expect(loadWheelFromZip(zipFile)).rejects.toMatchObject({
        type: WheelLoadErrorType.INVALID_FORMAT,
        message: expect.stringContaining('Failed to parse positions.json'),
      });
    });

    it('should include parse error details in INVALID_FORMAT error', async () => {
      mockZip.file('positions.json', '{broken json}');

      const zipBlob = await mockZip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      try {
        await loadWheelFromZip(zipFile);
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(WheelLoadError);
        const wheelError = error as WheelLoadError;
        expect(wheelError.details?.error).toBeDefined();
        expect(typeof wheelError.details?.error).toBe('string');
      }
    });
  });

  describe('Optional assets (undefined handling)', () => {
    it('should return undefined for missing background image', async () => {
      const wheelData: WheelExport = {
        wheelId: 'test',
        frameSize: { width: 800, height: 600 },
        background: { exportUrl: '' },
        center: { x: 400, y: 300, radius: 250 },
        segments: {},
        exportedAt: new Date().toISOString(),
        metadata: { exportFormat: 'figma-plugin-v1', version: '1.0.0' },
      };

      mockZip.file('positions.json', JSON.stringify(wheelData));

      const zipBlob = await mockZip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      const result = await loadWheelFromZip(zipFile);

      expect(result.backgroundImage).toBeUndefined();
    });

    it('should return undefined for missing header images when header not defined', async () => {
      const wheelData: WheelExport = {
        wheelId: 'test',
        frameSize: { width: 800, height: 600 },
        background: { exportUrl: '' },
        center: { x: 400, y: 300, radius: 250 },
        segments: {},
        exportedAt: new Date().toISOString(),
        metadata: { exportFormat: 'figma-plugin-v1', version: '1.0.0' },
      };

      mockZip.file('positions.json', JSON.stringify(wheelData));

      const zipBlob = await mockZip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      const result = await loadWheelFromZip(zipFile);

      expect(result.headerImages).toBeUndefined();
    });

    it('should warn and return undefined when image file is missing from ZIP', async () => {
      const wheelData: WheelExport = {
        wheelId: 'test',
        frameSize: { width: 800, height: 600 },
        background: { exportUrl: 'missing-background.png' },
        center: { x: 400, y: 300, radius: 250 },
        segments: {},
        exportedAt: new Date().toISOString(),
        metadata: { exportFormat: 'figma-plugin-v1', version: '1.0.0' },
      };

      mockZip.file('positions.json', JSON.stringify(wheelData));
      // Note: background.png is NOT added to the ZIP

      const zipBlob = await mockZip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      const result = await loadWheelFromZip(zipFile);

      expect(result.backgroundImage).toBeUndefined();
    });

    it('should handle empty filename gracefully', async () => {
      const wheelData: WheelExport = {
        wheelId: 'test',
        frameSize: { width: 800, height: 600 },
        background: { exportUrl: '' },
        center: { x: 400, y: 300, radius: 250 },
        segments: {},
        exportedAt: new Date().toISOString(),
        metadata: { exportFormat: 'figma-plugin-v1', version: '1.0.0' },
      };

      mockZip.file('positions.json', JSON.stringify(wheelData));

      const zipBlob = await mockZip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      const result = await loadWheelFromZip(zipFile);

      expect(result.backgroundImage).toBeUndefined();
    });
  });

  describe('WheelLoadError types', () => {
    it('should create FILE_READ_ERROR with correct properties', () => {
      const error = new WheelLoadError(
        WheelLoadErrorType.FILE_READ_ERROR,
        'Test file read error',
        { fileName: 'test.zip' }
      );

      expect(error.type).toBe(WheelLoadErrorType.FILE_READ_ERROR);
      expect(error.message).toBe('Test file read error');
      expect(error.details).toEqual({ fileName: 'test.zip' });
      expect(error.name).toBe('WheelLoadError');
    });

    it('should create INVALID_FORMAT error with correct properties', () => {
      const error = new WheelLoadError(
        WheelLoadErrorType.INVALID_FORMAT,
        'Invalid format',
        { error: 'Parse error' }
      );

      expect(error.type).toBe(WheelLoadErrorType.INVALID_FORMAT);
      expect(error.message).toBe('Invalid format');
      expect(error.details?.error).toBe('Parse error');
    });

    it('should create MISSING_POSITIONS error with correct properties', () => {
      const error = new WheelLoadError(
        WheelLoadErrorType.MISSING_POSITIONS,
        'Missing positions',
        { availableFiles: ['file1.png'] }
      );

      expect(error.type).toBe(WheelLoadErrorType.MISSING_POSITIONS);
      expect(error.message).toBe('Missing positions');
    });

    it('should create MISSING_ASSETS error with correct properties', () => {
      const error = new WheelLoadError(
        WheelLoadErrorType.MISSING_ASSETS,
        'Missing assets',
        { missingAssets: ['bg.png'] }
      );

      expect(error.type).toBe(WheelLoadErrorType.MISSING_ASSETS);
      expect(error.message).toBe('Missing assets');
    });

    it('should create error without details', () => {
      const error = new WheelLoadError(
        WheelLoadErrorType.FILE_READ_ERROR,
        'Error without details'
      );

      expect(error.type).toBe(WheelLoadErrorType.FILE_READ_ERROR);
      expect(error.message).toBe('Error without details');
      expect(error.details).toBeUndefined();
    });
  });

  describe('Image loading for all asset types', () => {
    it('should load header active image', async () => {
      const wheelData: WheelExport = {
        wheelId: 'test',
        frameSize: { width: 800, height: 600 },
        background: { exportUrl: '' },
        header: {
          stateBounds: {
            active: { x: 0, y: 0, w: 100, h: 50 },
            success: { x: 0, y: 0, w: 100, h: 50 },
            fail: { x: 0, y: 0, w: 100, h: 50 },
          },
          activeImg: 'header-active.png',
          successImg: 'header-success.png',
          failImg: 'header-fail.png',
        },
        center: { x: 400, y: 300, radius: 250 },
        segments: {},
        exportedAt: new Date().toISOString(),
        metadata: { exportFormat: 'figma-plugin-v1', version: '1.0.0' },
      };

      const mockBlob = new Blob(['image'], { type: 'image/png' });
      mockZip.file('positions.json', JSON.stringify(wheelData));
      mockZip.file('header-active.png', mockBlob);
      mockZip.file('header-success.png', mockBlob);
      mockZip.file('header-fail.png', mockBlob);

      const zipBlob = await mockZip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      const result = await loadWheelFromZip(zipFile);

      expect(result.headerImages?.active).toBe('blob:mock-url-123');
      expect(result.headerImages?.success).toBe('blob:mock-url-123');
      expect(result.headerImages?.fail).toBe('blob:mock-url-123');
    });

    it('should load wheelTop1 and wheelTop2 images', async () => {
      const wheelData: WheelExport = {
        wheelId: 'test',
        frameSize: { width: 800, height: 600 },
        background: { exportUrl: '' },
        wheelTop1: {
          bounds: { x: 400, y: 300, w: 200, h: 200 },
          img: 'top1.png',
        },
        wheelTop2: {
          bounds: { x: 400, y: 300, w: 200, h: 200 },
          img: 'top2.png',
        },
        center: { x: 400, y: 300, radius: 250 },
        segments: {},
        exportedAt: new Date().toISOString(),
        metadata: { exportFormat: 'figma-plugin-v1', version: '1.0.0' },
      };

      const mockBlob = new Blob(['image'], { type: 'image/png' });
      mockZip.file('positions.json', JSON.stringify(wheelData));
      mockZip.file('top1.png', mockBlob);
      mockZip.file('top2.png', mockBlob);

      const zipBlob = await mockZip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      const result = await loadWheelFromZip(zipFile);

      expect(result.wheelTop1Image).toBe('blob:mock-url-123');
      expect(result.wheelTop2Image).toBe('blob:mock-url-123');
    });

    it('should load rewards prize images', async () => {
      const wheelData: WheelExport = {
        wheelId: 'test',
        frameSize: { width: 800, height: 600 },
        background: { exportUrl: '' },
        center: { x: 400, y: 300, radius: 250 },
        segments: {},
        rewards: {
          prizes: {
            images: {
              gc: { label: 'Gold Coins', img: 'gc.png' },
              sc: { label: 'Sweeps Coins', img: 'sc.png' },
              custom: { label: 'Custom', img: 'custom.png' },
            },
          },
        },
        exportedAt: new Date().toISOString(),
        metadata: { exportFormat: 'figma-plugin-v1', version: '1.0.0' },
      };

      const mockBlob = new Blob(['image'], { type: 'image/png' });
      mockZip.file('positions.json', JSON.stringify(wheelData));
      mockZip.file('gc.png', mockBlob);
      mockZip.file('sc.png', mockBlob);
      mockZip.file('custom.png', mockBlob);

      const zipBlob = await mockZip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      const result = await loadWheelFromZip(zipFile);

      expect(result.rewardsPrizeImages?.gc).toBe('blob:mock-url-123');
      expect(result.rewardsPrizeImages?.sc).toBe('blob:mock-url-123');
      expect(result.rewardsPrizeImages?.custom).toBe('blob:mock-url-123');
    });

    it('should skip rewards images with no img property', async () => {
      const wheelData: WheelExport = {
        wheelId: 'test',
        frameSize: { width: 800, height: 600 },
        background: { exportUrl: '' },
        center: { x: 400, y: 300, radius: 250 },
        segments: {},
        rewards: {
          prizes: {
            images: {
              gc: { label: 'Gold Coins', img: 'gc.png' },
              noimg: {} as any, // No img property
            },
          },
        },
        exportedAt: new Date().toISOString(),
        metadata: { exportFormat: 'figma-plugin-v1', version: '1.0.0' },
      };

      const mockBlob = new Blob(['image'], { type: 'image/png' });
      mockZip.file('positions.json', JSON.stringify(wheelData));
      mockZip.file('gc.png', mockBlob);

      const zipBlob = await mockZip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      const result = await loadWheelFromZip(zipFile);

      expect(result.rewardsPrizeImages?.gc).toBe('blob:mock-url-123');
      expect(result.rewardsPrizeImages?.noimg).toBeUndefined();
    });
  });

  describe('Unexpected errors', () => {
    it('should wrap unexpected errors in FILE_READ_ERROR', async () => {
      // Create an invalid File object that will cause JSZip to fail
      const invalidFile = new File([], 'invalid.zip', { type: 'application/zip' });

      await expect(loadWheelFromZip(invalidFile)).rejects.toMatchObject({
        type: WheelLoadErrorType.FILE_READ_ERROR,
        message: expect.stringContaining('Failed to load wheel'),
      });
    });

    it('should handle non-Error thrown values', async () => {
      // This test verifies the String(error) fallback
      const mockZipLoadAsync = jest.spyOn(JSZip.prototype, 'loadAsync');
      mockZipLoadAsync.mockRejectedValue('string error');

      const file = new File(['content'], 'test.zip', { type: 'application/zip' });

      await expect(loadWheelFromZip(file)).rejects.toMatchObject({
        type: WheelLoadErrorType.FILE_READ_ERROR,
        message: expect.stringContaining('Failed to load wheel'),
      });

      mockZipLoadAsync.mockRestore();
    });
  });

  describe('Logging', () => {
    it('should log ZIP file loading', async () => {
      const wheelData: WheelExport = {
        wheelId: 'test',
        frameSize: { width: 800, height: 600 },
        background: { exportUrl: '' },
        center: { x: 400, y: 300, radius: 250 },
        segments: {},
        exportedAt: new Date().toISOString(),
        metadata: { exportFormat: 'figma-plugin-v1', version: '1.0.0' },
      };

      mockZip.file('positions.json', JSON.stringify(wheelData));

      const zipBlob = await mockZip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], 'test-wheel.zip', { type: 'application/zip' });

      await loadWheelFromZip(zipFile);

      expect(logger.withContext).toHaveBeenCalledWith({
        operation: 'loadWheelFromZip',
        fileName: 'test-wheel.zip',
      });
    });

    it('should log extraction completion with asset summary', async () => {
      const wheelData: WheelExport = {
        wheelId: 'test-123',
        frameSize: { width: 800, height: 600 },
        background: { exportUrl: 'bg.png' },
        center: { x: 400, y: 300, radius: 250 },
        segments: {},
        exportedAt: new Date().toISOString(),
        metadata: { exportFormat: 'figma-plugin-v1', version: '1.0.0' },
      };

      const mockBlob = new Blob(['image'], { type: 'image/png' });
      mockZip.file('positions.json', JSON.stringify(wheelData));
      mockZip.file('bg.png', mockBlob);

      const zipBlob = await mockZip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      await loadWheelFromZip(zipFile);

      const mockWithContextResult = (logger.withContext as jest.Mock).mock.results[0]?.value;
      expect(mockWithContextResult).toBeDefined();
      expect(mockWithContextResult.info).toHaveBeenCalledWith(
        'Wheel extraction complete',
        expect.objectContaining({
          wheelId: 'test-123',
          hasBackground: true,
        })
      );
    });
  });
});
