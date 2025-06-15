import { ConversationWithOtherParticipant } from '@/api/chat';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListItemProps {
  conversation: ConversationWithOtherParticipant;
  isSelected: boolean;
  onClick: () => void;
}

const ConversationListItem = ({ conversation, isSelected, onClick }: ConversationListItemProps) => {
  const otherParticipant = conversation.other_participant;
  const lastMessage = conversation.messages?.[0];

  if (!otherParticipant) {
    return null; 
  }

  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
        { "bg-muted": isSelected }
      )}
      onClick={onClick}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={otherParticipant.avatar_url ?? ''} alt={otherParticipant.username ?? ''}/>
        <AvatarFallback className="text-xl">
          {otherParticipant.username?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <p className="font-semibold truncate">{otherParticipant.username}</p>
        <p className="text-sm text-muted-foreground truncate">
          {lastMessage?.content ? lastMessage.content : "Start a conversation!"}
        </p>
      </div>
      <div className="text-xs text-muted-foreground self-start mt-1">
        {lastMessage?.created_at
          ? formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })
          : formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
      </div>
    </div>
  );
};

export default ConversationListItem;
