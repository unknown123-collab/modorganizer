
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SupabaseTask {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  completed: boolean;
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
      setTasks(data || []);
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
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            ...taskData,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => [data, ...prev]);
      toast({
        title: "Task created",
        description: "Your task has been added successfully"
      });
      
      return data;
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
      
      setTasks(prev => prev.map(task => task.id === id ? data : task));
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully"
      });
      
      return data;
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
      const { data, error } = await supabase
        .from('categories')
        .insert([
          {
            name,
            color,
            user_id: user.id
          }
        ])
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

  // Generate schedule
  const generateSchedule = async () => {
    if (!user) return;

    try {
      // Simple scheduling algorithm: assign incomplete tasks to time blocks
      const incompleteTasks = tasks.filter(task => !task.completed && task.time_estimate);
      const now = new Date();
      const scheduleBlocks: Partial<SupabaseTimeBlock>[] = [];
      
      let currentTime = new Date(now);
      currentTime.setHours(9, 0, 0, 0); // Start at 9 AM
      
      for (const task of incompleteTasks.slice(0, 5)) { // Limit to 5 tasks
        const endTime = new Date(currentTime);
        endTime.setMinutes(endTime.getMinutes() + (task.time_estimate || 30));
        
        scheduleBlocks.push({
          task_id: task.id,
          start_time: currentTime.toISOString(),
          end_time: endTime.toISOString(),
          user_id: user.id,
          completed: false
        });
        
        currentTime = new Date(endTime);
        currentTime.setMinutes(currentTime.getMinutes() + 15); // 15 min break
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
          description: `${scheduleBlocks.length} time blocks created`
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
    generateSchedule,
    refetch: () => {
      fetchTasks();
      fetchCategories();
      fetchTimeBlocks();
    }
  };
};
