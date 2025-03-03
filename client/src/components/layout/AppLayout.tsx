import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-container">
          <div className="logo">
            <Link to="/">Personal Finance</Link>
          </div>
          
          {isAuthenticated && (
            <nav className="main-nav">
              <ul>
                <li>
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link to="/accounts">Accounts</Link>
                </li>
                <li>
                  <Link to="/transactions">Transactions</Link>
                </li>
              </ul>
            </nav>
          )}
          
          <div className="user-menu">
            {isAuthenticated ? (
              <div className="user-info">
                <span>Welcome, {user?.username}</span>
                <div className="dropdown">
                  <button className="dropdown-toggle">
                    Account
                  </button>
                  <div className="dropdown-menu">
                    <Link to="/profile">Profile</Link>
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login">Login</Link>
                <Link to="/signup">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="app-content">
        {children}
      </main>
      
      <footer className="app-footer">
        <div className="footer-container">
          <p>&copy; {new Date().getFullYear()} Personal Finance App</p>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout; 