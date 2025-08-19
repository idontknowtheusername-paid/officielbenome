import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageInput } from './index';

const MessageInputDemo = () => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [messages, setMessages] = useState([]);

  const handleSend = (text) => {
    const newMessage = {
      id: Date.now(),
      text,
      attachments: [...attachments],
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [newMessage, ...prev]);
    setMessage('');
    setAttachments([]);
  };

  const handleAttachment = (files) => {
    setAttachments(prev => [...prev, ...files]);
  };

  const handleEmoji = () => {
    // Simuler l'ajout d'un emoji
    setMessage(prev => prev + '😊');
  };

  const handleVoice = () => {
    console.log('Fonctionnalité voix - Phase 3');
  };

  const handleCamera = () => {
    console.log('Fonctionnalité caméra - Phase 1');
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            📱 Démonstration MessageInput
            <Badge variant="secondary">Phase 2 - Localisation & Rendez-vous</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Testez les nouvelles fonctionnalités du menu "+" : Caméra, Upload de fichiers, Localisation et Rendez-vous.
          </p>
          
          {/* Zone de saisie de message */}
          <div className="border rounded-lg">
            <MessageInput
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onSend={handleSend}
              onAttachment={handleAttachment}
              onEmoji={handleEmoji}
              onVoice={handleVoice}
              onCamera={handleCamera}
              placeholder="Tapez votre message..."
              showActions={true}
            />
          </div>

          {/* Pièces jointes sélectionnées */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Pièces jointes ({attachments.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {attachments.map((file, index) => (
                  <div key={index} className="border rounded-lg p-2 bg-muted/30">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages envoyés */}
      <Card>
        <CardHeader>
          <CardTitle>Messages envoyés</CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucun message envoyé. Testez la saisie ci-dessus !
            </p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="border rounded-lg p-3 bg-muted/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{msg.text}</p>
                      {msg.attachments.length > 0 && (
                        <div className="mt-2">
                          <Badge variant="outline" className="mr-2">
                            📎 {msg.attachments.length} pièce(s) jointe(s)
                          </Badge>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions de test */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Instructions de test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">✅ Phase 1 - Fonctionnel</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Cliquez sur le bouton "+" pour ouvrir le menu</li>
                <li>• Testez "Caméra" pour prendre une photo</li>
                              <li>• Testez "Photo" ou "Document" pour l'upload</li>
              <li>• Glissez-déposez des fichiers</li>
              <li>• Testez "Localisation" pour partager votre position</li>
              <li>• Testez "Rendez-vous" pour planifier un meeting</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🚧 Phases suivantes</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Localisation (Phase 2)</li>
                <li>• Rendez-vous (Phase 2)</li>
                <li>• Appels audio/vidéo (Phase 3)</li>
                <li>• Optimisations (Phase 4)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageInputDemo;
