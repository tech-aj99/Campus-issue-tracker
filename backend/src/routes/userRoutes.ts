import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { getStaffList } from '../controllers/userController';

const router = Router();

router.get('/staff', authenticate, requireRole('ADMIN'), getStaffList);

export default router;
