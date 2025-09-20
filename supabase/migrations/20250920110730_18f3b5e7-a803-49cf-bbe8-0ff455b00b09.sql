-- Insert sample categories for the user
INSERT INTO categories (name, color, user_id)
VALUES 
  ('Work', '#3B82F6', auth.uid()),
  ('Personal', '#10B981', auth.uid()),
  ('Health', '#F59E0B', auth.uid()),
  ('Learning', '#8B5CF6', auth.uid()),
  ('Shopping', '#EF4444', auth.uid());