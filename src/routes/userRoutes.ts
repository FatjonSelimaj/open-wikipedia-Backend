import express from 'express';
import {
  register,
  login,
  updateUser,
  deleteUser,
  getUserProfile,
  changePassword
} from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/:id', updateUser);
router.delete('/:id', authenticateToken, deleteUser);
router.get('/me', authenticateToken, getUserProfile);
router.post('/change-password', authenticateToken, changePassword);

export default router;
