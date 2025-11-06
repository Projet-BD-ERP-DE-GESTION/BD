import pool from '../config/db.js';

export const getAll = async () => {
  const [rows] = await pool.query(`
    SELECT id, name, category, price, cost, barcode,
           stock, min_stock AS minStock
    FROM products ORDER BY name`);
  return rows;
};

export const getById = async (id) => {
  const [rows] = await pool.query(`
    SELECT id, name, category, price, cost, barcode,
           stock, min_stock AS minStock
    FROM products WHERE id = ?`, [id]);
  return rows[0];
};

export const create = async (prod) => {
  const { name, category, price, cost, barcode, stock, minStock } = prod;
  const [result] = await pool.execute(`
    INSERT INTO products (name, category, price, cost, barcode, stock, min_stock)
    VALUES (?,?,?,?,?,?,?)`,
    [name, category, price, cost, barcode, stock, minStock]);
  return { id: result.insertId, ...prod };
};

export const update = async (id, prod) => {
  const { name, category, price, cost, barcode, stock, minStock } = prod;
  await pool.execute(`
    UPDATE products SET name=?, category=?, price=?, cost=?, barcode=?, stock=?, min_stock=?
    WHERE id=?`,
    [name, category, price, cost, barcode, stock, minStock, id]);
  return { id, ...prod };
};

export const remove = async (id) => {
  await pool.execute('DELETE FROM products WHERE id = ?', [id]);
};
