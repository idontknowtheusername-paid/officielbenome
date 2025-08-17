import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const PremiumBadge = ({ 
  type = 'premium', 
  size = 'default',
  className = '',
  showIcon = true 
}) => {
  const getBadgeConfig = (type) => {
    switch (type) {
      case 'premium':
        return {
          icon: '⭐',
          text: 'Premium',
          className: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-amber-600 shadow-lg',
          iconClassName: 'text-yellow-200'
        };
      case 'boosted':
        return {
          icon: '🚀',
          text: 'Boosté',
          className: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-600 shadow-lg',
          iconClassName: 'text-blue-200'
        };
      case 'featured':
        return {
          icon: '💎',
          text: 'Featured',
          className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600 shadow-lg',
          iconClassName: 'text-purple-200'
        };
      default:
        return {
          icon: '⭐',
          text: 'Premium',
          className: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-amber-600 shadow-lg',
          iconClassName: 'text-yellow-200'
        };
    }
  };

  const getSizeClasses = (size) => {
    switch (size) {
      case 'small':
        return 'text-xs px-2 py-1';
      case 'large':
        return 'text-sm px-4 py-2';
      default:
        return 'text-xs px-3 py-1.5';
    }
  };

  const config = getBadgeConfig(type);
  const sizeClasses = getSizeClasses(size);

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        'font-semibold border-2 shadow-md transition-all duration-200 hover:scale-105',
        config.className,
        sizeClasses,
        className
      )}
    >
      {showIcon && (
        <span className={cn('mr-1.5', config.iconClassName)}>
          {config.icon}
        </span>
      )}
      {config.text}
    </Badge>
  );
};

export default PremiumBadge;
