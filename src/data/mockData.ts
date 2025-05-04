import { PinterestAccount } from '../services/pinterest';

// Mock data for Pinterest accounts
export const mockPinterestAccounts: PinterestAccount[] = [
  {
    id: '1',
    name: 'Home Decor Ideas',
    username: 'homedecor_ideas',
    avatarUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    apiKey: 'pint_1234567890',
    appId: '12345678',
    impressions: {
      value: 850000,
      data: Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 40000) + 70000 }))
    },
    engagements: {
      value: 45000,
      data: Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 2500) + 2500 }))
    },
    clicks: {
      value: 22000,
      data: Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 1400) + 1800 }))
    },
    saves: {
      value: 12000,
      data: Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 1200) + 800 }))
    },
    engaged: {
      value: 35000,
      data: Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 2500) + 3000 }))
    },
    createdAt: new Date('2023-01-15')
  },
  {
    id: '2',
    name: 'Fashion Trends',
    username: 'fashion_trends',
    avatarUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
    apiKey: 'pint_0987654321',
    appId: '87654321',
    impressions: {
      value: 1200000,
      data: Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 40000) + 70000 }))
    },
    engagements: {
      value: 65000,
      data: Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 2500) + 2500 }))
    },
    clicks: {
      value: 30000,
      data: Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 1400) + 1800 }))
    },
    saves: {
      value: 18000,
      data: Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 1200) + 800 }))
    },
    engaged: {
      value: 48000,
      data: Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 2500) + 3000 }))
    },
    createdAt: new Date('2023-03-22')
  },
  {
    id: '3',
    name: 'Recipe Collection',
    username: 'recipe_collection',
    avatarUrl: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f',
    apiKey: 'pint_2468101214',
    appId: '24681012',
    impressions: {
      value: 750000,
      data: Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 40000) + 70000 }))
    },
    engagements: {
      value: 38000,
      data: Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 2500) + 2500 }))
    },
    clicks: {
      value: 19000,
      data: Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 1400) + 1800 }))
    },
    saves: {
      value: 9500,
      data: Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 1200) + 800 }))
    },
    engaged: {
      value: 28000,
      data: Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 2500) + 3000 }))
    },
    createdAt: new Date('2023-05-10')
  }
];

// Mock data for analytics
export const mockAnalyticsData = {
  impressions: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: Math.floor(Math.random() * 20000) + 30000
  })),
  engagements: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: Math.floor(Math.random() * 3000) + 5000
  })),
  pinClicks: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: Math.floor(Math.random() * 3000) + 4000
  })),
  outboundClicks: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: Math.floor(Math.random() * 2000) + 2000
  })),
  saves: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: Math.floor(Math.random() * 2000) + 1500
  })),
  totalAudience: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: Math.floor(Math.random() * 20000) + 100000
  })),
  engagedAudience: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: Math.floor(Math.random() * 15000) + 50000
  }))
};

// Mock data for audience insights
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
