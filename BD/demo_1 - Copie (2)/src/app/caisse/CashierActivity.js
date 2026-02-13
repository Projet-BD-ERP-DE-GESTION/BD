import React, { Component } from 'react';
import { Line, Bar, Doughnut, Pie, Radar } from 'react-chartjs-2';
// import sampleData from '../../data/sample_transactions_weekly.json';
import * as analyticsUtils from './analyticsUtils';

class CashierActivitySingleStore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cashier: null,
      cashiers: [],
      period: 'daily',
      activityMetrics: {},
      charts: {},
      summary: {
        totalRevenue: 0,
        totalTransactions: 0,
        avgTransactionValue: 0,
        totalDiscount: 0,
        avgBasket: 0,
        topCategory: '',
        topPaymentMethod: ''
      },
      chartOptions: {
        maintainAspectRatio: true,
        responsive: true,
        legend: { display: true }
      }
    };
  }

  async componentDidMount() {
    await this.loadCashiers();
  }

  loadCashiers = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/users');
      const users = await res.json();
      const cashiers = users.filter(u => u.role === 'cashier' || u.role === 'Caissier');
      this.setState({ cashiers });
    } catch (e) {
      this.setState({ cashiers: [] });
    }
  }

  loadCashierTransactions = async () => {
    // Charger toutes les transactions depuis le backend
    try {
      const res = await fetch('http://localhost:4000/api/transactions');
      const allTx = await res.json();
      const { cashier } = this.state;
      if (!cashier) return;
      const cashierTransactions = allTx.filter(t => t.cashier_id === cashier._id || t.cashier_name === cashier.username);
      this.computeActivityMetrics(cashierTransactions);
    } catch (e) {
      this.computeActivityMetrics([]);
    }
  }

  computeActivityMetrics = (cashierTransactions) => {
    const { cashier } = this.state;
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const dayGrouped = {};
    days.forEach(d => { dayGrouped[d] = []; });
    cashierTransactions.forEach(t => {
      const d = new Date(t.timestamp);
      const dayOfWeek = d.getDay();
      const dayName = days[(dayOfWeek + 6) % 7];
      if (dayGrouped[dayName]) dayGrouped[dayName].push(t);
    });
    const dailyMetrics = {};
    days.forEach(day => {
      const dayTxn = dayGrouped[day] || [];
      const revenue = analyticsUtils.calculateTotalRevenue(dayTxn);
      const transactions = analyticsUtils.calculateTotalTransactions(dayTxn);
      const discount = analyticsUtils.calculateTotalDiscount(dayTxn);
      dailyMetrics[day] = {
        revenue,
        transactions,
        discount,
        avgValue: transactions > 0 ? revenue / transactions : 0,
        itemCount: analyticsUtils.calculateTotalItems(dayTxn)
      };
    });
    const weeklyRevenue = analyticsUtils.calculateTotalRevenue(cashierTransactions);
    const weeklyTransactions = analyticsUtils.calculateTotalTransactions(cashierTransactions);
    const weeklyDiscount = analyticsUtils.calculateTotalDiscount(cashierTransactions);
    const weeklyMetrics = {
      revenue: weeklyRevenue,
      transactions: weeklyTransactions,
      discount: weeklyDiscount,
      avgValue: weeklyTransactions > 0 ? weeklyRevenue / weeklyTransactions : 0,
      itemCount: analyticsUtils.calculateTotalItems(cashierTransactions)
    };
    const monthlyMetrics = {
      revenue: weeklyRevenue * 4,
      transactions: weeklyTransactions * 4,
      discount: weeklyDiscount * 4,
      avgValue: weeklyTransactions > 0 ? (weeklyRevenue * 4) / (weeklyTransactions * 4) : 0,
      itemCount: analyticsUtils.calculateTotalItems(cashierTransactions) * 4
    };
    const paymentBreakdown = analyticsUtils.calculateRevenueByPaymentMethod(cashierTransactions);
    const categoryBreakdown = analyticsUtils.calculateRevenueByCategory(cashierTransactions);
    const dailyRevenueChart = {
      labels: days,
      datasets: [{
        label: 'Revenu quotidien (€)',
        data: days.map(d => dailyMetrics[d]?.revenue || 0),
        borderColor: '#8862e0',
        backgroundColor: 'rgba(136,98,224,0.1)',
        fill: true,
        tension: 0.4
      }]
    };
    const dailyTransactionChart = {
      labels: days,
      datasets: [{
        label: 'Nombre de transactions',
        data: days.map(d => dailyMetrics[d]?.transactions || 0),
        backgroundColor: '#19d895'
      }]
    };
    const paymentMethodChart = {
      labels: Object.keys(paymentBreakdown),
      datasets: [{
        data: Object.values(paymentBreakdown).map(p => p.revenue),
        backgroundColor: ['#8862e0', '#19d895', '#2196f3', '#ffd166']
      }]
    };
    const categoryChart = {
      labels: Object.keys(categoryBreakdown),
      datasets: [{
        label: 'Revenu par catégorie (€)',
        data: Object.values(categoryBreakdown).map(c => c.revenue),
        backgroundColor: ['#8862e0', '#19d895', '#2196f3', '#ffd166', '#ff7b7b', '#f96332', '#8ad3ff']
      }]
    };
    const hourlyDistributionChart = {
      labels: Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`),
      datasets: [{
        label: 'Transactions par heure',
        data: analyticsUtils.calculateHourlyDistribution(cashierTransactions),
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33,150,243,0.1)',
        fill: true
      }]
    };
    const discountTrendChart = {
      labels: days,
      datasets: [{
        label: 'Remises (€)',
        data: days.map(d => dailyMetrics[d]?.discount || 0),
        borderColor: '#ff7b7b',
        backgroundColor: 'rgba(255,123,123,0.1)',
        fill: true
      }]
    };
    const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1].revenue - a[1].revenue)[0];
    const topPayment = Object.entries(paymentBreakdown).sort((a, b) => b[1].revenue - a[1].revenue)[0];
    this.setState({
      activityMetrics: {
        daily: dailyMetrics,
        weekly: weeklyMetrics,
        monthly: monthlyMetrics,
        paymentBreakdown,
        categoryBreakdown
      },
      charts: {
        dailyRevenue: dailyRevenueChart,
        dailyTransaction: dailyTransactionChart,
        paymentMethod: paymentMethodChart,
        category: categoryChart,
        hourlyDistribution: hourlyDistributionChart,
        discountTrend: discountTrendChart
      },
      summary: {
        totalRevenue: weeklyRevenue,
        totalTransactions: weeklyTransactions,
        avgTransactionValue: weeklyMetrics.avgValue,
        totalDiscount: weeklyDiscount,
        avgBasket: weeklyMetrics.avgValue,
        topCategory: topCategory ? topCategory[0] : 'N/A',
        topPaymentMethod: topPayment ? topPayment[0] : 'N/A'
      }
    });
  };

  changePeriod = (period) => {
    this.setState({ period });
  };

  render() {
    const { cashier, cashiers, period, activityMetrics, charts, summary, chartOptions } = this.state;
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const displayMetrics = period === 'daily' ? activityMetrics.daily : period === 'weekly' ? activityMetrics.weekly : activityMetrics.monthly;
    return (
      <div>
        <div className="row page-title-header">
          <div className="col-12">
            <div className="page-header">
              <h4 className="page-title">Mon Activité</h4>
              <p>Suivi de l'activité du caissier</p>
            </div>
          </div>
        </div>

        {/* Sélection dynamique du caissier */}
        <div className="row">
          <div className="col-md-12 grid-margin">
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label><strong>Caissier :</strong></label>
                      <select className="form-control" value={cashier ? cashier._id : ''} onChange={async e => {
                        const selected = cashiers.find(c => c._id === e.target.value);
                        await this.setState({ cashier: selected });
                        await this.loadCashierTransactions();
                      }}>
                        <option value="">Sélectionner un caissier</option>
                        {cashiers.map(c => (
                          <option key={c._id} value={c._id}>{c.username} ({c.role})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <p className="mb-1"><strong>Heure:</strong> {new Date().toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12 grid-margin">
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-xl-3 col-lg-6 col-sm-6 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{summary.totalRevenue?.toFixed(2)} €</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Revenu Total</h5>
                        <p className="mb-0 text-muted">{summary.totalTransactions} transactions</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{summary.avgTransactionValue?.toFixed(2)} €</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Valeur Moyenne</h5>
                        <p className="mb-0 text-muted">Par transaction</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{summary.totalDiscount?.toFixed(2)} €</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Remises Accordées</h5>
                        <p className="mb-0 text-muted">{((summary.totalDiscount / summary.totalRevenue) * 100).toFixed(1)}% du CA</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{summary.totalTransactions}</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Transactions</h5>
                        <p className="mb-0 text-muted">Total</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {period === 'daily' && (
          <div className="row">
            <div className="col-md-6 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Revenu par Jour</h4>
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
                  <h4 className="card-title">Distribution Horaire</h4>
                  <Line data={charts.hourlyDistribution} options={chartOptions} />
                </div>
              </div>
            </div>

            <div className="col-md-6 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Remises Accordées</h4>
                  <Line data={charts.discountTrend} options={chartOptions} />
                </div>
              </div>
            </div>

            <div className="col-md-12 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Détails Journaliers</h4>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Jour</th>
                          <th>Revenu (€)</th>
                          <th>Transactions</th>
                          <th>Valeur Moyenne</th>
                          <th>Remises</th>
                          <th>Articles</th>
                        </tr>
                      </thead>
                      <tbody>
                        {days.map(day => {
                          const metric = activityMetrics.daily?.[day];
                          return (
                            <tr key={day}>
                              <td><strong>{day}</strong></td>
                              <td>{metric?.revenue?.toFixed(2) || 0} €</td>
                              <td>{metric?.transactions || 0}</td>
                              <td>{metric?.avgValue?.toFixed(2) || 0} €</td>
                              <td>{metric?.discount?.toFixed(2) || 0} €</td>
                              <td>{metric?.itemCount || 0}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {(period === 'weekly' || period === 'monthly') && (
          <div className="row">
            <div className="col-md-6 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Modes de Paiement</h4>
                  <Pie data={charts.paymentMethod} options={chartOptions} />
                </div>
              </div>
            </div>

            <div className="col-md-6 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Ventes par Catégorie</h4>
                  <Bar data={charts.category} options={chartOptions} />
                </div>
              </div>
            </div>

            <div className="col-md-12 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Résumé {period === 'weekly' ? 'Hebdomadaire' : 'Mensuel'}</h4>
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Revenu Total:</strong> {displayMetrics?.revenue?.toFixed(2) || 0} €</p>
                      <p><strong>Nombre de Transactions:</strong> {displayMetrics?.transactions || 0}</p>
                      <p><strong>Valeur Moyenne:</strong> {displayMetrics?.avgValue?.toFixed(2) || 0} €</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Remises Totales:</strong> {displayMetrics?.discount?.toFixed(2) || 0} €</p>
                      <p><strong>Articles Vendus:</strong> {displayMetrics?.itemCount || 0}</p>
                      <p><strong>Top Catégorie:</strong> {summary.topCategory}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-12 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Détails des Modes de Paiement</h4>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Mode de Paiement</th>
                          <th>Revenu (€)</th>
                          <th>Nombre de Transactions</th>
                          <th>Valeur Moyenne</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(activityMetrics.paymentBreakdown || {}).map(([payment, data]) => (
                          <tr key={payment}>
                            <td><strong>{payment}</strong></td>
                            <td>{data.revenue?.toFixed(2) || 0} €</td>
                            <td>{data.count}</td>
                            <td>{(data.revenue / data.count).toFixed(2)} €</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-12 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Détails par Catégorie</h4>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Catégorie</th>
                          <th>Revenu (€)</th>
                          <th>Quantité</th>
                          <th>Revenue/Unité</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(activityMetrics.categoryBreakdown || {}).map(([category, data]) => (
                          <tr key={category}>
                            <td><strong>{category}</strong></td>
                            <td>{data.revenue?.toFixed(2) || 0} €</td>
                            <td>{data.quantity}</td>
                            <td>{(data.revenue / data.quantity).toFixed(2) || 0} €</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default CashierActivitySingleStore;
