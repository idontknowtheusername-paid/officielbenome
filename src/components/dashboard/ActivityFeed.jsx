import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  Heart, 
  Star,
  Calendar,
  MapPin,
  User,
  Bell,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ActivityFeed = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'view':
        return <Eye className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'favorite':
        return <Heart className="h-4 w-4" />;
      case 'boost':
        return <TrendingUp className="h-4 w-4" />;
      case 'approval':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'view':
        return 'bg-blue-50 border-blue-200';
      case 'message':
        return 'bg-green-50 border-green-200';
      case 'favorite':
        return 'bg-pink-50 border-pink-200';
      case 'boost':
        return 'bg-purple-50 border-purple-200';
      case 'approval':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getActivityIconColor = (type) => {
    switch (type) {
      case 'view':
        return 'text-blue-500';
      case 'message':
        return 'text-green-500';
      case 'favorite':
        return 'text-pink-500';
      case 'boost':
        return 'text-purple-500';
      case 'approval':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  // Si aucune activite, afficher un message
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Activité Récente</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Aucune activité récente</p>
            <p className="text-xs mt-1">Vos activités apparaîtront ici</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Activité Récente</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={cn(
                "flex items-start space-x-3 p-3 rounded-lg transition-colors",
                getActivityColor(activity.type),
                activity.unread && "bg-blue-50 border-blue-200"
              )}
            >
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                getActivityColor(activity.type).replace('border-', 'bg-').replace('-50', '-100')
              )}>
                <div className={getActivityIconColor(activity.type)}>
                  {getActivityIcon(activity.type)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                    
                    {/* Détails supplémentaires */}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      {activity.listing && (
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {activity.listing}
                        </span>
                      )}
                      {activity.location && (
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {activity.location}
                        </span>
                      )}
                      {activity.sender && (
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {activity.sender}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {activity.unread && (
                      <Badge variant="destructive" className="text-xs">
                        Nouveau
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {activitiesToShow.length === 0 && (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune activité</h3>
            <p className="text-muted-foreground">
              Vous n'avez pas encore d'activité récente.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed; 