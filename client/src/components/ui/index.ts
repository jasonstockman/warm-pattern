/**
 * UI Components
 * 
 * This file exports all primitive UI components for easy importing.
 * Import components from this file instead of individual files:
 * 
 * @example
 * // Good
 * import { Button, Card } from '@/components/ui';
 * 
 * // Avoid
 * import Button from '@/components/ui/Button';
 * import Card from '@/components/ui/Card';
 */

export { default as Button, IconButton } from './Button';
export type { ButtonProps, IconButtonProps } from './Button';

export { default as Card } from './Card';
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps } from './Card'; 