import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react';

interface CallViewProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
  isAudioOnly: boolean;
}

const CallView = ({
  localStream,
  remoteStream,
  isAudioMuted,
  isVideoMuted,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
  isAudioOnly
}: CallViewProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Remote video - main view */}
      <div className="flex-1 relative">
        {!isAudioOnly && remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-white text-center">
              <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <p className="text-lg">Audio Call</p>
            </div>
          </div>
        )}

        {/* Local video - picture in picture */}
        {!isAudioOnly && localStream && (
          <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          </div>
        )}
      </div>

      {/* Call controls */}
      <div className="bg-black/80 p-6 flex justify-center gap-4">
        <Button
          variant={isAudioMuted ? "destructive" : "secondary"}
          size="lg"
          onClick={onToggleAudio}
          className="rounded-full w-14 h-14"
        >
          {isAudioMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>

        {!isAudioOnly && (
          <Button
            variant={isVideoMuted ? "destructive" : "secondary"}
            size="lg"
            onClick={onToggleVideo}
            className="rounded-full w-14 h-14"
          >
            {isVideoMuted ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
          </Button>
        )}

        <Button
          variant="destructive"
          size="lg"
          onClick={onEndCall}
          className="rounded-full w-14 h-14"
        >
          <Phone className="h-6 w-6 transform rotate-[135deg]" />
        </Button>
      </div>
    </div>
  );
};

export default CallView;