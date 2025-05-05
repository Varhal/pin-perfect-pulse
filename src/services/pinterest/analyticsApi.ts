
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
      // First try to get data from our database
      const { data: dbAnalytics, error: dbError } = await supabase.functions.invoke('pinterest-analytics', {
        body: {
          accountId,
          endpoint: 'fetch_db_analytics'
        }
      });

      if (dbError) {
        console.error('Error fetching analytics from database:', dbError);
      } else if (dbAnalytics && Array.isArray(dbAnalytics) && dbAnalytics.length > 0) {
        console.log('Got analytics data from database:', dbAnalytics.length, 'records');
        return transformDbDataToAnalytics(dbAnalytics);
      }

      // If no data in database, try to fetch and store from Pinterest API
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
      // First try to get data from our database
      const { data: dbAudience, error: dbError } = await supabase.functions.invoke('pinterest-analytics', {
        body: {
          accountId,
          endpoint: 'fetch_db_audience'
        }
      });

      if (dbError) {
        console.error('Error fetching audience from database:', dbError);
      } else if (dbAudience) {
        console.log('Got audience data from database');
        return transformDbDataToAudienceInsights(dbAudience);
      }

      // If no data in database, try to fetch and store from Pinterest API
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

// Transform database analytics records to our frontend analytics structure
function transformDbDataToAnalytics(dbRecords: any[]): PinterestAnalytics {
  // Group records by metric type and convert to PinterestMetricData format
  const impressions: PinterestMetricData[] = [];
  const engagements: PinterestMetricData[] = [];
  const pinClicks: PinterestMetricData[] = [];
  const outboundClicks: PinterestMetricData[] = [];
  const saves: PinterestMetricData[] = [];
  const totalAudience: PinterestMetricData[] = [];
  const engagedAudience: PinterestMetricData[] = [];
  
  dbRecords.forEach(record => {
    const date = record.date;
    
    impressions.push({ date, value: record.impressions });
    engagements.push({ date, value: record.engagements });
    pinClicks.push({ date, value: record.pin_clicks });
    outboundClicks.push({ date, value: record.outbound_clicks });
    saves.push({ date, value: record.saves });
    totalAudience.push({ date, value: record.total_audience });
    engagedAudience.push({ date, value: record.engaged_audience });
  });
  
  // Sort data by date
  const sortByDate = (a: PinterestMetricData, b: PinterestMetricData) => 
    new Date(a.date).getTime() - new Date(b.date).getTime();
    
  return {
    impressions: impressions.sort(sortByDate),
    engagements: engagements.sort(sortByDate),
    pinClicks: pinClicks.sort(sortByDate),
    outboundClicks: outboundClicks.sort(sortByDate),
    saves: saves.sort(sortByDate),
    totalAudience: totalAudience.sort(sortByDate),
    engagedAudience: engagedAudience.sort(sortByDate)
  };
}

// Transform database audience record to our frontend audience structure
function transformDbDataToAudienceInsights(dbRecord: any): PinterestAudienceInsights {
  if (!dbRecord) {
    return generateMockAudienceInsights();
  }
  
  try {
    return {
      categories: JSON.parse(dbRecord.categories || '[]'),
      age: JSON.parse(dbRecord.age_groups || '[]'),
      gender: JSON.parse(dbRecord.genders || '[]'),
      locations: JSON.parse(dbRecord.locations || '[]'),
      devices: JSON.parse(dbRecord.devices || '[]'),
    };
  } catch (e) {
    console.error('Error parsing audience data from database:', e);
    return generateMockAudienceInsights();
  }
}

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
