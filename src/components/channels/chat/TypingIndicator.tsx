
import React from 'react';

type TypingUser = {
    userId: string;
    username: string;
}

interface TypingIndicatorProps {
    typingUsers: TypingUser[];
}

const TypingIndicator = ({ typingUsers }: TypingIndicatorProps) => {
    if (typingUsers.length === 0) {
        return null;
    }
    
    const getTypingMessage = () => {
        const names = typingUsers.map(u => u.username);
        if (names.length === 1) {
            return `${names[0]} is typing...`;
        }
        if (names.length === 2) {
            return `${names[0]} and ${names[1]} are typing...`;
        }
        if (names.length > 2) {
            return 'Several people are typing...';
        }
        return null;
    };

    return (
        <div className="text-sm text-muted-foreground h-full flex items-center">
            <p className="truncate">{getTypingMessage()}</p>
        </div>
    );
};

export default TypingIndicator;
