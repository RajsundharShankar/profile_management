import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { registerRules, loginRules, validate } from '../validators/userValidators.js';

const router = Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);

export default router;
