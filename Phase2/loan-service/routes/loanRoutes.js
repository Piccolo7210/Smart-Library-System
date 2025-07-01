import express from 'express';
import { createLoan, returnBook, getUserLoanHistory, getLoanDetails, checkOverdueLoans, extendLoan, getSystemStats } from '../controllers/loanController.js';

const router = express.Router();

router.post('/', createLoan);
router.post('/returns', returnBook);
router.get('/overdue', checkOverdueLoans);
router.get('/stats/overview', getSystemStats);
router.get('/user/:user_id', getUserLoanHistory);
router.get('/:id', getLoanDetails);
router.put('/:id/extend', extendLoan);


export default router;