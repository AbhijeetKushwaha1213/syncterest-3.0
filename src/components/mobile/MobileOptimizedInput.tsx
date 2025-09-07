import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MobileOptimizedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  touchOptimized?: boolean;
}

const MobileOptimizedInput = React.forwardRef<HTMLInputElement, MobileOptimizedInputProps>(
  ({ label, error, fullWidth = true, touchOptimized = true, className, ...props }, ref) => {
    return (
      <div className={cn("space-y-2", fullWidth && "w-full")}>
        {label && (
          <Label 
            htmlFor={props.id} 
            className="text-sm font-medium text-foreground"
          >
            {label}
          </Label>
        )}
        
        <Input
          ref={ref}
          className={cn(
            // Base mobile optimizations
            "w-full transition-all duration-200",
            // Touch-friendly sizing
            touchOptimized && "h-12 px-4 text-base",
            // Better focus states for mobile
            "focus:ring-2 focus:ring-primary/20 focus:border-primary",
            // Error states
            error && "border-destructive focus:border-destructive focus:ring-destructive/20",
            className
          )}
          {...props}
        />
        
        {error && (
          <p className="text-sm text-destructive font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

MobileOptimizedInput.displayName = "MobileOptimizedInput";

export { MobileOptimizedInput };