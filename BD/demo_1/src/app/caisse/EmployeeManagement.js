import React, { Component } from 'react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import sampleData from '../../data/sample_transactions_weekly.json';
import * as analyticsUtils from './analyticsUtils';

class EmployeeManagementSingleStore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      employees: [
        { id: 'E001', name: 'Sophie Martin', role: 'Manager', department: 'Management', startDate: '2020-01-15', performance: 95, attendance: 98, productivity: 92, satisfaction: 4.8 },
        { id: 'E002', name: 'Pierre Dubois', role: 'Caissier', department: 'Caisse', startDate: '2021-03-20', performance: 88, attendance: 96, productivity: 85, satisfaction: 4.5 },
        { id: 'E003', name: 'Marie Leclerc', role: 'Caissier', department: 'Caisse', startDate: '2021-06-10', performance: 85, attendance: 94, productivity: 88, satisfaction: 4.3 },
        { id: 'E004', name: 'Jean Bertrand', role: 'Vendeur', department: 'Ventes', startDate: '2022-01-05', performance: 82, attendance: 92, productivity: 80, satisfaction: 4.2 },
        { id: 'E005', name: 'Emma Moreau', role: 'Vendeur', department: 'Ventes', startDate: '2022-02-15', performance: 89, attendance: 97, productivity: 87, satisfaction: 4.6 },
        { id: 'E006', name: 'Luc Petit', role: 'Préparateur', department: 'Logistique', startDate: '2021-09-01', performance: 80, attendance: 88, productivity: 78, satisfaction: 3.9 }
      ],
      metrics: {
        avgPerformance: 0,
        avgAttendance: 0,
        avgProductivity: 0,
        avgSatisfaction: 0,
        topPerformer: {},
        departmentMetrics: {}
      },
      charts: {}
    };
  }

  componentDidMount() {
    this.computeEmployeeMetrics();
  }

  computeEmployeeMetrics = () => {
    const { employees } = this.state;

    const avgPerformance = employees.reduce((sum, e) => sum + e.performance, 0) / employees.length;
    const avgAttendance = employees.reduce((sum, e) => sum + e.attendance, 0) / employees.length;
    const avgProductivity = employees.reduce((sum, e) => sum + e.productivity, 0) / employees.length;
    const avgSatisfaction = employees.reduce((sum, e) => sum + e.satisfaction, 0) / employees.length;

    const topPerformer = employees.reduce((max, e) => e.performance > max.performance ? e : max);

    // Department metrics
    const departments = {};
    employees.forEach(e => {
      if (!departments[e.department]) {
        departments[e.department] = { count: 0, perf: 0, att: 0, prod: 0, sat: 0 };
      }
      departments[e.department].count += 1;
      departments[e.department].perf += e.performance;
      departments[e.department].att += e.attendance;
      departments[e.department].prod += e.productivity;
      departments[e.department].sat += e.satisfaction;
    });

    const departmentMetrics = {};
    Object.entries(departments).forEach(([dept, data]) => {
      departmentMetrics[dept] = {
        performance: (data.perf / data.count).toFixed(1),
        attendance: (data.att / data.count).toFixed(1),
        productivity: (data.prod / data.count).toFixed(1),
        satisfaction: (data.sat / data.count).toFixed(1)
      };
    });

    // Build charts
    const performanceChart = {
      labels: employees.map(e => e.name.split(' ')[0]),
      datasets: [{
        label: 'Performance (%)',
        data: employees.map(e => e.performance),
        backgroundColor: '#8862e0'
      }]
    };

    const attendanceChart = {
      labels: employees.map(e => e.name.split(' ')[0]),
      datasets: [{
        label: 'Assiduité (%)',
        data: employees.map(e => e.attendance),
        backgroundColor: '#19d895'
      }]
    };

    const departmentChart = {
      labels: Object.keys(departmentMetrics),
      datasets: [
        {
          label: 'Performance',
          data: Object.values(departmentMetrics).map(d => d.performance),
          borderColor: '#8862e0',
          backgroundColor: 'rgba(136,98,224,0.1)'
        },
        {
          label: 'Assiduité',
          data: Object.values(departmentMetrics).map(d => d.attendance),
          borderColor: '#19d895',
          backgroundColor: 'rgba(25,216,149,0.1)'
        },
        {
          label: 'Productivité',
          data: Object.values(departmentMetrics).map(d => d.productivity),
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33,150,243,0.1)'
        }
      ]
    };

    const satisfactionChart = {
      labels: employees.map(e => e.name.split(' ')[0]),
      datasets: [{
        label: 'Satisfaction Client (/5)',
        data: employees.map(e => e.satisfaction),
        backgroundColor: '#ffd166',
        borderColor: '#f96332'
      }]
    };

    this.setState({
      metrics: {
        avgPerformance: avgPerformance.toFixed(1),
        avgAttendance: avgAttendance.toFixed(1),
        avgProductivity: avgProductivity.toFixed(1),
        avgSatisfaction: avgSatisfaction.toFixed(1),
        topPerformer,
        departmentMetrics
      },
      charts: {
        performance: performanceChart,
        attendance: attendanceChart,
        department: departmentChart,
        satisfaction: satisfactionChart
      }
    });
  };

  render() {
    const { employees, metrics, charts } = this.state;
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
              <h4 className="page-title">Gestion du Personnel</h4>
              <p>Performance et suivi des employés</p>
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
                        <h3 className="mb-0 font-weight-semibold">{metrics.avgPerformance}%</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Performance Moyenne</h5>
                        <p className="mb-0 text-muted">{employees.length} employés</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{metrics.avgAttendance}%</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Assiduité Moyenne</h5>
                        <p className="mb-0 text-muted">Présences</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{metrics.avgProductivity}%</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Productivité Moyenne</h5>
                        <p className="mb-0 text-muted">Efficacité</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">{metrics.avgSatisfaction}/5</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Satisfaction Client</h5>
                        <p className="mb-0 text-muted">Moyenne</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performer */}
        {metrics.topPerformer?.id && (
          <div className="row">
            <div className="col-md-12 grid-margin">
              <div className="card bg-light-primary">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <h5 className="card-title mb-2">🌟 Meilleur Performeur</h5>
                      <h4 className="mb-1">{metrics.topPerformer.name}</h4>
                      <p className="mb-0 text-muted">{metrics.topPerformer.role} - {metrics.topPerformer.department}</p>
                    </div>
                    <div className="col-md-4 text-right">
                      <h3 className="text-primary">{metrics.topPerformer.performance}%</h3>
                      <p className="text-muted">Performance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="row">
          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Performance par Employé</h4>
                <Bar data={charts.performance} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Assiduité par Employé</h4>
                <Bar data={charts.attendance} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Métriques par Département</h4>
                <Bar data={charts.department} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Satisfaction Client</h4>
                <Doughnut data={charts.satisfaction} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Employee Details Table */}
        <div className="row">
          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title mb-4">Liste Détaillée des Employés</h4>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Employé</th>
                        <th>Rôle</th>
                        <th>Département</th>
                        <th>Performance</th>
                        <th>Assiduité</th>
                        <th>Productivité</th>
                        <th>Satisfaction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map(emp => (
                        <tr key={emp.id}>
                          <td><strong>{emp.name}</strong></td>
                          <td>{emp.role}</td>
                          <td>{emp.department}</td>
                          <td><span className="badge badge-primary">{emp.performance}%</span></td>
                          <td><span className="badge badge-success">{emp.attendance}%</span></td>
                          <td><span className="badge badge-info">{emp.productivity}%</span></td>
                          <td><span className="badge badge-warning">{emp.satisfaction}/5</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Department Summary */}
        <div className="row">
          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title mb-4">Résumé par Département</h4>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Département</th>
                        <th>Effectif</th>
                        <th>Performance</th>
                        <th>Assiduité</th>
                        <th>Productivité</th>
                        <th>Satisfaction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(metrics.departmentMetrics || {}).map(([dept, data]) => {
                        const count = employees.filter(e => e.department === dept).length;
                        return (
                          <tr key={dept}>
                            <td><strong>{dept}</strong></td>
                            <td>{count}</td>
                            <td><span className="badge badge-primary">{data.performance}%</span></td>
                            <td><span className="badge badge-success">{data.attendance}%</span></td>
                            <td><span className="badge badge-info">{data.productivity}%</span></td>
                            <td><span className="badge badge-warning">{data.satisfaction}/5</span></td>
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
      </div>
    );
  }
}

export default EmployeeManagementSingleStore;
