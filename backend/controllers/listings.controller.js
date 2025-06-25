import Listing from '../models/Listing.js';
import emailService from '../services/emailService.js';

export const getAllListings = async (req, res) => {
  const listings = await Listing.findAll();
  res.json({ success: true, data: listings });
};

export const getListingById = async (req, res) => {
  const listing = await Listing.findByPk(req.params.id);
  if (!listing) return res.status(404).json({ success: false, error: { message: 'Listing not found' } });
  res.json({ success: true, data: listing });
};

export const createListing = async (req, res) => {
  const listing = await Listing.create(req.body);
  res.status(201).json({ success: true, data: listing });
};

export const updateListing = async (req, res) => {
  const listing = await Listing.findByPk(req.params.id);
  if (!listing) return res.status(404).json({ success: false, error: { message: 'Listing not found' } });
  await listing.update(req.body);
  res.json({ success: true, data: listing });
};

export const deleteListing = async (req, res) => {
  const listing = await Listing.findByPk(req.params.id);
  if (!listing) return res.status(404).json({ success: false, error: { message: 'Listing not found' } });
  await listing.destroy();
  res.json({ success: true, message: 'Listing deleted' });
};

export const approveListing = async (req, res) => {
  const listing = await Listing.findByPk(req.params.id);
  if (!listing) return res.status(404).json({ success: false, error: { message: 'Listing not found' } });
  await listing.update({ approved: true });
  const user = {}; // Récupérer l'utilisateur associé à l'annonce
  await emailService.sendListingApprovalEmail(user, listing);
  res.json({ success: true, message: 'Annonce approuvée et email envoyé' });
};
