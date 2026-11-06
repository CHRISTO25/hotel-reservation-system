import { Router } from 'express';
import {
  createReservation,
  getMyReservations,
  cancelReservation,
  getAllReservationsPaginated,
  updateReservationStatus,
  getDashboardSummary,
} from '../controllers/reservationController';
import { authenticate, requireRole } from '../middlewares/auth';
import { UserRole } from '../types';

const router = Router();
router.post('/', authenticate, createReservation);
router.get('/my-reservations', authenticate, getMyReservations);
router.patch('/:id/cancel', authenticate, cancelReservation);

router.get('/staff/summary', authenticate, requireRole([UserRole.STAFF]), getDashboardSummary);
router.get('/staff/all', authenticate, requireRole([UserRole.STAFF]), getAllReservationsPaginated);
router.patch('/staff/:id/status', authenticate, requireRole([UserRole.STAFF]), updateReservationStatus);

export default router;