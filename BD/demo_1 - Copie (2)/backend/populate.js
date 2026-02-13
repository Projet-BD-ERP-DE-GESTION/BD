import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './db.js';
import { Transaction, Product, User, Employee } from './models.js';

const populate = async () => {
  try {
    // 1. Connexion à la base de données via la config db.js
    await connectDB(); //

    // Nettoyage des collections existantes pour éviter les erreurs d'index unique
    await User.deleteMany({});
    await Product.deleteMany({});
    await Employee.deleteMany({});
    await Transaction.deleteMany({});
    console.log("🧹 Base de données nettoyée.");

    // 2. Ajout des Utilisateurs (Hachage inclus)
    const salt = await bcrypt.genSalt(10);
    const users = [
      { username: 'admin', password: await bcrypt.hash('admin123', salt), role: 'admin' },
      { username: 'vendeur1', password: await bcrypt.hash('vendeur123', salt), role: 'user' }
    ];
    await User.insertMany(users); //
    console.log("👤 Utilisateurs créés (admin / vendeur1)");

    // 3. Ajout des Produits
    const productsData = [
      { product_id: 'P001', product_name: 'Ordinateur Portable', category: 'Électronique' },
      { product_id: 'P002', product_name: 'Souris Sans Fil', category: 'Accessoires' },
      { product_id: 'P003', product_name: 'Clavier Mécanique', category: 'Accessoires' },
      { product_id: 'P004', product_name: 'Écran 4K', category: 'Électronique' },
      { product_id: 'P005', product_name: 'Casque Audio', category: 'Accessoires' },
      { product_id: 'P006', product_name: 'Ordinateur Portable Pro', category: 'Électronique' },
      { product_id: 'P007', product_name: 'Souris Sans Fil', category: 'Accessoires' },
      { product_id: 'P008', product_name: 'Clavier Mécanique RGB', category: 'Accessoires' },
      { product_id: 'P009', product_name: 'Écran 27 Pouces 4K', category: 'Électronique' },
      { product_id: 'P010', product_name: 'Casque Réducteur de Bruit', category: 'Accessoires' },
      { product_id: 'P011', product_name: 'Bureau Assis-Debout', category: 'Mobilier' },
      { product_id: 'P012', product_name: 'Chaise Ergonomique', category: 'Mobilier' },
      { product_id: 'P013', product_name: 'Disque Dur Externe 2To', category: 'Stockage' },
      { product_id: 'P014', product_name: 'Clé USB 64Go', category: 'Stockage' },
      { product_id: 'P015', product_name: 'Webcam HD', category: 'Accessoires' }
    ];
    const createdProducts = await Product.insertMany(productsData); //
    console.log("📦 Produits insérés.");

    // 4. Ajout des Employés
    const employeesData = [
      { name: 'Alice Smith', role: 'Vendeuse', department: 'Retail', performance: 88, attendance: 95, productivity: 82, satisfaction: 90 },
      { name: 'Bob Johnson', role: 'Manager', department: 'Ventes', performance: 92, attendance: 98, productivity: 90, satisfaction: 85 }
    ];
    await Employee.insertMany(employeesData); //
    console.log("👨‍💼 Employés insérés.");

    // 5. Génération de 100 Transactions aléatoires
    const stores = ['Magasin Paris', 'Magasin Lyon', 'Magasin Marseille'];
    const neighborhoods = ['Centre-Ville', 'Zone Nord', 'Quartier Est'];
    const payments = ['Carte Bleue', 'Espèces', 'Mobile Pay'];
    const transactions = [];

    for (let i = 1; i <= 100; i++) {
      const nbItems = Math.floor(Math.random() * 3) + 1; // 1 à 3 articles par vente
      let totalAmount = 0;
      const items = [];

      for (let j = 0; j < nbItems; j++) {
        const prod = createdProducts[Math.floor(Math.random() * createdProducts.length)];
        const qty = Math.floor(Math.random() * 3) + 1;
        const price = Math.floor(Math.random() * 200) + 10;
        totalAmount += qty * price;

        items.push({
          product_id: prod.product_id,
          product_name: prod.product_name,
          category: prod.category,
          quantity: qty,
          unit_price: price,
          discount: 0
        });
      }

      transactions.push({
        transaction_id: `TX-${2024}-${i.toString().padStart(3, '0')}`,
        store: stores[Math.floor(Math.random() * stores.length)],
        neighborhood: neighborhoods[Math.floor(Math.random() * neighborhoods.length)],
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000000000)),
        payment_type: payments[Math.floor(Math.random() * payments.length)],
        total_amount: totalAmount,
        discount_amount: 0,
        items: items //
      });
    }

    await Transaction.insertMany(transactions); //
    console.log("💰 100 transactions générées.");

    console.log("\n🚀 Remplissage terminé avec succès !");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur de remplissage :", err);
    process.exit(1);
  }
};

populate();