import Message from '../models/Message.js';
import emailService from '../services/emailService.js';

export const getAllMessages = async (req, res) => {
  const messages = await Message.findAll();
  res.json({ success: true, data: messages });
};

export const getMessageById = async (req, res) => {
  const message = await Message.findByPk(req.params.id);
  if (!message) return res.status(404).json({ success: false, error: { message: 'Message not found' } });
  res.json({ success: true, data: message });
};

export const createMessage = async (req, res) => {
  const message = await Message.create(req.body);
  const { recipient, sender } = req.body;
  await emailService.sendNewMessageEmail(recipient, sender, message);
  res.status(201).json({ success: true, data: message });
};

export const markAsRead = async (req, res) => {
  const message = await Message.findByPk(req.params.id);
  if (!message) return res.status(404).json({ success: false, error: { message: 'Message not found' } });
  await message.update({ isRead: true });
  res.json({ success: true, data: message });
};

export const deleteMessage = async (req, res) => {
  const message = await Message.findByPk(req.params.id);
  if (!message) return res.status(404).json({ success: false, error: { message: 'Message not found' } });
  await message.destroy();
  res.json({ success: true, message: 'Message deleted' });
};
