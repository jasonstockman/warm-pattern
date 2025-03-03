import React, { useEffect, useState } from 'react';
import { usePlaidLink } from '../../contexts';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

interface PlaidLinkButtonProps {
  buttonText?: string;
  onSuccess?: () => void;
  className?: string;
}

const PlaidLinkButton: React.FC<PlaidLinkButtonProps> = ({
  buttonText = 'Connect your bank account',
  onSuccess,
  className = '',
}) => {
  const { generateLinkToken, exchangePublicToken, linkToken, isLoading, error, resetState } = usePlaidLink();
  const [plaidError, setPlaidError] = useState<string | null>(null);
  
  // Generate a link token when the component mounts
  useEffect(() => {
    const init = async () => {
      try {
        await generateLinkToken();
      } catch (err) {
        console.error('Failed to initialize Plaid Link:', err);
        setPlaidError('Failed to initialize Plaid Link. Please try again later.');
      }
    };
    
    init();
    
    // Clean up when component unmounts
    return () => {
      resetState();
    };
  }, [generateLinkToken, resetState]);
  
  // Handle opening Plaid Link
  const handleOpenLink = () => {
    if (!linkToken) {
      setPlaidError('Link token not available. Please try again later.');
      return;
    }
    
    // Load Plaid Link script
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    script.onload = () => {
      // Initialize Plaid Link
      // @ts-ignore
      const handler = window.Plaid.create({
        token: linkToken,
        onSuccess: async (public_token: string) => {
          try {
            const success = await exchangePublicToken(public_token);
            if (success && onSuccess) {
              onSuccess();
            }
          } catch (err) {
            console.error('Failed to exchange public token:', err);
            setPlaidError('Failed to connect your account. Please try again later.');
          }
        },
        onExit: (err: any) => {
          if (err != null) {
            console.error('Plaid Link error:', err);
            setPlaidError(err.error_message || 'An error occurred during the link process.');
          }
        },
        onEvent: (eventName: string) => {
          console.log('Plaid Link event:', eventName);
        },
      });
      
      handler.open();
    };
    
    document.body.appendChild(script);
  };
  
  return (
    <div className={`plaid-link-container ${className}`}>
      {(error || plaidError) && (
        <Alert 
          variant="danger" 
          message={error || plaidError || ''} 
          dismissible 
          onDismiss={() => setPlaidError(null)} 
          className="mb-3" 
        />
      )}
      
      <Button
        variant="primary"
        onClick={handleOpenLink}
        isLoading={isLoading}
        loadingText="Preparing link..."
        disabled={!linkToken || isLoading}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default PlaidLinkButton; 