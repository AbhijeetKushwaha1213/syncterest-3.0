
import { ConversationWithOtherParticipant } from '@/api/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Phone, Send, Video } from 'lucide-react';

interface ChatWindowProps {
  conversation: ConversationWithOtherParticipant | null;
}

const ChatWindow = ({ conversation }: ChatWindowProps) => {
  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center bg-muted/20">
        <div className="max-w-md">
          <h2 className="text-2xl font-semibold">Welcome to Syncterest Chat</h2>
          <p className="text-muted-foreground mt-2">Select a conversation from the list on the left to start messaging. If you don't have any conversations, find a user and send them a message from their profile!</p>
        </div>
      </div>
    );
  }

  const otherParticipant = conversation.other_participant;

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center justify-between gap-4 p-3 border-b">
        <div className="flex items-center gap-3">
            <Avatar>
                <AvatarImage src={otherParticipant.avatar_url ?? ''} />
                <AvatarFallback>{otherParticipant.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <p className="font-semibold">{otherParticipant.username}</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Video className="h-5 w-5"/></Button>
            <Button variant="ghost" size="icon"><Phone className="h-5 w-5"/></Button>
        </div>
      </header>
      <main className="flex-1 p-4 overflow-y-auto bg-muted/20">
        {/* Messages will go here */}
        <div className="text-center text-muted-foreground">
          Messages will appear here soon.
        </div>
      </main>
      <footer className="p-3 border-t bg-background">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon"><Paperclip className="h-5 w-5"/></Button>
          <Input placeholder="Type a message..." className="flex-1" />
          <Button><Send className="h-5 w-5"/></Button>
        </div>
      </footer>
    </div>
  );
};

export default ChatWindow;
