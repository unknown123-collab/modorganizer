-- Add username to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add constraint to ensure username is valid
ALTER TABLE public.profiles
ADD CONSTRAINT IF NOT EXISTS username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20);

ALTER TABLE public.profiles
ADD CONSTRAINT IF NOT EXISTS username_format CHECK (username ~ '^[a-zA-Z0-9_]+$');

-- Add archiving fields to tasks table if they don't exist
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Update the updated_at trigger for profiles
CREATE TRIGGER IF NOT EXISTS update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();