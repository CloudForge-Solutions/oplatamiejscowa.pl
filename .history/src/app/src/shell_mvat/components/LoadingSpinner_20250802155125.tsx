// src/components/LoadingSpinner.tsx - Simple loading component
import React from 'react';
import { Container, Spinner } from 'react-bootstrap';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | undefined;
  variant?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size,
  variant = 'primary'
}) => {
  return (
    <Container className="text-center p-4">
      <Spinner 
        animation="border" 
        role="status" 
        size={size}
        variant={variant}
      >
        <span className="visually-hidden">{message}</span>
      </Spinner>
      <div className="mt-2">{message}</div>
    </Container>
  );
};

export default LoadingSpinner;
