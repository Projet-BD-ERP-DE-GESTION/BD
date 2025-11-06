import * as SupplierModel from '../models/supplierModel.js';

export const list = async (req, res, next) => {
  try {
    const suppliers = await SupplierModel.getAll();
    res.json(suppliers);
  } catch (e) { next(e); }
};

export const getOne = async (req, res, next) => {
  try {
    const sup = await SupplierModel.getById(req.params.id);
    if (!sup) return res.status(404).json({ error: 'Fournisseur introuvable' });
    res.json(sup);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  const { name, category, contact, email, phone, address, status = 'active' } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'Nom et catégorie obligatoires' });

  try {
    const newSup = await SupplierModel.create({ name, category, contact, email, phone, address, status });
    res.status(201).json(newSup);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  const id = req.params.id;
  const { name, category, contact, email, phone, address, status } = req.body;

  if (!name || !category) return res.status(400).json({ error: 'Nom et catégorie obligatoires' });

  try {
    const sup = await SupplierModel.update(id, { name, category, contact, email, phone, address, status });
    res.json(sup);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    await SupplierModel.remove(req.params.id);
    res.status(204).send();
  } catch (e) { next(e); }
};
