
import { useChannelMessages } from '@/hooks/useChannelMessages';
import ChannelMessageList from './ChannelMessageList';
import ChannelMessageForm from './ChannelMessageForm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Channel } from '@/types';
import { useChannelTyping } from '@/hooks/useChannelTyping';
import TypingIndicator from './TypingIndicator';
import { useEffect } from 'react';
import { useMarkChannelAsRead } from '@/hooks/useMarkChannelAsRead';

interface ChannelChatProps {
    channel: Channel;
}

const ChannelChat = ({ channel }: ChannelChatProps) => {
    const { data: messages, isLoading } = useChannelMessages(channel.id);
    const { typingUsers, sendTypingEvent } = useChannelTyping(channel.id);
    const { mutate: markAsRead } = useMarkChannelAsRead();

    useEffect(() => {
        if (channel.id) {
            markAsRead(channel.id);
        }
    }, [channel.id, markAsRead]);

    return (
        <div className="flex flex-col h-full bg-muted/20">
            <ScrollArea className="flex-1">
                <ChannelMessageList isLoading={isLoading} messages={messages} />
            </ScrollArea>
            <div className="h-6 px-4">
                <TypingIndicator typingUsers={typingUsers} />
            </div>
            <ChannelMessageForm
                channelId={channel.id}
                channelName={channel.name}
                onTyping={sendTypingEvent}
            />
        </div>
    );
};
export default ChannelChat;
