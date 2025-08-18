import React from 'react';
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
  Star,
  Archive,
  Trash2,
  Settings
} from 'lucide-react';

const MobileMessagingNav = ({
  selectedConversation,
  onBack,
  onMenuToggle,
  onSearch,
  onFilter,
  onMore,
  onCall,
  onVideo,
  unreadCount = 0,
  isStarred = false,
  isArchived = false
}) => {
  if (selectedConversation) {
    // Navigation dans une conversation
    return (
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
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
                {selectedConversation.participant1?.first_name || 'Utilisateur'}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedConversation.listing?.title || 'Conversation'}
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
          
          <Button variant="ghost" size="sm" onClick={onMore} className="p-2">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Navigation principale des messages
  return (
    <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <h1 className="text-lg font-semibold">Messages</h1>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="h-5 px-2 text-xs">
            {unreadCount}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" onClick={onSearch} className="p-2">
          <Search className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="sm" onClick={onFilter} className="p-2">
          <Filter className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="sm" onClick={onMenuToggle} className="p-2">
          <Menu className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MobileMessagingNav;
