import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import {
  addComment,
  getComments,
  deleteComment,
  getIssueLogs,
} from '../controllers/commentController';

const router = Router();

router.use(authenticate);

// Comments on an issue
router.post('/issues/:id/comments', addComment);
router.get('/issues/:id/comments', getComments);

// Issue audit log / timeline
router.get('/issues/:id/logs', getIssueLogs);

// Delete a specific comment (author only — enforced in service)
router.delete('/comments/:id', deleteComment);

export default router;
