import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import CommentCard from '@/components/CommentCard';
import CommentForm from '@/components/CommentForm';
import RatingStars from '@/components/ui/RatingStars';
import {
  MessageSquare,
  Star,
  Plus,
  X,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CommentsSection = ({
  listingId,
  listing,
  className = '',
  showStats = true,
  showFilters = true
}) => {
  console.log('🔍 [CommentsSection] Rendu avec listingId:', listingId);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);


  const {
    comments,
    loading,
    error,
    pagination,
    addComment,
    updateComment,
    deleteComment,
    reportComment,
    changePage,
    refresh,
    forceRefresh
  } = useComments(listingId);
  
  console.log('🔍 [CommentsSection] État du hook:', { 
    commentsLength: comments?.length, 
    loading, 
    error,
    user: !!user,
    showForm
  });

  const handleAddComment = async (commentData) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour ajouter un commentaire.",
        variant: "destructive",
      });
      return;
    }

    const result = await addComment({
      ...commentData,
      user_id: user.id
    });

    if (result.error) {
      return result;
    }

    setShowForm(false);
    return result;
  };

  const handleUpdateComment = async (commentId, updates) => {
    const result = await updateComment(commentId, updates);
    return result;
  };

  const handleDeleteComment = async (commentId) => {
    const result = await deleteComment(commentId);
    return result;
  };

  const handleReplyComment = async (commentData) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour répondre.",
        variant: "destructive",
      });
      return { error: "Connexion requise" };
    }

    const result = await addComment({
      ...commentData,
      user_id: user.id
    });

    return result;
  };

  const handleReportComment = async (commentId, reportData) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour signaler un commentaire.",
        variant: "destructive",
      });
      return { error: "Connexion requise" };
    }

    const result = await reportComment(commentId, {
      ...reportData,
      reporter_id: user.id
    });

    return result;
  };





  if (error) {
    return (
      <Card className={cn('mt-8', className)}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">Impossible de charger les commentaires</h3>
            <p className="mb-4">Une erreur est survenue lors du chargement des commentaires.</p>
            <Button onClick={refresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold">Commentaires et Avis</h2>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              console.log('🔄 [CommentsSection] Force refresh cliqué');
              forceRefresh();
            }}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
        </div>
      </div>



      {/* Formulaire d'ajout */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Ajouter un commentaire</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CommentForm
                  listingId={listingId}
                  onSubmit={handleAddComment}
                  onCancel={() => setShowForm(false)}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Liste des commentaires dans une seule carte */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Chargement des commentaires...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">Aucun commentaire</h3>
              <p className="text-muted-foreground mb-4">
                Soyez le premier à laisser un commentaire sur cette annonce !
              </p>
              {user && (
                <Button onClick={() => {
                  console.log('🔍 [CommentsSection] Bouton Ajouter (carte vide) cliqué');
                  setShowForm(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un commentaire
                </Button>
              )}
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <div className="divide-y divide-border">
                {comments.map((comment, index) => (
                  <div key={comment.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <CommentCard
                      comment={comment}
                      onUpdate={handleUpdateComment}
                      onDelete={handleDeleteComment}
                      onReply={handleReplyComment}
                      onReport={handleReportComment}
                      className="border-0 p-0 shadow-none"
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center space-x-2 p-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changePage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    Précédent
                  </Button>

                  <span className="text-sm text-muted-foreground">
                    Page {pagination.page} sur {pagination.pages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changePage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommentsSection;
