
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import type { Database } from '@/integrations/supabase/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { UserPlus } from 'lucide-react';
import { useFollow } from '@/hooks/useFollow';
import React from 'react';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserCardProps {
  profile: Profile;
}

const UserCard = ({ profile }: UserCardProps) => {
  const { followMutation } = useFollow();

  const handleConnectClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    followMutation.mutate(profile.id);
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
      <Button
        size="icon"
        variant="secondary"
        className="absolute top-3 right-3 z-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleConnectClick}
        disabled={followMutation.isPending}
      >
        <UserPlus className="h-5 w-5" />
      </Button>
    </Card>
  );
};

export default UserCard;
