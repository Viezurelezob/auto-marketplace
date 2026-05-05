import { Router } from 'express';
import {
  getListings,
  getListingById,
  getRelated,
  createListing,
  updateListing,
  deleteListing,
  markSold,
  promoteListing,
  getMyListings,
  renewListing,
  getPriceHistory,
} from '../controllers/listingsController.js';
import { createReport } from '../controllers/reportsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', getListings);
router.get('/mine', authenticate, getMyListings);
router.get('/:id', getListingById);
router.get('/:id/related', getRelated);
router.post('/', authenticate, createListing);
router.put('/:id', authenticate, updateListing);
router.delete('/:id', authenticate, deleteListing);
router.patch('/:id/sold', authenticate, markSold);
router.patch('/:id/featured', authenticate, promoteListing);
router.post('/:id/report', authenticate, createReport);
router.patch('/:id/renew', authenticate, renewListing);
router.get('/:id/price-history', getPriceHistory);

export default router;
