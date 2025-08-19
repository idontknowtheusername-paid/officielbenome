import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  PhoneOff, 
  PhoneIncoming, 
  PhoneOutgoing,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  User,
  Users,
  X,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import audioCallService from '../../services/audioCall.service';

const AudioCallInterface = ({ 
  isOpen = false, 
  onClose, 
  targetUser = null,
  currentUser = null,
  roomId = null
}) => {
  const [callState, setCallState] = useState('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const audioRef = useRef(null);
  const { toast } = useToast();

  // Initialiser le service d'appel
  useEffect(() => {
    if (isOpen && currentUser && roomId) {
      initializeCallService();
    }
  }, [isOpen, currentUser, roomId]);

  // Nettoyer à la fermeture
  useEffect(() => {
    if (!isOpen) {
      cleanupCall();
    }
  }, [isOpen]);

  // Initialiser le service d'appel
  const initializeCallService = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      const success = await audioCallService.initialize(currentUser.id, roomId);
      
      if (success) {
        // Configurer les callbacks
        audioCallService.setCallbacks({
          onCallStateChange: handleCallStateChange,
          onRemoteStream: handleRemoteStream,
          onCallDuration: handleCallDuration,
          onError: handleServiceError
        });
        
        toast({
          title: "Service d'appel initialisé",
          description: "Prêt pour les appels audio",
          duration: 3000,
        });
      } else {
        throw new Error('Échec de l\'initialisation du service d\'appel');
      }
    } catch (error) {
      console.error('Erreur initialisation:', error);
      setError(error.message);
      toast({
        title: "Erreur d'initialisation",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsInitializing(false);
    }
  };

  // Gérer le changement d'état d'appel
  const handleCallStateChange = useCallback((newState) => {
    setCallState(newState);
    setIsConnected(newState === 'connected');
    
    if (newState === 'ended') {
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [onClose]);

  // Gérer le flux audio distant
  const handleRemoteStream = useCallback((stream) => {
    if (audioRef.current) {
      audioRef.current.srcObject = stream;
      audioRef.current.play().catch(console.error);
    }
  }, []);

  // Gérer la durée d'appel
  const handleCallDuration = useCallback((duration) => {
    setCallDuration(duration);
  }, []);

  // Gérer les erreurs du service
  const handleServiceError = useCallback((error) => {
    setError(error.message);
    toast({
      title: "Erreur d'appel",
      description: error.message,
      variant: "destructive",
      duration: 5000,
    });
  }, [toast]);

  // Démarrer un appel
  const startCall = async () => {
    try {
      if (!targetUser || !roomId) {
        throw new Error('Informations manquantes pour l\'appel');
      }

      const success = await audioCallService.startCall(targetUser.id, roomId);
      
      if (success) {
        toast({
          title: "Appel en cours...",
          description: `Appel de ${targetUser.name || targetUser.email}`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Erreur démarrage appel:', error);
      handleServiceError(error);
    }
  };

  // Répondre à un appel
  const answerCall = async () => {
    try {
      const success = await audioCallService.answerCall();
      
      if (success) {
        toast({
          title: "Appel accepté",
          description: "Connexion en cours...",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Erreur réponse appel:', error);
      handleServiceError(error);
    }
  };

  // Refuser un appel
  const rejectCall = () => {
    audioCallService.rejectCall();
    toast({
      title: "Appel refusé",
      description: "L'appel a été refusé",
      duration: 3000,
      variant: "destructive",
    });
  };

  // Terminer un appel
  const endCall = () => {
    audioCallService.endCall();
    toast({
      title: "Appel terminé",
      description: "L'appel a été terminé",
      duration: 3000,
    });
  };

  // Basculer le micro
  const toggleMute = () => {
    if (audioCallService.localStream) {
      const audioTrack = audioCallService.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        
        toast({
          title: isMuted ? "Micro activé" : "Micro désactivé",
          description: isMuted ? "Votre voix est maintenant audible" : "Votre voix est maintenant muette",
          duration: 2000,
        });
      }
    }
  };

  // Basculer le haut-parleur
  const toggleSpeaker = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsSpeakerOn(!audioRef.current.muted);
      
      toast({
        title: isSpeakerOn ? "Haut-parleur désactivé" : "Haut-parleur activé",
        description: isSpeakerOn ? "Son désactivé" : "Son activé",
        duration: 2000,
      });
    }
  };

  // Nettoyer l'appel
  const cleanupCall = () => {
    audioCallService.disconnect();
    setCallState('idle');
    setCallDuration(0);
    setIsConnected(false);
    setError(null);
  };

  // Fermer l'interface
  const handleClose = () => {
    if (audioCallService.isInCall()) {
      endCall();
    }
    onClose();
  };

  // Formater la durée
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Obtenir l'icône d'état
  const getStateIcon = () => {
    switch (callState) {
      case 'calling': return <PhoneOutgoing className="h-6 w-6 text-orange-500" />;
      case 'incoming': return <PhoneIncoming className="h-6 w-6 text-green-500" />;
      case 'connected': return <Phone className="h-6 w-6 text-green-500" />;
      default: return <Phone className="h-6 w-6 text-gray-500" />;
    }
  };

  // Obtenir le titre d'état
  const getStateTitle = () => {
    switch (callState) {
      case 'calling': return 'Appel en cours...';
      case 'incoming': return 'Appel entrant';
      case 'connected': return 'Appel en cours';
      case 'ended': return 'Appel terminé';
      default: return 'Prêt pour l\'appel';
    }
  };

  // Obtenir la description d'état
  const getStateDescription = () => {
    if (callState === 'connected') {
      return `Durée: ${formatDuration(callDuration)}`;
    }
    
    if (targetUser) {
      return `Appel de ${targetUser.name || targetUser.email}`;
    }
    
    return 'En attente...';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        >
          {/* En-tête */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white text-center relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center justify-center mb-4">
              {getStateIcon()}
            </div>
            
            <h2 className="text-xl font-semibold mb-1">{getStateTitle()}</h2>
            <p className="text-blue-100 text-sm">{getStateDescription()}</p>
          </div>

          {/* Contenu principal */}
          <div className="p-6 space-y-6">
            {/* Informations utilisateur */}
            {targetUser && (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {targetUser.name || 'Utilisateur'}
                </h3>
                {targetUser.email && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {targetUser.email}
                  </p>
                )}
              </div>
            )}

            {/* État de l'appel */}
            <div className="text-center">
              <Badge variant={callState === 'connected' ? 'default' : 'secondary'}>
                {callState.toUpperCase()}
              </Badge>
              
              {callState === 'connected' && (
                <div className="flex items-center justify-center mt-2 text-green-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="font-mono">{formatDuration(callDuration)}</span>
                </div>
              )}
            </div>

            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Contrôles d'appel */}
            <div className="space-y-3">
              {/* Boutons principaux */}
              {callState === 'idle' && (
                <Button
                  onClick={startCall}
                  disabled={isInitializing || !targetUser}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  {isInitializing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Initialisation...
                    </>
                  ) : (
                    <>
                      <Phone className="h-5 w-5 mr-2" />
                      Appeler
                    </>
                  )}
                </Button>
              )}

              {/* Appel entrant */}
              {callState === 'incoming' && (
                <div className="flex space-x-3">
                  <Button
                    onClick={answerCall}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Répondre
                  </Button>
                  <Button
                    onClick={rejectCall}
                    variant="destructive"
                    className="flex-1"
                    size="lg"
                  >
                    <PhoneOff className="h-5 w-5 mr-2" />
                    Refuser
                  </Button>
                </div>
              )}

              {/* Appel en cours */}
              {callState === 'calling' && (
                <Button
                  onClick={endCall}
                  variant="destructive"
                  className="w-full"
                  size="lg"
                >
                  <PhoneOff className="h-5 w-5 mr-2" />
                  Annuler l'appel
                </Button>
              )}

              {/* Appel connecté */}
              {callState === 'connected' && (
                <Button
                  onClick={endCall}
                  variant="destructive"
                  className="w-full"
                  size="lg"
                >
                  <PhoneOff className="h-5 w-5 mr-2" />
                  Terminer l'appel
                </Button>
              )}

              {/* Contrôles audio (seulement si connecté) */}
              {callState === 'connected' && (
                <div className="flex space-x-3 pt-3 border-t">
                  <Button
                    onClick={toggleMute}
                    variant={isMuted ? "destructive" : "outline"}
                    className="flex-1"
                  >
                    {isMuted ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                    {isMuted ? 'Activer' : 'Muet'}
                  </Button>
                  
                  <Button
                    onClick={toggleSpeaker}
                    variant={!isSpeakerOn ? "destructive" : "outline"}
                    className="flex-1"
                  >
                    {!isSpeakerOn ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
                    {!isSpeakerOn ? 'Activer' : 'Désactiver'}
                  </Button>
                </div>
              )}
            </div>

            {/* Statut de connexion */}
            <div className="text-center text-sm text-gray-500">
              {isConnected ? (
                <div className="flex items-center justify-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Connecté
                </div>
              ) : (
                <div className="flex items-center justify-center text-gray-400">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connexion...
                </div>
              )}
            </div>
          </div>

          {/* Élément audio pour le flux distant */}
          <audio
            ref={audioRef}
            autoPlay
            playsInline
            className="hidden"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AudioCallInterface;
