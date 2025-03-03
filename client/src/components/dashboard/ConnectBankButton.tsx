import React, { useCallback, useEffect } from 'react';
import { usePlaidLink } from '../../contexts';

interface ConnectBankButtonProps {
  onSuccess?: () => void;
  className?: string;
}

const ConnectBankButton: React.FC<ConnectBankButtonProps> = ({ 
  onSuccess,
  className = 'connect-bank-button'
}) => {
  const { 
    linkToken, 
    generateLinkToken, 
    exchangePublicToken, 
    isLoading, 
    error 
  } = usePlaidLink();
  
  // Generate a link token when the component mounts
  useEffect(() => {
    if (!linkToken) {
      generateLinkToken();
    }
  }, [linkToken, generateLinkToken]);
  
  // Configure Plaid Link
  const handlePlaidSuccess = useCallback(async (publicToken: string) => {
    const success = await exchangePublicToken(publicToken);
    if (success && onSuccess) {
      onSuccess();
    }
  }, [exchangePublicToken, onSuccess]);
  
  // Open Plaid Link when the button is clicked
  const handleClick = useCallback(() => {
    if (!linkToken || isLoading) return;
    
    // Load Plaid Link if available
    if (window.Plaid) {
      window.Plaid.create({
        token: linkToken,
        onSuccess: (public_token: string) => {
          handlePlaidSuccess(public_token);
        },
        onExit: (err: any) => {
          if (err) {
            console.error('Plaid Link error:', err);
          }
        },
      }).open();
    } else {
      console.error('Plaid Link not available');
    }
  }, [linkToken, isLoading, handlePlaidSuccess]);
  
  return (
    <div className="connect-bank-container">
      {error && <div className="connect-bank-error">{error}</div>}
      
      <button
        className={className}
        onClick={handleClick}
        disabled={!linkToken || isLoading}
      >
        {isLoading ? 'Loading...' : 'Connect Bank Account'}
      </button>
      
      <small className="connect-bank-note">
        Securely connect your bank accounts to get started
      </small>
    </div>
  );
};

// Add TypeScript interface for the Plaid global object
declare global {
  interface Window {
    Plaid: {
      create: (config: any) => {
        open: () => void;
      };
    };
  }
}

export default ConnectBankButton; 