import React from 'react';
import ListingForm from '@/components/ListingForm';
import { useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

const CreateListingPage = () => {
  const navigate = useNavigate();

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
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 text-center tracking-tight">Créer une annonce</h1>
        <p className="text-gray-500 mb-8 text-center">Remplis le formulaire ci-dessous pour publier ton annonce sur la plateforme.</p>
        <ListingForm onSuccess={handleSuccess} />
      </div>
      <Toaster />
    </div>
  );
};

export default CreateListingPage; 