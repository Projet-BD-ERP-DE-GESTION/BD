import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectDB } from './db.js';
import { Transaction, Product, User, Employee } from './models.js';
const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwt';

// Middleware pour vérifier le token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.user = user;
    next();
  });
}

// CRUD Employees (protégé)
app.get('/api/employees', authenticateToken, async (req, res) => {
  const employees = await Employee.find();
  res.json(employees);
});

app.post('/api/employees', authenticateToken, async (req, res) => {
  try {
    const emp = new Employee(req.body);
    await emp.save();
    res.status(201).json(emp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/employees/:id', authenticateToken, async (req, res) => {
  try {
    const emp = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(emp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/employees/:id', authenticateToken, async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// Connexion à la base de données
connectDB();

// CRUD Transactions (protégé)
app.get('/api/transactions', authenticateToken, async (req, res) => {
  const txs = await Transaction.find();
  res.json(txs);
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const tx = new Transaction(req.body);
    await tx.save();
    res.status(201).json(tx);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// CRUD Produits (protégé)
app.get('/api/products', authenticateToken, async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const prod = new Product(req.body);
    await prod.save();
    res.status(201).json(prod);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// CRUD Utilisateurs (protégé sauf inscription)
app.get('/api/users', authenticateToken, async (req, res) => {
  const users = await User.find({}, '-password');
  res.json(users);
});

app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ id: user._id, username: user.username, role: user.role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Authentification sécurisée (login JWT)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect' });
  const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
});

// Inscription (hash password)
app.post('/api/register', async (req, res) => {
  try {
    console.log(req.body);
    const { username, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hash, role });
    await user.save();
    console.log('User registered:', user);
    res.status(201).json({ id: user._id, username: user.username, role: user.role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Express backend + MongoDB running on http://localhost:${PORT}`);
});
