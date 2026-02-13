import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Trans } from 'react-i18next';
import { AuthContext } from '../AuthContext';

class SidebarCashier extends Component {
  static contextType = AuthContext;

  state = { profile: null };

  async componentDidMount() {
    const { auth } = this.context;
    if (auth?.user?.id) {
      try {
        const res = await fetch(`http://localhost:4000/api/users/${auth.user.id}`);
        if (res.ok) {
          const profile = await res.json();
          this.setState({ profile });
        }
      } catch (e) {
        this.setState({ profile: null });
      }
    }
  }

  render() {
    const { auth, logout } = this.context;
    const { profile } = this.state;
    return (
      <nav className="sidebar sidebar-offcanvas" id="sidebar">
        <div className="text-center sidebar-brand-wrapper d-flex align-items-center">
          <a className="sidebar-brand brand-logo" href="index.html"><img src={require("../../assets/images/logo.svg")} alt="logo" /></a>
          <a className="sidebar-brand brand-logo-mini pt-3" href="index.html"><img src={require("../../assets/images/logo-mini.svg")} alt="logo" /></a>
        </div>
        <ul className="nav">
          <li className="nav-item nav-profile not-navigation-link">
            <div className="nav-link">
              <div className="profile-image">
                <img src={require("../../assets/images/faces/face8.jpg")} alt="profile" />
              </div>
              <div className="profile-name">
                <p className="name">{profile?.username || auth?.user?.username}</p>
                <p className="designation">{profile?.role || 'Caissier'}</p>
                <p className="designation"><small>ID: {profile?._id || auth?.user?.id}</small></p>
              </div>
            </div>
          </li>

          <li className={ this.isPathActive('/cashier/register') ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to="/cashier/register">
              <i className="mdi mdi-cash-register menu-icon"></i>
              <span className="menu-title"><Trans>Caisse</Trans></span>
            </Link>
          </li>

          <li className={ this.isPathActive('/cashier/sales-dashboard') ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to="/cashier/sales-dashboard">
              <i className="mdi mdi-chart-line menu-icon"></i>
              <span className="menu-title"><Trans>Analyse Ventes</Trans></span>
            </Link>
          </li>

          <li className={ this.isPathActive('/cashier/sales-analytics') ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to="/cashier/sales-analytics">
              <i className="mdi mdi-chart-box menu-icon"></i>
              <span className="menu-title"><Trans>Statistiques</Trans></span>
            </Link>
          </li>

          <li className="nav-item">
            <button 
              className="nav-link btn btn-link w-100 text-left mt-4"
              onClick={logout}
            >
              <i className="mdi mdi-logout menu-icon"></i>
              <span className="menu-title"><Trans>Déconnexion</Trans></span>
            </button>
          </li>
        </ul>
      </nav>
    );
  }

  isPathActive(path) {
    return this.props.location.pathname.startsWith(path);
  }

  componentDidMount() {
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

export default withRouter(SidebarCashier);
