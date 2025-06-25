import Category from '../models/Category.js';

export const getAllCategories = async (req, res) => {
  const categories = await Category.findAll();
  res.json({ success: true, data: categories });
};

export const getCategoryById = async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ success: false, error: { message: 'Category not found' } });
  res.json({ success: true, data: category });
};

export const createCategory = async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
};

export const updateCategory = async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ success: false, error: { message: 'Category not found' } });
  await category.update(req.body);
  res.json({ success: true, data: category });
};

export const deleteCategory = async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ success: false, error: { message: 'Category not found' } });
  await category.destroy();
  res.json({ success: true, message: 'Category deleted' });
};
