import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: FieldError;
  register: UseFormRegister<Record<string, unknown>>;
  className?: string;
  required?: boolean;
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  register,
  className = '',
  required = false,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        {...register(name)}
        placeholder={placeholder}
        className={`input ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
      )}
    </div>
  );
}
