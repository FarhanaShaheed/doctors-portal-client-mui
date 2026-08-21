import React from 'react';
import { Redirect, Route } from 'react-router';
import useAuth from '../../../hooks/useAuth';

const AdminRoute = ({ children, ...rest }) => {
  const { user, admin, isLoading, roleLoading } = useAuth();

  /* `roleLoading` matters as much as `isLoading`: the session resolves one
     round-trip before the role does, and without this wait an administrator
     opening an admin page directly would be bounced out as a patient. */
  if (isLoading || roleLoading) {
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
