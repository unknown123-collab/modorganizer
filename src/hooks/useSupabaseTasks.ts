
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getPhilippineNow, fromPhilippineTime, toPhilippineTime } from '@/utils/timezone';

export interface SupabaseTask {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  completed: boolean;
  archived: boolean;
  priority: 'urgent-important' | 'urgent-notImportant' | 'notUrgent-important' | 'notUrgent-notImportant';
  category_id?: string;
  time_estimate?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface SupabaseCategory {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}

export interface SupabaseTimeBlock {
  id: string;
  task_id: string;
  start_time: string;
  end_time: string;
  completed: boolean;
  user_id: string;
  created_at: string;
}

export const useSupabaseTasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<SupabaseTask[]>([]);
  const [categories, setCategories] = useState<SupabaseCategory[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<SupabaseTimeBlock[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks
  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure proper typing
      const typedTasks = (data || []).map(task => ({
        ...task,
        priority: task.priority as SupabaseTask['priority']
      }));
      
      setTasks(typedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error fetching tasks",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch time blocks
  const fetchTimeBlocks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('time_blocks')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setTimeBlocks(data || []);
    } catch (error) {
      console.error('Error fetching time blocks:', error);
    }
  };

  // Add task
  const addTask = async (taskData: Partial<SupabaseTask>) => {
    if (!user) return;

    try {
      // Ensure required fields are present
      const insertData = {
        title: taskData.title || '',
        user_id: user.id,
        description: taskData.description,
        deadline: taskData.deadline ? fromPhilippineTime(new Date(taskData.deadline)).toISOString() : null,
        completed: taskData.completed || false,
        archived: false,
        priority: taskData.priority || 'notUrgent-notImportant',
        category_id: taskData.category_id,
        time_estimate: taskData.time_estimate,
        tags: taskData.tags
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      
      const typedTask = {
        ...data,
        priority: data.priority as SupabaseTask['priority']
      };
      
      setTasks(prev => [typedTask, ...prev]);
      toast({
        title: "Task created",
        description: "Your task has been added successfully"
      });
      
      return typedTask;
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error creating task",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  // Update task
  const updateTask = async (id: string, updates: Partial<SupabaseTask>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      const typedTask = {
        ...data,
        priority: data.priority as SupabaseTask['priority']
      };
      
      // Update task in the list
      setTasks(prev => prev.map(task => task.id === id ? typedTask : task));
      
      if (typedTask.archived) {
        toast({
          title: "Task archived",
          description: "Your task has been moved to archive"
        });
      } else {
        toast({
          title: "Task updated",
          description: "Your task has been updated successfully"
        });
      }
      
      return typedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error updating task",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  // Delete task
  const deleteTask = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== id));
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error deleting task",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  // Add category
  const addCategory = async (name: string, color: string = '#3B82F6') => {
    if (!user) return;

    try {
      const insertData = {
        name,
        color,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('categories')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      
      setCategories(prev => [data, ...prev]);
      toast({
        title: "Category created",
        description: "Your category has been added successfully"
      });
      
      return data;
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error creating category",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  // Delete category
  const deleteCategory = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setCategories(prev => prev.filter(category => category.id !== id));
      toast({
        title: "Category deleted",
        description: "Your category has been deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error deleting category",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  // Generate schedule
  const generateSchedule = async (specificDate?: Date) => {
    if (!user) return;

    try {
      // Get incomplete, non-archived tasks that need scheduling
      const incompleteTasks = tasks.filter(task => !task.completed && !task.archived);
      
      if (incompleteTasks.length === 0) {
        toast({
          title: "No tasks to schedule",
          description: "All tasks are completed or you have no tasks to schedule"
        });
        return;
      }

      // Determine starting date and time in Philippine timezone
      let currentTime = getPhilippineNow();
      
      if (specificDate) {
        // If specific date is provided, start scheduling from that date
        const philDate = toPhilippineTime(specificDate);
        currentTime = new Date(philDate);
        currentTime.setHours(9, 0, 0, 0); // Start at 9 AM Philippine time
      } else {
        // Default behavior - start from now or next available time
        // If it's past 5 PM or weekend, move to next work day at 9 AM
        if (currentTime.getHours() >= 17 || currentTime.getDay() === 0 || currentTime.getDay() === 6) {
          currentTime.setDate(currentTime.getDate() + 1);
          // Skip weekends
          while (currentTime.getDay() === 0 || currentTime.getDay() === 6) {
            currentTime.setDate(currentTime.getDate() + 1);
          }
          currentTime.setHours(9, 0, 0, 0);
        }
      }
      
      // Sort tasks by priority and deadline
      const sortedTasks = incompleteTasks.sort((a, b) => {
        // Priority order
        const priorityOrder = {
          'urgent-important': 1,
          'urgent-notImportant': 2,
          'notUrgent-important': 3,
          'notUrgent-notImportant': 4
        };
        
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by deadline if both have them
        if (a.deadline && b.deadline) {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (a.deadline) return -1;
        if (b.deadline) return 1;
        
        return 0;
      });
      
      const scheduleBlocks: Array<{
        task_id: string;
        start_time: string;
        end_time: string;
        user_id: string;
        completed: boolean;
      }> = [];
      
      for (const task of sortedTasks) {
        // Skip if task already has a time block
        const existingBlock = timeBlocks.find(block => block.task_id === task.id);
        if (existingBlock) continue;
        
        const duration = task.time_estimate || 60; // Default 1 hour
        const endTime = new Date(currentTime.getTime() + duration * 60 * 1000);
        
        // Check if we're going past 5 PM, move to next work day
        if (endTime.getHours() >= 17) {
          currentTime.setDate(currentTime.getDate() + 1);
          // Skip weekends
          while (currentTime.getDay() === 0 || currentTime.getDay() === 6) {
            currentTime.setDate(currentTime.getDate() + 1);
          }
          currentTime.setHours(9, 0, 0, 0);
        }
        
        // Check for existing blocks on this time slot to avoid conflicts
        const blockStartTime = new Date(currentTime);
        const blockEndTime = new Date(currentTime.getTime() + duration * 60 * 1000);
        
        // Find conflicts with existing time blocks
        const hasConflict = timeBlocks.some(existingBlock => {
          const existingStart = new Date(existingBlock.start_time);
          const existingEnd = new Date(existingBlock.end_time);
          
          return (blockStartTime < existingEnd && blockEndTime > existingStart);
        });
        
        // If there's a conflict, move to the next available slot
        if (hasConflict) {
          // Find the next available slot
          const dayBlocks = timeBlocks
            .filter(block => {
              const blockDate = new Date(block.start_time);
              return blockDate.toDateString() === currentTime.toDateString();
            })
            .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
          
          if (dayBlocks.length > 0) {
            const lastBlock = dayBlocks[dayBlocks.length - 1];
            currentTime = new Date(new Date(lastBlock.end_time).getTime() + 15 * 60 * 1000); // 15 min buffer
          }
        }
        
        // Convert Philippine time to UTC for storage
        const startTimeUTC = fromPhilippineTime(new Date(currentTime));
        const endTimeUTC = fromPhilippineTime(new Date(currentTime.getTime() + duration * 60 * 1000));
        
        scheduleBlocks.push({
          task_id: task.id,
          start_time: startTimeUTC.toISOString(),
          end_time: endTimeUTC.toISOString(),
          user_id: user.id,
          completed: false
        });
        
        // Move to next time slot with 15 min break
        currentTime = new Date(currentTime.getTime() + duration * 60 * 1000 + 15 * 60 * 1000);
      }
      
      if (scheduleBlocks.length > 0) {
        const { data, error } = await supabase
          .from('time_blocks')
          .insert(scheduleBlocks)
          .select();

        if (error) throw error;
        
        setTimeBlocks(prev => [...(data || []), ...prev]);
        toast({
          title: "Schedule generated",
          description: `${scheduleBlocks.length} time blocks created${specificDate ? ` for ${specificDate.toLocaleDateString()}` : ''}`
        });
      } else {
        toast({
          title: "No new blocks created",
          description: "All tasks already have time blocks assigned"
        });
      }
    } catch (error) {
      console.error('Error generating schedule:', error);
      toast({
        title: "Error generating schedule",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchTasks(), fetchCategories(), fetchTimeBlocks()])
        .finally(() => setLoading(false));
    }
  }, [user]);

  return {
    tasks,
    categories,
    timeBlocks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    addCategory,
    deleteCategory,
    generateSchedule,
    refetch: () => {
      fetchTasks();
      fetchCategories();
      fetchTimeBlocks();
    },
    // Archive management
    archiveTask: (id: string) => updateTask(id, { completed: true, archived: true }),
    getArchivedTasks: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', true)
        .order('updated_at', { ascending: false });
      return data || [];
    }
  };
};
