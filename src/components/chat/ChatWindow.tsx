
import { ConversationWithOtherParticipant, Reaction } from '@/api/chat';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useChannelPresence } from '@/hooks/useChannelPresence';
import { z } from 'zod';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageForm, { messageFormSchema } from './MessageForm';
import CallView from './CallView';
import IncomingCall from './IncomingCall';
import { useToast } from '@/hooks/use-toast';
import { useWebRTCCall } from '@/hooks/useWebRTCCall';

interface ChatWindowProps {
  conversation: ConversationWithOtherParticipant | null;
  onBack: () => void;
}

const ChatWindow = ({ conversation, onBack }: ChatWindowProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { 
    messages, 
    setMessages, 
    isLoading: isLoadingMessages, 
    sendMessage: sendMessageMutation, 
    isSending 
  } = useMessages(conversation?.id);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const presenceState = useChannelPresence('live-users');
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // WebRTC calling functionality
  const {
    callState,
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoMuted,
    toggleAudio,
    toggleVideo,
    endCall,
    answerCall,
    incomingCall
  } = useWebRTCCall(
    conversation?.id || '',
    conversation?.other_participant?.id || ''
  );

  const form = useForm<z.infer<typeof messageFormSchema>>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: { content: "" },
  });

  // Real-time subscriptions and message loading is now handled by useMessages hook
  
  // Typing indicator logic
  useEffect(() => {
    if (!conversation?.id || !user?.id) {
      setIsOtherUserTyping(false);
      return;
    }

    let typingChannel: any = null;
    
    try {
      typingChannel = supabase.channel(`typing-${conversation.id}-${Date.now()}`);

      const onTypingEvent = (payload: { event: string, type: string, payload: { userId: string, isTyping: boolean }}) => {
        if (payload.payload.userId !== user.id) {
          setIsOtherUserTyping(payload.payload.isTyping);
        }
      };
      
      typingChannel
        .on('broadcast', { event: 'typing' }, onTypingEvent)
        .subscribe();
    } catch (error) {
      console.error("Error setting up typing channel:", error);
    }
      
    return () => {
      try {
        if (typingChannel) supabase.removeChannel(typingChannel);
      } catch (error) {
        console.warn("Error cleaning up typing channel:", error);
      }
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

  // Message sending is now handled by useMessages hook

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
    
    sendMessageMutation({ 
        conversationId: conversation.id, 
        content: values.content, 
        attachmentPath,
        attachmentType
    });
  };

  const onSubmit = (values: z.infer<typeof messageFormSchema>) => {
    if ((!values.content.trim()) && !attachment) return;
    
    // Optimistic update - show message immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: MessageWithSender = {
      id: tempId,
      conversation_id: conversation!.id,
      sender_id: user!.id,
      content: values.content,
      created_at: new Date().toISOString(),
      read_at: null,
      attachment_url: attachment ? URL.createObjectURL(attachment) : null,
      attachment_type: attachment?.type || null,
      sender: {
        id: user!.id,
        username: profile?.username || '',
        avatar_url: profile?.avatar_url || null,
      },
      reactions: [],
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    form.reset();
    
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

  // Show call view if in a call
  if (callState === 'connected' || callState === 'dialing') {
    return (
      <CallView
        localStream={localStream}
        remoteStream={remoteStream}
        isAudioMuted={isAudioMuted}
        isVideoMuted={isVideoMuted}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onEndCall={endCall}
        isAudioOnly={!localStream?.getVideoTracks().length}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col h-full bg-background w-full">
        <ChatHeader
          otherParticipant={otherParticipant}
          isOnline={isOnline}
          onBack={onBack}
          isTyping={isOtherUserTyping}
          conversationId={conversation.id}
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
          isSending={isSending || isUploading}
          attachment={attachment}
          onFileSelect={handleFileSelect}
          onRemoveAttachment={() => setAttachment(null)}
          onTyping={handleTyping}
        />
      </div>

      {/* Incoming call overlay */}
      {incomingCall && (
        <IncomingCall
          callerName={otherParticipant.username || 'Unknown'}
          callerAvatar={otherParticipant.avatar_url || undefined}
          isAudioOnly={incomingCall.isAudioOnly}
          onAccept={answerCall}
          onDecline={endCall}
        />
      )}
    </>
  );
};

export default ChatWindow;
