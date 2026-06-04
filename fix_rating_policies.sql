-- FIX Row Level Security for rating table
-- Run this in Supabase SQL Editor to allow authenticated users to manage their own ratings.

DROP POLICY IF EXISTS "Users can insert own rating" ON rating;
DROP POLICY IF EXISTS "Users can select own rating" ON rating;
DROP POLICY IF EXISTS "Users can update own rating" ON rating;

CREATE POLICY "Users can insert own rating" ON rating
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_uuid::text);

CREATE POLICY "Users can select own rating" ON rating
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_uuid::text);

CREATE POLICY "Users can update own rating" ON rating
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_uuid::text)
  WITH CHECK (auth.uid()::text = user_uuid::text);

ALTER TABLE rating ENABLE ROW LEVEL SECURITY;

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'rating'
ORDER BY policyname;