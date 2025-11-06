import * as SaleModel from '../models/saleModel.js';

export const create = async (req, res, next) => {
  const {
    id, date, time, subtotal, tax, total,
    payment, cashierId, department, items
  } = req.body;

  // Validation assez basique
  if (!id || !date || !time || !items?.length) {
    return res.status(400).json({ error: 'Données de vente incomplètes' });
  }

  try {
    const saved = await SaleModel.createSale({
      id, date, time, subtotal, tax, total,
      payment, cashierId, department, items
    });
    res.status(201).json(saved);
  } catch (e) { next(e); }
};

export const list = async (req, res, next) => {
  const { period } = req.query; // day / month / year
  try {
    const sales = await SaleModel.getAll(period);
    res.json(sales);
  } catch (e) { next(e); }
};

export const getOne = async (req, res, next) => {
  try {
    const sale = await SaleModel.getById(req.params.id);
    if (!sale) return res.status(404).json({ error: 'Vente introuvable' });
    res.json(sale);
  } catch (e) { next(e); }
};
