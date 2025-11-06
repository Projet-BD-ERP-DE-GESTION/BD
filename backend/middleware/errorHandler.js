export const errorHandler = (err, req, res, next) => {
  console.error(err);               // toujours logguer en dev
  const status = err.status || 500;
  const message = err.message || 'Erreur interne du serveur';
  res.status(status).json({ error: message });
};
