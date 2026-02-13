import React, { Component } from 'react';

class Buttons extends Component {
  render () {
    return (
      <div>
        <div className="row page-title-header">
          <div className="col-12">
            <div className="page-header">
              <h4 className="page-title">Dashboard Executif</h4>
              <p>Vue strategique complete sur les deroulement des activitées</p>
               <div className="quick-link-wrapper w-100 d-md-flex flex-md-wrap">
                <ul className="quick-links">
                  <li><a href="!#" onClick={evt =>evt.preventDefault()}>Aujourd'hui</a></li>
                  <li><a href="!#" onClick={evt =>evt.preventDefault()}>Cette Semaine</a></li>
                  <li><a href="!#" onClick={evt =>evt.preventDefault()}>Ce mois</a></li>
                </ul>
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
                        <h3 className="mb-0 font-weight-semibold">32,451 $</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Chiffre d'affaire</h5>
                        <p className="mb-0 text-muted">+14.00(+0.50%)</p>
                      </div>
                      <div className="wrapper my-auto ml-auto ml-lg-4">
                        {/* <Line ref='chart' data={this.state.visitChartData} options={this.state.areaOptions}  datasetKeyProvider={this.state.datasetKeyProvider} height={50} width={100} id="visitChart" /> */}
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">15,236</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Transaction</h5>
                        <p className="mb-0 text-muted">+138.97(+0.54%)</p>
                      </div>
                      <div className="wrapper my-auto ml-auto ml-lg-4">
                        {/* <Line ref='chart' data={this.state.impressionChartData} options={this.state.areaOptions}  datasetKeyProvider={this.state.datasetKeyProvider} height={50} width={100} id="imoressionChart" /> */}
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">7,688</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Panier moyen</h5>
                        <p className="mb-0 text-muted">+57.62(+0.76%)</p>
                      </div>
                      <div className="wrapper my-auto ml-auto ml-lg-4">
                        {/* <Line ref='chart' data={this.state.conversionChartData} options={this.state.areaOptions}  datasetKeyProvider={this.state.datasetKeyProvider} height={50} width={100} id="conversionChart" /> */}
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-sm-6 mt-md-0 mt-4 grid-margin-xl-0 grid-margin">
                    <div className="d-flex">
                      <div className="wrapper">
                        <h3 className="mb-0 font-weight-semibold">1,553</h3>
                        <h5 className="mb-0 font-weight-medium text-primary">Articles vendues</h5>
                        <p className="mb-0 text-muted">+138.97(+0.54%)</p>
                      </div>
                      <div className="wrapper my-auto ml-auto ml-lg-4">
                        {/* <Line ref='chart' data={this.state.downloadChartData} options={this.state.areaOptions}  datasetKeyProvider={this.state.datasetKeyProvider} height={50} width={100} id="downloadChart" /> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Buttons;