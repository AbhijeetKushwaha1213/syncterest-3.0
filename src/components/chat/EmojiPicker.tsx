
import React from 'react';
import { Button } from '@/components/ui/button';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const emojis = ['😀', '😍', '🥳', '😎', '🤔', '👍', '❤️', '🎉'];

  return (
    <div className="flex gap-1 p-2">
      {emojis.map((emoji) => (
        <Button
          key={emoji}
          variant="ghost"
          size="sm"
          onClick={() => onEmojiSelect(emoji)}
          className="text-lg hover:bg-muted"
        >
          {emoji}
        </Button>
      ))}
    </div>
  );
};

export default EmojiPicker;
