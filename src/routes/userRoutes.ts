import express from 'express';
import { register, login, updateUser, deleteUser, getUserProfile, changePassword } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/users/register', register);
router.post('/users/login', login);
router.put('/users/:id', updateUser);
router.delete('/users/:id', authenticateToken, deleteUser);
router.get('/users/me', authenticateToken, getUserProfile);
router.post('/users/change-password', authenticateToken, changePassword);

export default router;
