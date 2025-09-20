import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';
import { getPhilippineNow, formatPhilippineTime, toPhilippineTime } from '@/utils/timezone';

const TimezoneDemo = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const philippineTime = getPhilippineNow();
  
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-primary" />
          Philippine Time Zone (UTC+8)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Philippine Time</span>
            </div>
            <div className="text-2xl font-mono font-bold text-primary">
              {formatPhilippineTime(philippineTime, 'PPp')}
            </div>
            <Badge variant="secondary" className="text-xs">
              Asia/Manila (UTC+8)
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">UTC Time</span>
            </div>
            <div className="text-2xl font-mono font-bold text-muted-foreground">
              {currentTime.toISOString().replace('T', ' ').slice(0, 19)} UTC
            </div>
            <Badge variant="outline" className="text-xs">
              Coordinated Universal Time
            </Badge>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            All task deadlines and time blocks are now displayed in Philippine time (UTC+8) 
            while being stored in UTC in the database for consistency.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimezoneDemo;