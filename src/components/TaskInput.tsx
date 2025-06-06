
import React, { useState } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { toast } from '@/components/ui/sonner';

const TaskInput = () => {
  const [input, setInput] = useState('');
  const { createTaskFromText } = useTaskContext();
  
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const newTask = createTaskFromText(input.trim());
      if (newTask) {
        toast.success('Task added successfully');
        setInput('');
      } else {
        toast.error('Failed to create task');
      }
    }
  };
  
  return (
    <div className="w-full p-4 bg-card rounded-lg shadow-sm border">
      <form onSubmit={handleAddTask} className="flex flex-col">
        <div className="mb-1 text-sm font-medium">Add a new task with natural language</div>
        <div className="text-xs text-muted-foreground mb-3">
          Try adding "Complete project report by Friday" or "Call John about meeting tomorrow at 3pm"
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a task with details..."
            className="flex-1 rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskInput;
