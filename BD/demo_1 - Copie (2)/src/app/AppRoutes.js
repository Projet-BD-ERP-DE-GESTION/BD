import React, { Component,Suspense, lazy } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

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
          <ProtectedRoute exact path="/dashboard" component={ Dashboard } requiredRole="admin" />

          {/* Admin Routes */}
          <ProtectedRoute path="/basic-ui/buttons" component={ Buttons } requiredRole="admin" />
          <ProtectedRoute path="/basic-ui/dropdowns" component={ Dropdowns } requiredRole="admin" />
          <ProtectedRoute path="/basic-ui/weekly-revenue" component={ WeeklyRevenue } requiredRole="admin" />
          <ProtectedRoute path="/basic-ui/sales-analysis" component={ SalesAnalysisDashboard } requiredRole="admin" />
          <ProtectedRoute path="/basic-ui/performance" component={ PerformanceDashboard } requiredRole="admin" />
          <ProtectedRoute path="/basic-ui/products" component={ ProductAnalysis } requiredRole="admin" />
          <ProtectedRoute path="/basic-ui/employees" component={ EmployeeManagement } requiredRole="admin" />
          <ProtectedRoute path="/basic-ui/demand" component={ DemandAnalysis } requiredRole="admin" />
          <ProtectedRoute path="/basic-ui/cashier" component={ CashierRegister } requiredRole="admin" />
          <ProtectedRoute path="/basic-ui/cashier-activity" component={ CashierActivity } requiredRole="admin" />

          {/* Cashier Routes */}
          <ProtectedRoute path="/cashier/register" component={ CashierRegisterSingleStore } requiredRole="cashier" />
          <ProtectedRoute path="/cashier/sales-dashboard" component={ SalesAnalysisDashboard } requiredRole="cashier" />
          <ProtectedRoute path="/cashier/sales-analytics" component={ SalesAnalytics } requiredRole="cashier" />

          {/* Manager Routes */}
          <ProtectedRoute path="/manager/sales-dashboard" component={ SalesAnalysisDashboard } requiredRole="manager" />
          <ProtectedRoute path="/manager/performance" component={ PerformanceDashboardSingleStore } requiredRole="manager" />
          <ProtectedRoute path="/manager/employees" component={ EmployeeManagementSingleStore } requiredRole="manager" />
          <ProtectedRoute path="/manager/demand" component={ DemandAnalysisSingleStore } requiredRole="manager" />
          <ProtectedRoute path="/manager/cashier-activity" component={ CashierActivitySingleStore } requiredRole="manager" />
          <ProtectedRoute path="/manager/cashier-register" component={ CashierRegisterSingleStore } requiredRole="manager" />

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