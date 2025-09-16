import React, { useEffect, useState } from 'react';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { useUserSettings } from '@/hooks/useUserSettings';
import { toast } from 'sonner';
import { Bell, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface Notification {
  id: string;
  type: 'deadline' | 'reminder' | 'achievement' | 'break';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export const NotificationSystem: React.FC = () => {
  const { tasks } = useSupabaseTasks();
  const { settings, updateSettings } = useUserSettings();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isEnabled, setIsEnabled] = useState(settings?.notifications ?? true);

  useEffect(() => {
    if (!isEnabled || !tasks.length) return;

    const checkDeadlines = () => {
      const now = new Date();
      const upcoming = tasks.filter(task => {
        if (!task.deadline || task.completed) return false;
        const deadline = new Date(task.deadline);
        const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursUntilDeadline <= 24 && hoursUntilDeadline > 0;
      });

      upcoming.forEach(task => {
        const deadline = new Date(task.deadline!);
        const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        const notification: Notification = {
          id: `deadline-${task.id}`,
          type: 'deadline',
          title: 'Upcoming Deadline',
          message: `"${task.title}" is due in ${Math.round(hoursUntilDeadline)} hours`,
          timestamp: now,
          read: false,
          priority: hoursUntilDeadline <= 2 ? 'high' : hoursUntilDeadline <= 8 ? 'medium' : 'low'
        };

        setNotifications(prev => {
          const exists = prev.some(n => n.id === notification.id);
          if (exists) return prev;
          
          // Show toast notification
          toast.warning(notification.message, {
            description: `Priority: ${task.priority}`,
            action: {
              label: 'View Task',
              onClick: () => console.log('Navigate to task:', task.id)
            }
          });
          
          return [notification, ...prev];
        });
      });
    };

    const checkOverdue = () => {
      const now = new Date();
      const overdue = tasks.filter(task => {
        if (!task.deadline || task.completed) return false;
        return new Date(task.deadline) < now;
      });

      overdue.forEach(task => {
        const notification: Notification = {
          id: `overdue-${task.id}`,
          type: 'deadline',
          title: 'Overdue Task',
          message: `"${task.title}" is overdue`,
          timestamp: now,
          read: false,
          priority: 'high'
        };

        setNotifications(prev => {
          const exists = prev.some(n => n.id === notification.id);
          if (exists) return prev;
          
          toast.error(notification.message, {
            description: 'Complete this task as soon as possible',
            action: {
              label: 'View Task',
              onClick: () => console.log('Navigate to task:', task.id)
            }
          });
          
          return [notification, ...prev];
        });
      });
    };

    const checkAchievements = () => {
      const completedToday = tasks.filter(task => {
        if (!task.completed) return false;
        const completedDate = new Date(task.updated_at);
        const today = new Date();
        return completedDate.toDateString() === today.toDateString();
      }).length;

      if (completedToday === 5) {
        const notification: Notification = {
          id: 'achievement-5-tasks',
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: 'You completed 5 tasks today! 🎉',
          timestamp: new Date(),
          read: false,
          priority: 'medium'
        };

        setNotifications(prev => {
          const exists = prev.some(n => n.id === notification.id);
          if (exists) return prev;
          
          toast.success(notification.message, {
            description: 'Keep up the great work!',
          });
          
          return [notification, ...prev];
        });
      }
    };

    // Initial checks
    checkDeadlines();
    checkOverdue();
    checkAchievements();

    // Set up periodic checks
    const interval = setInterval(() => {
      checkDeadlines();
      checkOverdue();
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [tasks, isEnabled]);

  const toggleNotifications = async (enabled: boolean) => {
    setIsEnabled(enabled);
    if (settings) {
      await updateSettings({ ...settings, notifications: enabled });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'deadline': return <AlertTriangle className="h-4 w-4" />;
      case 'reminder': return <Clock className="h-4 w-4" />;
      case 'achievement': return <CheckCircle className="h-4 w-4" />;
      case 'break': return <Bell className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Switch
            checked={isEnabled}
            onCheckedChange={toggleNotifications}
          />
          <Button variant="outline" size="sm" onClick={clearAll}>
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No notifications
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.slice(0, 10).map(notification => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  notification.read ? 'bg-muted/50' : 'bg-background'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <Badge variant={getPriorityColor(notification.priority)} className="ml-2">
                      {notification.priority}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {notification.timestamp.toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                  >
                    Mark Read
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};