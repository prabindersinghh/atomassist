import { Router, Request, Response } from 'express';
import { chatService } from '../services/chat.service.js';
import { sessionService } from '../services/session.service.js';
import { authenticateToken } from '../middleware/auth.js';
import { ERROR_CODES } from '../utils/errors.js';

const router = Router();

router.use(authenticateToken);

// Get messages for a session
router.get('/:sessionId', async (req: Request, res: Response) => {
  try {
    const messages = await chatService.getMessages(req.params.sessionId);
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to fetch messages',
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  }
});

// Send message (via HTTP for non-real-time)
router.post('/:sessionId/messages', async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        error: 'Content required',
        code: ERROR_CODES.INVALID_INPUT,
      });
    }

    const message = await chatService.sendMessage(
      req.params.sessionId,
      req.user!.sub,
      content,
      'text'
    );

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to send message',
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  }
});

// Mark message as read
router.post('/:sessionId/messages/:messageId/read', async (req: Request, res: Response) => {
  try {
    await chatService.markMessageAsRead(req.params.messageId, req.user!.sub);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to mark message as read',
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  }
});

// Upload file
router.post('/:sessionId/files', async (req: Request, res: Response) => {
  try {
    const { filename, size, type, url, previewUrl } = req.body;

    if (!filename || !size || !type || !url) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: ERROR_CODES.INVALID_INPUT,
      });
    }

    const file = await chatService.uploadFile(
      req.params.sessionId,
      req.user!.sub,
      filename,
      size,
      type,
      url,
      previewUrl
    );

    // Also create a file message
    const message = await chatService.sendMessage(
      req.params.sessionId,
      req.user!.sub,
      filename,
      'file',
      { fileId: file.id, url }
    );

    res.status(201).json({ file, message });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to upload file',
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  }
});

// Get session files
router.get('/:sessionId/files', async (req: Request, res: Response) => {
  try {
    const files = await chatService.getSessionFiles(req.params.sessionId);
    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to fetch files',
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  }
});

export default router;
