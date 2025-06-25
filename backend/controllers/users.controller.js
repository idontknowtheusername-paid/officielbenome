import User from '../models/User.js';

export const getAllUsers = async (req, res) => {
  const users = await User.findAll();
  res.json({ success: true, data: users });
};

export const getUserById = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });
  res.json({ success: true, data: user });
};

export const updateUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });
  await user.update(req.body);
  res.json({ success: true, data: user });
};

export const deleteUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });
  await user.destroy();
  res.json({ success: true, message: 'User deleted' });
};
