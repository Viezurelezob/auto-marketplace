import { Router } from 'express';
import { upload, uploadImages } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, upload.array('images', 10), uploadImages);

export default router;
