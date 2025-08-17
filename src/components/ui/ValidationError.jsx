import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Composant d'affichage des erreurs de validation
 */
export const ValidationError = ({ 
  error, 
  className = "",
  showIcon = true,
  variant = "default" 
}) => {
  if (!error) return null;

  const variants = {
    default: "text-red-600 bg-red-50 border-red-200",
    destructive: "text-red-700 bg-red-100 border-red-300",
    warning: "text-yellow-700 bg-yellow-100 border-yellow-300"
  };

  return (
    <div className={cn(
      "flex items-start gap-2 p-2 text-sm border rounded-md",
      variants[variant],
      className
    )}>
      {showIcon && (
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      )}
      <span className="leading-relaxed">{error}</span>
    </div>
  );
};

/**
 * Composant d'affichage des erreurs de validation pour les champs de formulaire
 */
export const FieldValidationError = ({ 
  error, 
  className = "",
  showIcon = true 
}) => {
  if (!error) return null;

  return (
    <div className={cn(
      "flex items-start gap-1.5 text-xs text-red-600 mt-1",
      className
    )}>
      {showIcon && (
        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
      )}
      <span className="leading-relaxed">{error}</span>
    </div>
  );
};

/**
 * Composant d'affichage des erreurs de validation multiples
 */
export const ValidationErrors = ({ 
  errors, 
  className = "",
  showIcon = true,
  variant = "default" 
}) => {
  if (!errors || Object.keys(errors).length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {Object.entries(errors).map(([field, error]) => (
        <ValidationError
          key={field}
          error={error}
          showIcon={showIcon}
          variant={variant}
        />
      ))}
    </div>
  );
};

/**
 * Hook pour gérer les erreurs de validation par champ
 */
export const useValidationErrors = (errors = {}) => {
  const getFieldError = (fieldName) => {
    return errors[fieldName] || null;
  };

  const hasFieldError = (fieldName) => {
    return !!errors[fieldName];
  };

  const hasAnyErrors = () => {
    return Object.keys(errors).length > 0;
  };

  const clearFieldError = (fieldName, setErrors) => {
    if (setErrors && errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const clearAllErrors = (setErrors) => {
    if (setErrors) {
      setErrors({});
    }
  };

  return {
    getFieldError,
    hasFieldError,
    hasAnyErrors,
    clearFieldError,
    clearAllErrors
  };
};
