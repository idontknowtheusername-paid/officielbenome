import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  Video, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

const FileUpload = ({
  onFilesSelected,
  onClose,
  isOpen = false,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = [
    'image/*',
    'video/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/zip'
  ],
  multiple = true
}) => {
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);
  const [previewFiles, setPreviewFiles] = useState({});
  
  const { toast } = useToast();

  // Vérifier le type de fichier
  const getFileType = (file) => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('application/pdf')) return 'pdf';
    if (file.type.includes('word') || file.type.includes('document')) return 'document';
    if (file.type.includes('excel') || file.type.includes('spreadsheet')) return 'spreadsheet';
    if (file.type.includes('text/') || file.type.includes('csv')) return 'text';
    if (file.type.includes('zip') || file.type.includes('archive')) return 'archive';
    return 'other';
  };

  // Obtenir l'icône selon le type de fichier
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image': return <Image className="h-8 w-8 text-blue-500" />;
      case 'video': return <Video className="h-8 w-8 text-purple-500" />;
      case 'pdf': return <FileText className="h-8 w-8 text-red-500" />;
      case 'document': return <FileText className="h-8 w-8 text-blue-600" />;
      case 'spreadsheet': return <FileText className="h-8 w-8 text-green-600" />;
      case 'text': return <FileText className="h-8 w-8 text-gray-600" />;
      case 'archive': return <File className="h-8 w-8 text-orange-500" />;
      default: return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Valider un fichier
  const validateFile = (file) => {
    const errors = [];

    // Vérifier la taille
    if (file.size > maxFileSize) {
      errors.push(`Le fichier "${file.name}" est trop volumineux (${formatFileSize(file.size)}). Taille maximale : ${formatFileSize(maxFileSize)}`);
    }

    // Vérifier le type
    const isAccepted = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAccepted) {
      errors.push(`Le type de fichier "${file.type}" n'est pas accepté pour "${file.name}"`);
    }

    // Vérifier le nombre de fichiers
    if (files.length >= maxFiles) {
      errors.push(`Nombre maximum de fichiers atteint (${maxFiles})`);
    }

    return errors;
  };

  // Créer une prévisualisation pour les images
  const createPreview = useCallback((file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewFiles(prev => ({
          ...prev,
          [file.name]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Gérer la sélection de fichiers
  const handleFileSelect = useCallback((selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const newErrors = [];
    const validFiles = [];

    fileArray.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length === 0) {
        validFiles.push(file);
        createPreview(file);
      } else {
        newErrors.push(...fileErrors);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      toast({
        title: "Erreurs de validation",
        description: newErrors.slice(0, 3).join('. '),
        variant: "destructive",
        duration: 5000,
      });
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      toast({
        title: "Fichiers ajoutés",
        description: `${validFiles.length} fichier(s) ajouté(s) avec succès.`,
        duration: 3000,
      });
    }
  }, [files, maxFiles, maxFileSize, acceptedTypes, createPreview, toast]);

  // Gérer le drop de fichiers
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, [handleFileSelect]);

  // Gérer le drag over
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  // Gérer le drag leave
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Supprimer un fichier
  const removeFile = useCallback((fileName) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));
    setPreviewFiles(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[fileName];
      return newPreviews;
    });
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  }, []);

  // Confirmer la sélection
  const confirmSelection = useCallback(() => {
    if (files.length > 0 && onFilesSelected) {
      onFilesSelected(files);
      onClose();
    }
  }, [files, onFilesSelected, onClose]);

  // Simuler l'upload (à remplacer par la vraie logique)
  const simulateUpload = useCallback((file) => {
    setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const current = prev[file.name] || 0;
        if (current >= 100) {
          clearInterval(interval);
          return prev;
        }
        return { ...prev, [file.name]: current + 10 };
      });
    }, 100);
  }, []);

  // Gérer la fermeture
  const handleClose = useCallback(() => {
    setFiles([]);
    setPreviewFiles({});
    setUploadProgress({});
    setErrors([]);
    onClose();
  }, [onClose]);

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
            className="bg-card border border-border rounded-lg overflow-hidden max-w-4xl w-full mx-4 max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Sélectionner des fichiers
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
            <div className="p-4 space-y-4">
              {/* Zone de drop */}
              <div
                ref={dropZoneRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${isDragging 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">
                  Glissez-déposez vos fichiers ici
                </h4>
                <p className="text-muted-foreground mb-4">
                  ou cliquez pour sélectionner des fichiers
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choisir des fichiers
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Types acceptés : Images, Vidéos, PDF, Documents, etc.
                  <br />
                  Taille maximale : {formatFileSize(maxFileSize)} par fichier
                </p>
              </div>

              {/* Input caché */}
              <input
                ref={fileInputRef}
                type="file"
                multiple={multiple}
                accept={acceptedTypes.join(',')}
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />

              {/* Liste des fichiers sélectionnés */}
              {files.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Fichiers sélectionnés ({files.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {files.map((file, index) => (
                      <motion.div
                        key={`${file.name}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-border rounded-lg p-3 bg-muted/30"
                      >
                        <div className="flex items-start space-x-3">
                          {getFileIcon(getFileType(file))}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • {getFileType(file)}
                            </p>
                            
                            {/* Prévisualisation pour les images */}
                            {previewFiles[file.name] && (
                              <div className="mt-2">
                                <img
                                  src={previewFiles[file.name]}
                                  alt={file.name}
                                  className="w-16 h-16 object-cover rounded border"
                                />
                              </div>
                            )}

                            {/* Barre de progression */}
                            {uploadProgress[file.name] !== undefined && (
                              <div className="mt-2">
                                <Progress value={uploadProgress[file.name]} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-1">
                                  {uploadProgress[file.name]}% terminé
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => simulateUpload(file)}
                              disabled={uploadProgress[file.name] !== undefined}
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.name)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Erreurs */}
              {errors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-destructive/10 border border-destructive/20 rounded-lg p-3"
                >
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-destructive mb-2">Erreurs de validation</h4>
                      <ul className="text-sm text-destructive space-y-1">
                        {errors.slice(0, 5).map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {errors.length > 5 && (
                          <li>• ... et {errors.length - 5} autres erreurs</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer avec actions */}
            <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
              <div className="text-sm text-muted-foreground">
                {files.length > 0 ? (
                  <span className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    {files.length} fichier(s) prêt(s) à être envoyé(s)
                  </span>
                ) : (
                  "Aucun fichier sélectionné"
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleClose}>
                  Annuler
                </Button>
                <Button
                  onClick={confirmSelection}
                  disabled={files.length === 0}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Envoyer {files.length > 0 && `(${files.length})`}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FileUpload;
