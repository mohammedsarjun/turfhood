import {
  isUnavailable3dLayerError,
  removeUnavailable3dLayers,
  type OlaMapStyle,
} from '../olaMapStyle';

describe('removeUnavailable3dLayers', () => {
  it('removes Ola 3D layers while preserving regular vector layers', () => {
    const style: OlaMapStyle = {
      version: 8,
      sources: { vectordata: { type: 'vector' } },
      layers: [
        { id: 'water', source: 'vectordata', 'source-layer': 'water' },
        { id: '3d_model_data', source: 'vectordata', 'source-layer': '3d_model' },
      ],
    };

    expect(removeUnavailable3dLayers(style).layers).toEqual([
      { id: 'water', source: 'vectordata', 'source-layer': 'water' },
    ]);
  });
});

describe('isUnavailable3dLayerError', () => {
  it('recognizes the invalid Ola 3D source-layer event', () => {
    expect(
      isUnavailable3dLayerError({
        error: { message: 'Source layer "3d_model" does not exist on source "vectordata"' },
      }),
    ).toBe(true);
    expect(isUnavailable3dLayerError({ error: { message: 'Network error' } })).toBe(false);
  });
});
