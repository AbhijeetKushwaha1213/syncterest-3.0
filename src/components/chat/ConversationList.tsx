
import { ConversationWithOtherParticipant } from '@/api/chat';
import ConversationListItem from './ConversationListItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ConversationListProps {
  conversations: ConversationWithOtherParticipant[] | undefined;
  error: Error | null;
  selectedConversationId: string | undefined;
  onSelectConversation: (conversation: ConversationWithOtherParticipant) => void;
}

const ConversationList = ({ conversations, error, selectedConversationId, onSelectConversation }: ConversationListProps) => {
  if (error) {
    return <p className="p-4 text-destructive">Error: {error.message}</p>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold">Chats</h2>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search chats..." className="pl-10" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations && conversations.length > 0 ? (
            conversations.map(conversation => (
              <ConversationListItem 
                key={conversation.id} 
                conversation={conversation} 
                isSelected={conversation.id === selectedConversationId}
                onClick={() => onSelectConversation(conversation)} 
              />
            ))
          ) : (
            <div className="text-center text-muted-foreground p-8">
              <p>No conversations yet.</p>
              <p className="text-sm">Start a chat from someone's profile.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationList;
