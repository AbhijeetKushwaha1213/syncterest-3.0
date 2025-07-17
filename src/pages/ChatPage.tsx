
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
    queryFn: () => {
      if (!user?.id) {
        console.log("No user ID available for conversations");
        return [];
      }
      return getConversations(user.id);
    },
    enabled: !!user?.id,
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (conversations && Array.isArray(conversations) && conversationId) {
      const found = conversations.find(c => c.id === conversationId);
      if (found) {
        setSelectedConversation(found);
      } else {
        console.warn(`Conversation ${conversationId} not found`);
        // Don't redirect, just clear selection
        setSelectedConversation(null);
      }
    } else if (!conversationId) {
      setSelectedConversation(null);
    }
  }, [conversationId, conversations]);

  const handleSelectConversation = (conversation: ConversationWithOtherParticipant) => {
    setSelectedConversation(conversation);
    navigate(`/chat/${conversation.id}`);
  };

  const handleBack = () => {
    navigate('/chat');
    setSelectedConversation(null);
  };

  // Show loading state
  if (authLoading || conversationsLoading) {
    return (
      <div className="flex h-full">
        <div className="w-full md:w-1/3 lg:w-1/4 border-r p-4 space-y-2">
          <Skeleton className="h-10 w-1/2 mb-4" />
          <Skeleton className="h-8 w-full mb-4" />
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <div className="hidden md:flex w-2/3 lg:w-3/4 p-4 items-center justify-center">
          <div className="text-center">
            <Skeleton className="h-6 w-48 mb-2 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    console.error("Chat page error:", error);
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Unable to load conversations</h2>
          <p className="text-muted-foreground">Please try refreshing the page.</p>
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
          conversations={conversations || []}
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
