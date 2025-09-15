import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Filter, Search, Calendar as CalendarIcon, Clock, 
  Target, Tag, X, SortAsc, SortDesc 
} from 'lucide-react';
import { format } from 'date-fns';

export interface FilterOptions {
  search: string;
  priority: string[];
  status: string;
  dateRange: {
    from?: Date;
    to?: Date;
  };
  timeEstimate: {
    min?: number;
    max?: number;
  };
  tags: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface EnhancedTaskFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableTags: string[];
  taskCount: number;
}

const EnhancedTaskFilters: React.FC<EnhancedTaskFiltersProps> = ({
  filters,
  onFiltersChange,
  availableTags,
  taskCount
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const togglePriority = (priority: string) => {
    const newPriorities = filters.priority.includes(priority)
      ? filters.priority.filter(p => p !== priority)
      : [...filters.priority, priority];
    updateFilter('priority', newPriorities);
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    updateFilter('tags', newTags);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      priority: [],
      status: 'all',
      dateRange: {},
      timeEstimate: {},
      tags: [],
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.priority.length > 0) count++;
    if (filters.status !== 'all') count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.timeEstimate.min || filters.timeEstimate.max) count++;
    if (filters.tags.length > 0) count++;
    return count;
  };

  const getPriorityLabel = (priority: string) => {
    switch(priority) {
      case 'urgent-important': return 'Urgent & Important';
      case 'urgent-notImportant': return 'Urgent';
      case 'notUrgent-important': return 'Important';
      case 'notUrgent-notImportant': return 'Normal';
      default: return priority;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent-important': return 'bg-red-500 hover:bg-red-600';
      case 'urgent-notImportant': return 'bg-orange-500 hover:bg-orange-600';
      case 'notUrgent-important': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'notUrgent-notImportant': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="space-y-4">
      {/* Search and Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tasks</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority Filter */}
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <div className="flex flex-wrap gap-2">
                    {['urgent-important', 'urgent-notImportant', 'notUrgent-important', 'notUrgent-notImportant'].map(priority => (
                      <Button
                        key={priority}
                        variant={filters.priority.includes(priority) ? "default" : "outline"}
                        size="sm"
                        onClick={() => togglePriority(priority)}
                        className={filters.priority.includes(priority) ? getPriorityColor(priority) : ''}
                      >
                        {getPriorityLabel(priority)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-2">
                  <Label>Deadline Range</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateRange.from ? format(filters.dateRange.from, 'MMM dd') : 'From'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.from}
                          onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, from: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateRange.to ? format(filters.dateRange.to, 'MMM dd') : 'To'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.to}
                          onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, to: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Time Estimate Filter */}
                <div className="space-y-2">
                  <Label>Time Estimate (minutes)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.timeEstimate.min || ''}
                      onChange={(e) => updateFilter('timeEstimate', { 
                        ...filters.timeEstimate, 
                        min: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.timeEstimate.max || ''}
                      onChange={(e) => updateFilter('timeEstimate', { 
                        ...filters.timeEstimate, 
                        max: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                    />
                  </div>
                </div>

                {/* Tags Filter */}
                {availableTags.length > 0 && (
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map(tag => (
                        <Button
                          key={tag}
                          variant={filters.tags.includes(tag) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleTag(tag)}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sort Options */}
                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <div className="flex gap-2">
                    <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at">Date Created</SelectItem>
                        <SelectItem value="updated_at">Last Modified</SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="time_estimate">Time Estimate</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="text-sm text-muted-foreground">
            {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              "{filters.search}"
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => updateFilter('search', '')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.priority.map(priority => (
            <Badge key={priority} variant="secondary" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {getPriorityLabel(priority)}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => togglePriority(priority)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {filters.status}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => updateFilter('status', 'all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {tag}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => toggleTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedTaskFilters;