import React, { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera as CameraIcon, Image, Upload, X } from 'lucide-react';

export const MobileImageUpload = ({ onImageSelected, maxImages = 5 }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  const takePicture = async () => {
    try {
      setIsLoading(true);
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      
      if (image.webPath) {
        const newImage = {
          uri: image.webPath,
          name: `photo_${Date.now()}.jpg`,
          type: 'image/jpeg'
        };
        
        addImage(newImage);
      }
    } catch (error) {
      console.error('📸 Camera error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectFromGallery = async () => {
    try {
      setIsLoading(true);
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });
      
      if (image.webPath) {
        const newImage = {
          uri: image.webPath,
          name: `gallery_${Date.now()}.jpg`,
          type: 'image/jpeg'
        };
        
        addImage(newImage);
      }
    } catch (error) {
      console.error('🖼️ Gallery error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addImage = (image) => {
    if (selectedImages.length < maxImages) {
      const updatedImages = [...selectedImages, image];
      setSelectedImages(updatedImages);
      onImageSelected?.(updatedImages);
    } else {
      console.log(`⚠️ Maximum ${maxImages} images allowed`);
    }
  };

  const removeImage = (index) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    onImageSelected?.(updatedImages);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Ajouter des Photos
        </CardTitle>
        <CardDescription>
          Prenez une photo ou sélectionnez depuis votre galerie
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Boutons d'action */}
        <div className="flex gap-2">
          <Button 
            onClick={takePicture} 
            disabled={isLoading || selectedImages.length >= maxImages}
            className="flex-1"
            variant="outline"
          >
            <CameraIcon className="mr-2 h-4 w-4" />
            📸 Photo
          </Button>
          <Button 
            onClick={selectFromGallery} 
            disabled={isLoading || selectedImages.length >= maxImages}
            className="flex-1"
            variant="outline"
          >
            <Image className="mr-2 h-4 w-4" />
            🖼️ Galerie
          </Button>
        </div>

        {/* Images sélectionnées */}
        {selectedImages.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              Images sélectionnées ({selectedImages.length}/{maxImages})
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.uri}
                    alt={`Image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <Button
                    onClick={() => removeImage(index)}
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-muted-foreground">
          <p>💡 <strong>Instructions :</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Cliquez sur "Photo" pour prendre une nouvelle photo</li>
            <li>Cliquez sur "Galerie" pour sélectionner depuis vos photos</li>
            <li>Maximum {maxImages} images autorisées</li>
            <li>Survolez une image pour la supprimer</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
