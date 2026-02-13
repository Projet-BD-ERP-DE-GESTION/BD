import React, { Component } from 'react';
import { Line, Bar, Doughnut, PolarArea } from 'react-chartjs-2';
import sampleData from '../../data/sample_transactions_weekly.json';
import * as analyticsUtils from './analyticsUtils';

class PerformanceDashboardSingleStore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      performance: {
        dailyMetrics: {},
        hourlyMetrics: {},
        paymentMethods: {},
        productPerformance: {},
        categoryPerformance: {}
      },
      summary: {},
      charts: {}
    };
  }

  componentDidMount() {
    this.computePerformanceMetrics();
  }

  computePerformanceMetrics = () => {
    const transactions = sampleData;
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    // Daily metrics
    const dailyRevenue = analyticsUtils.calculateDailyRevenue(transactions);
    const dailyTransactions = analyticsUtils.calculateDailyTransactions(transactions);
    const totalRevenue = analyticsUtils.calculateTotalRevenue(transactions);
    const totalTransactions = analyticsUtils.calculateTotalTransactions(transactions);
    const avgBasketValue = analyticsUtils.calculateAverageBasketValue(transactions);
    const totalDiscount = analyticsUtils.calculateTotalDiscount(transactions);

    // Payment methods
    const paymentMethods = analyticsUtils.calculateRevenueByPaymentMethod(transactions);

    // Product performance
    const topProducts = analyticsUtils.calculateTopProducts(transactions, 10);
    const topProductsByFrequency = analyticsUtils.calculateProductFrequency(transactions);

    // Category performance
    const categoryPerformance = analyticsUtils.calculateRevenueByCategory(transactions);

    // Hourly metrics
    const hourlyDistribution = analyticsUtils.calculateHourlyDistribution(transactions);

    // Peak hours
    const peakHours = analyticsUtils.calculatePeakHours(transactions);

    // Build charts
    const dailyRevenueChart = {
      labels: days,
      datasets: [{
        label: 'Revenu Quotidien (€)',
        data: days.map(d => dailyRevenue[d] || 0),
        borderColor: '#8862e0',
        backgroundColor: 'rgba(136,98,224,0.2)',
        fill: true,
        tension: 0.4
      }]
    };

    const dailyTransactionChart = {
      labels: days,
      datasets: [{
        label: 'Nombre de Transactions',
        data: days.map(d => dailyTransactions[d] || 0),
        backgroundColor: '#19d895'
      }]
    };

    const paymentMethodChart = {
      labels: Object.keys(paymentMethods),
      datasets: [{
        data: Object.values(paymentMethods).map(p => p.revenue),
        backgroundColor: ['#8862e0', '#19d895', '#2196f3', '#ffd166']
      }]
    };

    const topProductsChart = {
      labels: topProducts.map(p => p.name.substring(0, 15)),
      datasets: [{
        label: 'Revenu (€)',
        data: topProducts.map(p => p.revenue),
        backgroundColor: '#f96332'
      }]
    };

    const categoryChart = {
      labels: Object.keys(categoryPerformance),
      datasets: [{
        label: 'Revenu par Catégorie (€)',
        data: Object.values(categoryPerformance).map(c => c.revenue),
        backgroundColor: ['#8862e0', '#19d895', '#2196f3', '#ffd166', '#ff7b7b', '#f96332']
      }]
    };

    const hourlyChart = {
      labels: Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`),
      datasets: [{
        label: 'Transactions par Heure',
        data: hourlyDistribution,
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33,150,243,0.1)',
        fill: true
      }]
    };

    this.setState({
      performance: {
        dailyRevenue,
        dailyTransactions,
        paymentMethods,
        topProducts,
        topProductsByFrequency,
        categoryPerformance,
        hourlyDistribution,
        peakHours
      },
      summary: {
        totalRevenue: totalRevenue.toFixed(2),
        totalTransactions,
        avgBasketValue: avgBasketValue.toFixed(2),
        totalDiscount: totalDiscount.toFixed(2),
        discountPercent: ((totalDiscount / totalRevenue) * 100).toFixed(1),
        bestDay: Object.entries(dailyRevenue).sort((a, b) => b[1] - a[1])[0],
        topCategory: Object.entries(categoryPerformance).sort((a, b) => b[1].revenue - a[1].revenue)[0]
      },
      charts: {
        dailyRevenue: dailyRevenueChart,
        dailyTransaction: dailyTransactionChart,
        paymentMethod: paymentMethodChart,
        topProducts: topProductsChart,
        category: categoryChart,
        hourly: hourlyChart
      }
    });
  };

  render() {
    const { summary, charts, performance } = this.state;
    const chartOptions = {
      maintainAspectRatio: true,
      responsive: true,
      legend: { display: true }
    };

    return (
      <div>
        <div className="row page-title-header">
          <div className="col-12">
            <div className="page-header">
              <h4 className="page-title">Analyse de Performance</h4>
              <p>Performance du point de vente - Semaine</p>
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
                        <h3 className="mb-0 font-weight-semibold">{summary.totalRevenue} €</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Chiffre d'Affaires</h5>
                        <p className="mb-0 text-muted">Total semaine</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{summary.totalTransactions}</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Transactions</h5>
                        <p className="mb-0 text-muted">Total semaine</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{summary.avgBasketValue} €</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Panier Moyen</h5>
                        <p className="mb-0 text-muted">Par transaction</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{summary.totalDiscount} €</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Remises</h5>
                        <p className="mb-0 text-muted">{summary.discountPercent}% du CA</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Highlights */}
        <div className="row">
          <div className="col-md-6 grid-margin">
            <div className="card bg-light-primary">
              <div className="card-body">
                <h5 className="card-title mb-2">📊 Meilleur Jour</h5>
                <h4 className="mb-1">{summary.bestDay?.[0]}</h4>
                <p className="mb-0">
                  <strong className="text-primary">{summary.bestDay?.[1]?.toFixed(2)} €</strong> généré
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin">
            <div className="card bg-light-success">
              <div className="card-body">
                <h5 className="card-title mb-2">🏆 Top Catégorie</h5>
                <h4 className="mb-1">{summary.topCategory?.[0]}</h4>
                <p className="mb-0">
                  <strong className="text-success">{summary.topCategory?.[1]?.revenue?.toFixed(2)} €</strong> de revenu
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="row">
          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Revenu Quotidien</h4>
                <Line data={charts.dailyRevenue} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Transactions par Jour</h4>
                <Bar data={charts.dailyTransaction} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Distribution par Mode de Paiement</h4>
                <Doughnut data={charts.paymentMethod} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Répartition par Catégorie</h4>
                <Doughnut data={charts.category} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Top 10 Produits</h4>
                <Bar data={charts.topProducts} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Distribution Horaire</h4>
                <Line data={charts.hourly} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Details */}
        <div className="row">
          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title mb-4">Détails des Modes de Paiement</h4>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Mode de Paiement</th>
                        <th>Revenu (€)</th>
                        <th>Nombre de Transactions</th>
                        <th>Valeur Moyenne</th>
                        <th>% du Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(performance.paymentMethods || {}).map(([method, data]) => (
                        <tr key={method}>
                          <td><strong>{method}</strong></td>
                          <td>{data.revenue.toFixed(2)} €</td>
                          <td>{data.count}</td>
                          <td>{(data.revenue / data.count).toFixed(2)} €</td>
                          <td><span className="badge badge-primary">{((data.revenue / Number(summary.totalRevenue)) * 100).toFixed(1)}%</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products Details */}
        <div className="row">
          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title mb-4">Top 10 Produits par Revenu</h4>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Catégorie</th>
                        <th>Revenu (€)</th>
                        <th>Quantité</th>
                        <th>Revenu/Unité</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performance.topProducts?.slice(0, 10).map((product, idx) => (
                        <tr key={idx}>
                          <td><strong>{product.name}</strong></td>
                          <td>{product.category}</td>
                          <td>{product.revenue.toFixed(2)} €</td>
                          <td>{product.quantity}</td>
                          <td>{(product.revenue / product.quantity).toFixed(2)} €</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Performance Details */}
        <div className="row">
          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title mb-4">Performance par Catégorie</h4>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Catégorie</th>
                        <th>Revenu (€)</th>
                        <th>Quantité</th>
                        <th>Nombre d'Entrées</th>
                        <th>Revenu/Unité</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(performance.categoryPerformance || {})
                        .sort((a, b) => b[1].revenue - a[1].revenue)
                        .map(([category, data]) => (
                          <tr key={category}>
                            <td><strong>{category}</strong></td>
                            <td>{data.revenue.toFixed(2)} €</td>
                            <td>{data.quantity}</td>
                            <td>{data.count}</td>
                            <td>{(data.revenue / data.quantity).toFixed(2)} €</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="row">
          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title mb-4">Heures de Pointe</h4>
                <div className="row">
                  {performance.peakHours?.slice(0, 5).map((peak, idx) => (
                    <div key={idx} className="col-md-4 mb-3">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h5 className="text-primary">{peak.hour}</h5>
                          <h3>{peak.count} transactions</h3>
                        </div>
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

export default PerformanceDashboardSingleStore;
