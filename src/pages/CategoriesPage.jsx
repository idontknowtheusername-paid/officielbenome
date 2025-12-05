import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Car, Briefcase, ShoppingBag, ArrowRight } from 'lucide-react';

const categories = [
  {
    id: 'immobilier',
    name: 'Immobilier',
    description: 'Maisons, appartements, terrains.',
    icon: Home,
    path: '/immobilier',
  },
  {
    id: 'automobile',
    name: 'Automobile',
    description: 'Voitures, motos, utilitaires.',
    icon: Car,
    path: '/automobile',
  },
  {
    id: 'services',
    name: 'Services Pro',
    description: 'Experts qualifiés à votre service.',
    icon: Briefcase,
    path: '/services',
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Produits neufs et d\'occasion.',
    icon: ShoppingBag,
    path: '/marketplace',
  }
];

const categoryCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 }
  })
};

const CategoriesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-900 to-blue-900/20 text-foreground pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-6">
        <h1 className="text-2xl font-bold">Catégories</h1>
        <p className="text-white/80 text-sm mt-1">Explorez nos rayons</p>
      </div>

      {/* Liste des catégories - Style identique à HomePage */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                custom={index}
                variants={categoryCardVariants}
                initial="hidden"
                animate="visible"
              >
                <Link
                  to={category.path}
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-xl shadow-lg hover:shadow-primary/30 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center border border-white/20 dark:border-white/10 hover:border-primary/40 group block"
                >
                  <Icon className="h-10 w-10 mb-3 text-primary dark:text-white" />
                  <h3 className="text-sm font-semibold mb-1 group-hover:text-primary transition-colors text-foreground">
                    {category.name}
                  </h3>
                  <p className="text-muted-foreground text-xs mb-3 flex-grow group-hover:text-primary/80 transition-colors">
                    {category.description}
                  </p>
                  <div className="w-full text-primary group-hover:text-white transition-all duration-300 flex items-center justify-center">
                    <span className="text-xs font-semibold">Voir</span>
                    <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
