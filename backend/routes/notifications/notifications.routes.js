import express from 'express';
import * as controller from '../../controllers/notifications/notifications.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, controller.getAll);
router.put('/:notificationId/read', authenticate, controller.markAsRead);

export default router;
