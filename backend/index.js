import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import employeeRoutes from './routes/employeeRoutes.js';
import productRoutes  from './routes/productRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import saleRoutes     from './routes/saleRoutes.js';
import statsRoutes    from './routes/statsRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors({ origin: '*' }));   // 👉 En prod remplacer par votre domaine
app.use(express.json());          // parse JSON bodies

// ---------- API ----------
app.use('/api/employees', employeeRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/sales',     saleRoutes);
app.use('/api/stats',    statsRoutes);

// ---------- 404 ----------
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// ---------- Erreurs ----------
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
