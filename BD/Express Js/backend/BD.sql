-- ============================================
--       BASE DE DONNÉES SUPERMARCHE
-- ============================================

CREATE DATABASE IF NOT EXISTS supermarche_db;
USE supermarche_db;

-- ============================================
-- TABLE : Supermarchés
-- ============================================
CREATE TABLE supermarches (
    id_supermarche INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    quartier VARCHAR(100)
);

-- ============================================
-- TABLE : Caissiers
-- ============================================
CREATE TABLE caissiers (
    id_caissier VARCHAR(20) PRIMARY KEY,
    nom VARCHAR(100),
    id_supermarche INT,
    FOREIGN KEY (id_supermarche) REFERENCES supermarches(id_supermarche)
);

-- ============================================
-- TABLE : Caisses
-- ============================================
CREATE TABLE caisses (
    id_caisse VARCHAR(20) PRIMARY KEY,
    id_supermarche INT,
    FOREIGN KEY (id_supermarche) REFERENCES supermarches(id_supermarche)
);

-- ============================================
-- TABLE : Clients
-- ============================================
CREATE TABLE clients (
    id_client VARCHAR(20) PRIMARY KEY,
    nom VARCHAR(100)
);

-- ============================================
-- TABLE : Categories
-- ============================================
CREATE TABLE categories (
    id_categorie INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL
);

-- ============================================
-- TABLE : Produits
-- ============================================
CREATE TABLE produits (
    id_produit INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    id_categorie INT,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_categorie) REFERENCES categories(id_categorie)
);

-- ============================================
-- TABLE : Ventes
-- ============================================
CREATE TABLE ventes (
    id_vente VARCHAR(30) PRIMARY KEY,
    date_vente DATE,
    heure_vente TIME,
    id_caisse VARCHAR(20),
    id_caissier VARCHAR(20),
    id_client VARCHAR(20),
    type_paiement VARCHAR(20),
    montant_total DECIMAL(10,2),
    remise_totale DECIMAL(10,2),
    devise VARCHAR(10),

    FOREIGN KEY (id_caisse) REFERENCES caisses(id_caisse),
    FOREIGN KEY (id_caissier) REFERENCES caissiers(id_caissier),
    FOREIGN KEY (id_client) REFERENCES clients(id_client)
);

-- ============================================
-- TABLE : Détails des ventes
-- ============================================
CREATE TABLE vente_details (
    id_detail INT AUTO_INCREMENT PRIMARY KEY,
    id_vente VARCHAR(30),
    id_produit INT,
    quantite INT,
    prix_unitaire DECIMAL(10,2),
    remise DECIMAL(10,2),
    prix_total DECIMAL(10,2),

    FOREIGN KEY (id_vente) REFERENCES ventes(id_vente),
    FOREIGN KEY (id_produit) REFERENCES produits(id_produit)
);
