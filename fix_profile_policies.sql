-- 🔧 FIX INFINITE RECURSION IN PROFILE POLICIES
-- Run this in Supabase SQL Editor to fix the infinite recursion error

-- Step 1: Drop all existing policies on profile table
DROP POLICY IF EXISTS "Users can view own profile" ON profile;
DROP POLICY IF EXISTS "Users can update own profile" ON profile;
DROP POLICY IF EXISTS "Users can insert own profile" ON profile;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profile;
DROP POLICY IF EXISTS "Admin can update all profiles" ON profile;
DROP POLICY IF EXISTS "Allow profile creation" ON profile;
DROP POLICY IF EXISTS "Allow profile read" ON profile;
DROP POLICY IF EXISTS "Allow profile update" ON profile;

-- Ensure the banned column exists so admin can lock accounts
ALTER TABLE profile ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT FALSE;

-- Step 2: Create policies that allow each user to manage their own profile
CREATE POLICY "Users can insert own profile" ON profile
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can select own profile" ON profile
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profile
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin helper function to check profile role without causing RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.profile
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

CREATE POLICY "Admin can select all profiles" ON profile
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can update all profiles" ON profile
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Note: Do not reference the same profile table inside admin policies,
-- because that can cause infinite recursion in RLS.

-- Step 3: Ensure RLS is enabled
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

-- Step 4: Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profile'
ORDER BY policyname;