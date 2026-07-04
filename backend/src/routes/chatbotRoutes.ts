import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { chatbotMessage } from '../controllers/chatbotController';

const router = Router();

router.use(authenticate);

router.post('/message', chatbotMessage);

export default router;
