import React, { Component } from 'react';
import { Line, Bar, Doughnut, Pie, Radar } from 'react-chartjs-2';
import sampleData from '../../data/sample_transactions_weekly.json';

class PerformanceDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storeComparison: {},
      performanceMetrics: {},
      trendCharts: {},
      categoryPerformance: {},
      paymentPerformance: {},
      chartOptions: {
        maintainAspectRatio: true,
        responsive: true,
        legend: { display: true }
      }
    };
  }

  componentDidMount() {
    this.computePerformanceMetrics();
  }

  computePerformanceMetrics = () => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const dayGrouped = {};
    days.forEach(d => { dayGrouped[d] = []; });

    // Group by day
    sampleData.forEach(t => {
      const d = new Date(t.timestamp);
      const dayOfWeek = d.getDay();
      const dayName = days[(dayOfWeek + 6) % 7];
      if (dayGrouped[dayName]) dayGrouped[dayName].push(t);
    });

    // Store performance
    const storeMetrics = {};
    sampleData.forEach(t => {
      const store = t.store || 'autre';
      if (!storeMetrics[store]) {
        storeMetrics[store] = {
          revenue: 0,
          transactions: 0,
          avgBasket: 0,
          totalDiscount: 0,
          items: []
        };
      }
      storeMetrics[store].revenue += Number(t.total_amount || 0);
      storeMetrics[store].transactions += 1;
      storeMetrics[store].totalDiscount += Number(t.discount_amount || 0);
      storeMetrics[store].items.push(...(t.items || []));
    });

    // Calculate averages and additional metrics
    Object.keys(storeMetrics).forEach(store => {
      const m = storeMetrics[store];
      m.avgBasket = m.transactions > 0 ? m.revenue / m.transactions : 0;
      m.discountRate = m.revenue > 0 ? ((m.totalDiscount / m.revenue) * 100) : 0;
      m.avgTransactionValue = m.transactions > 0 ? m.revenue / m.transactions : 0;
      m.totalProducts = m.items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
      m.avgProductsPerTransaction = m.transactions > 0 ? m.totalProducts / m.transactions : 0;
    });

    // Overall metrics
    const totalRevenue = Object.values(storeMetrics).reduce((sum, m) => sum + m.revenue, 0);
    const totalTransactions = Object.values(storeMetrics).reduce((sum, m) => sum + m.transactions, 0);
    const totalDiscount = Object.values(storeMetrics).reduce((sum, m) => sum + m.totalDiscount, 0);
    const overallAvgBasket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Category performance
    const categoryMetrics = {};
    sampleData.forEach(t => {
      (t.items || []).forEach(item => {
        const cat = item.category || 'autre';
        if (!categoryMetrics[cat]) {
          categoryMetrics[cat] = {
            revenue: 0,
            quantity: 0,
            discount: 0,
            avgPrice: 0,
            frequency: 0
          };
        }
        const itemRev = Number(item.unit_price || 0) * Number(item.quantity || 0) - Number(item.discount || 0);
        categoryMetrics[cat].revenue += itemRev;
        categoryMetrics[cat].quantity += Number(item.quantity) || 0;
        categoryMetrics[cat].discount += Number(item.discount) || 0;
        categoryMetrics[cat].frequency += 1;
      });
    });

    Object.keys(categoryMetrics).forEach(cat => {
      const c = categoryMetrics[cat];
      c.avgPrice = c.quantity > 0 ? c.revenue / c.quantity : 0;
      c.avgDiscount = c.frequency > 0 ? c.discount / c.frequency : 0;
    });

    // Payment performance
    const paymentMetrics = {};
    sampleData.forEach(t => {
      const payment = t.payment_type || 'autre';
      if (!paymentMetrics[payment]) {
        paymentMetrics[payment] = {
          revenue: 0,
          transactions: 0,
          avgTransactionValue: 0,
          totalDiscount: 0
        };
      }
      paymentMetrics[payment].revenue += Number(t.total_amount || 0);
      paymentMetrics[payment].transactions += 1;
      paymentMetrics[payment].totalDiscount += Number(t.discount_amount || 0);
    });

    Object.keys(paymentMetrics).forEach(payment => {
      const p = paymentMetrics[payment];
      p.avgTransactionValue = p.transactions > 0 ? p.revenue / p.transactions : 0;
    });

    // Build charts
    const storeComparisonChart = {
      labels: Object.keys(storeMetrics),
      datasets: [
        {
          label: 'CA (€)',
          data: Object.values(storeMetrics).map(m => m.revenue),
          backgroundColor: '#8862e0'
        }
      ]
    };

    const storeTransactionChart = {
      labels: Object.keys(storeMetrics),
      datasets: [
        {
          label: 'Transactions',
          data: Object.values(storeMetrics).map(m => m.transactions),
          backgroundColor: '#19d895'
        }
      ]
    };

    const storeBasketChart = {
      labels: Object.keys(storeMetrics),
      datasets: [
        {
          label: 'Panier Moyen (€)',
          data: Object.values(storeMetrics).map(m => m.avgBasket.toFixed(2)),
          backgroundColor: '#2196f3'
        }
      ]
    };

    const categoryRevenueChart = {
      labels: Object.keys(categoryMetrics),
      datasets: [
        {
          label: 'Revenu (€)',
          data: Object.values(categoryMetrics).map(c => c.revenue),
          backgroundColor: ['#8862e0', '#19d895', '#2196f3', '#ffd166', '#ff7b7b', '#f96332', '#8ad3ff', '#5ed2a1']
        }
      ]
    };

    const categoryQuantityChart = {
      labels: Object.keys(categoryMetrics),
      datasets: [
        {
          label: 'Quantité vendue',
          data: Object.values(categoryMetrics).map(c => c.quantity),
          backgroundColor: 'rgba(136,98,224,0.5)'
        }
      ]
    };

    const paymentRevenueChart = {
      labels: Object.keys(paymentMetrics),
      datasets: [
        {
          data: Object.values(paymentMetrics).map(p => p.revenue),
          backgroundColor: ['#8862e0', '#19d895', '#2196f3', '#ffd166']
        }
      ]
    };

    const dailyRevenueChart = {
      labels: days,
      datasets: [
        {
          label: 'Revenu quotidien (€)',
          data: days.map(d => {
            return dayGrouped[d].reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
          }),
          borderColor: '#8862e0',
          backgroundColor: 'rgba(136,98,224,0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    const performanceMetricData = {
      labels: Object.keys(storeMetrics),
      datasets: [
        {
          label: 'CA (€)',
          data: Object.values(storeMetrics).map(m => m.revenue),
          borderColor: '#8862e0',
          backgroundColor: 'rgba(136,98,224,0.1)'
        },
        {
          label: 'Avg Basket (€)',
          data: Object.values(storeMetrics).map(m => m.avgBasket * 10),
          borderColor: '#19d895',
          backgroundColor: 'rgba(25,216,149,0.1)'
        }
      ]
    };

    const storePercentageChart = {
      labels: Object.keys(storeMetrics),
      datasets: [
        {
          data: Object.values(storeMetrics).map(m => ((m.revenue / totalRevenue) * 100).toFixed(1)),
          backgroundColor: ['#8862e0', '#19d895', '#2196f3']
        }
      ]
    };

    this.setState({
      storeComparison: {
        revenue: storeComparisonChart,
        transactions: storeTransactionChart,
        basket: storeBasketChart,
        performance: performanceMetricData,
        percentage: storePercentageChart
      },
      performanceMetrics: {
        stores: storeMetrics,
        totalRevenue,
        totalTransactions,
        totalDiscount,
        overallAvgBasket,
        discountRate: ((totalDiscount / totalRevenue) * 100).toFixed(2)
      },
      trendCharts: {
        dailyRevenue: dailyRevenueChart
      },
      categoryPerformance: {
        revenue: categoryRevenueChart,
        quantity: categoryQuantityChart,
        categories: categoryMetrics
      },
      paymentPerformance: {
        revenue: paymentRevenueChart,
        payments: paymentMetrics
      }
    });
  };

  render() {
    const { 
      storeComparison, 
      performanceMetrics, 
      trendCharts, 
      categoryPerformance, 
      paymentPerformance,
      chartOptions 
    } = this.state;
    const { stores, totalRevenue, totalTransactions, overallAvgBasket, totalDiscount, discountRate } = performanceMetrics;

    return (
      <div>
        {/* Header */}
        <div className="row page-title-header">
          <div className="col-12">
            <div className="page-header">
              <h4 className="page-title">Tableau de Bord Performances</h4>
              <p>Analyse comparative des performances - Semaine du 24 au 30 Novembre 2025</p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="row">
          <div className="col-md-12 grid-margin">
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-xl-3 col-lg-6 col-sm-6 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{totalRevenue?.toFixed(2)} €</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">CA Total</h5>
                        <p className="mb-0 text-muted">{(totalRevenue / 7).toFixed(0)} €/jour</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{totalTransactions}</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Transactions Total</h5>
                        <p className="mb-0 text-muted">{(totalTransactions / 7).toFixed(0)} par jour</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{overallAvgBasket?.toFixed(2)} €</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Panier Moyen</h5>
                        <p className="mb-0 text-muted">Tous magasins</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{discountRate}%</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Taux de Remise</h5>
                        <p className="mb-0 text-muted">{totalDiscount?.toFixed(2)} € total</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Performance Section */}
        <div className="row mt-3">
          <div className="col-12">
            <h5 className="mb-3">PERFORMANCE PAR MAGASIN</h5>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Chiffre d'Affaires par Magasin</h4>
                <Bar data={storeComparison.revenue} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Transactions par Magasin</h4>
                <Bar data={storeComparison.transactions} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Panier Moyen par Magasin</h4>
                <Bar data={storeComparison.basket} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Répartition du CA</h4>
                <Pie data={storeComparison.percentage} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Détails Performance Magasins</h4>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Magasin</th>
                        <th>CA (€)</th>
                        <th>Transactions</th>
                        <th>Panier Moyen</th>
                        <th>Remise %</th>
                        <th>Articles/Transaction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stores && Object.entries(stores).map(([store, metrics]) => (
                        <tr key={store}>
                          <td><strong>{store}</strong></td>
                          <td>{metrics.revenue?.toFixed(2)} €</td>
                          <td>{metrics.transactions}</td>
                          <td>{metrics.avgBasket?.toFixed(2)} €</td>
                          <td>{metrics.discountRate?.toFixed(2)}%</td>
                          <td>{metrics.avgProductsPerTransaction?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Performance Section */}
        <div className="row mt-3">
          <div className="col-12">
            <h5 className="mb-3">PERFORMANCE PAR CATÉGORIE</h5>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Revenu par Catégorie</h4>
                <Bar data={categoryPerformance.revenue} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Quantité Vendue par Catégorie</h4>
                <Bar data={categoryPerformance.quantity} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Détails Performance Catégories</h4>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Catégorie</th>
                        <th>Revenu (€)</th>
                        <th>Quantité</th>
                        <th>Prix Moyen</th>
                        <th>Remise Moyenne</th>
                        <th>Fréquence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryPerformance.categories && Object.entries(categoryPerformance.categories).map(([category, metrics]) => (
                        <tr key={category}>
                          <td><strong>{category}</strong></td>
                          <td>{metrics.revenue?.toFixed(2)} €</td>
                          <td>{metrics.quantity}</td>
                          <td>{metrics.avgPrice?.toFixed(2)} €</td>
                          <td>{metrics.avgDiscount?.toFixed(2)} €</td>
                          <td>{metrics.frequency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trends Section */}
        <div className="row mt-3">
          <div className="col-12">
            <h5 className="mb-3">TENDANCES</h5>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Évolution Revenu Quotidien</h4>
                <Line data={trendCharts.dailyRevenue} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Moyens de Paiement</h4>
                <Doughnut data={paymentPerformance.revenue} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Détails Moyens de Paiement</h4>
                <div className="p-3">
                  {paymentPerformance.payments && Object.entries(paymentPerformance.payments).map(([payment, metrics]) => (
                    <div key={payment} className="mb-3">
                      <div className="d-flex justify-content-between">
                        <span><strong>{payment}</strong></span>
                        <span>{metrics.revenue?.toFixed(2)} €</span>
                      </div>
                      <div className="d-flex justify-content-between text-muted small">
                        <span>{metrics.transactions} transactions</span>
                        <span>Moy: {metrics.avgTransactionValue?.toFixed(2)} €</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PerformanceDashboard;
