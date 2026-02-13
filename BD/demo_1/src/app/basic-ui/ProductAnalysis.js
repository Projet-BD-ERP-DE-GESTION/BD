import React, { Component } from 'react';
import { Line, Bar, Doughnut, Pie, HorizontalBar } from 'react-chartjs-2';
import sampleData from '../../data/sample_transactions_weekly.json';

class ProductAnalysis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      productMetrics: {},
      categoryMetrics: {},
      charts: {},
      summary: {
        totalProducts: 0,
        totalRevenue: 0,
        totalQuantity: 0,
        totalDiscount: 0,
        avgProductRevenue: 0,
        discountRate: 0
      },
      topProductsByRevenue: [],
      topProductsByQuantity: [],
      topProductsByFrequency: [],
      chartOptions: {
        maintainAspectRatio: true,
        responsive: true,
        legend: { display: true }
      }
    };
  }

  componentDidMount() {
    this.computeProductMetrics();
  }

  computeProductMetrics = () => {
    const productMetrics = {};
    const categoryMetrics = {};

    // Aggregate product data
    sampleData.forEach(t => {
      (t.items || []).forEach(item => {
        const prodId = item.product_id;
        const prodName = item.product_name;
        const cat = item.category || 'autre';

        if (!productMetrics[prodId]) {
          productMetrics[prodId] = {
            name: prodName,
            category: cat,
            quantity: 0,
            revenue: 0,
            discount: 0,
            unitPrice: Number(item.unit_price) || 0,
            frequency: 0, // number of transactions
            soldAt: [] // stores where sold
          };
        }

        const qty = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || 0;
        const discountItem = Number(item.discount) || 0;
        const itemRevenue = (unitPrice * qty) - discountItem;

        productMetrics[prodId].quantity += qty;
        productMetrics[prodId].revenue += itemRevenue;
        productMetrics[prodId].discount += discountItem;
        productMetrics[prodId].frequency += 1;
        if (!productMetrics[prodId].soldAt.includes(t.store)) {
          productMetrics[prodId].soldAt.push(t.store);
        }
      });

      // Category aggregation
      (t.items || []).forEach(item => {
        const cat = item.category || 'autre';
        if (!categoryMetrics[cat]) {
          categoryMetrics[cat] = {
            quantity: 0,
            revenue: 0,
            discount: 0,
            frequency: 0,
            products: new Set()
          };
        }

        const qty = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || 0;
        const discountItem = Number(item.discount) || 0;
        const itemRevenue = (unitPrice * qty) - discountItem;

        categoryMetrics[cat].quantity += qty;
        categoryMetrics[cat].revenue += itemRevenue;
        categoryMetrics[cat].discount += discountItem;
        categoryMetrics[cat].frequency += 1;
        categoryMetrics[cat].products.add(item.product_id);
      });
    });

    // Convert Set to size for category metrics
    Object.keys(categoryMetrics).forEach(cat => {
      categoryMetrics[cat].productCount = categoryMetrics[cat].products.size;
      delete categoryMetrics[cat].products;
    });

    // Calculate additional metrics for products
    Object.keys(productMetrics).forEach(prodId => {
      const p = productMetrics[prodId];
      p.avgQuantityPerTransaction = p.frequency > 0 ? (p.quantity / p.frequency).toFixed(2) : 0;
      p.revenuePerTransaction = p.frequency > 0 ? (p.revenue / p.frequency).toFixed(2) : 0;
      p.discountRate = p.revenue > 0 ? ((p.discount / p.revenue) * 100).toFixed(2) : 0;
      p.storeCount = p.soldAt.length;
    });

    // Sort products by revenue
    const topProductsByRevenue = Object.entries(productMetrics)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10);

    const topProductsByQuantity = Object.entries(productMetrics)
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 10);

    const topProductsByFrequency = Object.entries(productMetrics)
      .sort((a, b) => b[1].frequency - a[1].frequency)
      .slice(0, 10);

    // Build charts
    const topRevenueChart = {
      labels: topProductsByRevenue.map(([_, p]) => p.name),
      datasets: [{
        label: 'Revenu (€)',
        data: topProductsByRevenue.map(([_, p]) => p.revenue),
        backgroundColor: '#8862e0'
      }]
    };

    const topQuantityChart = {
      labels: topProductsByQuantity.map(([_, p]) => p.name),
      datasets: [{
        label: 'Quantité vendue',
        data: topProductsByQuantity.map(([_, p]) => p.quantity),
        backgroundColor: '#19d895'
      }]
    };

    const topFrequencyChart = {
      labels: topProductsByFrequency.map(([_, p]) => p.name),
      datasets: [{
        label: 'Nombre de ventes',
        data: topProductsByFrequency.map(([_, p]) => p.frequency),
        backgroundColor: '#2196f3'
      }]
    };

    // Category charts
    const catRevenueChart = {
      labels: Object.keys(categoryMetrics),
      datasets: [{
        label: 'Revenu (€)',
        data: Object.values(categoryMetrics).map(c => c.revenue),
        backgroundColor: ['#8862e0', '#19d895', '#2196f3', '#ffd166', '#ff7b7b', '#f96332', '#8ad3ff', '#5ed2a1']
      }]
    };

    const catQuantityChart = {
      labels: Object.keys(categoryMetrics),
      datasets: [{
        label: 'Quantité',
        data: Object.values(categoryMetrics).map(c => c.quantity),
        backgroundColor: 'rgba(136,98,224,0.5)'
      }]
    };

    const catProductCountChart = {
      labels: Object.keys(categoryMetrics),
      datasets: [{
        label: 'Nombre de produits',
        data: Object.values(categoryMetrics).map(c => c.productCount),
        backgroundColor: '#ffd166'
      }]
    };

    // Revenue vs Discount chart
    const categoryNames = Object.keys(categoryMetrics);
    const revenueVsDiscountChart = {
      labels: categoryNames,
      datasets: [
        {
          label: 'Revenu (€)',
          data: categoryNames.map(c => categoryMetrics[c].revenue),
          borderColor: '#19d895',
          backgroundColor: 'rgba(25,216,149,0.1)',
          fill: true
        },
        {
          label: 'Remise (€)',
          data: categoryNames.map(c => categoryMetrics[c].discount),
          borderColor: '#ff7b7b',
          backgroundColor: 'rgba(255,123,123,0.1)',
          fill: true
        }
      ]
    };

    // Product discount rate chart
    const highDiscountProducts = Object.entries(productMetrics)
      .filter(([_, p]) => Number(p.discountRate) > 0)
      .sort((a, b) => Number(b[1].discountRate) - Number(a[1].discountRate))
      .slice(0, 8);

    const discountRateChart = {
      labels: highDiscountProducts.map(([_, p]) => p.name),
      datasets: [{
        label: 'Taux de remise (%)',
        data: highDiscountProducts.map(([_, p]) => p.discountRate),
        backgroundColor: '#ff7b7b'
      }]
    };

    // Category pie chart
    const catPieChart = {
      labels: Object.keys(categoryMetrics),
      datasets: [{
        data: Object.values(categoryMetrics).map(c => c.revenue),
        backgroundColor: ['#8862e0', '#19d895', '#2196f3', '#ffd166', '#ff7b7b', '#f96332', '#8ad3ff', '#5ed2a1']
      }]
    };

    const totalProducts = Object.keys(productMetrics).length;
    const totalRevenue = Object.values(productMetrics).reduce((sum, p) => sum + p.revenue, 0);
    const totalQuantity = Object.values(productMetrics).reduce((sum, p) => sum + p.quantity, 0);
    const totalDiscount = Object.values(productMetrics).reduce((sum, p) => sum + p.discount, 0);
    const avgProductRevenue = totalProducts > 0 ? totalRevenue / totalProducts : 0;

    this.setState({
      productMetrics,
      categoryMetrics,
      charts: {
        topRevenue: topRevenueChart,
        topQuantity: topQuantityChart,
        topFrequency: topFrequencyChart,
        categoryRevenue: catRevenueChart,
        categoryQuantity: catQuantityChart,
        categoryProductCount: catProductCountChart,
        revenueVsDiscount: revenueVsDiscountChart,
        discountRate: discountRateChart,
        categoryPie: catPieChart
      },
      summary: {
        totalProducts,
        totalRevenue,
        totalQuantity,
        totalDiscount,
        avgProductRevenue,
        discountRate: ((totalDiscount / totalRevenue) * 100).toFixed(2)
      },
      topProductsByRevenue,
      topProductsByQuantity,
      topProductsByFrequency
    });
  };

  render() {
    const { 
      productMetrics, 
      categoryMetrics,
      charts, 
      summary,
      chartOptions,
      topProductsByRevenue,
      topProductsByQuantity,
      topProductsByFrequency
    } = this.state;

    return (
      <div>
        {/* Header */}
        <div className="row page-title-header">
          <div className="col-12">
            <div className="page-header">
              <h4 className="page-title">Analyse des Produits</h4>
              <p>Analyse détaillée des performances produits - Semaine du 24 au 30 Novembre 2025</p>
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
                        <h3 className="mb-0 font-weight-semibold">{summary.totalProducts}</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Produits Vendus</h5>
                        <p className="mb-0 text-muted">{Object.keys(categoryMetrics).length} catégories</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{summary.totalRevenue?.toFixed(2)} €</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Revenu Total</h5>
                        <p className="mb-0 text-muted">Avg: {summary.avgProductRevenue?.toFixed(2)} €/produit</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{summary.totalQuantity}</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Quantité Vendue</h5>
                        <p className="mb-0 text-muted">{(summary.totalQuantity / summary.totalProducts).toFixed(0)} par produit</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{summary.discountRate}%</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Taux Remise Moyen</h5>
                        <p className="mb-0 text-muted">{summary.totalDiscount?.toFixed(2)} € au total</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products Section */}
        <div className="row mt-3">
          <div className="col-12">
            <h5 className="mb-3">TOP PRODUITS</h5>
          </div>
        </div>

        <div className="row">
          <div className="col-md-4 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Top 10 Revenu</h4>
                <Bar data={charts.topRevenue} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-4 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Top 10 Quantité</h4>
                <Bar data={charts.topQuantity} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-4 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Top 10 Fréquence de Vente</h4>
                <Bar data={charts.topFrequency} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Détails Top Produits - Revenu</h4>
                <div className="table-responsive">
                  <table className="table table-hover table-sm">
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Catégorie</th>
                        <th>Revenu (€)</th>
                        <th>Quantité</th>
                        <th>Ventes</th>
                        <th>Remise (€)</th>
                        <th>Magasins</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProductsByRevenue.map(([prodId, p]) => (
                        <tr key={prodId}>
                          <td><strong>{p.name}</strong></td>
                          <td>{p.category}</td>
                          <td>{p.revenue?.toFixed(2)} €</td>
                          <td>{p.quantity}</td>
                          <td>{p.frequency}</td>
                          <td>{p.discount?.toFixed(2)} €</td>
                          <td>{p.storeCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Analysis Section */}
        <div className="row mt-3">
          <div className="col-12">
            <h5 className="mb-3">ANALYSE PAR CATÉGORIE</h5>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Revenu par Catégorie</h4>
                <Bar data={charts.categoryRevenue} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Répartition Revenu</h4>
                <Pie data={charts.categoryPie} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Quantité par Catégorie</h4>
                <Bar data={charts.categoryQuantity} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Nombre de Produits par Catégorie</h4>
                <Bar data={charts.categoryProductCount} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Revenu vs Remise par Catégorie</h4>
                <Line data={charts.revenueVsDiscount} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Détails Catégories</h4>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Catégorie</th>
                        <th>Revenu (€)</th>
                        <th>Quantité</th>
                        <th>Produits Uniques</th>
                        <th>Fréquence</th>
                        <th>Remise (€)</th>
                        <th>Taux Remise</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(categoryMetrics).map(([cat, metrics]) => (
                        <tr key={cat}>
                          <td><strong>{cat}</strong></td>
                          <td>{metrics.revenue?.toFixed(2)} €</td>
                          <td>{metrics.quantity}</td>
                          <td>{metrics.productCount}</td>
                          <td>{metrics.frequency}</td>
                          <td>{metrics.discount?.toFixed(2)} €</td>
                          <td>{((metrics.discount / metrics.revenue) * 100).toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Discount Analysis */}
        <div className="row mt-3">
          <div className="col-12">
            <h5 className="mb-3">ANALYSE DES REMISES</h5>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Produits avec Plus Hauts Taux de Remise</h4>
                <Bar data={charts.discountRate} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Tous les Produits</h4>
                <div className="table-responsive">
                  <table className="table table-hover table-sm">
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Catégorie</th>
                        <th>Prix Unitaire</th>
                        <th>Quantité</th>
                        <th>Revenu (€)</th>
                        <th>Remise (€)</th>
                        <th>Taux Remise</th>
                        <th>Fréquence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(productMetrics).sort((a,b) => b[1].revenue - a[1].revenue).map(([prodId, p]) => (
                        <tr key={prodId}>
                          <td><strong>{p.name}</strong></td>
                          <td>{p.category}</td>
                          <td>{p.unitPrice?.toFixed(2)} €</td>
                          <td>{p.quantity}</td>
                          <td>{p.revenue?.toFixed(2)} €</td>
                          <td>{p.discount?.toFixed(2)} €</td>
                          <td>{p.discountRate}%</td>
                          <td>{p.frequency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ProductAnalysis;
