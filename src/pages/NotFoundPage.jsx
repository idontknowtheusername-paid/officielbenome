import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import { useAppMode } from '@/hooks/useAppMode';
import MobilePageLayout from '@/layouts/MobilePageLayout';

const NotFoundPage = () => {
  const { isAppMode } = useAppMode();

  const pageContent = (
    <>
      <SEO
        title="Page non trouvée - 404"
        description="La page que vous recherchez n'existe pas ou a été déplacée."
        robots="noindex, nofollow"
      />

      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <img
              src="/logo.png"
              alt="MaxiMarket"
              className="h-24 w-auto mx-auto"
            />
          </div>

          {/* 404 */}
          <h1 className="text-9xl font-bold gradient-text mb-4">404</h1>

          {/* Message */}
          <h2 className="text-3xl font-bold mb-4">Page non trouvée</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="btn-gradient-primary">
              <Link to="/">
                <Home className="mr-2 h-5 w-5" />
                Retour à l'accueil
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link to="/marketplace">
                <Search className="mr-2 h-5 w-5" />
                Voir les annonces
              </Link>
            </Button>
          </div>

          {/* Liens utiles */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">Liens utiles :</p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <Link to="/immobilier" className="text-primary hover:underline">
                Immobilier
              </Link>
              <Link to="/automobile" className="text-primary hover:underline">
                Automobile
              </Link>
              <Link to="/services" className="text-primary hover:underline">
                Services
              </Link>
              <Link to="/aide" className="text-primary hover:underline">
                Centre d'aide
              </Link>
              <Link to="/contact" className="text-primary hover:underline">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (isAppMode) {
    return (
      <MobilePageLayout title="Page introuvable" showBack>
        {pageContent}
      </MobilePageLayout>
    );
  }

  return pageContent;
};

export default NotFoundPage;
