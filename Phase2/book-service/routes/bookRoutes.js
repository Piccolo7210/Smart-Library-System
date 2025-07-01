import express from 'express';
import {
    searchBooks,
    getBookbyID,
    createBook,
    updateBook,
    deleteBook,
    checkAvailability,
    updateAvailability,
    getPopularBooks,
    getBookStats 
} from '../controllers/bookController.js';

const router = express.Router();

router.get('/', searchBooks);
router.post('/', createBook);
router.get('/popular', getPopularBooks);  
router.get('/stats', getBookStats); 
router.get('/:id', getBookbyID);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);
router.get('/:id/availability', checkAvailability);
router.patch('/:id/availability', updateAvailability);

export default router;