-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Add notification preferences to user_settings
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reminder_times TEXT[] DEFAULT ARRAY['08:00', '18:00'];

-- Schedule the task reminder checker to run twice daily
-- At 8:00 AM (for today's reminders) and 6:00 PM (for tomorrow's reminders)
SELECT cron.schedule(
    'check-task-reminders-morning',
    '0 8 * * *',
    $$
    SELECT net.http_post(
        url := 'https://mgqtafcaerqqfkkytadf.supabase.co/functions/v1/check-task-reminders',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ncXRhZmNhZXJxcWZra3l0YWRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDIxMDcsImV4cCI6MjA2NDg3ODEwN30._mH04GLiBD9N0ldryyhRbO0esoBxksZZLKsAjjPtjsI"}'::jsonb,
        body := '{"type": "morning"}'::jsonb
    ) as request_id;
    $$
);

SELECT cron.schedule(
    'check-task-reminders-evening',
    '0 18 * * *',
    $$
    SELECT net.http_post(
        url := 'https://mgqtafcaerqqfkkytadf.supabase.co/functions/v1/check-task-reminders',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ncXRhZmNhZXJxcWZra3l0YWRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDIxMDcsImV4cCI6MjA2NDg3ODEwN30._mH04GLiBD9N0ldryyhRbO0esoBxksZZLKsAjjPtjsI"}'::jsonb,
        body := '{"type": "evening"}'::jsonb
    ) as request_id;
    $$
);