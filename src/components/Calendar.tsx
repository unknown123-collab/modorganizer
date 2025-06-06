
import React, { useState, useMemo } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

const Calendar = () => {
  const { tasks, timeBlocks, generateSchedule } = useTaskContext();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date());

  // Get tasks for selected date
  const tasksForSelectedDate = useMemo(() => {
    return tasks.filter(task => {
      if (task.deadline && isSameDay(task.deadline, selectedDate)) {
        return true;
      }
      // Also check time blocks
      const taskBlocks = timeBlocks.filter(block => 
        block.taskId === task.id && isSameDay(block.start, selectedDate)
      );
      return taskBlocks.length > 0;
    });
  }, [tasks, timeBlocks, selectedDate]);

  // Get time blocks for selected date
  const blocksForSelectedDate = useMemo(() => {
    return timeBlocks.filter(block => 
      isSameDay(block.start, selectedDate)
    ).sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [timeBlocks, selectedDate]);

  // Get days with tasks/events for the calendar
  const daysWithEvents = useMemo(() => {
    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);
    const daysInMonth = eachDayOfInterval({ start, end });
    
    return daysInMonth.filter(day => {
      // Check if any task has deadline on this day
      const hasDeadline = tasks.some(task => 
        task.deadline && isSameDay(task.deadline, day)
      );
      
      // Check if any time block is on this day
      const hasTimeBlock = timeBlocks.some(block => 
        isSameDay(block.start, day)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <Button onClick={generateSchedule} className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Generate Schedule
        </Button>
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
              modifiers={{
                hasEvents: daysWithEvents
              }}
              modifiersStyles={{
                hasEvents: {
                  backgroundColor: 'hsl(var(--accent))',
                  color: 'hsl(var(--accent-foreground))'
                }
              }}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>{format(selectedDate, 'EEEE, MMM d')}</span>
              {(tasksForSelectedDate.length > 0 || blocksForSelectedDate.length > 0) && (
                <Badge variant="secondary">
                  {tasksForSelectedDate.length + blocksForSelectedDate.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Time Blocks */}
            {blocksForSelectedDate.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Scheduled Tasks
                </h4>
                <div className="space-y-2">
                  {blocksForSelectedDate.map(block => {
                    const task = tasks.find(t => t.id === block.taskId);
                    if (!task) return null;
                    
                    return (
                      <div 
                        key={block.id}
                        className={`p-3 rounded-lg border ${
                          block.completed ? 'bg-muted/30 opacity-75' : 'bg-card'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
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
                        <div className="text-sm text-muted-foreground">
                          {format(block.start, 'h:mm a')} - {format(block.end, 'h:mm a')}
                        </div>
                        {task.category && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {task.category}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Task Deadlines */}
            {tasksForSelectedDate.some(task => task.deadline && isSameDay(task.deadline, selectedDate)) && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Due Today
                </h4>
                <div className="space-y-2">
                  {tasksForSelectedDate
                    .filter(task => task.deadline && isSameDay(task.deadline, selectedDate))
                    .map(task => (
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
                            {getPriorityLabel(task.priority)}
                          </Badge>
                        </div>
                        {task.timeEstimate && (
                          <div className="text-sm text-muted-foreground">
                            Estimated: {task.timeEstimate} minutes
                          </div>
                        )}
                        {task.category && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {task.category}
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
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No tasks or events scheduled for this day</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;
