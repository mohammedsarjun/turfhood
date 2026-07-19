import type {
  IFileStorageService,
  UploadFileParams,
  UploadFileResult,
} from '../../src/domain/user/services/IFileStorageService.js';

/** In-memory stand-in for LocalFileStorageService — never touches the real filesystem. */
export class FakeFileStorageService implements IFileStorageService {
  public readonly uploadCalls: UploadFileParams[] = [];
  public readonly deleteCalls: string[] = [];

  constructor(private readonly uploadResult: UploadFileResult = { url: 'http://localhost/uploads/avatars/fake.png' }) {}

  async upload(params: UploadFileParams): Promise<UploadFileResult> {
    this.uploadCalls.push(params);
    return this.uploadResult;
  }

  async delete(url: string): Promise<void> {
    this.deleteCalls.push(url);
  }
}
