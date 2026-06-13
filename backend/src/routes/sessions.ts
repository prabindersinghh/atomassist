import { Router, Request, Response } from 'express';
import { sessionService } from '../services/session.service.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { generateLiveKitToken, getLiveKitURL } from '../config/livekit.js';
import { ERROR_CODES } from '../utils/errors.js';

const router = Router();

router.use(authenticateToken);

// Create a new session (agents only)
router.post('/', requireRole('agent'), async (req: Request, res: Response) => {
  try {
    const session = await sessionService.createSession(req.user!.sub);
    const inviteToken = await sessionService.createInviteToken(session.id);

    res.status(201).json({
      session,
      inviteToken,
      inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join?code=${inviteToken}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to create session',
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  }
});

// Get agent's sessions
router.get('/agent', requireRole('agent'), async (req: Request, res: Response) => {
  try {
    const sessions = await sessionService.getSessionsByAgent(req.user!.sub);
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to fetch sessions',
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  }
});

// Get single session
router.get('/:sessionId', async (req: Request, res: Response) => {
  try {
    const session = await sessionService.getSession(req.params.sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        code: ERROR_CODES.SESSION_NOT_FOUND,
      });
    }

    const participants = await sessionService.getParticipants(session.id);

    res.json({
      session,
      participants,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to fetch session',
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  }
});

// Join session with invite token
router.post('/join/:inviteToken', async (req: Request, res: Response) => {
  try {
    const sessionId = await sessionService.validateInviteToken(req.params.inviteToken);
    if (!sessionId) {
      return res.status(401).json({
        error: 'Invalid or expired invite token',
        code: ERROR_CODES.INVITE_EXPIRED,
      });
    }

    const session = await sessionService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        code: ERROR_CODES.SESSION_NOT_FOUND,
      });
    }

    // Add participant
    const participant = await sessionService.addParticipant(sessionId, req.user!.sub, 'customer');

    // Generate LiveKit token (async in v2.x)
    const liveKitToken = await generateLiveKitToken(
      sessionId,
      req.user!.email,
      req.user!.sub
    );

    // Activate session if not already active
    if (session.status === 'pending') {
      await sessionService.updateSessionStatus(sessionId, 'active');
    }

    res.json({
      session,
      participant,
      liveKitToken,
      liveKitUrl: getLiveKitURL(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to join session',
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  }
});

// Start session (for agent)
router.post('/:sessionId/start', requireRole('agent'), async (req: Request, res: Response) => {
  try {
    const session = await sessionService.getSession(req.params.sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        code: ERROR_CODES.SESSION_NOT_FOUND,
      });
    }

    if (session.agent_id !== req.user!.sub) {
      return res.status(403).json({
        error: 'Unauthorized',
        code: ERROR_CODES.FORBIDDEN,
      });
    }

    const updated = await sessionService.updateSessionStatus(req.params.sessionId, 'active');

    // Generate LiveKit token for agent (async in v2.x)
    const liveKitToken = await generateLiveKitToken(
      session.id,
      req.user!.email,
      req.user!.sub
    );

    res.json({
      session: updated,
      liveKitToken,
      liveKitUrl: getLiveKitURL(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to start session',
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  }
});

// End session (for agent)
router.post('/:sessionId/end', requireRole('agent', 'admin'), async (req: Request, res: Response) => {
  try {
    const session = await sessionService.getSession(req.params.sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        code: ERROR_CODES.SESSION_NOT_FOUND,
      });
    }

    if (req.user!.role === 'agent' && session.agent_id !== req.user!.sub) {
      return res.status(403).json({
        error: 'Unauthorized',
        code: ERROR_CODES.FORBIDDEN,
      });
    }

    const updated = await sessionService.endSession(req.params.sessionId);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to end session',
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  }
});

// Get all active sessions (admin)
router.get('/', requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const sessions = await sessionService.getActiveSessions();
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to fetch sessions',
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  }
});

export default router;
