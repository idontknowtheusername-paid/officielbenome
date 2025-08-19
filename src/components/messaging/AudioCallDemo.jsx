import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AudioCallInterface } from './index';

const AudioCallDemo = () => {
  const [showAudioCall, setShowAudioCall] = useState(false);
  const [targetUser, setTargetUser] = useState({
    id: 'user123',
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com'
  });
  const [currentUser, setCurrentUser] = useState({
    id: 'currentUser',
    name: 'Moi',
    email: 'moi@example.com'
  });
  const [roomId, setRoomId] = useState('room123');
  const [callHistory, setCallHistory] = useState([]);

  const handleCallStart = (callData) => {
    const newCall = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      targetUser: targetUser.name,
      duration: callData.duration || 0,
      status: 'completed'
    };
    
    setCallHistory(prev => [newCall, ...prev.slice(0, 9)]); // Garder les 10 derniers
    console.log('Appel terminé:', callData);
  };

  const clearHistory = () => {
    setCallHistory([]);
  };

  const formatCallTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            📞 Démonstration Appels Audio
            <Badge variant="secondary">Phase 3 - WebRTC</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Testez le système d'appels audio complet avec WebRTC, gestion des états et contrôles audio.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Configuration utilisateur cible */}
            <div className="space-y-2">
              <Label htmlFor="targetName">Nom de l'utilisateur cible</Label>
              <Input
                id="targetName"
                value={targetUser.name}
                onChange={(e) => setTargetUser(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nom de l'utilisateur"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetEmail">Email de l'utilisateur cible</Label>
              <Input
                id="targetEmail"
                value={targetUser.email}
                onChange={(e) => setTargetUser(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email de l'utilisateur"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="roomId">ID de la salle</Label>
              <Input
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="ID de la salle"
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowAudioCall(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              📞 Démarrer un appel audio
            </Button>
            
            <Button
              variant="outline"
              onClick={clearHistory}
              disabled={callHistory.length === 0}
            >
              🗑️ Effacer l'historique
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historique des appels */}
      {callHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📚 Historique des appels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {callHistory.map((call) => (
                <div
                  key={call.id}
                  className="border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="text-xs">
                      {call.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatCallTime(call.timestamp)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-medium">
                      <span className="text-green-600">📞</span> {call.targetUser}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Durée: {formatDuration(call.duration)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions de test */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Instructions de test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">✅ Fonctionnalités testées</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Initialisation WebRTC</li>
                <li>• Gestion des permissions microphone</li>
                <li>• États d'appel (idle, calling, incoming, connected)</li>
                <li>• Contrôles audio (mute, speaker)</li>
                <li>• Minuteur d'appel</li>
                <li>• Gestion des erreurs</li>
                <li>• Interface utilisateur responsive</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔧 Tests à effectuer</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Autoriser l'accès microphone</li>
                <li>• Démarrer un appel</li>
                <li>• Tester les contrôles audio</li>
                <li>• Vérifier la gestion d'erreurs</li>
                <li>• Tester sur mobile</li>
                <li>• Vérifier la performance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Composant d'appel audio */}
      <AudioCallInterface
        isOpen={showAudioCall}
        onClose={() => setShowAudioCall(false)}
        targetUser={targetUser}
        currentUser={currentUser}
        roomId={roomId}
      />
    </div>
  );
};

export default AudioCallDemo;
