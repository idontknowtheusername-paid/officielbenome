import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const RefreshButton = ({ 
  onRefresh, 
  loading = false, 
  className = '',
  size = 'sm',
  variant = 'outline',
  children = 'Actualiser'
}) => {
  return (
    <Button
      onClick={onRefresh}
      disabled={loading}
      size={size}
      variant={variant}
      className={cn(
        'transition-all duration-200',
        loading && 'animate-pulse',
        className
      )}
    >
      <RefreshCw 
        className={cn(
          'h-4 w-4 mr-2',
          loading && 'animate-spin'
        )} 
      />
      {children}
    </Button>
  );
};

export default RefreshButton;
