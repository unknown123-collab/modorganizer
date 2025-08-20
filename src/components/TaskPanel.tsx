
import React, { useState } from 'react';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import TaskInput from './TaskInput';
import { CheckCheck, MoreHorizontal, Filter } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const TaskPanel = () => {
  const { tasks, updateTask, deleteTask, archiveTask } = useSupabaseTasks();
  const [filter, setFilter] = useState<string>('all');
  
  // Only show non-archived tasks
  const filteredTasks = tasks.filter(task => {
    if (task.archived) return false; // Don't show archived tasks
    
    if (filter === 'all') return true;
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    if (filter === 'urgent-important') return task.priority === 'urgent-important';
    if (filter === 'urgent-notImportant') return task.priority === 'urgent-notImportant';
    if (filter === 'notUrgent-important') return task.priority === 'notUrgent-important';
    if (filter === 'notUrgent-notImportant') return task.priority === 'notUrgent-notImportant';
    return true;
  });
  
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

  const completeTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      if (!task.completed) {
        // Archive completed tasks
        await archiveTask(taskId);
      } else {
        // When unchecking, unarchive the task and mark as incomplete
        await updateTask(taskId, { completed: false, archived: false });
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tasks</h1>
      
      <TaskInput />
      
      {/* Filters */}
      <div className="flex justify-between items-center">
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
              <DropdownMenuItem onClick={() => setFilter('pending')}>Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('completed')}>Completed</DropdownMenuItem>
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
              className={`p-4 rounded-lg border ${task.completed ? 'bg-muted/30' : 'bg-card'}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <button 
                    onClick={() => completeTask(task.id)}
                    className={`mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center ${
                      task.completed ? 'bg-primary border-primary' : 'border-muted-foreground'
                    }`}
                  >
                    {task.completed && <CheckCheck className="h-3 w-3 text-white" />}
                  </button>
                  
                  <div className="flex-1">
                    <div className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <div className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(task.priority)} text-white`}>
                        {getPriorityLabel(task.priority)}
                      </div>
                      
                      {task.deadline && (
                        <div className="text-xs text-muted-foreground">
                          Due: {new Date(task.deadline).toLocaleDateString()}
                        </div>
                      )}
                      
                      {task.time_estimate && (
                        <div className="text-xs text-muted-foreground">
                          Est: {task.time_estimate} min
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => completeTask(task.id)}>
                      {task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteTask(task.id)}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No tasks found. Add a task to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskPanel;
