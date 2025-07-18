
import { useParams } from 'react-router-dom';
import { useChannel } from '@/hooks/useChannel';
import { useChannelRole } from '@/hooks/useChannelRole';
import { useJoinChannel } from '@/hooks/useJoinChannel';
import { useState } from 'react';
import ChannelChat from '@/components/channels/chat/ChannelChat';
import ChannelVoice from '@/components/channels/voice/ChannelVoice';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Mic, Settings, Users, AlertTriangle } from 'lucide-react';
import { EditChannelDialog } from '@/components/channels/EditChannelDialog';
import { Skeleton } from '@/components/ui/skeleton';

const ChannelDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: channel, isLoading: isLoadingChannel, error: channelError } = useChannel(id);
  const { data: role, isLoading: isLoadingRole } = useChannelRole(id);
  const { mutate: joinChannel, isPending: isJoining } = useJoinChannel();
  const [activeTab, setActiveTab] = useState('chat');

  if (!id) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Invalid Channel</h2>
          <p className="text-muted-foreground">No channel ID provided.</p>
        </div>
      </div>
    );
  }

  if (isLoadingChannel || isLoadingRole) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b p-4">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  if (channelError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Unable to load channel</h2>
          <p className="text-muted-foreground">
            There was an error loading the channel. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Channel not found</h2>
          <p className="text-muted-foreground">
            This channel doesn't exist or may have been removed.
          </p>
        </div>
      </div>
    );
  }

  const handleJoinChannel = async () => {
    if (id) {
      joinChannel(id);
    }
  };

  // If user is not a member of the channel
  if (!role) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">{channel.name}</h2>
          <p className="text-muted-foreground mb-6">{channel.description}</p>
          <Button onClick={handleJoinChannel} disabled={isJoining}>
            {isJoining ? 'Joining...' : 'Join Channel'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{channel.name}</h1>
            <p className="text-muted-foreground">{channel.description}</p>
          </div>
          {(role === 'admin' || role === 'moderator') && (
            <EditChannelDialog channel={channel}>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </EditChannelDialog>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
        <div className="border-b px-4">
          <TabsList className="h-12">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Voice
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="chat" className="h-full m-0 p-0">
            <ChannelChat channel={channel} />
          </TabsContent>
          <TabsContent value="voice" className="h-full m-0 p-0">
            <ChannelVoice channel={channel} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ChannelDetailPage;
