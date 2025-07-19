
import { ConversationWithOtherParticipant } from '@/api/chat';
import ConversationListItem from './ConversationListItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MessageCircle, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ConversationListProps {
  conversations: ConversationWithOtherParticipant[] | undefined;
  error: Error | null;
  selectedConversationId: string | undefined;
  onSelectConversation: (conversation: ConversationWithOtherParticipant) => void;
}

const ConversationList = ({ conversations, error, selectedConversationId, onSelectConversation }: ConversationListProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-2xl font-bold">Chats</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm px-4">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h3 className="font-semibold mb-2">Unable to Load Conversations</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We're having trouble loading your conversations. Please try again.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const filteredConversations = conversations?.filter(conversation =>
    conversation.other_participant.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold">Chats</h2>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search chats..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredConversations && filteredConversations.length > 0 ? (
            filteredConversations.map(conversation => (
              <ConversationListItem 
                key={conversation.id} 
                conversation={conversation} 
                isSelected={conversation.id === selectedConversationId}
                onClick={() => onSelectConversation(conversation)} 
              />
            ))
          ) : (
            <div className="text-center text-muted-foreground p-8">
              {searchTerm ? (
                <>
                  <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No matching conversations found.</p>
                </>
              ) : (
                <>
                  <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No conversations yet.</p>
                  <p className="text-sm mt-1">Start a chat from someone's profile.</p>
                </>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationList;
