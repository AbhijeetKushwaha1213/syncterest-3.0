import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, CircleDot, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
}

interface NotificationsDropdownProps {
  notifications: any[];
}

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const { title, message, created_at, type } = notification;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'message':
        return <Bell className="mr-2 h-4 w-4 text-blue-500" />;
      case 'event':
        return <Bell className="mr-2 h-4 w-4 text-green-500" />;
      default:
        return <Bell className="mr-2 h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-muted">
      {getIconForType(type)}
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{message}</p>
        <time className="text-xs text-gray-500">{created_at}</time>
      </div>
    </div>
  );
};

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ notifications }) => {
  const hasUnreadNotifications = notifications.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {hasUnreadNotifications && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 rounded-full px-2 py-0.5 text-xs font-bold"
            >
              {notifications.length}
            </Badge>
          )}
          <span className="sr-only">View notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 sm:w-96">
        <div className="p-2">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <DropdownMenuSeparator />
          <ScrollArea className="max-h-64">
          <div className="space-y-2">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={{
                  id: notification.id,
                  type: notification.type || 'general',
                  title: notification.title || 'Notification',
                  message: notification.message || notification.content || '',
                  created_at: notification.created_at,
                }}
              />
            ))}
          </div>
          </ScrollArea>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
