
import { supabase } from '@/integrations/supabase/client';
import { PinterestAccount } from './types';
import { useToast } from '@/hooks/use-toast';

// Define a type that matches the actual database structure
type PinterestAccountDB = {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  api_key: string;
  app_id: string;
  app_secret: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
};

// Fetch Pinterest accounts from Supabase
export const fetchPinterestAccounts = async (): Promise<PinterestAccount[]> => {
  try {
    const { data: accounts, error } = await supabase
      .from('pinterest_accounts')
      .select('*');

    if (error) {
      console.error('Error fetching Pinterest accounts:', error);
      throw error;
    }

    if (!accounts || accounts.length === 0) {
      return [];
    }

    // Transform database records into PinterestAccount format
    return (accounts as PinterestAccountDB[]).map(account => ({
      id: account.id,
      name: account.name,
      username: account.username,
      avatarUrl: account.avatar_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
      apiKey: account.api_key,
      appId: account.app_id,
      refreshToken: account.refresh_token || null,
      tokenExpiresAt: account.token_expires_at || null,
      appSecret: account.app_secret || null,
      createdAt: new Date(account.created_at),
      // Initialize metrics with empty data until we can fetch real analytics
      impressions: { value: 0, data: [] },
      engagements: { value: 0, data: [] },
      clicks: { value: 0, data: [] },
      saves: { value: 0, data: [] },
      engaged: { value: 0, data: [] }
    }));
  } catch (error) {
    console.error('Error in fetchPinterestAccounts:', error);
    return [];
  }
};

// Create a new Pinterest account
export const createPinterestAccount = async (accountData: {
  name: string;
  username: string;
  apiKey: string;
  appId: string;
  appSecret: string;
  refreshToken?: string;
  avatarUrl?: string;
}): Promise<PinterestAccount | null> => {
  try {
    // Calculate token expiration time (default to 30 days if not provided)
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 30); // Default 30 days expiration

    const { data, error } = await supabase
      .from('pinterest_accounts')
      .insert({
        name: accountData.name,
        username: accountData.username,
        avatar_url: accountData.avatarUrl || null,
        api_key: accountData.apiKey,
        app_id: accountData.appId,
        app_secret: accountData.appSecret,
        refresh_token: accountData.refreshToken || null,
        token_expires_at: tokenExpiresAt.toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating Pinterest account:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    const accountDB = data as PinterestAccountDB;

    return {
      id: accountDB.id,
      name: accountDB.name,
      username: accountDB.username,
      avatarUrl: accountDB.avatar_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
      apiKey: accountDB.api_key,
      appId: accountDB.app_id,
      refreshToken: accountDB.refresh_token || null,
      tokenExpiresAt: accountDB.token_expires_at || null,
      appSecret: accountDB.app_secret || null,
      createdAt: new Date(accountDB.created_at),
      impressions: { value: 0, data: [] },
      engagements: { value: 0, data: [] },
      clicks: { value: 0, data: [] },
      saves: { value: 0, data: [] },
      engaged: { value: 0, data: [] }
    };
  } catch (error) {
    console.error('Error in createPinterestAccount:', error);
    return null;
  }
};
