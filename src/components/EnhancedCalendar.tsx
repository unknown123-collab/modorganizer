import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, ChevronRight, Clock, AlertCircle, Sparkles, Bell, BellOff } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const EnhancedCalendar = () => {
  const { tasks, timeBlocks, generateSchedule, categories } = useSupabaseTasks();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [testing, setTesting] = useState(false);

  // --- StrictMode guard + cooldown (prevents duplicate auto calls) ---
  const autoGuardRef = useRef<{ running: boolean; last: number }>({ running: false, last: 0 });
  const AUTO_COOLDOWN_MS = 5000; // 5s is enough to skip StrictMode double run

  // Attempt reminder run when notifications are enabled and task list changes.
  useEffect(() => {
    if (!notificationsEnabled) return;

    const now = Date.now();
    if (autoGuardRef.current.running) return;
    if (now - autoGuardRef.current.last < AUTO_COOLDOWN_MS) return;

    autoGuardRef.current.running = true;
    (async () => {
      try {
        // Normal reminder pass (NOT a test email)
        await supabase.functions.invoke('check-task-reminders', { body: {} });
      } catch {
        // Silently ignore here to avoid user spam
      } finally {
        autoGuardRef.current.running = false;
        autoGuardRef.current.last = Date.now();
      }
    })();
  }, [tasks.length, notificationsEnabled]);

  // Load user notification preference
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_settings')
        .select('email_notifications')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setNotificationsEnabled(data.email_notifications ?? true);
      }
    };
    fetchNotificationSettings();
  }, []);

  // Toggle notifications
  const handleNotificationToggle = async (enabled: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, email_notifications: enabled });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification settings',
        variant: 'destructive',
      });
      return;
    }

    setNotificationsEnabled(enabled);
    toast({
      title: 'Settings Updated',
      description: enabled ? 'Email notifications enabled' : 'Email notifications disabled',
    });
  };

  // ---------- Test button logic ----------
  const testNotifications = async () => {
    setTesting(true);
    try {
      // 1) Try via SDK (includes the current user's JWT automatically)
      const { data, error } = await supabase.functions.invoke('check-task-reminders', {
        body: { test: true },
      });

      if (!error && data) {
        toast({
          title: 'Test Successful',
          description: `Reminder check completed. ${data?.emailsSent || 0} emails sent.`,
        });
        return;
      }

      // 2) Fallback: direct fetch with the JWT (better error surface)
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        toast({
          title: 'Test Failed',
          description: 'No active session. Please sign in again.',
          variant: 'destructive',
        });
        return;
      }

      // @ts-expect-error – url exists at runtime
      const baseUrl: string | undefined = supabase?.functions?.url || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const fnUrl = `${baseUrl?.replace(/\/$/, '')}/check-task-reminders`;

      const resp = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true }),
      });

      const text = await resp.text();
      let json: any = undefined;
      try { json = JSON.parse(text); } catch {}

      if (resp.ok) {
        const count = json?.emailsSent ?? 0;
        toast({
          title: 'Test Successful',
          description: `Reminder check completed. ${count} emails sent.`,
        });
      } else {
        const message = json?.error || text || 'Unknown error';
        toast({
          title: `Test Failed (${resp.status})`,
          description: message,
          variant: 'destructive',
        });
      }
    } catch (e: any) {
      const details =
        e?.message ||
        e?.cause?.message ||
        (typeof e === 'string' ? e : 'Unable to test notification system');
      toast({
        title: 'Test Failed',
        description: `${details}`,
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };
  // ---------------------------------------------------------------

  // Get tasks for selected date
  const tasksForSelectedDate = useMemo(() => {
    return tasks.filter(task => {
      if (task.deadline && isSameDay(new Date(task.deadline), selectedDate)) return true;
      const taskBlocks = timeBlocks.filter(
        block => block.task_id === task.id && isSameDay(new Date(block.start_time), selectedDate)
      );
      return taskBlocks.length > 0;
    });
  }, [tasks, timeBlocks, selectedDate]);

  // Time blocks on selected date
  const blocksForSelectedDate = useMemo(() => {
    return timeBlocks
      .filter(block => isSameDay(new Date(block.start_time), selectedDate))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [timeBlocks, selectedDate]);

  // Days with any events for the calendar
  const daysWithEvents = useMemo(() => {
    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);
    const daysInMonth = eachDayOfInterval({ start, end });

    return daysInMonth.filter(day => {
      const hasDeadline = tasks.some(task => task.deadline && isSameDay(new Date(task.deadline), day));
      const hasTimeBlock = timeBlocks.some(block => isSameDay(new Date(block.start_time), day));
      return hasDeadline || hasTimeBlock;
    });
  }, [tasks, timeBlocks, viewDate]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent-important': return 'bg-red-500';
      case 'urgent-notImportant': return 'bg-orange-500';
      case 'notUrgent-important': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent-important': return 'Urgent & Important';
      case 'urgent-notImportant': return 'Urgent';
      case 'notUrgent-important': return 'Important';
      default: return 'Normal';
    }
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return null;
    return categories.find(cat => cat.id === categoryId)?.name;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile Friendly */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Calendar</h1>
        </div>
        
        {/* Notification Controls - Full Width on Mobile */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            {notificationsEnabled ? (
              <Bell className="h-4 w-4 text-primary" />
            ) : (
              <BellOff className="h-4 w-4 text-muted-foreground" />
            )}
            <Switch checked={notificationsEnabled} onCheckedChange={handleNotificationToggle} />
            <span className="text-xs sm:text-sm font-medium">
              {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
            </span>
          </div>

          <Button
            onClick={testNotifications}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={testing}
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">{testing ? 'Testing…' : 'Test'}</span>
            <span className="sm:hidden">{testing ? '...' : 'Test'}</span>
          </Button>
        </div>

        {/* Action Buttons - Stack on Mobile */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            onClick={() => generateSchedule(selectedDate)} 
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">Generate for {format(selectedDate, 'MMM d')}</span>
          </Button>
          <Button 
            onClick={() => generateSchedule()} 
            variant="outline" 
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">Generate Full Schedule</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-lg sm:text-xl text-foreground">{format(viewDate, 'MMMM yyyy')}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(viewDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setViewDate(newDate);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setViewDate(new Date())}>
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(viewDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setViewDate(newDate);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={viewDate}
              onMonthChange={setViewDate}
              modifiers={{ hasEvents: daysWithEvents }}
              modifiersStyles={{
                hasEvents: {
                  backgroundColor: 'hsl(var(--accent))',
                  color: 'hsl(var(--accent-foreground))',
                  fontWeight: 'bold',
                },
              }}
              className="w-full border-0"
            />
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2">
              <span className="text-base sm:text-lg text-foreground">{format(selectedDate, 'EEEE, MMM d')}</span>
              {(tasksForSelectedDate.length > 0 || blocksForSelectedDate.length > 0) && (
                <Badge variant="secondary" className="ml-auto">
                  {tasksForSelectedDate.length + blocksForSelectedDate.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Time Blocks */}
            {blocksForSelectedDate.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Scheduled Tasks
                </h4>
                <div className="space-y-3">
                  {blocksForSelectedDate.map((block) => {
                    const task = tasks.find((t) => t.id === block.task_id);
                    if (!task) return null;

                    return (
                      <div
                        key={block.id}
                        className={`p-4 rounded-lg border-l-4 ${
                          block.completed ? 'bg-muted/30 opacity-75' : 'bg-card shadow-sm'
                        }`}
                        style={{
                          borderLeftColor: task.category_id
                            ? categories.find((c) => c.id === task.category_id)?.color || '#3B82F6'
                            : '#3B82F6',
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`font-medium ${
                              block.completed ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {task.title}
                          </span>
                          <Badge className={`${getPriorityColor(task.priority)} text-white text-xs`}>
                            {getPriorityLabel(task.priority)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {format(new Date(block.start_time), 'h:mm a')} - {format(new Date(block.end_time), 'h:mm a')}
                        </div>
                        {task.category_id && (
                          <Badge variant="outline" className="text-xs">
                            {getCategoryName(task.category_id)}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Task Deadlines */}
            {tasksForSelectedDate.some(
              (task) => task.deadline && isSameDay(new Date(task.deadline), selectedDate)
            ) && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  Due Today
                </h4>
                <div className="space-y-3">
                  {tasksForSelectedDate
                    .filter((task) => task.deadline && isSameDay(new Date(task.deadline), selectedDate))
                    .map((task) => (
                      <div
                        key={task.id}
                        className={`p-4 rounded-lg border ${
                          task.completed ? 'bg-muted/30 opacity-75' : 'bg-card shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`font-medium ${
                              task.completed ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {task.title}
                          </span>
                          <Badge className={`${getPriorityColor(task.priority)} text-white text-xs`}>
                            {getPriorityLabel(task.priority)}
                          </Badge>
                        </div>
                        {task.time_estimate && (
                          <div className="text-sm text-muted-foreground mb-2">
                            Estimated: {task.time_estimate} minutes
                          </div>
                        )}
                        {task.category_id && (
                          <Badge variant="outline" className="text-xs">
                            {getCategoryName(task.category_id)}
                          </Badge>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* No events */}
            {tasksForSelectedDate.length === 0 && blocksForSelectedDate.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No tasks scheduled</p>
                <p className="text-sm">This day is free for new tasks</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedCalendar;
