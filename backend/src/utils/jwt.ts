import jwt from 'jsonwebtoken';
import { JWTPayload, UserRole } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const TOKEN_EXPIRY = '24h';

export const generateToken = (userId: string, email: string, role: UserRole): string => {
  return jwt.sign(
    {
      sub: userId,
      email,
      role,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { sub: userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};
