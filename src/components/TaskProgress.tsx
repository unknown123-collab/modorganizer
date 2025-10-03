import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: string;
  category_id: string | null;
  deadline: string | null;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface ProgressStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
  byPriority: Record<string, { total: number; completed: number }>;
  byCategory: Record<string, { total: number; completed: number; name: string; color: string }>;
}

export const TaskProgress: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProgressStats>({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0,
    byPriority: {},
    byCategory: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch tasks
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('id, title, completed, priority, category_id, deadline')
          .eq('user_id', user.id)
          .eq('archived', false);

        if (tasksError) throw tasksError;

        // Fetch categories
        const { data: categories, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, color')
          .eq('user_id', user.id);

        if (categoriesError) throw categoriesError;

        // Calculate stats
        const total = tasks?.length || 0;
        const completed = tasks?.filter((t) => t.completed).length || 0;
        const pending = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Group by priority
        const byPriority: Record<string, { total: number; completed: number }> = {};
        tasks?.forEach((task) => {
          const priority = task.priority || 'notUrgent-notImportant';
          if (!byPriority[priority]) {
            byPriority[priority] = { total: 0, completed: 0 };
          }
          byPriority[priority].total++;
          if (task.completed) byPriority[priority].completed++;
        });

        // Group by category
        const categoryMap = new Map(categories?.map((c) => [c.id, c]) || []);
        const byCategory: Record<string, { total: number; completed: number; name: string; color: string }> = {};
        
        tasks?.forEach((task) => {
          if (task.category_id) {
            const category = categoryMap.get(task.category_id);
            if (category) {
              if (!byCategory[task.category_id]) {
                byCategory[task.category_id] = {
                  total: 0,
                  completed: 0,
                  name: category.name,
                  color: category.color,
                };
              }
              byCategory[task.category_id].total++;
              if (task.completed) byCategory[task.category_id].completed++;
            }
          }
        });

        setStats({
          total,
          completed,
          pending,
          completionRate,
          byPriority,
          byCategory,
        });
      } catch (error: any) {
        console.error('Error fetching progress data:', error);
        toast.error('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up realtime subscription for tasks
    const channel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Task change:', payload);
          fetchData(); // Refetch data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      'urgent-important': 'Urgent & Important',
      'urgent-notImportant': 'Urgent',
      'notUrgent-important': 'Important',
      'notUrgent-notImportant': 'Low Priority',
    };
    return labels[priority] || priority;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Task Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Completion</span>
            <span className="text-2xl font-bold">{stats.completionRate}%</span>
          </div>
          <Progress value={stats.completionRate} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{stats.completed} completed</span>
            <span>{stats.pending} pending</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-primary/10 p-3 rounded-lg text-center">
            <Target className="h-4 w-4 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="bg-emerald-500/10 p-3 rounded-lg text-center">
            <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-emerald-600" />
            <div className="text-lg font-bold">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">Done</div>
          </div>
          <div className="bg-amber-500/10 p-3 rounded-lg text-center">
            <Clock className="h-4 w-4 mx-auto mb-1 text-amber-600" />
            <div className="text-lg font-bold">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
        </div>

        {/* Progress by Priority */}
        {Object.keys(stats.byPriority).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">By Priority</h4>
            {Object.entries(stats.byPriority).map(([priority, data]) => {
              const percentage = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
              return (
                <div key={priority} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>{getPriorityLabel(priority)}</span>
                    <span className="font-medium">
                      {data.completed}/{data.total}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        )}

        {/* Progress by Category */}
        {Object.keys(stats.byCategory).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">By Category</h4>
            {Object.entries(stats.byCategory).map(([categoryId, data]) => {
              const percentage = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
              return (
                <div key={categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: data.color }}
                      />
                      <span>{data.name}</span>
                    </div>
                    <span className="font-medium">
                      {data.completed}/{data.total}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        )}

        {stats.total === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No tasks yet. Create your first task to see progress!
          </div>
        )}
      </CardContent>
    </Card>
  );
};
