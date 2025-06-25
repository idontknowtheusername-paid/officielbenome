// Export all custom hooks for easier imports
// Example: import { useApi, useAdminDashboard } from '@/hooks';

export { default as useApi } from './useApi';
export { default as useAdminDashboard } from './useAdminDashboard';

// Utility hooks
export { default as useDebounce } from './useDebounce';
export { default as useLocalStorage } from './useLocalStorage';
export { default as useSessionStorage } from './useSessionStorage';
export { default as useMediaQuery } from './useMediaQuery';
export { default as useOnClickOutside } from './useOnClickOutside';
export { default as useWindowSize } from './useWindowSize';

// Auth hooks
export { useAuth } from '../contexts/AuthContext';

// Form hooks
export { default as useForm } from './useForm';

export * from './use-toast';

// UI hooks
export { default as useTheme } from './useTheme';
export { default as useToast } from './useToast';

// Data fetching hooks
export { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Export any additional hooks you create in the future
// export * from './your-custom-hook';

// This file serves as a central export point for all custom hooks
// Import and export any additional hooks you create in the future
