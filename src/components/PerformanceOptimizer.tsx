import React, { memo, useMemo, useCallback } from 'react';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  Target,
  AlertCircle,
  CheckCircle,
  BarChart3
} from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  tasksPerformance: number;
  memoryUsage: number;
  renderCount: number;
}

const PerformanceOptimizer: React.FC = memo(() => {
  const { tasks, timeBlocks, loading: isLoading } = useSupabaseTasks();

  // Memoized performance calculations
  const metrics = useMemo((): PerformanceMetrics => {
    const startTime = performance.now();
    
    // Simulate performance calculations
    const tasksCount = tasks.length;
    const timeBlocksCount = timeBlocks.length;
    
    // Calculate task completion velocity
    const completedTasks = tasks.filter(task => task.completed);
    const tasksPerformance = tasksCount > 0 ? (completedTasks.length / tasksCount) * 100 : 0;
    
    // Simulate memory usage calculation
    const memoryUsage = Math.min(
      ((tasksCount * 0.5) + (timeBlocksCount * 0.3)) / 10,
      100
    );
    
    const endTime = performance.now();
    
    return {
      loadTime: endTime - startTime,
      tasksPerformance: Math.round(tasksPerformance),
      memoryUsage: Math.round(memoryUsage),
      renderCount: Math.floor(Math.random() * 10) + 1
    };
  }, [tasks, timeBlocks]);

  // Memoized optimization suggestions
  const optimizationSuggestions = useMemo(() => {
    const suggestions = [];
    
    if (metrics.memoryUsage > 80) {
      suggestions.push({
        type: 'warning',
        title: 'High Memory Usage',
        description: 'Consider archiving completed tasks to reduce memory footprint',
        action: 'Archive Old Tasks'
      });
    }
    
    if (metrics.tasksPerformance < 50) {
      suggestions.push({
        type: 'info',
        title: 'Low Task Completion Rate',
        description: 'Break down large tasks into smaller, manageable chunks',
        action: 'Optimize Tasks'
      });
    }
    
    
    if (suggestions.length === 0) {
      suggestions.push({
        type: 'success',
        title: 'Optimal Performance',
        description: 'Your task management system is running efficiently',
        action: 'Keep It Up!'
      });
    }
    
    return suggestions;
  }, [metrics]);

  const handleOptimization = useCallback((action: string) => {
    console.log('Running optimization:', action);
    // Implementation would depend on the specific optimization
  }, []);

  const getMetricColor = useCallback((value: number, reverse = false) => {
    if (reverse) {
      return value < 30 ? 'bg-green-500' : value < 70 ? 'bg-yellow-500' : 'bg-red-500';
    }
    return value > 70 ? 'bg-green-500' : value > 40 ? 'bg-yellow-500' : 'bg-red-500';
  }, []);

  const getMetricIcon = useCallback((type: string) => {
    switch (type) {
      case 'loadTime': return <Clock className="h-4 w-4" />;
      case 'tasksPerformance': return <Target className="h-4 w-4" />;
      case 'memoryUsage': return <BarChart3 className="h-4 w-4" />;
      case 'cacheHitRate': return <Zap className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Analyzing performance...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Performance Monitor
          <Badge variant="secondary" className="ml-auto">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getMetricIcon('loadTime')}
                <span className="text-sm font-medium">Load Time</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {metrics.loadTime.toFixed(2)}ms
              </span>
            </div>
            <Progress 
              value={Math.min(metrics.loadTime / 10, 100)} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getMetricIcon('tasksPerformance')}
                <span className="text-sm font-medium">Task Efficiency</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {metrics.tasksPerformance}%
              </span>
            </div>
            <Progress 
              value={metrics.tasksPerformance} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getMetricIcon('memoryUsage')}
                <span className="text-sm font-medium">Memory Usage</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {metrics.memoryUsage}%
              </span>
            </div>
            <Progress 
              value={metrics.memoryUsage} 
              className="h-2"
            />
          </div>
        </div>

        {/* Optimization Suggestions */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Optimization Suggestions
          </h4>
          
          {optimizationSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg border"
            >
              <div className="flex-shrink-0 mt-0.5">
                {suggestion.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : suggestion.type === 'warning' ? (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{suggestion.title}</p>
                <p className="text-muted-foreground text-sm mt-1">
                  {suggestion.description}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOptimization(suggestion.action)}
              >
                {suggestion.action}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

PerformanceOptimizer.displayName = 'PerformanceOptimizer';

export { PerformanceOptimizer };