import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { promisify } from 'util';

// Charger les variables d'environnement
dotenv.config();

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Convertir les callbacks en promesses
const uploadPromise = promisify(cloudinary.uploader.upload.bind(cloudinary.uploader));
const destroyPromise = promisify(cloudinary.uploader.destroy.bind(cloudinary.uploader));

/**
 * Télécharge un fichier sur Cloudinary
 * @param {string} file - Chemin du fichier ou URL de l'image
 * @param {string} folder - Dossier de destination sur Cloudinary
 * @returns {Promise<Object>} - Résultat du téléchargement
 */
export const uploadToCloudinary = async (file, folder = 'officielbenome') => {
  try {
    const result = await uploadPromise(file, {
      folder,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
      overwrite: true,
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Erreur lors du téléchargement sur Cloudinary:', error);
    throw new Error(`Échec du téléchargement de l'image: ${error.message}`);
  }
};

/**
 * Supprime un fichier de Cloudinary
 * @param {string} publicId - ID public de l'image sur Cloudinary
 * @returns {Promise<Object>} - Résultat de la suppression
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('ID public manquant pour la suppression');
    }

    const result = await destroyPromise(publicId, {
      invalidate: true
    });

    if (result.result !== 'ok') {
      throw new Error(`Échec de la suppression de l'image: ${result.result}`);
    }

    return {
      success: true,
      message: 'Image supprimée avec succès',
      result
    };
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image de Cloudinary:', error);
    throw new Error(`Échec de la suppression de l'image: ${error.message}`);
  }
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary
};
