
import React, { useEffect, useRef } from 'react';
import { ChannelMessageWithSender } from '@/api/channelChat';
import ChannelMessageBubble from './ChannelMessageBubble';
import { Skeleton } from '@/components/ui/skeleton';

interface ChannelMessageListProps {
  isLoading: boolean;
  messages: ChannelMessageWithSender[] | undefined;
}

const ChannelMessageList = ({ isLoading, messages }: ChannelMessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
  };

  useEffect(() => {
    // A short delay to allow the list to render before scrolling
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
    <div className="space-y-6 p-4">
      {messages.map((message) => (
        <ChannelMessageBubble key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChannelMessageList;
