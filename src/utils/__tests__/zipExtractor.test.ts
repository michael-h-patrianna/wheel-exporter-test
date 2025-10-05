/**
 * Unit tests for zipExtractor utility
 */

import JSZip from 'jszip';
import { extractWheelZip } from '../zipExtractor';
import { createMockWheelData, createMockZipFile } from '../testHelpers';

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

// Mock URL.createObjectURL - incrementing counter for unique URLs
let urlCounter = 0;
const mockCreateObjectURL = jest.fn();

beforeAll(() => {
  // Set up the mock implementation
  mockCreateObjectURL.mockImplementation(() => {
    return `blob:mock-url-${++urlCounter}`;
  });
  global.URL.createObjectURL = mockCreateObjectURL as any;
});

beforeEach(() => {
  urlCounter = 0;
  // Reset the mock but keep the implementation
  mockCreateObjectURL.mockClear();
  mockCreateObjectURL.mockImplementation(() => {
    return `blob:mock-url-${++urlCounter}`;
  });
  console.log = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
});

describe('zipExtractor', () => {
  describe('extractWheelZip', () => {
    it('should extract positions.json and all images from a valid ZIP', async () => {
      const mockWheelData = createMockWheelData();

      // Create a mock ZIP with all files
      const zip = new JSZip();
      zip.file('positions.json', JSON.stringify(mockWheelData));
      zip.file('background.png', 'mock image data');
      zip.file('header_active.png', 'mock image data');
      zip.file('header_success.png', 'mock image data');
      zip.file('header_fail.png', 'mock image data');
      zip.file('wheel_bg.png', 'mock image data');
      zip.file('wheel_top_1.png', 'mock image data');
      zip.file('wheel_top_2.png', 'mock image data');
      zip.file('button_spin_default.png', 'mock image data');
      zip.file('button_spin_spinning.png', 'mock image data');
      zip.file('pointer.png', 'mock image data');

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const file = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      const result = await extractWheelZip(file);

      expect(result.wheelData).toEqual(mockWheelData);
      expect(result.backgroundImage).toBeDefined();
      expect(result.backgroundImage).toMatch(/^blob:mock-url-/);
      expect(result.headerImages?.active).toBeDefined();
      expect(result.headerImages?.success).toBeDefined();
      expect(result.headerImages?.fail).toBeDefined();
      expect(result.wheelBgImage).toBeDefined();
      expect(result.wheelTop1Image).toBeDefined();
      expect(result.wheelTop2Image).toBeDefined();
      expect(result.buttonSpinImages?.default).toBeDefined();
      expect(result.buttonSpinImages?.spinning).toBeDefined();
      expect(result.pointerImage).toBeDefined();
    });

    it('should throw error when positions.json is missing', async () => {
      const zip = new JSZip();
      zip.file('random-file.txt', 'some content');

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const file = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      await expect(extractWheelZip(file)).rejects.toThrow('No positions.json file found in ZIP');
    });

    it('should handle missing optional images gracefully', async () => {
      const mockWheelData = createMockWheelData({
        header: undefined,
        wheelBg: undefined,
        wheelTop1: undefined,
        wheelTop2: undefined,
        buttonSpin: undefined,
        pointer: undefined,
      });

      const zip = new JSZip();
      zip.file('positions.json', JSON.stringify(mockWheelData));
      zip.file('background.png', 'mock image data');

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const file = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      const result = await extractWheelZip(file);

      expect(result.wheelData).toEqual(mockWheelData);
      expect(result.backgroundImage).toBeDefined();
      expect(result.backgroundImage).toMatch(/^blob:mock-url-/);
      expect(result.headerImages).toBeUndefined();
      expect(result.wheelBgImage).toBeUndefined();
      expect(result.wheelTop1Image).toBeUndefined();
      expect(result.wheelTop2Image).toBeUndefined();
      expect(result.buttonSpinImages).toBeUndefined();
      expect(result.pointerImage).toBeUndefined();
    });

    it('should warn when referenced image file is missing from ZIP', async () => {
      const mockWheelData = createMockWheelData();
      const zip = new JSZip();
      zip.file('positions.json', JSON.stringify(mockWheelData));
      // Don't add background.png to trigger warning

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const file = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      const result = await extractWheelZip(file);

      expect(console.warn).toHaveBeenCalledWith(
        'Background image not found:',
        'background.png'
      );
      expect(result.backgroundImage).toBeUndefined();
    });

    it('should extract rewards prize images when present', async () => {
      const mockWheelData = createMockWheelData({
        rewards: {
          prizes: {
            images: {
              gc: { label: 'GC', img: 'rewards_prize_gc.png' },
              sc: { label: 'SC', img: 'rewards_prize_sc.png' },
              purchase: { label: 'Purchase', img: 'rewards_prize_purchase.png' },
            },
          },
        },
      });

      const zip = new JSZip();
      zip.file('positions.json', JSON.stringify(mockWheelData));
      zip.file('background.png', 'mock image data');
      zip.file('rewards_prize_gc.png', 'mock image data');
      zip.file('rewards_prize_sc.png', 'mock image data');
      zip.file('rewards_prize_purchase.png', 'mock image data');

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const file = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      const result = await extractWheelZip(file);

      expect(result.rewardsPrizeImages?.gc).toBeDefined();
      expect(result.rewardsPrizeImages?.gc).toMatch(/^blob:mock-url-/);
      expect(result.rewardsPrizeImages?.sc).toBeDefined();
      expect(result.rewardsPrizeImages?.purchase).toBeDefined();
    });

    it('should handle invalid JSON in positions.json', async () => {
      const zip = new JSZip();
      zip.file('positions.json', 'invalid json {{{');
      zip.file('background.png', 'mock image data');

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const file = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      await expect(extractWheelZip(file)).rejects.toThrow();
    });

    it('should create blob URLs for each extracted image', async () => {
      const mockWheelData = createMockWheelData();
      const zip = new JSZip();
      zip.file('positions.json', JSON.stringify(mockWheelData));
      zip.file('background.png', 'mock image data');

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const file = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      await extractWheelZip(file);

      // Verify URL.createObjectURL was called for each image
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    it('should log extraction progress', async () => {
      const mockWheelData = createMockWheelData();
      const zip = new JSZip();
      zip.file('positions.json', JSON.stringify(mockWheelData));
      zip.file('background.png', 'mock image data');

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const file = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      await extractWheelZip(file);

      expect(console.log).toHaveBeenCalledWith('Files in ZIP:', expect.any(Array));
      expect(console.log).toHaveBeenCalledWith('Found background image:', 'background.png');
      expect(console.log).toHaveBeenCalledWith('Extraction complete:', expect.any(Object));
    });
  });
});
