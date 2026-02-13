// src/routes/sale.routes.js
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { createSale } from '../controllers/sale.controller.js';

const router = Router();
router.use(authenticate, authorize('cashier', 'manager', 'admin'));

router.post('/', createSale);   // POST /api/ventes
export default router;
