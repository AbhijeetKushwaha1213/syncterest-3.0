
import { ChannelMessageWithSender } from '@/api/channelChat';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';

interface ChannelMessageBubbleProps {
  message: ChannelMessageWithSender;
}

const ChannelMessageBubble = ({ message }: ChannelMessageBubbleProps) => {
    const { user } = useAuth();
    const isSender = message.user_id === user?.id;
    const senderProfile = message.sender;

    return (
        <div className={cn("flex items-start gap-3", { "justify-end": isSender })}>
            {!isSender && (
                <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={senderProfile?.avatar_url ?? ''} alt={senderProfile?.username ?? ''} />
                    <AvatarFallback>{senderProfile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
            )}
            <div className={cn("flex flex-col gap-1", { "items-end": isSender })}>
                 <div className="flex items-center gap-2">
                    {!isSender && (
                        <span className="text-sm font-semibold">{senderProfile?.username ?? 'User'}</span>
                    )}
                    <span className="text-xs text-muted-foreground">{format(new Date(message.created_at), 'p')}</span>
                </div>
                <div 
                    className={cn(
                        "rounded-2xl px-4 py-2 break-words shadow-sm max-w-xs md:max-w-md lg:max-w-lg",
                        isSender 
                            ? "bg-primary text-primary-foreground rounded-br-none" 
                            : "bg-muted rounded-bl-none"
                    )}
                >
                    {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                </div>
            </div>
        </div>
    )
}

export default ChannelMessageBubble;
