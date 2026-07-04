import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import * as issueCtrl from '../controllers/issueController';
import { upload } from '../config/multer';

const router = Router();

router.use(authenticate);

router.post('/', requireRole('STUDENT'), upload.single('image'), issueCtrl.createIssue);
router.get('/mine', requireRole('STUDENT'), issueCtrl.getMyIssues);
router.get('/assigned', requireRole('STAFF'), issueCtrl.getAssignedIssues);
router.get('/stats', requireRole('ADMIN'), issueCtrl.getStats);
router.get('/', requireRole('ADMIN'), issueCtrl.getAllIssues);
router.get('/:id', issueCtrl.getIssueById);
router.patch('/:id/status', requireRole('STAFF'), issueCtrl.updateStatus);
router.patch('/:id/assign', requireRole('ADMIN'), issueCtrl.assignStaff);

export default router;
