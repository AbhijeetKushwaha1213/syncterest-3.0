
import { MessageWithSender } from '@/api/chat';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: MessageWithSender;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
    const { user } = useAuth();
    const isSender = message.sender_id === user?.id;
    // The getMessages query aliases profiles as sender
    const senderProfile = message.sender as any;

    return (
        <div className={cn("flex items-end gap-2", { "justify-end": isSender })}>
            {!isSender && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={senderProfile?.avatar_url ?? ''} alt={senderProfile?.username ?? ''} />
                    <AvatarFallback>{senderProfile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
            )}
            <div className="flex flex-col max-w-xs md:max-w-md lg:max-w-lg">
                <div 
                    className={cn(
                        "rounded-2xl px-4 py-2 break-words shadow-sm",
                        isSender 
                            ? "bg-primary text-primary-foreground rounded-br-none self-end" 
                            : "bg-muted rounded-bl-none self-start"
                    )}
                >
                    <p>{message.content}</p>
                </div>
                <span className={cn(
                    "text-xs text-muted-foreground mt-1 px-1",
                    isSender ? "self-end" : "self-start"
                )}>
                    {format(new Date(message.created_at), 'p')}
                </span>
            </div>
        </div>
    )
}

export default MessageBubble;
