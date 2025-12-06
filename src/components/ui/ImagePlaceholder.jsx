import React from 'react';
import { cn } from '@/lib/utils';
import { ShoppingBag, Image as ImageIcon } from 'lucide-react'; 

/**
 * Placeholder optimisé : S'affiche instantanément (pas de requête image)
 * Remplit automatiquement son conteneur parent.
 */
const ImagePlaceholder = ({ 
  className = '', 
  iconSize = 'medium', // 'small', 'medium', 'large'
  showText = false,
  text = 'MaxiMarket',
  animate = true,
  variant = 'logo' // 'logo' (sac) ou 'image' (icone photo)
}) => {
  
  // Taille des icônes
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  // Choix de l'icône (Plus léger qu'une image PNG)
  const Icon = variant === 'logo' ? ShoppingBag : ImageIcon;

  return (
    <div 
      className={cn(
        // w-full h-full force le placeholder à remplir le cadre de l'image absente
        "w-full h-full min-h-[100px]", 
        "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900",
        "flex flex-col items-center justify-center text-muted-foreground/50",
        className
      )}
    >
      <div className={cn("relative flex items-center justify-center", animate && "animate-pulse")}>
        <Icon 
          className={cn(
            sizeClasses[iconSize],
            "text-primary/20 dark:text-primary/40" // Couleur subtile aux tons de ta marque
          )} 
          strokeWidth={1.5}
        />
        
        {/* Petit détail pour faire "Logo Marketplace" si on utilise le sac */}
        {variant === 'logo' && (
           <span className="absolute text-[10px] font-bold text-primary/40 mt-1">M</span>
        )}
      </div>

      {showText && (
        <span className="text-xs font-medium text-muted-foreground/60 mt-2">
          {text}
        </span>
      )}
    </div>
  );
};

export default ImagePlaceholder;