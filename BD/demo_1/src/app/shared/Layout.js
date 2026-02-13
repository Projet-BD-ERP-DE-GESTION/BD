import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../app/AuthContext';
import Sidebar from './Sidebar';
import SidebarCashier from './SidebarCashier';
import SidebarManager from './SidebarManager';
import NavBar from './Navbar';
import SettingsPanel from './SettingsPanel';
import Footer from './Footer';

const Layout = ({ children }) => {
  const { auth, restoreAuth } = useContext(AuthContext);
  const history = useHistory();

  useEffect(() => {
    restoreAuth();
  }, []);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      history.push('/login');
    }
  }, [auth.isAuthenticated, history]);

  if (!auth.isAuthenticated) {
    return null;
  }

  const renderSidebar = () => {
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

  return (
    <div className="container-scroller">
      {renderSidebar()}
      <div className="container-fluid page-body-wrapper">
        <NavBar />
        <div className="main-panel">
          <div className="content-wrapper">
            {children}
          </div>
          <Footer />
        </div>
      </div>
      <SettingsPanel />
    </div>
  );
};

export default Layout;
