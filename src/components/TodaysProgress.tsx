import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { isToday, isPast, isFuture } from 'date-fns';

const TodaysProgress = () => {
  const { tasks, categories } = useSupabaseTasks();

  // Filter today's tasks
  const todaysTasks = tasks.filter(task => {
    if (task.deadline) {
      return isToday(new Date(task.deadline));
    }
    return false;
  });

  const completedToday = todaysTasks.filter(task => task.completed).length;
  const pendingToday = todaysTasks.filter(task => !task.completed).length;
  const overdueToday = todaysTasks.filter(task => 
    !task.completed && task.deadline && isPast(new Date(task.deadline))
  ).length;

  // All completed tasks (not just today)
  const allCompletedTasks = tasks.filter(task => task.completed);
  
  // Calculate completion rate
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 
    ? Math.round((allCompletedTasks.length / totalTasks) * 100) 
    : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Today's Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{completedToday}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{pendingToday}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{overdueToday}</p>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">Overall Rate</p>
          </div>
        </div>

        {/* Today's Tasks List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Tasks Due Today ({todaysTasks.length})</h4>
          
          {todaysTasks.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">No tasks due today</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todaysTasks.map(task => {
                const category = categories.find(c => c.id === task.category_id);
                return (
                  <div 
                    key={task.id} 
                    className={`flex items-start justify-between p-3 rounded-lg border ${
                      task.completed 
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                        : 'bg-card'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {task.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <Clock className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        )}
                        <span className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-6">
                        <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                          {task.priority}
                        </Badge>
                        {category && (
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                            style={{ 
                              backgroundColor: `${category.color}20`,
                              borderColor: category.color,
                              color: category.color
                            }}
                          >
                            {category.name}
                          </Badge>
                        )}
                        {task.tags && task.tags.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {task.tags.slice(0, 2).join(', ')}
                            {task.tags.length > 2 && ` +${task.tags.length - 2}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodaysProgress;
