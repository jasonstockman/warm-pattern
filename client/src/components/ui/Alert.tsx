import React from 'react';

interface AlertProps {
  variant: 'success' | 'info' | 'warning' | 'danger';
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  variant,
  message,
  dismissible = false,
  onDismiss,
  className = '',
}) => {
  return (
    <div 
      className={`alert alert-${variant} ${dismissible ? 'alert-dismissible' : ''} ${className}`} 
      role="alert"
    >
      {message}
      
      {dismissible && onDismiss && (
        <button 
          type="button" 
          className="close" 
          aria-label="Close"
          onClick={onDismiss}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </div>
  );
};

export default Alert; 