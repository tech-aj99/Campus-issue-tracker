import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/authMiddleware';
import { analyzeIssueHandler, checkDuplicateHandler, analyzeImageHandler } from '../controllers/aiController';

const router = Router();
// Store image in memory as Buffer (no disk writes needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

router.use(authenticate);

router.post('/analyze-issue', analyzeIssueHandler);
router.post('/check-duplicate', checkDuplicateHandler);
router.post('/analyze-image', upload.single('image'), analyzeImageHandler);

export default router;
