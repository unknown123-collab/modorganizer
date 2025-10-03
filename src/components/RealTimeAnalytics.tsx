import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export const RealTimeAnalytics: React.FC = () => {
  const { tasks, timeBlocks } = useSupabaseTasks();
  const [liveStats, setLiveStats] = useState({
    tasksCompleted: 0,
    activeTimeBlocks: 0,
    totalFocusTime: 0,
    completionRate: 0
  });

  useEffect(() => {
    // Calculate initial stats
    const completedTasks = tasks.filter(task => task.completed).length;
    const activeBlocks = timeBlocks.filter(block => !block.completed).length;
    // Only count completed blocks for total focus time
    const totalTime = timeBlocks
      .filter(block => block.completed)
      .reduce((sum, block) => {
        const duration = new Date(block.end_time).getTime() - new Date(block.start_time).getTime();
        return sum + Math.max(0, duration / (1000 * 60)); // Convert to minutes, ensure no negative values
      }, 0);
    const rate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    setLiveStats({
      tasksCompleted: completedTasks,
      activeTimeBlocks: activeBlocks,
      totalFocusTime: Math.round(totalTime),
      completionRate: Math.round(rate)
    });
  }, [tasks, timeBlocks]);

  useEffect(() => {
    // Set up real-time subscriptions
    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          // Stats will update automatically via useSupabaseTasks
        }
      )
      .subscribe();

    const timeBlocksChannel = supabase
      .channel('time-blocks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_blocks'
        },
        () => {
          // Stats will update automatically via useSupabaseTasks
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(timeBlocksChannel);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{liveStats.tasksCompleted}</div>
          <Badge variant="secondary" className="mt-1">
            <Activity className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{liveStats.activeTimeBlocks}</div>
          <Badge variant="secondary" className="mt-1">
            <Activity className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{liveStats.totalFocusTime}m</div>
          <Badge variant="secondary" className="mt-1">
            <Activity className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{liveStats.completionRate}%</div>
          <Badge variant="secondary" className="mt-1">
            <Activity className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
};