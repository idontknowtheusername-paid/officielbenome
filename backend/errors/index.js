class ApiError extends Error {
  constructor(
    statusCode,
    message = 'Une erreur est survenue',
    errors = [],
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'Ressource non trouvée', errors = []) {
    super(404, message, errors);
  }
}

class BadRequestError extends ApiError {
  constructor(message = 'Requête invalide', errors = []) {
    super(400, message, errors);
  }
}

class UnauthorizedError extends ApiError {
  constructor(message = 'Non autorisé', errors = []) {
    super(401, message, errors);
  }
}

class ForbiddenError extends ApiError {
  constructor(message = 'Accès refusé', errors = []) {
    super(403, message, errors);
  }
}

class ValidationError extends ApiError {
  constructor(message = 'Erreur de validation', errors = []) {
    super(422, message, errors);
  }
}

class InternalServerError extends ApiError {
  constructor(message = 'Erreur interne du serveur', errors = []) {
    super(500, message, errors);
  }
}

export {
  ApiError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  InternalServerError
};
