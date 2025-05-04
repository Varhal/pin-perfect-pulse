
import { AccountData } from '../components/accounts/AccountCard';

// Function to generate a random array of values for charts
const generateChartData = (length: number, minValue: number, maxValue: number) => {
  return Array.from({ length }, () => ({
    value: Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
  }));
};

export const mockAccounts: AccountData[] = [
  {
    id: '1',
    name: 'Beauty & Fashion',
    username: 'beautyfashion',
    avatarUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    impressions: {
      value: 1250000,
      data: generateChartData(10, 100000, 150000)
    },
    engagements: {
      value: 45000,
      data: generateChartData(10, 3000, 6000)
    },
    clicks: {
      value: 32000,
      data: generateChartData(10, 2500, 4500)
    },
    saves: {
      value: 18000,
      data: generateChartData(10, 1000, 2500)
    },
    engaged: {
      value: 52000,
      data: generateChartData(10, 4000, 7000)
    },
    createdAt: new Date('2023-06-15')
  },
  {
    id: '2',
    name: 'Home Decor Ideas',
    username: 'homedecor',
    avatarUrl: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901',
    impressions: {
      value: 890000,
      data: generateChartData(10, 70000, 110000)
    },
    engagements: {
      value: 38500,
      data: generateChartData(10, 2500, 5000)
    },
    clicks: {
      value: 22400,
      data: generateChartData(10, 1800, 3200)
    },
    saves: {
      value: 16700,
      data: generateChartData(10, 800, 2000)
    },
    engaged: {
      value: 41200,
      data: generateChartData(10, 3000, 5500)
    },
    createdAt: new Date('2023-09-22')
  },
  {
    id: '3',
    name: 'Tasty Recipes',
    username: 'tastyrecipes',
    avatarUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
    impressions: {
      value: 1450000,
      data: generateChartData(10, 120000, 170000)
    },
    engagements: {
      value: 65000,
      data: generateChartData(10, 5000, 9000)
    },
    clicks: {
      value: 42000,
      data: generateChartData(10, 3500, 6000)
    },
    saves: {
      value: 28500,
      data: generateChartData(10, 1800, 3800)
    },
    engaged: {
      value: 73000,
      data: generateChartData(10, 6000, 10000)
    },
    createdAt: new Date('2023-04-10')
  },
  {
    id: '4',
    name: 'Fitness Tips',
    username: 'fitnesstips',
    avatarUrl: 'https://images.unsplash.com/photo-1500673922987-e212871fec22',
    impressions: {
      value: 760000,
      data: generateChartData(10, 60000, 95000)
    },
    engagements: {
      value: 32000,
      data: generateChartData(10, 2200, 4200)
    },
    clicks: {
      value: 18600,
      data: generateChartData(10, 1300, 2700)
    },
    saves: {
      value: 12400,
      data: generateChartData(10, 700, 1900)
    },
    engaged: {
      value: 35000,
      data: generateChartData(10, 2500, 4500)
    },
    createdAt: new Date('2023-11-05')
  },
  {
    id: '5',
    name: 'Travel Destinations',
    username: 'traveldest',
    avatarUrl: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7',
    impressions: {
      value: 1680000,
      data: generateChartData(10, 130000, 190000)
    },
    engagements: {
      value: 78000,
      data: generateChartData(10, 5500, 9500)
    },
    clicks: {
      value: 52000,
      data: generateChartData(10, 4000, 7000)
    },
    saves: {
      value: 35000,
      data: generateChartData(10, 2500, 5000)
    },
    engaged: {
      value: 81000,
      data: generateChartData(10, 6500, 11000)
    },
    createdAt: new Date('2023-07-30')
  }
];

export const generateChartDataByDays = (days: number, minValue: number, maxValue: number) => {
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

export const mockMetricData = {
  impressions: generateChartDataByDays(30, 30000, 50000),
  engagements: generateChartDataByDays(30, 5000, 8000),
  pinClicks: generateChartDataByDays(30, 4000, 7000),
  outboundClicks: generateChartDataByDays(30, 2000, 4000),
  saves: generateChartDataByDays(30, 1500, 3500),
  totalAudience: generateChartDataByDays(30, 100000, 120000),
  engagedAudience: generateChartDataByDays(30, 50000, 65000)
};

export const mockAudienceInsights = {
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
