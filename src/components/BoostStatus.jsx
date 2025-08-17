import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  BarChart3,
  Star,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { boostService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const BoostStatus = ({ 
  listingId, 
  listing, 
  size = 'default',
  showActions = true,
  className = '' 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [boostStatus, setBoostStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (listingId && user) {
      loadBoostStatus();
    }
  }, [listingId, user]);

  const loadBoostStatus = async () => {
    try {
      setLoading(true);
      const data = await boostService.getBoostStatus(listingId);
      setBoostStatus(data);
    } catch (error) {
      console.error('Erreur chargement statut boost:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenewBoost = async () => {
    if (!boostStatus?.currentBoost) return;

    try {
      setActionLoading(true);
      const result = await boostService.renewBoost(boostStatus.currentBoost.id, user.id);
      
      if (result.success) {
        toast({
          title: 'Boost renouvelé !',
          description: 'Votre boost a été prolongé avec succès.',
        });
        
        // Recharger le statut
        loadBoostStatus();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors du renouvellement',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBoost = async () => {
    if (!boostStatus?.currentBoost) return;

    if (!confirm('Êtes-vous sûr de vouloir annuler ce boost ?')) return;

    try {
      setActionLoading(true);
      const result = await boostService.cancelBoost(boostStatus.currentBoost.id, user.id);
      
      if (result.success) {
        toast({
          title: 'Boost annulé',
          description: 'Votre boost a été annulé avec succès.',
        });
        
        // Recharger le statut
        loadBoostStatus();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de l\'annulation',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusConfig = () => {
    if (!boostStatus?.hasActiveBoost) {
      return {
        icon: <Zap className="h-4 w-4" />,
        label: 'Non boosté',
        color: 'secondary',
        description: 'Aucun boost actif'
      };
    }

    const boost = boostStatus.currentBoost;
    const now = new Date();
    const endDate = new Date(boost.end_date);
    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
      return {
        icon: <Clock className="h-4 w-4" />,
        label: 'Expiré',
        color: 'secondary',
        description: 'Boost expiré'
      };
    }

    if (daysRemaining <= 3) {
      return {
        icon: <Clock className="h-4 w-4" />,
        label: `${daysRemaining}j restant${daysRemaining > 1 ? 's' : ''}`,
        color: 'destructive',
        description: 'Boost expire bientôt'
      };
    }

    if (daysRemaining <= 7) {
      return {
        icon: <TrendingUp className="h-4 w-4" />,
        label: `${daysRemaining}j restant${daysRemaining > 1 ? 's' : ''}`,
        color: 'default',
        description: 'Boost actif'
      };
    }

    return {
      icon: <CheckCircle className="h-4 w-4" />,
      label: `${daysRemaining}j restant${daysRemaining > 1 ? 's' : ''}`,
      color: 'default',
      description: 'Boost actif'
    };
  };

  const getSizeClasses = (size) => {
    switch (size) {
      case 'small':
        return 'text-xs px-2 py-1';
      case 'large':
        return 'text-sm px-3 py-1.5';
      default:
        return 'text-xs px-2.5 py-1';
    }
  };

  const getIconSize = (size) => {
    switch (size) {
      case 'small':
        return 'h-3 w-3';
      case 'large':
        return 'h-5 w-5';
      default:
        return 'h-4 w-4';
    }
  };

  const statusConfig = getStatusConfig();
  const sizeClasses = getSizeClasses(size);
  const iconSize = getIconSize(size);

  // Si pas d'utilisateur connecté ou pas d'annonce, ne rien afficher
  if (!user || !listing) {
    return null;
  }

  // Si l'utilisateur ne possède pas l'annonce, ne rien afficher
  if (user.id !== listing.user_id) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Badge de statut */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={statusConfig.color} 
              className={`${sizeClasses} cursor-help transition-all duration-200 hover:scale-105`}
            >
              <div className="flex items-center gap-1">
                {statusConfig.icon}
                <span className="hidden sm:inline">{statusConfig.label}</span>
              </div>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{statusConfig.description}</p>
            {boostStatus?.hasActiveBoost && boostStatus.currentBoost && (
              <p className="text-xs text-muted-foreground mt-1">
                Package: {boostStatus.currentBoost.boost_packages?.name}
              </p>
            )}
          </TooltipContent>
        </Tooltip>

        {/* Actions rapides */}
        {showActions && boostStatus?.hasActiveBoost && boostStatus.currentBoost && (
          <div className="flex items-center gap-1">
            {/* Bouton renouveler */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleRenewBoost}
                  disabled={actionLoading}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-primary/10"
                >
                  <RefreshCw className={`${iconSize} text-primary`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Renouveler le boost</p>
              </TooltipContent>
            </Tooltip>

            {/* Bouton annuler */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleCancelBoost}
                  disabled={actionLoading}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-destructive/10"
                >
                  <XCircle className={`${iconSize} text-destructive`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Annuler le boost</p>
              </TooltipContent>
            </Tooltip>

            {/* Bouton analytics */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => navigate(`/booster-annonce/${listingId}`)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-blue-500/10"
                >
                  <BarChart3 className={`${iconSize} text-blue-500`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Voir les détails et analytics</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Bouton booster si pas de boost actif */}
        {showActions && !boostStatus?.hasActiveBoost && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => navigate(`/booster-annonce/${listingId}`)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-primary/10"
              >
                <TrendingUp className={`${iconSize} text-primary`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Booster cette annonce</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Indicateur de chargement */}
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full"
          />
        )}

        {/* Indicateur d'action en cours */}
        {actionLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full"
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default BoostStatus;
