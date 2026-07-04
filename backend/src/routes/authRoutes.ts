import { Router } from 'express';
import { register, login, validateToken, registerWithToken } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/validate-token/:token', validateToken);
router.post('/register-with-token', registerWithToken);

export default router;
