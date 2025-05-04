
import { supabase } from '@/integrations/supabase/client';
import { PinterestAccount } from './types';

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
