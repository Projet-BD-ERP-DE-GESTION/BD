// importer le module mysql2/promise pour la connexion à la base de données
import mysql from 'mysql2/promise';
// importer le module dotenv pour charger les variables d'environnement
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
