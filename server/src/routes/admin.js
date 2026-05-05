import { Router } from 'express';
import {
  getAllListings,
  getAllUsers,
  setListingStatus,
  setListingPremium,
  adminDeleteListing,
  getStats,
} from '../controllers/adminController.js';
import { getReports } from '../controllers/reportsController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', getStats);
router.get('/listings', getAllListings);
router.get('/users', getAllUsers);
router.patch('/listings/:id/status', setListingStatus);
router.patch('/listings/:id/premium', setListingPremium);
router.delete('/listings/:id', adminDeleteListing);
router.get('/reports', getReports);

export default router;
