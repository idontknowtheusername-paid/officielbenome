import React from 'react';
import { useListings } from '@/hooks/useListings';

const TestListings = () => {
  const { listings, loading, error } = useListings('real_estate');

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="p-4">
      <h2>Test des annonces</h2>
      <div className="space-y-4">
        {listings.map((listing, index) => (
          <div key={index} className="border p-4 rounded">
            <h3>Annonce {index + 1}</h3>
            <p><strong>ID:</strong> {listing.id} (Type: {typeof listing.id})</p>
            <p><strong>Titre:</strong> {listing.title}</p>
            <p><strong>Catégorie:</strong> {listing.category}</p>
            <p><strong>Statut:</strong> {listing.status}</p>
            <button 
              onClick={() => console.log('Click sur annonce:', listing)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Tester le clic
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestListings; 