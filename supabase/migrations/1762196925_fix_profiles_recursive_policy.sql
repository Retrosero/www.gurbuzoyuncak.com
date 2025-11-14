-- Migration: fix_profiles_recursive_policy
-- Created at: 1762196925


-- Drop problematic recursive policy
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;

-- Drop redundant edge function policy (Service role full access already exists)
DROP POLICY IF EXISTS "Edge functions can read profiles" ON profiles;

-- Verify Service role full access policy exists (it does, confirmed in query)
-- This policy allows edge functions to access profiles without recursion:
-- (auth.role() = 'service_role'::text)

COMMENT ON TABLE profiles IS 'Profiles table with non-recursive RLS policies';
;