
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingBoundaryProps {
  isLoading: boolean;
  error?: Error | null;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}

const DefaultLoadingComponent = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-40 w-full" />
      ))}
    </div>
  </div>
);

const DefaultErrorComponent = ({ error }: { error: Error }) => (
  <div className="flex items-center justify-center py-10">
    <div className="text-center">
      <h3 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h3>
      <p className="text-muted-foreground mb-4">
        {error.message || 'An unexpected error occurred'}
      </p>
    </div>
  </div>
);

const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({
  isLoading,
  error,
  children,
  loadingComponent,
  errorComponent
}) => {
  if (isLoading) {
    return <>{loadingComponent || <DefaultLoadingComponent />}</>;
  }

  if (error) {
    return <>{errorComponent || <DefaultErrorComponent error={error} />}</>;
  }

  return <>{children}</>;
};

export default LoadingBoundary;
