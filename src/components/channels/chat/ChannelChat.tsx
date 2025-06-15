
import { useChannelMessages } from '@/hooks/useChannelMessages';
import ChannelMessageList from './ChannelMessageList';
import ChannelMessageForm from './ChannelMessageForm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Channel } from '@/types';

interface ChannelChatProps {
    channel: Channel;
}

const ChannelChat = ({ channel }: ChannelChatProps) => {
    const { data: messages, isLoading } = useChannelMessages(channel.id);

    return (
        <div className="flex flex-col h-full bg-muted/20">
            <ScrollArea className="flex-1">
                <ChannelMessageList isLoading={isLoading} messages={messages} />
            </ScrollArea>
            <ChannelMessageForm channelId={channel.id} channelName={channel.name} />
        </div>
    );
};
export default ChannelChat;
