// src/controllers/manager.controller.js
import pool from '../config/db.js';
import Joi from 'joi';
import bcrypt from 'bcryptjs';

/* ---------- PRODUITS ---------- */
const productSchema = Joi.object({
  nom: Joi.string().max(100).required(),
  id_categorie: Joi.number().integer().required(),
  prix_unitaire: Joi.number().precision(2).required(),
  stock: Joi.number().integer().min(0).required(),
});

/* POST /manager/produits */
export const createProduct = async (req, res, next) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const { nom, id_categorie, prix_unitaire, stock } = value;
    const [result] = await pool.execute(
      `INSERT INTO produits (nom, id_categorie, prix_unitaire, stock)
       VALUES (?,?,?,?)`,
      [nom, id_categorie, prix_unitaire, stock]
    );
    res.status(201).json({ id_produit: result.insertId });
  } catch (e) {
    next(e);
  }
};

/* PUT /manager/produits/:id */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    await pool.execute(
      `UPDATE produits SET nom=?, id_categorie=?, prix_unitaire=?, stock=? WHERE id_produit=?`,
      [...Object.values(value), id]
    );
    res.json({ message: 'Produit mis à jour' });
  } catch (e) {
    next(e);
  }
};

/* DELETE /manager/produits/:id */
export const deleteProduct = async (req, res, next) => {
  const { id } = req.params;
  await pool.execute(`DELETE FROM produits WHERE id_produit=?`, [id]);
  res.json({ message: 'Produit supprimé' });
};

/* ---------- CAISSIERS ---------- */
// Création d’un caissier + hash du mdp + rôle
const cashierSchema = Joi.object({
  id_caissier: Joi.string().required(),
  nom: Joi.string().allow(null),
  id_supermarche: Joi.number().integer().required(),
  mot_de_passe: Joi.string().min(6).required(),
});

/* POST /manager/caissiers */
export const createCashier = async (req, res, next) => {
  const { error, value } = cashierSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const hash = await bcrypt.hash(value.mot_de_passe, 10);
  const { id_caissier, nom, id_supermarche } = value;
  await pool.execute(
    `INSERT INTO caissiers (id_caissier, nom, id_supermarche, mot_de_passe, role)
     VALUES (?,?,?,?, 'cashier')`,
    [id_caissier, nom, id_supermarche, hash]
  );
  res.status(201).json({ id_caissier });
};

/* PUT /manager/caissiers/:id (exemple : changer nom ou mdp) */
export const updateCashier = async (req, res, next) => {
  const { id } = req.params;
  const schema = Joi.object({
    nom: Joi.string().allow(null),
    mot_de_passe: Joi.string().min(6),
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  if (value.mot_de_passe) {
    value.mot_de_passe = await bcrypt.hash(value.mot_de_passe, 10);
    await pool.execute(
      `UPDATE caissiers SET nom=?, mot_de_passe=? WHERE id_caissier=?`,
      [value.nom, value.mot_de_passe, id]
    );
  } else {
    await pool.execute(`UPDATE caissiers SET nom=? WHERE id_caissier=?`, [value.nom, id]);
  }
  res.json({ message: 'Caissier mis à jour' });
};

/* DELETE /manager/caissiers/:id */
export const deleteCashier = async (req, res, next) => {
  const { id } = req.params;
  await pool.execute(`DELETE FROM caissiers WHERE id_caissier=?`, [id]);
  res.json({ message: 'Caissier supprimé' });
};

/* ---------- CAISSES ---------- */
export const createRegister = async (req, res, next) => {
  const schema = Joi.object({
    id_caisse: Joi.string().required(),
    id_supermarche: Joi.number().integer().required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  await pool.execute(
    `INSERT INTO caisses (id_caisse, id_supermarche) VALUES (?,?)`,
    [value.id_caisse, value.id_supermarche]
  );
  res.status(201).json({ id_caisse: value.id_caisse });
};

export const deleteRegister = async (req, res, next) => {
  const { id } = req.params;
  await pool.execute(`DELETE FROM caisses WHERE id_caisse=?`, [id]);
  res.json({ message: 'Caisse supprimée' });
};
