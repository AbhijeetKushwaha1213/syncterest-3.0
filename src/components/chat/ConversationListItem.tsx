
import { ConversationWithOtherParticipant } from '@/api/chat';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface ConversationListItemProps {
  conversation: ConversationWithOtherParticipant;
  isSelected: boolean;
  onClick: () => void;
}

const ConversationListItem = ({ conversation, isSelected, onClick }: ConversationListItemProps) => {
  const otherParticipant = conversation.other_participant;
  const lastMessage = conversation.last_message;

  if (!otherParticipant) {
    return null; 
  }

  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
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
        <p className={cn(
          "text-sm text-muted-foreground truncate",
          { "font-bold text-foreground": conversation.unread_count > 0 }
        )}>
          {lastMessage?.content ? lastMessage.content : "Start a conversation!"}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5 self-start shrink-0">
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {lastMessage?.created_at
            ? formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })
            : formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
        </div>
        {conversation.unread_count > 0 && (
          <Badge className="h-5 w-5 flex items-center justify-center p-0 text-xs">{conversation.unread_count}</Badge>
        )}
      </div>
    </div>
  );
};

export default ConversationListItem;
