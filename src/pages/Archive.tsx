import React, { useState, useEffect } from 'react';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { CheckCheck, MoreHorizontal, Filter, Archive } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { SupabaseTask } from '@/hooks/useSupabaseTasks';

const ArchivePage = () => {
  const { updateTask, deleteTask, getArchivedTasks } = useSupabaseTasks();
  const [archivedTasks, setArchivedTasks] = useState<SupabaseTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  
  const filteredTasks = archivedTasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'urgent-important') return task.priority === 'urgent-important';
    if (filter === 'urgent-notImportant') return task.priority === 'urgent-notImportant';
    if (filter === 'notUrgent-important') return task.priority === 'notUrgent-important';
    if (filter === 'notUrgent-notImportant') return task.priority === 'notUrgent-notImportant';
    return true;
  });

  const fetchArchivedTasks = async () => {
    setLoading(true);
    if (getArchivedTasks) {
      const archived = await getArchivedTasks();
      // Type cast the priority field to match SupabaseTask interface
      const typedArchived = (archived || []).map(task => ({
        ...task,
        priority: task.priority as SupabaseTask['priority']
      }));
      setArchivedTasks(typedArchived);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArchivedTasks();
  }, []);
  
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

  const restoreTask = async (taskId: string) => {
    await updateTask(taskId, { archived: false, completed: false });
    setArchivedTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const permanentlyDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    setArchivedTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Archive className="h-8 w-8" />
            Archive
          </h1>
          <div className="text-center py-8">Loading archived tasks...</div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Archive className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Archive</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm font-medium">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              </div>
              
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 text-sm bg-muted px-3 py-1 rounded-md">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilter('all')}>All Tasks</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('urgent-important')}>Urgent & Important</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('urgent-notImportant')}>Urgent</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('notUrgent-important')}>Important</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('notUrgent-notImportant')}>Normal</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Task List */}
            <div className="space-y-2">
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="p-4 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <CheckCheck className="mt-0.5 h-5 w-5 text-green-500" />
                        
                        <div className="flex-1">
                          <div className="font-medium line-through text-muted-foreground">
                            {task.title}
                          </div>
                          
                          {task.description && (
                            <div className="text-sm text-muted-foreground mt-1 line-through">
                              {task.description}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <div className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(task.priority)} text-white`}>
                              {getPriorityLabel(task.priority)}
                            </div>
                            
                            {task.deadline && (
                              <div className="text-xs text-muted-foreground">
                                Due: {new Date(task.deadline).toLocaleDateString()}
                              </div>
                            )}
                            
                            <div className="text-xs text-muted-foreground">
                              Completed: {new Date(task.updated_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => restoreTask(task.id)}>
                            Restore Task
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => permanentlyDeleteTask(task.id)}
                            className="text-destructive"
                          >
                            Delete Permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No archived tasks found. Complete some tasks to see them here!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return renderMainContent();
};

export default ArchivePage;