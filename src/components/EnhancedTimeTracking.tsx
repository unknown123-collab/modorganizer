import React, { useState, useEffect, useCallback } from 'react';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Timer, 
  TrendingUp,
  BarChart3,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface ActiveSession {
  id: string;
  taskId: string;
  taskTitle: string;
  startTime: Date;
  plannedDuration: number; // in minutes
  category: string;
}

export const EnhancedTimeTracking: React.FC = () => {
  const { tasks, timeBlocks } = useSupabaseTasks();
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && activeSession) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - activeSession.startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, activeSession]);

  const startSession = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const session: ActiveSession = {
      id: crypto.randomUUID(),
      taskId,
      taskTitle: task.title,
      startTime: new Date(),
      plannedDuration: task.time_estimate || 25, // Default to 25 minutes
      category: 'work' // Could be expanded to include different session types
    };

    setActiveSession(session);
    setIsRunning(true);
    setElapsedTime(0);

    toast.success(`Started tracking time for "${task.title}"`);
  }, [tasks]);

  const pauseSession = useCallback(() => {
    setIsRunning(false);
    toast.info('Session paused');
  }, []);

  const resumeSession = useCallback(() => {
    if (activeSession) {
      setIsRunning(true);
      toast.info('Session resumed');
    }
  }, [activeSession]);

  const stopSession = useCallback(async () => {
    if (!activeSession) return;

    const endTime = new Date();
    const actualDuration = Math.floor((endTime.getTime() - activeSession.startTime.getTime()) / (1000 * 60));

    // For now, just show success - time block creation will be implemented
    // when we enhance the useSupabaseTasks hook with time block management
    toast.success(`Completed ${actualDuration} minute session for "${activeSession.taskTitle}"`);

    setActiveSession(null);
    setIsRunning(false);
    setElapsedTime(0);
  }, [activeSession]);

  // Calculate today's statistics
  const todayStats = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayBlocks = timeBlocks.filter(block => {
      const blockDate = new Date(block.start_time);
      return blockDate >= today;
    });

    const totalMinutes = todayBlocks.reduce((sum, block) => {
      const duration = new Date(block.end_time).getTime() - new Date(block.start_time).getTime();
      return sum + (duration / (1000 * 60));
    }, 0);

    const completedSessions = todayBlocks.filter(block => block.completed).length;
    const totalSessions = todayBlocks.length;

    return {
      totalMinutes: Math.round(totalMinutes),
      totalSessions,
      completedSessions,
      averageSessionLength: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0
    };
  }, [timeBlocks]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!activeSession) return 0;
    const plannedSeconds = activeSession.plannedDuration * 60;
    return Math.min((elapsedTime / plannedSeconds) * 100, 100);
  };

  const incompleteTasks = tasks.filter(task => !task.completed && !task.archived);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Active Session Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Time Tracking
            {isRunning && (
              <Badge variant="destructive" className="animate-pulse">
                Recording
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSession ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  {activeSession.taskTitle}
                </h3>
                <div className="text-3xl font-mono font-bold mb-2">
                  {formatTime(elapsedTime)}
                </div>
                <Progress 
                  value={getProgressPercentage()} 
                  className="mb-4"
                />
                <p className="text-sm text-muted-foreground">
                  Target: {activeSession.plannedDuration} minutes
                </p>
              </div>
              
              <div className="flex justify-center gap-2">
                {isRunning ? (
                  <Button onClick={pauseSession} variant="outline">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button onClick={resumeSession}>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                )}
                <Button onClick={stopSession} variant="destructive">
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-4">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No active session</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Start tracking a task:</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {incompleteTasks.slice(0, 5).map(task => (
                    <Button
                      key={task.id}
                      variant="outline"
                      className="w-full justify-start text-left"
                      onClick={() => startSession(task.id)}
                    >
                      <Play className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{task.title}</span>
                      {task.time_estimate && (
                        <Badge variant="secondary" className="ml-auto">
                          {task.time_estimate}m
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Today's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {todayStats.totalMinutes}
              </div>
              <div className="text-sm text-muted-foreground">
                Minutes Focused
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {todayStats.completedSessions}
              </div>
              <div className="text-sm text-muted-foreground">
                Sessions Completed
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {todayStats.averageSessionLength}
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Session (min)
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {Math.round(todayStats.totalMinutes / 60 * 10) / 10}
              </div>
              <div className="text-sm text-muted-foreground">
                Hours Today
              </div>
            </div>
          </div>

          {todayStats.totalMinutes > 0 && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Daily Goal Progress</span>
                <span className="text-sm text-muted-foreground">
                  {todayStats.totalMinutes}/480 min
                </span>
              </div>
              <Progress 
                value={(todayStats.totalMinutes / 480) * 100} 
                className="mt-2"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};