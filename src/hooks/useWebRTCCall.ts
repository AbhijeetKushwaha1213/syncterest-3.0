import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type CallState = 'idle' | 'dialing' | 'receiving-offer' | 'connected' | 'ended';

interface WebRTCCallHook {
  callState: CallState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  startCall: (isAudioOnly: boolean) => Promise<void>;
  answerCall: () => Promise<void>;
  endCall: () => void;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  incomingCall: { from: string; isAudioOnly: boolean } | null;
}

const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export const useWebRTCCall = (conversationId: string, otherUserId: string): WebRTCCallHook => {
  const [callState, setCallState] = useState<CallState>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{ from: string; isAudioOnly: boolean } | null>(null);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const channel = useRef<any>(null);
  const currentCallType = useRef<boolean>(false); // false = video, true = audio only
  
  const { toast } = useToast();

  const initializePeerConnection = useCallback(() => {
    if (peerConnection.current) return;

    peerConnection.current = new RTCPeerConnection(STUN_SERVERS);
    
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate && channel.current) {
        channel.current.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: { candidate: event.candidate }
        });
      }
    };

    peerConnection.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    peerConnection.current.onconnectionstatechange = () => {
      if (peerConnection.current?.connectionState === 'connected') {
        setCallState('connected');
      } else if (peerConnection.current?.connectionState === 'failed' || 
                 peerConnection.current?.connectionState === 'disconnected') {
        endCall();
      }
    };
  }, []);

  const setupChannel = useCallback(() => {
    if (channel.current) return;
    
    channel.current = supabase.channel(`chat:${conversationId}`, {
      config: { presence: { key: 'call-presence' } }
    });

    channel.current.on('broadcast', { event: 'call-offer' }, async ({ payload }: any) => {
      if (payload.to === otherUserId) return; // Not for us
      
      setIncomingCall({ from: payload.from, isAudioOnly: payload.isAudioOnly });
    });

    channel.current.on('broadcast', { event: 'call-answer' }, async ({ payload }: any) => {
      if (payload.to !== otherUserId) return;
      
      try {
        await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(payload.answer));
      } catch (error) {
        console.error('Error setting remote description:', error);
        toast({ title: "Call failed", description: "Connection error occurred", variant: "destructive" });
        endCall();
      }
    });

    channel.current.on('broadcast', { event: 'ice-candidate' }, async ({ payload }: any) => {
      try {
        await peerConnection.current?.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } catch (error) {
        console.error('Error adding ice candidate:', error);
      }
    });

    channel.current.on('broadcast', { event: 'hang-up' }, () => {
      endCall();
    });

    channel.current.subscribe();
  }, [conversationId, otherUserId, toast]);

  const startCall = useCallback(async (isAudioOnly: boolean) => {
    try {
      setCallState('dialing');
      currentCallType.current = isAudioOnly;
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: !isAudioOnly,
        audio: true
      });
      
      setLocalStream(stream);
      initializePeerConnection();
      
      if (peerConnection.current) {
        stream.getTracks().forEach(track => {
          peerConnection.current?.addTrack(track, stream);
        });

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        if (channel.current) {
          channel.current.send({
            type: 'broadcast',
            event: 'call-offer',
            payload: { 
              offer,
              from: 'currentUser',
              to: otherUserId,
              isAudioOnly 
            }
          });
        }
      }
    } catch (error) {
      console.error('Error starting call:', error);
      toast({ 
        title: "Call failed", 
        description: "Unable to access camera/microphone or start call",
        variant: "destructive" 
      });
      setCallState('idle');
    }
  }, [initializePeerConnection, otherUserId, toast]);

  const answerCall = useCallback(async () => {
    if (!incomingCall) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: !incomingCall.isAudioOnly,
        audio: true
      });
      
      setLocalStream(stream);
      setCallState('connected');
      currentCallType.current = incomingCall.isAudioOnly;
      
      initializePeerConnection();
      
      if (peerConnection.current) {
        stream.getTracks().forEach(track => {
          peerConnection.current?.addTrack(track, stream);
        });

        // This would need the actual offer from the incoming call
        // For now, we'll create a basic answer flow
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);

        if (channel.current) {
          channel.current.send({
            type: 'broadcast',
            event: 'call-answer',
            payload: { 
              answer,
              from: 'currentUser',
              to: otherUserId
            }
          });
        }
      }
      
      setIncomingCall(null);
    } catch (error) {
      console.error('Error answering call:', error);
      toast({ 
        title: "Call failed", 
        description: "Unable to access camera/microphone",
        variant: "destructive" 
      });
      setIncomingCall(null);
    }
  }, [incomingCall, initializePeerConnection, otherUserId, toast]);

  const endCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (remoteStream) {
      setRemoteStream(null);
    }
    
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    
    if (channel.current && callState !== 'idle') {
      channel.current.send({
        type: 'broadcast',
        event: 'hang-up',
        payload: { from: 'currentUser' }
      });
    }
    
    setCallState('idle');
    setIncomingCall(null);
    setIsAudioMuted(false);
    setIsVideoMuted(false);
  }, [localStream, remoteStream, callState]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  }, [localStream]);

  useEffect(() => {
    setupChannel();
    
    return () => {
      endCall();
      if (channel.current) {
        supabase.removeChannel(channel.current);
      }
    };
  }, [setupChannel, endCall]);

  return {
    callState,
    localStream,
    remoteStream,
    startCall,
    answerCall,
    endCall,
    isAudioMuted,
    isVideoMuted,
    toggleAudio,
    toggleVideo,
    incomingCall
  };
};