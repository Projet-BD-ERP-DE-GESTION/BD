import React, { useContext } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ component: Component, requiredRole, ...rest }) => {
  const { auth } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      render={props =>
        !auth.isAuthenticated ? (
          <Redirect to="/login" />
        ) : requiredRole && auth.role !== requiredRole ? (
          <Redirect to="/unauthorized" />
        ) : (
          <Component {...props} />
        )
      }
    />
  );
};

export default ProtectedRoute;
