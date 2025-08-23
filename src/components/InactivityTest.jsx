import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import usePreferences from '@/hooks/usePreferences';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const InactivityTest = () => {
  const { session, isRememberMe, logout } = useAuth();
  const { preferences } = usePreferences();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Simuler une activité
  const simulateActivity = () => {
    setLastActivity(Date.now());
    setIsActive(true);
  };

  // Calculer le temps restant
  useEffect(() => {
    if (!session || isRememberMe) return;

    const timeoutMinutes = preferences?.security_settings?.session_timeout ?? 30;
    const timeoutMs = timeoutMinutes * 60 * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivity;
      const remaining = Math.max(0, timeoutMs - elapsed);
      
      setTimeLeft(remaining);

      if (remaining <= 0 && isActive) {
        console.log('🕐 Test: Déconnexion automatique déclenchée');
        setIsActive(false);
        logout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, isRememberMe, preferences, lastActivity, isActive, logout]);

  if (!session) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test de Déconnexion Automatique</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucune session active</p>
        </CardContent>
      </Card>
    );
  }

  if (isRememberMe) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test de Déconnexion Automatique</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">Mode "Se souvenir" activé</Badge>
          <p className="text-muted-foreground mt-2">
            La déconnexion automatique est désactivée
          </p>
        </CardContent>
      </Card>
    );
  }

  const timeoutMinutes = preferences?.security_settings?.session_timeout ?? 30;
  const minutesLeft = Math.floor(timeLeft / 60000);
  const secondsLeft = Math.floor((timeLeft % 60000) / 1000);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Test de Déconnexion Automatique</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Timeout configuré:</span>
            <Badge variant="outline">{timeoutMinutes} minutes</Badge>
          </div>
          <div className="flex justify-between">
            <span>Temps restant:</span>
            <Badge variant={timeLeft < 60000 ? "destructive" : "default"}>
              {minutesLeft}:{secondsLeft.toString().padStart(2, '0')}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Dernière activité:</span>
            <span className="text-sm text-muted-foreground">
              {new Date(lastActivity).toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Button onClick={simulateActivity} className="w-full">
            Simuler une activité
          </Button>
          <Button 
            onClick={() => setLastActivity(0)} 
            variant="outline" 
            className="w-full"
          >
            Forcer l'expiration
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• Cliquez sur "Simuler une activité" pour reset le timer</p>
          <p>• Le timer se reset automatiquement sur les vrais événements</p>
          <p>• La déconnexion se déclenche après {timeoutMinutes} minutes d'inactivité</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InactivityTest;
