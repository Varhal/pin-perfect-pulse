
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

// Temporary implementation until fully integrated with Pinterest API
// This will allow the app to work with real database records but mock analytics
// Later we can replace these functions with real API calls
export const fetchPinterestAccounts = async (): Promise<PinterestAccount[]> => {
  // Use type assertion to work around TypeScript limitations with dynamic table names
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
  return accounts.map(account => {
    // Generate random data for now (will be replaced with API calls)
    const generateChartData = (length: number, minValue: number, maxValue: number) => {
      return Array.from({ length }, () => ({
        value: Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
      }));
    };

    return {
      id: account.id,
      name: account.name,
      username: account.username,
      avatarUrl: account.avatar_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
      apiKey: account.api_key,
      appId: account.app_id,
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
      },
      createdAt: new Date(account.created_at)
    };
  });
};

export const fetchAccountAnalytics = async (accountId: string): Promise<PinterestAnalytics> => {
  // Check if account exists
  // Use type assertion to work around TypeScript limitations with dynamic table names
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

  // Generate mock data for now
  // Will be replaced with actual API calls to Pinterest
  const generateChartDataByDays = (days: number, minValue: number, maxValue: number) => {
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
  };

  // Mock data for initial implementation
  return {
    impressions: generateChartDataByDays(30, 30000, 50000),
    engagements: generateChartDataByDays(30, 5000, 8000),
    pinClicks: generateChartDataByDays(30, 4000, 7000),
    outboundClicks: generateChartDataByDays(30, 2000, 4000),
    saves: generateChartDataByDays(30, 1500, 3500),
    totalAudience: generateChartDataByDays(30, 100000, 120000),
    engagedAudience: generateChartDataByDays(30, 50000, 65000)
  };
};

export const fetchAudienceInsights = async (accountId: string): Promise<PinterestAudienceInsights> => {
  // Check if account exists
  // Use type assertion to work around TypeScript limitations with dynamic table names
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

  // Mock data for initial implementation
  return {
    categories: [
      { name: 'Home Decor', percentage: 35 },
      { name: 'DIY & Crafts', percentage: 25 },
      { name: 'Food & Drink', percentage: 20 },
      { name: 'Fashion', percentage: 15 },
      { name: 'Others', percentage: 5 },
    ],
    age: [
      { group: '18-24', percentage: 15 },
      { group: '25-34', percentage: 40 },
      { group: '35-44', percentage: 25 },
      { group: '45-54', percentage: 12 },
      { group: '55+', percentage: 8 },
    ],
    gender: [
      { group: 'Female', percentage: 78 },
      { group: 'Male', percentage: 21 },
      { group: 'Other', percentage: 1 },
    ],
    locations: [
      { country: 'United States', percentage: 45 },
      { country: 'United Kingdom', percentage: 12 },
      { country: 'Canada', percentage: 10 },
      { country: 'Australia', percentage: 8 },
      { country: 'Germany', percentage: 5 },
      { country: 'Others', percentage: 20 },
    ],
    devices: [
      { type: 'Mobile', percentage: 65 },
      { type: 'Desktop', percentage: 30 },
      { type: 'Tablet', percentage: 5 },
    ]
  };
};
