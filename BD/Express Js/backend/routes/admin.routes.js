// src/routes/admin.routes.js
import { Router } from 'express';
import { authenticate, authorize } from './../middlewares/auth.js';
import * as ctrl from './../controllers/analytics.controller.js';

const router = Router();

router.use(authenticate, authorize('admin'));

/* Global */
router.get('/revenue/total',            ctrl.getTotalRevenue);
router.get('/sales/count',              ctrl.getTotalSalesCount);
router.get('/ticket/average',           ctrl.getAverageTicket);
router.get('/discount/total',           ctrl.getTotalDiscount);
router.get('/revenue/by-payment',       ctrl.getRevenueByPayment);

/* ... (toutes les autres routes du fichier analytics.js) ... */

export default router;
