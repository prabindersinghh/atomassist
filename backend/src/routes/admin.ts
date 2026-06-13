import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { sessionService } from '../services/session.service.js';
import { analyticsService } from '../services/analytics.service.js';
import { ERROR_CODES } from '../utils/errors.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole('admin'));

// Get all active sessions
router.get('/sessions/active', async (req: Request, res: Response) => {
  try {
    const sessions = await sessionService.getActiveSessions();
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to fetch active sessions',
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  }
});

// Get all sessions with pagination
router.get('/sessions', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    // This would need additional pagination implementation in SessionService
    const sessions = await sessionService.getActiveSessions();
    res.json({
      sessions: sessions.slice(offset, offset + limit),
      total: sessions.length,
      page,
      limit,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to fetch sessions',
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  }
});

// Get session details with participants
router.get('/sessions/:sessionId', async (req: Request, res: Response) => {
  try {
    const session = await sessionService.getSession(req.params.sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        code: ERROR_CODES.SESSION_NOT_FOUND,
      });
    }

    const participants = await sessionService.getParticipants(req.params.sessionId);

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

// End session (admin override)
router.post('/sessions/:sessionId/end', async (req: Request, res: Response) => {
  try {
    const updated = await sessionService.endSession(req.params.sessionId);
    await analyticsService.logAudit(
      'SESSION_ENDED_ADMIN',
      req.user!.sub,
      'SESSION',
      req.params.sessionId
    );
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to end session',
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  }
});

// Get system metrics
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const stats = await analyticsService.getSessionStats();

    const metrics = {
      activeSessions: stats.activeSessions,
      totalSessions: stats.totalSessions,
      averageSessionDuration: stats.avgDuration,
      recordingCount: stats.recordingCount,
      timestamp: new Date().toISOString(),
    };

    res.json(metrics);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to fetch metrics',
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  }
});

// Get audit logs
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = await analyticsService.getAuditLogs(undefined, limit);
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to fetch logs',
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  }
});

// Get session logs
router.get('/logs/session/:sessionId', async (req: Request, res: Response) => {
  try {
    const logs = await analyticsService.getAuditLogs(req.params.sessionId);
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to fetch session logs',
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  }
});

export default router;
