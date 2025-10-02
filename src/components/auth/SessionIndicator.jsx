import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Indicateur de session professionnel
 * Affiche le statut de la session de manière discrète
 */
const SessionIndicator = ({ className }) => {
  const { session, isRememberMe, getSessionStatus, getSessionTimeLeft } = useAuth();
  const [timeLeft, setTimeLeft] = useState(0);
  const [status, setStatus] = useState('disconnected');

  useEffect(() => {
    if (!session) return;

    const updateStatus = () => {
      setStatus(getSessionStatus());
      setTimeLeft(getSessionTimeLeft());
    };

    updateStatus();
    
    // Mettre à jour toutes les minutes
    const interval = setInterval(updateStatus, 60000);
    
    return () => clearInterval(interval);
  }, [session, getSessionStatus, getSessionTimeLeft]);

  if (!session) return null;

  const formatTimeLeft = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'remembered':
        return {
          icon: Shield,
          color: 'text-green-600',
          bg: 'bg-green-50',
          text: 'Session persistante',
          tooltip: 'Connexion mémorisée pendant 30 jours'
        };
      case 'active':
        return {
          icon: CheckCircle2,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          text: 'Session active',
          tooltip: `Expire dans ${formatTimeLeft(timeLeft)}`
        };
      case 'expiring_soon':
        return {
          icon: Clock,
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          text: 'Session expire bientôt',
          tooltip: `Expire dans ${formatTimeLeft(timeLeft)}`
        };
      case 'expired':
        return {
          icon: Clock,
          color: 'text-red-600',
          bg: 'bg-red-50',
          text: 'Session expirée',
          tooltip: 'Veuillez vous reconnecter'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium",
        config.bg,
        config.color,
        className
      )}
      title={config.tooltip}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden md:inline">{config.text}</span>
    </div>
  );
};

export default SessionIndicator;
