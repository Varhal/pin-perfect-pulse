
-- Add columns for token management to pinterest_accounts table
ALTER TABLE public.pinterest_accounts 
  ADD COLUMN IF NOT EXISTS refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS app_secret TEXT;

-- Update the RLS policy to allow access to the new columns
CREATE POLICY IF NOT EXISTS "Users can view their own Pinterest accounts with token data" 
  ON public.pinterest_accounts FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own Pinterest accounts with token data" 
  ON public.pinterest_accounts FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);
