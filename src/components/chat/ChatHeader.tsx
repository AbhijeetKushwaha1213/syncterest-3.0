
import { ConversationWithOtherParticipant } from '@/api/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Video } from 'lucide-react';
import UserStatus from './UserStatus';
import { useToast } from '@/hooks/use-toast';

interface ChatHeaderProps {
  otherParticipant: ConversationWithOtherParticipant['other_participant'];
  isOnline: boolean;
  onBack: () => void;
  isTyping: boolean;
}

const ChatHeader = ({ otherParticipant, isOnline, onBack, isTyping }: ChatHeaderProps) => {
  const { toast } = useToast();

  const handleFeatureNotAvailable = () => {
    toast({
      title: "Feature coming soon",
      description: "This feature is currently under development.",
    });
  };

  return (
    <header className="flex items-center justify-between gap-4 p-3 border-b shrink-0">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
          <ArrowLeft className="h-5 w-5"/>
        </Button>
        <Avatar>
            <AvatarImage src={otherParticipant.avatar_url ?? ''} />
            <AvatarFallback>{otherParticipant.username?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="font-semibold">{otherParticipant.username}</p>
          {isTyping ? (
            <p className="text-sm text-primary animate-pulse">typing...</p>
          ) : (
            <UserStatus participant={otherParticipant} isOnline={isOnline} />
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleFeatureNotAvailable}><Video className="h-5 w-5"/></Button>
        <Button variant="ghost" size="icon" onClick={handleFeatureNotAvailable}><Phone className="h-5 w-5"/></Button>
      </div>
    </header>
  );
};

export default ChatHeader;
