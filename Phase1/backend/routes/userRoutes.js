import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile',  userController.getProfile);
router.patch('/profile',  userController.updateProfile);
router.get('/stats/active',  userController.getActiveUsers);
router.get('/:id', userController.getUserById);

export default router;