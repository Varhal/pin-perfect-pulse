
import { supabase } from '@/integrations/supabase/client';
import { PinterestAnalytics, PinterestAudienceInsights, PinterestMetricData } from './types';
import { 
  generateMockAnalytics, 
  generateMockAudienceInsights, 
  generateChartDataByDays 
} from './mockHelpers';
import { useToast } from '@/hooks/use-toast';

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
        console.error('Error from Pinterest analytics function:', apiError);
        throw apiError;
      }

      // Check if there was an API error that returned fallback flag
      if (analyticsData && analyticsData.fallback) {
        console.warn('Using mock data due to API error:', analyticsData.message);
        return generateMockAnalytics();
      }

      // Transform the API response to our format
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
        console.error('Error from Pinterest audience insights function:', apiError);
        throw apiError;
      }

      // Check if there was an API error that returned fallback flag
      if (insightsData && insightsData.fallback) {
        console.warn('Using mock audience data due to API error:', insightsData.message);
        return generateMockAudienceInsights();
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

// Helper function
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
      })) || [],
      age: apiData.demographics?.age_groups?.map((item: any) => ({
        group: item.name,
        percentage: item.percentage
      })) || [],
      gender: apiData.demographics?.genders?.map((item: any) => ({
        group: item.name,
        percentage: item.percentage
      })) || [],
      locations: apiData.demographics?.locations?.slice(0, 6).map((item: any) => ({
        country: item.name,
        percentage: item.percentage
      })) || [],
      devices: apiData.demographics?.devices?.map((item: any) => ({
        type: item.name,
        percentage: item.percentage
      })) || [],
    };
  } catch (e) {
    console.error('Error transforming audience data:', e);
    return generateMockAudienceInsights(); // Fallback to mock data
  }
}
