import express from 'express';
import * as controller from '../../controllers/favorites/favorites.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, controller.getAll);
router.post('/', authenticate, controller.add);
router.delete('/:itemId', authenticate, controller.remove);

export default router;
