import * as ProductModel from '../models/productModel.js';

export const list = async (req, res, next) => {
  try {
    const products = await ProductModel.getAll();
    res.json(products);
  } catch (e) { next(e); }
};

export const getOne = async (req, res, next) => {
  try {
    const prod = await ProductModel.getById(req.params.id);
    if (!prod) return res.status(404).json({ error: 'Produit non trouvé' });
    res.json(prod);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  const {
    name, category, price, cost,
    barcode, stock = 0, minStock = 0
  } = req.body;

  if (!name || !category || price == null || cost == null) {
    return res.status(400).json({ error: 'Nom, catégorie, prix et coût requis' });
  }

  try {
    const newProd = await ProductModel.create({
      name, category, price, cost, barcode, stock, minStock
    });
    res.status(201).json(newProd);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  const id = req.params.id;
  const {
    name, category, price, cost,
    barcode, stock, minStock
  } = req.body;

  if (!name || !category || price == null || cost == null) {
    return res.status(400).json({ error: 'Nom, catégorie, prix et coût requis' });
  }

  try {
    const prod = await ProductModel.update(id, {
      name, category, price, cost, barcode, stock, minStock
    });
    res.json(prod);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    await ProductModel.remove(req.params.id);
    res.status(204).send();
  } catch (e) { next(e); }
};
