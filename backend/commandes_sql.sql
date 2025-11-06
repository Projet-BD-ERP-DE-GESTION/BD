-- Sélection de la base de données
USE ecole;
-- 1️⃣ Table des catégories
CREATE TABLE category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name_category VARCHAR(250) NOT NULL
);

-- 2️⃣ Table des fournisseurs
CREATE TABLE suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(250),
  address VARCHAR(250),
  status BOOLEAN DEFAULT TRUE,
  orders INT DEFAULT 0,
  totalPurchases DECIMAL(10,2) DEFAULT 0.00,
  id_category INT,
  FOREIGN KEY (id_category) REFERENCES category(id)
);

-- 3️⃣ Table des produits
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL,
  cost DECIMAL(10,2) DEFAULT 0.00,
  barcode VARCHAR(250),
  minStock INT DEFAULT 0,
  supplier_id INT,
  id_category INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_category) REFERENCES category(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- 4️⃣ Table des ventes
CREATE TABLE sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT,
  quantity INT NOT NULL,
  sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 5️⃣ Table des employés
CREATE TABLE employee (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(250) NOT NULL,
  role VARCHAR(250),
  department VARCHAR(250),
  email VARCHAR(250) UNIQUE,
  phone VARCHAR(250),
  status VARCHAR(250),
  schedule VARCHAR(250),
  id_sale INT,
  FOREIGN KEY (id_sale) REFERENCES sales(id)
);

-- ✅ 1️⃣ Table des clients
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(255),
  address VARCHAR(255),
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status BOOLEAN DEFAULT TRUE
);

-- ✅ 2️⃣ Table des commandes
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT,
  employee_id INT,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(10, 2) DEFAULT 0.00,
  payment_status ENUM('non payé', 'payé', 'remboursé') DEFAULT 'non payé',
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (employee_id) REFERENCES employee(id)
);

-- ✅ 3️⃣ Table des détails de commande (relation n-n entre orders et products)
CREATE TABLE order_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ✅ 4️⃣ Quelques insertions pour tester
INSERT INTO customers (name, email, phone, address)
VALUES
('Jean Dupont', 'jean.dupont@example.com', '690000010', 'Yaoundé - Mvog-Ada'),
('Marie Claire', 'marie.claire@example.com', '690000011', 'Douala - Akwa'),
('Talla Boris', 'talla.boris@example.com', '690000012', 'Yaoundé - Bastos');

-- Un employé vendeur (à relier à la commande)
INSERT INTO employee (name, role, department, email, phone, status, schedule)
VALUES
('Alice Mbarga', 'Vendeuse', 'Commerce', 'alice.mbarga@example.com', '690000020', 'Actif', '8h-17h');

-- Une commande exemple (client 1, employé 1)
INSERT INTO orders (customer_id, employee_id, total_amount, payment_status)
VALUES (1, 1, 0, 'non payé');

-- Détails de la commande (produits achetés)
INSERT INTO order_details (order_id, product_id, quantity, unit_price)
VALUES
(1, 1, 5, 12),   -- 5 sacs de riz à 12 FCFA
(1, 2, 2, 50);   -- 2 bouteilles d’huile à 50 FCFA

-- Mise à jour du total de la commande
UPDATE orders
SET total_amount = (
  SELECT SUM(subtotal)
  FROM order_details
  WHERE order_details.order_id = orders.id
)
WHERE id = 1;

-- 6️⃣ Exemple d’insertion de produits
-- ⚠ Les supplier_id doivent exister avant d'insérer dans products.
-- Donc, insère d'abord quelques fournisseurs.
INSERT INTO suppliers (name, email, phone, address, status)
VALUES
('Fournisseur Riz', 'riz@example.com', '690000001', 'Marché central', TRUE),
('Fournisseur Huile', 'huile@example.com', '690000002', 'Marché central', TRUE),
('Fournisseur Pain', 'pain@example.com', '690000003', 'Marché central', TRUE),
('Fournisseur Gâteau', 'gateau@example.com', '690000004', 'Marché central', TRUE);

-- Maintenant on peut insérer les produits :
INSERT INTO products (name, price, stock, supplier_id)
VALUES
('Riz', 12, 548, 1),
('Huile', 50, 963, 2),
('Pain', 98, 852, 3),
('Gâteau', 45, 741, 4);