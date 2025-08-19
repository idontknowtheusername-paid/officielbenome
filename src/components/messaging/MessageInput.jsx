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
import CameraCapture from './CameraCapture';
import FileUpload from './FileUpload';
import LocationPicker from './LocationPicker';
import AppointmentScheduler from './AppointmentScheduler';
import AudioCallInterface from './AudioCallInterface';

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
  const [showCamera, setShowCamera] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showAppointmentScheduler, setShowAppointmentScheduler] = useState(false);
  const [showAudioCall, setShowAudioCall] = useState(false);
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

  // Gérer la capture de photo
  const handleCameraCapture = (capturedImage) => {
    // Convertir l'image capturée en File object
    const file = new File([capturedImage.blob], `photo_${Date.now()}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });
    
    if (onAttachment) {
      onAttachment([file]);
    }
  };

  // Gérer la sélection de fichiers
  const handleFileSelection = (selectedFiles) => {
    if (onAttachment) {
      onAttachment(selectedFiles);
    }
  };

  // Gérer la sélection de localisation
  const handleLocationSelect = (location) => {
    // Créer un message avec la localisation
    const locationMessage = `📍 Localisation partagée\nLat: ${location.latitude.toFixed(6)}\nLng: ${location.longitude.toFixed(6)}${location.name ? `\nLieu: ${location.name}` : ''}`;
    
    if (onAttachment) {
      // Créer un objet de localisation pour l'attachement
      const locationAttachment = {
        type: 'location',
        data: location,
        message: locationMessage
      };
      onAttachment([locationAttachment]);
    }
  };

  // Gérer la création de rendez-vous
  const handleAppointmentCreate = (appointment) => {
    // Créer un message avec le rendez-vous
    const appointmentMessage = `📅 Rendez-vous planifié\nTitre: ${appointment.title}\nDate: ${new Date(appointment.date).toLocaleDateString('fr-FR')}\nHeure: ${appointment.time}${appointment.location ? `\nLieu: ${appointment.location}` : ''}${appointment.description ? `\nDescription: ${appointment.description}` : ''}`;
    
    if (onAttachment) {
      // Créer un objet de rendez-vous pour l'attachement
      const appointmentAttachment = {
        type: 'appointment',
        data: appointment,
        message: appointmentMessage
      };
      onAttachment([appointmentAttachment]);
    }
  };

  const quickActions = [
    { icon: Image, label: 'Photo', action: () => setShowFileUpload(true) },
    { icon: Camera, label: 'Caméra', action: () => setShowCamera(true) },
    { icon: File, label: 'Document', action: () => setShowFileUpload(true) },
    { icon: MapPin, label: 'Localisation', action: () => setShowLocationPicker(true) },
    { icon: Calendar, label: 'Rendez-vous', action: () => setShowAppointmentScheduler(true) },
    { icon: Phone, label: 'Appel', action: () => setShowAudioCall(true) },
    { icon: Video, label: 'Vidéo', action: () => console.log('Vidéo - Phase 3') }
  ];

  return (
    <div className="bg-card border-t border-border p-3">
      {/* Actions rapides */}
      {showQuickActions && (
        <div className="mb-3 p-3 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={action.action}
                className="flex flex-col items-center space-y-1 p-2 h-auto"
              >
                <action.icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{action.label}</span>
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
          className="bg-primary hover:bg-primary/90 flex-shrink-0 px-4"
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
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne
        </div>
      )}

      {/* Composants modaux */}
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
      />
      
      <FileUpload
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onFilesSelected={handleFileSelection}
      />

      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
      />

      <AppointmentScheduler
        isOpen={showAppointmentScheduler}
        onClose={() => setShowAppointmentScheduler(false)}
        onAppointmentCreate={handleAppointmentCreate}
      />

      <AudioCallInterface
        isOpen={showAudioCall}
        onClose={() => setShowAudioCall(false)}
        targetUser={{ id: 'user123', name: 'Utilisateur Test', email: 'test@example.com' }}
        currentUser={{ id: 'currentUser', name: 'Moi' }}
        roomId="room123"
      />
    </div>
  );
};

export default MessageInput;
