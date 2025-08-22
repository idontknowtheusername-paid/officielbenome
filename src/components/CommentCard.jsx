import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import RatingStars from '@/components/ui/RatingStars';
import CommentForm from '@/components/CommentForm';
import {
  MoreHorizontal,
  Reply,
  Edit,
  Trash2,
  Flag,
  CheckCircle,
  Clock,
  User,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn, formatDate } from '@/lib/utils';

const CommentCard = ({
  comment,
  onUpdate,
  onDelete,
  onReply,
  onReport,
  showReplies = true,
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showRepliesList, setShowRepliesList] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);

  const isOwner = user?.id === comment.user_id;
  const isAdmin = user?.role === 'admin';
  const canModify = isOwner || isAdmin;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    try {
      const result = await onDelete(comment.id);
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Commentaire supprimé",
        description: "Votre commentaire a été supprimé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le commentaire.",
        variant: "destructive",
      });
    }
  };

  const handleReply = () => {
    setIsReplying(true);
  };

  const handleReport = async () => {
    try {
      const result = await onReport(comment.id, {
        reason: 'inappropriate',
        description: 'Commentaire signalé par l\'utilisateur'
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Commentaire signalé",
        description: "Le commentaire a été signalé aux modérateurs.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de signaler le commentaire.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSuccess = (updatedComment) => {
    setIsEditing(false);
    if (onUpdate) {
      onUpdate(updatedComment);
    }
  };

  const handleReplySuccess = (newReply) => {
    setIsReplying(false);
    setReplies(prev => [newReply, ...prev]);
    if (onReply) {
      onReply(newReply);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approuvé
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
            <Flag className="h-3 w-3 mr-1" />
            Rejeté
          </Badge>
        );
      default:
        return null;
    }
  };

  const getUserInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  if (isEditing) {
    return (
      <div className={cn('border rounded-lg p-4 bg-muted/30', className)}>
        <CommentForm
          listingId={comment.listing_id}
          onSubmit={async (data) => {
            try {
              const result = await onUpdate(comment.id, data);
              if (result.error) throw new Error(result.error);
              handleUpdateSuccess(result.comment);
              return result;
            } catch (error) {
              return { error: error.message };
            }
          }}
          onCancel={() => setIsEditing(false)}
          initialData={comment}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('border rounded-lg p-4 hover:shadow-md transition-shadow', className)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getUserInitials(comment.user_id || 'U')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-sm">
                Utilisateur {comment.user_id?.slice(0, 8)}...
              </h4>

              {comment.is_verified_purchase && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Achat vérifié
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>{formatDate(comment.created_at)}</span>
              {comment.updated_at !== comment.created_at && (
                <span>(modifié)</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleReply}>
              <Reply className="h-4 w-4 mr-2" />
              Répondre
            </DropdownMenuItem>

            {canModify && (
              <>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </>
            )}

            {!isOwner && (
              <DropdownMenuItem onClick={handleReport}>
                <Flag className="h-4 w-4 mr-2" />
                Signaler
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status Badge */}
      {comment.status !== 'approved' && (
        <div className="mb-3">
          {getStatusBadge(comment.status)}
        </div>
      )}

      {/* Rating */}
      <div className="mb-3">
        <RatingStars rating={comment.rating} readonly size="sm" />
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-sm whitespace-pre-wrap leading-relaxed">
          {comment.content}
        </p>
      </div>

      {/* Actions Footer */}
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          {comment.likes_count > 0 && (
            <span>{comment.likes_count} j'aime</span>
          )}

          {comment.replies_count > 0 && (
            <button
              onClick={() => setShowRepliesList(!showRepliesList)}
              className="flex items-center space-x-1 hover:text-foreground transition-colors"
            >
              <MessageSquare className="h-3 w-3" />
              <span>{comment.replies_count} réponse{comment.replies_count > 1 ? 's' : ''}</span>
            </button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleReply}
          className="text-xs"
        >
          <Reply className="h-3 w-3 mr-1" />
          Répondre
        </Button>
      </div>

      {/* Reply Form */}
      {isReplying && (
        <div className="mt-4 pt-4 border-t">
          <CommentForm
            listingId={comment.listing_id}
            onSubmit={async (data) => {
              try {
                const result = await onReply(data);
                if (result.error) throw new Error(result.error);
                handleReplySuccess(result.comment);
                return result;
              } catch (error) {
                return { error: error.message };
              }
            }}
            onCancel={() => setIsReplying(false)}
            parentId={comment.id}
          />
        </div>
      )}

      {/* Replies List */}
      {showReplies && comment.replies_count > 0 && showRepliesList && (
        <div className="mt-4 pt-4 border-t space-y-3">
          <h5 className="text-sm font-medium text-muted-foreground">
            Réponses ({comment.replies_count})
          </h5>

          {replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onReply={onReply}
              onReport={onReport}
              showReplies={false}
              className="ml-4 border-l-2 border-muted pl-4"
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default CommentCard;
