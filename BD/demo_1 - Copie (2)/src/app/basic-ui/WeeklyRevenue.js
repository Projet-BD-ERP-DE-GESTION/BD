import React, { useMemo } from 'react';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import sampleData from '../../data/sample_transactions_weekly.json';

/**
 * WeeklyRevenue — Dashboard for weekly revenue with multiple chart types.
 * Shows revenue trends, category breakdown, payment methods, and store performance.
 * Minimal text, chart-driven layout matching the dashboard style.
 */

export default function WeeklyRevenue({ transactions = sampleData }) {
  // Group transactions by day of week
  const groupedByDay = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const dayMap = {};
    days.forEach(d => { dayMap[d] = []; });
    
    transactions.forEach(t => {
      const d = new Date(t.timestamp);
      const dayOfWeek = d.getDay();
      const dayName = days[(dayOfWeek + 6) % 7]; // adjust Mon=0
      if (dayMap[dayName]) dayMap[dayName].push(t);
    });
    return dayMap;
  }, [transactions]);

  // Compute daily revenue, transactions, avg basket
  const dailyMetrics = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const metrics = {};
    days.forEach(day => {
      const dayTxn = groupedByDay[day] || [];
      metrics[day] = {
        revenue: dayTxn.reduce((s, t) => s + Number(t.total_amount || 0), 0),
        count: dayTxn.length,
        avgBasket: dayTxn.length > 0 ? dayTxn.reduce((s, t) => s + Number(t.total_amount || 0), 0) / dayTxn.length : 0,
        discount: dayTxn.reduce((s, t) => s + Number(t.discount_amount || 0), 0)
      };
    });
    return metrics;
  }, [groupedByDay]);

  // Category revenue for the week
  const catRevenue = useMemo(() => {
    const cat = {};
    transactions.forEach(t => {
      (t.items || []).forEach(it => {
        const c = it.category || 'other';
        const itemRev = Number(it.unit_price || 0) * Number(it.quantity || 0) - Number(it.discount || 0);
        cat[c] = (cat[c] || 0) + itemRev;
      });
    });
    return cat;
  }, [transactions]);

  // Payment type revenue
  const paymentRevenue = useMemo(() => {
    const pay = {};
    transactions.forEach(t => {
      const p = t.payment_type || 'unknown';
      pay[p] = (pay[p] || 0) + Number(t.total_amount || 0);
    });
    return pay;
  }, [transactions]);

  // Store performance
  const storeRevenue = useMemo(() => {
    const stores = {};
    transactions.forEach(t => {
      const s = t.store || 'unknown';
      stores[s] = (stores[s] || 0) + Number(t.total_amount || 0);
    });
    return stores;
  }, [transactions]);

  // Chart helpers
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const colors = ['#8862e0','#19d895','#2196f3','#ffd166','#ff7b7b','#f96332','#8ad3ff'];

  // Q1: Daily revenue trend (line)
  const dailyRevenueChart = {
    labels: days,
    datasets: [{
      label: 'CA journalier (€)',
      data: days.map(d => dailyMetrics[d]?.revenue || 0),
      borderColor: '#8862e0',
      backgroundColor: 'rgba(136,98,224,0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  // Q2: Daily transactions count (bar)
  const dailyTransactionChart = {
    labels: days,
    datasets: [{
      label: 'Nombre de transactions',
      data: days.map(d => dailyMetrics[d]?.count || 0),
      backgroundColor: ['#19d895','#2196f3','#8862e0','#ffd166','#ff7b7b','#f96332','#8ad3ff']
    }]
  };

  // Q3: Daily average basket (bar)
  const dailyBasketChart = {
    labels: days,
    datasets: [{
      label: 'Panier moyen (€)',
      data: days.map(d => dailyMetrics[d]?.avgBasket || 0),
      backgroundColor: '#5ed2a1'
    }]
  };

  // Q4: Daily discounts (line)
  const dailyDiscountChart = {
    labels: days,
    datasets: [{
      label: 'Remises totales (€)',
      data: days.map(d => dailyMetrics[d]?.discount || 0),
      borderColor: '#ff7b7b',
      backgroundColor: 'rgba(255,123,123,0.1)',
      fill: true,
      tension: 0.3
    }]
  };

  // Q5: Category breakdown (pie)
  const categoryChart = {
    labels: Object.keys(catRevenue),
    datasets: [{
      data: Object.values(catRevenue),
      backgroundColor: colors
    }]
  };

  // Q6: Payment methods (doughnut)
  const paymentChart = {
    labels: Object.keys(paymentRevenue),
    datasets: [{
      data: Object.values(paymentRevenue),
      backgroundColor: ['#8862e0','#19d895','#2196f3','#ffd166']
    }]
  };

  // Q7: Store performance (bar horizontal)
  const storeEntries = Object.entries(storeRevenue).sort((a,b) => b[1]-a[1]);
  const storeChart = {
    labels: storeEntries.map(x => x[0]),
    datasets: [{
      label: 'CA (€)',
      data: storeEntries.map(x => x[1]),
      backgroundColor: ['#8862e0','#19d895','#2196f3']
    }]
  };

  // Q8: Revenue vs Discount comparison (stacked area)
  const revenuVsDiscountChart = {
    labels: days,
    datasets: [
      {
        label: 'Revenu (€)',
        data: days.map(d => dailyMetrics[d]?.revenue || 0),
        borderColor: '#19d895',
        backgroundColor: 'rgba(25,216,149,0.3)',
        fill: true
      },
      {
        label: 'Remises (€)',
        data: days.map(d => dailyMetrics[d]?.discount || 0),
        borderColor: '#ff7b7b',
        backgroundColor: 'rgba(255,123,123,0.3)',
        fill: true
      }
    ]
  };

  // Q9: Cumulative revenue (line)
  const cumulativeRevenue = useMemo(() => {
    let sum = 0;
    return days.map(d => {
      sum += dailyMetrics[d]?.revenue || 0;
      return sum;
    });
  }, [dailyMetrics]);

  const cumulativeChart = {
    labels: days,
    datasets: [{
      label: 'Revenu cumulé (€)',
      data: cumulativeRevenue,
      borderColor: '#ffd166',
      backgroundColor: 'rgba(255,209,102,0.15)',
      fill: true,
      tension: 0.3
    }]
  };

  const chartOptions = { maintainAspectRatio: true, responsive: true, legend: { display: true } };

  // Compute weekly totals
  const weeklyTotal = days.reduce((s, d) => s + (dailyMetrics[d]?.revenue || 0), 0);
  const weeklyTransactions = days.reduce((s, d) => s + (dailyMetrics[d]?.count || 0), 0);
  const weeklyAvgBasket = weeklyTransactions > 0 ? weeklyTotal / weeklyTransactions : 0;
  const weeklyDiscounts = days.reduce((s, d) => s + (dailyMetrics[d]?.discount || 0), 0);

  return (
    <div>
      <div className="row page-title-header">
        <div className="col-12">
          <div className="page-header">
            <h4 className="page-title">Recettes de la Semaine</h4>
            <p>Tendances et performances hebdomadaires</p>
          </div>
        </div>
      </div>

      {/* Top KPI cards */}
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-xl-3 col-lg-6 col-sm-6 grid-margin-xl-0 grid-margin">
                  <div className="d-flex">
                    <div className="wrapper">
                      <h3 className="mb-0 font-weight-semibold">{weeklyTotal.toFixed(0)} €</h3>
                      <h5 className="mb-0 font-weight-medium text-primary">Total Semaine</h5>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                  <div className="d-flex">
                    <div className="wrapper">
                      <h3 className="mb-0 font-weight-semibold">{weeklyTransactions}</h3>
                      <h5 className="mb-0 font-weight-medium text-primary">Transactions</h5>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                  <div className="d-flex">
                    <div className="wrapper">
                      <h3 className="mb-0 font-weight-semibold">{weeklyAvgBasket.toFixed(2)} €</h3>
                      <h5 className="mb-0 font-weight-medium text-primary">Panier moyen</h5>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                  <div className="d-flex">
                    <div className="wrapper">
                      <h3 className="mb-0 font-weight-semibold">{weeklyDiscounts.toFixed(2)} €</h3>
                      <h5 className="mb-0 font-weight-medium text-primary">Remises</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts grid */}
      <div className="row">
        <div className="col-md-6 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">CA journalier</h4>
              <Line data={dailyRevenueChart} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="col-md-6 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Nombre de transactions</h4>
              <Bar data={dailyTransactionChart} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="col-md-6 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Panier moyen par jour</h4>
              <Bar data={dailyBasketChart} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="col-md-6 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Remises par jour</h4>
              <Line data={dailyDiscountChart} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="col-md-4 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Répartition par catégorie</h4>
              <Pie data={categoryChart} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="col-md-4 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Moyens de paiement</h4>
              <Doughnut data={paymentChart} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="col-md-4 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Performance par magasin</h4>
              <Bar data={storeChart} options={{...chartOptions, indexAxis: 'y'}} />
            </div>
          </div>
        </div>

        <div className="col-md-6 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Revenu vs Remises</h4>
              <Line data={revenuVsDiscountChart} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="col-md-6 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Revenu cumulé semaine</h4>
              <Line data={cumulativeChart} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
