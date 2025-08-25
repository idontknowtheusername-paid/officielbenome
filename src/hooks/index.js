// Hooks principaux
export { useAuth } from '@/contexts/AuthContext';
export { useListings } from './useListings';
export { useFavorites } from './useFavorites';
export { 
  useConversations, 
  useConversationMessages, 
  useSendMessage, 
  useMarkMessagesAsRead, 
  useCreateConversation, 
  useDeleteConversation, 
  useDeleteMessage, 
  useSearchConversations, 
  useMessageStats, 
  useRealtimeMessages 
} from './useMessages';
export { useNotifications } from './useNotifications';
export { default as useAdminDashboard } from './useAdminDashboard';
export { 
  useComments, 
  useUserComments, 
  useCommentsModeration 
} from './useComments';

// Hooks utilitaires
export { default as useApi } from './useApi';
export { useTabNavigation } from './useTabNavigation';
export { useImagePreloader } from './useImagePreloader';
export { 
  useIntersectionObserver, 
  useImageLazyLoading, 
  useMultiImageLazyLoading, 
  useLazyImageWithPlaceholder 
} from './useIntersectionObserver';
export { useListingImages } from './useListingImages';
export { usePreload } from './usePreload';
export { usePushNotifications } from './usePushNotifications';
export { 
  useTouchGestures, 
  useGalleryTouchGestures 
} from './useTouchGestures';

export { default as usePreferences } from './usePreferences';
export { default as useInactivityDetector } from './useInactivityDetector';
export { useHeroListings } from './useHeroListings';
