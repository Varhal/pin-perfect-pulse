
// Types for Pinterest API responses and data structures
export interface PinterestAccount {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  apiKey: string;
  appId: string;
  appSecret?: string | null;
  refreshToken?: string | null;
  tokenExpiresAt?: string | null;
  adAccountId?: string | null;
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

// Database schema types
export interface PinterestAnalyticsRecord {
  id: string;
  account_id: string;
  date: string;
  impressions: number;
  engagements: number;
  pin_clicks: number;
  outbound_clicks: number;
  saves: number;
  total_audience: number;
  engaged_audience: number;
  engagement_rate: number;
  pin_click_rate: number;
  outbound_click_rate: number;
  save_rate: number;
  created_at: string;
  updated_at: string;
}

export interface PinterestAudienceRecord {
  id: string;
  account_id: string;
  date: string;
  categories: string; // JSONB stored as string
  age_groups: string; // JSONB stored as string
  genders: string; // JSONB stored as string
  locations: string; // JSONB stored as string
  devices: string; // JSONB stored as string
  created_at: string;
  updated_at: string;
}
