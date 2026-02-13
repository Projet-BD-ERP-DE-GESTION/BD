# Requêtes SQL pour les 15 indicateurs (exemples)

Suppositions de schéma relationnel (exemple) :

- transactions(id, transaction_id, store, neighborhood, timestamp, payment_type, total_amount, discount_amount)
- transaction_items(id, transaction_id, product_id, product_name, category, unit_price, quantity, discount)

Remplacez les noms de table et colonnes si nécessaire.

---

1) Chiffre d'affaires total (Montant_Total) de la journée

SQL (pour une date précise : 2025-11-27) :

```sql
SELECT SUM(total_amount) AS montant_total
FROM transactions
WHERE DATE(timestamp) = '2025-11-27';
```

2) Nombre total de ventes (transactions uniques)

```sql
SELECT COUNT(DISTINCT transaction_id) AS ventes_total
FROM transactions
WHERE DATE(timestamp) = '2025-11-27';
```

3) Panier moyen par vente (CA total / nombre de ventes)

```sql
SELECT
  SUM(total_amount) / NULLIF(COUNT(DISTINCT transaction_id), 0) AS panier_moyen
FROM transactions
WHERE DATE(timestamp) = '2025-11-27';
```

4) Remise totale appliquée sur l’ensemble des ventes

```sql
SELECT SUM(discount_amount) AS remise_totale
FROM transactions
WHERE DATE(timestamp) = '2025-11-27';
```

5) Répartition du chiffre d’affaires par type de paiement

```sql
SELECT payment_type, SUM(total_amount) AS ca_par_type
FROM transactions
WHERE DATE(timestamp) = '2025-11-27'
GROUP BY payment_type
ORDER BY ca_par_type DESC;
```

--- Supermarché et quartier ---

6) Supermarché qui génère le CA le plus élevé

```sql
SELECT store, SUM(total_amount) AS ca_store
FROM transactions
WHERE DATE(timestamp) = '2025-11-27'
GROUP BY store
ORDER BY ca_store DESC
LIMIT 1;
```

7) Quartier ayant enregistré le plus grand nombre de ventes

```sql
SELECT neighborhood, COUNT(DISTINCT transaction_id) AS ventes
FROM transactions
WHERE DATE(timestamp) = '2025-11-27'
GROUP BY neighborhood
ORDER BY ventes DESC
LIMIT 1;
```

8) Panier moyen par supermarché

```sql
SELECT store, SUM(total_amount) / NULLIF(COUNT(DISTINCT transaction_id),0) AS panier_moyen
FROM transactions
WHERE DATE(timestamp) = '2025-11-27'
GROUP BY store
ORDER BY panier_moyen DESC;
```

9) Heure de pointe par supermarché (heure avec le plus de transactions)

```sql
SELECT store, EXTRACT(HOUR FROM timestamp) AS heure, COUNT(*) AS ventes
FROM transactions
WHERE DATE(timestamp) = '2025-11-27'
GROUP BY store, EXTRACT(HOUR FROM timestamp)
ORDER BY store, ventes DESC;
```

Pour obtenir uniquement l'heure de pointe par store vous pouvez utiliser une sous-requête ou window functions selon SGBD :

```sql
SELECT store, heure, ventes FROM (
  SELECT store, EXTRACT(HOUR FROM timestamp) AS heure, COUNT(*) AS ventes,
     ROW_NUMBER() OVER(PARTITION BY store ORDER BY COUNT(*) DESC) AS rn
  FROM transactions
  WHERE DATE(timestamp) = '2025-11-27'
  GROUP BY store, EXTRACT(HOUR FROM timestamp)
) x WHERE rn = 1;
```

10) Remise moyenne appliquée par supermarché

```sql
SELECT store, AVG(discount_amount) AS remise_moyenne
FROM transactions
WHERE DATE(timestamp) = '2025-11-27'
GROUP BY store
ORDER BY remise_moyenne DESC;
```

--- Catégories et produits ---

11) Chiffre d’affaires total par catégorie de produit

```sql
SELECT ti.category, SUM(ti.unit_price * ti.quantity - COALESCE(ti.discount,0)) AS ca_par_categorie
FROM transaction_items ti
JOIN transactions t ON t.transaction_id = ti.transaction_id
WHERE DATE(t.timestamp) = '2025-11-27'
GROUP BY ti.category
ORDER BY ca_par_categorie DESC;
```

12) Les 10 produits les plus vendus en quantité

```sql
SELECT ti.product_id, ti.product_name, SUM(ti.quantity) AS total_qte
FROM transaction_items ti
JOIN transactions t ON t.transaction_id = ti.transaction_id
WHERE DATE(t.timestamp) = '2025-11-27'
GROUP BY ti.product_id, ti.product_name
ORDER BY total_qte DESC LIMIT 10;
```

13) Les 10 produits générant le plus de CA

```sql
SELECT ti.product_id, ti.product_name, SUM(ti.unit_price * ti.quantity - COALESCE(ti.discount,0)) AS ca_produit
FROM transaction_items ti
JOIN transactions t ON t.transaction_id = ti.transaction_id
WHERE DATE(t.timestamp) = '2025-11-27'
GROUP BY ti.product_id, ti.product_name
ORDER BY ca_produit DESC LIMIT 10;
```

14) Prix unitaire moyen par catégorie

```sql
SELECT category, SUM(unit_price * quantity) / NULLIF(SUM(quantity),0) AS prix_unitaire_moyen
FROM transaction_items ti
JOIN transactions t ON t.transaction_id = ti.transaction_id
WHERE DATE(t.timestamp) = '2025-11-27'
GROUP BY category
ORDER BY prix_unitaire_moyen DESC;
```

15) Produits ayant généré le plus de remises

```sql
SELECT product_id, product_name, SUM(COALESCE(discount,0)) AS total_remises
FROM transaction_items ti
JOIN transactions t ON t.transaction_id = ti.transaction_id
WHERE DATE(t.timestamp) = '2025-11-27'
GROUP BY product_id, product_name
ORDER BY total_remises DESC LIMIT 10;
```

---

Conseils:
- Indexez transactions(timestamp) pour les filtres par date.
- Si vos remises sont stockées uniquement sur la table transactions, adaptez les jointures.
- Utilisez window functions pour calculs plus avancés (ex : heure de pointe unique par magasin).
