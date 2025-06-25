import Review from '../models/Review.js';

export const getAllReviews = async (req, res) => {
  const reviews = await Review.findAll();
  res.json({ success: true, data: reviews });
};

export const getReviewById = async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) return res.status(404).json({ success: false, error: { message: 'Review not found' } });
  res.json({ success: true, data: review });
};

export const createReview = async (req, res) => {
  const review = await Review.create(req.body);
  res.status(201).json({ success: true, data: review });
};

export const updateReview = async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) return res.status(404).json({ success: false, error: { message: 'Review not found' } });
  await review.update(req.body);
  res.json({ success: true, data: review });
};

export const deleteReview = async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) return res.status(404).json({ success: false, error: { message: 'Review not found' } });
  await review.destroy();
  res.json({ success: true, message: 'Review deleted' });
};
