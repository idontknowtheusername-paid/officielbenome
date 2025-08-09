// Export all custom hooks for easier imports
// Example: import { useApi, useAdminDashboard } from '@/hooks';

// Core hooks
export { default as useApi } from './useApi';
export { default as useAdminDashboard } from './useAdminDashboard';
export { default as useAuth } from './useAuth';
export { default as useListings } from './useListings';
export { default as useMessages } from './useMessages';
export { default as useNotifications } from './useNotifications';
export { default as usePreload } from './usePreload';
export { default as useTabNavigation } from './useTabNavigation';

// Image gallery hook
export { useListingImages } from './useListingImages';

// Image optimization hooks
export { useImagePreloader } from './useImagePreloader';
export { useIntersectionObserver, useImageLazyLoading, useMultiImageLazyLoading, useLazyImageWithPlaceholder } from './useIntersectionObserver';
export { useTouchGestures, useGalleryTouchGestures } from './useTouchGestures';

// Auth context (alternative import)
export { useAuth as useAuthContext } from '../contexts/AuthContext';

// Data fetching hooks from React Query
export { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// This file serves as a central export point for all custom hooks
// Import and export any additional hooks you create in the future
