export interface CropPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

const OUTPUT_WIDTH = 1280;
const OUTPUT_HEIGHT = 720;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

/**
 * Draws the cropped region of `imageSrc` onto an offscreen canvas at the app's preferred turf-photo
 * size (1280x720, 16:9) and resolves a JPEG Blob. Isolated from the crop UI so it's independently
 * testable (given a mocked `document.createElement('canvas')`/`Image`).
 */
export async function cropImageToBlob(imageSrc: string, cropPixels: CropPixels): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Unable to get a 2D canvas context.');
  }

  context.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    OUTPUT_WIDTH,
    OUTPUT_HEIGHT,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to crop image.'));
      },
      'image/jpeg',
      0.9,
    );
  });
}
