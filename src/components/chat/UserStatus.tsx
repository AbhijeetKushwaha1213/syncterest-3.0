
import { ConversationWithOtherParticipant } from '@/api/chat';
import { formatDistanceToNowStrict } from 'date-fns';

interface UserStatusProps {
    participant: ConversationWithOtherParticipant['other_participant'];
    isOnline: boolean;
}

const UserStatus = ({ participant, isOnline }: UserStatusProps) => {
  if (isOnline) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        <span className="text-sm text-muted-foreground">Online</span>
      </div>
    );
  }

  if (participant.last_active_at) {
    return (
      <p className="text-sm text-muted-foreground">
        Active {formatDistanceToNowStrict(new Date(participant.last_active_at), { addSuffix: true })}
      </p>
    );
  }

  return <p className="text-sm text-muted-foreground">Offline</p>;
};

export default UserStatus;
