
import React, { useState, useMemo } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';

const EnhancedCalendar = () => {
  const { tasks, timeBlocks, generateSchedule, categories } = useSupabaseTasks();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date());

  // Get tasks for selected date
  const tasksForSelectedDate = useMemo(() => {
    return tasks.filter(task => {
      if (task.deadline && isSameDay(new Date(task.deadline), selectedDate)) {
        return true;
      }
      // Also check time blocks
      const taskBlocks = timeBlocks.filter(block => 
        block.task_id === task.id && isSameDay(new Date(block.start_time), selectedDate)
      );
      return taskBlocks.length > 0;
    });
  }, [tasks, timeBlocks, selectedDate]);

  // Get time blocks for selected date
  const blocksForSelectedDate = useMemo(() => {
    return timeBlocks.filter(block => 
      isSameDay(new Date(block.start_time), selectedDate)
    ).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [timeBlocks, selectedDate]);

  // Get days with tasks/events for the calendar
  const daysWithEvents = useMemo(() => {
    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);
    const daysInMonth = eachDayOfInterval({ start, end });
    
    return daysInMonth.filter(day => {
      // Check if any task has deadline on this day
      const hasDeadline = tasks.some(task => 
        task.deadline && isSameDay(new Date(task.deadline), day)
      );
      
      // Check if any time block is on this day
      const hasTimeBlock = timeBlocks.some(block => 
        isSameDay(new Date(block.start_time), day)
      );
      
      return hasDeadline || hasTimeBlock;
    });
  }, [tasks, timeBlocks, viewDate]);

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent-important': return 'bg-red-500';
      case 'urgent-notImportant': return 'bg-orange-500';
      case 'notUrgent-important': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch(priority) {
      case 'urgent-important': return 'Urgent & Important';
      case 'urgent-notImportant': return 'Urgent';
      case 'notUrgent-important': return 'Important';
      default: return 'Normal';
    }
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return null;
    return categories.find(cat => cat.id === categoryId)?.name;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Calendar</h1>
        </div>
        <Button onClick={generateSchedule} className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Generate Smart Schedule
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <span className="text-xl">{format(viewDate, 'MMMM yyyy')}</span>
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
              modifiers={{
                hasEvents: daysWithEvents
              }}
              modifiersStyles={{
                hasEvents: {
                  backgroundColor: 'hsl(var(--accent))',
                  color: 'hsl(var(--accent-foreground))',
                  fontWeight: 'bold'
                }
              }}
              className="w-full border-0"
            />
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">{format(selectedDate, 'EEEE, MMM d')}</span>
              {(tasksForSelectedDate.length > 0 || blocksForSelectedDate.length > 0) && (
                <Badge variant="secondary" className="ml-auto">
                  {tasksForSelectedDate.length + blocksForSelectedDate.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Time Blocks */}
            {blocksForSelectedDate.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Scheduled Tasks
                </h4>
                <div className="space-y-3">
                  {blocksForSelectedDate.map(block => {
                    const task = tasks.find(t => t.id === block.task_id);
                    if (!task) return null;
                    
                    return (
                      <div 
                        key={block.id}
                        className={`p-4 rounded-lg border-l-4 ${
                          block.completed ? 'bg-muted/30 opacity-75' : 'bg-card shadow-sm'
                        }`}
                        style={{ 
                          borderLeftColor: task.category_id 
                            ? categories.find(c => c.id === task.category_id)?.color || '#3B82F6'
                            : '#3B82F6'
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium ${
                            block.completed ? 'line-through text-muted-foreground' : ''
                          }`}>
                            {task.title}
                          </span>
                          <Badge 
                            className={`${getPriorityColor(task.priority)} text-white text-xs`}
                          >
                            {getPriorityLabel(task.priority)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {format(new Date(block.start_time), 'h:mm a')} - {format(new Date(block.end_time), 'h:mm a')}
                        </div>
                        {task.category_id && (
                          <Badge variant="outline" className="text-xs">
                            {getCategoryName(task.category_id)}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Task Deadlines */}
            {tasksForSelectedDate.some(task => task.deadline && isSameDay(new Date(task.deadline), selectedDate)) && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  Due Today
                </h4>
                <div className="space-y-3">
                  {tasksForSelectedDate
                    .filter(task => task.deadline && isSameDay(new Date(task.deadline), selectedDate))
                    .map(task => (
                      <div 
                        key={task.id}
                        className={`p-4 rounded-lg border ${
                          task.completed ? 'bg-muted/30 opacity-75' : 'bg-card shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium ${
                            task.completed ? 'line-through text-muted-foreground' : ''
                          }`}>
                            {task.title}
                          </span>
                          <Badge 
                            className={`${getPriorityColor(task.priority)} text-white text-xs`}
                          >
                            {getPriorityLabel(task.priority)}
                          </Badge>
                        </div>
                        {task.time_estimate && (
                          <div className="text-sm text-muted-foreground mb-2">
                            Estimated: {task.time_estimate} minutes
                          </div>
                        )}
                        {task.category_id && (
                          <Badge variant="outline" className="text-xs">
                            {getCategoryName(task.category_id)}
                          </Badge>
                        )}
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {/* No events */}
            {tasksForSelectedDate.length === 0 && blocksForSelectedDate.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No tasks scheduled</p>
                <p className="text-sm">This day is free for new tasks</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedCalendar;
