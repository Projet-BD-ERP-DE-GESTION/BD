// src/controllers/sale.controller.js
import pool from '../config/db.js';
import Joi from 'joi';

// Schéma de la vente
const saleSchema = Joi.object({
  id_caisse: Joi.string().required(),
  id_caissier: Joi.string().required(),
  id_client: Joi.string().allow(null),
  type_paiement: Joi.string().required(),
  devise: Joi.string().max(10).required(),
  details: Joi.array()
    .items(
      Joi.object({
        id_produit: Joi.number().integer().required(),
        quantite: Joi.number().integer().min(1).required(),
        remise: Joi.number().min(0).required(),
      })
    )
    .min(1)
    .required(),
});

/* POST /api/ventes */
export const createSale = async (req, res, next) => {
  try {
    const { error, value } = saleSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const {
      id_caisse, id_caissier, id_client, type_paiement,
      devise, details,
    } = value;

    // 1️⃣ transaction
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // génère un id unique pour la vente
      const id_vente = `V-${Date.now()}-${Math.round(Math.random()*1000)}`;

      // 2️⃣ Insert vente (montant & remise à 0, on remplira plus tard)
      await conn.execute(
        `INSERT INTO ventes
          (id_vente, date_vente, heure_vente, id_caisse, id_caissier,
           id_client, type_paiement, montant_total, remise_totale, devise)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          id_vente,
          new Date().toISOString().split('T')[0], // YYYY‑MM‑DD
          new Date().toTimeString().split(' ')[0], // HH:MM:SS
          id_caisse,
          id_caissier,
          id_client,
          type_paiement,
          0,
          0,
          devise,
        ]
      );

      let totalVente = 0;
      let totalRemise = 0;

      // 3️⃣ Parcourir les lignes de détail
      for (const d of details) {
        // → stock actuel
        const [[prod]] = await conn.execute(
          `SELECT prix_unitaire, stock FROM produits WHERE id_produit=? FOR UPDATE`,
          [d.id_produit]
        );

        if (!prod) throw new Error(`Produit ${d.id_produit} introuvable`);
        if (prod.stock < d.quantite)
          throw new Error(`Stock insuffisant pour le produit ${d.id_produit}`);

        const prix_total = prod.prix_unitaire * d.quantite - d.remise;
        totalVente += prix_total;
        totalRemise += d.remise;

        // → insérer le détail
        await conn.execute(
          `INSERT INTO vente_details
            (id_vente, id_produit, quantite, prix_unitaire, remise, prix_total)
           VALUES (?,?,?,?,?,?)`,
          [
            id_vente,
            d.id_produit,
            d.quantite,
            prod.prix_unitaire,
            d.remise,
            prix_total,
          ]
        );

        // → décrémenter le stock
        await conn.execute(
          `UPDATE produits SET stock = stock - ? WHERE id_produit=?`,
          [d.quantite, d.id_produit]
        );
      }

      // 4️⃣ Mettre à jour les totaux de la vente
      await conn.execute(
        `UPDATE ventes SET montant_total=?, remise_totale=? WHERE id_vente=?`,
        [totalVente, totalRemise, id_vente]
      );

      await conn.commit();
      res.status(201).json({ id_vente, montant_total: totalVente, remise_totale: totalRemise });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (e) {
    next(e);
  }
};
