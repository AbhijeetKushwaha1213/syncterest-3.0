import { Channel } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useChannelTyping } from '@/hooks/useChannelTyping';
import ChannelMessageList from './ChannelMessageList';
import ChannelMessageForm, { channelMessageFormSchema } from './ChannelMessageForm';
import TypingIndicator from './TypingIndicator';
import { useMarkChannelAsRead } from '@/hooks/useMarkChannelAsRead';
import { useChannelMessages } from '@/hooks/useChannelMessages';

interface ChannelChatProps {
    channel: Channel;
}

const ChannelChat = ({ channel }: ChannelChatProps) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    const { data: messages, isLoading: isLoadingMessages } = useChannelMessages(channel.id);

    const { sendTypingEvent, typingUsers } = useChannelTyping(channel.id);
    const { mutate: markAsRead } = useMarkChannelAsRead();

    useEffect(() => {
        if(channel.id && user) {
            markAsRead(channel.id);
        }
    }, [channel.id, user, markAsRead]);

    const form = useForm<z.infer<typeof channelMessageFormSchema>>({
        resolver: zodResolver(channelMessageFormSchema),
        defaultValues: {
            content: "",
        },
    });
    
    const sendMessageMutation = useMutation({
        mutationFn: async ({ content, attachment: fileAttachment }: { content: string, attachment: File | null }) => {
            let attachmentPath: string | undefined;
            let attachmentType: string | undefined;

            if (fileAttachment) {
                setIsUploading(true);
                const fileExt = fileAttachment.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const path = `channels/${channel.id}/${fileName}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('channel_attachments')
                    .upload(path, fileAttachment);
                
                if (uploadError) {
                    setIsUploading(false);
                    throw new Error(`Failed to upload attachment: ${uploadError.message}`);
                }
                attachmentPath = path;
                attachmentType = fileAttachment.type;
            }

            if (!content.trim() && !attachmentPath) return;

            const { error: insertError } = await supabase.from('channel_messages').insert({
                channel_id: channel.id,
                user_id: user!.id,
                content: content || null,
                attachment_url: attachmentPath,
                attachment_type: attachmentType,
            });

            if (insertError) {
                // TODO: In a real app, you might want to delete the uploaded file if the message fails to send.
                throw new Error(`Failed to send message: ${insertError.message}`);
            }
        },
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

    const onSubmit = (values: z.infer<typeof channelMessageFormSchema>) => {
        sendMessageMutation.mutate({ content: values.content, attachment });
    };

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

    return (
        <div className="flex flex-col h-full bg-muted/20">
            <main className="flex-1 p-4 overflow-y-auto">
                <ChannelMessageList 
                    isLoading={isLoadingMessages} 
                    messages={messages}
                />
            </main>
            <TypingIndicator typingUsers={typingUsers} />
            <ChannelMessageForm 
                form={form}
                onSubmit={onSubmit}
                isSending={sendMessageMutation.isPending || isUploading}
                onTyping={sendTypingEvent}
                attachment={attachment}
                onFileSelect={handleFileSelect}
                onRemoveAttachment={() => setAttachment(null)}
            />
        </div>
    );
};

export default ChannelChat;
