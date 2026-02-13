import React, { Component } from 'react';
import { Line, Bar, Doughnut, Pie, Radar } from 'react-chartjs-2';
import sampleData from '../../data/sample_transactions_weekly.json';
import analytics from '../basic-ui/analyticsUtils';

class SalesAnalysisDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      period: 'daily', // daily or weekly
      dailyCharts: {},
      weeklyCharts: {},
      dailyMetrics: {},
      weeklyMetrics: {},
      chartOptions: {
        maintainAspectRatio: true,
        responsive: true,
        legend: { display: true }
      }
    };
  }

  componentDidMount() {
    this.computeMetrics();
  }

  computeMetrics = () => {
    // Daily metrics
    const dailyGrouped = {};
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    days.forEach(d => { dailyGrouped[d] = []; });

    sampleData.forEach(t => {
      const d = new Date(t.timestamp);
      const dayOfWeek = d.getDay();
      const dayName = days[(dayOfWeek + 6) % 7];
      if (dailyGrouped[dayName]) dailyGrouped[dayName].push(t);
    });

    // Compute daily metrics
    const dailyMetrics = {};
    days.forEach(day => {
      const dayTxn = dailyGrouped[day] || [];
      dailyMetrics[day] = {
        revenue: dayTxn.reduce((s, t) => s + Number(t.total_amount || 0), 0),
        count: dayTxn.length,
        avgBasket: dayTxn.length > 0 ? dayTxn.reduce((s, t) => s + Number(t.total_amount || 0), 0) / dayTxn.length : 0,
        discount: dayTxn.reduce((s, t) => s + Number(t.discount_amount || 0), 0)
      };
    });

    // Compute weekly metrics
    const totalRevenue = days.reduce((s, d) => s + (dailyMetrics[d]?.revenue || 0), 0);
    const totalCount = days.reduce((s, d) => s + (dailyMetrics[d]?.count || 0), 0);
    const weeklyMetrics = {
      totalRevenue,
      totalCount,
      avgBasket: totalCount > 0 ? totalRevenue / totalCount : 0,
      totalDiscount: days.reduce((s, d) => s + (dailyMetrics[d]?.discount || 0), 0)
    };

    // Build daily charts
    const dailyRevenueChart = {
      labels: days,
      datasets: [{
        label: 'Revenu (€)',
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
        label: 'Transactions',
        data: days.map(d => dailyMetrics[d]?.count || 0),
        backgroundColor: ['#19d895','#2196f3','#8862e0','#ffd166','#ff7b7b','#f96332','#8ad3ff']
      }]
    };

    const dailyBasketChart = {
      labels: days,
      datasets: [{
        label: 'Panier moyen (€)',
        data: days.map(d => dailyMetrics[d]?.avgBasket || 0),
        backgroundColor: '#5ed2a1'
      }]
    };

    const dailyDiscountChart = {
      labels: days,
      datasets: [{
        label: 'Remises (€)',
        data: days.map(d => dailyMetrics[d]?.discount || 0),
        borderColor: '#ff7b7b',
        backgroundColor: 'rgba(255,123,123,0.1)',
        fill: true
      }]
    };

    // Category breakdown
    const catRevenue = {};
    sampleData.forEach(t => {
      (t.items || []).forEach(it => {
        const c = it.category || 'autre';
        const itemRev = Number(it.unit_price || 0) * Number(it.quantity || 0) - Number(it.discount || 0);
        catRevenue[c] = (catRevenue[c] || 0) + itemRev;
      });
    });

    const categoryChart = {
      labels: Object.keys(catRevenue),
      datasets: [{
        data: Object.values(catRevenue),
        backgroundColor: ['#8862e0','#19d895','#2196f3','#ffd166','#ff7b7b','#f96332','#8ad3ff','#5ed2a1']
      }]
    };

    // Payment methods
    const paymentRevenue = {};
    sampleData.forEach(t => {
      const p = t.payment_type || 'autre';
      paymentRevenue[p] = (paymentRevenue[p] || 0) + Number(t.total_amount || 0);
    });

    const paymentChart = {
      labels: Object.keys(paymentRevenue),
      datasets: [{
        data: Object.values(paymentRevenue),
        backgroundColor: ['#8862e0','#19d895','#2196f3','#ffd166']
      }]
    };

    // Store performance
    const storeRevenue = {};
    sampleData.forEach(t => {
      const s = t.store || 'autre';
      storeRevenue[s] = (storeRevenue[s] || 0) + Number(t.total_amount || 0);
    });

    const storeEntries = Object.entries(storeRevenue).sort((a,b) => b[1]-a[1]);
    const storeChart = {
      labels: storeEntries.map(x => x[0]),
      datasets: [{
        label: 'CA (€)',
        data: storeEntries.map(x => x[1]),
        backgroundColor: ['#8862e0','#19d895','#2196f3']
      }]
    };

    // Hourly distribution
    const hourlyData = new Array(24).fill(0);
    sampleData.forEach(t => {
      const h = new Date(t.timestamp).getHours();
      hourlyData[h] += 1;
    });

    const hourlyChart = {
      labels: Array.from({length:24}, (_,i) => `${String(i).padStart(2,'0')}:00`),
      datasets: [{
        label: 'Transactions par heure',
        data: hourlyData,
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33,150,243,0.1)',
        fill: true
      }]
    };

    this.setState({
      dailyCharts: {
        revenue: dailyRevenueChart,
        transaction: dailyTransactionChart,
        basket: dailyBasketChart,
        discount: dailyDiscountChart,
        category: categoryChart,
        payment: paymentChart,
        store: storeChart,
        hourly: hourlyChart
      },
      dailyMetrics,
      weeklyMetrics
    });
  };

  changePeriod = (period) => {
    this.setState({ period });
  };

  render() {
    const { period, dailyCharts, dailyMetrics, weeklyMetrics, chartOptions } = this.state;
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    return (
      <div>
        {/* Header */}
        <div className="row page-title-header">
          <div className="col-12">
            <div className="page-header">
              <h4 className="page-title">Analyse des Ventes</h4>
              <p>Analyse journalière et hebdomadaire</p>
              <div className="quick-link-wrapper w-100 d-md-flex flex-md-wrap">
                <ul className="quick-links">
                  <li><a href="!#" className={`${period === 'daily' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); this.changePeriod('daily'); }}>Quotidien</a></li>
                  <li><a href="!#" className={`${period === 'weekly' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); this.changePeriod('weekly'); }}>Hebdomadaire</a></li>
                </ul>
              </div>
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
                        <h3 className="mb-0 font-weight-semibold">{weeklyMetrics.totalRevenue?.toFixed(2)} €</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">CA Total Semaine</h5>
                        <p className="mb-0 text-muted">+{(weeklyMetrics.totalRevenue / 7).toFixed(0)} €/jour</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{weeklyMetrics.totalCount}</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Transactions</h5>
                        <p className="mb-0 text-muted">{(weeklyMetrics.totalCount / 7).toFixed(0)} par jour</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{weeklyMetrics.avgBasket?.toFixed(2)} €</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Panier Moyen</h5>
                        <p className="mb-0 text-muted">+2.5% par rapport à hier</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{weeklyMetrics.totalDiscount?.toFixed(2)} €</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Remises Totales</h5>
                        <p className="mb-0 text-muted">{((weeklyMetrics.totalDiscount / weeklyMetrics.totalRevenue) * 100).toFixed(1)}% du CA</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Analysis */}
        {period === 'daily' && (
          <div className="row">
            <div className="col-md-6 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Revenu Journalier</h4>
                  <Line data={dailyCharts.revenue} options={chartOptions} />
                </div>
              </div>
            </div>

            <div className="col-md-6 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Nombre de Transactions</h4>
                  <Bar data={dailyCharts.transaction} options={chartOptions} />
                </div>
              </div>
            </div>

            <div className="col-md-6 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Panier Moyen par Jour</h4>
                  <Bar data={dailyCharts.basket} options={chartOptions} />
                </div>
              </div>
            </div>

            <div className="col-md-6 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Remises par Jour</h4>
                  <Line data={dailyCharts.discount} options={chartOptions} />
                </div>
              </div>
            </div>

            <div className="col-md-4 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Ventes par Catégorie</h4>
                  <Pie data={dailyCharts.category} options={chartOptions} />
                </div>
              </div>
            </div>

            <div className="col-md-4 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Moyens de Paiement</h4>
                  <Doughnut data={dailyCharts.payment} options={chartOptions} />
                </div>
              </div>
            </div>

            <div className="col-md-4 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Performance Magasins</h4>
                  <Bar data={dailyCharts.store} options={{...chartOptions, indexAxis: 'y'}} />
                </div>
              </div>
            </div>

            <div className="col-md-12 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Distribution Horaire</h4>
                  <Line data={dailyCharts.hourly} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Analysis */}
        {period === 'weekly' && (
          <div className="row">
            <div className="col-md-12 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Résumé Hebdomadaire</h4>
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <p><strong>CA Total :</strong> {weeklyMetrics.totalRevenue?.toFixed(2)} €</p>
                      <p><strong>Moyenne Jour :</strong> {(weeklyMetrics.totalRevenue / 7).toFixed(2)} €</p>
                      <p><strong>Jour le plus rentable :</strong> {days[Object.entries(dailyMetrics).reduce((max, [k, v]) => v.revenue > dailyMetrics[max]?.revenue ? k : max, 'Lun')]} ({Object.entries(dailyMetrics).reduce((max, [k, v]) => Math.max(max, v.revenue), 0).toFixed(2)} €)</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Total Transactions :</strong> {weeklyMetrics.totalCount}</p>
                      <p><strong>Moyenne par Jour :</strong> {(weeklyMetrics.totalCount / 7).toFixed(0)}</p>
                      <p><strong>Panier Moyen :</strong> {weeklyMetrics.avgBasket?.toFixed(2)} €</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Évolution Hebdomadaire</h4>
                  <Line data={dailyCharts.revenue} options={chartOptions} />
                </div>
              </div>
            </div>

            <div className="col-md-6 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Répartition Catégories</h4>
                  <Pie data={dailyCharts.category} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default SalesAnalysisDashboard;
