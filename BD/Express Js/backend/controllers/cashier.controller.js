// src/routes/cashier.routes.js
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import pool from '../config/db.js';
import Joi from 'joi';

/* Middleware – seules les personnes avec role "cashier" (ou supérieurs) passent */
const canAccess = [ 'cashier', 'manager', 'admin' ];   // manager / admin peuvent aussi voir leurs ventes
const router = Router();
router.use(authenticate, authorize(...canAccess));

/* ---------- 1️⃣ Profil du caissier ---------- */
router.get('/me', async (req, res, next) => {
  try {
    const [[user]] = await pool.execute(
      `SELECT id_caissier, nom, id_supermarche FROM caissiers WHERE id_caissier = ?`,
      [req.user.sub]
    );
    if (!user) return res.status(404).json({ error: 'Utilisateur inconnu' });
    res.json({ success:true, data:user });
  } catch (e) { next(e); }
});

/* ---------- 2️⃣ Historique des ventes ---------- */
router.get('/ventes', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute(
      `SELECT v.id_vente, v.date_vente, v.heure_vente,
              v.montant_total, v.type_paiement, v.devise
         FROM ventes v
        WHERE v.id_caissier = ?
        ORDER BY v.date_vente DESC, v.heure_vente DESC
        LIMIT ? OFFSET ?`,
      [req.user.sub, Number(limit), offset]
    );

    res.json({ success:true, data:rows, pagination:{page, limit} });
  } catch (e) { next(e); }
});

/* ---------- 3️⃣ Ticket moyen du caissier (optionnel) ---------- */
router.get('/ticket-moyen', async (req, res, next) => {
  try {
    const [[{ ticket_moyen }]] = await pool.execute(
      `SELECT COALESCE(SUM(montant_total),0) / NULLIF(COUNT(*),0) AS ticket_moyen
         FROM ventes
        WHERE id_caissier = ?`,
      [req.user.sub]
    );
    res.json({ success:true, data:{ ticket_moyen } });
  } catch (e) { next(e); }
});

export default router;
