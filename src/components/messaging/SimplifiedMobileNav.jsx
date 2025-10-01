import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  Menu, 
  Search, 
  Filter, 
  MoreVertical,
  Phone,
  Video,
  User,
  Home
} from 'lucide-react';

/**
 * Navigation mobile simplifiée pour la messagerie
 * Logique centralisée et interface claire
 */
const SimplifiedMobileNav = memo(({
  // Props simplifiées (2-3 au lieu de 8+)
  view, // 'list' | 'conversation'
  onNavigateBack,
  onToggleMenu,
  onToggleSearch,
  onToggleFilter,
  onToggleMore,
  onCall,
  onVideo,
  unreadCount = 0,
  conversationTitle = '',
  participantName = ''
}) => {
  // ========================================
  // RENDER CONDITIONS - Logique claire
  // ========================================
  
  if (view === 'conversation') {
    return (
      <ConversationHeader
        onNavigateBack={onNavigateBack}
        onCall={onCall}
        onVideo={onVideo}
        onToggleMore={onToggleMore}
        conversationTitle={conversationTitle}
        participantName={participantName}
      />
    );
  }
  
  return (
    <ListHeader
      onToggleMenu={onToggleMenu}
      onToggleSearch={onToggleSearch}
      onToggleFilter={onToggleFilter}
      onToggleMore={onToggleMore}
      unreadCount={unreadCount}
    />
  );
});

// ========================================
// COMPOSANTS INTERNES - Séparation claire
// ========================================

// Header pour la liste des conversations
const ListHeader = memo(({
  onToggleMenu,
  onToggleSearch,
  onToggleFilter,
  onToggleMore,
  unreadCount
}) => (
  <div className="messaging-header-mobile">
    <div className="flex items-center space-x-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.location.href = '/'}
        className="p-2 -ml-2"
      >
        <Home className="h-5 w-5" />
      </Button>
      <h1 className="text-lg font-semibold">Messages</h1>
      {unreadCount > 0 && (
        <Badge variant="destructive" className="h-5 px-2 text-xs">
          {unreadCount}
        </Badge>
      )}
    </div>
    
    <div className="flex items-center space-x-1">
      <Button variant="ghost" size="sm" onClick={onToggleSearch} className="p-2">
        <Search className="h-4 w-4" />
      </Button>
      
      <Button variant="ghost" size="sm" onClick={onToggleFilter} className="p-2">
        <Filter className="h-4 w-4" />
      </Button>
      
      <Button variant="ghost" size="sm" onClick={onToggleMore} className="p-2">
        <MoreVertical className="h-4 w-4" />
      </Button>
      
      <Button variant="ghost" size="sm" onClick={onToggleMenu} className="p-2">
        <Menu className="h-4 w-4" />
      </Button>
    </div>
  </div>
));

// Header pour une conversation active
const ConversationHeader = memo(({
  onNavigateBack,
  onCall,
  onVideo,
  onToggleMore,
  conversationTitle,
  participantName
}) => (
  <div className="messaging-header-mobile">
    <div className="flex items-center space-x-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={onNavigateBack}
        className="p-2 -ml-2"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-sm">
            {participantName || 'Utilisateur'}
          </p>
          <p className="text-xs text-muted-foreground">
            {conversationTitle || 'Conversation'}
          </p>
        </div>
      </div>
    </div>
    
    <div className="flex items-center space-x-1">
      {onCall && (
        <Button variant="ghost" size="sm" onClick={onCall} className="p-2">
          <Phone className="h-4 w-4" />
        </Button>
      )}
      
      {onVideo && (
        <Button variant="ghost" size="sm" onClick={onVideo} className="p-2">
          <Video className="h-4 w-4" />
        </Button>
      )}
      
      <Button variant="ghost" size="sm" onClick={onToggleMore} className="p-2">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
  </div>
));

// ========================================
// DISPLAY NAMES - Pour le debugging
// ========================================
SimplifiedMobileNav.displayName = 'SimplifiedMobileNav';
ListHeader.displayName = 'ListHeader';
ConversationHeader.displayName = 'ConversationHeader';

export default SimplifiedMobileNav;