import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import FavoritesManager from '@/components/FavoritesManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FavoritesPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-4xl font-bold">Mes Favoris</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Retrouvez toutes vos annonces sauvegardées et gérez vos favoris en toute simplicité.
          </p>
        </div>

        {/* Favorites Manager */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-primary" />
              <span>Annonces Favorites</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FavoritesManager />
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Vous ne trouvez pas ce que vous cherchez ?
          </p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => window.location.href = '/marketplace'}
          >
            Explorer le Marketplace
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default FavoritesPage; 