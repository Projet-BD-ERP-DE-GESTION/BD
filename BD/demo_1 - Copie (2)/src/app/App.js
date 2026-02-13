import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './App.scss';
import AppRoutes from './AppRoutes';
import Navbar from './shared/Navbar';
import Sidebar from './shared/Sidebar';
import SidebarCashier from './shared/SidebarCashier';
import SidebarManager from './shared/SidebarManager';
import SettingsPanel from './shared/SettingsPanel';
import Footer from './shared/Footer';
import { withTranslation } from "react-i18next";
import { AuthContext } from './AuthContext';

class App extends Component {
  static contextType = AuthContext;

  state = {
    isFullPageLayout: false
  }

  componentDidMount() {
    this.context.restoreAuth();
    this.onRouteChanged();
  }

  render () {
    const { auth } = this.context;
    const fullPageRoutes = ['/login', '/user-pages/login-1', '/user-pages/register-1', '/error-pages/error-404', '/error-pages/error-500'];
    const isFullPage = fullPageRoutes.some(route => this.props.location.pathname.startsWith(route));
    
    let navbarComponent = !isFullPage && auth.isAuthenticated ? <Navbar/> : '';
    let sidebarComponent = !isFullPage && auth.isAuthenticated ? this.renderSidebar() : '';
    let SettingsPanelComponent = !isFullPage && auth.isAuthenticated ? <SettingsPanel/> : '';
    let footerComponent = !isFullPage && auth.isAuthenticated ? <Footer/> : '';

    return (
      <div className="container-scroller">
        { navbarComponent }
        <div className={`container-fluid page-body-wrapper ${isFullPage ? 'full-page-wrapper' : ''}`}>
          { sidebarComponent }
          <div className="main-panel">
            <div className="content-wrapper">
              <AppRoutes/>
              { SettingsPanelComponent }
            </div>
            { footerComponent }
          </div>
        </div>
      </div>
    );
  }

  renderSidebar = () => {
    const { auth } = this.context;
    switch (auth.role) {
      case 'admin':
        return <Sidebar />;
      case 'cashier':
        return <SidebarCashier />;
      case 'manager':
        return <SidebarManager />;
      default:
        return <Sidebar />;
    }
  };

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.onRouteChanged();
    }
  }

  onRouteChanged() {
    const { i18n } = this.props;
    const body = document.querySelector('body');
    const pageBodyWrapper = document.querySelector('.page-body-wrapper');
    
    if(this.props.location.pathname === '/layout/RtlLayout') {
      body.classList.add('rtl');
      i18n.changeLanguage('ar');
    }
    else {
      body.classList.remove('rtl')
      i18n.changeLanguage('en');
    }
    window.scrollTo(0, 0);

    const fullPageLayoutRoutes = ['/login', '/user-pages/login-1', '/user-pages/login-2', '/user-pages/register-1', '/user-pages/register-2', '/user-pages/lockscreen', '/error-pages/error-404', '/error-pages/error-500', '/general-pages/landing-page'];
    
    for ( let i = 0; i < fullPageLayoutRoutes.length; i++ ) {
      if (this.props.location.pathname === fullPageLayoutRoutes[i]) {
        this.setState({
          isFullPageLayout: true
        })
        if (pageBodyWrapper) {
          pageBodyWrapper.classList.add('full-page-wrapper');
        }
        break;
      } else {
        this.setState({
          isFullPageLayout: false
        })
        if (pageBodyWrapper) {
          pageBodyWrapper.classList.remove('full-page-wrapper');
        }
      }
    }
  }
}

export default withTranslation()(withRouter(App));
