// src/controllers/auth.controller.js
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

const loginSchema = Joi.object({
  id_caissier: Joi.string().required(),
  mot_de_passe: Joi.string().required(),
});

/* POST /api/auth/login */
export const login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const { id_caissier, mot_de_passe } = value;

    const [[user]] = await pool.execute(
      `SELECT id_caissier, mot_de_passe, role FROM caissiers WHERE id_caissier = ?`,
      [id_caissier]
    );
    if (!user) return res.status(401).json({ error: 'Identifiants invalides' });

    const ok = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!ok) return res.status(401).json({ error: 'Identifiants invalides' });

    const token = jwt.sign(
      { sub: user.id_caissier, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ token, role: user.role });
  } catch (e) {
    next(e);
  }
};
