import { Router } from 'express';
import { toggleFavorite, getFavoriteIds, getFavoriteListings } from '../controllers/favoritesController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getFavoriteListings);
router.get('/ids', getFavoriteIds);
router.post('/:listingId', toggleFavorite);

export default router;
