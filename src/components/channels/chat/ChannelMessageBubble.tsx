
import { ChannelMessageWithSender } from '@/api/channelChat';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { Download, FileText, Play, Pause } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '../../ui/skeleton';
import { Button } from '../../ui/button';

interface MessageBubbleProps {
  message: ChannelMessageWithSender;
}

const AttachmentDisplay = ({ message }: { message: ChannelMessageWithSender }) => {
    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (message.attachment_url) {
            const { data } = supabase.storage.from('channel_attachments').getPublicUrl(message.attachment_url);
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

const ChannelMessageBubble = ({ message }: MessageBubbleProps) => {
    const { user } = useAuth();
    const isSender = message.user_id === user?.id;
    const senderProfile = message.sender;
    const isImageAttachment = message.attachment_type?.startsWith('image/');

    return (
        <div className={cn("flex items-start gap-3", { "justify-end": isSender })}>
            {!isSender && (
                <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={senderProfile?.avatar_url ?? ''} alt={senderProfile?.username ?? ''} />
                    <AvatarFallback>{senderProfile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
            )}
            <div className="flex flex-col gap-1" style={{ alignItems: isSender ? 'flex-end' : 'flex-start' }}>
                 {!isSender && (
                     <p className="text-sm font-semibold">{senderProfile?.username || 'User'}</p>
                 )}
                 <div className="group relative max-w-xs md:max-w-md lg:max-w-lg">
                    <div 
                        className={cn(
                            "rounded-2xl break-words shadow-sm",
                            isSender 
                                ? "bg-primary text-primary-foreground rounded-br-none" 
                                : "bg-muted rounded-bl-none",
                            { 'p-1': isImageAttachment && !message.content },
                            { 'px-4 py-2': !isImageAttachment || message.content }
                        )}
                    >
                        {message.attachment_url && (
                            <div className={cn({ "pb-2": message.content })}>
                                <AttachmentDisplay message={message} />
                            </div>
                        )}
                        {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                    </div>
                </div>

                <div className={cn("text-xs text-muted-foreground px-1")}>
                    <span>{format(new Date(message.created_at), 'p')}</span>
                </div>
            </div>
             {isSender && (
                <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={senderProfile?.avatar_url ?? ''} alt={senderProfile?.username ?? ''} />
                    <AvatarFallback>{senderProfile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
            )}
        </div>
    )
}

export default ChannelMessageBubble;
