import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Flag, AlertTriangle, X, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { reportService } from '@/services';

const ReportModal = ({ isOpen, onClose, listing, onReportSubmitted }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const reportReasons = [
    { value: 'inappropriate_content', label: 'Contenu inapproprié', description: 'Contenu offensant, violent ou choquant' },
    { value: 'fake_listing', label: 'Annonce fausse', description: 'Produit/service inexistant ou trompeur' },
    { value: 'spam', label: 'Spam', description: 'Annonce répétitive ou non pertinente' },
    { value: 'scam', label: 'Arnaque', description: 'Tentative de fraude ou d\'escroquerie' },
    { value: 'copyright', label: 'Violation de droits', description: 'Contenu protégé par des droits d\'auteur' },
    { value: 'other', label: 'Autre', description: 'Autre raison non listée' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Faible', color: 'bg-blue-100 text-blue-800' },
    { value: 'medium', label: 'Moyen', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'Élevé', color: 'bg-red-100 text-red-800' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une raison de signalement.",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez décrire le problème.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reportData = {
        listing_id: listing.id,
        type: 'listing',
        reason: reason,
        description: description.trim(),
        severity: severity,
        status: 'pending'
      };

      await reportService.createReport(reportData);

      toast({
        title: "Signalement envoyé",
        description: "Votre signalement a été enregistré et sera examiné par notre équipe.",
      });

      // Réinitialiser le formulaire
      setReason('');
      setDescription('');
      setSeverity('medium');

      // Fermer le modal
      onClose();

      // Notifier le composant parent
      if (onReportSubmitted) {
        onReportSubmitted();
      }

    } catch (error) {
      console.error('Erreur lors du signalement:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le signalement. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <Flag className="h-5 w-5 text-red-500" />
            <div>
              <CardTitle>Signaler cette annonce</CardTitle>
              <CardDescription>
                Aidez-nous à maintenir la qualité de notre plateforme
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Informations sur l'annonce signalée */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Annonce signalée :</h4>
            <div className="flex items-start space-x-3">
              {listing.images && listing.images[0] && (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div className="flex-1 min-w-0">
                <h5 className="font-medium truncate">{listing.title}</h5>
                <p className="text-sm text-muted-foreground">
                  Publiée le {new Date(listing.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Catégorie : {listing.category}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Raison du signalement */}
            <div className="space-y-2">
              <Label htmlFor="reason">Raison du signalement *</Label>
              <Select value={reason} onValueChange={setReason} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une raison" />
                </SelectTrigger>
                <SelectContent>
                  {reportReasons.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{r.label}</span>
                        <span className="text-xs text-muted-foreground">{r.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Niveau de gravité */}
            <div className="space-y-2">
              <Label htmlFor="severity">Niveau de gravité</Label>
              <Select value={severity} onValueChange={setSeverity} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {severityLevels.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <Badge className={s.color} variant="secondary">
                        {s.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description détaillée */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description détaillée du problème *
                <span className="text-sm text-muted-foreground ml-2">
                  (minimum 20 caractères)
                </span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez en détail le problème que vous avez identifié..."
                rows={4}
                disabled={isSubmitting}
                minLength={20}
                required
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/500 caractères
              </p>
            </div>

            {/* Avertissement */}
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium">Important :</p>
                  <p>Les signalements abusifs peuvent entraîner la suspension de votre compte. 
                  Assurez-vous que votre signalement est justifié et basé sur des faits.</p>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !reason || description.length < 20}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer le signalement
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportModal; 