import { Router } from 'express';
import { getPublicSeller } from '../controllers/sellersController.js';
import { getSellerReviews, createReview } from '../controllers/reviewsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/:id', getPublicSeller);
router.get('/:id/reviews', getSellerReviews);
router.post('/:id/reviews', authenticate, createReview);

export default router;
