import { Router } from 'express';
import { createCheckoutSession } from '../controllers/paymentsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Webhook is registered in index.js (needs raw body)
router.post('/create-checkout', authenticate, createCheckoutSession);

export default router;
