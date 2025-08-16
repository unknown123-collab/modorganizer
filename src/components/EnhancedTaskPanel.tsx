
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckSquare, Clock, Calendar, Search, Filter, Trash2, Edit, Target } from 'lucide-react';
import { useSupabaseTasks, SupabaseTask } from '@/hooks/useSupabaseTasks';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import TaskEditDialog from './TaskEditDialog';

const EnhancedTaskPanel = () => {
  const { tasks, categories, updateTask, deleteTask, archiveTask, loading } = useSupabaseTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingTask, setEditingTask] = useState<SupabaseTask | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const priorityColors = {
    'urgent-important': 'bg-red-500',
    'urgent-notImportant': 'bg-orange-500',
    'notUrgent-important': 'bg-yellow-500',
    'notUrgent-notImportant': 'bg-blue-500'
  };

  const priorityLabels = {
    'urgent-important': 'Urgent & Important',
    'urgent-notImportant': 'Urgent',
    'notUrgent-important': 'Important',
    'notUrgent-notImportant': 'Normal'
  };

  // Filter tasks - only show non-archived tasks
  const filteredTasks = tasks.filter(task => {
    // Don't show archived tasks in the main task view
    if (task.archived) return false;
    
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && task.completed && !task.archived) ||
                         (filterStatus === 'pending' && !task.completed);
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleCompleteTask = async (taskId: string, completed: boolean) => {
    if (completed) {
      // When marking as complete, archive the task
      await archiveTask(taskId);
    } else {
      // When unchecking, just update the completed status (don't unarchive)
      await updateTask(taskId, { completed: false });
    }
  };

  const handleEditTask = (task: SupabaseTask) => {
    setEditingTask(task);
    setEditDialogOpen(true);
  };

  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) return null;
    
    const deadlineDate = new Date(deadline);
    
    if (isPast(deadlineDate) && !isToday(deadlineDate)) {
      return { label: 'Overdue', variant: 'destructive' as const };
    }
    if (isToday(deadlineDate)) {
      return { label: 'Due Today', variant: 'default' as const };
    }
    if (isTomorrow(deadlineDate)) {
      return { label: 'Due Tomorrow', variant: 'secondary' as const };
    }
    return { label: format(deadlineDate, 'MMM d'), variant: 'outline' as const };
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return null;
    return categories.find(cat => cat.id === categoryId)?.name;
  };

  const getCategoryColor = (categoryId?: string) => {
    if (!categoryId) return '#6B7280';
    return categories.find(cat => cat.id === categoryId)?.color || '#6B7280';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <CheckSquare className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Badge variant="secondary" className="ml-2">
          {filteredTasks.length}
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg z-50">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent-important">Urgent & Important</SelectItem>
                <SelectItem value="urgent-notImportant">Urgent</SelectItem>
                <SelectItem value="notUrgent-important">Important</SelectItem>
                <SelectItem value="notUrgent-notImportant">Normal</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg z-50">
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterPriority !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first task to get started'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map(task => (
            <Card key={task.id} className={`transition-all hover:shadow-md ${task.completed ? 'opacity-75' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) => handleCompleteTask(task.id, checked as boolean)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-semibold text-lg ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h3>
                      
                      {/* Priority Badge */}
                      <Badge className={`${priorityColors[task.priority]} text-white text-xs`}>
                        {priorityLabels[task.priority]}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className={`text-muted-foreground mb-3 ${task.completed ? 'line-through' : ''}`}>
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                      {/* Time Estimate */}
                      {task.time_estimate && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {task.time_estimate}m
                        </div>
                      )}

                      {/* Category */}
                      {task.category_id && (
                        <div className="flex items-center gap-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: getCategoryColor(task.category_id) }}
                          />
                          <span className="text-muted-foreground">{getCategoryName(task.category_id)}</span>
                        </div>
                      )}

                      {/* Deadline */}
                      {task.deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <Badge variant={getDeadlineStatus(task.deadline)?.variant}>
                            {getDeadlineStatus(task.deadline)?.label}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTask(task)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Task Dialog */}
      <TaskEditDialog
        task={editingTask}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingTask(null);
        }}
      />
    </div>
  );
};

export default EnhancedTaskPanel;
