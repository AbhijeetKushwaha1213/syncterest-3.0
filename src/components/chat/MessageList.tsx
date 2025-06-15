
import React from 'react';
import { MessageWithSender } from '@/api/chat';
import MessageBubble from './MessageBubble';
import { Skeleton } from '@/components/ui/skeleton';

interface MessageListProps {
  isLoading: boolean;
  messages: MessageWithSender[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const MessageList = ({ isLoading, messages, messagesEndRef }: MessageListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-16 w-1/2 ml-auto" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-12 w-3/4" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center text-muted-foreground">
        <p>No messages yet. Say hello!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
