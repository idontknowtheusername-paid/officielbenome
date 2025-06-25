import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const { combine, timestamp, printf, colorize, align } = winston.format;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Niveaux de log personnalisés
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  sql: 5,
};

// Couleurs pour chaque niveau de log
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
  sql: 'cyan',
};

// Configuration des transports
const transports = [
  // Fichier d'erreurs
  new winston.transports.DailyRotateFile({
    level: 'error',
    filename: path.join(__dirname, '../logs/error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
  
  // Fichier de logs combinés
  new winston.transports.DailyRotateFile({
    filename: path.join(__dirname, '../logs/combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
];

// Si nous ne sommes pas en production, on ajoute aussi la console
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({
          format: 'YYYY-MM-DD hh:mm:ss.SSS A',
        }),
        align(),
        printf(
          (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
        )
      ),
    })
  );
}

// Création du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'officielbenome-backend' },
  transports,
  exitOnError: false, // Ne pas s'arrêter en cas d'exception non gérée
});

// Ajout des couleurs
winston.addColors(colors);

// Stream pour les requêtes HTTP (utilisé par Morgan)
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Gestion des exceptions non gérées
if (process.env.NODE_ENV === 'production') {
  logger.exceptions.handle(
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/exceptions.log'),
      handleExceptions: true,
      handleRejections: true,
    })
  );
}

export default logger;
