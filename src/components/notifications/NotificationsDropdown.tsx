
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationItem from "./NotificationItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

const NotificationsDropdown = () => {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    isMarkingAllRead 
  } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96 p-0" align="end">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Notifications</h3>
          {notifications && notifications.length > 0 && unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => markAllAsRead()} disabled={isMarkingAllRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          <div className="p-2 space-y-1">
            {isLoading && (
                [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
            )}
            {!isLoading && notifications && notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))
            ) : (
                !isLoading && <p className="text-center text-muted-foreground p-8">No notifications yet.</p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsDropdown;
