import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useState } from 'react';

const InstallPrompt = () => {
  const { isInstallable, isInstalled, canInstall, installApp, shareApp } = usePWA();
  const [isVisible, setIsVisible] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);

  if (isInstalled || !isInstallable || !isVisible) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    await installApp();
    setIsInstalling(false);
    setIsVisible(false);
  };

  const handleShare = async () => {
    await shareApp();
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 lg:hidden">
      <Card className="border shadow-lg animate-slide-up">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <img src="/icon-192.png" alt="Syncterest" className="w-8 h-8 rounded-md" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Install Syncterest</h3>
                <p className="text-xs text-muted-foreground">Get the full app experience</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            {canInstall && (
              <Button 
                onClick={handleInstall} 
                disabled={isInstalling}
                size="sm"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-1" />
                {isInstalling ? 'Installing...' : 'Install'}
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleShare}
              size="sm"
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstallPrompt;