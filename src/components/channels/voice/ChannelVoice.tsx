
import { Channel } from '@/types';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

interface ChannelVoiceProps {
    channel: Channel;
}

const ChannelVoice = ({ channel }: ChannelVoiceProps) => {
    // Dummy state for now
    const isMuted = false;

    return (
        <div className="flex flex-col h-full bg-muted/20 p-6 items-center justify-center text-center">
            <h2 className="text-2xl font-bold">Voice Channel: {channel.name}</h2>
            <p className="text-muted-foreground mt-2">
                You are connected. Ready to talk.
            </p>
            <div className="mt-8 flex items-center gap-4">
                <Button variant={isMuted ? "destructive" : "secondary"} size="icon" className="rounded-full h-16 w-16">
                    {isMuted ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                    <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
                </Button>
                <Button variant="destructive" size="icon" className="rounded-full h-16 w-16">
                    <MicOff className="h-8 w-8" />
                    <span className="sr-only">Disconnect</span>
                </Button>
            </div>
            <div className='mt-8'>
                <p className='text-muted-foreground text-sm'>Voice and video features are under construction.</p>
            </div>
        </div>
    );
};

export default ChannelVoice;
