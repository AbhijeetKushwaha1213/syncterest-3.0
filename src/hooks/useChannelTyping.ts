
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useSupabaseChannel } from './useSupabaseChannel';

type TypingUser = {
    userId: string;
    username: string;
}

export const useChannelTyping = (channelId: string | undefined) => {
    const { user, profile } = useAuth();
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const typingTimeoutRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const channelName = channelId ? `typing:channel:${channelId}` : '';
    const channel = useSupabaseChannel(channelName);
    const lastSentTime = useRef(0);
    
    useEffect(() => {
        if (!channel || !user) {
            setTypingUsers([]);
            return;
        }

        const handleTypingEvent = (payload: { event: string; type: string; payload: { user: TypingUser } }) => {
            const { user: typingUser } = payload.payload;

            if (typingUser.userId === user.id) return;
            
            setTypingUsers(currentUsers => {
                if (currentUsers.some(u => u.userId === typingUser.userId)) {
                    return currentUsers;
                }
                return [...currentUsers, typingUser];
            });

            if (typingTimeoutRef.current.has(typingUser.userId)) {
                clearTimeout(typingTimeoutRef.current.get(typingUser.userId)!);
            }

            const timeout = setTimeout(() => {
                setTypingUsers(currentUsers => currentUsers.filter(u => u.userId !== typingUser.userId));
                typingTimeoutRef.current.delete(typingUser.userId);
            }, 3000); // Remove user after 3 seconds of inactivity

            typingTimeoutRef.current.set(typingUser.userId, timeout);
        };

        channel.on('broadcast', { event: 'typing' }, handleTypingEvent).subscribe();

        return () => {
            typingTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
            typingTimeoutRef.current.clear();
        };

    }, [channel, user?.id]);

    const sendTypingEvent = () => {
        if (!channel || !user || !profile) return;
        
        const now = Date.now();
        if (now - lastSentTime.current < 2000) { // Throttle to every 2 seconds
            return;
        }
        lastSentTime.current = now;

        channel.send({
            type: 'broadcast',
            event: 'typing',
            payload: { user: { userId: user.id, username: profile.username || 'Someone' } },
        });
    };

    return { typingUsers, sendTypingEvent };
};
