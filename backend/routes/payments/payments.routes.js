import express from 'express';
import * as controller from '../../controllers/payments/payments.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

// PayPal
router.post('/paypal/create-order', authenticate, controller.createPaypalOrder);
router.post('/paypal/capture-order', authenticate, controller.capturePaypalOrder);
// PayDunya
router.post('/paydunya/initiate', authenticate, controller.initiatePaydunya);
router.post('/paydunya/callback', controller.paydunyaCallback);

export default router;
