import pool from '../config/db.js';

export const getAll = async () => {
  const [rows] = await pool.query(`
    SELECT id, name, role, department, email, phone,
           DATE_FORMAT(join_date, '%Y-%m-%d') AS joinDate,
           status, schedule
    FROM employees
    ORDER BY name`);
  return rows;
};

export const getById = async (id) => {
  const [rows] = await pool.query(`
    SELECT id, name, role, department, email, phone,
           DATE_FORMAT(join_date, '%Y-%m-%d') AS joinDate,
           status, schedule
    FROM employees WHERE id = ?`, [id]);
  return rows[0];
};

export const create = async (emp) => {
  const { name, role, department, email, phone, joinDate, status, schedule } = emp;
  const [result] = await pool.execute(`
    INSERT INTO employees (name, role, department, email, phone, join_date, status, schedule)
    VALUES (?,?,?,?,?,?,?,?)`,
    [name, role, department, email, phone, joinDate, status, schedule]);
  return { id: result.insertId, ...emp };
};

export const update = async (id, emp) => {
  const { name, role, department, email, phone, joinDate, status, schedule } = emp;
  await pool.execute(`
    UPDATE employees SET name=?, role=?, department=?, email=?, phone=?, join_date=?, status=?, schedule=?
    WHERE id=?`,
    [name, role, department, email, phone, joinDate, status, schedule, id]);
  return { id, ...emp };
};

export const remove = async (id) => {
  await pool.execute('DELETE FROM employees WHERE id = ?', [id]);
};
