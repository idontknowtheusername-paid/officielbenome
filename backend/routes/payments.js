import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';
import * as paymentsController from '../controllers/payments.controller.js';

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Récupère tous les paiements (authentifié)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des paiements
 *   post:
 *     summary: Crée un paiement (authentifié)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               provider:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paiement créé
 *       400:
 *         description: Erreur de validation
 *
 * /api/payments/{id}:
 *   get:
 *     summary: Récupérer un paiement par ID (authentifié)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paiement trouvé
 *       404:
 *         description: Paiement non trouvé
 *   put:
 *     summary: Modifier un paiement (authentifié)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               details:
 *                 type: object
 *     responses:
 *       200:
 *         description: Paiement modifié
 *       404:
 *         description: Paiement non trouvé
 *   delete:
 *     summary: Supprimer un paiement (authentifié)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paiement supprimé
 *       404:
 *         description: Paiement non trouvé
 *
 * /api/payments/stripe/create-intent:
 *   post:
 *     summary: Créer un paiement Stripe (authentifié)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Intent Stripe créé
 *
 * /api/payments/stripe/webhook:
 *   post:
 *     summary: Webhook Stripe
 *     responses:
 *       200:
 *         description: Webhook Stripe reçu
 *
 * /api/payments/paypal/create-order:
 *   post:
 *     summary: Créer une commande PayPal (authentifié)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Commande PayPal créée
 *
 * /api/payments/paypal/capture-order:
 *   post:
 *     summary: Capturer une commande PayPal (authentifié)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Commande PayPal capturée
 *
 * /api/payments/paydunya/initiate:
 *   post:
 *     summary: Initier un paiement PayDunya (authentifié)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paiement PayDunya initié
 *
 * /api/payments/paydunya/callback:
 *   post:
 *     summary: Callback PayDunya
 *     responses:
 *       200:
 *         description: Callback PayDunya reçu
 * /api/payments/initiate:
 *   post:
 *     summary: Initier un paiement (Stripe, PayPal, PayDunya)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               listingId:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               paymentGateway:
 *                 type: string
 *     responses:
 *       200:
 *         description: Paiement initié (URL de redirection ou message)
 *       400:
 *         description: Erreur de validation ou gateway invalide
 *       404:
 *         description: Annonce non trouvée
 */

const router = express.Router();

router.get('/', authenticate, paymentsController.getAllPayments);
router.get('/:id', authenticate, paymentsController.getPaymentById);
router.post('/', authenticate, validate([
  body('amount').isFloat({ min: 0.01 }).withMessage('Montant requis'),
  body('currency').notEmpty().withMessage('Devise requise'),
  body('provider').notEmpty().withMessage('Fournisseur requis')
]), paymentsController.createPayment);
router.put('/:id', authenticate, validate([
  body('status').optional().isString(),
  body('details').optional().isObject()
]), paymentsController.updatePayment);
router.delete('/:id', authenticate, paymentsController.deletePayment);
router.post('/stripe/create-intent', authenticate, paymentsController.createStripeIntent);
router.post('/stripe/webhook', express.raw({type: 'application/json'}), paymentsController.stripeWebhook);
router.post('/paypal/create-order', authenticate, paymentsController.createPaypalOrder);
router.post('/paypal/capture-order', authenticate, paymentsController.capturePaypalOrder);
router.post('/paydunya/initiate', authenticate, paymentsController.initiatePaydunya);
router.post('/paydunya/callback', paymentsController.paydunyaCallback);
router.post('/initiate', authenticate, async (req, res) => {
  try {
    const { listingId, amount, currency = 'XOF', paymentGateway } = req.body;
    // Validate listing
    const listingResult = await db.query(
      'SELECT id, user_id, title, price FROM listings WHERE id = $1 AND status = $2',
      [listingId, 'ACTIVE']
    );
    if (listingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    const listing = listingResult.rows[0];
    // Create transaction record
    const transactionResult = await db.query(`
      INSERT INTO transactions (listing_id, buyer_id, seller_id, amount, currency, payment_gateway, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
      RETURNING id
    `, [listingId, req.user.id, listing.user_id, amount, currency, paymentGateway]);
    const transactionId = transactionResult.rows[0].id;
    if (paymentGateway === 'STRIPE') {
      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: currency.toLowerCase(),
            product_data: { name: listing.title },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&transaction_id=${transactionId}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel?transaction_id=${transactionId}`,
        metadata: { transaction_id: transactionId, listing_id: listingId }
      });
      await db.query(
        'UPDATE transactions SET payment_gateway_transaction_id = $1 WHERE id = $2',
        [session.id, transactionId]
      );
      res.json({ url: session.url, sessionId: session.id, transactionId });
    } else if (paymentGateway === 'PAYPAL') {
      const create_payment_json = {
        intent: 'sale',
        payer: { payment_method: 'paypal' },
        redirect_urls: {
          return_url: `${process.env.FRONTEND_URL}/payment/paypal/success?transaction_id=${transactionId}`,
          cancel_url: `${process.env.FRONTEND_URL}/payment/cancel?transaction_id=${transactionId}`
        },
        transactions: [{
          item_list: {
            items: [{
              name: listing.title,
              sku: listingId,
              price: amount.toString(),
              currency: currency,
              quantity: 1
            }]
          },
          amount: { currency: currency, total: amount.toString() },
          description: `Payment for ${listing.title}`
        }]
      };
      paypal.payment.create(create_payment_json, async (error, payment) => {
        if (error) {
          console.error('PayPal error:', error);
          return res.status(500).json({ message: 'PayPal payment creation failed' });
        }
        await db.query(
          'UPDATE transactions SET payment_gateway_transaction_id = $1 WHERE id = $2',
          [payment.id, transactionId]
        );
        const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
        res.json({ url: approvalUrl, paymentId: payment.id, transactionId });
      });
    } else if (paymentGateway === 'PAYDUNYA') {
      res.json({ message: 'PayDunya integration not implemented yet', transactionId });
    } else {
      return res.status(400).json({ message: 'Invalid payment gateway' });
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;