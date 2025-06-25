import Upload from '../models/Upload.js';
import { v2 as cloudinary } from 'cloudinary';

export const getAllUploads = async (req, res) => {
  const uploads = await Upload.findAll();
  res.json({ success: true, data: uploads });
};

export const getUploadById = async (req, res) => {
  const upload = await Upload.findByPk(req.params.id);
  if (!upload) return res.status(404).json({ success: false, error: { message: 'Upload not found' } });
  res.json({ success: true, data: upload });
};

export const createUpload = async (req, res) => {
  const upload = await Upload.create(req.body);
  res.status(201).json({ success: true, data: upload });
};

export const deleteUpload = async (req, res) => {
  const upload = await Upload.findByPk(req.params.id);
  if (!upload) return res.status(404).json({ success: false, error: { message: 'Upload not found' } });
  await upload.destroy();
  res.json({ success: true, message: 'Upload deleted' });
};

export const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ success: false, error: { message: 'Aucune image fournie.' } });
    }
    return res.status(200).json({
      success: true,
      data: {
        url: req.file.path,
        public_id: req.file.filename,
        originalname: req.file.originalname,
      },
      message: 'Image uploadée avec succès.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'Aucune image fournie.' } });
    }
    const images = req.files.map(file => ({
      url: file.path,
      public_id: file.filename,
      originalname: file.originalname,
    }));
    return res.status(200).json({
      success: true,
      data: images,
      message: 'Images uploadées avec succès.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const deleteImageByPublicId = async (req, res) => {
  try {
    const { publicId } = req.params;
    if (!publicId) {
      return res.status(400).json({ success: false, error: { message: 'publicId requis.' } });
    }
    const result = await cloudinary.uploader.destroy(`benome_uploads/${publicId}`);
    if (result.result !== 'ok' && result.result !== 'not found') {
      return res.status(500).json({ success: false, error: { message: 'Erreur lors de la suppression de l\'image.' } });
    }
    return res.status(200).json({ success: true, message: 'Image supprimée.' });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};
