
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mic, Square, MicOff } from 'lucide-react';
import { useAudioRecording } from '@/hooks/useAudioRecording';

interface AudioRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordingComplete: (audioBlob: Blob) => void;
}

const AudioRecorder = ({ isOpen, onClose, onRecordingComplete }: AudioRecorderProps) => {
  const { isRecording, recordingTime, startRecording, stopRecording, hasPermission } = useAudioRecording();

  const handleStartRecording = async () => {
    await startRecording();
  };

  const handleStopRecording = async () => {
    const audioBlob = await stopRecording();
    if (audioBlob) {
      onRecordingComplete(audioBlob);
      onClose();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Record Audio
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center space-y-4">
            {isRecording ? (
              <div className="relative">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <Mic className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <span className="text-sm font-mono bg-background px-2 py-1 rounded border">
                    {formatTime(recordingTime)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                {hasPermission ? (
                  <Mic className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <MicOff className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
            )}

            {!hasPermission && !isRecording && (
              <p className="text-sm text-muted-foreground text-center">
                Microphone access is required to record audio
              </p>
            )}
          </div>

          <div className="flex gap-2 justify-center">
            {!isRecording ? (
              <>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleStartRecording}>
                  <Mic className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              </>
            ) : (
              <Button onClick={handleStopRecording} variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AudioRecorder;
