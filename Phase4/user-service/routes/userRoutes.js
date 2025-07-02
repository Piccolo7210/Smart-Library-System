import express from 'express';
import {
    getUser,
    updateUser,
    deleteUser,
    getActiveUsers,
    getUserCount,
    registerUser
} from '../controllers/userController.js';

const router = express.Router();
router.post('/', registerUser);
router.get('/count', getUserCount);
router.get('/stats/active', getActiveUsers);  
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;