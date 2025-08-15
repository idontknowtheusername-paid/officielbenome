import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image, 
  Video, 
  File, 
  X, 
  Download, 
  Eye, 
  Play,
  FileText,
  Music,
  Archive
} from 'lucide-react';
import { Button } from './ui/button';

const AttachmentPreview = ({ 
  attachment, 
  onRemove, 
  onDownload,
  showActions = true,
  className = ''
}) => {
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Déterminer le type de fichier
  const getFileType = (type) => {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (type.includes('pdf')) return 'pdf';
    if (type.includes('word') || type.includes('document')) return 'document';
    if (type.includes('zip') || type.includes('rar')) return 'archive';
    return 'file';
  };

  // Obtenir l'icône selon le type
  const getFileIcon = (type) => {
    const fileType = getFileType(type);
    
    switch (fileType) {
      case 'image': return <Image size={20} className="text-blue-500" />;
      case 'video': return <Video size={20} className="text-red-500" />;
      case 'audio': return <Music size={20} className="text-green-500" />;
      case 'pdf': return <FileText size={20} className="text-red-600" />;
      case 'document': return <FileText size={20} className="text-blue-600" />;
      case 'archive': return <Archive size={20} className="text-purple-500" />;
      default: return <File size={20} className="text-gray-500" />;
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

  // Formater le nom du fichier
  const formatFileName = (name, maxLength = 25) => {
    if (name.length <= maxLength) return name;
    const extension = name.split('.').pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 4);
    return `${truncatedName}...${extension}`;
  };

  // Gérer le téléchargement
  const handleDownload = async () => {
    if (!onDownload) return;
    
    setIsLoading(true);
    try {
      await onDownload(attachment);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Prévisualisation des images
  const renderImagePreview = () => {
    if (getFileType(attachment.type) !== 'image') return null;
    
    return (
      <div className="relative group">
        <img
          src={attachment.url}
          alt={attachment.name}
          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="hidden w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 items-center justify-center">
          <Image size={24} className="text-gray-400" />
        </div>
        
        {/* Overlay avec actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowFullPreview(true)}
            className="h-8 px-2 text-white bg-black bg-opacity-70 hover:bg-opacity-90"
          >
            <Eye size={14} />
          </Button>
        </div>
      </div>
    );
  };

  // Prévisualisation des vidéos
  const renderVideoPreview = () => {
    if (getFileType(attachment.type) !== 'video') return null;
    
    return (
      <div className="relative group">
        <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
          <Play size={24} className="text-gray-400" />
        </div>
        
        {/* Overlay avec actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowFullPreview(true)}
            className="h-8 px-2 text-white bg-black bg-opacity-70 hover:bg-opacity-90"
          >
            <Play size={14} />
          </Button>
        </div>
      </div>
    );
  };

  // Prévisualisation des autres types de fichiers
  const renderFilePreview = () => {
    const fileType = getFileType(attachment.type);
    if (fileType === 'image' || fileType === 'video') return null;
    
    return (
      <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
        {getFileIcon(attachment.type)}
      </div>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`flex items-center space-x-3 bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors ${className}`}
      >
        {/* Prévisualisation */}
        {renderImagePreview()}
        {renderVideoPreview()}
        {renderFilePreview()}

        {/* Informations du fichier */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate" title={attachment.name}>
            {formatFileName(attachment.name)}
          </h4>
          <p className="text-xs text-gray-500">
            {formatFileSize(attachment.size)}
          </p>
          <p className="text-xs text-gray-400 capitalize">
            {attachment.type.split('/')[0]}
          </p>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDownload}
              disabled={isLoading}
              className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600"
              title="Télécharger"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download size={16} />
              )}
            </Button>
            
            {(getFileType(attachment.type) === 'image' || getFileType(attachment.type) === 'video') && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowFullPreview(true)}
                className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-600"
                title="Voir en grand"
              >
                <Eye size={16} />
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemove(attachment.id)}
              className="h-8 w-8 p-0 hover:bg-red-100 text-red-600"
              title="Supprimer"
            >
              <X size={16} />
            </Button>
          </div>
        )}
      </motion.div>

      {/* Modal de prévisualisation plein écran */}
      <AnimatePresence>
        {showFullPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={() => setShowFullPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Bouton fermer */}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowFullPreview(false)}
                className="absolute top-4 right-4 z-10 h-10 w-10 p-0 bg-black bg-opacity-70 hover:bg-opacity-90 text-white"
              >
                <X size={20} />
              </Button>

              {/* Contenu de la prévisualisation */}
              {getFileType(attachment.type) === 'image' && (
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              )}

              {getFileType(attachment.type) === 'video' && (
                <video
                  src={attachment.url}
                  controls
                  className="max-w-full max-h-full rounded-lg"
                  autoPlay
                >
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              )}

              {/* Informations du fichier */}
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
                <h3 className="font-medium">{attachment.name}</h3>
                <p className="text-sm text-gray-300">
                  {formatFileSize(attachment.size)} • {attachment.type}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AttachmentPreview; 