import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';

const Header: React.FC = () => {
  const auth = useAuth();
  const user = auth.user;
  const isAuthenticated = auth.isAuthenticated;
  const logout = auth.logout;
  
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/auth');
  };
  
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <h1>Finance App</h1>
          </Link>
        </div>
        
        <nav className="main-nav">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/accounts">Accounts</Link>
              <Link to="/transactions">Transactions</Link>
              <Link to="/assets">Assets</Link>
            </>
          ) : (
            <Link to="/">Home</Link>
          )}
        </nav>
        
        <div className="auth-controls">
          {isAuthenticated ? (
            <>
              <span className="user-greeting">
                Hello, {user?.username || 'User'}
              </span>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="login-button">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 