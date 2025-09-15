import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  CheckCheck, Archive, Trash2, Tag, Calendar, 
  Clock, Target, MoreHorizontal, X 
} from 'lucide-react';

interface TaskBulkActionsProps {
  selectedTasks: string[];
  onClearSelection: () => void;
  onBulkComplete: () => void;
  onBulkArchive: () => void;
  onBulkDelete: () => void;
  onBulkUpdatePriority: (priority: string) => void;
  onBulkAddTag: () => void;
  onBulkSetDeadline: () => void;
}

const TaskBulkActions: React.FC<TaskBulkActionsProps> = ({
  selectedTasks,
  onClearSelection,
  onBulkComplete,
  onBulkArchive,
  onBulkDelete,
  onBulkUpdatePriority,
  onBulkAddTag,
  onBulkSetDeadline
}) => {
  if (selectedTasks.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b p-4 mb-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            {selectedTasks.length} selected
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkComplete}
            className="flex items-center gap-1"
          >
            <CheckCheck className="h-4 w-4" />
            Complete
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onBulkArchive}
            className="flex items-center gap-1"
          >
            <Archive className="h-4 w-4" />
            Archive
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                Priority
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onBulkUpdatePriority('urgent-important')}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  Urgent & Important
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkUpdatePriority('urgent-notImportant')}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  Urgent
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkUpdatePriority('notUrgent-important')}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  Important
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkUpdatePriority('notUrgent-notImportant')}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  Normal
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onBulkAddTag}>
                <Tag className="h-4 w-4 mr-2" />
                Add Tags
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onBulkSetDeadline}>
                <Calendar className="h-4 w-4 mr-2" />
                Set Deadline
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onBulkDelete}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default TaskBulkActions;