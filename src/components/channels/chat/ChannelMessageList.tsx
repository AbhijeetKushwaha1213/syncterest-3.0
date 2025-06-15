
import React, { useEffect, useRef, useState } from 'react';
import { ChannelMessageWithSender, addChannelReaction, removeChannelReaction } from '@/api/channelChat';
import ChannelMessageBubble from './ChannelMessageBubble';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { SmilePlus } from 'lucide-react';
import EmojiPicker from '@/components/chat/EmojiPicker';
import ReactionsDisplay from '@/components/chat/ReactionsDisplay';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface ChannelMessageListProps {
  isLoading: boolean;
  messages: ChannelMessageWithSender[] | undefined;
}

const MessageWithReactions = ({ message }: { message: ChannelMessageWithSender }) => {
    const { user } = useAuth();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const isSender = message.user_id === user?.id;

    const addReactionMutation = useMutation({
        mutationFn: ({ messageId, emoji }: { messageId: number, emoji: string }) => addChannelReaction({ messageId, emoji }),
        onError: (error: Error) => {
            toast({ variant: 'destructive', title: 'Failed to add reaction', description: error.message });
        }
    });

    const removeReactionMutation = useMutation({
        mutationFn: (reactionId: string) => removeChannelReaction(reactionId),
        onError: (error: Error) => {
            toast({ variant: 'destructive', title: 'Failed to remove reaction', description: error.message });
        }
    });
    
    const handleEmojiSelect = (emoji: string) => {
        if (!user) return;

        const existingReaction = message.channel_message_reactions?.find(
            (r) => r.user_id === user.id && r.emoji === emoji
        );

        if (existingReaction) {
            removeReactionMutation.mutate(existingReaction.id);
        } else {
            addReactionMutation.mutate({ messageId: message.id, emoji });
        }
        setShowEmojiPicker(false);
    };

    return (
        <div className="group">
            <div className="relative">
                <ChannelMessageBubble message={message} />
                 <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "absolute h-8 w-8 rounded-full bg-background/50 transition-opacity opacity-0 group-hover:opacity-100 top-1/2 -translate-y-1/2",
                                isSender ? "left-1" : "right-1"
                            )}
                        >
                            <SmilePlus className="h-5 w-5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-1" side="top" align={isSender ? 'end' : 'start'}>
                        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                    </PopoverContent>
                </Popover>
            </div>
            {message.channel_message_reactions && message.channel_message_reactions.length > 0 && (
                <div className={cn("pt-1", isSender ? "flex justify-end pr-12" : "pl-12")}>
                    <ReactionsDisplay 
                        reactions={message.channel_message_reactions as any}
                        onEmojiSelect={handleEmojiSelect}
                    />
                </div>
            )}
        </div>
    )
}

const ChannelMessageList = ({ isLoading, messages }: ChannelMessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
  };

  useEffect(() => {
    setTimeout(scrollToBottom, 50);
  }, [messages]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-16 w-1/2 ml-auto" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-12 w-3/4" />
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center text-muted-foreground">
        <p>No messages yet. Be the first to say something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {messages.map((message) => (
        <MessageWithReactions key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChannelMessageList;
