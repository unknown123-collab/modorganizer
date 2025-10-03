import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle2, Circle, Pause } from 'lucide-react';
import { format, isToday, differenceInMinutes } from 'date-fns';

const TimeTracking = () => {
  const { tasks, timeBlocks } = useSupabaseTasks();

  // Get today's time blocks
  const todayBlocks = timeBlocks.filter(block => 
    isToday(new Date(block.start_time))
  );

  // Calculate total planned time for today
  const totalPlannedMinutes = todayBlocks.reduce((sum, block) => {
    const start = new Date(block.start_time);
    const end = new Date(block.end_time);
    return sum + differenceInMinutes(end, start);
  }, 0);

  // Calculate completed time
  const completedMinutes = todayBlocks
    .filter(block => block.completed)
    .reduce((sum, block) => {
      const start = new Date(block.start_time);
      const end = new Date(block.end_time);
      return sum + differenceInMinutes(end, start);
    }, 0);

  // Calculate progress percentage
  const progressPercentage = totalPlannedMinutes > 0 
    ? Math.round((completedMinutes / totalPlannedMinutes) * 100) 
    : 0;

  // Get active blocks
  const activeBlocks = todayBlocks.filter(block => !block.completed);
  const completedBlocks = todayBlocks.filter(block => block.completed);

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Time Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{formatMinutes(totalPlannedMinutes)}</p>
            <p className="text-xs text-muted-foreground">Planned Today</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{formatMinutes(completedMinutes)}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{formatMinutes(totalPlannedMinutes - completedMinutes)}</p>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Daily Progress</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Time Blocks List */}
        <div className="space-y-4">
          {completedBlocks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Completed ({completedBlocks.length})
              </h4>
              <div className="space-y-2">
                {completedBlocks.map(block => {
                  const task = tasks.find(t => t.id === block.task_id);
                  return (
                    <div key={block.id} className="flex items-center justify-between text-sm bg-green-50 dark:bg-green-950/20 p-2 rounded">
                      <span className="font-medium">{task?.title || 'Unknown Task'}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(block.start_time), 'HH:mm')} - {format(new Date(block.end_time), 'HH:mm')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeBlocks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Circle className="h-4 w-4 text-orange-600" />
                Pending ({activeBlocks.length})
              </h4>
              <div className="space-y-2">
                {activeBlocks.map(block => {
                  const task = tasks.find(t => t.id === block.task_id);
                  return (
                    <div key={block.id} className="flex items-center justify-between text-sm bg-orange-50 dark:bg-orange-950/20 p-2 rounded">
                      <span className="font-medium">{task?.title || 'Unknown Task'}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(block.start_time), 'HH:mm')} - {format(new Date(block.end_time), 'HH:mm')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {todayBlocks.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <Pause className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No time blocks scheduled for today</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeTracking;
