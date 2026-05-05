import { Router } from 'express';
import {
  getOrCreateConversation,
  getMyConversations,
  getConversationById,
  sendMessage,
  getUnreadCount,
} from '../controllers/messagesController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/unread', getUnreadCount);
router.get('/conversations', getMyConversations);
router.post('/conversations', getOrCreateConversation);
router.get('/conversations/:id', getConversationById);
router.post('/conversations/:id', sendMessage);

export default router;
