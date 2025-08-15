
import React from 'react';

const EMOJIS = ['👍', '❤️', '😂', '😯', '😢', '🙏'];

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker = ({ onEmojiSelect }: EmojiPickerProps) => {
  return (
    <div className="flex gap-1">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onEmojiSelect(emoji)}
          className="p-1.5 text-xl rounded-md hover:bg-accent transition-colors"
          aria-label={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default EmojiPicker;
