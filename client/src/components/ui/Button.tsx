import React, { forwardRef } from 'react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button content
   */
  children: React.ReactNode;
  
  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'link';
  
  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Whether the button is in a loading state
   */
  isLoading?: boolean;
  
  /**
   * Text to display when the button is loading
   */
  loadingText?: string;
  
  /**
   * Whether the button should take up the full width
   */
  fullWidth?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Button component - A flexible button with various styling options
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText = 'Loading...',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const widthClass = fullWidth ? 'btn-block' : '';
  
  const btnClassName = [
    baseClass,
    variantClass,
    sizeClass,
    widthClass,
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <button
      className={btnClassName}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="spinner" aria-hidden="true"></span>
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

Button.displayName = 'Button';

/**
 * IconButton component - A button that only displays an icon
 */
export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'startIcon' | 'endIcon'> {
  /**
   * Icon to display
   */
  icon: React.ReactNode;
  
  /**
   * Accessible label for the button
   */
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({
    icon,
    variant = 'primary',
    size = 'medium',
    loading = false,
    fullWidth = false,
    className,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;
    
    return (
      <button
        ref={ref}
        className={clsx(
          'icon-button',
          `icon-button--${variant}`,
          `icon-button--${size}`,
          {
            'icon-button--loading': loading,
            'icon-button--full-width': fullWidth,
          },
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <span className="icon-button__loader" aria-hidden="true">
            <span className="icon-button__loader-dot" />
            <span className="icon-button__loader-dot" />
            <span className="icon-button__loader-dot" />
          </span>
        ) : (
          <span className="icon-button__icon">{icon}</span>
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default Button; 