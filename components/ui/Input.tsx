'use client';

import { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Input Component Props
 */
interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  helpText?: string;
}

/**
 * Input Component
 * A customizable input field with validation states
 */
const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  name,
  id,
  error,
  disabled = false,
  required = false,
  className = '',
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  // Generate ID if not provided
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text mb-2"
        >
          {label}
          {required && <span className="text-accent-red ml-1">*</span>}
        </label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
            {leftIcon}
          </div>
        )}
        
        {/* Input Field */}
        <input
          ref={ref}
          type={type}
          id={inputId}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={cn(
            // Base styles
            'w-full px-4 py-3 bg-surface-200 border rounded-xl text-text',
            'placeholder:text-text-muted',
            // Focus states
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
            // Border states
            error
              ? 'border-accent-red focus:border-accent-red'
              : 'border-surface-300 focus:border-primary-500',
            // Disabled state
            disabled && 'opacity-50 cursor-not-allowed',
            // Icon padding
            leftIcon && 'pl-11',
            rightIcon && 'pr-11',
            // Transition
            'transition-all duration-200',
            className
          )}
          {...props}
        />
        
        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-text-muted">
            {rightIcon}
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-accent-red">{error}</p>
      )}

      {/* Help Text */}
      {props.helpText && !error && (
        <p className="mt-1 text-sm text-text-muted">{props.helpText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

