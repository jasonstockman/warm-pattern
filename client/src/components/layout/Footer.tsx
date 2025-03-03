import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Finance App</h3>
          <p>Manage your finances with ease</p>
        </div>
        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/accounts">Accounts</Link></li>
            <li><Link to="/transactions">Transactions</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Help</h3>
          <ul>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/support">Support</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} Finance App. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 