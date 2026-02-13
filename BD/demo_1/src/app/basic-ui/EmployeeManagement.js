import React, { Component } from 'react';
import { Line, Bar, Doughnut, Pie, Radar } from 'react-chartjs-2';
import sampleData from '../../data/sample_transactions_weekly.json';

class EmployeeManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      employeeMetrics: {},
      departmentMetrics: {},
      performanceData: {},
      charts: {},
      summary: {
        totalEmployees: 0,
        avgPerformance: 0,
        avgAbsence: 0,
        totalProductivity: 0,
        avgSalary: 0
      },
      chartOptions: {
        maintainAspectRatio: true,
        responsive: true,
        legend: { display: true }
      }
    };
  }

  componentDidMount() {
    this.computeEmployeeMetrics();
  }

  computeEmployeeMetrics = () => {
    // Create mock employee data based on transactions
    const employees = [
      { id: 'E001', name: 'Sophie Martin', department: 'Ventes', store: 'Supermarché Central', salary: 2200, role: 'Responsable Ventes' },
      { id: 'E002', name: 'Pierre Dubois', department: 'Caisse', store: 'Supermarché Central', salary: 1800, role: 'Caissier' },
      { id: 'E003', name: 'Marie Rousseau', department: 'Ventes', store: 'Supermarché Est', salary: 1900, role: 'Vendeur' },
      { id: 'E004', name: 'Jean Petit', department: 'Logistique', store: 'Supermarché Ouest', salary: 2100, role: 'Chef Logistique' },
      { id: 'E005', name: 'Claire Moreau', department: 'Caisse', store: 'Supermarché Est', salary: 1750, role: 'Caissière' },
      { id: 'E006', name: 'Thomas Laurent', department: 'Ventes', store: 'Supermarché Ouest', salary: 2000, role: 'Vendeur' }
    ];

    // Calculate performance metrics for each employee
    const employeeMetrics = {};
    employees.forEach(emp => {
      const storeTransactions = sampleData.filter(t => t.store === emp.store);
      const totalRevenue = storeTransactions.reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
      const transactionCount = storeTransactions.length;
      const avgBasket = transactionCount > 0 ? totalRevenue / transactionCount : 0;

      employeeMetrics[emp.id] = {
        ...emp,
        transactionsHandled: transactionCount,
        revenueGenerated: totalRevenue,
        avgBasketValue: avgBasket,
        performance: 70 + Math.random() * 25, // 70-95 performance score
        attendance: 95 + Math.random() * 5, // 95-100 attendance rate
        productivity: 80 + Math.random() * 20, // 80-100 productivity score
        overtimeHours: Math.floor(Math.random() * 20),
        trainingCompleted: Math.floor(Math.random() * 5),
        customerSatisfaction: 70 + Math.random() * 30,
        daysAbsent: Math.floor(Math.random() * 5)
      };
    });

    // Calculate department metrics
    const departmentMetrics = {};
    Object.values(employeeMetrics).forEach(emp => {
      const dept = emp.department;
      if (!departmentMetrics[dept]) {
        departmentMetrics[dept] = {
          employees: 0,
          totalRevenue: 0,
          avgPerformance: 0,
          avgAttendance: 0,
          avgProductivity: 0,
          totalOvertime: 0,
          totalTraining: 0,
          avgSatisfaction: 0
        };
      }
      departmentMetrics[dept].employees += 1;
      departmentMetrics[dept].totalRevenue += emp.revenueGenerated;
      departmentMetrics[dept].avgPerformance += emp.performance;
      departmentMetrics[dept].avgAttendance += emp.attendance;
      departmentMetrics[dept].avgProductivity += emp.productivity;
      departmentMetrics[dept].totalOvertime += emp.overtimeHours;
      departmentMetrics[dept].totalTraining += emp.trainingCompleted;
      departmentMetrics[dept].avgSatisfaction += emp.customerSatisfaction;
    });

    // Average department metrics
    Object.keys(departmentMetrics).forEach(dept => {
      const d = departmentMetrics[dept];
      d.avgPerformance = (d.avgPerformance / d.employees).toFixed(2);
      d.avgAttendance = (d.avgAttendance / d.employees).toFixed(2);
      d.avgProductivity = (d.avgProductivity / d.employees).toFixed(2);
      d.avgSatisfaction = (d.avgSatisfaction / d.employees).toFixed(2);
      d.avgSalary = (Object.values(employeeMetrics)
        .filter(e => e.department === dept)
        .reduce((sum, e) => sum + e.salary, 0) / d.employees).toFixed(0);
    });

    // Build charts
    const performanceChart = {
      labels: Object.values(employeeMetrics).map(e => e.name),
      datasets: [{
        label: 'Performance (%)',
        data: Object.values(employeeMetrics).map(e => e.performance.toFixed(1)),
        backgroundColor: '#8862e0'
      }]
    };

    const attendanceChart = {
      labels: Object.values(employeeMetrics).map(e => e.name),
      datasets: [{
        label: 'Présence (%)',
        data: Object.values(employeeMetrics).map(e => e.attendance.toFixed(1)),
        backgroundColor: '#19d895'
      }]
    };

    const productivityChart = {
      labels: Object.values(employeeMetrics).map(e => e.name),
      datasets: [{
        label: 'Productivité (%)',
        data: Object.values(employeeMetrics).map(e => e.productivity.toFixed(1)),
        backgroundColor: '#2196f3'
      }]
    };

    const departmentRevenueChart = {
      labels: Object.keys(departmentMetrics),
      datasets: [{
        label: 'CA par Département (€)',
        data: Object.values(departmentMetrics).map(d => d.totalRevenue),
        backgroundColor: ['#8862e0', '#19d895', '#2196f3', '#ffd166']
      }]
    };

    const departmentEmployeesChart = {
      labels: Object.keys(departmentMetrics),
      datasets: [{
        label: 'Nombre d\'Employés',
        data: Object.values(departmentMetrics).map(d => d.employees),
        backgroundColor: '#ff7b7b'
      }]
    };

    const departmentPerformanceChart = {
      labels: Object.keys(departmentMetrics),
      datasets: [
        {
          label: 'Performance (%)',
          data: Object.values(departmentMetrics).map(d => d.avgPerformance),
          borderColor: '#8862e0',
          backgroundColor: 'rgba(136,98,224,0.1)'
        },
        {
          label: 'Productivité (%)',
          data: Object.values(departmentMetrics).map(d => d.avgProductivity),
          borderColor: '#19d895',
          backgroundColor: 'rgba(25,216,149,0.1)'
        }
      ]
    };

    const employeeComparisonChart = {
      labels: Object.values(employeeMetrics).map(e => e.name),
      datasets: [
        {
          label: 'Performance',
          data: Object.values(employeeMetrics).map(e => e.performance.toFixed(1)),
          borderColor: '#8862e0',
          backgroundColor: 'rgba(136,98,224,0.2)'
        },
        {
          label: 'Présence',
          data: Object.values(employeeMetrics).map(e => e.attendance.toFixed(1)),
          borderColor: '#19d895',
          backgroundColor: 'rgba(25,216,149,0.2)'
        },
        {
          label: 'Productivité',
          data: Object.values(employeeMetrics).map(e => e.productivity.toFixed(1)),
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33,150,243,0.2)'
        }
      ]
    };

    const satisfactionChart = {
      labels: Object.values(employeeMetrics).map(e => e.name),
      datasets: [{
        label: 'Satisfaction Client (%)',
        data: Object.values(employeeMetrics).map(e => e.customerSatisfaction.toFixed(1)),
        backgroundColor: '#ffd166'
      }]
    };

    const departmentPieChart = {
      labels: Object.keys(departmentMetrics),
      datasets: [{
        data: Object.values(departmentMetrics).map(d => d.employees),
        backgroundColor: ['#8862e0', '#19d895', '#2196f3', '#ffd166']
      }]
    };

    // Summary metrics
    const totalEmployees = Object.keys(employeeMetrics).length;
    const avgPerformance = (Object.values(employeeMetrics).reduce((sum, e) => sum + e.performance, 0) / totalEmployees).toFixed(2);
    const avgAbsence = (Object.values(employeeMetrics).reduce((sum, e) => sum + e.daysAbsent, 0) / totalEmployees).toFixed(1);
    const totalProductivity = Object.values(employeeMetrics).reduce((sum, e) => sum + e.productivity, 0).toFixed(0);
    const avgSalary = (Object.values(employeeMetrics).reduce((sum, e) => sum + e.salary, 0) / totalEmployees).toFixed(0);
    const totalRevenue = Object.values(employeeMetrics).reduce((sum, e) => sum + e.revenueGenerated, 0);

    this.setState({
      employeeMetrics,
      departmentMetrics,
      charts: {
        performance: performanceChart,
        attendance: attendanceChart,
        productivity: productivityChart,
        departmentRevenue: departmentRevenueChart,
        departmentEmployees: departmentEmployeesChart,
        departmentPerformance: departmentPerformanceChart,
        employeeComparison: employeeComparisonChart,
        satisfaction: satisfactionChart,
        departmentPie: departmentPieChart
      },
      summary: {
        totalEmployees,
        avgPerformance,
        avgAbsence,
        totalProductivity,
        avgSalary,
        totalRevenue
      }
    });
  };

  render() {
    const { employeeMetrics, departmentMetrics, charts, summary, chartOptions } = this.state;

    const topPerformers = Object.values(employeeMetrics)
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 3);

    return (
      <div>
        {/* Header */}
        <div className="row page-title-header">
          <div className="col-12">
            <div className="page-header">
              <h4 className="page-title">Gestion du Personnel</h4>
              <p>Tableau de bord de gestion et suivi du personnel - Semaine du 24 au 30 Novembre 2025</p>
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
                        <h3 className="mb-0 font-weight-semibold">{summary.totalEmployees}</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Total Employés</h5>
                        <p className="mb-0 text-muted">{Object.keys(departmentMetrics).length} départements</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{summary.avgPerformance}%</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Performance Moyenne</h5>
                        <p className="mb-0 text-muted">Tous les employés</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{summary.avgSalary} €</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Salaire Moyen</h5>
                        <p className="mb-0 text-muted">Mensuel par employé</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{summary.avgAbsence}</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Jours Absence Moy.</h5>
                        <p className="mb-0 text-muted">Par employé</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="row mt-3">
          <div className="col-12">
            <h5 className="mb-3">MEILLEURS PERFORMANTS</h5>
          </div>
        </div>

        <div className="row">
          {topPerformers.map((emp) => (
            <div key={emp.id} className="col-md-4 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="mb-1">{emp.name}</h5>
                      <p className="text-muted small mb-0">{emp.role}</p>
                    </div>
                    <span className="badge badge-success">{emp.performance.toFixed(1)}%</span>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">Présence</small>
                    <div className="progress mt-1" style={{ height: '6px' }}>
                      <div className="progress-bar bg-success" role="progressbar" style={{ width: `${emp.attendance}%` }}></div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">Productivité</small>
                    <div className="progress mt-1" style={{ height: '6px' }}>
                      <div className="progress-bar bg-info" role="progressbar" style={{ width: `${emp.productivity}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <small className="text-muted">Satisfaction Client</small>
                    <div className="progress mt-1" style={{ height: '6px' }}>
                      <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${emp.customerSatisfaction}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Charts */}
        <div className="row mt-3">
          <div className="col-12">
            <h5 className="mb-3">PERFORMANCE INDIVIDUELLE</h5>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Performance Employés</h4>
                <Bar data={charts.performance} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Présence Employés</h4>
                <Bar data={charts.attendance} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Productivité Employés</h4>
                <Bar data={charts.productivity} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Satisfaction Client</h4>
                <Bar data={charts.satisfaction} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Comparaison Employés</h4>
                <Line data={charts.employeeComparison} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Employee Details Table */}
        <div className="row mt-3">
          <div className="col-12">
            <h5 className="mb-3">DÉTAILS EMPLOYÉS</h5>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover table-sm">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Rôle</th>
                        <th>Département</th>
                        <th>Performance</th>
                        <th>Présence</th>
                        <th>Productivité</th>
                        <th>Satisfaction</th>
                        <th>Absent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(employeeMetrics).map((emp) => (
                        <tr key={emp.id}>
                          <td><strong>{emp.name}</strong></td>
                          <td>{emp.role}</td>
                          <td>{emp.department}</td>
                          <td><span className="badge badge-info">{emp.performance.toFixed(1)}%</span></td>
                          <td><span className="badge badge-success">{emp.attendance.toFixed(1)}%</span></td>
                          <td><span className="badge badge-primary">{emp.productivity.toFixed(1)}%</span></td>
                          <td><span className="badge badge-warning">{emp.customerSatisfaction.toFixed(1)}%</span></td>
                          <td>{emp.daysAbsent} j</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Department Analysis */}
        <div className="row mt-3">
          <div className="col-12">
            <h5 className="mb-3">ANALYSE PAR DÉPARTEMENT</h5>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">CA par Département</h4>
                <Bar data={charts.departmentRevenue} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Répartition Employés</h4>
                <Pie data={charts.departmentPie} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Performance vs Productivité par Département</h4>
                <Line data={charts.departmentPerformance} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Détails Départements</h4>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Département</th>
                        <th>Employés</th>
                        <th>CA (€)</th>
                        <th>Performance</th>
                        <th>Présence</th>
                        <th>Productivité</th>
                        <th>Satisfaction</th>
                        <th>Heures Supplémentaires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(departmentMetrics).map(([dept, metrics]) => (
                        <tr key={dept}>
                          <td><strong>{dept}</strong></td>
                          <td>{metrics.employees}</td>
                          <td>{metrics.totalRevenue?.toFixed(2)} €</td>
                          <td>{metrics.avgPerformance}%</td>
                          <td>{metrics.avgAttendance}%</td>
                          <td>{metrics.avgProductivity}%</td>
                          <td>{metrics.avgSatisfaction}%</td>
                          <td>{metrics.totalOvertime} h</td>
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

export default EmployeeManagement;
