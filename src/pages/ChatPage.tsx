
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import { getConversations, ConversationWithOtherParticipant } from "@/api/chat";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";
import SectionErrorBoundary from "@/components/SectionErrorBoundary";
import LoadingBoundary from "@/components/LoadingBoundary";

const ChatPageSkeleton = () => (
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

  return (
    <LoadingBoundary
      isLoading={authLoading || conversationsLoading}
      error={error}
      loadingComponent={<ChatPageSkeleton />}
      errorComponent={
        <div className="flex h-full">
          <div className="w-full md:w-1/3 lg:w-1/4 border-r p-4">
            <h2 className="text-lg font-semibold mb-4">Messages</h2>
            <div className="text-center py-10">
              <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Unable to load conversations</p>
            </div>
          </div>
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Unable to load conversations</h3>
              <p className="text-muted-foreground">Please try refreshing the page.</p>
            </div>
          </div>
        </div>
      }
    >
      <div className="flex h-full bg-background">
        <div className={cn(
          "w-full md:w-1/3 lg:w-1/4 border-r bg-background overflow-y-auto",
          { "hidden md:flex flex-col": !!conversationId }
        )}>
          <SectionErrorBoundary sectionName="Conversation List">
            <ConversationList 
              conversations={conversations || []}
              error={error}
              selectedConversationId={selectedConversation?.id}
              onSelectConversation={handleSelectConversation}
            />
          </SectionErrorBoundary>
        </div>
        <div className={cn(
          "flex-1",
          { "hidden md:flex": !conversationId },
          { "flex": !!conversationId }
        )}>
          <SectionErrorBoundary sectionName="Chat Window">
            <ChatWindow 
              conversation={selectedConversation} 
              onBack={handleBack} 
            />
          </SectionErrorBoundary>
        </div>
      </div>
    </LoadingBoundary>
  );
};

export default ChatPage;
