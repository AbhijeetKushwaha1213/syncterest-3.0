import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileSettingsLayoutProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  children: React.ReactNode;
  rightAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
  };
}

const MobileSettingsLayout = ({ 
  title, 
  subtitle, 
  backHref = '/settings', 
  children, 
  rightAction 
}: MobileSettingsLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <Link 
            to={backHref}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="font-medium">Back</span>
          </Link>
          
          {rightAction && (
            <Button
              variant="ghost"
              size="sm"
              onClick={rightAction.onClick}
              disabled={rightAction.loading}
              className="font-medium"
            >
              {rightAction.loading ? 'Saving...' : rightAction.label}
            </Button>
          )}
        </div>
        
        <div className="mt-3">
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Desktop/Tablet Header - Only show on larger screens */}
      <div className="hidden lg:block px-6 py-6 border-b">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground mt-2">{subtitle}</p>
        )}
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6 space-y-6">
        {children}
      </div>
    </div>
  );
};

// Settings Menu Item Component
interface SettingsMenuItemProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  rightContent?: React.ReactNode;
  showChevron?: boolean;
  className?: string;
}

export const SettingsMenuItem = ({
  icon,
  title,
  description,
  href,
  onClick,
  rightContent,
  showChevron = true,
  className
}: SettingsMenuItemProps) => {
  const content = (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors",
      "active:scale-[0.98] transition-transform touch-target",
      className
    )}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {icon && (
          <div className="flex-shrink-0 text-muted-foreground">
            {icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        {rightContent}
        {showChevron && (
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  }

  return content;
};

export default MobileSettingsLayout;