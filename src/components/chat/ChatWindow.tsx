
import { ConversationWithOtherParticipant, Reaction } from '@/api/chat';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMessages, sendMessage, MessageWithSender, markMessagesAsRead, uploadAttachment } from '@/api/chat';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useChannelPresence } from '@/hooks/useChannelPresence';
import { z } from 'zod';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageForm, { messageFormSchema } from './MessageForm';
import { useToast } from '../ui/use-toast';

interface ChatWindowProps {
  conversation: ConversationWithOtherParticipant | null;
  onBack: () => void;
}

const ChatWindow = ({ conversation, onBack }: ChatWindowProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const presenceState = useChannelPresence('live-users');
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<z.infer<typeof messageFormSchema>>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: { content: "" },
  });

  const { data: initialMessages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', conversation?.id],
    queryFn: () => getMessages(conversation!.id),
    enabled: !!conversation,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markMessagesAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
    onError: (error) => {
      console.error("Failed to mark messages as read", error);
    }
  });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    if (conversation?.id) {
      markAsReadMutation.mutate(conversation.id);
    }
  }, [conversation?.id, markAsReadMutation]);

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
            
            // Mark as read if it's an incoming message
            if (newMessage.sender_id !== user?.id) {
                markAsReadMutation.mutate(conversation.id);
            } else {
                // If we sent the message, just invalidate conversations to update list
                queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
            }
          }
        }
      )
      .subscribe();

    const reactionChannel = supabase.channel('public:reactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' },
        (payload) => {
          setMessages(currentMessages => {
            const messageInState = currentMessages.some(m => m.conversation_id === conversation.id);
            if (!messageInState) return currentMessages;

            if (payload.eventType === 'INSERT') {
              const newReaction = payload.new as Reaction;
              return currentMessages.map(m => {
                if (m.id === newReaction.message_id) {
                  // Avoid duplicates
                  if (m.reactions.some(r => r.id === newReaction.id)) return m;
                  return { ...m, reactions: [...m.reactions, newReaction] };
                }
                return m;
              });
            }

            if (payload.eventType === 'DELETE') {
              const oldReaction = payload.old as Partial<Reaction>;
              return currentMessages.map(m => {
                if (m.id === oldReaction.message_id) {
                  return { ...m, reactions: m.reactions.filter(r => r.id !== oldReaction.id) };
                }
                return m;
              });
            }
            return currentMessages;
          });
        }
      ).subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(reactionChannel);
    };
  }, [conversation, queryClient, user?.id, markAsReadMutation]);
  
  // Typing indicator logic
  useEffect(() => {
    if (!conversation?.id || !user?.id) {
      setIsOtherUserTyping(false);
      return;
    }

    const typingChannel = supabase.channel(`typing:${conversation.id}`);

    const onTypingEvent = (payload: { event: string, type: string, payload: { userId: string, isTyping: boolean }}) => {
      if (payload.payload.userId !== user.id) {
        setIsOtherUserTyping(payload.payload.isTyping);
      }
    };
    
    typingChannel
      .on('broadcast', { event: 'typing' }, onTypingEvent)
      .subscribe();
      
    return () => {
      supabase.removeChannel(typingChannel);
      setIsOtherUserTyping(false);
    };
  }, [conversation?.id, user?.id]);

  const sendTypingEvent = (isTyping: boolean) => {
    if (!conversation || !user) return;
    const typingChannel = supabase.channel(`typing:${conversation.id}`);
    typingChannel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user.id, isTyping },
    });
  };

  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    sendTypingEvent(true);

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingEvent(false);
    }, 2000); // 2-second timeout
  };
  
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
      setAttachment(null);
    },
    onError: (error) => {
      console.error("Failed to send message", error);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: error.message,
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  const handleFileSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select a file smaller than 5MB.",
      });
      return;
    }
    setAttachment(file);
  };
  
  const uploadAndSendMessage = async (values: z.infer<typeof messageFormSchema>) => {
    if (!conversation) return;

    let attachmentPath: string | undefined;
    let attachmentType: string | undefined;

    if (attachment) {
      setIsUploading(true);
      try {
        const path = await uploadAttachment(conversation.id, attachment);
        attachmentPath = path;
        attachmentType = attachment.type;
      } catch (error) {
        console.error("Failed to upload attachment", error);
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "Could not upload your attachment. Please try again.",
        });
        setIsUploading(false);
        return;
      }
    }
    
    sendMessageMutation.mutate({ 
        conversationId: conversation.id, 
        content: values.content, 
        attachmentPath,
        attachmentType
    });
  };

  const onSubmit = (values: z.infer<typeof messageFormSchema>) => {
    if ((!values.content.trim()) && !attachment) return;
    uploadAndSendMessage(values);
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
      <ChatHeader
        otherParticipant={otherParticipant}
        isOnline={isOnline}
        onBack={onBack}
        isTyping={isOtherUserTyping}
      />
      <main className="flex-1 p-4 overflow-y-auto bg-muted/20">
        <MessageList 
          isLoading={isLoadingMessages} 
          messages={messages}
          messagesEndRef={messagesEndRef}
        />
      </main>
      <MessageForm 
        form={form}
        onSubmit={onSubmit}
        isSending={sendMessageMutation.isPending || isUploading}
        attachment={attachment}
        onFileSelect={handleFileSelect}
        onRemoveAttachment={() => setAttachment(null)}
        onTyping={handleTyping}
      />
    </div>
  );
};

export default ChatWindow;
