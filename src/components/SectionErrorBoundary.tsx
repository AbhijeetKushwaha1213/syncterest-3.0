
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface SectionErrorBoundaryProps {
  children: React.ReactNode;
  sectionName: string;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class SectionErrorBoundary extends React.Component<SectionErrorBoundaryProps, SectionErrorBoundaryState> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SectionErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.sectionName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center p-4 border border-destructive/20 rounded-lg bg-destructive/5">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-destructive mb-2" />
            <h3 className="font-semibold text-destructive">Something went wrong</h3>
            <p className="text-sm text-muted-foreground mt-1">
              There was an error loading {this.props.sectionName}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;
