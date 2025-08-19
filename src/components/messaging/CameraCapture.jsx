import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  X, 
  RotateCcw, 
  Download, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const CameraCapture = ({ 
  onCapture, 
  onClose, 
  isOpen = false,
  quality = 0.8,
  maxWidth = 1920,
  maxHeight = 1080
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' ou 'environment'
  
  const { toast } = useToast();

  // Démarrer la caméra
  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Votre navigateur ne supporte pas l\'accès à la caméra');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: maxWidth },
          height: { ideal: maxHeight }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraActive(true);
          setIsLoading(false);
        };
      }
      
      setHasPermission(true);
    } catch (err) {
      console.error('Erreur caméra:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Permission d\'accès à la caméra refusée. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.');
      } else if (err.name === 'NotFoundError') {
        setError('Aucune caméra trouvée sur votre appareil.');
      } else if (err.name === 'NotReadableError') {
        setError('La caméra est déjà utilisée par une autre application.');
      } else {
        setError('Erreur lors de l\'accès à la caméra. Veuillez réessayer.');
      }
      
      setHasPermission(false);
      setIsLoading(false);
    }
  }, [facingMode, maxWidth, maxHeight]);

  // Arrêter la caméra
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Basculer entre caméra avant/arrière
  const toggleCamera = useCallback(() => {
    if (isCameraActive) {
      stopCamera();
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
      setTimeout(() => startCamera(), 100);
    }
  }, [isCameraActive, stopCamera, startCamera]);

  // Capturer une photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Définir les dimensions du canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dessiner l'image de la vidéo sur le canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir en blob avec qualité configurable
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage({
          blob,
          url: imageUrl,
          timestamp: new Date().toISOString()
        });
        
        toast({
          title: "Photo capturée !",
          description: "Votre photo a été capturée avec succès.",
          duration: 3000,
        });
      }
    }, 'image/jpeg', quality);
  }, [quality, toast]);

  // Reprendre une photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    if (capturedImage?.url) {
      URL.revokeObjectURL(capturedImage.url);
    }
  }, [capturedImage]);

  // Confirmer et envoyer la photo
  const confirmPhoto = useCallback(() => {
    if (capturedImage && onCapture) {
      onCapture(capturedImage);
      onClose();
    }
  }, [capturedImage, onCapture, onClose]);

  // Gérer la fermeture
  const handleClose = useCallback(() => {
    stopCamera();
    if (capturedImage?.url) {
      URL.revokeObjectURL(capturedImage.url);
    }
    setCapturedImage(null);
    setError(null);
    onClose();
  }, [stopCamera, capturedImage, onClose]);

  // Démarrer la caméra quand le composant s'ouvre
  useEffect(() => {
    if (isOpen && !isCameraActive) {
      startCamera();
    }
  }, [isOpen, isCameraActive, startCamera]);

  // Nettoyer à la fermeture
  useEffect(() => {
    return () => {
      stopCamera();
      if (capturedImage?.url) {
        URL.revokeObjectURL(capturedImage.url);
      }
    };
  }, [stopCamera, capturedImage]);

  // Gestion des erreurs de permission
  if (hasPermission === false) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-card border border-border rounded-lg p-6 max-w-md mx-4 text-center"
            >
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Accès à la caméra refusé</h3>
              <p className="text-muted-foreground mb-4">
                {error || 'Pour utiliser la caméra, vous devez autoriser l\'accès dans les paramètres de votre navigateur.'}
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleClose}>
                  Fermer
                </Button>
                <Button onClick={startCamera}>
                  Réessayer
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="bg-card border border-border rounded-lg overflow-hidden max-w-2xl w-full mx-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Prendre une photo
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Contenu principal */}
            <div className="p-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Initialisation de la caméra...</p>
                </div>
              ) : capturedImage ? (
                /* Aperçu de la photo capturée */
                <div className="space-y-4">
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={capturedImage.url}
                      alt="Photo capturée"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex justify-center space-x-2">
                    <Button variant="outline" onClick={retakePhoto}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reprendre
                    </Button>
                    <Button onClick={confirmPhoto}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Utiliser cette photo
                    </Button>
                  </div>
                </div>
              ) : (
                /* Interface de la caméra */
                <div className="space-y-4">
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {!isCameraActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted">
                        <div className="text-center">
                          <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">Initialisation de la caméra...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contrôles de la caméra */}
                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={toggleCamera}
                      disabled={!isCameraActive}
                      className="flex items-center"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Changer de caméra
                    </Button>
                    <Button
                      onClick={capturePhoto}
                      disabled={!isCameraActive}
                      size="lg"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Prendre la photo
                    </Button>
                  </div>

                  {/* Informations */}
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Positionnez-vous dans le cadre et appuyez sur "Prendre la photo"</p>
                    <p className="mt-1">Vous pourrez reprendre la photo si nécessaire</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CameraCapture;
