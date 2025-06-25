import express from 'express';
import * as controller from '../../controllers/uploads/uploads.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

router.post('/images', authenticate, controller.uploadImage);

export default router;
