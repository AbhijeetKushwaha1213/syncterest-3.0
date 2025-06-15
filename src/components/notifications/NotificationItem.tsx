
import { Notification } from '@/api/notifications';
import { useProfile } from '@/hooks/useProfile';
import { useGroup } from '@/hooks/useGroup';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, UserPlus, Users, Dot } from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItemContent = ({ notification }: { notification: Notification }) => {
  const { data: senderProfile } = useProfile(notification.data?.sender_id);
  const { data: followerProfile } = useProfile(notification.data?.follower_id);
  const { data: newMemberProfile } = useProfile(notification.data?.new_member_id);
  const { data: group } = useGroup(notification.data?.group_id);

  switch (notification.type) {
    case 'new_message':
      return (
        <p>
          <span className="font-semibold">{senderProfile?.username ?? 'Someone'}</span> sent you a new message.
        </p>
      );
    case 'new_follower':
      return (
        <p>
          <span className="font-semibold">{followerProfile?.username ?? 'Someone'}</span> started following you.
        </p>
      );
    case 'group_join':
      return (
        <p>
          <span className="font-semibold">{newMemberProfile?.username ?? 'Someone'}</span> joined your group <span className="font-semibold">{group?.name ?? '...'}</span>.
        </p>
      );
    default:
      return <p>You have a new notification.</p>;
  }
};

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
    const iconMap = {
        new_message: <MessageSquare className="h-5 w-5 text-primary" />,
        new_follower: <UserPlus className="h-5 w-5 text-green-500" />,
        group_join: <Users className="h-5 w-5 text-blue-500" />,
    };
    return iconMap[type] || null;
}

const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  const navigate = useNavigate();
  const { data: relatedProfile } = useProfile(notification.data?.sender_id || notification.data?.follower_id || notification.data?.new_member_id);

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    switch (notification.type) {
      case 'new_message':
        navigate(`/chat/${notification.data?.conversation_id}`);
        break;
      case 'new_follower':
        navigate(`/profile/${notification.data?.follower_id}`);
        break;
      case 'group_join':
        if (notification.data?.group_id) {
          navigate(`/groups/${notification.data.group_id}`);
        }
        break;
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors",
        { "bg-muted/50": !notification.is_read }
      )}
      onClick={handleClick}
    >
        <div className="flex-shrink-0 mt-1">
            <NotificationIcon type={notification.type} />
        </div>
      <div className="flex-1">
          <NotificationItemContent notification={notification} />
          <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
      </div>
      {!notification.is_read && (
        <div className="flex-shrink-0 self-center">
            <Dot className="h-6 w-6 text-primary animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default NotificationItem;
