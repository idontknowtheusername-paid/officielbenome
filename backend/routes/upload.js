import express from 'express';
import * as uploadController from '../controllers/upload.controller.js';
import { uploadCloud } from '../middleware/cloudinary.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/upload:
 *   get:
 *     summary: Liste des fichiers uploadés
 *     responses:
 *       200:
 *         description: Liste des fichiers
 *   post:
 *     summary: Uploader un fichier
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Fichier uploadé
 *       400:
 *         description: Erreur d'upload
 *
 * /api/upload/{id}:
 *   get:
 *     summary: Récupérer un fichier uploadé par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Fichier trouvé
 *       404:
 *         description: Fichier non trouvé
 *   delete:
 *     summary: Supprimer un fichier uploadé
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Fichier supprimé
 *       404:
 *         description: Fichier non trouvé
 *
 * /api/upload/image:
 *   post:
 *     summary: Uploader une image (Cloudinary)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploadée
 *       400:
 *         description: Erreur d'upload
 *
 * /api/upload/images:
 *   post:
 *     summary: Uploader plusieurs images (Cloudinary)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploadées
 *       400:
 *         description: Erreur d'upload
 *
 * /api/upload/image/{publicId}:
 *   delete:
 *     summary: Supprimer une image (Cloudinary)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Image supprimée
 *       404:
 *         description: Image non trouvée
 */

// Routes CRUD pour Upload
router.get('/', uploadController.getAllUploads);
router.get('/:id', uploadController.getUploadById);
router.post('/', uploadCloud.single('file'), uploadController.createUpload);
router.delete('/:id', uploadController.deleteUpload);

// Cloudinary image upload endpoints
router.post('/image', authenticate, uploadCloud.single('image'), uploadController.uploadSingleImage);
router.post('/images', authenticate, uploadCloud.array('images', 10), uploadController.uploadMultipleImages);
router.delete('/image/:publicId', authenticate, uploadController.deleteImageByPublicId);

export default router;
