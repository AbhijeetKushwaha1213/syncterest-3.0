
import { ConversationWithOtherParticipant } from '@/api/chat';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ConversationListItemProps {
  conversation: ConversationWithOtherParticipant;
  onClick: () => void;
}

const ConversationListItem = ({ conversation, onClick }: ConversationListItemProps) => {
  const otherParticipant = conversation.other_participant;

  if (!otherParticipant) {
    return null; 
  }

  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
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
        <p className="text-sm text-muted-foreground truncate">Start a conversation!</p>
      </div>
      <div className="text-xs text-muted-foreground">
        {new Date(conversation.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};

export default ConversationListItem;
