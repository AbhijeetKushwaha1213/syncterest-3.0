
import { MessageWithSender, addReaction, removeReaction } from '@/api/chat';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { Check, CheckCheck, Download, FileText, SmilePlus, Play, Pause } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '../ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import EmojiPicker from './EmojiPicker';
import ReactionsDisplay from './ReactionsDisplay';
import { useMutation } from '@tanstack/react-query';
import SharedContentPreview from './SharedContentPreview';

interface MessageBubbleProps {
  message: MessageWithSender;
}

const AttachmentDisplay = ({ message }: { message: MessageWithSender }) => {
    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (message.attachment_url) {
            const { data } = supabase.storage.from('chat_attachments').getPublicUrl(message.attachment_url);
            setUrl(data.publicUrl);
        }
        setLoading(false);
    }, [message.attachment_url]);

    const handleAudioPlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
    };

    if (loading || !url) {
        return <Skeleton className="w-48 h-24 rounded-lg" />;
    }

    const isImage = message.attachment_type?.startsWith('image/');
    const isAudio = message.attachment_type?.startsWith('audio/');
    const fileName = message.attachment_url?.split('/').pop() || 'attachment';

    if (isImage) {
        return (
            <a href={url} target="_blank" rel="noopener noreferrer">
                <img src={url} alt="attachment" className="rounded-lg max-w-full h-auto object-cover cursor-pointer" />
            </a>
        );
    }

    if (isAudio) {
        return (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 max-w-xs">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleAudioPlay}
                    className="shrink-0"
                >
                    {isPlaying ? (
                        <Pause className="h-5 w-5" />
                    ) : (
                        <Play className="h-5 w-5" />
                    )}
                </Button>
                <div className="flex-1">
                    <p className="text-sm font-medium">Audio Message</p>
                    <audio
                        ref={audioRef}
                        src={url}
                        onEnded={handleAudioEnded}
                        className="hidden"
                        preload="metadata"
                    />
                </div>
            </div>
        );
    }

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
            <FileText className="h-8 w-8 text-muted-foreground shrink-0" />
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{fileName}</p>
                <p className="text-xs text-muted-foreground">File Attachment</p>
            </div>
            <Download className="h-5 w-5 shrink-0" />
        </a>
    );
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
    const { user } = useAuth();
    const isSender = message.sender_id === user?.id;
    const senderProfile = message.sender as any;
    const isImageAttachment = message.attachment_type?.startsWith('image/');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Check if message contains shared content
    const sharedContentMatch = message.content?.match(/🔗 SHARED_CONTENT:(\w+):([a-zA-Z0-9-]+)/);
    const isSharedContent = !!sharedContentMatch;
    const sharedContentType = sharedContentMatch?.[1] as 'post' | 'event' | 'reel';
    const sharedContentId = sharedContentMatch?.[2];
    
    // Extract the actual message text (without the shared content marker)
    const messageText = message.content?.replace(/🔗 SHARED_CONTENT:\w+:[a-zA-Z0-9-]+/, '').trim();

    const addReactionMutation = useMutation({
        mutationFn: ({ messageId, emoji }: { messageId: string, emoji: string }) => addReaction(messageId, emoji),
    });

    const removeReactionMutation = useMutation({
        mutationFn: (reactionId: string) => removeReaction(reactionId),
    });
    
    const handleEmojiSelect = (emoji: string) => {
        if (!user) return;

        const existingReaction = message.reactions?.find(
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
        <div className={cn("flex items-end gap-2", { "justify-end": isSender })}>
            {!isSender && (
                <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={senderProfile?.avatar_url ?? ''} alt={senderProfile?.username ?? ''} />
                    <AvatarFallback>{senderProfile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
            )}
            <div className="flex flex-col gap-1" style={{ alignItems: isSender ? 'flex-end' : 'flex-start' }}>
                <div className="group relative max-w-xs md:max-w-md lg:max-w-lg">
                    <div 
                        className={cn(
                            "rounded-2xl break-words shadow-sm",
                            isSender 
                                ? "bg-primary text-primary-foreground rounded-br-none" 
                                : "bg-muted rounded-bl-none",
                            { 'p-1': isImageAttachment && !messageText && !isSharedContent },
                            { 'px-4 py-2': !isImageAttachment || messageText || isSharedContent }
                        )}
                    >
                        {message.attachment_url && (
                            <div className={cn({ "pb-2": messageText || isSharedContent })}>
                                <AttachmentDisplay message={message} />
                            </div>
                        )}
                        
                        {messageText && (
                            <p className="whitespace-pre-wrap mb-2">{messageText}</p>
                        )}
                        
                        {isSharedContent && sharedContentType && sharedContentId && (
                            <div className="mt-2">
                                <SharedContentPreview 
                                    contentType={sharedContentType} 
                                    contentId={sharedContentId}
                                />
                            </div>
                        )}
                    </div>
                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "absolute h-8 w-8 rounded-full bg-background transition-opacity opacity-0 group-hover:opacity-100",
                                    isSender ? "-left-10 top-1/2 -translate-y-1/2" : "-right-10 top-1/2 -translate-y-1/2"
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
                
                {message.reactions && message.reactions.length > 0 && (
                     <ReactionsDisplay 
                        reactions={message.reactions}
                        onEmojiSelect={handleEmojiSelect}
                    />
                )}

                <div className={cn(
                    "flex items-center gap-1.5 text-xs text-muted-foreground px-1",
                )}>
                    <span>{format(new Date(message.created_at), 'p')}</span>
                    {isSender && (
                        message.read_at ? (
                            <CheckCheck className="h-4 w-4 text-blue-500" />
                        ) : (
                            <Check className="h-4 w-4" />
                        )
                    )}
                </div>
            </div>
        </div>
    )
}

export default MessageBubble;
