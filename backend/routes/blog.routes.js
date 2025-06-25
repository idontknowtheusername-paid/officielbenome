import express from 'express';
import { getAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog } from '../controllers/blog.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.post('/', authenticate, isAdmin, createBlog);
router.put('/:id', authenticate, isAdmin, updateBlog);
router.delete('/:id', authenticate, isAdmin, deleteBlog);

export default router;
