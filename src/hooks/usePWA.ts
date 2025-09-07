import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface PWAPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  prompt(): Promise<void>;
}

export const usePWA = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      setIsInstalled(
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      );
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
      toast({
        title: 'App Installed!',
        description: 'Syncterest has been added to your home screen.',
      });
    };

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: 'Back Online!',
        description: 'Your connection has been restored.',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'Offline Mode',
        description: 'Some features may be limited while offline.',
        variant: 'destructive',
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setInstallPrompt(null);
        setIsInstallable(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Install failed:', error);
      toast({
        title: 'Installation Failed',
        description: 'Unable to install the app. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const shareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Syncterest - Meet Create Connect',
          text: 'Connect with people who share your interests!',
          url: window.location.href,
        });
        return true;
      } catch (error) {
        console.error('Share failed:', error);
        return false;
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied!',
        description: 'Share link copied to clipboard.',
      });
      return true;
    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: 'Copy Failed',
        description: 'Unable to copy link to clipboard.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installApp,
    shareApp,
    canInstall: !!installPrompt,
    canShare: !!navigator.share || !!navigator.clipboard,
  };
};