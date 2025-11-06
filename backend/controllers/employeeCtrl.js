import * as EmployeeModel from '../models/employeeModel.js';

export const list = async (req, res, next) => {
  try {
    const employees = await EmployeeModel.getAll();
    res.json(employees);
  } catch (e) { next(e); }
};

export const getOne = async (req, res, next) => {
  try {
    const emp = await EmployeeModel.getById(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employé non trouvé' });
    res.json(emp);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  const {
    name, role, department, email, phone,
    joinDate, status = 'active', schedule
  } = req.body;

  // validation rapide
  if (!name || !role || !department || !email || !phone || !joinDate || !schedule) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
  }

  try {
    const newEmp = await EmployeeModel.create({
      name, role, department, email, phone,
      joinDate, status, schedule
    });
    res.status(201).json(newEmp);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  const id = req.params.id;
  const {
    name, role, department, email, phone,
    joinDate, status, schedule
  } = req.body;

  if (!name || !role || !department || !email || !phone || !joinDate || !status || !schedule) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
  }

  try {
    const emp = await EmployeeModel.update(id, {
      name, role, department, email, phone,
      joinDate, status, schedule
    });
    res.json(emp);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    await EmployeeModel.remove(req.params.id);
    res.status(204).send();
  } catch (e) { next(e); }
};
