import React from 'react';
import ListingForm from '@/components/ListingForm';
import { useNavigate, useParams } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

const CreateListingPage = () => {
  const navigate = useNavigate();
  const { category } = useParams();

  // Fonction pour convertir les catégories en noms d'affichage
  const getCategoryDisplayName = (cat) => {
    const categoryMap = {
      'real-estate': 'Immobilière',
      'automobile': 'Automobile',
      'services': 'de Service',
      'marketplace': 'Marketplace'
    };
    return categoryMap[cat] || '';
  };

  const handleSuccess = (res) => {
    // Redirige vers la page de l'annonce ou dashboard après création
    if (res?.listing?.id) {
      navigate(`/listings/${res.listing.id}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex flex-col items-center justify-start py-10 px-2">
      <div className="w-full max-w-2xl bg-white/90 rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 text-center tracking-tight">
          {category ? `Créer une annonce ${getCategoryDisplayName(category)}` : 'Créer une annonce'}
        </h1>
        <p className="text-gray-500 mb-8 text-center">Remplis le formulaire ci-dessous pour publier ton annonce sur la plateforme.</p>
        <ListingForm onSuccess={handleSuccess} category={category} />
      </div>
      <Toaster />
    </div>
  );
};

export default CreateListingPage; 