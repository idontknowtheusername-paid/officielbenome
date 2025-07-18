import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * LoadingSpinner component
 * @param {Object} props - Component props
 * @param {string} [props.size='md'] - Size of the spinner (sm, md, lg, xl)
 * @param {string} [props.color='primary'] - Color of the spinner
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.text] - Optional text to display below the spinner
 * @param {boolean} [props.fullScreen=false] - Whether to cover the full screen
 * @param {boolean} [props.overlay=false] - Whether to show a semi-transparent overlay
 * @param {string} [props.overlayColor='bg-background/80'] - Custom overlay color
 * @returns {JSX.Element} LoadingSpinner component
 */
const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  className,
  text,
  fullScreen = false,
  overlay = false,
  overlayColor = 'bg-background/80',
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    success: 'text-green-500',
    danger: 'text-destructive',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
    muted: 'text-muted-foreground',
    white: 'text-white',
  };

  const spinner = (
    <div 
      className={cn(
        'flex flex-col items-center justify-center',
        fullScreen ? 'h-screen w-screen' : 'h-full w-full',
        className
      )}
      {...props}
    >
      <Loader2 
        className={cn(
          'animate-spin',
          sizeClasses[size] || sizeClasses.md,
          colorClasses[color] || colorClasses.primary
        )} 
      />
      {text && (
        <p className={cn(
          'mt-2 text-sm',
          color === 'white' ? 'text-white' : 'text-muted-foreground'
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        overlayColor
      )}>
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
