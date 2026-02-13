#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Importation du fichier TP3-supermarche.csv dans MySQL.
- Tous les ID proviennent du CSV (aucune génération aléatoire).
- Les valeurs manquantes deviennent NULL.
- Gestion robuste des champs texte avec strip() uniquement sur des chaînes valides.
"""

import os
import sys
import numpy as np               # pour np.nan
import pandas as pd
import mysql.connector

# ----------------------------------------------------------------------
# 1️⃣ CONFIGURATION MYSQL
# ----------------------------------------------------------------------
MYSQL_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "12345",
    "database": "supermarche_db",
    "charset": "utf8mb4",
    "collation": "utf8mb4_unicode_ci",
}

# ----------------------------------------------------------------------
# 2️⃣ CHEMIN VERS LE CSV
# ----------------------------------------------------------------------
CSV_PATH = "TP3-supermarche.csv"
if not os.path.isfile(CSV_PATH):
    sys.exit(f"❌  Le fichier CSV '{CSV_PATH}' est introuvable.")

# ----------------------------------------------------------------------
# 3️⃣ FONCTION utilitaire : nettoyage d’une chaîne
# ----------------------------------------------------------------------
def clean_string(val):
    """
    Retourne la chaîne dépouillée de ses espaces ou None si la valeur est vide.
    Utilisée partout où l’on doit appeler .strip().
    """
    if pd.isna(val):
        return None
    return str(val).strip()

# ----------------------------------------------------------------------
# 4️⃣ CHARGEMENT & NETTOYAGE DU CSV
# ----------------------------------------------------------------------
df = pd.read_csv(CSV_PATH)

# Convertir les NaN pandas (numpy.nan) en Python None → MySQL NULL
df = df.replace({np.nan: None})

# Appliquer clean_string à toutes les colonnes texte
TEXT_COLUMNS = [
    "Supermarche", "Quartier", "Categorie", "Produit",
    "Caisse_ID", "Caissier_ID", "Client_ID", "Type_Paiement"
]
for col in TEXT_COLUMNS:
    if col in df.columns:
        df[col] = df[col].apply(clean_string)

# ----------------------------------------------------------------------
# 5️⃣ FONCTION d’insertion paramétrée (INSERT … ON DUPLICATE KEY UPDATE)
# ----------------------------------------------------------------------
def upsert(cur, sql, params):
    """Exécute une requête INSERT avec gestion du duplicate."""
    cur.execute(sql, params)

# ----------------------------------------------------------------------
# 6️⃣ CONNEXION MYSQL
# ----------------------------------------------------------------------
try:
    conn   = mysql.connector.connect(**MYSQL_CONFIG)
    cursor = conn.cursor()
except mysql.connector.Error as err:
    sys.exit(f"❌  Erreur de connexion MySQL : {err}")

# ----------------------------------------------------------------------
# 7️⃣ INSERTION DES SUPERMARCHÉS
# ----------------------------------------------------------------------
print("🔹 Insertion des supermarchés")
sup = df[["Supermarche", "Quartier"]].drop_duplicates()
for _, r in sup.iterrows():
    upsert(
        cursor,
        """
        INSERT INTO supermarches (nom, quartier)
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE nom = nom
        """,
        (r["Supermarche"], r["Quartier"]),
    )
conn.commit()

# Mapping nom → id_supermarche
cursor.execute("SELECT id_supermarche, nom FROM supermarches")
supermarches_map = {nom: sid for sid, nom in cursor.fetchall()}

# ----------------------------------------------------------------------
# 8️⃣ INSERTION DES CATÉGORIES
# ----------------------------------------------------------------------
print("🔹 Insertion des catégories")
for cat in df["Categorie"].dropna().unique():
    upsert(
        cursor,
        """
        INSERT INTO categories (nom)
        VALUES (%s)
        ON DUPLICATE KEY UPDATE nom = nom
        """,
        (cat.strip(),),
    )
conn.commit()

# Mapping nom → id_categorie
cursor.execute("SELECT id_categorie, nom FROM categories")
categories_map = {nom.strip(): cid for cid, nom in cursor.fetchall()}

# ----------------------------------------------------------------------
# 9️⃣ GÉRER UNE CATEGORIE « INCONNU » AU CAS OÙ UNE LIGNE N’A PAS DE CATEGORIE
# ----------------------------------------------------------------------
UNKNOWN_CAT = "Inconnu"
if UNKNOWN_CAT not in categories_map:
    upsert(
        cursor,
        """
        INSERT INTO categories (nom) VALUES (%s)
        ON DUPLICATE KEY UPDATE nom = nom
        """,
        (UNKNOWN_CAT,),
    )
    conn.commit()
    cursor.execute("SELECT id_categorie FROM categories WHERE nom = %s", (UNKNOWN_CAT,))
    unknown_cat_id = cursor.fetchone()[0]
    categories_map[UNKNOWN_CAT] = unknown_cat_id
else:
    unknown_cat_id = categories_map[UNKNOWN_CAT]

# ----------------------------------------------------------------------
# 10️⃣ INSERTION DES PRODUITS
# ----------------------------------------------------------------------
print("🔹 Insertion des produits")
produits = df[["Produit", "Categorie", "Prix_Unitaire"]].drop_duplicates()

for _, r in produits.iterrows():
    # Nettoyer le nom du produit
    produit_nom = clean_string(r["Produit"])
    if produit_nom is None:
        continue          # aucune désignation → on saute la ligne

    # Catégorie (peut être None) → on utilise « Inconnu » comme fallback
    cat_raw = r["Categorie"]
    if pd.isna(cat_raw):
        cat_id = unknown_cat_id
    else:
        cat_name = cat_raw.strip()
        cat_id = categories_map.get(cat_name, unknown_cat_id)

    upsert(
        cursor,
        """
        INSERT INTO produits (nom, id_categorie, prix_unitaire)
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE prix_unitaire = VALUES(prix_unitaire)
        """,
        (produit_nom, cat_id, r["Prix_Unitaire"]),
    )
conn.commit()

# Mapping produit → id_produit
cursor.execute("SELECT id_produit, nom FROM produits")
produits_map = {nom: pid for pid, nom in cursor.fetchall()}

# ----------------------------------------------------------------------
# 11️⃣ INSERTION DES CAISSIERS (ID fourni dans le CSV)
# ----------------------------------------------------------------------
print("🔹 Insertion des caissiers")
caissiers = df[["Caissier_ID", "Supermarche"]].drop_duplicates()
for _, r in caissiers.iterrows():
    caissier_id = r["Caissier_ID"]
    if caissier_id is None:
        continue          # pas d’ID → on ne crée pas la ligne
    upsert(
        cursor,
        """
        INSERT IGNORE INTO caissiers (id_caissier, id_supermarche)
        VALUES (%s, %s)
        """,
        (caissier_id, supermarches_map[r["Supermarche"]]),
    )
conn.commit()

# ----------------------------------------------------------------------
# 12️⃣ INSERTION DES CAISSES (ID fourni dans le CSV)
# ----------------------------------------------------------------------
print("🔹 Insertion des caisses")
caisses = df[["Caisse_ID", "Supermarche"]].drop_duplicates()
for _, r in caisses.iterrows():
    caisse_id = r["Caisse_ID"]
    if caisse_id is None:
        continue
    upsert(
        cursor,
        """
        INSERT IGNORE INTO caisses (id_caisse, id_supermarche)
        VALUES (%s, %s)
        """,
        (caisse_id, supermarches_map[r["Supermarche"]]),
    )
conn.commit()

# ----------------------------------------------------------------------
# 13️⃣ INSERTION DES CLIENTS (ID fourni dans le CSV)
# ----------------------------------------------------------------------
print("🔹 Insertion des clients")
clients = df[["Client_ID"]].drop_duplicates()
for _, r in clients.iterrows():
    client_id = r["Client_ID"]
    if client_id is None:
        continue
    upsert(
        cursor,
        """
        INSERT IGNORE INTO clients (id_client)
        VALUES (%s)
        """,
        (client_id,),
    )
conn.commit()

# ----------------------------------------------------------------------
# 14️⃣ INSERTION DES VENTES
# ----------------------------------------------------------------------
print("🔹 Insertion des ventes")
ventes_cols = [
    "Vente_ID", "Date", "Heure", "Caisse_ID", "Caissier_ID",
    "Client_ID", "Type_Paiement", "Montant_Total", "Remise_Totale", "Devise",
]
ventes = df[ventes_cols].drop_duplicates()

for _, v in ventes.iterrows():
    # Fonction de nettoyage simple pour les champs scalar
    def c(x): return None if pd.isna(x) else x

    upsert(
        cursor,
        """
        INSERT IGNORE INTO ventes (
            id_vente, date_vente, heure_vente,
            id_caisse, id_caissier, id_client,
            type_paiement, montant_total, remise_totale, devise
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """,
        (
            c(v["Vente_ID"]),
            c(v["Date"]),
            c(v["Heure"]),
            c(v["Caisse_ID"]),
            c(v["Caissier_ID"]),
            c(v["Client_ID"]),
            c(v["Type_Paiement"]),
            c(v["Montant_Total"]),
            c(v["Remise_Totale"]),
            c(v["Devise"]),
        ),
    )
conn.commit()

# ----------------------------------------------------------------------
# 15️⃣ INSERTION DES DÉTAILS DE VENTE
# ----------------------------------------------------------------------
print("🔹 Insertion des détails de vente")
detail_cols = [
    "Vente_ID", "Produit", "Quantite", "Prix_Unitaire",
    "Remise", "Prix_Total"
]

for _, r in df[detail_cols].iterrows():
    if r["Vente_ID"] is None:          # aucune transaction → on ignore
        continue

    produit_nom = clean_string(r["Produit"])
    if produit_nom is None or produit_nom not in produits_map:
        # Si le produit n’a jamais été inséré, on le crée “à la volée”
        upsert(
            cursor,
            """
            INSERT INTO produits (nom, id_categorie, prix_unitaire)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE prix_unitaire = VALUES(prix_unitaire)
            """,
            (produit_nom, unknown_cat_id, r["Prix_Unitaire"]),
        )
        conn.commit()
        cursor.execute(
            "SELECT id_produit FROM produits WHERE nom = %s", (produit_nom,)
        )
        prod_id = cursor.fetchone()[0]
        produits_map[produit_nom] = prod_id
    else:
        prod_id = produits_map[produit_nom]

    upsert(
        cursor,
        """
        INSERT INTO vente_details (
            id_vente, id_produit, quantite,
            prix_unitaire, remise, prix_total
        ) VALUES (%s,%s,%s,%s,%s,%s)
        """,
        (
            r["Vente_ID"],
            prod_id,
            r["Quantite"],
            r["Prix_Unitaire"],
            r["Remise"],
            r["Prix_Total"],
        ),
    )
conn.commit()

# ----------------------------------------------------------------------
# 16️⃣ FIN DE TRAITEMENT
# ----------------------------------------------------------------------
cursor.close()
conn.close()
print("\n✅  IMPORTATION TERMINÉE AVEC SUCCÈS !")
