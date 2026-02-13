import React, { useMemo } from 'react';
import sampleData from '../../data/sample_transactions.json';
import analytics from '../basic-ui/analyticsUtils';

/**
 * SalesAnalytics component — computes and shows the 15 requested metrics.
 * This component is intentionally self-contained and uses the sample dataset
 * from src/data/sample_transactions.json. You can replace the data import
 * with an API fetch or pass `transactions` as a prop to integrate into your app.
 */

export default function SalesAnalytics({ transactions = sampleData }) {
  const metrics = useMemo(() => analytics.computeAllMetrics(transactions), [transactions]);

  return (
    <div className="card mt-4">
      <div className="card-body">
        <h4 className="card-title"><b>Analyse des ventes (exemple)</b></h4>
        <p className="text-muted">Jeu de données exemple — remplacez par vos transactions réelles.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <h5>1) Chiffre d'affaires total</h5>
            <p><b>{metrics.totalRevenue.toFixed(2)} €</b></p>

            <h5>2) Nombre de ventes réalisées</h5>
            <p><b>{metrics.totalSalesCount}</b></p>

            <h5>3) Panier moyen</h5>
            <p><b>{metrics.averageBasket.toFixed(2)} €</b></p>

            <h5>4) Remise totale</h5>
            <p><b>{metrics.totalDiscount.toFixed(2)} €</b></p>

            <h5>5) Répartition CA par type de paiement</h5>
            <ul>
              {Object.entries(metrics.revenueByPaymentType).map(([k, v]) => (
                <li key={k}><b>{k}</b>: {v.toFixed(2)} €</li>
              ))}
            </ul>
          </div>

          <div>
            <h5>6) Supermarché avec CA le plus élevé</h5>
            <p><b>{metrics.topSupermarketByRevenue?.store || '-'} — {metrics.topSupermarketByRevenue?.revenue?.toFixed(2) || 0} €</b></p>

            <h5>7) Quartier ayant enregistré le plus grand nombre de ventes</h5>
            <p><b>{metrics.neighborhoodWithMostSales?.neighborhood || '-'} — {metrics.neighborhoodWithMostSales?.sales || 0} ventes</b></p>

            <h5>8) Panier moyen par supermarché</h5>
            <ul>
              {Object.entries(metrics.averageBasketBySupermarket).map(([s, v]) => (
                <li key={s}><b>{s}</b>: {v.toFixed(2)} €</li>
              ))}
            </ul>

            <h5>9) Heure de pointe par supermarché</h5>
            <ul>
              {Object.entries(metrics.peakHourBySupermarket).map(([s, v]) => (
                <li key={s}><b>{s}</b>: {v ? `${String(v.hour).padStart(2, '0')}:00 — ${v.sales} ventes` : '-'}</li>
              ))}
            </ul>

            <h5>10) Remise moyenne par supermarché</h5>
            <ul>
              {Object.entries(metrics.averageDiscountBySupermarket).map(([s, v]) => (
                <li key={s}><b>{s}</b>: {v.toFixed(2)} €</li>
              ))}
            </ul>
          </div>
        </div>

        <hr />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <h5>11) CA total par catégorie</h5>
            <ul>
              {Object.entries(metrics.revenueByCategory).map(([cat, val]) => (
                <li key={cat}><b>{cat}</b>: {val.toFixed(2)} €</li>
              ))}
            </ul>

            <h5>12) 10 produits les plus vendus (quantité)</h5>
            <ol>
              {metrics.topProductsByQuantity.map(p => (
                <li key={p.product_id}>{p.product_name} — {p.quantity} pcs</li>
              ))}
            </ol>
          </div>

          <div>
            <h5>13) 10 produits générant le plus de CA</h5>
            <ol>
              {metrics.topProductsByRevenue.map(p => (
                <li key={p.product_id}>{p.product_name} — {p.revenue.toFixed(2)} €</li>
              ))}
            </ol>

            <h5>14) Prix unitaire moyen par catégorie</h5>
            <ul>
              {Object.entries(metrics.averageUnitPriceByCategory).map(([cat, v]) => (
                <li key={cat}><b>{cat}</b>: {v.toFixed(2)} €</li>
              ))}
            </ul>

            <h5>15) Produits ayant généré le plus de remises</h5>
            <ol>
              {metrics.productsGeneratingMostDiscounts.map(p => (
                <li key={p.product_id}>{p.product_name} — {p.discounts.toFixed(2)} €</li>
              ))}
            </ol>
          </div>
        </div>

        <hr />
        <p className="text-muted">Notes: remplacez l'import de données par votre API (ou passez `transactions` en prop) pour calculer ces indicateurs en production.</p>
      </div>
    </div>
  );
}
