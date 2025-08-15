
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ReactionsDisplayProps {
  reactions?: Record<string, number>;
}

const ReactionsDisplay: React.FC<ReactionsDisplayProps> = ({ reactions = {} }) => {
  if (Object.keys(reactions).length === 0) {
    return null;
  }

  return (
    <div className="flex gap-1 mt-1">
      {Object.entries(reactions).map(([emoji, count]) => (
        <Badge key={emoji} variant="secondary" className="text-xs">
          {emoji} {count}
        </Badge>
      ))}
    </div>
  );
};

export default ReactionsDisplay;
