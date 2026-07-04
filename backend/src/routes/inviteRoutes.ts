import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { createInvite, getInvites, deleteInvite } from '../controllers/inviteController';

const router = Router();

// All invite routes require authentication + ADMIN role
router.use(authenticate, requireRole('ADMIN'));

router.post('/', createInvite);
router.get('/', getInvites);
router.delete('/:id', deleteInvite);

export default router;
