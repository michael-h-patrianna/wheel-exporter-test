/**
 * Wheel theme loading service
 * Handles ZIP extraction and asset loading with structured logging
 */

import JSZip from 'jszip';
import { ExtractedAssets, WheelExport } from '../types';
import { logger } from './logger';

/**
 * Error types for wheel loading
 */
export enum WheelLoadErrorType {
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  INVALID_FORMAT = 'INVALID_FORMAT',
  MISSING_POSITIONS = 'MISSING_POSITIONS',
  MISSING_ASSETS = 'MISSING_ASSETS',
}

/**
 * Custom error class for wheel loading
 */
export class WheelLoadError extends Error {
  constructor(
    public type: WheelLoadErrorType,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'WheelLoadError';
  }
}

/**
 * Extract and load an image asset from ZIP
 */
async function loadImageAsset(
  zipContent: JSZip,
  filename: string,
  assetType: string
): Promise<string | undefined> {
  if (!filename) {
    return undefined;
  }

  const file = zipContent.file(filename);
  if (!file) {
    logger.warn(`Missing ${assetType} image`, { filename });
    return undefined;
  }

  try {
    const blob = await file.async('blob');
    const url = URL.createObjectURL(blob);
    logger.debug(`Loaded ${assetType} image`, { filename });
    return url;
  } catch (error) {
    logger.error(`Failed to load ${assetType} image`, {
      filename,
      error: error instanceof Error ? error.message : String(error),
    });
    return undefined;
  }
}

/**
 * Extract and process a wheel theme ZIP file
 *
 * @param zipFile - The ZIP file to extract
 * @returns Extracted assets including wheel data and all images
 * @throws {WheelLoadError} If extraction fails
 */
export async function loadWheelFromZip(zipFile: File): Promise<ExtractedAssets> {
  const wheelLogger = logger.withContext({ operation: 'loadWheelFromZip', fileName: zipFile.name });

  try {
    // Load ZIP file
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(zipFile);

    const fileList = Object.keys(zipContent.files);
    wheelLogger.debug('ZIP file loaded', { fileCount: fileList.length, files: fileList });

    // Extract positions.json
    const dataFile = zipContent.file('positions.json');

    if (!dataFile) {
      throw new WheelLoadError(
        WheelLoadErrorType.MISSING_POSITIONS,
        'No positions.json file found in ZIP. Please ensure your export includes the positions.json file.',
        { availableFiles: fileList }
      );
    }

    // Parse wheel data
    let wheelData: WheelExport;
    try {
      const dataContent = await dataFile.async('string');
      wheelData = JSON.parse(dataContent);
      wheelLogger.info('Wheel data loaded', {
        wheelId: wheelData.wheelId,
        version: wheelData.metadata?.version,
      });
    } catch (error) {
      throw new WheelLoadError(
        WheelLoadErrorType.INVALID_FORMAT,
        'Failed to parse positions.json. The file may be corrupted or in an invalid format.',
        { error: error instanceof Error ? error.message : String(error) }
      );
    }

    // Extract background image
    const backgroundImage = wheelData.background?.exportUrl
      ? await loadImageAsset(zipContent, wheelData.background.exportUrl, 'background')
      : undefined;

    // Extract header images
    let headerImages: ExtractedAssets['headerImages'] | undefined;
    if (wheelData.header) {
      headerImages = {
        active: await loadImageAsset(zipContent, wheelData.header.activeImg, 'header-active'),
        success: await loadImageAsset(zipContent, wheelData.header.successImg, 'header-success'),
        fail: await loadImageAsset(zipContent, wheelData.header.failImg, 'header-fail'),
      };
    }

    // Extract wheel background image
    const wheelBgImage = wheelData.wheelBg?.img
      ? await loadImageAsset(zipContent, wheelData.wheelBg.img, 'wheelBg')
      : undefined;

    // Extract wheel top layer 1 image
    const wheelTop1Image = wheelData.wheelTop1?.img
      ? await loadImageAsset(zipContent, wheelData.wheelTop1.img, 'wheelTop1')
      : undefined;

    // Extract wheel top layer 2 image
    const wheelTop2Image = wheelData.wheelTop2?.img
      ? await loadImageAsset(zipContent, wheelData.wheelTop2.img, 'wheelTop2')
      : undefined;

    // Extract button spin images
    let buttonSpinImages: ExtractedAssets['buttonSpinImages'] | undefined;
    if (wheelData.buttonSpin) {
      buttonSpinImages = {
        default: await loadImageAsset(
          zipContent,
          wheelData.buttonSpin.defaultImg,
          'button-default'
        ),
        spinning: await loadImageAsset(
          zipContent,
          wheelData.buttonSpin.spinningImg,
          'button-spinning'
        ),
      };
    }

    // Extract pointer image
    const pointerImage = wheelData.pointer?.img
      ? await loadImageAsset(zipContent, wheelData.pointer.img, 'pointer')
      : undefined;

    // Extract rewards prize images
    let rewardsPrizeImages: ExtractedAssets['rewardsPrizeImages'] | undefined;
    if (wheelData.rewards?.prizes?.images) {
      rewardsPrizeImages = {};
      const prizeImages = wheelData.rewards.prizes.images;

      for (const [key, imageData] of Object.entries(prizeImages)) {
        if (imageData?.img) {
          rewardsPrizeImages[key] = await loadImageAsset(zipContent, imageData.img, `prize-${key}`);
        }
      }
    }

    const assets: ExtractedAssets = {
      wheelData,
      backgroundImage,
      headerImages,
      wheelBgImage,
      wheelTop1Image,
      wheelTop2Image,
      buttonSpinImages,
      pointerImage,
      rewardsPrizeImages,
    };

    wheelLogger.info('Wheel extraction complete', {
      wheelId: wheelData.wheelId,
      hasBackground: !!backgroundImage,
      hasHeader: !!headerImages,
      hasWheelBg: !!wheelBgImage,
      hasButton: !!buttonSpinImages,
      hasPointer: !!pointerImage,
      prizeImageCount: Object.keys(rewardsPrizeImages || {}).length,
    });

    return assets;
  } catch (error) {
    if (error instanceof WheelLoadError) {
      wheelLogger.error('Wheel loading failed', {
        errorType: error.type,
        message: error.message,
        details: error.details,
      });
      throw error;
    }

    // Unexpected error
    const message = error instanceof Error ? error.message : String(error);
    wheelLogger.error('Unexpected error during wheel loading', { error: message });

    throw new WheelLoadError(
      WheelLoadErrorType.FILE_READ_ERROR,
      `Failed to load wheel: ${message}`,
      { originalError: message }
    );
  }
}
