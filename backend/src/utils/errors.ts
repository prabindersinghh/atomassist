export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (
  statusCode: number,
  message: string,
  code?: string
): AppError => {
  return new AppError(statusCode, message, code);
};

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  INVALID_INPUT: 'INVALID_INPUT',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_TOKEN: 'INVALID_TOKEN',
  INVITE_EXPIRED: 'INVITE_EXPIRED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};
