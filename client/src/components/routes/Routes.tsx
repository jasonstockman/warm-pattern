import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useAuth } from '../../contexts';

// Import page components
// These will be created in later steps
const LoginPage = React.lazy(() => import('../../pages/LoginPage'));
const SignupPage = React.lazy(() => import('../../pages/SignupPage'));
const DashboardPage = React.lazy(() => import('../../pages/DashboardPage'));
const AccountsPage = React.lazy(() => import('../../pages/AccountsPage'));
const AccountDetailsPage = React.lazy(() => import('../../pages/AccountDetailsPage'));
const TransactionsPage = React.lazy(() => import('../../pages/TransactionsPage'));
const SettingsPage = React.lazy(() => import('../../pages/SettingsPage'));
const ProfilePage = React.lazy(() => import('../../pages/ProfilePage'));
const LinkAccountPage = React.lazy(() => import('../../pages/LinkAccountPage'));
const NotFoundPage = React.lazy(() => import('../../pages/NotFoundPage'));

// Protected route component
const PrivateRoute: React.FC<{
  component: React.ComponentType<any>;
  path: string;
  exact?: boolean;
}> = ({ component: Component, ...rest }) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};

const Routes: React.FC = () => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Switch>
        {/* Public routes */}
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
        
        {/* Protected routes */}
        <PrivateRoute exact path="/" component={DashboardPage} />
        <PrivateRoute exact path="/accounts" component={AccountsPage} />
        <PrivateRoute path="/accounts/:accountId" component={AccountDetailsPage} />
        <PrivateRoute path="/transactions" component={TransactionsPage} />
        <PrivateRoute path="/settings" component={SettingsPage} />
        <PrivateRoute path="/profile" component={ProfilePage} />
        <PrivateRoute path="/link-account" component={LinkAccountPage} />
        
        {/* 404 route */}
        <Route component={NotFoundPage} />
      </Switch>
    </React.Suspense>
  );
};

export default Routes; 