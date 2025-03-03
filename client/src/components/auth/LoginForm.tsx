import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts';
import FormInput from '../ui/FormInput';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Card from '../ui/Card';

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const { login, error: authError, isLoading } = useAuth();
  
  const [formValues, setFormValues] = useState<LoginFormValues>({
    email: '',
    password: '',
  });
  
  const [formErrors, setFormErrors] = useState<Partial<LoginFormValues>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
    
    // Clear the error when user changes the value
    if (formErrors[name as keyof LoginFormValues]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Partial<LoginFormValues> = {};
    
    if (!formValues.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      errors.email = 'Email address is invalid';
    }
    
    if (!formValues.password) {
      errors.password = 'Password is required';
    } else if (formValues.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (validateForm()) {
      await login(formValues.email, formValues.password);
    }
  };
  
  return (
    <Card className="login-card">
      <h2 className="card-title text-center">Log In</h2>
      
      {authError && (
        <Alert
          variant="danger"
          message={authError}
          className="mb-4"
        />
      )}
      
      <form onSubmit={handleSubmit}>
        <FormInput
          type="email"
          name="email"
          label="Email"
          placeholder="Enter your email"
          value={formValues.email}
          onChange={handleChange}
          error={formErrors.email}
          required
        />
        
        <FormInput
          type="password"
          name="password"
          label="Password"
          placeholder="Enter your password"
          value={formValues.password}
          onChange={handleChange}
          error={formErrors.password}
          required
        />
        
        <Button 
          type="submit" 
          fullWidth 
          isLoading={isLoading}
          loadingText="Logging in..."
          className="mt-4"
        >
          Log In
        </Button>
      </form>
      
      <div className="text-center mt-3">
        <p>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </Card>
  );
};

export default LoginForm; 