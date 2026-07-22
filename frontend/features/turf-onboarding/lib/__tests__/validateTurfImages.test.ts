import { validateTurfImages, type TurfImageEntry } from '../validateTurfImages';

function makeImage(isCover: boolean): TurfImageEntry {
  return { file: new File(['x'], 'photo.jpg', { type: 'image/jpeg' }), isCover };
}

describe('validateTurfImages', () => {
  it('rejects zero images', () => {
    expect(validateTurfImages([])).toEqual({
      valid: false,
      error: 'Upload at least one turf photo.',
    });
  });

  it('rejects more than 10 images', () => {
    const images = Array.from({ length: 11 }, (_, index) => makeImage(index === 0));
    expect(validateTurfImages(images)).toEqual({
      valid: false,
      error: 'Upload at most 10 turf photos.',
    });
  });

  it('rejects when no image is marked as cover', () => {
    expect(validateTurfImages([makeImage(false), makeImage(false)])).toEqual({
      valid: false,
      error: 'Mark exactly one photo as the cover photo.',
    });
  });

  it('rejects when more than one image is marked as cover', () => {
    expect(validateTurfImages([makeImage(true), makeImage(true)])).toEqual({
      valid: false,
      error: 'Mark exactly one photo as the cover photo.',
    });
  });

  it('accepts 1-10 images with exactly one cover', () => {
    expect(validateTurfImages([makeImage(true), makeImage(false)])).toEqual({ valid: true });
  });
});
