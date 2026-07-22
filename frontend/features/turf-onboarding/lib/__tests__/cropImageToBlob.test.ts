import { cropImageToBlob } from '../cropImageToBlob';

describe('cropImageToBlob', () => {
  const originalCreateElement = document.createElement.bind(document);
  const originalImage = global.Image;

  afterEach(() => {
    document.createElement = originalCreateElement;
    global.Image = originalImage;
    jest.restoreAllMocks();
  });

  it('draws the cropped region onto a 1280x720 canvas and resolves a JPEG blob', async () => {
    class FakeImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      crossOrigin = '';
      set src(_value: string) {
        setTimeout(() => this.onload?.(), 0);
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test stub for the DOM Image constructor
    global.Image = FakeImage as any;

    const drawImage = jest.fn();
    const toBlob = jest.fn((callback: (blob: Blob | null) => void) => {
      callback(new Blob(['fake'], { type: 'image/jpeg' }));
    });
    const fakeCanvas = {
      width: 0,
      height: 0,
      getContext: jest.fn(() => ({ drawImage })),
      toBlob,
    };
    jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') return fakeCanvas as unknown as HTMLCanvasElement;
      return originalCreateElement(tag);
    });

    const blob = await cropImageToBlob('data:image/jpeg;base64,fake', {
      x: 10,
      y: 20,
      width: 300,
      height: 200,
    });

    expect(fakeCanvas.width).toBe(1280);
    expect(fakeCanvas.height).toBe(720);
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 10, 20, 300, 200, 0, 0, 1280, 720);
    expect(blob).toBeInstanceOf(Blob);
  });

  it('rejects when the image fails to load', async () => {
    class FailingImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      crossOrigin = '';
      set src(_value: string) {
        setTimeout(
          () => (this.onerror as (error: Error) => void)?.(new Error('failed to load')),
          0,
        );
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test stub for the DOM Image constructor
    global.Image = FailingImage as any;

    await expect(
      cropImageToBlob('data:image/jpeg;base64,broken', { x: 0, y: 0, width: 100, height: 100 }),
    ).rejects.toThrow('failed to load');
  });
});
