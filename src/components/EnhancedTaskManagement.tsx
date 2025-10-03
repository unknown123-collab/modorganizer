import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import EnhancedTaskFilters, { FilterOptions } from './EnhancedTaskFilters';
import TaskBulkActions from './TaskBulkActions';
import { 
  CheckCheck, MoreHorizontal, Calendar, Clock, 
  Target, Tag, Edit, Archive, Trash2 
} from 'lucide-react';
import { formatPhilippineTime } from '@/utils/timezone';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import TaskEditDialog from './TaskEditDialog';

const EnhancedTaskManagement = () => {
  const { tasks, categories, updateTask, deleteTask, archiveTask, loading } = useSupabaseTasks();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    priority: [],
    status: 'all',
    dateRange: {},
    timeEstimate: {},
    tags: [],
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Get unique tags from all tasks
  const availableTags = useMemo(() => {
    const allTags = tasks.flatMap(task => task.tags || []);
    return [...new Set(allTags)];
  }, [tasks]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      if (task.archived) return false;

      // Search filter
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Status filter
      if (filters.status === 'completed' && !task.completed) return false;
      if (filters.status === 'pending' && task.completed) return false;
      if (filters.status === 'overdue') {
        if (task.completed || !task.deadline) return false;
        if (new Date(task.deadline) >= new Date()) return false;
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.from || filters.dateRange.to) {
        if (!task.deadline) return false;
        const taskDeadline = new Date(task.deadline);
        if (filters.dateRange.from && taskDeadline < filters.dateRange.from) return false;
        if (filters.dateRange.to && taskDeadline > filters.dateRange.to) return false;
      }

      // Time estimate filter
      if (filters.timeEstimate.min || filters.timeEstimate.max) {
        if (!task.time_estimate) return false;
        if (filters.timeEstimate.min && task.time_estimate < filters.timeEstimate.min) return false;
        if (filters.timeEstimate.max && task.time_estimate > filters.timeEstimate.max) return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        if (!task.tags || !filters.tags.some(tag => task.tags!.includes(tag))) {
          return false;
        }
      }

      return true;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'deadline':
          aValue = a.deadline ? new Date(a.deadline) : new Date('2099-12-31');
          bValue = b.deadline ? new Date(b.deadline) : new Date('2099-12-31');
          break;
        case 'priority':
          const priorityOrder = { 'urgent-important': 4, 'urgent-notImportant': 3, 'notUrgent-important': 2, 'notUrgent-notImportant': 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case 'time_estimate':
          aValue = a.time_estimate || 0;
          bValue = b.time_estimate || 0;
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at || a.created_at);
          bValue = new Date(b.updated_at || b.created_at);
          break;
        default: // created_at
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [tasks, filters]);

  const handleTaskSelect = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(filteredTasks.map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleBulkComplete = async () => {
    for (const taskId of selectedTasks) {
      await updateTask(taskId, { completed: true });
    }
    setSelectedTasks([]);
  };

  const handleBulkArchive = async () => {
    for (const taskId of selectedTasks) {
      await archiveTask(taskId);
    }
    setSelectedTasks([]);
  };

  const handleBulkDelete = async () => {
    for (const taskId of selectedTasks) {
      await deleteTask(taskId);
    }
    setSelectedTasks([]);
  };

  const handleBulkUpdatePriority = async (priority: string) => {
    for (const taskId of selectedTasks) {
      await updateTask(taskId, { priority: priority as any });
    }
    setSelectedTasks([]);
  };

  const completeTask = async (taskId: string) => {
    const task = filteredTasks.find(t => t.id === taskId);
    if (task) {
      await updateTask(taskId, { completed: !task.completed });
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch(priority) {
      case 'urgent-important': return 'Urgent & Important';
      case 'urgent-notImportant': return 'Urgent';
      case 'notUrgent-important': return 'Important';
      default: return 'Normal';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent-important': return 'bg-red-500';
      case 'urgent-notImportant': return 'bg-orange-500';
      case 'notUrgent-important': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const isOverdue = (task: any) => {
    return task.deadline && !task.completed && new Date(task.deadline) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Enhanced Task Management</h2>
        
        {filteredTasks.length > 0 && (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedTasks.length === filteredTasks.length}
              onCheckedChange={handleSelectAll}
              aria-label="Select all tasks"
            />
            <span className="text-sm text-muted-foreground">Select All</span>
          </div>
        )}
      </div>

      <EnhancedTaskFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableTags={availableTags}
        taskCount={filteredTasks.length}
      />

      <TaskBulkActions
        selectedTasks={selectedTasks}
        onClearSelection={() => setSelectedTasks([])}
        onBulkComplete={handleBulkComplete}
        onBulkArchive={handleBulkArchive}
        onBulkDelete={handleBulkDelete}
        onBulkUpdatePriority={handleBulkUpdatePriority}
        onBulkAddTag={() => {}} // TODO: Implement
        onBulkSetDeadline={() => {}} // TODO: Implement
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-4 w-4 bg-muted rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="divide-y">
              {filteredTasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className={`p-4 hover:bg-muted/50 transition-colors ${
                    task.completed ? 'opacity-60' : ''
                  } ${isOverdue(task) ? 'border-l-4 border-l-red-500' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <Checkbox
                      checked={selectedTasks.includes(task.id)}
                      onCheckedChange={(checked) => handleTaskSelect(task.id, checked as boolean)}
                      className="mt-1"
                    />

                    {/* Complete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => completeTask(task.id)}
                      className={`mt-0 h-6 w-6 p-0 rounded-full border ${
                        task.completed 
                          ? 'bg-primary border-primary text-primary-foreground' 
                          : 'border-muted-foreground hover:border-primary'
                      }`}
                    >
                      {task.completed && <CheckCheck className="h-3 w-3" />}
                    </Button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </h3>
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {/* Priority Badge */}
                            <Badge 
                              variant="secondary" 
                              className={`${getPriorityColor(task.priority)} text-white`}
                            >
                              {getPriorityLabel(task.priority)}
                            </Badge>

                            {/* Category Badge */}
                            {task.category_id && (() => {
                              const category = categories.find(c => c.id === task.category_id);
                              return category ? (
                                <Badge 
                                  variant="outline" 
                                  className="flex items-center gap-1 border-2"
                                  style={{ 
                                    borderColor: category.color,
                                    color: category.color
                                  }}
                                >
                                  <div 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: category.color }}
                                  />
                                  {category.name}
                                </Badge>
                              ) : null;
                            })()}

                            {/* Deadline */}
                            {task.deadline && (
                              <Badge 
                                variant={isOverdue(task) ? "destructive" : "outline"}
                                className="flex items-center gap-1"
                              >
                                <Calendar className="h-3 w-3" />
                                {formatPhilippineTime(task.deadline, 'PPP')}
                              </Badge>
                            )}

                            {/* Time Estimate */}
                            {task.time_estimate && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.time_estimate}m
                              </Badge>
                            )}

                            {/* Tags */}
                            {task.tags && task.tags.length > 0 && task.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {tag}
                              </Badge>
                            ))}

                            {/* Overdue Indicator */}
                            {isOverdue(task) && (
                              <Badge variant="destructive">
                                Overdue
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Action Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => {
                                setEditingTask(task);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => archiveTask(task.id)}>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteTask(task.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-medium text-muted-foreground">
                No tasks found
              </h3>
              <p className="mt-1 text-sm text-muted-foreground/60">
                Try adjusting your filters or create a new task.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
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

export default EnhancedTaskManagement;