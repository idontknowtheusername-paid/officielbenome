import Payment from '../models/Payment.js';

// Stripe
export const createStripeIntent = async (req, res) => {
  // À compléter avec stripe.paymentIntents.create
  res.json({ success: true, clientSecret: 'stripe_client_secret' });
};
export const stripeWebhook = async (req, res) => {
  // À compléter avec la logique de vérification d’événement Stripe
  res.status(200).send('ok');
};
// PayPal
export const createPaypalOrder = async (req, res) => {
  // À compléter avec la création d’une commande PayPal
  res.json({ success: true, orderId: 'paypal_order_id' });
};
export const capturePaypalOrder = async (req, res) => {
  // À compléter avec la capture d’une commande PayPal
  res.json({ success: true, status: 'COMPLETED' });
};
// PayDunya
export const initiatePaydunya = async (req, res) => {
  // À compléter avec l’appel API PayDunya
  res.json({ success: true, url: 'paydunya_payment_url' });
};
export const paydunyaCallback = async (req, res) => {
  // À compléter avec la gestion du callback PayDunya
  res.status(200).send('ok');
};

export const getAllPayments = async (req, res) => {
  const payments = await Payment.findAll();
  res.json({ success: true, data: payments });
};

export const getPaymentById = async (req, res) => {
  const payment = await Payment.findByPk(req.params.id);
  if (!payment) return res.status(404).json({ success: false, error: { message: 'Payment not found' } });
  res.json({ success: true, data: payment });
};

export const createPayment = async (req, res) => {
  const payment = await Payment.create(req.body);
  res.status(201).json({ success: true, data: payment });
};

export const updatePayment = async (req, res) => {
  const payment = await Payment.findByPk(req.params.id);
  if (!payment) return res.status(404).json({ success: false, error: { message: 'Payment not found' } });
  await payment.update(req.body);
  res.json({ success: true, data: payment });
};

export const deletePayment = async (req, res) => {
  const payment = await Payment.findByPk(req.params.id);
  if (!payment) return res.status(404).json({ success: false, error: { message: 'Payment not found' } });
  await payment.destroy();
  res.json({ success: true, message: 'Payment deleted' });
};
