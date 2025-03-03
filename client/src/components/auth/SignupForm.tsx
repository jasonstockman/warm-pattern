import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts';
import FormInput from '../ui/FormInput';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Card from '../ui/Card';

interface SignupFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

const SignupForm: React.FC = () => {
  const { signup, error: authError, isLoading } = useAuth();
  
  const [formValues, setFormValues] = useState<SignupFormValues>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [formErrors, setFormErrors] = useState<Partial<SignupFormValues>>({});
  const [success, setSuccess] = useState<boolean>(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
    
    // Clear the error when user changes the value
    if (formErrors[name as keyof SignupFormValues]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Partial<SignupFormValues> = {};
    
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
    
    if (!formValues.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formValues.password !== formValues.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (validateForm()) {
      const result = await signup(formValues.email, formValues.password);
      if (result) {
        setSuccess(true);
      }
    }
  };
  
  if (success) {
    return (
      <Card className="signup-card">
        <div className="text-center">
          <h2 className="card-title">Registration Successful!</h2>
          <p>Your account has been created successfully.</p>
          <Link to="/dashboard">
            <Button variant="primary">Go to Dashboard</Button>
          </Link>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="signup-card">
      <h2 className="card-title text-center">Create an Account</h2>
      
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
          placeholder="Create a password"
          value={formValues.password}
          onChange={handleChange}
          error={formErrors.password}
          required
        />
        
        <FormInput
          type="password"
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={formValues.confirmPassword}
          onChange={handleChange}
          error={formErrors.confirmPassword}
          required
        />
        
        <Button 
          type="submit" 
          fullWidth 
          isLoading={isLoading}
          loadingText="Creating account..."
          className="mt-4"
        >
          Sign Up
        </Button>
      </form>
      
      <div className="text-center mt-3">
        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </Card>
  );
};

export default SignupForm; 