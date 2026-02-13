// src/routes/cashier.routes.js
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import pool from '../config/db.js';
import Joi from 'joi';

const router = Router();

/* --------- Accessible aux caissiers, managers et admin --------- */
router.use(authenticate, authorize('cashier', 'manager', 'admin'));

/* -------------------------------------------------------------
   1️⃣  GET /api/cashier/me   → infos du caissier connecté
   ------------------------------------------------------------- */
router.get('/me', async (req, res, next) => {
  try {
    const [[caissier]] = await pool.execute(
      `SELECT id_caissier, nom, id_supermarche FROM caissiers WHERE id_caissier = ?`,
      [req.user.sub]
    );
    if (!caissier) return res.status(404).json({ error: 'Caissier introuvable' });
    res.json({ success: true, data: caissier });
  } catch (e) {
    next(e);
  }
});

/* -------------------------------------------------------------
   2️⃣  GET /api/cashier/ventes  → historique (paginated)
   ------------------------------------------------------------- */
router.get('/ventes', async (req, res, next) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute(
      `SELECT id_vente, date_vente, heure_vente,
              montant_total, type_paiement, devise
         FROM ventes
        WHERE id_caissier = ?
        ORDER BY date_vente DESC, heure_vente DESC
        LIMIT ? OFFSET ?`,
      [req.user.sub, limit, offset]
    );

    res.json({
      success: true,
      data: rows,
      pagination: { page, limit },
    });
  } catch (e) {
    next(e);
  }
});

/* -------------------------------------------------------------
   3️⃣  GET /api/cashier/ticket-moyen
   ------------------------------------------------------------- */
router.get('/ticket-moyen', async (req, res, next) => {
  try {
    const [[{ ticket_moyen }]] = await pool.execute(
      `SELECT COALESCE(SUM(montant_total),0) / NULLIF(COUNT(*),0) AS ticket_moyen
         FROM ventes
        WHERE id_caissier = ?`,
      [req.user.sub]
    );
    res.json({ success: true, data: { ticket_moyen } });
  } catch (e) {
    next(e);
  }
});

export default router;
