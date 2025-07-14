import { StatusCodes } from 'http-status-codes';
import Contact from '../models/Contact.js';
import logger from '../config/logger.js';

export const sendMessage = async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Message envoyé avec succès',
      data: contact
    });
  } catch (err) {
    logger.error('Erreur lors de l\'envoi du message:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de l\'envoi du message'
      }
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Contact.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: messages
    });
  } catch (err) {
    logger.error('Erreur lors de la récupération des messages:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la récupération des messages'
      }
    });
  }
};
