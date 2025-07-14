import { StatusCodes } from 'http-status-codes';
import { ValidationError } from 'sequelize';
import pkg from 'celebrate';
const { isCelebrate } = pkg;
import logger from '../config/logger.js';

/**
 * Classe de base pour les erreurs personnalisées
 */
class AppError extends Error {
  constructor(message, statusCode, code, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'APP_ERROR';
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Erreurs personnalisées
export class NotFoundError extends AppError {
  constructor(message = 'Ressource non trouvée', details = null) {
    super(message, StatusCodes.NOT_FOUND, 'NOT_FOUND', details);
  }
}

export class ValidationErrorApp extends AppError {
  constructor(message = 'Erreur de validation', details = null) {
    super(message, StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Non autorisé', details = null) {
    super(message, StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Accès refusé', details = null) {
    super(message, StatusCodes.FORBIDDEN, 'FORBIDDEN', details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflit', details = null) {
    super(message, StatusCodes.CONFLICT, 'CONFLICT', details);
  }
}

// Format d'erreur standard
const errorResponse = (error) => ({
  success: false,
  error: {
    code: error.code || 'SERVER_ERROR',
    message: error.message || 'Une erreur inattendue est survenue',
    details: error.details || null,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  },
});

/**
 * Middleware de gestion des erreurs global
 */
const errorHandler = (err, req, res, next) => {
  // Journalisation de l'erreur
  console.error('ERROR_HANDLER:', err, err?.stack);
  logger.error({
    message: err.message,
    stack: err.stack,
    name: err.name,
    code: err.code,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.id : 'non authentifié',
  });

  let error = { ...err };
  error.message = err.message;
  error.code = err.code;

  // Gestion des erreurs de validation Sequelize
  if (err instanceof ValidationError) {
    const messages = [];
    err.errors.forEach((e) => {
      messages.push({
        field: e.path,
        message: e.message,
        type: e.type,
        value: e.value,
      });
    });
    error = new ValidationErrorApp('Erreur de validation des données', messages);
  }

  // Suppression de la gestion des erreurs Celebrate (Joi)
  // if (isCelebrate(err)) {
  //   const details = [];
  //   err.details.forEach((validationError) => {
  //     validationError.details.forEach((detail) => {
  //       details.push({
  //         field: detail.context.key,
  //         message: detail.message,
  //         value: detail.context.value,
  //       });
  //     });
  //   });
  //   error = new ValidationErrorApp('Erreur de validation des données', details);
  // }

  // Gestion des erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    error = new UnauthorizedError('Jeton invalide');
  }

  if (err.name === 'TokenExpiredError') {
    error = new UnauthorizedError('Jeton expiré');
  }

  // Gestion des erreurs de contraintes de base de données
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0].path;
    error = new ConflictError(`La valeur pour le champ ${field} existe déjà`);
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = new ValidationErrorApp('Violation de contrainte de clé étrangère');
  }

  // Réponse d'erreur
  const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  
  // En production, ne pas envoyer le stack trace
  if (process.env.NODE_ENV === 'production' && !error.isOperational) {
    logger.error('Erreur critique non gérée:', error);
    error.message = 'Une erreur inattendue est survenue';
    error.details = null;
  }

  // Envoi de la réponse d'erreur
  res.status(statusCode).json(errorResponse(error));
};

export default errorHandler;
