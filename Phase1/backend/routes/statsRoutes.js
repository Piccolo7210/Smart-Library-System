import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import { getPopularBooks } from '../controllers/bookController.js';
import { getActiveUsers } from '../controllers/userController.js';
import { getLoansOverview } from '../controllers/loanController.js';

const router = express.Router();

// All statistics routes require authentication and admin/faculty role
router.get('/books/popular', auth, authorize('admin', 'faculty'), getPopularBooks);
router.get('/users/active', auth, authorize('admin', 'faculty'), getActiveUsers);
router.get('/overview', auth, authorize('admin', 'faculty'), getLoansOverview);

export default router;