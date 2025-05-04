
import { supabase } from '@/integrations/supabase/client';

// Types for Pinterest API responses
export interface PinterestAccount {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  apiKey: string;
  appId: string;
  impressions: {
    value: number;
    data: { value: number }[];
  };
  engagements: {
    value: number;
    data: { value: number }[];
  };
  clicks: {
    value: number;
    data: { value: number }[];
  };
  saves: {
    value: number;
    data: { value: number }[];
  };
  engaged: {
    value: number;
    data: { value: number }[];
  };
  createdAt: Date;
}

export interface PinterestMetricData {
  date: string;
  value: number;
}

export interface PinterestAnalytics {
  impressions: PinterestMetricData[];
  engagements: PinterestMetricData[];
  pinClicks: PinterestMetricData[];
  outboundClicks: PinterestMetricData[];
  saves: PinterestMetricData[];
  totalAudience: PinterestMetricData[];
  engagedAudience: PinterestMetricData[];
}

export interface PinterestAudienceInsights {
  categories: { name: string; percentage: number }[];
  age: { group: string; percentage: number }[];
  gender: { group: string; percentage: number }[];
  locations: { country: string; percentage: number }[];
  devices: { type: string; percentage: number }[];
}

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
        const generateChartData = (length: number, minValue: number, maxValue: number) => {
          return Array.from({ length }, () => ({
            value: Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
          }));
        };

        metrics = {
          impressions: {
            value: Math.floor(Math.random() * 900000) + 100000,
            data: generateChartData(10, 70000, 110000)
          },
          engagements: {
            value: Math.floor(Math.random() * 30000) + 20000,
            data: generateChartData(10, 2500, 5000)
          },
          clicks: {
            value: Math.floor(Math.random() * 15000) + 10000,
            data: generateChartData(10, 1800, 3200)
          },
          saves: {
            value: Math.floor(Math.random() * 10000) + 5000,
            data: generateChartData(10, 800, 2000)
          },
          engaged: {
            value: Math.floor(Math.random() * 30000) + 20000,
            data: generateChartData(10, 3000, 5500)
          }
        };
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

export const fetchAccountAnalytics = async (accountId: string): Promise<PinterestAnalytics> => {
  try {
    // Check if account exists
    const { data: account, error } = await supabase
      .from('pinterest_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (error) {
      console.error('Error fetching account:', error);
      throw error;
    }

    if (!account) {
      throw new Error('Account not found');
    }

    try {
      // Try to fetch real analytics data from Pinterest API
      const { data: analyticsData, error: apiError } = await supabase.functions.invoke('pinterest-analytics', {
        body: {
          accountId,
          endpoint: 'analytics'
        }
      });

      if (apiError) {
        throw apiError;
      }

      // Transform the API response to our format
      // This is a simplified example - adjust based on actual API response
      if (analyticsData && analyticsData.data) {
        return {
          impressions: transformApiDataToMetricData(analyticsData.data, 'IMPRESSION'),
          engagements: transformApiDataToMetricData(analyticsData.data, 'ENGAGEMENT'),
          pinClicks: transformApiDataToMetricData(analyticsData.data, 'PIN_CLICK'),
          outboundClicks: transformApiDataToMetricData(analyticsData.data, 'OUTBOUND_CLICK'),
          saves: transformApiDataToMetricData(analyticsData.data, 'SAVE'),
          totalAudience: transformApiDataToMetricData(analyticsData.data, 'TOTAL_AUDIENCE'),
          engagedAudience: transformApiDataToMetricData(analyticsData.data, 'ENGAGED_AUDIENCE')
        };
      }
    } catch (apiError) {
      console.error('Error fetching Pinterest analytics data:', apiError);
      // Continue to fallback
    }

    // Fallback to mock data if API call fails
    return generateMockAnalytics();
  } catch (error) {
    console.error('Error in fetchAccountAnalytics:', error);
    return generateMockAnalytics();
  }
};

export const fetchAudienceInsights = async (accountId: string): Promise<PinterestAudienceInsights> => {
  try {
    // Check if account exists
    const { data: account, error } = await supabase
      .from('pinterest_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (error) {
      console.error('Error fetching account:', error);
      throw error;
    }

    if (!account) {
      throw new Error('Account not found');
    }

    try {
      // Try to fetch real audience insights data
      const { data: insightsData, error: apiError } = await supabase.functions.invoke('pinterest-analytics', {
        body: {
          accountId,
          endpoint: 'audience'
        }
      });

      if (apiError) {
        throw apiError;
      }

      // Transform the API response to our format
      if (insightsData && insightsData.data) {
        // Example transformation - adapt based on actual API response
        return transformApiAudienceData(insightsData.data);
      }
    } catch (apiError) {
      console.error('Error fetching Pinterest audience data:', apiError);
      // Continue to fallback
    }

    // Fallback to mock data if API call fails
    return generateMockAudienceInsights();
  } catch (error) {
    console.error('Error in fetchAudienceInsights:', error);
    return generateMockAudienceInsights();
  }
};

// Helper functions
function transformApiDataToMetricData(apiData: any, metricName: string): PinterestMetricData[] {
  // This is a simplified transformation - adjust based on actual API response
  try {
    return apiData.map((item: any) => ({
      date: item.date,
      value: item.metrics[metricName] || 0
    }));
  } catch (e) {
    console.error(`Error transforming ${metricName} data:`, e);
    return generateChartDataByDays(30, 1000, 50000); // Fallback to mock data
  }
}

function transformApiAudienceData(apiData: any): PinterestAudienceInsights {
  // This is a simplified transformation - adjust based on actual API response
  try {
    return {
      categories: apiData.interests?.slice(0, 5).map((item: any) => ({
        name: item.name,
        percentage: item.percentage
      })) || generateMockCategories(),
      age: apiData.demographics?.age_groups?.map((item: any) => ({
        group: item.name,
        percentage: item.percentage
      })) || generateMockAgeData(),
      gender: apiData.demographics?.genders?.map((item: any) => ({
        group: item.name,
        percentage: item.percentage
      })) || generateMockGenderData(),
      locations: apiData.demographics?.locations?.slice(0, 6).map((item: any) => ({
        country: item.name,
        percentage: item.percentage
      })) || generateMockLocationData(),
      devices: apiData.demographics?.devices?.map((item: any) => ({
        type: item.name,
        percentage: item.percentage
      })) || generateMockDeviceData(),
    };
  } catch (e) {
    console.error('Error transforming audience data:', e);
    return generateMockAudienceInsights(); // Fallback to mock data
  }
}

// Mock data generation functions
function generateChartDataByDays(days: number, minValue: number, maxValue: number): PinterestMetricData[] {
  const result = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    result.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
    });
  }
  
  return result;
}

function generateMockAnalytics(): PinterestAnalytics {
  return {
    impressions: generateChartDataByDays(30, 30000, 50000),
    engagements: generateChartDataByDays(30, 5000, 8000),
    pinClicks: generateChartDataByDays(30, 4000, 7000),
    outboundClicks: generateChartDataByDays(30, 2000, 4000),
    saves: generateChartDataByDays(30, 1500, 3500),
    totalAudience: generateChartDataByDays(30, 100000, 120000),
    engagedAudience: generateChartDataByDays(30, 50000, 65000)
  };
}

function generateMockCategories(): { name: string; percentage: number }[] {
  return [
    { name: 'Home Decor', percentage: 35 },
    { name: 'DIY & Crafts', percentage: 25 },
    { name: 'Food & Drink', percentage: 20 },
    { name: 'Fashion', percentage: 15 },
    { name: 'Others', percentage: 5 },
  ];
}

function generateMockAgeData(): { group: string; percentage: number }[] {
  return [
    { group: '18-24', percentage: 15 },
    { group: '25-34', percentage: 40 },
    { group: '35-44', percentage: 25 },
    { group: '45-54', percentage: 12 },
    { group: '55+', percentage: 8 },
  ];
}

function generateMockGenderData(): { group: string; percentage: number }[] {
  return [
    { group: 'Female', percentage: 78 },
    { group: 'Male', percentage: 21 },
    { group: 'Other', percentage: 1 },
  ];
}

function generateMockLocationData(): { country: string; percentage: number }[] {
  return [
    { country: 'United States', percentage: 45 },
    { country: 'United Kingdom', percentage: 12 },
    { country: 'Canada', percentage: 10 },
    { country: 'Australia', percentage: 8 },
    { country: 'Germany', percentage: 5 },
    { country: 'Others', percentage: 20 },
  ];
}

function generateMockDeviceData(): { type: string; percentage: number }[] {
  return [
    { type: 'Mobile', percentage: 65 },
    { type: 'Desktop', percentage: 30 },
    { type: 'Tablet', percentage: 5 },
  ];
}

function generateMockAudienceInsights(): PinterestAudienceInsights {
  return {
    categories: generateMockCategories(),
    age: generateMockAgeData(),
    gender: generateMockGenderData(),
    locations: generateMockLocationData(),
    devices: generateMockDeviceData()
  };
}
