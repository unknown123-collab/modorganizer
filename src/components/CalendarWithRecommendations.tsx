import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { format, isSameDay, startOfDay } from 'date-fns';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import TaskRecommendation from './TaskRecommendation';

const CalendarWithRecommendations = () => {
  const { tasks, categories } = useSupabaseTasks();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date());

  // Get tasks for selected date
  const tasksForSelectedDate = useMemo(() => {
    return tasks.filter(task => {
      if (!task.time_starts) return false;
      const taskDate = new Date(task.time_starts);
      return isSameDay(startOfDay(taskDate), startOfDay(selectedDate));
    }).sort((a, b) => {
      const aTime = new Date(a.time_starts!).getTime();
      const bTime = new Date(b.time_starts!).getTime();
      return aTime - bTime;
    });
  }, [tasks, selectedDate]);

  // Find overlapping tasks
  const overlappingTasks = useMemo(() => {
    const overlaps = [];
    for (let i = 0; i < tasksForSelectedDate.length; i++) {
      for (let j = i + 1; j < tasksForSelectedDate.length; j++) {
        const task1 = tasksForSelectedDate[i];
        const task2 = tasksForSelectedDate[j];
        
        if (!task1.time_starts || !task1.time_ends || !task2.time_starts || !task2.time_ends) continue;
        
        const start1 = new Date(task1.time_starts);
        const end1 = new Date(task1.time_ends);
        const start2 = new Date(task2.time_starts);
        const end2 = new Date(task2.time_ends);
        
        // Check if tasks overlap
        if (start1 < end2 && start2 < end1) {
          // Check if same title
          if (task1.title === task2.title) {
            if (!overlaps.find(group => group.includes(task1) || group.includes(task2))) {
              overlaps.push([task1, task2]);
            }
          }
        }
      }
    }
    return overlaps;
  }, [tasksForSelectedDate]);

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent-important': return 'bg-red-500';
      case 'urgent-notImportant': return 'bg-orange-500';
      case 'notUrgent-important': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return null;
    return categories.find(c => c.id === categoryId)?.name;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calendar & Task Schedule</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{format(viewDate, 'MMMM yyyy')}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(viewDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setViewDate(newDate);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(viewDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setViewDate(newDate);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={viewDate}
              onMonthChange={setViewDate}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>{format(selectedDate, 'EEEE, MMM d')}</span>
              {tasksForSelectedDate.length > 0 && (
                <Badge variant="secondary">{tasksForSelectedDate.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasksForSelectedDate.length > 0 ? (
              <div className="space-y-3">
                {tasksForSelectedDate.map(task => (
                  <div 
                    key={task.id}
                    className={`p-3 rounded-lg border ${
                      task.completed ? 'bg-muted/30 opacity-75' : 'bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${
                        task.completed ? 'line-through text-muted-foreground' : ''
                      }`}>
                        {task.title}
                      </span>
                      <Badge 
                        className={`${getPriorityColor(task.priority)} text-white text-xs`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    )}
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {task.time_starts && format(new Date(task.time_starts), 'h:mm a')}
                      {' - '}
                      {task.time_ends && format(new Date(task.time_ends), 'h:mm a')}
                    </div>
                    {task.category_id && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {getCategoryName(task.category_id)}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No tasks scheduled for this day</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Show recommendations if there are overlapping tasks */}
      {overlappingTasks.map((group, idx) => (
        <TaskRecommendation key={idx} overlappingTasks={group} />
      ))}
    </div>
  );
};

export default CalendarWithRecommendations;