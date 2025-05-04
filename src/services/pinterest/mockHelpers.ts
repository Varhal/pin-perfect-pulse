import { PinterestAnalytics, PinterestAudienceInsights, PinterestMetricData } from './types';

// Mock data generation functions
export function generateChartDataByDays(days: number, minValue: number, maxValue: number): PinterestMetricData[] {
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

// Adding the missing transformApiData function
export function transformApiData(apiData: any): any {
  // Default implementation that just passes through the data
  // This was referenced but not implemented in the original code
  return apiData;
}

export function generateMockMetrics() {
  const generateChartData = (length: number, minValue: number, maxValue: number) => {
    return Array.from({ length }, () => ({
      value: Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
    }));
  };

  return {
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

export function generateMockAnalytics(): PinterestAnalytics {
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

export function generateMockCategories(): { name: string; percentage: number }[] {
  return [
    { name: 'Home Decor', percentage: 35 },
    { name: 'DIY & Crafts', percentage: 25 },
    { name: 'Food & Drink', percentage: 20 },
    { name: 'Fashion', percentage: 15 },
    { name: 'Others', percentage: 5 },
  ];
}

export function generateMockAgeData(): { group: string; percentage: number }[] {
  return [
    { group: '18-24', percentage: 15 },
    { group: '25-34', percentage: 40 },
    { group: '35-44', percentage: 25 },
    { group: '45-54', percentage: 12 },
    { group: '55+', percentage: 8 },
  ];
}

export function generateMockGenderData(): { group: string; percentage: number }[] {
  return [
    { group: 'Female', percentage: 78 },
    { group: 'Male', percentage: 21 },
    { group: 'Other', percentage: 1 },
  ];
}

export function generateMockLocationData(): { country: string; percentage: number }[] {
  return [
    { country: 'United States', percentage: 45 },
    { country: 'United Kingdom', percentage: 12 },
    { country: 'Canada', percentage: 10 },
    { country: 'Australia', percentage: 8 },
    { country: 'Germany', percentage: 5 },
    { country: 'Others', percentage: 20 },
  ];
}

export function generateMockDeviceData(): { type: string; percentage: number }[] {
  return [
    { type: 'Mobile', percentage: 65 },
    { type: 'Desktop', percentage: 30 },
    { type: 'Tablet', percentage: 5 },
  ];
}

export function generateMockAudienceInsights(): PinterestAudienceInsights {
  return {
    categories: generateMockCategories(),
    age: generateMockAgeData(),
    gender: generateMockGenderData(),
    locations: generateMockLocationData(),
    devices: generateMockDeviceData()
  };
}
