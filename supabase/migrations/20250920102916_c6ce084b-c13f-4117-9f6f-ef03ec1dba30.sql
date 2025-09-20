-- Insert sample tasks for analytics testing
INSERT INTO tasks (title, description, deadline, completed, priority, category_id, time_estimate, tags, user_id, created_at, updated_at)
VALUES 
  ('Complete project proposal', 'Draft and finalize the Q1 project proposal', NOW() + INTERVAL '7 days', false, 'urgent-important', NULL, 120, ARRAY['work', 'important'], auth.uid(), NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('Review marketing materials', 'Review and approve new marketing campaign materials', NOW() + INTERVAL '3 days', true, 'urgent-notImportant', NULL, 60, ARRAY['marketing', 'review'], auth.uid(), NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'),
  ('Team meeting preparation', 'Prepare agenda and materials for weekly team meeting', NOW() + INTERVAL '1 day', false, 'notUrgent-important', NULL, 45, ARRAY['meeting', 'planning'], auth.uid(), NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('Update documentation', 'Update project documentation with latest changes', NOW() + INTERVAL '10 days', true, 'notUrgent-notImportant', NULL, 90, ARRAY['documentation'], auth.uid(), NOW() - INTERVAL '4 days', NOW() - INTERVAL '6 hours'),
  ('Client presentation', 'Prepare and deliver client presentation for Phase 2', NOW() + INTERVAL '5 days', false, 'urgent-important', NULL, 180, ARRAY['client', 'presentation'], auth.uid(), NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('Code review session', 'Review team member code submissions', NOW() + INTERVAL '2 days', true, 'urgent-notImportant', NULL, 75, ARRAY['development', 'review'], auth.uid(), NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 hours'),
  ('Research new tools', 'Research and evaluate new productivity tools', NOW() + INTERVAL '14 days', false, 'notUrgent-important', NULL, 120, ARRAY['research', 'tools'], auth.uid(), NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('Email cleanup', 'Organize and clean up email inbox', NOW() + INTERVAL '7 days', true, 'notUrgent-notImportant', NULL, 30, ARRAY['admin', 'cleanup'], auth.uid(), NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 hours');

-- Insert sample time blocks for analytics testing
INSERT INTO time_blocks (task_id, start_time, end_time, completed, user_id, created_at)
SELECT 
  t.id,
  -- Today's blocks
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY t.created_at) = 1 THEN NOW() - INTERVAL '4 hours'
    WHEN ROW_NUMBER() OVER (ORDER BY t.created_at) = 2 THEN NOW() - INTERVAL '3 hours'
    WHEN ROW_NUMBER() OVER (ORDER BY t.created_at) = 3 THEN NOW() - INTERVAL '2 hours'
    ELSE NOW() - INTERVAL '1 day' - (ROW_NUMBER() OVER (ORDER BY t.created_at) - 4) * INTERVAL '2 hours'
  END as start_time,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY t.created_at) = 1 THEN NOW() - INTERVAL '3 hours'
    WHEN ROW_NUMBER() OVER (ORDER BY t.created_at) = 2 THEN NOW() - INTERVAL '2 hours'
    WHEN ROW_NUMBER() OVER (ORDER BY t.created_at) = 3 THEN NOW() - INTERVAL '1 hour'
    ELSE NOW() - INTERVAL '1 day' - (ROW_NUMBER() OVER (ORDER BY t.created_at) - 4) * INTERVAL '2 hours' + INTERVAL '1 hour'
  END as end_time,
  t.completed,
  t.user_id,
  NOW() - INTERVAL '1 day'
FROM tasks t 
WHERE t.user_id = auth.uid()
LIMIT 6;

-- Insert additional time blocks for historical data (past week)
INSERT INTO time_blocks (task_id, start_time, end_time, completed, user_id, created_at)
SELECT 
  t.id,
  NOW() - INTERVAL '2 days' + (ROW_NUMBER() OVER (ORDER BY t.created_at) * INTERVAL '2 hours'),
  NOW() - INTERVAL '2 days' + (ROW_NUMBER() OVER (ORDER BY t.created_at) * INTERVAL '2 hours') + INTERVAL '1 hour',
  true,
  t.user_id,
  NOW() - INTERVAL '2 days'
FROM tasks t 
WHERE t.user_id = auth.uid() AND t.completed = true
LIMIT 4;

-- Insert blocks for yesterday
INSERT INTO time_blocks (task_id, start_time, end_time, completed, user_id, created_at)
SELECT 
  t.id,
  NOW() - INTERVAL '1 day' + INTERVAL '9 hours',
  NOW() - INTERVAL '1 day' + INTERVAL '10 hours',
  true,
  t.user_id,
  NOW() - INTERVAL '1 day'
FROM tasks t 
WHERE t.user_id = auth.uid() AND t.completed = true
LIMIT 2;