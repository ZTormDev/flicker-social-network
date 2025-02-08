import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import { auth } from '../middleware/auth';
import { getUserById } from '../controllers/userController';

const router = Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.get('/:id', auth, getUserById); // Add this line

export default router;