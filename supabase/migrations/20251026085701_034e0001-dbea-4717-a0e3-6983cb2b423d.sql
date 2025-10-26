-- Fix search_path for the validation function
DROP FUNCTION IF EXISTS validate_task_time_range() CASCADE;

CREATE OR REPLACE FUNCTION validate_task_time_range()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.time_starts IS NOT NULL AND NEW.time_ends IS NOT NULL THEN
    IF NEW.time_ends <= NEW.time_starts THEN
      RAISE EXCEPTION 'time_ends must be later than time_starts';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_task_time_range
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION validate_task_time_range();