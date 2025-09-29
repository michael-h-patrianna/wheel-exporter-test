import JSZip from 'jszip';
import { ExtractedAssets, WheelExport } from '../types';

/**
 * Converts a file from the zip to a base64 data URL
 */
async function fileToDataUrl(file: JSZip.JSZipObject, mimeType: string): Promise<string> {
  const data = await file.async('base64');
  return `data:${mimeType};base64,${data}`;
}

/**
 * Extracts and processes a wheel theme ZIP file
 */
export async function extractWheelZip(file: File): Promise<ExtractedAssets> {
  const zip = new JSZip();
  const contents = await zip.loadAsync(file);

  // Find and parse the wheel JSON data file
  const dataFile = contents.file(/data\.json$/i)[0];
  if (!dataFile) {
    throw new Error('No data.json file found in ZIP');
  }

  const dataContent = await dataFile.async('string');
  const wheelData: WheelExport = JSON.parse(dataContent);

  // Initialize the extracted assets structure
  const extractedAssets: ExtractedAssets = {
    wheelData,
    backgroundImage: undefined,
    headerImages: undefined,
  };

  // Process background image
  if (wheelData.background?.exportUrl) {
    const bgFileName = wheelData.background.exportUrl.replace('exports/', '');
    const bgFile = contents.file(new RegExp(bgFileName, 'i'))[0];
    if (bgFile) {
      const mimeType = bgFileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
      extractedAssets.backgroundImage = await fileToDataUrl(bgFile, mimeType);
    }
  }

  // Process header images if header component exists
  if (wheelData.header) {
    extractedAssets.headerImages = {};

    // Process header active image
    if (wheelData.header.activeImg) {
      const fileName = wheelData.header.activeImg.replace('exports/', '');
      const imgFile = contents.file(new RegExp(fileName, 'i'))[0];
      if (imgFile) {
        const mimeType = fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        extractedAssets.headerImages.active = await fileToDataUrl(imgFile, mimeType);
      }
    }

    // Process header success image
    if (wheelData.header.successImg) {
      const fileName = wheelData.header.successImg.replace('exports/', '');
      const imgFile = contents.file(new RegExp(fileName, 'i'))[0];
      if (imgFile) {
        const mimeType = fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        extractedAssets.headerImages.success = await fileToDataUrl(imgFile, mimeType);
      }
    }

    // Process header fail image
    if (wheelData.header.failImg) {
      const fileName = wheelData.header.failImg.replace('exports/', '');
      const imgFile = contents.file(new RegExp(fileName, 'i'))[0];
      if (imgFile) {
        const mimeType = fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        extractedAssets.headerImages.fail = await fileToDataUrl(imgFile, mimeType);
      }
    }
  }

  console.log('Extracted wheel assets:', {
    wheelId: wheelData.wheelId,
    hasBackground: !!extractedAssets.backgroundImage,
    hasHeader: !!wheelData.header,
    headerImages: extractedAssets.headerImages ? Object.keys(extractedAssets.headerImages) : [],
  });

  return extractedAssets;
}