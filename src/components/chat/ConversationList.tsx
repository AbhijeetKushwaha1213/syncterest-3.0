
import { useQuery } from '@tanstack/react-query';
import { getConversations, ConversationWithOtherParticipant } from '@/api/chat';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import ConversationListItem from './ConversationListItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ConversationListProps {
  onSelectConversation: (conversation: ConversationWithOtherParticipant) => void;
}

const ConversationList = ({ onSelectConversation }: ConversationListProps) => {
  const { user } = useAuth();
  const { data: conversations, isLoading, error } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => getConversations(user!.id),
    enabled: !!user,
  });

  if (isLoading) {
    return <div className="p-4 space-y-2">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  }

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
