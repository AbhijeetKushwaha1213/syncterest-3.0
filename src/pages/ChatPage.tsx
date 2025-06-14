
import { useState } from "react";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import { ConversationWithOtherParticipant } from "@/api/chat";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithOtherParticipant | null>(null);
  const { profile, loading } = useAuth();

  if (loading) {
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

  // A basic responsive approach: on mobile, clicking a conversation would navigate
  // to a new view. For now, we'll just show the list on mobile and the full view on desktop.
  // The ChatWindow will be hidden on mobile screens.
  return (
    <div className="flex h-full">
      <div className="w-full md:w-1/3 lg:w-1/4 border-r bg-background overflow-y-auto">
        <ConversationList onSelectConversation={setSelectedConversation} />
      </div>
      <div className="hidden md:flex flex-1">
        <ChatWindow conversation={selectedConversation} />
      </div>
    </div>
  );
};

export default ChatPage;
