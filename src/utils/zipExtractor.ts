import JSZip from 'jszip';
import { ExtractedAssets, WheelExport } from '../types';

/**
 * Extracts and processes a wheel theme ZIP file
 */
export async function extractWheelZip(zipFile: File): Promise<ExtractedAssets> {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(zipFile);

  // Debug: Log all files in the ZIP
  console.log('Files in ZIP:', Object.keys(zipContent.files));

  // Extract positions.json
  const dataFile = zipContent.file('positions.json');

  if (!dataFile) {
    throw new Error('No positions.json file found in ZIP. Available files: ' + Object.keys(zipContent.files).join(', '));
  }

  const dataContent = await dataFile.async('string');
  const wheelData: WheelExport = JSON.parse(dataContent);

  // Extract background image (at root level)
  let backgroundImage: string | undefined;
  if (wheelData.background?.exportUrl) {
    const bgFile = zipContent.file(wheelData.background.exportUrl);
    if (bgFile) {
      const bgBlob = await bgFile.async('blob');
      backgroundImage = URL.createObjectURL(bgBlob);
      console.log('Found background image:', wheelData.background.exportUrl);
    } else {
      console.warn('Background image not found:', wheelData.background.exportUrl);
    }
  }

  // Extract header images (optional)
  let headerImages: ExtractedAssets['headerImages'] | undefined;
  if (wheelData.header) {
    headerImages = {};
    const headerImageStates = [
      { state: 'active', filename: wheelData.header.activeImg },
      { state: 'success', filename: wheelData.header.successImg },
      { state: 'fail', filename: wheelData.header.failImg }
    ] as const;

    for (const { state, filename } of headerImageStates) {
      if (filename) {
        const file = zipContent.file(filename);
        if (file) {
          const blob = await file.async('blob');
          headerImages[state] = URL.createObjectURL(blob);
          console.log(`Found header image: ${state} -> ${filename}`);
        } else {
          console.warn(`Missing header image: ${state} -> ${filename}`);
        }
      }
    }
  }

  console.log('Extraction complete:', {
    wheelData,
    headerImages,
    backgroundImage: !!backgroundImage
  });

  return {
    wheelData,
    backgroundImage,
    headerImages
  };
}