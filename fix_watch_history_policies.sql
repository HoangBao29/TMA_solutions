-- FIX Row Level Security for watch_history table
-- Run this in Supabase SQL Editor to allow authenticated users to manage their own watch history.

DROP POLICY IF EXISTS "Users can insert own watch history" ON watch_history;
DROP POLICY IF EXISTS "Users can select own watch history" ON watch_history;
DROP POLICY IF EXISTS "Users can update own watch history" ON watch_history;
DROP POLICY IF EXISTS "Users can delete own watch history" ON watch_history;

CREATE POLICY "Users can insert own watch history" ON watch_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can select own watch history" ON watch_history
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own watch history" ON watch_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own watch history" ON watch_history
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'watch_history'
ORDER BY policyname;
