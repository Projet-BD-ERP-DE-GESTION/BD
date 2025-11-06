import pool from '../config/db.js';

export const getAll = async () => {
  const [rows] = await pool.query(`
    SELECT id, name, category, contact_name AS contact,
           email, phone, address, status, created_at
    FROM suppliers ORDER BY name`);
  return rows;
};

export const getById = async (id) => {
  const [rows] = await pool.query(`
    SELECT id, name, category, contact_name AS contact,
           email, phone, address, status, created_at
    FROM suppliers WHERE id = ?`, [id]);
  return rows[0];
};

export const create = async (sup) => {
  const { name, category, contact, email, phone, address, status } = sup;
  const [result] = await pool.execute(`
    INSERT INTO suppliers (name, category, contact_name, email, phone, address, status)
    VALUES (?,?,?,?,?,?,?)`,
    [name, category, contact, email, phone, address, status]);
  return { id: result.insertId, ...sup };
};

export const update = async (id, sup) => {
  const { name, category, contact, email, phone, address, status } = sup;
  await pool.execute(`
    UPDATE suppliers SET name=?, category=?, contact_name=?, email=?, phone=?, address=?, status=?
    WHERE id=?`,
    [name, category, contact, email, phone, address, status, id]);
  return { id, ...sup };
};

export const remove = async (id) => {
  await pool.execute('DELETE FROM suppliers WHERE id = ?', [id]);
};
