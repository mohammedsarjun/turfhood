/** Raw JSON shape of a backend error response body. */
export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * The backend doesn't wrap successful responses in an envelope (e.g. signup
 * returns `{ user }` directly), so `ApiResponse<T>` is just an alias for the
 * resolved payload shape of a given endpoint.
 */
export type ApiResponse<T> = T;

/** Normalized error thrown by the shared Axios instance for every failed request. */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
