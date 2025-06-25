import express from 'express';
import * as controller from '../../controllers/marketplace/product.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authenticate, controller.create);
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.remove);

export default router;
