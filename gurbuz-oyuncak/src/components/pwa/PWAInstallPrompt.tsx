import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone, Wifi, Star } from 'lucide-react';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useDeviceDetection } from '@/hooks/use-mobile-utils';

interface PWAInstallPromptProps {
  className?: string;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ className }) => {
  const [dismissed, setDismissed] = useState(false);
  const { showInstallPrompt, installApp } = usePushNotifications();
  const { isMobile } = useDeviceDetection();

  if (!showInstallPrompt || dismissed || !isMobile) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Optionally store dismissal in localStorage to prevent showing again for a while
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  return (
    <Card className={`fixed bottom-4 left-4 right-4 z-50 shadow-lg border-2 border-blue-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Uygulamayı Yükle</CardTitle>
              <p className="text-sm text-gray-600">Daha iyi deneyim için</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0"
          >
            <X size={16} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <Wifi className="h-6 w-6 text-blue-600 mb-1" />
              <span className="text-xs text-gray-600">Offline</span>
            </div>
            <div className="flex flex-col items-center">
              <Download className="h-6 w-6 text-blue-600 mb-1" />
              <span className="text-xs text-gray-600">Hızlı</span>
            </div>
            <div className="flex flex-col items-center">
              <Star className="h-6 w-6 text-blue-600 mb-1" />
              <span className="text-xs text-gray-600">Kaliteli</span>
            </div>
          </div>

          <p className="text-sm text-gray-700 text-center">
            Gürbüz Oyuncak uygulamasını cihazınıza yükleyerek daha hızlı erişim,
            push bildirimleri ve offline kullanım avantajlarından yararlanın.
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="flex-1"
            >
              Sonra
            </Button>
            <Button
              onClick={handleInstall}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Yükle
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAInstallPrompt;