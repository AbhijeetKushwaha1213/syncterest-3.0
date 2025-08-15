
import React from 'react';
import { Card } from '@/components/ui/card';

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    created_at: string;
  };
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  return (
    <Card className="p-4">
      <div className="space-y-2">
        <h4 className="font-semibold">{notification.title}</h4>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(notification.created_at).toLocaleDateString()}
        </p>
      </div>
    </Card>
  );
};

export default NotificationItem;
