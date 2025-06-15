import { ConversationWithOtherParticipant } from '@/api/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ArrowLeft, Paperclip, Phone, Send, Video } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMessages, sendMessage, MessageWithSender } from '@/api/chat';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useChannelPresence } from '@/hooks/useChannelPresence';
import { formatDistanceToNowStrict } from 'date-fns';

interface ChatWindowProps {
  conversation: ConversationWithOtherParticipant | null;
  onBack: () => void;
}

const messageFormSchema = z.object({
  content: z.string().min(1, "Message cannot be empty.").max(1000, "Message is too long."),
});

const UserStatus = ({ participant, isOnline }: { participant: ConversationWithOtherParticipant['other_participant'], isOnline: boolean }) => {
  if (isOnline) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        <span className="text-sm text-muted-foreground">Online</span>
      </div>
    );
  }

  if (participant.last_active_at) {
    return (
      <p className="text-sm text-muted-foreground">
        Active {formatDistanceToNowStrict(new Date(participant.last_active_at), { addSuffix: true })}
      </p>
    );
  }

  return <p className="text-sm text-muted-foreground">Offline</p>;
};

const ChatWindow = ({ conversation, onBack }: ChatWindowProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const presenceState = useChannelPresence('live-users');

  const form = useForm<z.infer<typeof messageFormSchema>>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: { content: "" },
  });

  const { data: initialMessages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', conversation?.id],
    queryFn: () => getMessages(conversation!.id),
    enabled: !!conversation,
  });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    if (!conversation) return;

    const channel = supabase
      .channel(`chat:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async (payload) => {
          const { data: newMessage, error } = await supabase
            .from('messages')
            .select('*, sender:profiles (id, username, avatar_url)')
            .eq('id', payload.new.id)
            .single();
          
          if (error) {
            console.error("Error fetching new message:", error);
            return;
          }

          if (newMessage) {
            setMessages(currentMessages => {
              if (currentMessages.some(m => m.id === newMessage.id)) {
                return currentMessages;
              }
              return [...currentMessages, newMessage as MessageWithSender];
            });
            queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation, queryClient, user?.id]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
  };

  useEffect(() => {
    // A short delay to allow images in bubbles to load
    setTimeout(scrollToBottom, 100);
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      form.reset();
    },
    onError: (error) => {
      console.error("Failed to send message", error);
      // Here you could add a toast notification to inform the user
    },
  });

  const onSubmit = (values: z.infer<typeof messageFormSchema>) => {
    if (!conversation || !values.content.trim()) return;
    sendMessageMutation.mutate({ conversationId: conversation.id, content: values.content });
  };
  
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
  const isOnline = !!(otherParticipant?.id && presenceState && presenceState[otherParticipant.id]);

  return (
    <div className="flex flex-col h-full bg-background w-full">
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
              <UserStatus participant={otherParticipant} isOnline={isOnline} />
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Video className="h-5 w-5"/></Button>
            <Button variant="ghost" size="icon"><Phone className="h-5 w-5"/></Button>
        </div>
      </header>
      <main className="flex-1 p-4 overflow-y-auto bg-muted/20">
        {isLoadingMessages ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-16 w-1/2 ml-auto" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-12 w-3/4" />
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground">
            <p>No messages yet. Say hello!</p>
          </div>
        )}
      </main>
      <footer className="p-3 border-t bg-background shrink-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="icon" disabled={sendMessageMutation.isPending}><Paperclip className="h-5 w-5"/></Button>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Type a message..." {...field} autoComplete="off" disabled={sendMessageMutation.isPending} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={sendMessageMutation.isPending}>
              <Send className="h-5 w-5"/>
            </Button>
          </form>
        </Form>
      </footer>
    </div>
  );
};

export default ChatWindow;
