-- Create a cron job to check for task reminders twice daily (8 AM and 6 PM)
-- This will run the check-task-reminders edge function automatically

-- Enable pg_cron and pg_net extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the task reminder check to run twice daily
-- At 8:00 AM (for today reminders) and 6:00 PM (for tomorrow reminders) 
SELECT cron.schedule(
  'task-reminders-morning',
  '0 8 * * *', -- 8:00 AM daily
  $$
  SELECT
    net.http_post(
        url:='https://mgqtafcaerqqfkkytadf.supabase.co/functions/v1/check-task-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ncXRhZmNhZXJxcWZra3l0YWRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMwMjEwNywiZXhwIjoyMDY0ODc4MTA3fQ.IqNF4xK1p8dIjUFJOY7h1X2x7hf7BF4e8QtEr7kPmJQ"}'::jsonb,
        body:='{"scheduled_time": "morning"}'::jsonb
    ) as request_id;
  $$
);

SELECT cron.schedule(
  'task-reminders-evening',
  '0 18 * * *', -- 6:00 PM daily
  $$
  SELECT
    net.http_post(
        url:='https://mgqtafcaerqqfkkytadf.supabase.co/functions/v1/check-task-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ncXRhZmNhZXJxcWZra3l0YWRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMwMjEwNywiZXhwIjoyMDY0ODc4MTA3fQ.IqNF4xK1p8dIjUFJOY7h1X2x7hf7BF4e8QtEr7kPmJQ"}'::jsonb,
        body:='{"scheduled_time": "evening"}'::jsonb
    ) as request_id;
  $$
);