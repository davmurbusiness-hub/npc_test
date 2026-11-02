import type { ApiErrorCode } from 'types/api';

export class ApiError extends Error {
  readonly code: ApiErrorCode;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

export const isApiError = (error: unknown, code?: ApiErrorCode): error is ApiError =>
  error instanceof ApiError && (code === undefined || error.code === code);
