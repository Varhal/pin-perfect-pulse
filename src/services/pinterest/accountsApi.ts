
import { supabase } from '@/integrations/supabase/client';
import { PinterestAccount } from './types';
import { transformApiData, generateMockMetrics } from './mockHelpers';

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

    // Transform database records into PinterestAccount format with API data
    const transformedAccounts = await Promise.all(accounts.map(async (account) => {
      // Fetch initial metrics summary for the account
      let metrics = {
        impressions: { value: 0, data: [] },
        engagements: { value: 0, data: [] },
        clicks: { value: 0, data: [] },
        saves: { value: 0, data: [] },
        engaged: { value: 0, data: [] }
      };

      try {
        // Try to fetch real analytics data
        const { data: analyticsData } = await supabase.functions.invoke('pinterest-analytics', {
          body: {
            accountId: account.id,
            endpoint: 'analytics'
          }
        });

        if (analyticsData) {
          // Transform the API response into our format
          // This is a simplification - adapt based on actual API response
          metrics = {
            impressions: {
              value: analyticsData.summary?.impressions || 0,
              data: analyticsData.daily?.impressions || []
            },
            engagements: {
              value: analyticsData.summary?.engagements || 0,
              data: analyticsData.daily?.engagements || []
            },
            clicks: {
              value: analyticsData.summary?.pin_clicks || 0,
              data: analyticsData.daily?.pin_clicks || []
            },
            saves: {
              value: analyticsData.summary?.saves || 0,
              data: analyticsData.daily?.saves || []
            },
            engaged: {
              value: analyticsData.summary?.engaged_audience || 0,
              data: analyticsData.daily?.engaged_audience || []
            }
          };
        }
      } catch (apiError) {
        console.error('Error fetching Pinterest API data:', apiError);
        // Fall back to mock data if API call fails
        metrics = generateMockMetrics();
      }

      return {
        id: account.id,
        name: account.name,
        username: account.username,
        avatarUrl: account.avatar_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
        apiKey: account.api_key,
        appId: account.app_id,
        impressions: metrics.impressions,
        engagements: metrics.engagements,
        clicks: metrics.clicks,
        saves: metrics.saves,
        engaged: metrics.engaged,
        createdAt: new Date(account.created_at)
      };
    }));

    return transformedAccounts;
  } catch (error) {
    console.error('Error in fetchPinterestAccounts:', error);
    return [];
  }
};
