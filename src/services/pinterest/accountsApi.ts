
import { supabase } from '@/integrations/supabase/client';
import { PinterestAccount } from './types';
import { useToast } from '@/hooks/use-toast';

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
    return accounts.map(account => ({
      id: account.id,
      name: account.name,
      username: account.username,
      avatarUrl: account.avatar_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
      apiKey: account.api_key,
      appId: account.app_id,
      refreshToken: account.refresh_token,
      tokenExpiresAt: account.token_expires_at,
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
      .insert([{
        name: accountData.name,
        username: accountData.username,
        avatar_url: accountData.avatarUrl || null,
        api_key: accountData.apiKey,
        app_id: accountData.appId,
        app_secret: accountData.appSecret,
        refresh_token: accountData.refreshToken || null,
        token_expires_at: tokenExpiresAt.toISOString(),
      }])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating Pinterest account:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      username: data.username,
      avatarUrl: data.avatar_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
      apiKey: data.api_key,
      appId: data.app_id,
      refreshToken: data.refresh_token,
      tokenExpiresAt: data.token_expires_at,
      createdAt: new Date(data.created_at),
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
