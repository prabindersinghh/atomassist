import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { createError, ERROR_CODES } from '../utils/errors.js';
import { JWTPayload, UserRole } from '../types/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'No token provided',
      code: ERROR_CODES.UNAUTHORIZED,
    });
  }

  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired token',
      code: ERROR_CODES.INVALID_TOKEN,
    });
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        code: ERROR_CODES.UNAUTHORIZED,
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        code: ERROR_CODES.FORBIDDEN,
      });
    }

    next();
  };
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err.statusCode && err.message) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code || ERROR_CODES.INTERNAL_ERROR,
    });
  }

  return res.status(500).json({
    error: 'Internal server error',
    code: ERROR_CODES.INTERNAL_ERROR,
  });
};
