import express from 'express';
import * as controller from '../../controllers/search/search.controller.js';

const router = express.Router();

router.get('/', controller.globalSearch);

export default router;
