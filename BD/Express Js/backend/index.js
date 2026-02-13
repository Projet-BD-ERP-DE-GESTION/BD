// src/index.js
import express from 'express';
import dotenv from 'dotenv';
import authRouter    from './routes/auth.routes.js';
import saleRouter    from './routes/sale.routes.js';
import managerRouter from './routes/manager.routes.js';
import adminRouter   from './routes/admin.routes.js';   // <-- unique
import cashierRouter from './routes/cashier.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';


dotenv.config();

const app = express();
app.use(express.json());

// src/index.js (extrait)

// src/index.js (extrait corrigé)

app.use('/api/cashier', cashierRouter);   // caissier + manager + admin
app.use('/api/admin', adminRouter);       // uniquement admin
app.use('/api/auth', authRouter);
app.use('/api/ventes', saleRouter);
app.use('/api/manager', managerRouter);   // manager & admin peuvent y accéder
// ← on supprime la deuxième ligne qui faisait la même chose que celle ci‑dessus

// src/index.js (extrait corrigé)

app.use('/api/cashier', cashierRouter);   // caissier + manager + admin
app.use('/api/admin', adminRouter);       // uniquement admin
app.use('/api/auth', authRouter);
app.use('/api/ventes', saleRouter);
app.use('/api/manager', managerRouter);   // manager & admin peuvent y accéder
// ← on supprime la deuxième ligne qui faisait la même chose que celle ci‑dessus
  // caissier + manager + admin
// src/index.js (extrait corrigé)

app.use('/api/cashier', cashierRouter);   // caissier + manager + admin
app.use('/api/admin', adminRouter);       // uniquement admin
app.use('/api/auth', authRouter);
app.use('/api/ventes', saleRouter);
app.use('/api/manager', managerRouter);   // manager & admin peuvent y accéder
// ← on supprime la deuxième ligne qui faisait la même chose que celle ci‑dessus
  // uniquement admin
// src/index.js (extrait corrigé)

app.use('/api/cashier', cashierRouter);   // caissier + manager + admin
app.use('/api/admin', adminRouter);       // uniquement admin
app.use('/api/auth', authRouter);
app.use('/api/ventes', saleRouter);
app.use('/api/manager', managerRouter);   // manager & admin peuvent y accéder
// ← on supprime la deuxième ligne qui faisait la même chose que celle ci‑dessus

// src/index.js (extrait corrigé)

app.use('/api/cashier', cashierRouter);   // caissier + manager + admin
app.use('/api/admin', adminRouter);       // uniquement admin
app.use('/api/auth', authRouter);
app.use('/api/ventes', saleRouter);
app.use('/api/manager', managerRouter);   // manager & admin peuvent y accéder
// ← on supprime la deuxième ligne qui faisait la même chose que celle ci‑dessus

// src/index.js (extrait corrigé)

app.use('/api/cashier', cashierRouter);   // caissier + manager + admin
app.use('/api/admin', adminRouter);       // uniquement admin
app.use('/api/auth', authRouter);
app.use('/api/ventes', saleRouter);
app.use('/api/manager', managerRouter);   // manager & admin peuvent y accéder
// ← on supprime la deuxième ligne qui faisait la même chose que celle ci‑dessus
   // manager & admin peuvent y accéder
// src/index.js (extrait corrigé)

app.use('/api/cashier', cashierRouter);   // caissier + manager + admin
app.use('/api/admin', adminRouter);       // uniquement admin
app.use('/api/auth', authRouter);
app.use('/api/ventes', saleRouter);
app.use('/api/manager', managerRouter);   // manager & admin peuvent y accéder
// ← on supprime la deuxième ligne qui faisait la même chose que celle ci‑dessus
   // uniquement admin

// 404 générique
app.use((_, res) => res.status(404).json({ error: 'Endpoint not found' }));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
