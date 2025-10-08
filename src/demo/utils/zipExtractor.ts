import JSZip from 'jszip';
import { ExtractedAssets, WheelExport } from '../../lib/types';

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

  // Extract wheelBg image (optional)
  let wheelBgImage: string | undefined;
  if (wheelData.wheelBg?.img) {
    const file = zipContent.file(wheelData.wheelBg.img);
    if (file) {
      const blob = await file.async('blob');
      wheelBgImage = URL.createObjectURL(blob);
      console.log('Found wheelBg image:', wheelData.wheelBg.img);
    } else {
      console.warn('Missing wheelBg image:', wheelData.wheelBg.img);
    }
  }

  // Extract wheelTop1 image (optional)
  let wheelTop1Image: string | undefined;
  if (wheelData.wheelTop1?.img) {
    const file = zipContent.file(wheelData.wheelTop1.img);
    if (file) {
      const blob = await file.async('blob');
      wheelTop1Image = URL.createObjectURL(blob);
      console.log('Found wheelTop1 image:', wheelData.wheelTop1.img);
    } else {
      console.warn('Missing wheelTop1 image:', wheelData.wheelTop1.img);
    }
  }

  // Extract wheelTop2 image (optional)
  let wheelTop2Image: string | undefined;
  if (wheelData.wheelTop2?.img) {
    const file = zipContent.file(wheelData.wheelTop2.img);
    if (file) {
      const blob = await file.async('blob');
      wheelTop2Image = URL.createObjectURL(blob);
      console.log('Found wheelTop2 image:', wheelData.wheelTop2.img);
    } else {
      console.warn('Missing wheelTop2 image:', wheelData.wheelTop2.img);
    }
  }

  // Extract buttonSpin images (optional)
  let buttonSpinImages: ExtractedAssets['buttonSpinImages'] | undefined;
  if (wheelData.buttonSpin) {
    buttonSpinImages = {};
    const buttonStates = [
      { state: 'default', filename: wheelData.buttonSpin.defaultImg },
      { state: 'spinning', filename: wheelData.buttonSpin.spinningImg }
    ] as const;

    for (const { state, filename } of buttonStates) {
      if (filename) {
        const file = zipContent.file(filename);
        if (file) {
          const blob = await file.async('blob');
          buttonSpinImages[state] = URL.createObjectURL(blob);
          console.log(`Found buttonSpin image: ${state} -> ${filename}`);
        } else {
          console.warn(`Missing buttonSpin image: ${state} -> ${filename}`);
        }
      }
    }
  }

  // Extract pointer image (optional)
  let pointerImage: string | undefined;
  if (wheelData.pointer?.img) {
    const file = zipContent.file(wheelData.pointer.img);
    if (file) {
      const blob = await file.async('blob');
      pointerImage = URL.createObjectURL(blob);
      console.log('Found pointer image:', wheelData.pointer.img);
    } else {
      console.warn('Missing pointer image:', wheelData.pointer.img);
    }
  }

  // Extract rewards prize images (optional)
  let rewardsPrizeImages: ExtractedAssets['rewardsPrizeImages'] | undefined;
  if (wheelData.rewards?.prizes?.images) {
    rewardsPrizeImages = {};
    const prizeImages = wheelData.rewards.prizes.images;

    for (const [key, imageData] of Object.entries(prizeImages)) {
      if (imageData?.img) {
        const file = zipContent.file(imageData.img);
        if (file) {
          const blob = await file.async('blob');
          rewardsPrizeImages[key] = URL.createObjectURL(blob);
          console.log(`Found rewards prize image: ${key} -> ${imageData.img}`);
        } else {
          console.warn(`Missing rewards prize image: ${key} -> ${imageData.img}`);
        }
      }
    }
  }

  console.log('Extraction complete:', {
    wheelData,
    headerImages,
    backgroundImage: !!backgroundImage,
    wheelBgImage: !!wheelBgImage,
    wheelTop1Image: !!wheelTop1Image,
    wheelTop2Image: !!wheelTop2Image,
    buttonSpinImages,
    pointerImage: !!pointerImage,
    rewardsPrizeImages
  });

  return {
    wheelData,
    backgroundImage,
    headerImages,
    wheelBgImage,
    wheelTop1Image,
    wheelTop2Image,
    buttonSpinImages,
    pointerImage,
    rewardsPrizeImages
  };
}