// src/middlewares/auth.js
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token manquant' });

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;          // { sub, role, iat, exp }
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token invalide' });
  }
};

/* Vérifie que le rôle est dans la liste autorisée */
export const authorize = (...allowed) => (req, res, next) => {
  if (allowed.includes(req.user.role)) return next();
  res.status(403).json({ error: 'Accès interdit' });
};
