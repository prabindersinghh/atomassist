import { Router, Request, Response } from 'express';
import { userService } from '../services/user.service.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import { ERROR_CODES } from '../utils/errors.js';

const router = Router();

interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

router.post('/signup', async (req: Request<{}, {}, SignupRequest>, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: ERROR_CODES.INVALID_INPUT,
      });
    }

    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        code: 'USER_EXISTS',
      });
    }

    const user = await userService.createUser(email, password, name, 'customer');

    const token = generateToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Signup failed',
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  }
});

router.post('/login', async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password required',
        code: ERROR_CODES.INVALID_INPUT,
      });
    }

    const user = await userService.verifyPassword(email, password);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: ERROR_CODES.UNAUTHORIZED,
      });
    }

    const token = generateToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Login failed',
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  }
});

export default router;
