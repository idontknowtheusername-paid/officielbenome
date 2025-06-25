import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { applySecurity } from './middleware/security.js';
import errorHandler from './middleware/errorHandler.js';
import sequelize from './config/database.js';
import setupSwagger from './swagger.js';

import authRoutes from './routes/auth.routes.js';
import blogRoutes from './routes/blog.routes.js';
import projectRoutes from './routes/project.routes.js';
import contactRoutes from './routes/contact.routes.js';
import realEstateRoutes from './routes/listings/realEstate.routes.js';
import autoRoutes from './routes/listings/auto.routes.js';
import serviceRoutes from './routes/listings/service.routes.js';
import marketplaceProductRoutes from './routes/marketplace/product.routes.js';
import favoritesRoutes from './routes/favorites/favorites.routes.js';
import notificationsRoutes from './routes/notifications.js';
import searchRoutes from './routes/search/search.routes.js';
import uploadsRoutes from './routes/uploads/uploads.routes.js';
import paymentsRoutes from './routes/payments.js';
import healthRoutes from './routes/health.routes.js';
import usersRoutes from './routes/users.js';
import categoriesRoutes from './routes/categories.js';
import listingsRoutes from './routes/listings.js';
import reviewsRoutes from './routes/reviews.js';
import messagesRoutes from './routes/messages.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());
applySecurity(app);

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/real-estate/listings', realEstateRoutes);
app.use('/api/auto/listings', autoRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/marketplace/listings', marketplaceProductRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

setupSwagger(app);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => console.error('PostgreSQL connection error:', err));
