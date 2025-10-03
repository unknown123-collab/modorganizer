import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Clock, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Task {
  id: string;
  title: string;
}

interface TimeBlock {
  id: string;
  task_id: string;
  start_time: string;
  end_time: string;
  completed: boolean;
  tasks: Task;
}

export const TimeTracking: React.FC = () => {
  const { user } = useAuth();
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [activeBlock, setActiveBlock] = useState<TimeBlock | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch tasks and time blocks
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch incomplete tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('id, title')
          .eq('user_id', user.id)
          .eq('completed', false)
          .order('created_at', { ascending: false });

        if (tasksError) throw tasksError;
        setTasks(tasksData || []);

        // Fetch today's time blocks
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: blocksData, error: blocksError } = await supabase
          .from('time_blocks')
          .select('*, tasks(id, title)')
          .eq('user_id', user.id)
          .gte('start_time', today.toISOString())
          .order('start_time', { ascending: false });

        if (blocksError) throw blocksError;
        setTimeBlocks(blocksData || []);

        // Find active block (not completed and end_time is in future)
        const active = blocksData?.find(
          (block) => !block.completed && new Date(block.end_time) > new Date()
        );
        setActiveBlock(active || null);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load time tracking data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up realtime subscription for time_blocks
    const channel = supabase
      .channel('time_blocks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_blocks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Time block change:', payload);
          fetchData(); // Refetch data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Update elapsed time for active block
  useEffect(() => {
    if (!activeBlock) {
      setElapsedTime(0);
      return;
    }

    const updateElapsed = () => {
      const start = new Date(activeBlock.start_time).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - start) / 1000); // seconds
      setElapsedTime(elapsed);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [activeBlock]);

  const startTracking = async () => {
    if (!selectedTaskId) {
      toast.error('Please select a task');
      return;
    }

    try {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour default

      const { data, error } = await supabase
        .from('time_blocks')
        .insert({
          user_id: user!.id,
          task_id: selectedTaskId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          completed: false,
        })
        .select('*, tasks(id, title)')
        .single();

      if (error) throw error;

      setActiveBlock(data);
      toast.success('Time tracking started!');
    } catch (error: any) {
      console.error('Error starting tracking:', error);
      toast.error('Failed to start time tracking');
    }
  };

  const stopTracking = async () => {
    if (!activeBlock) return;

    try {
      const { error } = await supabase
        .from('time_blocks')
        .update({ completed: true, end_time: new Date().toISOString() })
        .eq('id', activeBlock.id);

      if (error) throw error;

      setActiveBlock(null);
      toast.success('Time tracking stopped!');
    } catch (error: any) {
      console.error('Error stopping tracking:', error);
      toast.error('Failed to stop time tracking');
    }
  };

  const formatTime = (seconds: number) => {
    const absSeconds = Math.abs(Math.floor(seconds));
    const hours = Math.floor(absSeconds / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const secs = absSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalTimeToday = () => {
    return timeBlocks
      .filter((block) => block.completed)
      .reduce((total, block) => {
        const start = new Date(block.start_time).getTime();
        const end = new Date(block.end_time).getTime();
        const duration = (end - start) / 1000; // seconds
        return total + Math.max(0, duration); // Ensure no negative values
      }, 0);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Time Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Timer */}
        {activeBlock ? (
          <div className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/50 rounded-xl space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Currently tracking</p>
                <p className="text-lg font-bold text-foreground">{activeBlock.tasks.title}</p>
              </div>
              <Badge variant="default" className="animate-pulse shadow-lg">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                  Active
                </span>
              </Badge>
            </div>
            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4">
              <div className="text-4xl font-mono font-bold text-center text-primary tracking-wider">
                {formatTime(elapsedTime)}
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">Elapsed Time</p>
            </div>
            <Button onClick={stopTracking} variant="destructive" className="w-full shadow-md" size="lg">
              <Square className="h-5 w-5 mr-2" />
              Stop Tracking
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Task to Track</label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full p-3 border-2 rounded-lg bg-background hover:border-primary/50 transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Choose a task...</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={startTracking}
              disabled={!selectedTaskId}
              className="w-full shadow-md"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Tracking
            </Button>
          </div>
        )}

        {/* Today's Summary */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between mb-4 p-3 bg-accent/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold">Today's Total Focus</span>
            </div>
            <span className="text-xl font-bold text-primary">{formatTime(getTotalTimeToday())}</span>
          </div>

          {/* Recent Sessions */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Recent Sessions</p>
            {timeBlocks
              .filter((block) => block.completed) // Only show completed sessions
              .slice(0, 3)
              .map((block) => {
                const duration = Math.floor(
                  (new Date(block.end_time).getTime() - new Date(block.start_time).getTime()) / 1000
                );
                return (
                  <div
                    key={block.id}
                    className="flex items-center justify-between p-2 bg-accent/50 rounded text-xs hover:bg-accent/70 transition-colors"
                  >
                    <span className="truncate flex-1">{block.tasks.title}</span>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {formatTime(Math.max(0, duration))}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            {timeBlocks.filter((block) => block.completed).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No completed sessions yet today
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
