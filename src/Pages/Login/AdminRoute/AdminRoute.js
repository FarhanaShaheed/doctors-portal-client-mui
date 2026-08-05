import React from 'react';
import { Redirect, Route } from 'react-router';
import useAuth from '../../../hooks/useAuth';

const AdminRoute = ({ children, ...rest }) => {
  const { user, admin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="dash-loading">
        <span className="spinner" />
        <span>Checking permissions…</span>
      </div>
    );
  }

  return (
    <Route
      {...rest}
      render={({ location }) =>
        user?.email && admin ? children : <Redirect to={{ pathname: '/dashboard', state: { from: location } }} />
      }
    />
  );
};

export default AdminRoute;
