import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import * as bookController from '../controllers/bookController.js';

const router = express.Router();

// Public routes
router.get('/', bookController.getBooks);
router.post('/',   bookController.addBook);
router.get('/stats/popular', bookController.getPopularBooks);
router.get('/:id', bookController.getBookById);
router.put('/:id',  bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

export default router;