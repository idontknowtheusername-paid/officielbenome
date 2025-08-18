import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Camera, 
  Mic, 
  Plus,
  Image,
  File,
  MapPin,
  Calendar,
  Phone,
  Video
} from 'lucide-react';

const MessageInput = ({
  value,
  onChange,
  onSend,
  onAttachment,
  onEmoji,
  onVoice,
  onCamera,
  placeholder = "Tapez votre message...",
  disabled = false,
  showActions = true
}) => {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const fileInputRef = useRef(null);

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      onAttachment(files);
    }
  };

  const quickActions = [
    { icon: Image, label: 'Photo', action: () => fileInputRef.current?.click() },
    { icon: Camera, label: 'Caméra', action: onCamera },
    { icon: File, label: 'Document', action: () => fileInputRef.current?.click() },
    { icon: MapPin, label: 'Localisation', action: () => console.log('Localisation') },
    { icon: Calendar, label: 'Rendez-vous', action: () => console.log('Rendez-vous') },
    { icon: Phone, label: 'Appel', action: () => console.log('Appel') },
    { icon: Video, label: 'Vidéo', action: () => console.log('Vidéo') }
  ];

  return (
    <div className="bg-white border-t border-gray-200 p-3">
      {/* Actions rapides */}
      {showQuickActions && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={action.action}
                className="flex flex-col items-center space-y-1 p-2 h-auto"
              >
                <action.icon className="h-5 w-5 text-gray-600" />
                <span className="text-xs text-gray-600">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Zone de saisie principale */}
      <div className="flex items-end space-x-2">
        {/* Bouton d'actions rapides */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="p-2 flex-shrink-0"
        >
          <Plus className={`h-4 w-4 transition-transform ${showQuickActions ? 'rotate-45' : ''}`} />
        </Button>

        {/* Zone de saisie */}
        <div className="flex-1 relative">
          <Input
            ref={fileInputRef}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            className="pr-20 resize-none"
            style={{ minHeight: '44px' }}
          />
          
          {/* Actions dans la zone de saisie */}
          <div className="absolute right-2 bottom-2 flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEmoji}
              className="p-1 h-6 w-6"
            >
              <Smile className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onAttachment}
              className="p-1 h-6 w-6"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bouton d'envoi */}
        <Button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 px-4"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Input caché pour les fichiers */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Indicateur de saisie */}
      {value && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne
        </div>
      )}
    </div>
  );
};

export default MessageInput;
