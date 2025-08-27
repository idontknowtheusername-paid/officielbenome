import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, TestTube } from 'lucide-react';
import { initializePushNotifications, sendTestNotification, disablePushNotifications } from '@/services/pushNotifications.service';

export const PushNotificationTest = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInitialize = async () => {
    setIsLoading(true);
    try {
      await initializePushNotifications();
      setIsInitialized(true);
      console.log('✅ Push notifications initialized');
    } catch (error) {
      console.error('❌ Error initializing push notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setIsLoading(true);
    try {
      await sendTestNotification();
      console.log('✅ Test notification sent');
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    setIsLoading(true);
    try {
      await disablePushNotifications();
      setIsInitialized(false);
      console.log('✅ Push notifications disabled');
    } catch (error) {
      console.error('❌ Error disabling push notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Test Notifications Push
        </CardTitle>
        <CardDescription>
          Testez les notifications push sur votre device mobile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button
            onClick={handleInitialize}
            disabled={isLoading || isInitialized}
            className="w-full"
            variant={isInitialized ? "outline" : "default"}
          >
            <Bell className="mr-2 h-4 w-4" />
            {isInitialized ? 'Notifications Activées' : 'Activer Notifications'}
          </Button>
          
          {isInitialized && (
            <Button
              onClick={handleTestNotification}
              disabled={isLoading}
              className="w-full"
              variant="secondary"
            >
              <TestTube className="mr-2 h-4 w-4" />
              Envoyer Notification Test
            </Button>
          )}
          
          {isInitialized && (
            <Button
              onClick={handleDisable}
              disabled={isLoading}
              className="w-full"
              variant="destructive"
            >
              <BellOff className="mr-2 h-4 w-4" />
              Désactiver Notifications
            </Button>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>💡 <strong>Instructions :</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Cliquez sur "Activer Notifications" pour demander les permissions</li>
            <li>Acceptez les permissions dans la popup du système</li>
            <li>Testez avec "Envoyer Notification Test"</li>
            <li>Vérifiez les logs dans la console pour le debug</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
