'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Textarea Component Props
 */
interface TextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  name?: string;
  id?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
  helpText?: string;
}

/**
 * Textarea Component
 * A customizable textarea with validation states
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  name,
  id,
  error,
  disabled = false,
  required = false,
  rows = 4,
  maxLength,
  className = '',
  helpText,
  ...props
}, ref) => {
  // Generate ID if not provided
  const textareaId = id || name || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-text mb-2"
        >
          {label}
          {required && <span className="text-accent-red ml-1">*</span>}
        </label>
      )}
      
      {/* Textarea Field */}
      <textarea
        ref={ref}
        id={textareaId}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        className={cn(
          // Base styles
          'w-full px-4 py-3 bg-surface-200 border rounded-xl text-text resize-none',
          'placeholder:text-text-muted',
          // Focus states
          'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
          // Border states
          error
            ? 'border-accent-red focus:border-accent-red'
            : 'border-surface-300 focus:border-primary-500',
          // Disabled state
          disabled && 'opacity-50 cursor-not-allowed',
          // Transition
          'transition-all duration-200',
          className
        )}
        {...props}
      />
      
      {/* Character Count */}
      {maxLength && (
        <p className="mt-1 text-sm text-text-muted text-right">
          {value?.length || 0}/{maxLength}
        </p>
      )}
      
      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-accent-red">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;

