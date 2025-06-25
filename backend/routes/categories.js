import express from 'express';
import * as categoriesController from '../controllers/categories.controller.js';
const router = express.Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Liste des catégories
 *     responses:
 *       200:
 *         description: Liste des catégories
 *   post:
 *     summary: Créer une catégorie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Catégorie créée
 *       400:
 *         description: Erreur de validation
 *
 * /api/categories/{id}:
 *   get:
 *     summary: Récupérer une catégorie par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Catégorie trouvée
 *       404:
 *         description: Catégorie non trouvée
 *   put:
 *     summary: Modifier une catégorie
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
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Catégorie modifiée
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Catégorie non trouvée
 *   delete:
 *     summary: Supprimer une catégorie
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Catégorie supprimée
 *       404:
 *         description: Catégorie non trouvée
 */

// Routes pour les catégories
router.get('/', categoriesController.getAllCategories);
router.get('/:id', categoriesController.getCategoryById);
router.post('/', categoriesController.createCategory);
router.put('/:id', categoriesController.updateCategory);
router.delete('/:id', categoriesController.deleteCategory);

export default router;
