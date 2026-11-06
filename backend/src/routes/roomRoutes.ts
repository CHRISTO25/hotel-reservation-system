import { Router } from 'express';
import { getRooms, searchAvailability, createRoomType, updateRoomType } from '../controllers/roomController';
import { authenticate, requireRole } from '../middlewares/auth';
import { UserRole } from '../types';

const router = Router();
router.get('/', getRooms);
router.get('/search', searchAvailability);
router.post('/', authenticate, requireRole([UserRole.STAFF]), createRoomType);
router.put('/:id', authenticate, requireRole([UserRole.STAFF]), updateRoomType);

export default router;