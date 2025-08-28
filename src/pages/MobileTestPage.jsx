import React from 'react';
import { MobileTestSuite } from '@/components/MobileTestSuite';

const MobileTestPage = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">🧪 Tests Mobile - MaxiMarket</h1>
          <p className="text-muted-foreground">
            Suite complète de tests pour valider toutes les fonctionnalités mobiles
          </p>
        </div>
        
        <MobileTestSuite />
      </div>
    </div>
  );
};

export default MobileTestPage;
