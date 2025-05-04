
// Types for Pinterest API responses and data structures
export interface PinterestAccount {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  apiKey: string;
  appId: string;
  appSecret?: string;
  refreshToken?: string | null;
  tokenExpiresAt?: string | null;
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
