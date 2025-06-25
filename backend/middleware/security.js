import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

export const applySecurity = (app) => {
  app.use(helmet());
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Trop de requêtes, réessayez plus tard.'
  }));
};
