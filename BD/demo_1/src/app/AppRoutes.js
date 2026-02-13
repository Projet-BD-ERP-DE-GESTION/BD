import React, { Component,Suspense, lazy } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Spinner from '../app/shared/Spinner';

const Dashboard = lazy(() => import('./dashboard/Dashboard'));
const Login = lazy(() => import('./user-pages/Login'));

// Basic UI
const Buttons = lazy(() => import('./basic-ui/Buttons'));
const Dropdowns = lazy(() => import('./basic-ui/Dropdowns'));
const WeeklyRevenue = lazy(() => import('./basic-ui/WeeklyRevenue'));
const PerformanceDashboard = lazy(() => import('./basic-ui/PerformanceDashboard'));
const ProductAnalysis = lazy(() => import('./basic-ui/ProductAnalysis'));
const EmployeeManagement = lazy(() => import('./basic-ui/EmployeeManagement'));
const DemandAnalysis = lazy(() => import('./basic-ui/DemandAnalysis'));
const CashierRegister = lazy(() => import('./basic-ui/CashierRegister'));
const CashierActivity = lazy(() => import('./basic-ui/CashierActivity'));

// Caisse (Single Store)
const SalesAnalysisDashboard = lazy(() => import('./caisse/SalesAnalysisDashboard'));
const SalesAnalytics = lazy(() => import('./caisse/SalesAnalytics'));
const CashierActivitySingleStore = lazy(() => import('./caisse/CashierActivity'));
const CashierRegisterSingleStore = lazy(() => import('./caisse/CashierRegister'));
const EmployeeManagementSingleStore = lazy(() => import('./caisse/EmployeeManagement'));
const DemandAnalysisSingleStore = lazy(() => import('./caisse/DemandAnalysis'));
const PerformanceDashboardSingleStore = lazy(() => import('./caisse/PerformanceDashboard'));

const BasicElements = lazy(() => import('./form-elements/BasicElements'));
const BasicTable = lazy(() => import('./tables/BasicTable'));
const Mdi = lazy(() => import('./icons/Mdi'));
const ChartJs = lazy(() => import('./charts/ChartJs'));

const Error404 = lazy(() => import('./error-pages/Error404'));
const Error500 = lazy(() => import('./error-pages/Error500'));
const Register1 = lazy(() => import('./user-pages/Register'));


class AppRoutes extends Component {
  render () {
    return (
      <Suspense fallback={<Spinner/>}>
        <Switch>
          {/* Auth Routes */}
          <Route path="/login" component={ Login } />
          <Route exact path="/dashboard" component={ Dashboard } />

          {/* Admin Routes */}
          <Route path="/basic-ui/buttons" component={ Buttons } />
          <Route path="/basic-ui/dropdowns" component={ Dropdowns } />
          <Route path="/basic-ui/weekly-revenue" component={ WeeklyRevenue } />
          <Route path="/basic-ui/sales-analysis" component={ SalesAnalysisDashboard } />
          <Route path="/basic-ui/performance" component={ PerformanceDashboard } />
          <Route path="/basic-ui/products" component={ ProductAnalysis } />
          <Route path="/basic-ui/employees" component={ EmployeeManagement } />
          <Route path="/basic-ui/demand" component={ DemandAnalysis } />
          <Route path="/basic-ui/cashier" component={ CashierRegister } />
          <Route path="/basic-ui/cashier-activity" component={ CashierActivity } />

          {/* Cashier Routes */}
          <Route path="/cashier/register" component={ CashierRegisterSingleStore } />
          <Route path="/cashier/sales-dashboard" component={ SalesAnalysisDashboard } />
          <Route path="/cashier/sales-analytics" component={ SalesAnalytics } />

          {/* Manager Routes */}
          <Route path="/manager/sales-dashboard" component={ SalesAnalysisDashboard } />
          <Route path="/manager/performance" component={ PerformanceDashboardSingleStore } />
          <Route path="/manager/employees" component={ EmployeeManagementSingleStore } />
          <Route path="/manager/demand" component={ DemandAnalysisSingleStore } />
          <Route path="/manager/cashier-activity" component={ CashierActivitySingleStore } />
          <Route path="/manager/cashier-register" component={ CashierRegisterSingleStore } />

          {/* Other Routes */}
          <Route path="/form-Elements/basic-elements" component={ BasicElements } />
          <Route path="/tables/basic-table" component={ BasicTable } />
          <Route path="/icons/mdi" component={ Mdi } />
          <Route path="/charts/chart-js" component={ ChartJs } />

          <Route path="/user-pages/login-1" component={ Login } />
          <Route path="/user-pages/register-1" component={ Register1 } />

          <Route path="/error-pages/error-404" component={ Error404 } />
          <Route path="/error-pages/error-500" component={ Error500 } />

          <Redirect to="/login" />
        </Switch>
      </Suspense>
    );
  }
}

export default AppRoutes;