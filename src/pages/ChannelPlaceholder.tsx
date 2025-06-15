
import { Hash } from 'lucide-react';

const ChannelPlaceholder = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-background">
      <Hash className="h-16 w-16 text-muted-foreground/50" />
      <p className="mt-4 text-lg text-muted-foreground">Select a channel to start chatting</p>
    </div>
  );
};

export default ChannelPlaceholder;
