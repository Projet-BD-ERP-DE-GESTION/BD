/* Utility functions to compute sales analytics metrics from a transactions array.

Each transaction should follow this shape (example in src/data/sample_transactions.json):
{
  transaction_id, store, neighborhood, timestamp, payment_type,
  total_amount, discount_amount, items: [{ product_id, product_name, category, quantity, unit_price, discount }]
}

The functions below compute the 15 analytics metrics requested by the user.
*/

export function totalRevenue(transactions) {
  return transactions.reduce((s, t) => s + Number(t.total_amount || 0), 0);
}

export function totalSalesCount(transactions) {
  const ids = new Set(transactions.map(t => t.transaction_id));
  return ids.size;
}

export function averageBasket(transactions) {
  const total = totalRevenue(transactions);
  const count = totalSalesCount(transactions) || 1;
  return total / count;
}

export function totalDiscount(transactions) {
  return transactions.reduce((s, t) => s + Number(t.discount_amount || 0), 0);
}

export function revenueByPaymentType(transactions) {
  return transactions.reduce((acc, t) => {
    const k = t.payment_type || 'unknown';
    acc[k] = (acc[k] || 0) + Number(t.total_amount || 0);
    return acc;
  }, {});
}

export function revenueByStore(transactions) {
  return transactions.reduce((acc, t) => {
    const k = t.store || 'unknown';
    acc[k] = (acc[k] || 0) + Number(t.total_amount || 0);
    return acc;
  }, {});
}

export function topSupermarketByRevenue(transactions) {
  const byStore = revenueByStore(transactions);
  const entries = Object.entries(byStore);
  if (!entries.length) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return { store: entries[0][0], revenue: entries[0][1] };
}

export function salesCountByNeighborhood(transactions) {
  return transactions.reduce((acc, t) => {
    const k = t.neighborhood || 'unknown';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

export function neighborhoodWithMostSales(transactions) {
  const byNeighborhood = salesCountByNeighborhood(transactions);
  const entries = Object.entries(byNeighborhood);
  if (!entries.length) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return { neighborhood: entries[0][0], sales: entries[0][1] };
}

export function averageBasketBySupermarket(transactions) {
  const map = transactions.reduce((acc, t) => {
    const k = t.store || 'unknown';
    acc[k] = acc[k] || { revenue: 0, count: 0 };
    acc[k].revenue += Number(t.total_amount || 0);
    acc[k].count += 1;
    return acc;
  }, {});

  return Object.fromEntries(Object.entries(map).map(([store, v]) => [store, v.revenue / (v.count || 1)]));
}

export function peakHourBySupermarket(transactions) {
  // returns hour (0-23) with most sales per store
  const map = {};
  transactions.forEach(t => {
    const store = t.store || 'unknown';
    const d = new Date(t.timestamp);
    const hour = d.getHours();
    map[store] = map[store] || {};
    map[store][hour] = (map[store][hour] || 0) + 1;
  });

  const result = {};
  Object.entries(map).forEach(([store, hours]) => {
    const entries = Object.entries(hours);
    if (!entries.length) { result[store] = null; return; }
    entries.sort((a, b) => b[1] - a[1]);
    result[store] = { hour: Number(entries[0][0]), sales: entries[0][1] };
  });
  return result;
}

export function averageDiscountBySupermarket(transactions) {
  const map = transactions.reduce((acc, t) => {
    const k = t.store || 'unknown';
    acc[k] = acc[k] || { discount: 0, count: 0 };
    acc[k].discount += Number(t.discount_amount || 0);
    acc[k].count += 1;
    return acc;
  }, {});

  return Object.fromEntries(Object.entries(map).map(([store, v]) => [store, v.discount / (v.count || 1)]));
}

// Category and product-level metrics (derived from items array inside transactions)
function flattenItems(transactions) {
  const arr = [];
  transactions.forEach(t => {
    (t.items || []).forEach(it => {
      arr.push({
        transaction_id: t.transaction_id,
        store: t.store,
        neighborhood: t.neighborhood,
        timestamp: t.timestamp,
        payment_type: t.payment_type,
        ...it
      });
    });
  });
  return arr;
}

export function revenueByCategory(transactions) {
  const items = flattenItems(transactions);
  return items.reduce((acc, it) => {
    const cat = it.category || 'unknown';
    const itemRevenue = (Number(it.unit_price || 0) * Number(it.quantity || 0)) - Number(it.discount || 0);
    acc[cat] = (acc[cat] || 0) + itemRevenue;
    return acc;
  }, {});
}

export function topProductsByQuantity(transactions, topN = 10) {
  const items = flattenItems(transactions);
  const byProduct = items.reduce((acc, it) => {
    const id = it.product_id || it.product_name || 'unknown';
    acc[id] = acc[id] || { product_name: it.product_name, quantity: 0 };
    acc[id].quantity += Number(it.quantity || 0);
    return acc;
  }, {});
  return Object.entries(byProduct).map(([id, v]) => ({ product_id: id, product_name: v.product_name, quantity: v.quantity })).sort((a, b) => b.quantity - a.quantity).slice(0, topN);
}

export function topProductsByRevenue(transactions, topN = 10) {
  const items = flattenItems(transactions);
  const byProduct = items.reduce((acc, it) => {
    const id = it.product_id || it.product_name || 'unknown';
    acc[id] = acc[id] || { product_name: it.product_name, revenue: 0 };
    acc[id].revenue += Number(it.unit_price || 0) * Number(it.quantity || 0) - Number(it.discount || 0);
    return acc;
  }, {});
  return Object.entries(byProduct).map(([id, v]) => ({ product_id: id, product_name: v.product_name, revenue: v.revenue })).sort((a, b) => b.revenue - a.revenue).slice(0, topN);
}

export function averageUnitPriceByCategory(transactions) {
  const items = flattenItems(transactions);
  const map = items.reduce((acc, it) => {
    const cat = it.category || 'unknown';
    acc[cat] = acc[cat] || { totalPrice: 0, totalQty: 0 };
    acc[cat].totalPrice += Number(it.unit_price || 0) * Number(it.quantity || 0);
    acc[cat].totalQty += Number(it.quantity || 0);
    return acc;
  }, {});
  return Object.fromEntries(Object.entries(map).map(([cat, v]) => [cat, v.totalQty ? v.totalPrice / v.totalQty : 0]));
}

export function productsGeneratingMostDiscounts(transactions, topN = 10) {
  const items = flattenItems(transactions);
  const byProduct = items.reduce((acc, it) => {
    const id = it.product_id || it.product_name || 'unknown';
    acc[id] = acc[id] || { product_name: it.product_name, discounts: 0 };
    acc[id].discounts += Number(it.discount || 0);
    return acc;
  }, {});
  return Object.entries(byProduct).map(([id, v]) => ({ product_id: id, product_name: v.product_name, discounts: v.discounts })).sort((a, b) => b.discounts - a.discounts).slice(0, topN);
}

// Combined helper that returns every metric in a single object
export function computeAllMetrics(transactions) {
  return {
    totalRevenue: totalRevenue(transactions),
    totalSalesCount: totalSalesCount(transactions),
    averageBasket: averageBasket(transactions),
    totalDiscount: totalDiscount(transactions),
    revenueByPaymentType: revenueByPaymentType(transactions),
    topSupermarketByRevenue: topSupermarketByRevenue(transactions),
    neighborhoodWithMostSales: neighborhoodWithMostSales(transactions),
    averageBasketBySupermarket: averageBasketBySupermarket(transactions),
    peakHourBySupermarket: peakHourBySupermarket(transactions),
    averageDiscountBySupermarket: averageDiscountBySupermarket(transactions),
    revenueByCategory: revenueByCategory(transactions),
    topProductsByQuantity: topProductsByQuantity(transactions, 10),
    topProductsByRevenue: topProductsByRevenue(transactions, 10),
    averageUnitPriceByCategory: averageUnitPriceByCategory(transactions),
    productsGeneratingMostDiscounts: productsGeneratingMostDiscounts(transactions, 10)
  };
}

export default {
  totalRevenue,
  totalSalesCount,
  averageBasket,
  totalDiscount,
  revenueByPaymentType,
  revenueByStore,
  topSupermarketByRevenue,
  salesCountByNeighborhood,
  neighborhoodWithMostSales,
  averageBasketBySupermarket,
  peakHourBySupermarket,
  averageDiscountBySupermarket,
  revenueByCategory,
  topProductsByQuantity,
  topProductsByRevenue,
  averageUnitPriceByCategory,
  productsGeneratingMostDiscounts,
  computeAllMetrics
};
