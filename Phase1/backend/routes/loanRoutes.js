import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import * as loanController from '../controllers/loanController.js';

const router = express.Router();

// Protected routes - all loan operations require authentication
router.post('/',  loanController.issueLoan);
router.post('/returns', loanController.returnBook);
router.get('/overdue',  loanController.getOverdueLoans);
router.get('/stats/overview',  loanController.getLoansOverview);
router.get('/:user_id',  loanController.getUserLoans);
router.put('/:id/extend',  loanController.extendLoan);

export default router;