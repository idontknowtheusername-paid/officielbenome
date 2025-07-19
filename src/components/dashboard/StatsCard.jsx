import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = 'blue',
  className 
}) => {
  const colorVariants = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    teal: 'from-teal-500 to-teal-600',
    indigo: 'from-indigo-500 to-indigo-600',
    pink: 'from-pink-500 to-pink-600'
  };

  const iconColorVariants = {
    blue: 'text-blue-200',
    green: 'text-green-200',
    purple: 'text-purple-200',
    orange: 'text-orange-200',
    red: 'text-red-200',
    teal: 'text-teal-200',
    indigo: 'text-indigo-200',
    pink: 'text-pink-200'
  };

  return (
    <Card className={cn(
      `bg-gradient-to-br ${colorVariants[color]} text-white overflow-hidden`,
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm opacity-90 mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <div className="flex items-center mt-2">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs bg-white/20 text-white border-0",
                    trend === 'up' ? 'text-green-200' : 'text-red-200'
                  )}
                >
                  {trend === 'up' ? '↗' : '↘'} {trendValue}
                </Badge>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn("p-3 rounded-full bg-white/10", iconColorVariants[color])}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard; 