import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  containerClassName = 'form-group',
  labelClassName = 'form-label',
  inputClassName = 'form-input',
  errorClassName = 'form-error',
  ...props
}) => {
  const inputId = props.id || `input-${props.name}`;
  
  return (
    <div className={containerClassName}>
      <label htmlFor={inputId} className={labelClassName}>
        {label}
      </label>
      <input id={inputId} className={`${inputClassName} ${error ? 'is-invalid' : ''}`} {...props} />
      {error && <div className={errorClassName}>{error}</div>}
    </div>
  );
};

export default FormInput; 