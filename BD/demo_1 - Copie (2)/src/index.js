import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import { AuthProvider } from './app/AuthContext';
import "./i18n";
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <BrowserRouter basename="/demo/star-admin-free/react/template/demo_1/preview">
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
, document.getElementById('root'));

serviceWorker.unregister();