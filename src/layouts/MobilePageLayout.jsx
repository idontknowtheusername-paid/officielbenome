import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileHeader = ({ title, showBack = false, rightAction }) => {
  const navigate = useNavigate();
  
  return (
    <div className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 pt-[env(safe-area-inset-top)] transition-all">
      <div className="h-14 px-4 flex items-center justify-between">
        
        {/* Zone Gauche (Retour ou Vide) */}
        <div className="w-10 flex-shrink-0">
          {showBack && (
            <button 
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800 dark:text-white" />
            </button>
          )}
        </div>

        {/* Titre Centré (Style App Native) */}
        <h1 className="flex-1 text-center font-semibold text-base truncate text-gray-900 dark:text-white">
          {title || 'MaxiMarket'}
        </h1>

        {/* Zone Droite (Actions) */}
        <div className="w-10 flex flex-col items-end justify-center flex-shrink-0">
          {rightAction || (
            <button className="relative p-2 -mr-2">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* Wrapper principal pour les pages mobiles */
const MobilePageLayout = ({ children, title, showBack = false, className }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header App */}
      <MobileHeader title={title} showBack={showBack} />
      
      {/* Contenu avec Padding Bottom pour la BottomNav & Safe Area */}
      <main className={cn(
        "pb-[calc(80px+env(safe-area-inset-bottom))] px-4 pt-4", 
        className
      )}>
        {children}
      </main>
    </div>
  );
};

export default MobilePageLayout;