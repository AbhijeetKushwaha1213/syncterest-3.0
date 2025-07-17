import { Button } from '@/components/ui/button';
import { Phone, PhoneOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface IncomingCallProps {
  callerName: string;
  callerAvatar?: string;
  isAudioOnly: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const IncomingCall = ({
  callerName,
  callerAvatar,
  isAudioOnly,
  onAccept,
  onDecline
}: IncomingCallProps) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg p-8 max-w-sm w-full text-center border shadow-lg">
        <div className="mb-6">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <AvatarImage src={callerAvatar} />
            <AvatarFallback className="text-2xl">
              {callerName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-semibold mb-2">{callerName}</h3>
          <p className="text-muted-foreground">
            Incoming {isAudioOnly ? 'audio' : 'video'} call
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            variant="destructive"
            size="lg"
            onClick={onDecline}
            className="rounded-full w-14 h-14"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
          
          <Button
            variant="default"
            size="lg"
            onClick={onAccept}
            className="rounded-full w-14 h-14 bg-green-600 hover:bg-green-700"
          >
            <Phone className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCall;