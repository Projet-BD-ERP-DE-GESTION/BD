// src/middlewares/errorHandler.js
export function errorHandler(err, req, res, next) {
  console.error(err);               // log complet sur la console
  const status = err.status || 500;
  const message = err.message || 'Erreur interne du serveur';
  res.status(status).json({ error: message });
}
