import React, { useState } from 'react';
import { useSupabaseTasks, SupabaseTask } from '@/hooks/useSupabaseTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Archive as ArchiveIcon, RotateCcw, Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Archive = () => {
  const { user, loading: authLoading } = useAuth();
  const { tasks, categories, loading, updateTask, deleteTask } = useSupabaseTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto mb-4 rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const priorityColors = {
    'urgent-important': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200',
    'urgent-notImportant': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-200',
    'notUrgent-important': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200',
    'notUrgent-notImportant': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-200',
  };

  const priorityLabels = {
    'urgent-important': 'Urgent & Important',
    'urgent-notImportant': 'Urgent',
    'notUrgent-important': 'Important',
    'notUrgent-notImportant': 'Low Priority',
  };

  // Filter for completed tasks only
  const completedTasks = tasks.filter(task => task.completed);

  const filteredTasks = completedTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesPriority;
  });

  const handleRestoreTask = async (taskId: string) => {
    await updateTask(taskId, { completed: false });
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return null;
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name;
  };

  const getCategoryColor = (categoryId?: string) => {
    if (!categoryId) return '#6B7280';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#6B7280';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2">
          <ArchiveIcon className="w-6 h-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">
            Archive ({completedTasks.length})
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search completed tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent-important">Urgent & Important</SelectItem>
            <SelectItem value="urgent-notImportant">Urgent</SelectItem>
            <SelectItem value="notUrgent-important">Important</SelectItem>
            <SelectItem value="notUrgent-notImportant">Low Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Completed Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ArchiveIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                {searchTerm || priorityFilter !== 'all' ? 'No matching completed tasks' : 'No completed tasks yet'}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || priorityFilter !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Completed tasks will appear here'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="opacity-75 hover:opacity-100 transition-opacity">
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg mb-2 line-through text-muted-foreground">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-muted-foreground text-sm mb-3 line-through">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="outline" className={priorityColors[task.priority]}>
                        {priorityLabels[task.priority]}
                      </Badge>
                      
                      {getCategoryName(task.category_id) && (
                        <Badge 
                          variant="outline" 
                          style={{ 
                            backgroundColor: `${getCategoryColor(task.category_id)}20`,
                            borderColor: getCategoryColor(task.category_id),
                            color: getCategoryColor(task.category_id)
                          }}
                        >
                          {getCategoryName(task.category_id)}
                        </Badge>
                      )}
                      
                      {task.deadline && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Completed: {format(new Date(task.deadline), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      )}
                      
                      {task.time_estimate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{task.time_estimate}m</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreTask(task.id)}
                      className="shrink-0"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Restore
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                      className="shrink-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Archive;