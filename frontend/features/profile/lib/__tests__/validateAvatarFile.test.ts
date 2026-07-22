import { validateAvatarFile } from '../validateAvatarFile';

function buildFile(overrides: { type?: string; sizeBytes?: number } = {}): File {
  const size = overrides.sizeBytes ?? 1024;
  const file = new File([new Uint8Array(size)], 'avatar.png', {
    type: overrides.type ?? 'image/png',
  });
  return file;
}

describe('validateAvatarFile', () => {
  it('accepts a valid JPEG/PNG/WEBP file under the size limit', () => {
    expect(validateAvatarFile(buildFile({ type: 'image/png' })).valid).toBe(true);
    expect(validateAvatarFile(buildFile({ type: 'image/jpeg' })).valid).toBe(true);
    expect(validateAvatarFile(buildFile({ type: 'image/webp' })).valid).toBe(true);
  });

  it('rejects a disallowed file type', () => {
    const result = validateAvatarFile(buildFile({ type: 'application/pdf' }));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/JPEG, PNG, or WEBP/);
  });

  it('rejects a file over the 5MB size limit', () => {
    const result = validateAvatarFile(buildFile({ sizeBytes: 6 * 1024 * 1024 }));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/5MB/);
  });
});
