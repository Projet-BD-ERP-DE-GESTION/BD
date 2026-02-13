// src/routes/manager.routes.js
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  createProduct, updateProduct, deleteProduct,
  createCashier, updateCashier, deleteCashier,
  createRegister, deleteRegister,
} from '../controllers/manager.controller.js';

const router = Router();
router.use(authenticate, authorize('manager', 'admin'));   // toutes les routes ci‑dessous

/* PRODUITS */
router.post('/produits', createProduct);
router.put('/produits/:id', updateProduct);
router.delete('/produits/:id', deleteProduct);

/* CAISSIERS */
router.post('/caissiers', createCashier);
router.put('/caissiers/:id', updateCashier);
router.delete('/caissiers/:id', deleteCashier);

/* CAISSES */
router.post('/caisses', createRegister);
router.delete('/caisses/:id', deleteRegister);

export default router;
