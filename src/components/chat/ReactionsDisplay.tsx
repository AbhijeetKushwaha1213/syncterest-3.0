
import React from 'react';
import { Reaction } from '@/api/chat';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface ReactionsDisplayProps {
  reactions: Reaction[];
  onEmojiSelect: (emoji: string) => void;
}

const ReactionsDisplay = ({ reactions, onEmojiSelect }: ReactionsDisplayProps) => {
  const { user } = useAuth();

  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction.user_id);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="flex gap-1 flex-wrap">
      {Object.entries(groupedReactions).map(([emoji, userIds]) => {
        const userReacted = userIds.includes(user?.id || '');
        return (
          <button
            key={emoji}
            onClick={() => onEmojiSelect(emoji)}
            className={cn(
              "px-2 py-0.5 border rounded-full text-xs flex items-center gap-1 transition-colors",
              userReacted ? "bg-primary/20 border-primary" : "bg-muted/50 border-transparent hover:bg-muted"
            )}
            aria-label={`Reaction: ${emoji}, count: ${userIds.length}. Click to react.`}
          >
            <span>{emoji}</span>
            <span>{userIds.length}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ReactionsDisplay;
