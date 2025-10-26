import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, X, Target, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useSupabaseTasks, SupabaseTask } from '@/hooks/useSupabaseTasks';
import { formatPhilippineTime, toPhilippineTime } from '@/utils/timezone';
import { TagsInput } from '@/components/ui/tags-input';

interface TaskEditDialogProps {
  task: SupabaseTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TaskEditDialog = ({ task, open, onOpenChange }: TaskEditDialogProps) => {
  const { updateTask, categories } = useSupabaseTasks();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'notUrgent-notImportant' as SupabaseTask['priority'],
    categoryId: '',
    timeStarts: undefined as Date | undefined,
    timeEnds: undefined as Date | undefined,
    tags: [] as string[]
  });

  useEffect(() => {
    if (task) {
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      categoryId: task.category_id || '',
      timeStarts: task.time_starts ? new Date(task.time_starts) : undefined,
      timeEnds: task.time_ends ? new Date(task.time_ends) : undefined,
      tags: task.tags || []
    });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !formData.title.trim() || !formData.description.trim()) {
      alert('Title and Description are required');
      return;
    }
    
    if (formData.timeStarts && formData.timeEnds) {
      if (formData.timeEnds <= formData.timeStarts) {
        alert('End time must be later than start time');
        return;
      }
    }

    await updateTask(task.id, {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      category_id: formData.categoryId || undefined,
      time_starts: formData.timeStarts?.toISOString(),
      time_ends: formData.timeEnds?.toISOString(),
      tags: formData.tags
    });

    onOpenChange(false);
  };

  const priorityOptions = [
    { value: 'urgent-important', label: 'Urgent & Important', color: 'bg-red-500' },
    { value: 'urgent-notImportant', label: 'Urgent', color: 'bg-orange-500' },
    { value: 'notUrgent-important', label: 'Important', color: 'bg-yellow-500' },
    { value: 'notUrgent-notImportant', label: 'Normal', color: 'bg-blue-500' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Edit Task
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Task Title</Label>
            <Input
              id="edit-title"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="text-lg"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description *</Label>
            <Textarea
              id="edit-description"
              placeholder="Add details about this task (required)..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
            />
          </div>

          {/* Priority */}
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
              <SelectContent className="bg-popover border border-border shadow-lg z-[100]">
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

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm">Category</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg z-[100]">
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

          {/* Time Starts and Time Ends */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Time Starts *</Label>
              <Input
                type="datetime-local"
                value={formData.timeStarts ? format(formData.timeStarts, "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, timeStarts: e.target.value ? new Date(e.target.value) : undefined }))}
                className="h-10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Time Ends *</Label>
              <Input
                type="datetime-local"
                value={formData.timeEnds ? format(formData.timeEnds, "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, timeEnds: e.target.value ? new Date(e.target.value) : undefined }))}
                className="h-10"
                required
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm">Tags</Label>
            <TagsInput
              tags={formData.tags}
              onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
              placeholder="Add tags like 'meeting', 'planning', 'cleanup'..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="submit" className="flex-1 h-11">
              <Save className="mr-2 h-4 w-4" />
              Update Task
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditDialog;