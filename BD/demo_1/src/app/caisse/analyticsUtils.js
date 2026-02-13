// Utility functions for analytics calculations (single store version)

export const calculateTotalRevenue = (transactions) => {
  return transactions.reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
};

export const calculateTotalTransactions = (transactions) => {
  return transactions.length;
};

export const calculateAverageBasketValue = (transactions) => {
  if (!transactions.length) return 0;
  return calculateTotalRevenue(transactions) / transactions.length;
};

export const calculateTotalItems = (transactions) => {
  return transactions.reduce((sum, t) => sum + (t.items || []).length, 0);
};

export const calculateTotalDiscount = (transactions) => {
  return transactions.reduce((sum, t) => sum + Number(t.discount_amount || 0), 0);
};

export const calculateRevenueByPaymentMethod = (transactions) => {
  const breakdown = {};
  transactions.forEach(t => {
    const method = t.payment_type || 'autre';
    if (!breakdown[method]) {
      breakdown[method] = { revenue: 0, count: 0 };
    }
    breakdown[method].revenue += Number(t.total_amount || 0);
    breakdown[method].count += 1;
  });
  return breakdown;
};

export const calculateRevenueByCategory = (transactions) => {
  const breakdown = {};
  transactions.forEach(t => {
    (t.items || []).forEach(item => {
      const category = item.category || 'autre';
      if (!breakdown[category]) {
        breakdown[category] = { revenue: 0, quantity: 0, count: 0 };
      }
      const itemRevenue = (Number(item.unit_price) || 0) * (Number(item.quantity) || 0);
      breakdown[category].revenue += itemRevenue;
      breakdown[category].quantity += Number(item.quantity) || 0;
      breakdown[category].count += 1;
    });
  });
  return breakdown;
};

export const calculateTopProducts = (transactions, limit = 10) => {
  const products = {};
  transactions.forEach(t => {
    (t.items || []).forEach(item => {
      const name = item.product_name || 'Unknown';
      if (!products[name]) {
        products[name] = { revenue: 0, quantity: 0, category: item.category };
      }
      const revenue = (Number(item.unit_price) || 0) * (Number(item.quantity) || 0);
      products[name].revenue += revenue;
      products[name].quantity += Number(item.quantity) || 0;
    });
  });
  
  return Object.entries(products)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, limit)
    .map(([name, data]) => ({ name, ...data }));
};

export const calculateHourlyDistribution = (transactions) => {
  const hourly = Array(24).fill(0);
  transactions.forEach(t => {
    const hour = new Date(t.timestamp).getHours();
    hourly[hour] += 1;
  });
  return hourly;
};

export const calculateDailyRevenue = (transactions) => {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const daily = {};
  days.forEach(d => { daily[d] = 0; });

  transactions.forEach(t => {
    const d = new Date(t.timestamp);
    const dayOfWeek = d.getDay();
    const dayName = days[(dayOfWeek + 6) % 7];
    if (daily[dayName] !== undefined) {
      daily[dayName] += Number(t.total_amount || 0);
    }
  });
  return daily;
};

export const calculateDailyTransactions = (transactions) => {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const daily = {};
  days.forEach(d => { daily[d] = 0; });

  transactions.forEach(t => {
    const d = new Date(t.timestamp);
    const dayOfWeek = d.getDay();
    const dayName = days[(dayOfWeek + 6) % 7];
    if (daily[dayName] !== undefined) {
      daily[dayName] += 1;
    }
  });
  return daily;
};

export const calculateAverageTransactionTime = (transactions) => {
  if (!transactions.length) return 0;
  // Simulated average (in minutes) - based on number of items
  const totalItems = calculateTotalItems(transactions);
  return Math.round((totalItems / transactions.length) * 2); // ~2 min per item
};

export const calculatePeakHours = (transactions) => {
  const hourly = calculateHourlyDistribution(transactions);
  return hourly
    .map((count, hour) => ({ hour: `${String(hour).padStart(2, '0')}:00`, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

export const calculateProductFrequency = (transactions) => {
  const products = {};
  transactions.forEach(t => {
    (t.items || []).forEach(item => {
      const name = item.product_name || 'Unknown';
      if (!products[name]) {
        products[name] = { frequency: 0, category: item.category };
      }
      products[name].frequency += 1;
    });
  });
  
  return Object.entries(products)
    .sort((a, b) => b[1].frequency - a[1].frequency)
    .slice(0, 10)
    .map(([name, data]) => ({ name, ...data }));
};

export const filterTransactionsByDate = (transactions, startDate, endDate) => {
  return transactions.filter(t => {
    const tDate = new Date(t.timestamp);
    return tDate >= startDate && tDate <= endDate;
  });
};
