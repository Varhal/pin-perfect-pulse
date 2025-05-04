
-- Create a table for Pinterest accounts
CREATE TABLE IF NOT EXISTS public.pinterest_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  api_key TEXT NOT NULL,
  app_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Set up Row Level Security
ALTER TABLE public.pinterest_accounts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own accounts
CREATE POLICY "Users can view their own Pinterest accounts" 
  ON public.pinterest_accounts 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own accounts
CREATE POLICY "Users can insert their own Pinterest accounts" 
  ON public.pinterest_accounts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own accounts
CREATE POLICY "Users can update their own Pinterest accounts" 
  ON public.pinterest_accounts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own accounts
CREATE POLICY "Users can delete their own Pinterest accounts" 
  ON public.pinterest_accounts 
  FOR DELETE 
  USING (auth.uid() = user_id);
