import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, AlertTriangle } from 'lucide-react';

export const IdleWarningModal = ({ open, timeLeft, onContinue }) => {
  // Formater le temps restant
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <AlertDialogTitle className="text-xl">
              Session inactive
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-3">
            <p>
              Vous allez être déconnecté dans <strong className="text-orange-600 font-semibold">{formatTime(timeLeft)}</strong> en raison d'une inactivité prolongée.
            </p>
            <p className="text-sm text-gray-600">
              Cliquez sur "Rester connecté" pour continuer votre session.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            Cette mesure de sécurité protège votre compte contre les accès non autorisés.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogAction
            onClick={onContinue}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Rester connecté
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
