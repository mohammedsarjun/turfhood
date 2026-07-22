import { validateDocumentFile } from '../validateDocumentFile';

function buildFile(overrides: { type?: string; sizeBytes?: number } = {}): File {
  const size = overrides.sizeBytes ?? 1024;
  const file = new File([new Uint8Array(size)], 'document.pdf', {
    type: overrides.type ?? 'application/pdf',
  });
  return file;
}

describe('validateDocumentFile', () => {
  it('accepts a valid PDF within the size limit', () => {
    const result = validateDocumentFile(buildFile());
    expect(result.valid).toBe(true);
  });

  it('accepts JPEG/PNG/WEBP images', () => {
    expect(validateDocumentFile(buildFile({ type: 'image/jpeg' })).valid).toBe(true);
    expect(validateDocumentFile(buildFile({ type: 'image/png' })).valid).toBe(true);
    expect(validateDocumentFile(buildFile({ type: 'image/webp' })).valid).toBe(true);
  });

  it('rejects a disallowed file type', () => {
    const result = validateDocumentFile(buildFile({ type: 'application/x-msdownload' }));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/JPEG, PNG, WEBP, or PDF/);
  });

  it('rejects a file over the size limit', () => {
    const result = validateDocumentFile(buildFile({ sizeBytes: 6 * 1024 * 1024 }));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/5MB/);
  });
});
