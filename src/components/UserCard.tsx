
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import type { Database } from '@/integrations/supabase/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { UserPlus, MessageCircle } from 'lucide-react';
import { useFollow } from '@/hooks/useFollow';
import { findOrCreateConversation } from '@/api/chat-messaging';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserCardProps {
  profile: Profile;
}

const UserCard = ({ profile }: UserCardProps) => {
  const { followMutation } = useFollow();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const handleConnectClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    followMutation.mutate(profile.id);
  };

  const handleMessageClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isCreatingConversation) return;
    
    try {
      setIsCreatingConversation(true);
      console.log('Creating conversation with user:', profile.id);
      
      const conversationId = await findOrCreateConversation(profile.id);
      
      if (conversationId) {
        console.log('Navigating to conversation:', conversationId);
        navigate(`/chat/${conversationId}`);
      } else {
        throw new Error('Failed to create conversation');
      }
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Message Error",
        description: error.message || "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingConversation(false);
    }
  };

  return (
    <Card className="overflow-hidden group text-center relative aspect-[3/4]">
      <Link to={`/profile/${profile.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View Profile</span>
      </Link>
      <CardContent className="p-0 h-full">
        <div className="relative h-full">
          <Avatar className="h-full w-full rounded-none">
            <AvatarImage
              src={profile.avatar_url || `https://avatar.vercel.sh/${profile.username}`}
              alt={profile.full_name || profile.username || 'user'}
              className="object-cover h-full w-full transition-transform duration-300 group-hover:scale-110"
            />
            <AvatarFallback className="rounded-none text-4xl">
              {(profile.full_name || profile.username || 'U').charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-20 text-left">
          <h3 className="font-bold text-lg truncate">{profile.full_name || profile.username}</h3>
          <p className="text-sm opacity-90 h-10 overflow-hidden">{profile.bio || ''}</p>
        </div>
      </CardContent>
      <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full"
          onClick={handleMessageClick}
          disabled={isCreatingConversation}
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full"
          onClick={handleConnectClick}
          disabled={followMutation.isPending}
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default UserCard;
