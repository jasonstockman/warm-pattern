import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Take Control of Your Finances</h1>
          <p>Connect your accounts, track your spending, and build your financial future.</p>
          <div className="hero-cta">
            <Link to="/auth" className="primary-button">Get Started</Link>
            <Link to="/about" className="secondary-button">Learn More</Link>
          </div>
        </div>
        <div className="hero-image">
          {/* Placeholder for an illustration */}
          <div className="placeholder-image">
            <span>Finance App Dashboard</span>
          </div>
        </div>
      </section>
      
      <section className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>Connect Accounts</h3>
            <p>Securely connect your bank accounts to automatically import and categorize transactions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Spending</h3>
            <p>See where your money goes with easy-to-understand charts and spending breakdowns.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Manage Assets</h3>
            <p>Add and track your assets to get a complete picture of your net worth.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your financial data is encrypted and protected. We never share your information.</p>
          </div>
        </div>
      </section>
      
      <section className="how-it-works-section">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create an Account</h3>
            <p>Sign up for a free account to get started.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Connect Your Bank</h3>
            <p>Link your bank accounts through our secure Plaid integration.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Track Your Finances</h3>
            <p>Your transactions will automatically sync, and you can add your assets.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Gain Insights</h3>
            <p>Get a clear picture of your spending habits and financial health.</p>
          </div>
        </div>
      </section>
      
      <section className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of users who have taken control of their finances.</p>
        <Link to="/auth" className="primary-button large">Create Your Account</Link>
      </section>
    </div>
  );
};

export default HomePage; 