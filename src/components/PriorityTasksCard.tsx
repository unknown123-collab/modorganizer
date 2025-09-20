
import React from 'react';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { CheckCircle } from 'lucide-react';
import { formatPhilippineTime } from '@/utils/timezone';

const PriorityTasksCard = () => {
  const { tasks, updateTask } = useSupabaseTasks();
  
  // Get priority tasks (limit to 5, prioritize by urgency and importance)
  const getPriorityTasks = (limit = 5) => {
    const priorityOrder = {
      'urgent-important': 1,
      'urgent-notImportant': 2, 
      'notUrgent-important': 3,
      'notUrgent-notImportant': 4
    };
    
    return tasks
      .filter(task => !task.completed)
      .sort((a, b) => {
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 4;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 4;
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        // If same priority, sort by deadline
        if (a.deadline && b.deadline) {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        
        return 0;
      })
      .slice(0, limit);
  };
  
  const priorityTasks = getPriorityTasks(5);
  
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent-important': return 'bg-red-500';
      case 'urgent-notImportant': return 'bg-orange-500';
      case 'notUrgent-important': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };
  
  const completeTask = async (taskId: string) => {
    await updateTask(taskId, { completed: true });
  };
  
  return (
    <div className="bg-card rounded-lg shadow-sm border p-4 h-full">
      <h2 className="text-lg font-semibold mb-4">Priority Tasks</h2>
      
      {priorityTasks.length > 0 ? (
        <ul className="space-y-2">
          {priorityTasks.map(task => (
            <li key={task.id} className="flex items-start justify-between gap-2 p-2 rounded-md hover:bg-accent/50">
              <div className="flex items-start gap-2">
                <div className={`w-2 h-2 mt-2 rounded-full ${getPriorityColor(task.priority)}`} />
                <div>
                  <div className="font-medium">{task.title}</div>
                  {task.deadline && (
                     <div className="text-xs text-muted-foreground">
                       Due: {formatPhilippineTime(task.deadline, 'PPP')}
                     </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => completeTask(task.id)}
                className="text-muted-foreground hover:text-primary"
              >
                <CheckCircle className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-muted-foreground text-center py-6">
          No priority tasks at the moment
        </div>
      )}
    </div>
  );
};

export default PriorityTasksCard;
