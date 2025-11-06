<<<<<<< HEAD
import pool from '../config/db.js';

/* ---------- SALES ---------- */
export const createSale = async (sale) => {
  const {
    id, date, time, subtotal, tax, total,
    payment, cashierId, department, items
  } = sale;

  // 1️⃣ Insert sale header
  await pool.execute(`
    INSERT INTO sales (id, sale_date, sale_time, subtotal, tax, total, payment, cashier_id, department)
    VALUES (?,?,?,?,?,?,?,?,?)`,
    [id, date, time, subtotal, tax, total, payment, cashierId, department]);

  // 2️⃣ Insert chaque ligne d’article
  const itemPromises = items.map(item =>
    pool.execute(`
      INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, total)
      VALUES (?,?,?,?,?,?)`,
      [id, item.productId, item.productName, item.quantity, item.price, item.total])
  );

  await Promise.all(itemPromises);
  return { id, ...sale };
};

export const getAll = async (period = null) => {
  // period = 'day' | 'month' | 'year' | null (tous)
  let sql = `SELECT s.id, s.sale_date AS date, s.sale_time AS time,
                s.subtotal, s.tax, s.total, s.payment,
                e.name AS cashierName, s.department
             FROM sales s
             JOIN employees e ON s.cashier_id = e.id`;
  const params = [];

  if (period) {
    const today = new Date();
    if (period === 'day') {
      sql += ` WHERE s.sale_date = ?`;
      params.push(today.toISOString().split('T')[0]);
    } else if (period === 'month') {
      sql += ` WHERE YEAR(s.sale_date) = ? AND MONTH(s.sale_date) = ?`;
      params.push(today.getFullYear(), today.getMonth() + 1);
    } else if (period === 'year') {
      sql += ` WHERE YEAR(s.sale_date) = ?`;
      params.push(today.getFullYear());
    }
  }

  sql += ` ORDER BY s.sale_date DESC, s.sale_time DESC`;
  const [rows] = await pool.query(sql, params);
  return rows;
};

export const getById = async (id) => {
  // Header
  const [headerRows] = await pool.query(`
    SELECT s.id, s.sale_date AS date, s.sale_time AS time,
           s.subtotal, s.tax, s.total, s.payment,
           e.name AS cashierName, s.department
    FROM sales s
    JOIN employees e ON s.cashier_id = e.id
    WHERE s.id = ?`, [id]);

  if (headerRows.length === 0) return null;

  // Items
  const [itemRows] = await pool.query(`
    SELECT product_id AS productId, product_name AS productName,
           quantity, price, total
    FROM sale_items WHERE sale_id = ?`, [id]);

  return { ...headerRows[0], items: itemRows };
};
=======
import pool from '../config/db.js';

/* ---------- SALES ---------- */
export const createSale = async (sale) => {
  const {
    id, date, time, subtotal, tax, total,
    payment, cashierId, department, items
  } = sale;

  // 1️⃣ Insert sale header
  await pool.execute(`
    INSERT INTO sales (id, sale_date, sale_time, subtotal, tax, total, payment, cashier_id, department)
    VALUES (?,?,?,?,?,?,?,?,?)`,
    [id, date, time, subtotal, tax, total, payment, cashierId, department]);

  // 2️⃣ Insert chaque ligne d’article
  const itemPromises = items.map(item =>
    pool.execute(`
      INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, total)
      VALUES (?,?,?,?,?,?)`,
      [id, item.productId, item.productName, item.quantity, item.price, item.total])
  );

  await Promise.all(itemPromises);
  return { id, ...sale };
};

export const getAll = async (period = null) => {
  // period = 'day' | 'month' | 'year' | null (tous)
  let sql = `SELECT s.id, s.sale_date AS date, s.sale_time AS time,
                s.subtotal, s.tax, s.total, s.payment,
                e.name AS cashierName, s.department
             FROM sales s
             JOIN employees e ON s.cashier_id = e.id`;
  const params = [];

  if (period) {
    const today = new Date();
    if (period === 'day') {
      sql += ` WHERE s.sale_date = ?`;
      params.push(today.toISOString().split('T')[0]);
    } else if (period === 'month') {
      sql += ` WHERE YEAR(s.sale_date) = ? AND MONTH(s.sale_date) = ?`;
      params.push(today.getFullYear(), today.getMonth() + 1);
    } else if (period === 'year') {
      sql += ` WHERE YEAR(s.sale_date) = ?`;
      params.push(today.getFullYear());
    }
  }

  sql += ` ORDER BY s.sale_date DESC, s.sale_time DESC`;
  const [rows] = await pool.query(sql, params);
  return rows;
};

export const getById = async (id) => {
  // Header
  const [headerRows] = await pool.query(`
    SELECT s.id, s.sale_date AS date, s.sale_time AS time,
           s.subtotal, s.tax, s.total, s.payment,
           e.name AS cashierName, s.department
    FROM sales s
    JOIN employees e ON s.cashier_id = e.id
    WHERE s.id = ?`, [id]);

  if (headerRows.length === 0) return null;

  // Items
  const [itemRows] = await pool.query(`
    SELECT product_id AS productId, product_name AS productName,
           quantity, price, total
    FROM sale_items WHERE sale_id = ?`, [id]);

  return { ...headerRows[0], items: itemRows };
};
>>>>>>> 2845e41692162b969f30320f9c10272d966a8b14
