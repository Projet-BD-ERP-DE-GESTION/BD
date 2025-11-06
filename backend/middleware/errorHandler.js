<<<<<<< HEAD
export const errorHandler = (err, req, res, next) => {
  console.error(err);               // toujours logguer en dev
  const status = err.status || 500;
  const message = err.message || 'Erreur interne du serveur';
  res.status(status).json({ error: message });
};
=======
export const errorHandler = (err, req, res, next) => {
  console.error(err);               // toujours logguer en dev
  const status = err.status || 500;
  const message = err.message || 'Erreur interne du serveur';
  res.status(status).json({ error: message });
};
>>>>>>> 2845e41692162b969f30320f9c10272d966a8b14
