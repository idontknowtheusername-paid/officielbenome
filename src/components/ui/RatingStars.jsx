import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const RatingStars = ({ 
  rating = 0, 
  onRatingChange, 
  readonly = false, 
  size = 'md',
  showLabel = false,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6'
  };

  const handleMouseEnter = (starValue) => {
    if (!readonly) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const handleClick = (starValue) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const getStarColor = (starValue) => {
    const currentRating = hoverRating || rating;
    return starValue <= currentRating ? 'text-yellow-400 fill-current' : 'text-gray-300';
  };

  const getLabel = (rating) => {
    const labels = {
      0: 'Aucune note',
      1: 'Très mauvais',
      2: 'Mauvais',
      3: 'Moyen',
      4: 'Bon',
      5: 'Excellent'
    };
    return labels[rating] || 'Aucune note';
  };

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={cn(
              'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 rounded-sm',
              sizes[size],
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
              getStarColor(star)
            )}
            aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
          >
            <Star className="w-full h-full" />
          </button>
        ))}
      </div>
      
      {showLabel && (
        <span className="text-sm text-muted-foreground ml-2">
          {getLabel(rating)}
        </span>
      )}
      
      {!readonly && (
        <span className="text-xs text-muted-foreground ml-2">
          {rating > 0 ? `${rating}/5` : 'Cliquez pour noter'}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
