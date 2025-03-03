import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface AuthPageProps {
  onSuccess?: () => void;
  defaultMode?: 'login' | 'signup';
}

const AuthPage: React.FC<AuthPageProps> = ({ 
  onSuccess,
  defaultMode = 'login'
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(defaultMode);
  
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-tabs">
          <button
            className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
            onClick={() => setAuthMode('login')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
            onClick={() => setAuthMode('signup')}
          >
            Create Account
          </button>
        </div>
        
        <div className="auth-content">
          {authMode === 'login' ? (
            <LoginForm onSuccess={onSuccess} />
          ) : (
            <SignupForm onSuccess={onSuccess} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 