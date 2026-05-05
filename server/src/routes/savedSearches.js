import { Router } from 'express';
import { getMySearches, createSavedSearch, deleteSavedSearch } from '../controllers/savedSearchesController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', getMySearches);
router.post('/', createSavedSearch);
router.delete('/:id', deleteSavedSearch);

export default router;
