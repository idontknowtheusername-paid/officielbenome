import express from 'express';
import { getAllProjects, getProjectById, createProject, updateProject, deleteProject } from '../controllers/project.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', authenticate, isAdmin, createProject);
router.put('/:id', authenticate, isAdmin, updateProject);
router.delete('/:id', authenticate, isAdmin, deleteProject);

export default router;
