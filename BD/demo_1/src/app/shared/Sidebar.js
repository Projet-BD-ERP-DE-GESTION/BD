import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Collapse } from 'react-bootstrap';
import { Dropdown } from 'react-bootstrap';
import { Trans } from 'react-i18next';

class Sidebar extends Component {
  state = {};

  toggleMenuState(menuState) {
    if (this.state[menuState]) {
      this.setState({[menuState] : false});
    } else if(Object.keys(this.state).length === 0) {
      this.setState({[menuState] : true});
    } else {
      Object.keys(this.state).forEach(i => {
        this.setState({[i]: false});
      });
      this.setState({[menuState] : true});
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.onRouteChanged();
    }
  }

  onRouteChanged() {
    document.querySelector('#sidebar').classList.remove('active');
    Object.keys(this.state).forEach(i => {
      this.setState({[i]: false});
    });
 
  } 
  render () {
    return (
      <nav className="sidebar sidebar-offcanvas" id="sidebar">
        <div className="text-center sidebar-brand-wrapper d-flex align-items-center">
          <a className="sidebar-brand brand-logo" href="index.html"><img src={require("../../assets/images/logo.svg")} alt="logo" /></a>
          <a className="sidebar-brand brand-logo-mini pt-3" href="index.html"><img src={require("../../assets/images/logo-mini.svg" )} alt="logo" /></a>
        </div>
        <ul className="nav">
          <li className="nav-item nav-profile not-navigation-link">
            <div className="nav-link">
              <Dropdown>
                <Dropdown.Menu className="preview-list navbar-dropdown">
                  <Dropdown.Item className="dropdown-item p-0 preview-item d-flex align-items-center" href="!#" onClick={evt =>evt.preventDefault()}>
                    <div className="d-flex">
                      <div className="py-3 px-4 d-flex align-items-center justify-content-center">
                        <i className="mdi mdi-bookmark-plus-outline mr-0"></i>
                      </div>
                      <div className="py-3 px-4 d-flex align-items-center justify-content-center border-left border-right">
                        <i className="mdi mdi-account-outline mr-0"></i>
                      </div>
                      <div className="py-3 px-4 d-flex align-items-center justify-content-center">
                        <i className="mdi mdi-alarm-check mr-0"></i>
                      </div>
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Item className="dropdown-item preview-item d-flex align-items-center text-small" onClick={evt =>evt.preventDefault()}>
                    <Trans>Manage Accounts</Trans>
                  </Dropdown.Item>
                  <Dropdown.Item className="dropdown-item preview-item d-flex align-items-center text-small" onClick={evt =>evt.preventDefault()}>
                    <Trans>Change Password</Trans>
                  </Dropdown.Item>
                  <Dropdown.Item className="dropdown-item preview-item d-flex align-items-center text-small" onClick={evt =>evt.preventDefault()}>
                    <Trans>Check Inbox</Trans>
                  </Dropdown.Item>
                  <Dropdown.Item className="dropdown-item preview-item d-flex align-items-center text-small" onClick={evt =>evt.preventDefault()}>
                    <Trans>Sign Out</Trans>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </li>
      
          <li className={ this.isPathActive('/dashboard') ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to="/dashboard">
              <i className="mdi mdi-television menu-icon"></i>
              <span className="menu-title"><Trans>Dashboard Executif</Trans></span>
            </Link>
          </li>
          <li className={ this.isPathActive('/basic-ui/sales-analysis') ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to="/basic-ui/sales-analysis">
              <i className="mdi mdi-chart-line menu-icon"></i>
              <span className="menu-title"><Trans>Analyse Ventes</Trans></span>
            </Link>
          </li>
          <li className={ this.isPathActive('/basic-ui/weekly-revenue') ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to="/basic-ui/weekly-revenue">
              <i className="mdi mdi-currency-usd menu-icon"></i>
              <span className="menu-title"><Trans>Recettes Semaine</Trans></span>
            </Link>
          </li>
          <li className={ this.isPathActive('/basic-ui/performance') ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to="/basic-ui/performance">
              <i className="mdi mdi-speedometer menu-icon"></i>
              <span className="menu-title"><Trans>Analyse Performances</Trans></span>
            </Link>
          </li>
          <li className={ this.isPathActive('/basic-ui/products') ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to="/basic-ui/products">
              <i className="mdi mdi-package-variant menu-icon"></i>
              <span className="menu-title"><Trans>Analyse Produits</Trans></span>
            </Link>
          </li>
          <li className={ this.isPathActive('/basic-ui/employees') ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to="/basic-ui/employees">
              <i className="mdi mdi-account-multiple menu-icon"></i>
              <span className="menu-title"><Trans>Gestion Personnel</Trans></span>
            </Link>
          </li>
          <li className={ this.isPathActive('/basic-ui/demand') ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to="/basic-ui/demand">
              <i className="mdi mdi-trending-up menu-icon"></i>
              <span className="menu-title"><Trans>Prédiction Demande</Trans></span>
            </Link>
          </li>
          <li className={ this.isPathActive('/basic-ui/cashier') ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to="/basic-ui/cashier">
              <i className="mdi mdi-cash-register menu-icon"></i>
              <span className="menu-title"><Trans>Caisse</Trans></span>
            </Link>
          </li>
          <li className={ this.isPathActive('/basic-ui/cashier-activity') ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to="/basic-ui/cashier-activity">
              <i className="mdi mdi-chart-box-outline menu-icon"></i>
              <span className="menu-title"><Trans>Mon Activité</Trans></span>
            </Link>
          </li>
        </ul>
      </nav>
    );
  }

  isPathActive(path) {
    return this.props.location.pathname.startsWith(path);
  }

  componentDidMount() {
    this.onRouteChanged();
    // add className 'hover-open' to sidebar navitem while hover in sidebar-icon-only menu
    const body = document.querySelector('body');
    document.querySelectorAll('.sidebar .nav-item').forEach((el) => {
      
      el.addEventListener('mouseover', function() {
        if(body.classList.contains('sidebar-icon-only')) {
          el.classList.add('hover-open');
        }
      });
      el.addEventListener('mouseout', function() {
        if(body.classList.contains('sidebar-icon-only')) {
          el.classList.remove('hover-open');
        }
      });
    });
  }

}

export default withRouter(Sidebar);