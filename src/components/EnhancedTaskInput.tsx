
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Sparkles, Clock, Target } from 'lucide-react';
import { format } from 'date-fns';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { formatPhilippineTime } from '@/utils/timezone';

const EnhancedTaskInput = () => {
  const { addTask, categories } = useSupabaseTasks();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'notUrgent-notImportant' as const,
    timeEstimate: '',
    categoryId: '',
    deadline: undefined as Date | undefined
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    await addTask({
      title: formData.title,
      description: formData.description || undefined,
      priority: formData.priority,
      time_estimate: formData.timeEstimate ? parseInt(formData.timeEstimate) : undefined,
      category_id: formData.categoryId || undefined,
      deadline: formData.deadline?.toISOString(),
      completed: false,
      tags: []
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      priority: 'notUrgent-notImportant',
      timeEstimate: '',
      categoryId: '',
      deadline: undefined
    });
    setIsOpen(false);
  };

  const priorityOptions = [
    { value: 'urgent-important', label: 'Urgent & Important', color: 'bg-red-500' },
    { value: 'urgent-notImportant', label: 'Urgent', color: 'bg-orange-500' },
    { value: 'notUrgent-important', label: 'Important', color: 'bg-yellow-500' },
    { value: 'notUrgent-notImportant', label: 'Normal', color: 'bg-blue-500' }
  ];

  if (!isOpen) {
    return (
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div 
            onClick={() => setIsOpen(true)}
            className="cursor-pointer w-full p-4 text-left rounded-lg hover:bg-muted/50 transition-colors border border-input bg-background"
          >
            <div className="flex items-start gap-3">
              <Plus className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-muted-foreground text-sm mb-1">
                  Add a new task - click here to create task with priority, time estimates, and deadlines...
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Set Priority
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Time Estimate
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Add Deadline
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Create New Task
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="text-lg"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add more details about this task..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Priority and Time Estimate Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4" />
                Priority
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-lg z-50">
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${option.color}`} />
                        <span className="text-sm">{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                Time Estimate (minutes)
              </Label>
              <Input
                type="number"
                placeholder="30"
                value={formData.timeEstimate}
                onChange={(e) => setFormData(prev => ({ ...prev, timeEstimate: e.target.value }))}
                className="h-10"
              />
            </div>
          </div>

          {/* Category and Deadline Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-lg z-50">
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm">{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-10"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="text-sm">
                      {formData.deadline ? formatPhilippineTime(formData.deadline, "PPP") : "Pick a date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.deadline}
                    onSelect={(date) => setFormData(prev => ({ ...prev, deadline: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="submit" className="flex-1 h-11">
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="h-11"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnhancedTaskInput;
