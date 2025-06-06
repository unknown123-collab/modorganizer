
import React from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { CheckCircle } from 'lucide-react';

const PriorityTasksCard = () => {
  const { getPriorityTasks, completeTask } = useTaskContext();
  const priorityTasks = getPriorityTasks(5);
  
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent-important': return 'bg-red-500';
      case 'urgent-notImportant': return 'bg-orange-500';
      case 'notUrgent-important': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
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
                      Due: {task.deadline.toLocaleDateString()}
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
