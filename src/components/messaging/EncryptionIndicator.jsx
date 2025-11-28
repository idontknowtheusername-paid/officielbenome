import React from 'react';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// import { encryptionService } from '@/services'; // Désactivé temporairement
import { MESSAGING_CONFIG } from '@/config/messaging';

/**
 * Indicateur de statut d'encryption pour les conversations
 * TEMPORAIREMENT DÉSACTIVÉ - Encryption en cours de correction
 */
const EncryptionIndicator = ({ conversationId, variant = 'badge' }) => {
  const isEncryptionEnabled = false; // MESSAGING_CONFIG.SECURITY.ENABLE_ENCRYPTION;
  const isSupported = false; // encryptionService.isSupported();
  const isActive = false; // isEncryptionEnabled && isSupported;

  // Variante inline (petit icône)
  if (variant === 'inline') {
    if (!isActive) return null;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Shield className="h-3 w-3 text-green-600" />
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">🔐 Conversation chiffrée</p>
              <p className="text-xs">Vos messages sont protégés par chiffrement end-to-end</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Variante badge (par défaut)
  if (!isActive) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="text-xs gap-1">
              <AlertTriangle className="h-3 w-3" />
              Non chiffré
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              {!isSupported 
                ? 'Encryption non supportée par votre navigateur'
                : 'Encryption désactivée'
              }
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 text-xs gap-1">
            <Lock className="h-3 w-3" />
            Chiffré E2E
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">🔐 Chiffrement End-to-End actif</p>
            <p className="text-xs">Vos messages sont chiffrés localement</p>
            <p className="text-xs text-muted-foreground">
              Algorithme: AES-256-GCM
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EncryptionIndicator;
