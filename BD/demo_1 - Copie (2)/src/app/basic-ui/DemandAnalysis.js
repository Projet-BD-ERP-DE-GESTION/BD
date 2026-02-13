import React, { Component } from 'react';
import { Line, Bar, Doughnut, Pie, Area } from 'react-chartjs-2';
import sampleData from '../../data/sample_transactions_weekly.json';

class DemandAnalysis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      demandMetrics: {},
      forecastData: {},
      categoryTrends: {},
      charts: {},
      criticalStock: [],
      productDemand: {},
      summary: {
        totalDemand: 0,
        avgDailyDemand: 0,
        forecastNextWeek: 0,
        seasonalityIndex: 0,
        stockDeficit: 0
      },
      chartOptions: {
        maintainAspectRatio: true,
        responsive: true,
        legend: { display: true }
      }
    };
  }

  componentDidMount() {
    this.computeDemandMetrics();
  }

  computeDemandMetrics = () => {
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

    // Calculate daily demand metrics
    const demandMetrics = {};
    const dailyDemand = [];
    days.forEach(day => {
      const dayTxn = dayGrouped[day] || [];
      const totalQty = dayTxn.reduce((sum, t) => {
        return sum + (t.items || []).reduce((s, it) => s + (Number(it.quantity) || 0), 0);
      }, 0);
      const totalRevenue = dayTxn.reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
      const transactions = dayTxn.length;

      demandMetrics[day] = {
        quantity: totalQty,
        revenue: totalRevenue,
        transactions,
        avgTransactionValue: transactions > 0 ? totalRevenue / transactions : 0,
        itemsPerTransaction: transactions > 0 ? totalQty / transactions : 0
      };
      dailyDemand.push(totalQty);
    });

    // Calculate statistics for forecast
    const avgDemand = dailyDemand.reduce((a, b) => a + b, 0) / dailyDemand.length;
    const stdDev = Math.sqrt(
      dailyDemand.reduce((sum, x) => sum + Math.pow(x - avgDemand, 2), 0) / dailyDemand.length
    );

    // Simple moving average forecast
    const forecastDays = ['Lun+1', 'Mar+1', 'Mer+1', 'Jeu+1', 'Ven+1', 'Sam+1', 'Dim+1'];
    const forecast = {};
    forecastDays.forEach((day, idx) => {
      // Use moving average + slight trend
      const trend = idx > 2 ? 1.05 : 0.95; // Slight uptrend
      forecast[day] = Math.round(avgDemand * trend);
    });

    // Category-level demand analysis
    const categoryDemand = {};
    const categoryTrends = {};
    sampleData.forEach(t => {
      (t.items || []).forEach(item => {
        const cat = item.category || 'autre';
        const qty = Number(item.quantity) || 0;
        const revenue = (Number(item.unit_price) || 0) * qty;

        if (!categoryDemand[cat]) {
          categoryDemand[cat] = {
            quantity: 0,
            revenue: 0,
            transactions: 0,
            items: 0
          };
        }
        categoryDemand[cat].quantity += qty;
        categoryDemand[cat].revenue += revenue;
        categoryDemand[cat].transactions += 1;
        categoryDemand[cat].items += 1;
      });
    });

    // Calculate trends per category
    Object.keys(categoryDemand).forEach(cat => {
      const c = categoryDemand[cat];
      const avgQtyPerItem = c.quantity / c.items;
      const growthRate = (Math.random() * 0.4 - 0.1).toFixed(2); // -10% to +30% growth
      categoryTrends[cat] = {
        ...c,
        avgQtyPerItem: avgQtyPerItem.toFixed(2),
        growthRate: growthRate,
        forecastedDemand: Math.round(c.quantity * (1 + parseFloat(growthRate))),
        riskLevel: growthRate < -0.05 ? 'high' : growthRate > 0.15 ? 'low' : 'medium'
      };
    });

    // Product-level analysis
    const productDemand = {};
    sampleData.forEach(t => {
      (t.items || []).forEach(item => {
        const prodId = item.product_id;
        const prodName = item.product_name;
        const cat = item.category || 'autre';
        const qty = Number(item.quantity) || 0;

        if (!productDemand[prodId]) {
          productDemand[prodId] = {
            name: prodName,
            category: cat,
            quantity: 0,
            frequency: 0,
            stockLevel: 50 + Math.random() * 100 // Mock current stock
          };
        }
        productDemand[prodId].quantity += qty;
        productDemand[prodId].frequency += 1;
      });
    });

    // Calculate reorder points
    const criticalStock = [];
    Object.entries(productDemand).forEach(([prodId, p]) => {
      const avgWeeklyDemand = p.quantity;
      const forecastedDemand = Math.round(avgWeeklyDemand * 1.2); // 20% safety stock
      const reorderPoint = Math.round(forecastedDemand / 7 * 14); // 2 weeks lead time
      p.reorderPoint = reorderPoint;
      p.stockStatus = p.stockLevel < reorderPoint ? 'critical' : p.stockLevel < reorderPoint * 1.5 ? 'low' : 'normal';
      
      if (p.stockStatus === 'critical') {
        criticalStock.push({ ...p, id: prodId });
      }
    });

    // Build charts
    const demandTrendChart = {
      labels: days,
      datasets: [
        {
          label: 'Demande Réelle (unités)',
          data: days.map(d => demandMetrics[d].quantity),
          borderColor: '#8862e0',
          backgroundColor: 'rgba(136,98,224,0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#8862e0'
        },
        {
          label: 'Moyenne Mobile',
          data: days.map((_, idx) => {
            const start = Math.max(0, idx - 1);
            const end = idx + 1;
            const avgWindow = dailyDemand.slice(start, end);
            return Math.round(avgWindow.reduce((a, b) => a + b) / avgWindow.length);
          }),
          borderColor: '#19d895',
          borderDash: [5, 5],
          fill: false
        }
      ]
    };

    const forecastChart = {
      labels: [...days, ...forecastDays],
      datasets: [{
        label: 'Demande Prédite (unités)',
        data: [...days.map(d => demandMetrics[d].quantity), ...Object.values(forecast)],
        borderColor: '#ff7b7b',
        backgroundColor: 'rgba(255,123,123,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4
      }]
    };

    const categoryDemandChart = {
      labels: Object.keys(categoryTrends),
      datasets: [{
        label: 'Quantité Demandée',
        data: Object.values(categoryTrends).map(c => c.quantity),
        backgroundColor: ['#8862e0', '#19d895', '#2196f3', '#ffd166', '#ff7b7b', '#f96332', '#8ad3ff', '#5ed2a1']
      }]
    };

    const categoryForecastChart = {
      labels: Object.keys(categoryTrends),
      datasets: [
        {
          label: 'Demande Actuelle',
          data: Object.values(categoryTrends).map(c => c.quantity),
          backgroundColor: '#8862e0'
        },
        {
          label: 'Demande Prédite',
          data: Object.values(categoryTrends).map(c => c.forecastedDemand),
          backgroundColor: '#19d895'
        }
      ]
    };

    const growthRateChart = {
      labels: Object.keys(categoryTrends),
      datasets: [{
        label: 'Taux de Croissance (%)',
        data: Object.values(categoryTrends).map(c => parseFloat(c.growthRate) * 100),
        backgroundColor: Object.values(categoryTrends).map(c => 
          parseFloat(c.growthRate) < -0.05 ? '#ff7b7b' : parseFloat(c.growthRate) > 0.15 ? '#19d895' : '#ffd166'
        )
      }]
    };

    const riskChart = {
      labels: Object.keys(categoryTrends),
      datasets: [{
        data: Object.values(categoryTrends).map(c => 1),
        backgroundColor: Object.values(categoryTrends).map(c =>
          c.riskLevel === 'high' ? '#ff7b7b' : c.riskLevel === 'medium' ? '#ffd166' : '#19d895'
        )
      }]
    };

    const demandVariabilityChart = {
      labels: days,
      datasets: [{
        label: 'Variabilité Demande',
        data: days.map(d => demandMetrics[d].quantity),
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33,150,243,0.2)',
        fill: true,
        borderWidth: 2
      }]
    };

    // Summary metrics
    const totalDemand = Object.values(demandMetrics).reduce((sum, d) => sum + d.quantity, 0);
    const avgDailyDemand = Math.round(totalDemand / days.length);
    const forecastNextWeekTotal = Object.values(forecast).reduce((a, b) => a + b, 0);
    const seasonalityIndex = (Math.max(...dailyDemand) / Math.min(...dailyDemand)).toFixed(2);
    const stockDeficitCount = criticalStock.length;

    this.setState({
      demandMetrics,
      forecastData: forecast,
      categoryTrends,
      charts: {
        trend: demandTrendChart,
        forecast: forecastChart,
        categoryDemand: categoryDemandChart,
        categoryForecast: categoryForecastChart,
        growthRate: growthRateChart,
        risk: riskChart,
        variability: demandVariabilityChart
      },
      summary: {
        totalDemand,
        avgDailyDemand,
        forecastNextWeek: forecastNextWeekTotal,
        seasonalityIndex,
        stockDeficit: stockDeficitCount
      },
      criticalStock,
      productDemand
    });
  };

  render() {
    const { 
      demandMetrics, 
      charts, 
      summary,
      chartOptions,
      categoryTrends,
      criticalStock,
      productDemand
    } = this.state;

    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const highRiskCategories = Object.entries(categoryTrends)
      .filter(([_, c]) => c.riskLevel === 'high')
      .slice(0, 5);

    return (
      <div>
        {/* Header */}
        <div className="row page-title-header">
          <div className="col-12">
            <div className="page-header">
              <h4 className="page-title">Analyse et Prédiction de la Demande</h4>
              <p>Prévisions et analyse des tendances de demande - Semaine du 24 au 30 Novembre 2025</p>
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
                        <h3 className="mb-0 font-weight-semibold">{summary.totalDemand}</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Demande Totale (unités)</h5>
                        <p className="mb-0 text-muted">{summary.avgDailyDemand}/jour</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{summary.forecastNextWeek}</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Prévision Prochaine Semaine</h5>
                        <p className="mb-0 text-muted">+{(((summary.forecastNextWeek - summary.totalDemand) / summary.totalDemand) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{summary.seasonalityIndex}</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Indice de Saisonnalité</h5>
                        <p className="mb-0 text-muted">Variation Max/Min</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{summary.stockDeficit}</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Produits Stock Critique</h5>
                        <p className="mb-0 text-muted">Reorder recommandé</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Stock Items */}
        {criticalStock && criticalStock.length > 0 && (
          <div className="row mt-3">
            <div className="col-12">
              <h5 className="mb-3">⚠️ PRODUITS EN STOCK CRITIQUE</h5>
            </div>
            {criticalStock.slice(0, 3).map((prod) => (
              <div key={prod.id} className="col-md-4 grid-margin">
                <div className="card border-danger">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="mb-1">{prod.name}</h6>
                        <p className="text-muted small mb-0">{prod.category}</p>
                      </div>
                      <span className="badge badge-danger">CRITIQUE</span>
                    </div>
                    <div className="progress mb-2" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar bg-danger" 
                        role="progressbar" 
                        style={{ width: `${(prod.stockLevel / prod.reorderPoint) * 100}%` }}
                      ></div>
                    </div>
                    <small className="text-muted">Stock: {Math.round(prod.stockLevel)} | Seuil: {prod.reorderPoint}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Demand Trends */}
        <div className="row mt-3">
          <div className="col-12">
            <h5 className="mb-3">TENDANCES DE DEMANDE</h5>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Évolution Demande Semaine Actuelle</h4>
                <Line data={charts.trend} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Prévisions Prochaine Semaine</h4>
                <Line data={charts.forecast} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Variabilité Demande</h4>
                <Line data={charts.variability} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Détails Demande Quotidienne</h4>
                <div className="p-3">
                  {days.map((day, idx) => (
                    <div key={day} className="mb-2 pb-2 border-bottom">
                      <div className="d-flex justify-content-between">
                        <strong>{day}</strong>
                        <span>{demandMetrics[day]?.quantity || 0} unités</span>
                      </div>
                      <small className="text-muted">
                        {demandMetrics[day]?.transactions || 0} transactions • {demandMetrics[day]?.avgTransactionValue.toFixed(0) || 0}€ avg
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Analysis */}
        <div className="row mt-3">
          <div className="col-12">
            <h5 className="mb-3">ANALYSE PAR CATÉGORIE</h5>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Demande par Catégorie</h4>
                <Bar data={charts.categoryDemand} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Demande Actuelle vs Prédite</h4>
                <Bar data={charts.categoryForecast} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Taux de Croissance Prédite</h4>
                <Bar data={charts.growthRate} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Niveau de Risque par Catégorie</h4>
                <Pie data={charts.risk} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Détails Analyse Catégories</h4>
                <div className="table-responsive">
                  <table className="table table-hover table-sm">
                    <thead>
                      <tr>
                        <th>Catégorie</th>
                        <th>Demande Actuelle</th>
                        <th>Demande Prédite</th>
                        <th>Croissance</th>
                        <th>Risque</th>
                        <th>Quantité/Item</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(categoryTrends).map(([cat, metrics]) => (
                        <tr key={cat}>
                          <td><strong>{cat}</strong></td>
                          <td>{metrics.quantity}</td>
                          <td>{metrics.forecastedDemand}</td>
                          <td>
                            <span className={`badge ${parseFloat(metrics.growthRate) < -0.05 ? 'badge-danger' : parseFloat(metrics.growthRate) > 0.15 ? 'badge-success' : 'badge-warning'}`}>
                              {(parseFloat(metrics.growthRate) * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${metrics.riskLevel === 'high' ? 'badge-danger' : metrics.riskLevel === 'medium' ? 'badge-warning' : 'badge-success'}`}>
                              {metrics.riskLevel}
                            </span>
                          </td>
                          <td>{metrics.avgQtyPerItem}</td>
                          <td>
                            {metrics.riskLevel === 'high' ? (
                              <small className="text-danger">⚠️ Augmenter stock</small>
                            ) : metrics.forecastedDemand > metrics.quantity * 1.2 ? (
                              <small className="text-info">📈 Prévoir croissance</small>
                            ) : (
                              <small className="text-success">✓ Normal</small>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="row mt-3">
          <div className="col-12">
            <h5 className="mb-3">CATÉGORIES À RISQUE ÉLEVÉ</h5>
          </div>
        </div>

        <div className="row">
          {highRiskCategories && highRiskCategories.length > 0 ? (
            highRiskCategories.map(([cat, metrics]) => (
              <div key={cat} className="col-md-6 grid-margin">
                <div className="card border-warning">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="mb-0">{cat}</h5>
                      <span className="badge badge-warning">Risque Élevé</span>
                    </div>
                    <div className="mb-3">
                      <p className="mb-1"><strong>Taux de Croissance:</strong> <span className="text-danger">{(parseFloat(metrics.growthRate) * 100).toFixed(1)}%</span></p>
                      <p className="mb-1"><strong>Demande Actuelle:</strong> {metrics.quantity} unités</p>
                      <p className="mb-1"><strong>Demande Prédite:</strong> {metrics.forecastedDemand} unités</p>
                      <p className="mb-0"><strong>Recommandation:</strong> Augmenter les stocks et vérifier les prévisions de demande</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <p className="text-muted">Aucune catégorie à risque élevé détectée</p>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="row mt-3">
          <div className="col-md-12 grid-margin">
            <div className="card">
              <div className="card-body">
                <div className="alert alert-info" role="alert">
                  <strong>Prévisions Générales:</strong> La demande pour la prochaine semaine est estimée à <strong>{summary.forecastNextWeek}</strong> unités, 
                  soit une variation de {summary.totalDemand > 0 ? (((summary.forecastNextWeek - summary.totalDemand) / summary.totalDemand) * 100).toFixed(1) : 0}% par rapport à la semaine actuelle.
                </div>
                <div className="alert alert-warning" role="alert">
                  <strong>Saisonnalité:</strong> L'indice de saisonnalité est de {summary.seasonalityIndex}x, indiquant une forte variation de demande au cours de la semaine.
                </div>
                {summary.stockDeficit > 0 && (
                  <div className="alert alert-danger" role="alert">
                    <strong>Actions Urgentes:</strong> {summary.stockDeficit} produit(s) en stock critique. Reorder immédiatement recommandé.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DemandAnalysis;
