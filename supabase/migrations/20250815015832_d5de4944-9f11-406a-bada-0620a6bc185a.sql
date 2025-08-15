-- Add archived field to tasks table
ALTER TABLE public.tasks ADD COLUMN archived BOOLEAN NOT NULL DEFAULT false;

-- Update existing completed tasks to be archived
UPDATE public.tasks SET archived = true WHERE completed = true;

-- Create index for better performance on archived queries
CREATE INDEX idx_tasks_archived ON public.tasks(archived);
CREATE INDEX idx_tasks_user_archived ON public.tasks(user_id, archived);