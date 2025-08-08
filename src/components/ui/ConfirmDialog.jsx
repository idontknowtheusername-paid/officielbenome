import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, Edit, RefreshCw, Star } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "destructive",
  icon: Icon = AlertTriangle,
  isLoading = false
}) => {
  const getIconColor = () => {
    switch (variant) {
      case "destructive":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      case "info":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case "destructive":
        return "destructive";
      case "warning":
        return "secondary";
      case "info":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-3">
            <Icon className={`h-6 w-6 ${getIconColor()}`} />
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <Button
            variant={getButtonVariant()}
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            )}
            <span>{confirmText}</span>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Composants spécialisés pour des actions courantes
export const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, itemName, isLoading }) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Confirmer la suppression"
    description={`Êtes-vous sûr de vouloir supprimer "${itemName}" ? Cette action est irréversible.`}
    confirmText="Supprimer"
    variant="destructive"
    icon={Trash2}
    isLoading={isLoading}
  />
);

export const EditConfirmDialog = ({ isOpen, onClose, onConfirm, itemName, isLoading }) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Modifier l'élément"
    description={`Voulez-vous modifier "${itemName}" ?`}
    confirmText="Modifier"
    variant="info"
    icon={Edit}
    isLoading={isLoading}
  />
);

export const RefreshConfirmDialog = ({ isOpen, onClose, onConfirm, itemName, isLoading }) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Actualiser l'élément"
    description={`Voulez-vous actualiser "${itemName}" ? Cela remettra l'élément en haut de la liste.`}
    confirmText="Actualiser"
    variant="info"
    icon={RefreshCw}
    isLoading={isLoading}
  />
);

export const BoostConfirmDialog = ({ isOpen, onClose, onConfirm, itemName, isLoading }) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Booster l'élément"
    description={`Voulez-vous booster "${itemName}" ? Cela augmentera sa visibilité.`}
    confirmText="Booster"
    variant="warning"
    icon={Star}
    isLoading={isLoading}
  />
);

export default ConfirmDialog; 