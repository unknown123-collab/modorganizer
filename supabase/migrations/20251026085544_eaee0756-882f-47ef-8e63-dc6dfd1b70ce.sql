-- First, update existing tasks to have empty description if null
UPDATE tasks SET description = '' WHERE description IS NULL;

-- Make description required and add time_starts and time_ends fields
ALTER TABLE tasks 
  ALTER COLUMN description SET NOT NULL,
  ALTER COLUMN description SET DEFAULT '',
  ADD COLUMN time_starts timestamp with time zone,
  ADD COLUMN time_ends timestamp with time zone;

-- Add validation trigger to ensure time_ends is after time_starts
CREATE OR REPLACE FUNCTION validate_task_time_range()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.time_starts IS NOT NULL AND NEW.time_ends IS NOT NULL THEN
    IF NEW.time_ends <= NEW.time_starts THEN
      RAISE EXCEPTION 'time_ends must be later than time_starts';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_task_time_range
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION validate_task_time_range();