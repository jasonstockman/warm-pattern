import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  label?: string;
  fullPage?: boolean;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  color = 'primary',
  label,
  fullPage = false,
  className = '',
}) => {
  const containerClass = fullPage 
    ? `loader-container loader-fullpage ${className}` 
    : `loader-container ${className}`;
    
  const spinnerClass = `loader-spinner loader-${size} loader-${color}`;
  
  return (
    <div className={containerClass}>
      <div className={spinnerClass}>
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
      {label && <div className="loader-text">{label}</div>}
    </div>
  );
};

export default Loader; 