
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import { getConversations, ConversationWithOtherParticipant } from "@/api/chat";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const ChatPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithOtherParticipant | null>(null);

  const { data: conversations, isLoading: conversationsLoading, error } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => getConversations(user!.id),
    enabled: !!user,
  });

  useEffect(() => {
    if (conversations) {
      if (conversationId) {
        const found = conversations.find(c => c.id === conversationId);
        setSelectedConversation(found || null);
      } else {
        setSelectedConversation(null);
      }
    }
  }, [conversationId, conversations]);

  const handleSelectConversation = (conversation: ConversationWithOtherParticipant) => {
    setSelectedConversation(conversation);
    navigate(`/chat/${conversation.id}`);
  };

  const handleBack = () => {
    navigate('/chat');
  };

  if (authLoading || conversationsLoading) {
    return (
        <div className="flex h-full">
            <div className="w-1/3 border-r p-4 space-y-2">
                <Skeleton className="h-10 w-1/2 mb-4" />
                <Skeleton className="h-8 w-full mb-4" />
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
            <div className="w-2/3 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                    </div>
                </div>
            </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background">
      <div className={cn(
          "w-full md:w-1/3 lg:w-1/4 border-r bg-background overflow-y-auto",
          { "hidden md:flex flex-col": !!conversationId }
      )}>
        <ConversationList 
          conversations={conversations}
          error={error}
          selectedConversationId={selectedConversation?.id}
          onSelectConversation={handleSelectConversation}
        />
      </div>
      <div className={cn(
        "flex-1",
        { "hidden md:flex": !conversationId },
        { "flex": !!conversationId }
      )}>
        <ChatWindow 
            conversation={selectedConversation} 
            onBack={handleBack} 
        />
      </div>
    </div>
  );
};

export default ChatPage;
