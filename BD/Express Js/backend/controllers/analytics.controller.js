// src/controllers/analytics.controller.js
import pool from '../config/db.js';

/* -----------------------------------------------------------------
   1️⃣ Indicateurs globaux
   ----------------------------------------------------------------- */
// 1 – Chiffre d’affaires total (Montant_Total)
export const getTotalRevenue = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT COALESCE(SUM(montant_total),0) AS chiffre_affaires_total
      FROM ventes;
    `);
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
};

// 2 – Nombre total de ventes
export const getTotalSalesCount = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT COUNT(*) AS nb_ventes FROM ventes;
    `);
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
};

// 3 – Panier moyen par vente
export const getAverageTicket = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        COALESCE(SUM(montant_total),0) / NULLIF(COUNT(*),0) AS panier_moyen
      FROM ventes;
    `);
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
};

// 4 – Remise totale appliquée
export const getTotalDiscount = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT COALESCE(SUM(remise_totale),0) AS remise_totale
      FROM ventes;
    `);
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
};

// 5 – Répartition du CA par type de paiement
export const getRevenueByPayment = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        type_paiement,
        COALESCE(SUM(montant_total),0) AS chiffre_affaires
      FROM ventes
      GROUP BY type_paiement;
    `);
    res.json(rows);
  } catch (e) {
    next(e);
  }
};

/* -----------------------------------------------------------------
   2️⃣ Supermarché & Quartier
   ----------------------------------------------------------------- */
// 6 – Supermarché générant le CA le plus élevé
export const getTopStoreByRevenue = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        sm.nom AS supermarche,
        sm.quartier,
        COALESCE(SUM(v.montant_total),0) AS chiffre_affaires
      FROM ventes v
      JOIN caisses c           ON v.id_caisse   = c.id_caisse
      JOIN supermarches sm    ON c.id_supermarche = sm.id_supermarche
      GROUP BY sm.id_supermarche
      ORDER BY chiffre_affaires DESC
      LIMIT 1;
    `);
    res.json(rows[0] || {});
  } catch (e) {
    next(e);
  }
};

// 7 – Quartier avec le plus grand nombre de ventes
export const getTopQuartierBySales = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        sm.quartier,
        COUNT(*) AS nb_ventes
      FROM ventes v
      JOIN caisses c           ON v.id_caisse   = c.id_caisse
      JOIN supermarches sm    ON c.id_supermarche = sm.id_supermarche
      GROUP BY sm.quartier
      ORDER BY nb_ventes DESC
      LIMIT 1;
    `);
    res.json(rows[0] || {});
  } catch (e) {
    next(e);
  }
};

// 8 – Panier moyen par supermarché
export const getAverageTicketByStore = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        sm.nom AS supermarche,
        COALESCE(SUM(v.montant_total),0) / NULLIF(COUNT(v.id_vente),0) AS panier_moyen
      FROM ventes v
      JOIN caisses c        ON v.id_caisse = c.id_caisse
      JOIN supermarches sm  ON c.id_supermarche = sm.id_supermarche
      GROUP BY sm.id_supermarche
      ORDER BY panier_moyen DESC;
    `);
    res.json(rows);
  } catch (e) {
    next(e);
  }
};

// 9 – Heure de pointe par supermarché
export const getPeakHourByStore = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        sm.nom AS supermarche,
        SUBSTRING(v.heure_vente,1,2) AS heure,
        COUNT(*) AS nb_ventes
      FROM ventes v
      JOIN caisses c        ON v.id_caisse = c.id_caisse
      JOIN supermarches sm  ON c.id_supermarche = sm.id_supermarche
      GROUP BY sm.id_supermarche, heure
      ORDER BY sm.nom, nb_ventes DESC;
    `);
    // On garde uniquement la première ligne (heure de pointe) pour chaque magasin
    const result = [];
    const map = new Map();
    rows.forEach(r => {
      if (!map.has(r.supermarche)) {
        map.set(r.supermarche, true);
        result.push(r);
      }
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
};

// 10 – Remise moyenne par supermarché
export const getAverageDiscountByStore = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        sm.nom AS supermarche,
        COALESCE(AVG(v.remise_totale),0) AS remise_moyenne
      FROM ventes v
      JOIN caisses c        ON v.id_caisse = c.id_caisse
      JOIN supermarches sm  ON c.id_supermarche = sm.id_supermarche
      GROUP BY sm.id_supermarche;
    `);
    res.json(rows);
  } catch (e) {
    next(e);
  }
};

/* -----------------------------------------------------------------
   3️⃣ Catégories & Produits
   ----------------------------------------------------------------- */
// 11 – CA total par catégorie
export const getRevenueByCategory = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        cat.nom AS categorie,
        COALESCE(SUM(vd.prix_total),0) AS chiffre_affaires
      FROM vente_details vd
      JOIN produits p          ON vd.id_produit = p.id_produit
      JOIN categories cat      ON p.id_categorie = cat.id_categorie
      GROUP BY cat.id_categorie
      ORDER BY chiffre_affaires DESC;
    `);
    res.json(rows);
  } catch (e) {
    next(e);
  }
};

// 12 – Top 10 produits par quantité vendue
export const getTopProductsByQuantity = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        p.nom AS produit,
        SUM(vd.quantite) AS quantite_totale
      FROM vente_details vd
      JOIN produits p ON vd.id_produit = p.id_produit
      GROUP BY p.id_produit
      ORDER BY quantite_totale DESC
      LIMIT 10;
    `);
    res.json(rows);
  } catch (e) {
    next(e);
  }
};

// 13 – Top 10 produits par chiffre d’affaires
export const getTopProductsByRevenue = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        p.nom AS produit,
        COALESCE(SUM(vd.prix_total),0) AS chiffre_affaires
      FROM vente_details vd
      JOIN produits p ON vd.id_produit = p.id_produit
      GROUP BY p.id_produit
      ORDER BY chiffre_affaires DESC
      LIMIT 10;
    `);
    res.json(rows);
  } catch (e) {
    next(e);
  }
};

// 14 – Prix unitaire moyen par catégorie
export const getAvgUnitPriceByCategory = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        cat.nom AS categorie,
        AVG(p.prix_unitaire) AS prix_unitaire_moyen
      FROM produits p
      JOIN categories cat ON p.id_categorie = cat.id_categorie
      GROUP BY cat.id_categorie;
    `);
    res.json(rows);
  } catch (e) {
    next(e);
  }
};

// 15 – Produits qui ont généré le plus de remises (somme remise)
export const getProductsWithHighestDiscount = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        p.nom AS produit,
        SUM(vd.remise) AS remise_totale
      FROM vente_details vd
      JOIN produits p ON vd.id_produit = p.id_produit
      GROUP BY p.id_produit
      HAVING remise_totale > 0
      ORDER BY remise_totale DESC
      LIMIT 10;
    `);
    res.json(rows);
  } catch (e) {
    next(e);
  }
};

/* -----------------------------------------------------------------
   4️⃣ Caissiers & Caisses
   ----------------------------------------------------------------- */
// 16 – Caissier avec le plus grand nombre de ventes
export const getTopCashierBySales = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        ca.id_caissier,
        COUNT(v.id_vente) AS nb_ventes
      FROM ventes v
      JOIN caissiers ca ON v.id_caissier = ca.id_caissier
      GROUP BY ca.id_caissier
      ORDER BY nb_ventes DESC
      LIMIT 1;
    `);
    res.json(rows[0] || {});
  } catch (e) {
    next(e);
  }
};

// 17 – Caisse qui a traité le plus de ventes
export const getTopRegisterBySales = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        c.id_caisse,
        COUNT(v.id_vente) AS nb_ventes
      FROM ventes v
      JOIN caisses c ON v.id_caisse = c.id_caisse
      GROUP BY c.id_caisse
      ORDER BY nb_ventes DESC
      LIMIT 1;
    `);
    res.json(rows[0] || {});
  } catch (e) {
    next(e);
  }
};

// 18 – Panier moyen par caissier
export const getAverageTicketByCashier = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        ca.id_caissier,
        COALESCE(SUM(v.montant_total),0) / NULLIF(COUNT(v.id_vente),0) AS panier_moyen
      FROM ventes v
      JOIN caissiers ca ON v.id_caissier = ca.id_caissier
      GROUP BY ca.id_caissier
      ORDER BY panier_moyen DESC;
    `);
    res.json(rows);
  } catch (e) {
    next(e);
  }
};

// 19 – Caissiers qui appliquent des remises supérieures à la moyenne globale
export const getCashiersAboveAvgDiscount = async (req, res, next) => {
  try {
    // 1️⃣ Calcul de la remise moyenne globale
    const [[{ moyenne_remise }]] = await pool.execute(`
      SELECT AVG(remise_totale) AS moyenne_remise FROM ventes;
    `);

    // 2️⃣ Sélection des caissiers avec remise moyenne > moyenne globale
    const [rows] = await pool.execute(`
      SELECT 
        ca.id_caissier,
        AVG(v.remise_totale) AS remise_moyenne
      FROM ventes v
      JOIN caissiers ca ON v.id_caissier = ca.id_caissier
      GROUP BY ca.id_caissier
      HAVING remise_moyenne > ?
      ORDER BY remise_moyenne DESC;
    `, [moyenne_remise]);

    res.json({ moyenne_globale: moyenne_remise, caissiers: rows });
  } catch (e) {
    next(e);
  }
};

/* -----------------------------------------------------------------
   5️⃣ Analyse temporelle
   ----------------------------------------------------------------- */
// 20 – Nombre de ventes par heure
export const getSalesPerHour = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        SUBSTRING(heure_vente,1,2) AS heure,
        COUNT(*) AS nb_ventes
      FROM ventes
      GROUP BY heure
      ORDER BY heure;
    `);
    res.json(rows);
  } catch (e) {
    next(e);
  }
};

// 21 – Heure avec le plus grand nombre de ventes
export const getPeakHourOverall = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        SUBSTRING(heure_vente,1,2) AS heure,
        COUNT(*) AS nb_ventes
      FROM ventes
      GROUP BY heure
      ORDER BY nb_ventes DESC
      LIMIT 1;
    `);
    res.json(rows[0] || {});
  } catch (e) {
    next(e);
  }
};

// 22 – CA par mode de paiement selon l’heure
export const getRevenueByPaymentPerHour = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        SUBSTRING(heure_vente,1,2) AS heure,
        type_paiement,
        COALESCE(SUM(montant_total),0) AS chiffre_affaires
      FROM ventes
      GROUP BY heure, type_paiement
      ORDER BY heure, type_paiement;
    `);
    res.json(rows);
  } catch (e) {
    next(e);
  }
};

/* -----------------------------------------------------------------
   6️⃣ Clients & comportements
   ----------------------------------------------------------------- */
// 23 – % de clients identifiés vs anonymes
export const getClientIdentificationRate = async (req, res, next) => {
  try {
    const [[{ total }]] = await pool.execute(`SELECT COUNT(*) AS total FROM ventes;`);
    const [[{ identifiés }]] = await pool.execute(`
      SELECT COUNT(*) AS identifiés FROM ventes WHERE client_id IS NOT NULL;
    `);
    const anonymes = total - identifiés;
    const tauxIdent = (identifiés / total) * 100;
    const tauxAnon = (anonymes / total) * 100;
    res.json({
      total_ventes: total,
      identifiés,
      anonymes,
      pourcentage_identifiés: tauxIdent.toFixed(2),
      pourcentage_anonymes:   tauxAnon.toFixed(2),
    });
  } catch (e) {
    next(e);
  }
};

// 24 – Top 10 clients (par montant total dépensé)
export const getTopClientsBySpending = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        client_id,
        COALESCE(SUM(montant_total),0) AS chiffre_affaires
      FROM ventes
      WHERE client_id IS NOT NULL
      GROUP BY client_id
      ORDER BY chiffre_affaires DESC
      LIMIT 10;
    `);
    res.json(rows);
  } catch (e) {
    next(e);
  }
};

// 25 – Heat‑map : CA par supermarché & type de paiement
export const getRevenueHeatmapStorePayment = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        sm.nom        AS supermarche,
        v.type_paiement,
        COALESCE(SUM(v.montant_total),0) AS chiffre_affaires
      FROM ventes v
      JOIN caisses c        ON v.id_caisse = c.id_caisse
      JOIN supermarches sm  ON c.id_supermarche = sm.id_supermarche
      GROUP BY sm.id_supermarche, v.type_paiement
      ORDER BY sm.nom, v.type_paiement;
    `);
    res.json(rows);
  } catch (e) {
    next(e);
  }
};
