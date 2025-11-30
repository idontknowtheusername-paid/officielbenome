import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import RatingStars from '@/components/ui/RatingStars';
import { Send, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Schéma de validation - commentaire et rating optionnels
const commentSchema = z.object({
  content: z.string()
    .max(1000, 'Le commentaire ne peut pas dépasser 1000 caractères')
    .optional(),
  parent_id: z.string().uuid().optional()
}).refine(
  (data) => data.content && data.content.trim().length > 0,
  { message: 'Le commentaire ne peut pas être vide', path: ['content'] }
);

const CommentForm = ({
  listingId,
  onSubmit,
  onCancel,
  initialData = null,
  parentId = null,
  className = ''
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(initialData?.rating || 0);


  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset
  } = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: initialData?.content || '',
      parent_id: parentId || initialData?.parent_id
    },
    mode: 'onChange'
  });

  const content = watch('content');
  const isEditing = !!initialData;

  const handleFormSubmit = async (data) => {
    // Validation : au moins un commentaire OU un avis
    if (!data.content?.trim() && !rating) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter un commentaire et/ou une note.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const commentData = {
        ...data,
        rating: rating || null,
        listing_id: listingId,
        parent_id: parentId || initialData?.parent_id
      };

      const result = await onSubmit(commentData);

      if (result.error) {
        throw new Error(result.error);
      }

      const hasComment = data.content?.trim();
      const hasRating = rating > 0;

      let successMessage = '';
      if (hasComment && hasRating) {
        successMessage = 'Votre commentaire et votre avis ont été ajoutés avec succès.';
      } else if (hasComment) {
        successMessage = 'Votre commentaire a été ajouté avec succès.';
      } else {
        successMessage = 'Votre avis a été ajouté avec succès.';
      }

      toast({
        title: isEditing ? "Modifié" : "Ajouté",
        description: successMessage,
      });

      if (!isEditing) {
        reset();
        setRating(0);
      }

      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const getCharacterCount = () => {
    return content?.length || 0;
  };

  const getCharacterCountColor = () => {
    const count = getCharacterCount();
    if (count === 0) return 'text-red-500';
    if (count > 900) return 'text-orange-500';
    return 'text-muted-foreground';
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {isEditing ? 'Modifier le commentaire' : 'Ajouter un commentaire'}
        </h3>

        {parentId && (
          <Badge variant="secondary" className="text-xs">
            Réponse
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {console.log('🔍 [CommentForm] Rendu du formulaire, isValid:', isValid, 'errors:', errors)}
        {console.log('🔍 [CommentForm] VERSION DE TEST - 2024-08-21-15h30')}
        {/* Note */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Votre note (optionnelle)
          </label>
          <RatingStars
            rating={rating}
            onRatingChange={handleRatingChange}
            size="lg"
            showLabel={true}
          />

        </div>

        {/* Contenu */}
        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium">
            Votre commentaire *
          </label>
          <Textarea
            id="content"
            {...register('content')}
            placeholder={isEditing
              ? "Modifiez votre commentaire..."
              : "Partagez votre expérience avec cette annonce..."
            }
            className={cn(
              'min-h-[120px] resize-none',
              errors.content && 'border-red-500 focus:border-red-500'
            )}
            maxLength={1000}
          />

          {/* Compteur de caractères */}
          <div className="flex items-center justify-between text-xs">
            <span className={getCharacterCountColor()}>
              {getCharacterCount()}/1000 caractères
            </span>
          </div>

          {errors.content && (
            <p className="text-sm text-red-500 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.content.message}
            </p>
          )}
        </div>



        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !content?.trim()}
            className="flex items-center space-x-2"
            onClick={(e) => {
              e.preventDefault();
              console.log('🔍 [CommentForm] Bouton cliqué - validation manuelle');
              console.log('🔍 [CommentForm] État:', { rating, content: content?.trim(), isSubmitting });
              if (content?.trim() && !isSubmitting) {
                handleSubmit(handleFormSubmit)();
              }
            }}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Envoi...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>{isEditing ? 'Modifier' : 'Publier'}</span>
              </>
            )}
          </Button>
        </div>
      </form>


    </div>
  );
};

export default CommentForm;
