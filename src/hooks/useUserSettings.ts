import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserSettings {
  user_id: string;
  work_hours_start: string;
  work_hours_end: string;
  work_days: number[];
  focus_time: number;
  break_time: number;
  notifications: boolean;
  email_notifications: boolean;
  theme: string;
  reminder_times: string[];
  created_at: string;
  updated_at: string;
}

export const useUserSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      setSettings(data);
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error loading settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved",
      });
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings,
  };
};