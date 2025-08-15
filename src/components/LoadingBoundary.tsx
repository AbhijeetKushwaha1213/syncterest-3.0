
import React from 'react';

interface LoadingBoundaryProps {
  isLoading: boolean;
  error?: any;
  loadingComponent: React.ReactNode;
  errorComponent: React.ReactNode;
  children: React.ReactNode;
}

const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({
  isLoading,
  error,
  loadingComponent,
  errorComponent,
  children,
}) => {
  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  if (error) {
    return <>{errorComponent}</>;
  }

  return <>{children}</>;
};

export default LoadingBoundary;
