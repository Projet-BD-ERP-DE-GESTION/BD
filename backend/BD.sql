use ecole;

-- ==========================================================
-- 1️⃣ Employés
-- ==========================================================
CREATE TABLE   employees (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    role        VARCHAR(100) NOT NULL,
    department  VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    phone       VARCHAR(30)  NOT NULL,
    join_date   DATE NOT NULL,
    status      ENUM('active','vacation','inactive') NOT NULL DEFAULT 'active',
    schedule    VARCHAR(100) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==========================================================
-- 2️⃣ Produits
-- ==========================================================
CREATE TABLE IF NOT EXISTS products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    category    VARCHAR(100) NOT NULL,
    price       DECIMAL(10,2) NOT NULL,      -- prix de vente
    cost        DECIMAL(10,2) NOT NULL,      -- prix d’achat
    barcode     VARCHAR(50) UNIQUE,
    stock       INT NOT NULL DEFAULT 0,
    min_stock   INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==========================================================
-- 3️⃣ Fournisseurs
-- ==========================================================
CREATE TABLE  suppliers (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    category        VARCHAR(100) NOT NULL,
    contact_name    VARCHAR(100),
    email           VARCHAR(150),
    phone           VARCHAR(30),
    address         VARCHAR(250),
    status          ENUM('active','inactive') NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==========================================================
-- 4️⃣ Commandes aux fournisseurs (historique)
-- ==========================================================
CREATE TABLE  supplier_orders (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    order_date  DATE NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================================
-- 5️⃣ Ventes (POS)
-- ==========================================================
CREATE TABLE  sales (
    id          VARCHAR(30) PRIMARY KEY,               -- ex : VNT-2024-00123
    sale_date   DATE NOT NULL,
    sale_time   TIME NOT NULL,
    subtotal    DECIMAL(12,2) NOT NULL,
    tax         DECIMAL(12,2) NOT NULL,
    total       DECIMAL(12,2) NOT NULL,
    payment     ENUM('Espèces','Carte bancaire') NOT NULL,
    cashier_id  INT NOT NULL,
    department  VARCHAR(100) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cashier_id) REFERENCES employees(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ==========================================================
-- 6️⃣ Détails d’une vente (ligne d’item)
-- ==========================================================
CREATE TABLE  sale_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    sale_id     VARCHAR(30) NOT NULL,
    product_id  INT NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    quantity    INT NOT NULL,
    price       DECIMAL(10,2) NOT NULL,      -- prix unitaire (vente)
    total       DECIMAL(12,2) NOT NULL,      -- quantity * price
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
