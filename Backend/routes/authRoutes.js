import express from 'express';
import { login, register, verifyToken, logout } from '../controllers/authController.js';
import { authenticateToken } from '../utils/jwt.js';
import { validateRequest } from '../middlewares/validationMiddleware.js';
import { loginSchema, registerSchema } from '../validators/authSchemas.js';

const router = express.Router();

// Public routes 
router.post('/login', validateRequest(loginSchema), login);
router.post('/register', validateRequest(registerSchema), register);

// Protected routes 
router.get('/verify', authenticateToken, verifyToken);
router.post('/logout', authenticateToken, logout);

export default router;