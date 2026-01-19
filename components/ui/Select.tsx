'use client';

import React, { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

/**
 * Select Option type
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Select Component Props
 */
export interface SelectProps {
  label?: string;
  placeholder?: string;
  options?: SelectOption[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  name?: string;
  id?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  leftIcon?: ReactNode;
  helpText?: string;
}

/**
 * Select Component
 * A customizable select dropdown with validation states
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  placeholder = 'Select an option',
  options = [],
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
  helpText,
  ...props
}, ref) => {
  // Generate ID if not provided
  const selectId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-text mb-2"
        >
          {label}
          {required && <span className="text-accent-red ml-1">*</span>}
        </label>
      )}
      
      {/* Select Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
            {leftIcon}
          </div>
        )}

        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={cn(
            // Base styles
            'w-full px-4 py-3 bg-surface-200 border rounded-xl text-text appearance-none',
            'cursor-pointer',
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
            // Transition
            'transition-all duration-200',
            className
          )}
          {...props}
        >
          {/* Placeholder Option */}
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {/* Options */}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom Dropdown Icon */}
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <ChevronDown className="h-5 w-5 text-text-muted" />
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-accent-red">{error}</p>
      )}

      {/* Help Text */}
      {helpText && (
        <p className="mt-1 text-sm text-text-muted">{helpText}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;

