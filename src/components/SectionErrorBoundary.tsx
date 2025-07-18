
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ErrorBoundary from './ErrorBoundary';

interface SectionErrorBoundaryProps {
  children: React.ReactNode;
  sectionName: string;
  onReset?: () => void;
  resetKeys?: Array<string | number>;
}

const SectionErrorFallback = ({ sectionName, onReset }: { sectionName: string; onReset?: () => void }) => (
  <Card className="w-full">
    <CardContent className="flex flex-col items-center justify-center py-8">
      <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
      <h3 className="font-semibold mb-2">Failed to load {sectionName}</h3>
      <p className="text-muted-foreground text-sm text-center mb-4">
        There was an error loading this section. This might be temporary.
      </p>
      <Button onClick={onReset} variant="outline" size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry
      </Button>
    </CardContent>
  </Card>
);

const SectionErrorBoundary: React.FC<SectionErrorBoundaryProps> = ({ 
  children, 
  sectionName, 
  onReset, 
  resetKeys 
}) => {
  const handleReset = () => {
    onReset?.();
  };

  return (
    <ErrorBoundary
      fallback={<SectionErrorFallback sectionName={sectionName} onReset={handleReset} />}
      onReset={handleReset}
      resetKeys={resetKeys}
    >
      {children}
    </ErrorBoundary>
  );
};

export default SectionErrorBoundary;
